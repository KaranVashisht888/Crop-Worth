import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createListing, uploadListingPhoto } from "../api/listings.js";

const UNITS = ["kg", "quintal", "ton"];

const INITIAL = {
  cropType: "",
  variety: "",
  quantity: "",
  unit: "kg",
  expectedPrice: "",
  reservePrice: "",
  region: "",
  harvestDate: "",
  auctionEnd: "",
};

export default function CreateListingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const listing = await createListing({
        ...form,
        variety: form.variety || undefined,
        quantity: Number(form.quantity),
        expectedPrice: Number(form.expectedPrice),
        reservePrice: Number(form.reservePrice),
        harvestDate: new Date(form.harvestDate).toISOString(),
        auctionEnd: new Date(form.auctionEnd).toISOString(),
      });
      if (photo) {
        await uploadListingPhoto(listing.id, photo);
      }
      navigate(`/listings/${listing.id}`);
    } catch (err) {
      const data = err.response?.data;
      setErrors(data?.errors || [data?.error || t("listing.createFailed")]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">{t("listing.createNew")}</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          placeholder={t("listing.cropType")}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          value={form.cropType}
          onChange={set("cropType")}
        />
        <input
          placeholder={t("listing.variety")}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          value={form.variety}
          onChange={set("variety")}
        />

        <div className="flex gap-2">
          <input
            required
            type="number"
            min="0"
            step="any"
            placeholder={t("listing.quantity")}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            value={form.quantity}
            onChange={set("quantity")}
          />
          <select
            className="rounded border border-gray-300 px-3 py-2 text-sm"
            value={form.unit}
            onChange={set("unit")}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <input
            required
            type="number"
            min="0"
            step="any"
            placeholder={t("listing.expected")}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            value={form.expectedPrice}
            onChange={set("expectedPrice")}
          />
          <input
            required
            type="number"
            min="0"
            step="any"
            placeholder={t("listing.reserve")}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            value={form.reservePrice}
            onChange={set("reservePrice")}
          />
        </div>

        <input
          required
          placeholder={t("listing.region")}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          value={form.region}
          onChange={set("region")}
        />

        <label className="block text-xs text-gray-500">
          {t("listing.harvestDate")}
          <input
            required
            type="date"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            value={form.harvestDate}
            onChange={set("harvestDate")}
          />
        </label>

        <label className="block text-xs text-gray-500">
          {t("listing.auctionEnd")}
          <input
            required
            type="datetime-local"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            value={form.auctionEnd}
            onChange={set("auctionEnd")}
          />
        </label>

        <label className="block text-xs text-gray-500">
          {t("listing.photo")}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-1 block w-full text-sm"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          />
        </label>

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
          {t("listing.createNew")}
        </button>
      </form>
    </div>
  );
}
