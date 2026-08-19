import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAdvisoryTips } from "../api/advisory.js";

export default function AdvisoryTips({ crop }) {
  const { t } = useTranslation();
  const [tips, setTips] = useState(null);

  useEffect(() => {
    if (!crop) return;
    setTips(null);
    getAdvisoryTips({ crop })
      .then(setTips)
      .catch(() => setTips([]));
  }, [crop]);

  if (!crop) return null;
  if (tips === null) return <p className="text-sm text-gray-400">{t("advisory.loading")}</p>;
  if (tips.length === 0) return <p className="text-sm text-gray-500">{t("advisory.none")}</p>;

  return (
    <div className="space-y-2">
      {tips.map((tip) => (
        <div key={tip.id} className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="mb-1 flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-800">{tip.title}</h4>
            {tip.season && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                {tip.season}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{tip.body}</p>
        </div>
      ))}
    </div>
  );
}
