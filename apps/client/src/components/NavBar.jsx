import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

export default function NavBar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-green-800">
          {t("appName")}
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {user && (
            <>
              <Link to="/listings" className="text-gray-700 hover:text-green-800">
                {user.role === "FARMER" ? t("nav.myListings") : t("nav.browseListings")}
              </Link>
              {user.role === "BUYER" && (
                <Link to="/bids/mine" className="text-gray-700 hover:text-green-800">
                  {t("nav.myBids")}
                </Link>
              )}
              <Link to="/transactions" className="text-gray-700 hover:text-green-800">
                {t("nav.transactions")}
              </Link>
              <Link to="/advisory" className="text-gray-700 hover:text-green-800">
                {t("nav.advisory")}
              </Link>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                {user.name} · {t(`role.${user.role}`)}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-700"
              >
                {t("nav.logout")}
              </button>
            </>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
