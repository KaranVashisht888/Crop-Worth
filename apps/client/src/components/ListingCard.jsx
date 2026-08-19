import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import StatusBadge from "./StatusBadge.jsx";

export default function ListingCard({ listing }) {
  const { t } = useTranslation();
  const auctionEnded = new Date(listing.auctionEnd) < new Date();

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-green-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">
            {listing.cropType}
            {listing.variety && <span className="text-gray-500"> ({listing.variety})</span>}
          </h3>
          <p className="text-sm text-gray-500">
            {listing.region} · {listing.quantity} {listing.unit}
          </p>
        </div>
        <StatusBadge status={listing.status} />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <div>
          <span className="text-gray-500">{t("listing.reserve")}: </span>
          <span className="font-medium">₹{listing.reservePrice}</span>
          <span className="text-gray-400"> / {t("listing.expected")} ₹{listing.expectedPrice}</span>
        </div>
        {listing._count && (
          <span className="text-gray-500">{t("listing.bidCount", { count: listing._count.bids })}</span>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-400">
        {auctionEnded ? t("listing.ended") : t("listing.endsAt", { date: new Date(listing.auctionEnd).toLocaleString() })}
      </p>
    </Link>
  );
}
