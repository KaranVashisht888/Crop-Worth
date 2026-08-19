import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPrices } from "../api/prices.js";

export default function PriceReference({ crop, region }) {
  const { t } = useTranslation();
  const [prices, setPrices] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!crop) return;
    setPrices(null);
    setError(null);
    getPrices({ crop, region })
      .then((data) => setPrices(Array.isArray(data) ? data : data ? [data] : []))
      .catch(() => setError(t("prices.error")));
  }, [crop, region, t]);

  if (!crop) return null;
  if (error) return <p className="text-sm text-gray-500">{error}</p>;
  if (prices === null) return <p className="text-sm text-gray-400">{t("prices.loading")}</p>;
  if (prices.length === 0) return <p className="text-sm text-gray-500">{t("prices.none")}</p>;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <h4 className="mb-2 text-sm font-semibold text-gray-700">{t("prices.title", { crop })}</h4>
      <ul className="space-y-1 text-sm">
        {prices.map((p) => (
          <li key={p.id} className="flex justify-between">
            <span className="text-gray-600">{p.region}</span>
            <span className="font-medium text-gray-900">
              ₹{p.price} / {p.unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
