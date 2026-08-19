import cron from "node-cron";
import { prisma } from "../config/prisma.js";
import { emitToListing } from "../sockets/emitter.js";

// Runs every minute; cheap against an ACTIVE-status, auctionEnd-indexed
// table at this scale. CLOSED means the window ended with a bid that
// cleared reserve - awaiting the farmer's accept decision. EXPIRED means
// nothing cleared reserve, so the frontend should prompt the farmer to
// relist (optionally at a lower reserve).
export function startAuctionExpiryJob() {
  cron.schedule("* * * * *", async () => {
    const closingListings = await prisma.listing.findMany({
      where: { status: "ACTIVE", auctionEnd: { lte: new Date() } },
      include: { bids: { orderBy: { amount: "desc" }, take: 1 } },
    });

    for (const listing of closingListings) {
      const topBid = listing.bids[0];
      const clearsReserve = Boolean(topBid && topBid.amount >= listing.reservePrice);
      const newStatus = clearsReserve ? "CLOSED" : "EXPIRED";

      await prisma.listing.update({ where: { id: listing.id }, data: { status: newStatus } });
      emitToListing(listing.id, "listing:closed", {
        listingId: listing.id,
        reason: newStatus.toLowerCase(),
      });
    }
  });
}
