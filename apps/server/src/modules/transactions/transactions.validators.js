const VALID_STATUSES = ["COMPLETED", "FELL_THROUGH"];

export function validateResolveTransaction(req, res, next) {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ errors: [`Status must be one of: ${VALID_STATUSES.join(", ")}`] });
  }
  next();
}
