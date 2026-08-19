import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext.jsx";
import { listListings, listMyListings } from "../api/listings.js";
import ListingCard from "../components/ListingCard.jsx";

export default function ListingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isFarmer = user.role === "FARMER";

  const [filters, setFilters] = useState({ crop: "", region: "" });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    const fetcher = isFarmer ? listMyListings : listListings;
    const params = isFarmer
      ? {}
      : { crop: filters.crop || undefined, region: filters.region || undefined };

    fetcher(params)
      .then((data) => setItems(data.items))
      .catch(() => setError(t("listing.loadError")))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [isFarmer]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          {isFarmer ? t("nav.myListings") : t("nav.browseListings")}
        </h1>
        {isFarmer && (
          <Link
            to="/listings/new"
            className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
          >
            {t("listing.createNew")}
          </Link>
        )}
      </div>

      {!isFarmer && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="mb-6 flex gap-2"
        >
          <input
            placeholder={t("listing.filterCrop")}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
            value={filters.crop}
            onChange={(e) => setFilters({ ...filters, crop: e.target.value })}
          />
          <input
            placeholder={t("listing.filterRegion")}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
          />
          <button
            type="submit"
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {t("listing.search")}
          </button>
        </form>
      )}

      {loading && <p className="text-gray-500">{t("common.loading")}</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="text-gray-500">{t("listing.none")}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
