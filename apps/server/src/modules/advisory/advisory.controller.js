import { asyncHandler } from "../../utils/asyncHandler.js";
import { getAdvisoryTips } from "./advisory.service.js";

export const list = asyncHandler(async (req, res) => {
  const tips = await getAdvisoryTips(req.query);
  res.json(tips);
});
