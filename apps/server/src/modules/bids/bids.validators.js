export function validatePlaceBid(req, res, next) {
  const { amount } = req.body;
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ errors: ["Bid amount must be a positive number"] });
  }
  next();
}
