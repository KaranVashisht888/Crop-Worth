const UNITS = ["kg", "quintal", "ton"];
const MAX_AUCTION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export function validateCreateListing(req, res, next) {
  const { cropType, quantity, unit, expectedPrice, reservePrice, region, harvestDate, auctionEnd } = req.body;
  const errors = [];

  if (!cropType || !cropType.trim()) errors.push("Crop type is required");
  if (!isPositiveNumber(quantity)) errors.push("Quantity must be a positive number");
  if (!UNITS.includes(unit)) errors.push(`Unit must be one of: ${UNITS.join(", ")}`);
  if (!isPositiveNumber(expectedPrice)) errors.push("Expected price must be a positive number");
  if (!isPositiveNumber(reservePrice)) errors.push("Reserve price must be a positive number");
  if (isPositiveNumber(expectedPrice) && isPositiveNumber(reservePrice) && reservePrice > expectedPrice) {
    errors.push("Reserve price cannot exceed expected price");
  }
  if (!region || !region.trim()) errors.push("Region is required");
  if (!isValidDate(harvestDate)) errors.push("Valid harvest date is required");
  errors.push(...validateAuctionEnd(auctionEnd));

  if (errors.length) return res.status(400).json({ errors });
  next();
}

export function validateUpdateListing(req, res, next) {
  const { quantity, unit, expectedPrice, reservePrice, harvestDate, auctionEnd } = req.body;
  const errors = [];

  if (quantity !== undefined && !isPositiveNumber(quantity)) errors.push("Quantity must be a positive number");
  if (unit !== undefined && !UNITS.includes(unit)) errors.push(`Unit must be one of: ${UNITS.join(", ")}`);
  if (expectedPrice !== undefined && !isPositiveNumber(expectedPrice)) errors.push("Expected price must be a positive number");
  if (reservePrice !== undefined && !isPositiveNumber(reservePrice)) errors.push("Reserve price must be a positive number");
  if (expectedPrice !== undefined && reservePrice !== undefined && reservePrice > expectedPrice) {
    errors.push("Reserve price cannot exceed expected price");
  }
  if (harvestDate !== undefined && !isValidDate(harvestDate)) errors.push("Valid harvest date is required");
  if (auctionEnd !== undefined) errors.push(...validateAuctionEnd(auctionEnd));

  if (errors.length) return res.status(400).json({ errors });
  next();
}

function validateAuctionEnd(auctionEnd) {
  if (!isValidDate(auctionEnd)) return ["Valid auction end date is required"];
  const diff = new Date(auctionEnd) - new Date();
  if (diff <= 0) return ["Auction end must be in the future"];
  if (diff > MAX_AUCTION_WINDOW_MS) return ["Auction window cannot exceed 30 days"];
  return [];
}

function isPositiveNumber(v) {
  return typeof v === "number" && Number.isFinite(v) && v > 0;
}

function isValidDate(v) {
  return v !== undefined && v !== null && !isNaN(new Date(v).getTime());
}
