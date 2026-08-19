import { PrismaClient } from "@prisma/client";
import { PRICE_SOURCE, PRICE_REGIONS, BASE_PRICES } from "./seedData/prices.js";
import { ADVISORY_TIPS } from "./seedData/advisoryTips.js";

const prisma = new PrismaClient();

// Deterministic small variation per region so prices don't look identical.
function jitter(base, seed) {
  const factor = 1 + (((seed * 37) % 15) - 7) / 100;
  return Math.round(base * factor);
}

async function seedPrices() {
  const today = new Date();
  const rows = [];
  let seed = 0;

  for (const [cropType, basePrice] of Object.entries(BASE_PRICES)) {
    for (const region of PRICE_REGIONS) {
      rows.push({
        cropType,
        region,
        price: jitter(basePrice, seed++),
        unit: "quintal",
        date: today,
        source: PRICE_SOURCE,
      });
    }
  }

  await prisma.priceSnapshot.deleteMany({});
  await prisma.priceSnapshot.createMany({ data: rows });
  console.log(`Seeded ${rows.length} placeholder price snapshots.`);
}

async function seedAdvisoryTips() {
  await prisma.advisoryTip.deleteMany({});
  await prisma.advisoryTip.createMany({ data: ADVISORY_TIPS });
  console.log(`Seeded ${ADVISORY_TIPS.length} advisory tips.`);
}

async function main() {
  await seedPrices();
  await seedAdvisoryTips();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
