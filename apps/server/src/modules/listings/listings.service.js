import { prisma } from "../../config/prisma.js";

const PUBLIC_FARMER_SELECT = { id: true, name: true, region: true };

export async function createListing(farmerId, data) {
  return prisma.listing.create({
    data: {
      farmerId,
      cropType: data.cropType,
      variety: data.variety,
      quantity: data.quantity,
      unit: data.unit,
      expectedPrice: data.expectedPrice,
      reservePrice: data.reservePrice,
      region: data.region,
      harvestDate: new Date(data.harvestDate),
      auctionEnd: new Date(data.auctionEnd),
    },
    include: { farmer: { select: PUBLIC_FARMER_SELECT } },
  });
}

export async function listListings({ crop, region, status, page, limit }) {
  const where = { status: status || "ACTIVE" };
  if (crop) where.cropType = { equals: crop, mode: "insensitive" };
  if (region) where.region = { equals: region, mode: "insensitive" };

  const take = Math.min(Number(limit) || 20, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { auctionEnd: "asc" },
      skip,
      take,
      include: {
        farmer: { select: PUBLIC_FARMER_SELECT },
        _count: { select: { bids: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  return { items, total, page: Number(page) || 1, limit: take };
}

export async function getListingById(id) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      farmer: { select: PUBLIC_FARMER_SELECT },
      _count: { select: { bids: true } },
    },
  });
  if (!listing) throw httpError(404, "Listing not found");
  return listing;
}

export async function updateListing(id, farmerId, data) {
  const listing = await getOwnedListing(id, farmerId);
  await assertNoBids(listing);

  const updateData = {};
  for (const key of ["cropType", "variety", "quantity", "unit", "expectedPrice", "reservePrice", "region"]) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }
  if (data.harvestDate !== undefined) updateData.harvestDate = new Date(data.harvestDate);
  if (data.auctionEnd !== undefined) updateData.auctionEnd = new Date(data.auctionEnd);

  return prisma.listing.update({
    where: { id },
    data: updateData,
    include: { farmer: { select: PUBLIC_FARMER_SELECT } },
  });
}

export async function deleteListing(id, farmerId) {
  const listing = await getOwnedListing(id, farmerId);
  await assertNoBids(listing);
  await prisma.listing.delete({ where: { id } });
}

export async function setListingPhoto(id, farmerId, photoUrl) {
  await getOwnedListing(id, farmerId);
  return prisma.listing.update({ where: { id }, data: { photoUrl } });
}

async function getOwnedListing(id, farmerId) {
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) throw httpError(404, "Listing not found");
  if (listing.farmerId !== farmerId) throw httpError(403, "You do not own this listing");
  return listing;
}

// Once bidding has started, editing/deleting the listing out from under
// buyers would undermine the auction, so both are blocked past that point.
async function assertNoBids(listing) {
  const bidCount = await prisma.bid.count({ where: { listingId: listing.id } });
  if (bidCount > 0) {
    throw httpError(409, "Listing already has bids and can no longer be edited or deleted");
  }
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
