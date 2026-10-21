import { useEffect, useState } from "react";
import { Boxes, Coins, TrendingUp, ShoppingBag, RefreshCw } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../api/axios";
import StatCard from "../components/StatCard";
const colors = [
  "#059669",
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#14b8a6",
  "#f43f5e",
  "#64748b",
];
const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const refresh = () => {
    setLoading(true);
    setError("");
    setReload((r) => r + 1);
  };
  useEffect(() => {
    let active = true;
    api
      .get("/dashboard/stats")
      .then(({ data }) => {
        if (active) setStats(data.data);
      })
      .catch((e) => {
        if (active)
          setError(
            e.response?.data?.message || "Could not load dashboard statistics.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reload]);
  const categories = stats?.itemsByCategory || [];
  const months = stats?.revenueByMonth || [];
  const hasRevenue = months.some((m) => Number(m.revenue) > 0);
  if (loading)
    return (
      <div className="rounded-2xl border bg-white p-12 text-center text-sm text-gray-500">
        Loading dashboard…
      </div>
    );
  if (error)
    return (
      <div className="rounded-2xl border bg-white p-12 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={refresh}
          className="mt-4 rounded-lg border px-4 py-2 text-sm font-semibold"
        >
          Try again
        </button>
      </div>
    );
  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-700">Overview</p>
          <h1 className="mt-1 text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            A snapshot of your organisation’s materials and recovery.
          </p>
        </div>
        <button
          onClick={refresh}
          aria-label="Refresh dashboard"
          className="rounded-lg border bg-white p-2.5 text-gray-500 hover:bg-gray-50"
        >
          <RefreshCw size={17} />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Items in stock"
          value={Number(stats?.itemsInStock || 0).toLocaleString("en-IN")}
          icon={Boxes}
        />
        <StatCard
          title="Stock value"
          value={money(stats?.totalStockValue)}
          detail="Estimated value of in-stock items"
          icon={Coins}
          tone="blue"
        />
        <StatCard
          title="Total revenue"
          value={money(stats?.totalRevenue)}
          detail="Revenue from recorded sales"
          icon={TrendingUp}
          tone="teal"
        />
        <StatCard
          title="Sold this month"
          value={Number(stats?.soldThisMonth || 0).toLocaleString("en-IN")}
          detail="Items sold this month"
          icon={ShoppingBag}
          tone="violet"
        />
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div>
            <h2 className="font-semibold">Items by category</h2>
            <p className="mt-1 text-sm text-gray-500">
              In-stock items across your categories.
            </p>
          </div>
          {categories.length === 0 ? (
            <div className="grid min-h-64 place-items-center text-center">
              <p className="text-sm text-gray-500">
                No category inventory data yet.
              </p>
            </div>
          ) : (
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={92}
                    innerRadius={48}
                    paddingAngle={2}
                  >
                    {categories.map((entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      Number(value).toLocaleString("en-IN"),
                      name,
                    ]}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div>
            <h2 className="font-semibold">Revenue by month</h2>
            <p className="mt-1 text-sm text-gray-500">
              Sales revenue over the last six months.
            </p>
          </div>
          {months.length === 0 || !hasRevenue ? (
            <div className="grid min-h-64 place-items-center text-center">
              <p className="text-sm text-gray-500">No revenue data yet.</p>
            </div>
          ) : (
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={months}
                  margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis
                    tickFormatter={(v) =>
                      `₹${Number(v).toLocaleString("en-IN")}`
                    }
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    width={78}
                  />
                  <Tooltip
                    formatter={(value) => [money(value), "Revenue"]}
                    contentStyle={{ borderRadius: 12, borderColor: "#e5e7eb" }}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#059669"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
