import { useState } from "react";
import { useTranslation } from "react-i18next";
import AdvisoryTips from "../components/AdvisoryTips.jsx";
import PriceReference from "../components/PriceReference.jsx";

const CROPS = ["Wheat", "Rice", "Cotton", "Maize", "Barley", "Potato", "Onion", "Tomato", "Soyabean", "Groundnut"];

export default function AdvisoryPage() {
  const { t } = useTranslation();
  const [crop, setCrop] = useState(CROPS[0]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">{t("nav.advisory")}</h1>

      <select
        value={crop}
        onChange={(e) => setCrop(e.target.value)}
        className="mb-6 rounded border border-gray-300 px-3 py-2 text-sm"
      >
        {CROPS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className="grid gap-6 sm:grid-cols-[2fr_1fr]">
        <AdvisoryTips crop={crop} />
        <PriceReference crop={crop} />
      </div>
    </div>
  );
}
