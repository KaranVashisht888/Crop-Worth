import { asyncHandler } from "../../utils/asyncHandler.js";
import { getPrices } from "./prices.service.js";

export const list = asyncHandler(async (req, res) => {
  const result = await getPrices(req.query);
  res.json(result);
});
