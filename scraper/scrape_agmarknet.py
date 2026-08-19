"""
Pulls daily mandi price data from Agmarknet/data.gov.in and writes rows into
the PriceSnapshot table. Run on a schedule (GitHub Actions cron) and
completely decoupled from the live app: the app only ever reads what's
already in PriceSnapshot, so a broken scraper run never breaks the app.

Not implemented yet — this is a scaffold placeholder. Fetch/parse/insert
logic lands in the "market price scraper" feature commit.
"""

def fetch_prices():
    raise NotImplementedError


def save_snapshot(rows):
    raise NotImplementedError


if __name__ == "__main__":
    rows = fetch_prices()
    save_snapshot(rows)
