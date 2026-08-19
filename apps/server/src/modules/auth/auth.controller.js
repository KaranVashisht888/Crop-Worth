import { registerUser, loginUser, refreshSession, logoutSession } from "./auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const REFRESH_COOKIE = "refreshToken";
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/api/auth",
};

function sendAuthResponse(res, { accessToken, refreshToken, user }) {
  res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);
  res.json({ accessToken, user });
}

export const register = asyncHandler(async (req, res) => {
  const { email, password, name, role, region, phone } = req.body;
  const result = await registerUser({ email, password, name, role, region, phone });
  sendAuthResponse(res, result);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser({ email, password });
  sendAuthResponse(res, result);
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await refreshSession(req.cookies?.[REFRESH_COOKIE]);
  sendAuthResponse(res, result);
});

export const logout = asyncHandler(async (req, res) => {
  await logoutSession(req.cookies?.[REFRESH_COOKIE]);
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.status(204).send();
});
