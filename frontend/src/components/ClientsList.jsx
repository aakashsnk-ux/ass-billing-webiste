import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function ClientsList({ refreshKey, onUseClient }) {
  const [clients, setClients] = useState([]);
  const [bills, setBills] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(q) {
    setLoading(true);

    try {
      const [c, b] = await Promise.all([
        api.getClients(q),
        api.getBills(),
      ]);

      setClients(c);
      setBills(b);
    } catch (e) {
      setClients([]);
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

  function billCountFor(clientId) {
    return bills.filter(
      (b) => b.client === clientId
    ).length;
  }

  return (
    <div className="space-y-4">
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Clients
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Select a client to create a new bill
        </p>
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
            placeholder="Search clients..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-accent focus:bg-white"
          />
        </div>
      </div>

      {/* Clients */}
      <div className="space-y-2.5">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white py-14 text-center shadow-sm">
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-accent" />

            <p className="text-sm text-slate-500">
              Loading clients...
            </p>
          </div>
        )}

        {!loading && clients.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
              ◍
            </div>

            <h3 className="font-semibold">
              No clients found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Koi client save nahi hai.
            </p>
          </div>
        )}

        {!loading &&
          clients.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => onUseClient(c)}
              className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition active:scale-[0.99] hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft font-bold text-accent">
                  {(c.name || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    {c.name}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {c.phone || "No phone number"}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span className="inline-flex rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold text-accent">
                  {billCountFor(c._id)}{" "}
                  {billCountFor(c._id) === 1
                    ? "bill"
                    : "bills"}
                </span>

                <p className="mt-1 text-[11px] text-slate-400">
                  Use →
                </p>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}