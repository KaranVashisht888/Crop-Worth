import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext.jsx";

const INITIAL = { email: "", password: "", name: "", role: "FARMER", region: "" };

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      await register(form);
      navigate("/listings");
    } catch (err) {
      const data = err.response?.data;
      setErrors(data?.errors || [data?.error || t("auth.registerFailed")]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">{t("auth.register")}</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          placeholder={t("auth.name")}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          required
          placeholder={t("auth.email")}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          required
          placeholder={t("auth.password")}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <input
          placeholder={t("auth.region")}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          value={form.region}
          onChange={(e) => setForm({ ...form, region: e.target.value })}
        />
        <div className="flex gap-2">
          {["FARMER", "BUYER"].map((role) => (
            <button
              type="button"
              key={role}
              onClick={() => setForm({ ...form, role })}
              className={`flex-1 rounded border py-2 text-sm ${
                form.role === role
                  ? "border-green-700 bg-green-50 text-green-800"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {t(`role.${role}`)}
            </button>
          ))}
        </div>
        {errors.length > 0 && (
          <ul className="list-inside list-disc text-sm text-red-600">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-green-700 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
        >
          {t("auth.register")}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        {t("auth.haveAccount")}{" "}
        <Link to="/login" className="text-green-700 hover:underline">
          {t("auth.login")}
        </Link>
      </p>
    </div>
  );
}
