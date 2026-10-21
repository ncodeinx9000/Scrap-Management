import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Recycle, X } from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../api/axios";
const statuses = {
  in_stock: "bg-emerald-50 text-emerald-700",
  sold: "bg-blue-50 text-blue-700",
  recycled: "bg-teal-50 text-teal-700",
  donated: "bg-purple-50 text-purple-700",
  disposed: "bg-gray-100 text-gray-600",
};
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const dateText = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";
const pretty = (s) =>
  s?.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—";
const input =
  "mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
export default function ScrapDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const admin = user?.role === "admin";
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "sold",
    buyerName: "",
    amountReceived: "",
    date: today(),
    notes: "",
  });
  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/scrap/${id}`);
      setItem(data.data);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load this scrap item.");
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    let active = true;
    api
      .get(`/scrap/${id}`)
      .then(({ data }) => {
        if (active) setItem(data.data);
      })
      .catch((e) => {
        if (active)
          setError(
            e.response?.data?.message || "Could not load this scrap item.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);
  const canEdit =
    item?.status === "in_stock" &&
    (admin ||
      String(item?.addedBy?._id || item?.addedBy) === String(user?._id));
  const submit = async (e) => {
    e.preventDefault();
    if (form.type === "sold" && !form.buyerName.trim()) {
      toast.error("Buyer name is required for a sale");
      return;
    }
    if (
      form.type === "sold" &&
      (!form.amountReceived || Number(form.amountReceived) < 0)
    ) {
      toast.error("Enter the amount received");
      return;
    }
    if (!form.date) {
      toast.error("Select the date");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/scrap/${id}/dispose`, {
        type: form.type,
        buyerName: form.type === "sold" ? form.buyerName.trim() : "",
        amountReceived: form.type === "sold" ? Number(form.amountReceived) : 0,
        date: form.date,
        notes: form.notes.trim(),
      });
      toast.success(`Item marked as ${form.type}`);
      setModal(false);
      setLoading(true);
      setError("");
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not update item status");
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <div className="rounded-2xl border bg-white p-12 text-center text-sm text-gray-500">
        Loading scrap details…
      </div>
    );
  if (error || !item)
    return (
      <div className="rounded-2xl border bg-white p-10 text-center">
        <p className="text-sm text-red-600">
          {error || "Scrap item not found."}
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              setError("");
              load();
            }}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Try again
          </button>
          <Link
            to="/scrap"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to scrap
          </Link>
        </div>
      </div>
    );
  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to="/scrap"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-700"
      >
        <ArrowLeft size={16} />
        Back to scrap
      </Link>
      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b p-6 sm:p-8">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Inventory item
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{item.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statuses[item.status] || statuses.disposed}`}
              >
                {pretty(item.status)}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {pretty(item.condition)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <button
                onClick={() => navigate(`/scrap/${id}/edit`)}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
              >
                <Pencil size={16} />
                Edit
              </button>
            )}
            {admin && item.status === "in_stock" && (
              <button
                onClick={() => {
                  setForm({
                    type: "sold",
                    buyerName: "",
                    amountReceived: "",
                    date: today(),
                    notes: "",
                  });
                  setModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Recycle size={16} />
                Mark as Sold / Recycled / Donated / Disposed
              </button>
            )}
          </div>
        </div>
        {item.status !== "in_stock" && (
          <div className="border-b bg-gray-50 px-6 py-3 text-sm text-gray-600 sm:px-8">
            <strong className="text-gray-800">Closed.</strong> This item has
            been {pretty(item.status).toLowerCase()}; editing and disposal
            actions are unavailable.
          </div>
        )}
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,.8fr)]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="max-h-96 w-full rounded-2xl bg-gray-50 object-contain"
            />
          ) : (
            <div className="grid min-h-48 place-items-center rounded-2xl bg-emerald-50 text-emerald-300">
              <Recycle size={52} />
            </div>
          )}
          <div>
            <h2 className="font-semibold">Item information</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
              {[
                ["Category", item.categoryId?.name],
                ["Quantity", `${item.quantity} ${item.unit}`],
                ["Condition", pretty(item.condition)],
                ["Location", item.location],
                [
                  "Estimated value",
                  item.estimatedValue != null
                    ? Number(item.estimatedValue).toLocaleString()
                    : null,
                ],
                ["Added by", item.addedBy?.name],
                ["Added on", dateText(item.createdAt)],
                ["Last updated", dateText(item.updatedAt)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-gray-500">{label}</dt>
                  <dd className="mt-1 text-sm font-medium">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        {item.notes && (
          <div className="border-t px-6 py-5 sm:px-8">
            <h2 className="font-semibold">Notes</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
              {item.notes}
            </p>
          </div>
        )}
      </div>
      {modal && (
        <div className="fixed inset-0 z-40 grid place-items-start overflow-y-auto bg-slate-950/40 p-4 sm:place-items-center">
          <form
            onSubmit={submit}
            className="my-4 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">
                  Close inventory item
                </p>
                <h2 className="mt-1 text-xl font-bold">Record item outcome</h2>
                <p className="mt-1 text-sm text-gray-500">
                  This will remove it from in-stock inventory.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModal(false)}
                disabled={saving}
                aria-label="Close"
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <label className="mt-5 block text-sm font-medium">
              Outcome
              <select
                className={input}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="sold">Sold</option>
                <option value="recycled">Recycled</option>
                <option value="donated">Donated</option>
                <option value="disposed">Disposed</option>
              </select>
            </label>
            {form.type === "sold" && (
              <>
                <label className="mt-4 block text-sm font-medium">
                  Buyer name
                  <input
                    className={input}
                    value={form.buyerName}
                    onChange={(e) =>
                      setForm({ ...form, buyerName: e.target.value })
                    }
                    required
                    placeholder="Buyer or organisation"
                  />
                </label>
                <label className="mt-4 block text-sm font-medium">
                  Amount received
                  <input
                    className={input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amountReceived}
                    onChange={(e) =>
                      setForm({ ...form, amountReceived: e.target.value })
                    }
                    required
                    placeholder="0.00"
                  />
                </label>
              </>
            )}
            <label className="mt-4 block text-sm font-medium">
              Date
              <input
                className={input}
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Notes{" "}
              <span className="font-normal text-gray-400">(optional)</span>
              <textarea
                className={`${input} min-h-20 resize-y`}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Add any outcome details"
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => setModal(false)}
                className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save outcome"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
