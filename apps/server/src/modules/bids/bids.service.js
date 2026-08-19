import { prisma } from "../../config/prisma.js";
import { emitToListing } from "../../sockets/emitter.js";
import { isValidNextBid, isBelowReserve } from "./bidRules.js";

const BUYER_SELECT = { id: true, name: true, reliabilityScore: true };

export async function placeBid(listingId, buyerId, amount) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw httpError(404, "Listing not found");
  if (listing.status !== "ACTIVE" || listing.auctionEnd <= new Date()) {
    throw httpError(409, "This auction is not open for bidding");
  }

  const highest = await prisma.bid.findFirst({
    where: { listingId },
    orderBy: { amount: "desc" },
  });

  if (!isValidNextBid(amount, highest?.amount)) {
    throw httpError(409, `Bid must exceed the current highest bid of ${highest.amount}`);
  }

  // Bids are strictly increasing, so every new bid is by definition the new
  // highest - every other still-open bid on this listing becomes outbid.
  const [, bid] = await prisma.$transaction([
    prisma.bid.updateMany({
      where: { listingId, status: "PENDING" },
      data: { status: "OUTBID" },
    }),
    prisma.bid.create({
      data: { listingId, buyerId, amount, status: "PENDING" },
      include: { buyer: { select: BUYER_SELECT } },
    }),
  ]);

  const payload = serializeBid(bid, listing.reservePrice);
  emitToListing(listingId, "bid:new", payload);

  return payload;
}

export async function listBidsForListing(listingId) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw httpError(404, "Listing not found");

  const bids = await prisma.bid.findMany({
    where: { listingId },
    orderBy: { amount: "desc" },
    include: { buyer: { select: BUYER_SELECT } },
  });

  return bids.map((b) => serializeBid(b, listing.reservePrice));
}

export async function listMyBids(buyerId) {
  const bids = await prisma.bid.findMany({
    where: { buyerId },
    orderBy: { createdAt: "desc" },
    include: { listing: true },
  });

  return bids.map((b) => serializeBid(b, b.listing.reservePrice));
}

export async function acceptBid(bidId, farmerId) {
  const bid = await prisma.bid.findUnique({ where: { id: bidId }, include: { listing: true } });
  if (!bid) throw httpError(404, "Bid not found");
  if (bid.listing.farmerId !== farmerId) throw httpError(403, "You do not own this listing");
  // ACTIVE: still within the auction window. CLOSED: window ended but this
  // bid cleared reserve, so it's still awaiting the farmer's decision.
  if (!["ACTIVE", "CLOSED"].includes(bid.listing.status)) {
    throw httpError(409, "This listing is no longer open for a decision");
  }

  const [, , , transaction] = await prisma.$transaction([
    prisma.bid.update({ where: { id: bid.id }, data: { status: "ACCEPTED" } }),
    prisma.bid.updateMany({
      where: { listingId: bid.listingId, id: { not: bid.id } },
      data: { status: "REJECTED" },
    }),
    prisma.listing.update({ where: { id: bid.listingId }, data: { status: "ACCEPTED" } }),
    prisma.transaction.create({
      data: {
        listingId: bid.listingId,
        bidId: bid.id,
        farmerId,
        buyerId: bid.buyerId,
        finalAmount: bid.amount,
      },
    }),
  ]);

  emitToListing(bid.listingId, "bid:accepted", { bidId: bid.id, transactionId: transaction.id });
  emitToListing(bid.listingId, "listing:closed", { listingId: bid.listingId, reason: "accepted" });

  return transaction;
}

function serializeBid(bid, reservePrice) {
  return { ...bid, belowReserve: isBelowReserve(bid.amount, reservePrice) };
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
