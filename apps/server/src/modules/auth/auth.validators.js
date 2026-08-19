const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ["FARMER", "BUYER"];

export function validateRegister(req, res, next) {
  const { email, password, name, role } = req.body;
  const errors = [];

  if (!email || !EMAIL_RE.test(email)) errors.push("Valid email is required");
  if (!password || password.length < 8) errors.push("Password must be at least 8 characters");
  if (!name || !name.trim()) errors.push("Name is required");
  if (!ROLES.includes(role)) errors.push(`Role must be one of: ${ROLES.join(", ")}`);

  if (errors.length) return res.status(400).json({ errors });
  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");

  if (errors.length) return res.status(400).json({ errors });
  next();
}
