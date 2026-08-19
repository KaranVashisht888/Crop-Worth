import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { hashToken } from "../../utils/hashToken.js";

const SALT_ROUNDS = 12;

export async function registerUser({ email, password, name, role, region, phone }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw httpError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, role, region, phone },
  });

  return issueTokens(user);
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw httpError(401, "Invalid email or password");
  }

  return issueTokens(user);
}

export async function refreshSession(refreshToken) {
  if (!refreshToken) {
    throw httpError(401, "Missing refresh token");
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw httpError(401, "Invalid refresh token");
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findFirst({
    where: { userId: payload.sub, tokenHash, revoked: false },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw httpError(401, "Refresh token expired or revoked");
  }

  // Rotate: the presented token is single-use, whether or not the refresh
  // below succeeds, so a stolen token can't be replayed after this point.
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw httpError(401, "User no longer exists");
  }

  return issueTokens(user);
}

export async function logoutSession(refreshToken) {
  if (!refreshToken) return;
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revoked: false },
    data: { revoked: true },
  });
}

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const { exp } = jwt.decode(refreshToken);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(exp * 1000),
    },
  });

  return { accessToken, refreshToken, user: sanitizeUser(user) };
}

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
