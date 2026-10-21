export default function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "emerald",
}) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    teal: "bg-teal-50 text-teal-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
          {detail && <p className="mt-1 text-xs text-gray-500">{detail}</p>}
        </div>
        {Icon && (
          <span className={`rounded-xl p-3 ${colors[tone] || colors.emerald}`}>
            <Icon size={19} />
          </span>
        )}
      </div>
    </article>
  );
}
