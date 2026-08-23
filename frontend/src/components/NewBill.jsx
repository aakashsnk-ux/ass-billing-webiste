import React, { useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import { downloadBillPdf } from "../pdf.js";

function money(n) {
  return (Math.round((n || 0) * 100) / 100).toFixed(2);
}
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function emptyItem() {
  return { desc: "", qty: 1, rate: "", warranty: "" };
}

export default function NewBill({ prefillClient, clearPrefill, onSaved }) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [billNo, setBillNo] = useState("");
  const [date, setDate] = useState(todayStr());
  const [items, setItems] = useState([emptyItem()]);
  const [taxPercent, setTaxPercent] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const boxRef = useRef(null);

  async function handleDownloadPdf() {
    if (!activeBill || downloading) return;

    setDownloading(true);

    try {
      await downloadBillPdf(activeBill);
    } catch (e) {
      console.error("PDF download failed:", e);
      alert("PDF download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  useEffect(() => {
    api
      .getNextBillNo()
      .then((r) => setBillNo(r.billNo))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (prefillClient) {
      setClientName(prefillClient.name);
      setClientPhone(prefillClient.phone || "");
      setClientAddress(prefillClient.address || "");
      setSelectedClientId(prefillClient._id);
      clearPrefill();
    }
  }, [prefillClient]);

  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target))
        setShowSuggestions(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  async function onClientNameChange(v) {
    setClientName(v);
    setSelectedClientId(null);
    if (!v.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const results = await api.getClients(v.trim());
      setSuggestions(results.slice(0, 8));
      setShowSuggestions(true);
    } catch (e) {
      setSuggestions([]);
    }
  }

  function selectClient(c) {
    setClientName(c.name);
    setClientPhone(c.phone || "");
    setClientAddress(c.address || "");
    setSelectedClientId(c._id);
    setShowSuggestions(false);
  }

  function updateItem(idx, field, value) {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    );
  }
  function removeItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }
  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  const subtotal = items.reduce(
    (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.rate) || 0),
    0,
  );
  const tax = (subtotal * (Number(taxPercent) || 0)) / 100;
  const total = subtotal + tax;

  function resetForm(nextBillNo) {
    setClientName("");
    setClientPhone("");
    setClientAddress("");
    setSelectedClientId(null);
    setBillNo(nextBillNo || "");
    setDate(todayStr());
    setItems([emptyItem()]);
    setTaxPercent(0);
    setNotes("");
  }

  async function handleSave(downloadPdf) {
    if (!clientName.trim()) {
      alert("Customer Name Needed.");
      return;
    }
    const cleanItems = items
      .map((it) => ({
        desc: it.desc.trim(),
        qty: Number(it.qty) || 0,
        rate: Number(it.rate) || 0,
        warranty: String(it.warranty || "").trim(),
      }))
      .filter((it) => it.desc || it.qty || it.rate);
    if (cleanItems.length === 0) {
      alert("At least one item is required.");
      return;
    }

    setSaving(true);
    try {
      const bill = await api.createBill({
        clientId: selectedClientId,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientAddress: clientAddress.trim(),
        billNo,
        date,
        items: cleanItems,
        taxPercent: Number(taxPercent) || 0,
        notes: notes.trim(),
      });

      if (downloadPdf) await downloadBillPdf(bill);

      const next = await api.getNextBillNo().catch(() => ({ billNo: "" }));
      resetForm(next.billNo);
      onSaved();
      alert("Bill save" + (downloadPdf ? "Downloding." : "."));
    } catch (e) {
      alert(e.message || "Something Went Wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="font-semibold mb-1">Customer</h3>
        <div className="relative" ref={boxRef}>
          <label className="block text-xs text-black mt-2 mb-1">
            Customer name
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => onClientNameChange(e.target.value)}
            placeholder="Type to search or add new Customer"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-accent focus:bg-white"
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20">
              {suggestions.map((c) => (
                <div
                  key={c._id}
                  onClick={() => selectClient(c)}
                  className="px-3 py-2 text-sm border-b last:border-b-0 border-gray-100 active:bg-accent-soft cursor-pointer"
                >
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-ink-soft">{c.phone}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <label className="block text-xs text-black mt-2 mb-1">Phone</label>
        <input
          type="text"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          placeholder="Phone number"
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-accent focus:bg-white"
        />
        <label className="block text-xs text-black mt-2 mb-1">Address</label>
        <textarea
          value={clientAddress}
          onChange={(e) => setClientAddress(e.target.value)}
          placeholder="Address"
          className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm min-h-[54px] focus:outline-none focus:border-accent"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="font-semibold mb-1">Bill details</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-ink-soft mt-2 mb-1">
              Bill no.
            </label>
            <input
              type="text"
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-accent focus:bg-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-ink-soft mt-2 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-accent focus:bg-white"
            />
          </div>
        </div>
      </div>

      <p className="mt-5 px-3 mb-2 text-xs font-bold uppercase tracking-wider text-black">
        Items
      </p>

      <div className="space-y-3">
        {items.map((it, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-300 bg-white p-3 sm:p-4"
          >
            {/* Item top */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                Item {idx + 1}
              </span>

              <button
                type="button"
                onClick={() =>
                  setItems((prev) => prev.filter((_, i) => i !== idx))
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-red-500 transition hover:bg-red-50"
                title="Remove item"
              >
                ×
              </button>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-black">
                Description
              </label>

              <textarea
                rows={1}
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
                value={it.desc}
                onChange={(e) => updateItem(idx, "desc", e.target.value)}
                placeholder="Enter item description..."
              />
            </div>

            {/* Qty / Rate / Warranty */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {/* Qty */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-black">
                  Qty
                </label>

                <input
                  type="number"
                  min="0"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-sm outline-none transition focus:border-accent"
                  value={it.qty}
                  onChange={(e) => updateItem(idx, "qty", e.target.value)}
                />
              </div>

              {/* Rate */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-black">
                  Rate
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-sm outline-none transition focus:border-accent"
                  value={it.rate}
                  onChange={(e) => updateItem(idx, "rate", e.target.value)}
                />
              </div>

              {/* Warranty */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-black">
                  Warranty
                </label>

                <input
                  type="text"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-sm outline-none transition focus:border-accent"
                  value={it.warranty}
                  onChange={(e) => updateItem(idx, "warranty", e.target.value)}
                  placeholder="1Y / 30D"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="mt-3 flex items-center justify-between rounded-xl bg-white px-3 py-2.5">
              <span className="text-xs text-black">Item amount</span>

              <span className="text-sm font-semibold text-black">
                ₹ {money((Number(it.qty) || 0) * (Number(it.rate) || 0))}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add item */}
      <button
        type="button"
        onClick={() =>
          setItems((prev) => [
            ...prev,
            {
              desc: "",
              qty: 1,
              rate: "",
              warranty: "",
            },
          ])
        }
        className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm font-medium text-black mb-2 transition hover:bg-slate-100"
      >
        + Add item
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <label className="block text-xs text-ink-soft mb-1">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Payment terms, thank you note, etc."
          className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm min-h-[54px] focus:outline-none focus:border-accent"
        />
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="flex-1 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Generating PDF...
            </span>
          ) : (
            "Save and download PDF"
          )}
        </button>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          disabled={saving}
          onClick={() => handleSave(false)}
          className="flex-1 border border-blue-200 bg-blue-100 rounded-lg py-2.5 text-sm disabled:opacity-50"
        >
          Save only
        </button>
        <button
          onClick={() => resetForm(billNo)}
          className="flex-1 border border-red-200 bg-red-100 rounded-lg py-2.5 text-sm"
        >
          Clear form
        </button>
      </div>
    </div>
  );
}
