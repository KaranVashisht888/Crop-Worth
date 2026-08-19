import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext.jsx";
import { listMyTransactions, resolveTransaction } from "../api/transactions.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function TransactionsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);

  const load = () => {
    listMyTransactions().then(setTransactions);
  };

  useEffect(load, []);

  const handleResolve = async (id, status) => {
    setResolvingId(id);
    try {
      await resolveTransaction(id, status);
      load();
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">{t("nav.transactions")}</h1>
      {transactions === null && <p className="text-gray-500">{t("common.loading")}</p>}
      {transactions?.length === 0 && <p className="text-gray-500">{t("transaction.none")}</p>}
      <ul className="space-y-2">
        {transactions?.map((tx) => (
          <li key={tx.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">{tx.listing.cropType}</span>
                <span className="ml-2 text-gray-500">
                  {user.role === "FARMER" ? tx.buyer.name : tx.farmer.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">₹{tx.finalAmount}</span>
                <StatusBadge status={tx.status} />
              </div>
            </div>
            {tx.status === "PENDING_FULFILLMENT" && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleResolve(tx.id, "COMPLETED")}
                  disabled={resolvingId === tx.id}
                  className="rounded border border-green-700 px-2 py-1 text-xs text-green-800 hover:bg-green-50 disabled:opacity-50"
                >
                  {t("transaction.markCompleted")}
                </button>
                <button
                  onClick={() => handleResolve(tx.id, "FELL_THROUGH")}
                  disabled={resolvingId === tx.id}
                  className="rounded border border-red-700 px-2 py-1 text-xs text-red-800 hover:bg-red-50 disabled:opacity-50"
                >
                  {t("transaction.markFellThrough")}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
