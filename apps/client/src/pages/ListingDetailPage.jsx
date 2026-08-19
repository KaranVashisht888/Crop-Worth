import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext.jsx";
import { useListingSocket } from "../context/SocketContext.jsx";
import { getListing } from "../api/listings.js";
import { listBidsForListing, placeBid, acceptBid } from "../api/bids.js";
import StatusBadge from "../components/StatusBadge.jsx";
import PriceReference from "../components/PriceReference.jsx";
import AdvisoryTips from "../components/AdvisoryTips.jsx";

export default function ListingDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState(null);
  const [placingBid, setPlacingBid] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = useCallback(() => {
    Promise.all([getListing(id), listBidsForListing(id)]).then(([l, b]) => {
      setListing(l);
      setBids(b);
    });
  }, [id]);

  useEffect(load, [load]);

  const handleNewBid = useCallback((bid) => {
    setBids((prev) => [bid, ...prev.map((b) => (b.status === "PENDING" ? { ...b, status: "OUTBID" } : b))]);
  }, []);

  const handleBidAccepted = useCallback(({ bidId }) => {
    setBids((prev) => prev.map((b) => ({ ...b, status: b.id === bidId ? "ACCEPTED" : "REJECTED" })));
    setListing((prev) => (prev ? { ...prev, status: "ACCEPTED" } : prev));
  }, []);

  const handleListingClosed = useCallback(({ reason }) => {
    const status = { accepted: "ACCEPTED", closed: "CLOSED", expired: "EXPIRED" }[reason];
    if (status) setListing((prev) => (prev ? { ...prev, status } : prev));
  }, []);

  useListingSocket(id, {
    "bid:new": handleNewBid,
    "bid:accepted": handleBidAccepted,
    "listing:closed": handleListingClosed,
  });

  if (!listing) {
    return <p className="mx-auto max-w-3xl px-4 py-6 text-gray-500">{t("common.loading")}</p>;
  }

  const isOwner = user.role === "FARMER" && listing.farmerId === user.id;
  const isBuyer = user.role === "BUYER";
  const highestAmount = bids.reduce((max, b) => Math.max(max, b.amount), 0);
  const canBid = isBuyer && ["ACTIVE"].includes(listing.status) && new Date(listing.auctionEnd) > new Date();
  const canAccept = isOwner && ["ACTIVE", "CLOSED"].includes(listing.status);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setBidError(null);
    const amount = Number(bidAmount);
    if (!amount || amount <= highestAmount) {
      setBidError(t("bid.mustExceed", { amount: highestAmount }));
      return;
    }
    setPlacingBid(true);
    try {
      await placeBid(id, amount);
      setBidAmount("");
    } catch (err) {
      setBidError(err.response?.data?.error || t("bid.placeFailed"));
    } finally {
      setPlacingBid(false);
    }
  };

  const handleAccept = async (bidId) => {
    setAcceptingId(bidId);
    setNotice(null);
    try {
      await acceptBid(bidId);
      setNotice(t("bid.accepted"));
    } catch (err) {
      setNotice(err.response?.data?.error || t("bid.acceptFailed"));
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {listing.cropType}
              {listing.variety && <span className="text-gray-500"> ({listing.variety})</span>}
            </h1>
            <p className="text-sm text-gray-500">
              {listing.region} · {listing.quantity} {listing.unit} · {t("listing.by")} {listing.farmer.name}
            </p>
          </div>
          <StatusBadge status={listing.status} />
        </div>

        {listing.photoUrl && (
          <img
            src={`${import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:4000"}${listing.photoUrl}`}
            alt={listing.cropType}
            className="mt-4 max-h-64 rounded object-cover"
          />
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Stat label={t("listing.expected")} value={`₹${listing.expectedPrice}`} />
          <Stat label={t("listing.reserve")} value={`₹${listing.reservePrice}`} />
          <Stat label={t("listing.harvestDate")} value={new Date(listing.harvestDate).toLocaleDateString()} />
          <Stat label={t("listing.auctionEnd")} value={new Date(listing.auctionEnd).toLocaleString()} />
        </div>

        {listing.status === "EXPIRED" && isOwner && (
          <p className="mt-4 rounded bg-amber-50 p-3 text-sm text-amber-800">
            {t("listing.expiredPrompt")}{" "}
            <Link to="/listings/new" className="font-medium underline">
              {t("listing.createNew")}
            </Link>
          </p>
        )}

        {canBid && (
          <form onSubmit={handleBidSubmit} className="mt-5 flex gap-2">
            <input
              type="number"
              min="0"
              step="any"
              placeholder={t("bid.amountPlaceholder", { amount: highestAmount })}
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
            />
            <button
              type="submit"
              disabled={placingBid}
              className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
            >
              {t("bid.place")}
            </button>
          </form>
        )}
        {bidError && <p className="mt-2 text-sm text-red-600">{bidError}</p>}
        {notice && <p className="mt-2 text-sm text-green-700">{notice}</p>}
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">{t("bid.history")}</h2>
        {bids.length === 0 ? (
          <p className="text-sm text-gray-500">{t("bid.none")}</p>
        ) : (
          <ul className="space-y-2">
            {bids.map((bid) => (
              <li
                key={bid.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">₹{bid.amount}</span>
                  <StatusBadge status={bid.status} />
                  {bid.belowReserve && (
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800">
                      {t("bid.belowReserve")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  {isOwner ? (
                    <span>
                      {bid.buyer.name}
                      {bid.buyer.reliabilityScore != null &&
                        ` · ${t("bid.reliability")}: ${Math.round(bid.buyer.reliabilityScore * 100)}%`}
                    </span>
                  ) : (
                    bid.buyerId === user.id && <span className="italic">{t("bid.yours")}</span>
                  )}
                  {canAccept && bid.status !== "ACCEPTED" && bid.status !== "REJECTED" && (
                    <button
                      onClick={() => handleAccept(bid.id)}
                      disabled={acceptingId === bid.id}
                      className="rounded border border-green-700 px-2 py-1 text-xs text-green-800 hover:bg-green-50 disabled:opacity-50"
                    >
                      {t("bid.accept")}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <PriceReference crop={listing.cropType} region={listing.region} />
        <AdvisoryTips crop={listing.cropType} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}
