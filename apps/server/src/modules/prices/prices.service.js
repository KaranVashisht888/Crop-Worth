import { prisma } from "../../config/prisma.js";

export async function getPrices({ crop, region }) {
  if (!crop) {
    throw httpError(400, "crop query parameter is required");
  }

  if (region) {
    return prisma.priceSnapshot.findFirst({
      where: {
        cropType: { equals: crop, mode: "insensitive" },
        region: { equals: region, mode: "insensitive" },
      },
      orderBy: { date: "desc" },
    });
  }

  // No region given: return the latest snapshot per region for this crop,
  // so the frontend can show a table or let the user pick the nearest one.
  const rows = await prisma.priceSnapshot.findMany({
    where: { cropType: { equals: crop, mode: "insensitive" } },
    orderBy: { date: "desc" },
  });

  const latestByRegion = new Map();
  for (const row of rows) {
    if (!latestByRegion.has(row.region)) latestByRegion.set(row.region, row);
  }
  return [...latestByRegion.values()];
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
