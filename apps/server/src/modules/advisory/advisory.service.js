import { prisma } from "../../config/prisma.js";

export async function getAdvisoryTips({ crop, season }) {
  if (!crop) {
    const err = new Error("crop query parameter is required");
    err.status = 400;
    throw err;
  }

  return prisma.advisoryTip.findMany({
    where: {
      cropType: { equals: crop, mode: "insensitive" },
      ...(season ? { season: { equals: season, mode: "insensitive" } } : {}),
    },
    orderBy: { title: "asc" },
  });
}
