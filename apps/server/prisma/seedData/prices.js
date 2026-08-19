// Placeholder reference prices (INR per quintal) so the app is demoable
// without a registered data.gov.in API key. Replace with real data by
// running scraper/scrape_agmarknet.py once DATA_GOV_IN_API_KEY is set -
// see scraper/.env.example and the README.
export const PRICE_SOURCE = "seed-data (placeholder - see scraper/.env.example)";

export const PRICE_REGIONS = ["Punjab", "Haryana", "Uttar Pradesh", "Maharashtra", "Delhi"];

export const BASE_PRICES = {
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
