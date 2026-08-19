import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { listMyBids } from "../api/bids.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function MyBidsPage() {
  const { t } = useTranslation();
  const [bids, setBids] = useState(null);

  useEffect(() => {
    listMyBids().then(setBids);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">{t("nav.myBids")}</h1>
      {bids === null && <p className="text-gray-500">{t("common.loading")}</p>}
      {bids?.length === 0 && <p className="text-gray-500">{t("bid.none")}</p>}
      <ul className="space-y-2">
        {bids?.map((bid) => (
          <li key={bid.id} className="rounded-lg border border-gray-200 bg-white p-3">
            <Link to={`/listings/${bid.listingId}`} className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium text-gray-900">{bid.listing.cropType}</span>
                <span className="ml-2 text-gray-500">{bid.listing.region}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">₹{bid.amount}</span>
                <StatusBadge status={bid.status} />
                {bid.belowReserve && (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800">
                    {t("bid.belowReserve")}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
