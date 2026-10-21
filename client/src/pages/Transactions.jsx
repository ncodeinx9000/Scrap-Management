import { useEffect, useState } from "react";
import { RefreshCw, ReceiptText } from "lucide-react";
import api from "../api/axios";
import Pagination from "../components/Pagination";
const types = ["sold", "recycled", "donated", "disposed"];
const colors = {
  sold: "bg-blue-50 text-blue-700",
  recycled: "bg-teal-50 text-teal-700",
  donated: "bg-purple-50 text-purple-700",
  disposed: "bg-gray-100 text-gray-600",
};
const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
export default function Transactions() {
  const [rows, setRows] = useState([]);
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    const params = { type, page, limit: 10 };
    if (from) params.from = from;
    if (to) params.to = new Date(`${to}T23:59:59.999`).toISOString();
    api
      .get("/transactions", { params })
      .then(({ data }) => {
        if (!active) return;
        setRows(Array.isArray(data.data) ? data.data : []);
        setPagination(data.pagination || { page, totalPages: 1, total: 0 });
      })
      .catch((e) => {
        if (active) {
          setRows([]);
          setError(e.response?.data?.message || "Could not load transactions.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [type, from, to, page, reload]);
  const changeFilter = (setter, value) => {
    setLoading(true);
    setError("");
    setter(value);
    setPage(1);
  };
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-700">Activity</p>
          <h1 className="mt-1 text-2xl font-bold">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review recorded sales, recycling, donations, and disposals.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            setError("");
            setReload((r) => r + 1);
          }}
          aria-label="Refresh transactions"
          className="rounded-lg border bg-white p-2.5 text-gray-500 hover:bg-gray-50"
        >
          <RefreshCw size={17} />
        </button>
      </div>
      <div className="mb-4 grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs font-semibold text-gray-500">
          Type
          <select
            value={type}
            onChange={(e) => changeFilter(setType, e.target.value)}
            className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal text-gray-800 outline-none focus:border-emerald-500"
          >
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-gray-500">
          From date
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => changeFilter(setFrom, e.target.value)}
            className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal text-gray-800 outline-none focus:border-emerald-500"
          />
        </label>
        <label className="text-xs font-semibold text-gray-500">
          To date
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => changeFilter(setTo, e.target.value)}
            className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal text-gray-800 outline-none focus:border-emerald-500"
          />
        </label>
        <div className="flex items-end">
          <button
            onClick={() => {
              setLoading(true);
              setError("");
              setType("");
              setFrom("");
              setTo("");
              setPage(1);
              setReload((r) => r + 1);
            }}
            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            Clear filters
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold">
            Transaction history{" "}
            <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {pagination.total ?? 0}
            </span>
          </h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Loading transactions…
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
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <ReceiptText className="mx-auto text-gray-300" size={32} />
            <p className="mt-3 font-semibold">No transactions found</p>
            <p className="mt-1 text-sm text-gray-500">
              Transactions will appear here when an item is sold, recycled,
              donated, or disposed.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                  <tr>
                    {[
                      "Item",
                      "Type",
                      "Buyer",
                      "Amount received",
                      "Date",
                      "Performed by",
                      "Notes",
                    ].map((x) => (
                      <th key={x} className="px-4 py-3 font-semibold">
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50/70">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-800">
                          {tx.scrapItemId?.name || "—"}
                        </p>
                        {tx.scrapItemId && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            {tx.scrapItemId.quantity} {tx.scrapItemId.unit}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${colors[tx.type] || "bg-gray-100 text-gray-600"}`}
                        >
                          {tx.type || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">
                        {tx.buyerName || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-gray-800">
                        {money(tx.amountReceived)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-gray-600">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">
                        {tx.performedBy?.name || "—"}
                      </td>
                      <td
                        className="max-w-56 truncate px-4 py-3.5 text-gray-600"
                        title={tx.notes || ""}
                      >
                        {tx.notes || "—"}
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
    </div>
  );
}
