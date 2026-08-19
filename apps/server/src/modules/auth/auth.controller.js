import { registerUser, loginUser, refreshSession, logoutSession } from "./auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const REFRESH_COOKIE = "refreshToken";
const isProduction = process.env.NODE_ENV === "production";
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  // Frontend and backend live on different origins in production (e.g.
  // vercel.app / onrender.com), so the cookie must be SameSite=None to
  // survive cross-site fetch/XHR - Lax only survives top-level navigation.
  // None requires Secure, which is only meaningful (and available) over
  // HTTPS in production; localhost dev stays Lax/non-secure.
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
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
  res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTS);
  res.status(204).send();
});
