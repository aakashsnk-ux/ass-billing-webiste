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
    (bill.items || []).map((it) => ({
      desc: it.desc || "",
      qty: it.qty ?? 1,
      rate: it.rate ?? "",
      warranty: it.warranty || "",
    }))
  );

  const [taxPercent, setTaxPercent] = useState(bill.taxPercent || 0);
  const [notes, setNotes] = useState(bill.notes || "");
  const [saving, setSaving] = useState(false);

  const subtotal = items.reduce(
    (sum, it) =>
      sum + (Number(it.qty) || 0) * (Number(it.rate) || 0),
    0
  );

  const total =
    subtotal + (subtotal * (Number(taxPercent) || 0)) / 100;

  function updateItem(idx, field, value) {
    setItems((prev) =>
      prev.map((it, i) =>
        i === idx ? { ...it, [field]: value } : it
      )
    );
  }

  async function handleSave() {
    if (!clientName.trim()) {
      return alert("Please Enter Customer name.");
    }

    const cleanItems = items
      .map((it) => ({
        desc: String(it.desc || "").trim(),
        qty: Number(it.qty) || 0,
        rate: Number(it.rate) || 0,
        warranty: String(it.warranty || "").trim(),
      }))
      .filter(
        (it) =>
          it.desc ||
          it.qty ||
          it.rate ||
          it.warranty
      );

    if (cleanItems.length === 0) {
      return alert("At least one item is required.");
    }

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
      onClick={(e) =>
        e.target === e.currentTarget && onClose()
      }
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

        <label className="mt-4 mb-1 block text-xs text-slate-500">
          Client name
        </label>

        <input
          className={input}
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />

        <label className="mt-3 mb-1 block text-xs text-slate-500">
          Phone
        </label>

        <input
          className={input}
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
        />

        <label className="mt-3 mb-1 block text-xs text-slate-500">
          Address
        </label>

        <textarea
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-accent focus:bg-white"
          value={clientAddress}
          onChange={(e) => setClientAddress(e.target.value)}
        />

        <div className="mt-3 flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-slate-500">
              Bill no.
            </label>

            <input
              className={input}
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
            />
          </div>

          <div className="flex-1">
            <label className="mb-1 block text-xs text-slate-500">
              Date
            </label>

            <input
              type="date"
              className={input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <p className="mt-5 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
  Items
</p>

{/* Desktop Header */}
<div className="mb-1 hidden sm:grid sm:grid-cols-[minmax(0,1fr)_42px_58px_75px_68px_20px] items-center gap-1.5">
  <span className="text-[11px] text-slate-400">Description</span>
  <span className="text-[11px] text-slate-400">Qty</span>
  <span className="text-[11px] text-slate-400">Rate</span>
  <span className="text-[11px] text-slate-400">Warranty</span>
  <span className="text-right text-[11px] text-slate-400">Amount</span>
  <span></span>
</div>

        {items.map((it, idx) => (
  <div key={idx}>
    
    {/* ================= MOBILE ================= */}
    <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:hidden">

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-[11px] font-medium text-slate-500">
          Description
        </label>

        <textarea
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-5 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
          value={it.desc}
          onChange={(e) =>
            updateItem(idx, "desc", e.target.value)
          }
          placeholder="Enter item description..."
        />
      </div>

      {/* Qty / Rate / Warranty */}
      <div className="mt-2.5 grid grid-cols-3 gap-2">

        {/* Qty */}
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-slate-500">
            Qty
          </label>

          <input
            type="number"
            min="0"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
            value={it.qty}
            onChange={(e) =>
              updateItem(idx, "qty", e.target.value)
            }
          />
        </div>

        {/* Rate */}
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-slate-500">
            Rate
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
            value={it.rate}
            onChange={(e) =>
              updateItem(idx, "rate", e.target.value)
            }
          />
        </div>

        {/* Warranty */}
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-slate-500">
            Warranty
          </label>

          <input
            type="text"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
            value={it.warranty}
            onChange={(e) =>
              updateItem(idx, "warranty", e.target.value)
            }
            placeholder="1Y"
          />
        </div>

      </div>

      {/* Amount + Remove */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2.5">

        <div>
          <span className="text-[11px] text-slate-400">
            Amount
          </span>

          <div className="text-sm font-semibold text-slate-700">
            ₹{" "}
            {money(
              (Number(it.qty) || 0) *
                (Number(it.rate) || 0)
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setItems((prev) =>
              prev.filter((_, i) => i !== idx)
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-lg leading-none text-red-600 transition active:scale-95"
        >
          ×
        </button>

      </div>
    </div>


    {/* ================= DESKTOP ================= */}
    <div className="mb-1.5 hidden sm:grid sm:grid-cols-[minmax(0,1fr)_42px_58px_75px_68px_20px] items-center gap-1.5">

      {/* Description */}
      <input
        className="min-w-0 rounded-lg border border-slate-200 px-2 py-1.5 text-[13px] outline-none focus:border-accent"
        value={it.desc}
        onChange={(e) =>
          updateItem(idx, "desc", e.target.value)
        }
        placeholder="Item"
      />

      {/* Qty */}
      <input
        type="number"
        min="0"
        className="rounded-lg border border-slate-200 px-2 py-1.5 text-[13px] outline-none focus:border-accent"
        value={it.qty}
        onChange={(e) =>
          updateItem(idx, "qty", e.target.value)
        }
      />

      {/* Rate */}
      <input
        type="number"
        min="0"
        step="0.01"
        className="rounded-lg border border-slate-200 px-2 py-1.5 text-[13px] outline-none focus:border-accent"
        value={it.rate}
        onChange={(e) =>
          updateItem(idx, "rate", e.target.value)
        }
      />

      {/* Warranty */}
      <input
        type="text"
        className="rounded-lg border border-slate-200 px-2 py-1.5 text-[13px] outline-none focus:border-accent"
        value={it.warranty}
        onChange={(e) =>
          updateItem(idx, "warranty", e.target.value)
        }
        placeholder="e.g. 1Y"
      />

      {/* Amount */}
      <span className="pr-0.5 text-right text-[13px] text-slate-500">
        {money(
          (Number(it.qty) || 0) *
            (Number(it.rate) || 0)
        )}
      </span>

      {/* Remove */}
      <button
        type="button"
        onClick={() =>
          setItems((prev) =>
            prev.filter((_, i) => i !== idx)
          )
        }
        className="text-lg leading-none text-red-600"
      >
        ×
      </button>

    </div>
  </div>
))}

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
  className="mt-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium transition active:scale-[0.98]"
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

        <label className="mt-4 mb-1 block text-xs text-slate-500">
          Notes
        </label>

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