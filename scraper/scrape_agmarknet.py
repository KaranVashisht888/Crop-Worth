"""
Pulls daily mandi price data for a configured list of crops from the
data.gov.in Open Government Data API (resource
9ef84268-d588-465a-a308-a864a43d0070, "Current Daily Price of Various
Commodities from Various Markets (Mandi)"), which is itself sourced from
the Agmarknet portal.

This hits data.gov.in's JSON API rather than scraping agmarknet.gov.in's
HTML directly: that portal's search UI is ASP.NET postback/viewstate
based and not reliably scrapable with plain requests, whereas this is the
same underlying data through a stable, documented API.

Runs on a schedule (GitHub Actions cron), fully decoupled from the live
app: the app only ever reads what's already in PriceSnapshot, so a
broken or rate-limited scraper run never breaks the app - it just serves
whatever was last written.

Requires a free API key from https://data.gov.in (register, then find
your key under My Account > API Keys) set as DATA_GOV_IN_API_KEY. The
public sample key shown in data.gov.in's own docs is shared by every
tutorial that has ever copied it and is permanently rate-limited - it
will not work here.
"""

import os
import sys
from datetime import datetime

import psycopg2
import requests
from dotenv import load_dotenv

load_dotenv()

API_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
DEFAULT_CROPS = "Wheat,Rice,Cotton,Maize,Barley,Potato,Onion,Tomato,Soyabean,Groundnut"
RECORDS_PER_CROP = 20


def fetch_prices():
    api_key = os.environ.get("DATA_GOV_IN_API_KEY")
    if not api_key:
        raise SystemExit("DATA_GOV_IN_API_KEY is not set - see scraper/.env.example")

    crops = [c.strip() for c in os.environ.get("CROPS", DEFAULT_CROPS).split(",") if c.strip()]

    rows = []
    for crop in crops:
        params = {
            "api-key": api_key,
            "format": "json",
            "limit": RECORDS_PER_CROP,
            "filters[commodity]": crop,
        }
        resp = requests.get(API_URL, params=params, timeout=30)
        resp.raise_for_status()
        payload = resp.json()

        for record in payload.get("records", []):
            row = parse_record(record)
            if row:
                rows.append(row)

    return rows


def parse_record(record):
    try:
        modal_price = float(record["modal_price"])
        arrival_date = datetime.strptime(record["arrival_date"], "%d/%m/%Y")
    except (KeyError, ValueError, TypeError):
        return None

    crop_type = (record.get("commodity") or "").strip()
    region = (record.get("state") or "").strip()
    if not crop_type or not region:
        return None

    return {
        "cropType": crop_type,
        "region": region,
        "price": modal_price,
        "unit": "quintal",
        "date": arrival_date,
        "source": "data.gov.in (Agmarknet)",
    }


def save_snapshot(rows):
    if not rows:
        print("No rows to save.")
        return

    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise SystemExit("DATABASE_URL is not set - see scraper/.env.example")

    conn = psycopg2.connect(database_url)
    try:
        with conn.cursor() as cur:
            for row in rows:
                cur.execute(
                    """
                    INSERT INTO "PriceSnapshot"
                        (id, "cropType", region, price, unit, date, source, "createdAt")
                    VALUES
                        (gen_random_uuid(), %(cropType)s, %(region)s, %(price)s, %(unit)s, %(date)s, %(source)s, now())
                    """,
                    row,
                )
        conn.commit()
        print(f"Saved {len(rows)} price snapshots.")
    finally:
        conn.close()


if __name__ == "__main__":
    try:
        save_snapshot(fetch_prices())
    except Exception as exc:
        print(f"Scraper failed: {exc}", file=sys.stderr)
        sys.exit(1)
