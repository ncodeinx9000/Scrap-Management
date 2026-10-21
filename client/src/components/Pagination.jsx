export default function Pagination({ page, totalPages, onPageChange }) {
  const total = Math.max(1, totalPages || 1);
  return (
    <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        Page <span className="font-semibold text-gray-700">{page}</span> of{" "}
        <span className="font-semibold text-gray-700">{total}</span>
      </p>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          disabled={page >= total}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
