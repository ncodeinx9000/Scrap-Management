import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Tags, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
const input =
  "mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
export default function Categories() {
  const user = useSelector((s) => s.auth.user);
  const admin = user?.role === "admin";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/categories");
      setRows(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load categories.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    api
      .get("/categories")
      .then(({ data }) => {
        if (active) setRows(Array.isArray(data.data) ? data.data : []);
      })
      .catch((e) => {
        if (active)
          setError(e.response?.data?.message || "Could not load categories.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const add = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post("/categories", {
        name: form.name.trim(),
        description: form.description.trim(),
      });
      setRows((curr) =>
        [...curr, data.data].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setForm({ name: "", description: "" });
      setShowForm(false);
      toast.success("Category added");
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          e.response?.data?.messgae ||
          "Could not add category",
      );
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await api.delete(`/categories/${target._id}`);
      setRows((curr) => curr.filter((x) => x._id !== target._id));
      setTarget(null);
      toast.success("Category deleted");
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not delete category");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Inventory setup
          </p>
          <h1 className="mt-1 text-2xl font-bold">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Group materials into categories for easier tracking.
          </p>
        </div>
        {admin && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus size={17} />
            Add Category
          </button>
        )}
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold">
            All categories{" "}
            <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {rows.length}
            </span>
          </h2>
          <button
            onClick={() => {
              setLoading(true);
              setError("");
              load();
            }}
            aria-label="Refresh categories"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading categories…
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError("");
                load();
              }}
              className="mt-3 rounded-lg border px-4 py-2 text-sm font-semibold"
            >
              Try again
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <Tags className="mx-auto text-gray-300" />
            <p className="mt-3 font-semibold">No categories yet</p>
            <p className="mt-1 text-sm text-gray-500">
              {admin
                ? "Add your first category to organise scrap items."
                : "Categories will appear here once an admin adds them."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Description</th>
                  {admin && (
                    <th className="px-5 py-3 text-right font-semibold">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row._id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-4 font-semibold text-gray-800">
                      {row.name}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {row.description || (
                        <span className="text-gray-400">No description</span>
                      )}
                    </td>
                    {admin && (
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setTarget(row)}
                          aria-label={`Delete ${row.name}`}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showForm && (
        <div className="fixed inset-0 z-40 grid place-items-start overflow-y-auto bg-slate-950/40 p-4 sm:place-items-center">
          <form
            onSubmit={add}
            className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold">Add category</h2>
            <p className="mt-1 text-sm text-gray-500">
              Categories help your team find items quickly.
            </p>
            <label className="mt-5 block text-sm font-medium">
              Name
              <input
                className={input}
                maxLength="80"
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Office furniture"
                required
              />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Description{" "}
              <span className="font-normal text-gray-400">(optional)</span>
              <textarea
                className={`${input} min-h-24 resize-y`}
                maxLength="500"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="What belongs in this category?"
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowForm(false)}
                className="rounded-lg border px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save category"}
              </button>
            </div>
          </form>
        </div>
      )}
      <ConfirmModal
        open={!!target}
        title="Delete category?"
        message={`Delete “${target?.name}”? Categories that are in use cannot be deleted.`}
        confirmLabel="Delete category"
        loading={deleting}
        onCancel={() => setTarget(null)}
        onConfirm={remove}
      />
    </div>
  );
}
