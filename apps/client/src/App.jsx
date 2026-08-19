import { useTranslation } from "react-i18next";

export default function App() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <h1 className="text-2xl font-semibold text-green-900">{t("appName")}</h1>
    </div>
  );
}
