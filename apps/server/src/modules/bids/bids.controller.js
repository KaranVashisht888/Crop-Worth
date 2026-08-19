import { asyncHandler } from "../../utils/asyncHandler.js";
import * as bidsService from "./bids.service.js";

export const place = asyncHandler(async (req, res) => {
  const bid = await bidsService.placeBid(req.params.id, req.user.id, req.body.amount);
  res.status(201).json(bid);
});

export const listForListing = asyncHandler(async (req, res) => {
  const bids = await bidsService.listBidsForListing(req.params.id);
  res.json(bids);
});

export const mine = asyncHandler(async (req, res) => {
  const bids = await bidsService.listMyBids(req.user.id);
  res.json(bids);
});

export const accept = asyncHandler(async (req, res) => {
  const transaction = await bidsService.acceptBid(req.params.id, req.user.id);
  res.json(transaction);
});
