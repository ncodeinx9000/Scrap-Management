import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  FilePlus2,
  Search,
  SlidersHorizontal,
  Pencil,
  Trash2,
  RefreshCw,
  PackageSearch,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import Pagination from "../components/Pagination";
const conditions = ["usable", "repairable", "junk"];
const statuses = ["in_stock", "sold", "recycled", "donated", "disposed"];
const badge = {
  in_stock: "bg-emerald-50 text-emerald-700",
  sold: "bg-blue-50 text-blue-700",
  recycled: "bg-teal-50 text-teal-700",
  donated: "bg-purple-50 text-purple-700",
  disposed: "bg-gray-100 text-gray-600",
};
const pretty = (s) =>
  s?.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—";
const dateText = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
export default function ScrapList() {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const admin = user?.role === "admin";
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [condition, setCondition] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const searchTimer = useRef(null);
  useEffect(() => () => clearTimeout(searchTimer.current), []);
  useEffect(() => {
    let active = true;
    api
      .get("/categories")
      .then(({ data }) => {
        if (active) setCategories(Array.isArray(data.data) ? data.data : []);
      })
      .catch((e) => {
        if (active) {
          setCategoryError(
            e.response?.data?.message || "Could not load categories",
          );
          toast.error(e.response?.data?.message || "Could not load categories");
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    api
      .get("/scrap", {
        params: {
          search: debouncedSearch,
          category,
          status,
          condition,
          page,
          limit: 10,
        },
      })
      .then(({ data }) => {
        if (!active) return;
        setItems(Array.isArray(data.data) ? data.data : []);
        setPagination(data.pagination || { page, totalPages: 1, total: 0 });
      })
      .catch((e) => {
        if (active) {
          setError(e.response?.data?.message || "Could not load scrap items.");
          setItems([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedSearch, category, status, condition, page, reload]);
  const remove = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.delete(`/scrap/${deleting._id}`);
      toast.success("Scrap item deleted");
      setDeleting(null);
      const { data } = await api.get("/scrap", {
        params: {
          search: debouncedSearch,
          category,
          status,
          condition,
          page,
          limit: 10,
        },
      });
      setItems(data.data || []);
      setPagination(data.pagination || pagination);
    } catch (e) {
      toast.error(
        e.response?.data?.message || "Could not delete the scrap item",
      );
    } finally {
      setDeleteBusy(false);
    }
  };
  const canEdit = (item) =>
    item.status === "in_stock" &&
    (admin || String(item.addedBy?._id || item.addedBy) === String(user?._id));
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-700">Inventory</p>
          <h1 className="mt-1 text-2xl font-bold">Scrap items</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse and track materials across your organisation.
          </p>
        </div>
        <button
          onClick={() => navigate("/scrap/new")}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <FilePlus2 size={17} />
          Add Scrap
        </button>
      </div>
      <div className="mb-4 grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_repeat(3,minmax(150px,1fr))]">
        <label className="relative block">
          <span className="sr-only">Search scrap</span>
          <Search size={17} className="absolute left-3 top-3.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              setPage(1);
              setLoading(true);
              setError("");
              clearTimeout(searchTimer.current);
              searchTimer.current = setTimeout(
                () => setDebouncedSearch(value.trim()),
                400,
              );
            }}
            placeholder="Search items…"
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500"
          />
        </label>
        <label className="relative">
          <span className="sr-only">Filter by category</span>
          <SlidersHorizontal
            size={15}
            className="absolute left-3 top-3.5 text-gray-400"
          />
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
              setLoading(true);
              setError("");
            }}
            className="w-full appearance-none rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option value={c._id} key={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by status</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
              setLoading(true);
              setError("");
            }}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {pretty(s)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by condition</span>
          <select
            value={condition}
            onChange={(e) => {
              setCondition(e.target.value);
              setPage(1);
              setLoading(true);
              setError("");
            }}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">All conditions</option>
            {conditions.map((c) => (
              <option key={c} value={c}>
                {pretty(c)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {categoryError && (
        <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {categoryError}{" "}
          <Link to="/categories" className="font-semibold underline">
            Open categories
          </Link>
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold">
            Inventory{" "}
            <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {pagination.total ?? 0}
            </span>
          </h2>
          <button
            onClick={() => {
              setLoading(true);
              setError("");
              setReload((r) => r + 1);
            }}
            aria-label="Refresh inventory"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Loading scrap items…
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError("");
                setReload((r) => r + 1);
              }}
              className="mt-3 rounded-lg border px-4 py-2 text-sm font-semibold"
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <PackageSearch className="mx-auto text-gray-300" size={32} />
            <p className="mt-3 font-semibold">No scrap items found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try changing the filters or add an item to the inventory.
            </p>
            <button
              onClick={() => navigate("/scrap/new")}
              className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Add Scrap
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] text-left text-sm">
                <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                  <tr>
                    {[
                      "Name",
                      "Category",
                      "Quantity",
                      "Condition",
                      "Location",
                      "Status",
                      "Added by",
                      "Date",
                      "Actions",
                    ].map((x) => (
                      <th key={x} className="px-4 py-3 font-semibold">
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/70">
                      <td className="px-4 py-3.5 font-semibold text-gray-800">
                        {item.name}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">
                        {item.categoryId?.name || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-4 py-3.5 capitalize text-gray-600">
                        {item.condition}
                      </td>
                      <td className="max-w-40 truncate px-4 py-3.5 text-gray-600">
                        {item.location || "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${badge[item.status] || badge.disposed}`}
                        >
                          {pretty(item.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">
                        {item.addedBy?.name || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-gray-600">
                        {dateText(item.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            title="View"
                            aria-label={`View ${item.name}`}
                            onClick={() => navigate(`/scrap/${item._id}`)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                          >
                            <Eye size={16} />
                          </button>
                          {canEdit(item) && (
                            <button
                              title="Edit"
                              aria-label={`Edit ${item.name}`}
                              onClick={() =>
                                navigate(`/scrap/${item._id}/edit`)
                              }
                              className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                          {admin && item.status === "in_stock" && (
                            <button
                              title="Delete"
                              aria-label={`Delete ${item.name}`}
                              onClick={() => setDeleting(item)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pagination.page || page}
              totalPages={pagination.totalPages || 1}
              onPageChange={(next) => {
                setLoading(true);
                setError("");
                setPage(next);
              }}
            />
          </>
        )}
      </div>
      <ConfirmModal
        open={!!deleting}
        title="Delete scrap item?"
        message={`Delete “${deleting?.name}” from inventory? This action cannot be undone.`}
        confirmLabel="Delete item"
        loading={deleteBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </div>
  );
}
