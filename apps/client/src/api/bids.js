import client from "./client.js";

export const placeBid = (listingId, amount) =>
  client.post(`/listings/${listingId}/bids`, { amount }).then((r) => r.data);
export const listBidsForListing = (listingId) =>
  client.get(`/listings/${listingId}/bids`).then((r) => r.data);
export const listMyBids = () => client.get("/bids/mine").then((r) => r.data);
export const acceptBid = (bidId) => client.patch(`/bids/${bidId}/accept`).then((r) => r.data);
