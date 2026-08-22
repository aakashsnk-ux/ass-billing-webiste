import React, { useState } from "react";
import { api } from "../api.js";

function money(n) {
  return (Math.round((n || 0) * 100) / 100).toFixed(2);
}

export default function EditBill({ bill, onClose, onSaved }) {
  const [clientName, setClientName] = useState(bill.clientName || "");
  const [clientPhone, setClientPhone] = useState(bill.clientPhone || "");
  const [clientAddress, setClientAddress] = useState(bill.clientAddress || "");
  const [billNo, setBillNo] = useState(bill.billNo || "");
  const [date, setDate] = useState(bill.date || "");
  const [items, setItems] = useState(
    (bill.items || []).map((it) => ({ desc: it.desc, qty: it.qty, rate: it.rate }))
  );
  const [taxPercent, setTaxPercent] = useState(bill.taxPercent || 0);
  const [notes, setNotes] = useState(bill.notes || "");
  const [saving, setSaving] = useState(false);

  const subtotal = items.reduce(
    (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.rate) || 0),
    0
  );
  const total = subtotal + (subtotal * (Number(taxPercent) || 0)) / 100;

  function updateItem(idx, field, value) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }

  async function handleSave() {
    if (!clientName.trim()) return alert("Please Enter Customer name.");
    const cleanItems = items
      .map((it) => ({ desc: String(it.desc || "").trim(), qty: Number(it.qty) || 0, rate: Number(it.rate) || 0 }))
      .filter((it) => it.desc || it.qty || it.rate);
    if (cleanItems.length === 0) return alert("At least one item is required.");

    setSaving(true);
    try {
      const updated = await api.updateBill(bill._id, {
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientAddress: clientAddress.trim(),
        billNo,
        date,
        items: cleanItems,
        taxPercent: Number(taxPercent) || 0,
        notes: notes.trim(),
      });
      onSaved(updated);
      alert("Bill updated.");
    } catch (e) {
      alert(e.message || "Not Update.");
    } finally {
      setSaving(false);
    }
  }

  const input =
    "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-accent focus:bg-white";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/50 sm:items-center sm:p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[26px] bg-white p-5 shadow-2xl sm:rounded-[26px] sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Edit bill</h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-500"
          >
            ×
          </button>
        </div>

        <label className="mt-4 mb-1 block text-xs text-slate-500">Client name</label>
        <input className={input} value={clientName} onChange={(e) => setClientName(e.target.value)} />

        <label className="mt-3 mb-1 block text-xs text-slate-500">Phone</label>
        <input className={input} value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />

        <label className="mt-3 mb-1 block text-xs text-slate-500">Address</label>
        <textarea
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-accent focus:bg-white"
          value={clientAddress}
          onChange={(e) => setClientAddress(e.target.value)}
        />

        <div className="mt-3 flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-slate-500">Bill no.</label>
            <input className={input} value={billNo} onChange={(e) => setBillNo(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-slate-500">Date</label>
            <input type="date" className={input} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <p className="mt-5 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Items</p>
        {items.map((it, idx) => (
          <div key={idx} className="mb-1.5 grid grid-cols-[minmax(0,1fr)_46px_64px_70px_20px] items-center gap-1.5">
            <input
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-[13px] outline-none focus:border-accent"
              value={it.desc}
              onChange={(e) => updateItem(idx, "desc", e.target.value)}
            />
            <input
              type="number"
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-[13px] outline-none focus:border-accent"
              value={it.qty}
              onChange={(e) => updateItem(idx, "qty", e.target.value)}
            />
            <input
              type="number"
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-[13px] outline-none focus:border-accent"
              value={it.rate}
              onChange={(e) => updateItem(idx, "rate", e.target.value)}
            />
            <span className="pr-0.5 text-right text-[13px] text-slate-500">
              {money((Number(it.qty) || 0) * (Number(it.rate) || 0))}
            </span>
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
              className="text-lg leading-none text-red-600"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, { desc: "", qty: 1, rate: "" }])}
          className="mt-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm"
        >
          + Add item
        </button>

        <div className="mt-3 border-t border-dashed border-slate-200 pt-2.5">
          <div className="flex justify-between py-0.5 text-sm">
            <span>Subtotal</span>
            <span>₹ {money(subtotal)}</span>
          </div>
          <div className="mt-1.5 flex justify-between border-t border-slate-200 pt-2 text-[17px] font-bold">
            <span>Total</span>
            <span>₹ {money(total)}</span>
          </div>
        </div>

        <label className="mt-4 mb-1 block text-xs text-slate-500">Notes</label>
        <textarea
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-accent focus:bg-white"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button
          disabled={saving}
          onClick={handleSave}
          className="mt-4 h-12 w-full rounded-xl bg-accent font-bold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
