import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Placeholder reference prices (INR per quintal) so the app is demoable
// without a registered data.gov.in API key. Replace with real data by
// running scraper/scrape_agmarknet.py once DATA_GOV_IN_API_KEY is set -
// see scraper/.env.example and the README.
const SOURCE = "seed-data (placeholder - see scraper/.env.example)";

const REGIONS = ["Punjab", "Haryana", "Uttar Pradesh", "Maharashtra", "Delhi"];

const BASE_PRICES = {
  Wheat: 2280,
  Rice: 2850,
  Cotton: 7100,
  Maize: 2050,
  Barley: 1950,
  Potato: 1350,
  Onion: 1800,
  Tomato: 1400,
  Soyabean: 4400,
  Groundnut: 6100,
};

// Deterministic small variation per region so prices don't look identical.
function jitter(base, seed) {
  const factor = 1 + (((seed * 37) % 15) - 7) / 100;
  return Math.round(base * factor);
}

async function main() {
  const today = new Date();
  const rows = [];
  let seed = 0;

  for (const [cropType, basePrice] of Object.entries(BASE_PRICES)) {
    for (const region of REGIONS) {
      rows.push({
        cropType,
        region,
        price: jitter(basePrice, seed++),
        unit: "quintal",
        date: today,
        source: SOURCE,
      });
    }
  }

  await prisma.priceSnapshot.deleteMany({});
  await prisma.priceSnapshot.createMany({ data: rows });
  console.log(`Seeded ${rows.length} placeholder price snapshots.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
