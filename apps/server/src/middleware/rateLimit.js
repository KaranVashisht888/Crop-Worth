import rateLimit from "express-rate-limit";

// Login/register are the classic brute-force/credential-stuffing targets;
// everything else requires a valid token or refresh cookie already, which
// makes blind request-flooding far less useful to an attacker.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Try again later." },
});
