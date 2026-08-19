import { useTranslation } from "react-i18next";

const COLORS = {
  ACTIVE: "bg-blue-100 text-blue-800",
  CLOSED: "bg-amber-100 text-amber-800",
  EXPIRED: "bg-gray-200 text-gray-700",
  ACCEPTED: "bg-green-100 text-green-800",
  PENDING: "bg-blue-100 text-blue-800",
  OUTBID: "bg-gray-200 text-gray-600",
  REJECTED: "bg-red-100 text-red-700",
  PENDING_FULFILLMENT: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-green-100 text-green-800",
  FELL_THROUGH: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  const classes = COLORS[status] || "bg-gray-100 text-gray-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}>
      {t(`status.${status}`, status)}
    </span>
  );
}
