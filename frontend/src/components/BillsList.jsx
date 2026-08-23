import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { downloadBillPdf } from "../pdf.js";
import EditBill from "./EditBill.jsx";

function money(n) {
  return (Math.round((n || 0) * 100) / 100).toFixed(2);
}

export default function BillsList({ refreshKey }) {
  const [bills, setBills] = useState([]);
  const [query, setQuery] = useState("");
  const [activeBill, setActiveBill] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
  if (downloading) return;

  setDownloading(true);

  try {
    await downloadBillPdf(activeBill);
  } catch (e) {
    alert(e.message || "Failed to download PDF.");
  } finally {
    setDownloading(false);
  }
}

  async function load(q) {
    setLoading(true);

    try {
      const results = await api.getBills(q);
      setBills(results);
    } catch (e) {
      setBills([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(query);
  }, [refreshKey]);

  useEffect(() => {
    const t = setTimeout(() => load(query), 250);

    return () => clearTimeout(t);
  }, [query]);

  async function handleDelete(id) {
    if (!confirm("You Want to delete this bill?")) return;

    await api.deleteBill(id);
setActiveBill(null);

setBills((prev) =>
  prev.filter((b) => b._id !== id)
);
  }

  return (
    <div className="space-y-4">
      {/* Page heading */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Your Bills
        </h2>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            ⌕
          </span>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Customer or bill number..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-accent focus:bg-white"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white py-14 text-center shadow-sm">
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-accent" />
            <p className="text-sm text-slate-500">
              Loading bills...
            </p>
          </div>
        )}

        {!loading && bills.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
              ▤
            </div>

            <h3 className="font-semibold">
              No bills found
            </h3>

          </div>
        )}

        {!loading &&
          bills.map((b) => (
            <button
              key={b._id}
              type="button"
              onClick={() => setActiveBill(b)}
              className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition active:scale-[0.99] hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft font-bold text-accent">
                  {(b.clientName || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {b.clientName}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {b.billNo} · {b.date}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-slate-900">
                  ₹ {money(b.total)}
                </p>

                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  View →
                </p>
              </div>
            </button>
          ))}
      </div>

      {/* Bill detail modal */}
      {activeBill && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-5"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setActiveBill(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-[26px] bg-white shadow-2xl sm:rounded-[26px]">
            {/* Handle */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-slate-300" />
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                    Invoice
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    {activeBill.billNo}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {activeBill.date}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveBill(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-500 transition hover:bg-slate-200"
                >
                  ×
                </button>
              </div>

              {/* Client */}
              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Client
                </p>

                <p className="mt-1 font-bold">
                  {activeBill.clientName}
                </p>

                {activeBill.clientPhone && (
                  <p className="mt-1 text-sm text-slate-500">
                    {activeBill.clientPhone}
                  </p>
                )}
              </div>

              {/* Items */}
              <div className="mt-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Items
                </p>

                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
                  {activeBill.items.map((it, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-4 p-3.5"
                    >
                      <div className="min-w-0 flex-1">
  <p className="text-sm font-medium break-words">
    {it.desc}
  </p>

  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
    <span>
      {it.qty} × ₹ {money(it.rate)}
    </span>

    {it.warranty && (
      <span className="font-medium text-accent">
        Warranty: {it.warranty}
      </span>
    )}
  </div>
</div>

                      <p className="shrink-0 text-sm font-semibold">
                        ₹ {money(it.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex justify-between py-1 text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>₹ {money(activeBill.subtotal)}</span>
                </div>

                {/*   */}

                <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-lg font-bold">
                  <span>Total</span>
                  <span>₹ {money(activeBill.total)}</span>
                </div>
              </div>

              {activeBill.notes && (
                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Notes
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {activeBill.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
  type="button"
  disabled={downloading}
  onClick={handleDownload}
  className="h-12 rounded-xl bg-accent px-4 font-bold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
>
  {downloading ? (
    <span className="flex items-center justify-center gap-2">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      Generating PDF...
    </span>
  ) : (
    "Download PDF"
  )}
</button>

                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="h-12 rounded-xl border border-slate-200 px-4 font-semibold text-slate-700 transition active:scale-[0.98]"
                >
                  Edit Bill
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(activeBill._id)}
                  className="h-12 rounded-xl border border-red-200 bg-red-50 px-4 font-semibold text-red-600 transition active:scale-[0.98]"
                >
                  Delete Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editing && activeBill && (
        <EditBill
          bill={activeBill}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
  setEditing(false);
  setActiveBill(updated);

  setBills((prev) =>
    prev.map((b) => (b._id === updated._id ? updated : b))
  );
}}
        />
      )}
    </div>
  );
}