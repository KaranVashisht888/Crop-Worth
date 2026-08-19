import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./transactions.service.js";

export const mine = asyncHandler(async (req, res) => {
  const transactions = await service.listMyTransactions(req.user.id, req.user.role);
  res.json(transactions);
});

export const resolve = asyncHandler(async (req, res) => {
  const transaction = await service.resolveTransaction(req.params.id, req.user.id, req.body.status);
  res.json(transaction);
});
