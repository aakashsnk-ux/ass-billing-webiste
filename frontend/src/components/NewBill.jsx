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
  return { desc: "", qty: 1, rate: "" };
}

export default function NewBill({ prefillClient, clearPrefill, onSaved }) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [billNo, setBillNo] = useState("");
  const [date, setDate] = useState(todayStr());
  const [items, setItems] = useState([emptyItem()]);
  const [taxPercent, setTaxPercent] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const boxRef = useRef(null);

  useEffect(() => {
    api.getNextBillNo().then((r) => setBillNo(r.billNo)).catch(() => {});
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
      if (boxRef.current && !boxRef.current.contains(e.target)) setShowSuggestions(false);
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
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }
  function removeItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }
  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  const subtotal = items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0);
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
      alert("Client name daaliye.");
      return;
    }
    const cleanItems = items
      .map((it) => ({ desc: it.desc.trim(), qty: Number(it.qty) || 0, rate: Number(it.rate) || 0 }))
      .filter((it) => it.desc || it.qty || it.rate);
    if (cleanItems.length === 0) {
      alert("Kam se kam ek item add kariye.");
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
      alert("Bill save ho gaya" + (downloadPdf ? " aur download ho raha hai." : "."));
    } catch (e) {
      alert(e.message || "Kuch galat ho gaya.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="font-semibold mb-1">Client</h3>
        <div className="relative" ref={boxRef}>
          <label className="block text-xs text-ink-soft mt-2 mb-1">Client name</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => onClientNameChange(e.target.value)}
            placeholder="Type to search or add new client"
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
        <label className="block text-xs text-ink-soft mt-2 mb-1">Phone</label>
        <input
          type="text"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          placeholder="Phone number"
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-accent focus:bg-white"
        />
        <label className="block text-xs text-ink-soft mt-2 mb-1">Address</label>
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
            <label className="block text-xs text-ink-soft mt-2 mb-1">Bill no.</label>
            <input
              type="text"
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-accent focus:bg-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-ink-soft mt-2 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-accent focus:bg-white"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="font-semibold mb-2">Items</h3>
        <div className="grid grid-cols-[minmax(0,1fr)_42px_60px_68px_20px] gap-1.5 mb-1">
          <span className="text-[11px] text-ink-soft">Description</span>
          <span className="text-[11px] text-ink-soft">Qty</span>
          <span className="text-[11px] text-ink-soft">Rate</span>
          <span className="text-[11px] text-ink-soft text-right">Amount</span>
          <span></span>
        </div>
        {items.map((it, idx) => (
          <div
  key={idx}
  className="grid grid-cols-[minmax(0,1fr)_42px_60px_68px_20px] gap-1.5 items-center mb-1.5"
>
            <input
              type="text"
              value={it.desc}
              onChange={(e) => updateItem(idx, "desc", e.target.value)}
              placeholder="Item / service"
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-[13px] focus:outline-none focus:border-accent"
            />
            <input
              type="number"
              value={it.qty}
              onChange={(e) => updateItem(idx, "qty", e.target.value)}
              min="0"
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-[13px] focus:outline-none focus:border-accent"
            />
            <input
              type="number"
              value={it.rate}
              onChange={(e) => updateItem(idx, "rate", e.target.value)}
              min="0"
              step="0.01"
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-[13px] focus:outline-none focus:border-accent"
            />
            <span className="text-[13px] text-ink-soft text-right pr-0.5">
              {money((Number(it.qty) || 0) * (Number(it.rate) || 0))}
            </span>
            <button
              type="button"
              onClick={() => removeItem(idx)}
              aria-label="Remove item"
              className="text-red-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="mt-1.5 border border-gray-200 rounded-lg px-3.5 py-2 text-sm"
        >
          + Add item
        </button>

        <div className="border-t border-dashed border-gray-200 mt-2.5 pt-2.5">
          <div className="flex justify-between text-sm py-0.5">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm py-0.5">
            <span>Tax (%)</span>
            <input
              type="number"
              value={taxPercent}
              onChange={(e) => setTaxPercent(e.target.value)}
              className="w-[70px] border border-gray-200 rounded-lg px-1.5 py-1 text-right text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex justify-between text-[17px] font-bold border-t border-gray-200 mt-1.5 pt-2">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <label className="block text-xs text-ink-soft mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Payment terms, thank you note, etc."
          className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm min-h-[54px] focus:outline-none focus:border-accent"
        />
      </div>

      <div className="flex gap-2 mt-3">
        <button
          disabled={saving}
          onClick={() => handleSave(true)}
          className="flex-1 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save and download PDF
        </button>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          disabled={saving}
          onClick={() => handleSave(false)}
          className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm disabled:opacity-50"
        >
          Save only
        </button>
        <button
          onClick={() => resetForm(billNo)}
          className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm"
        >
          Clear form
        </button>
      </div>
    </div>
  );
}
