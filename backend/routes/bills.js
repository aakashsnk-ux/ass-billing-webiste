import { Router } from "express";
import Bill from "../models/Bill.js";
import Client from "../models/Client.js";

const router = Router();

// GET /api/bills?q=search
router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim();
  const filter = q
    ? { $or: [{ clientName: { $regex: q, $options: "i" } }, { billNo: { $regex: q, $options: "i" } }] }
    : {};
  const bills = await Bill.find(filter).sort({ createdAt: -1 });
  res.json(bills);
});

// GET /api/bills/next-number
router.get("/next-number", async (req, res) => {
  const count = await Bill.countDocuments();
  res.json({ billNo: "INV-" + String(count + 1).padStart(4, "0") });
});

// POST /api/bills
router.post("/", async (req, res) => {
  const { clientId, clientName, clientPhone, clientAddress, billNo, date, items, taxPercent, notes } = req.body;

  if (!clientName || !clientName.trim()) return res.status(400).json({ error: "Client name is required" });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "At least one item is required" });

  let client;
  if (clientId) {
    client = await Client.findById(clientId);
  }
  if (!client) {
    client = await Client.findOne({ name: { $regex: `^${clientName.trim()}$`, $options: "i" } });
  }
  if (client) {
    client.phone = clientPhone || client.phone;
    client.address = clientAddress || client.address;
    await client.save();
  } else {
    client = await Client.create({ name: clientName.trim(), phone: clientPhone || "", address: clientAddress || "" });
  }

  const cleanItems = items.map((it) => {
  const qty = Number(it.qty) || 0;
  const rate = Number(it.rate) || 0;
  const warranty = String(it.warranty || "").trim();

  return {
    desc: String(it.desc || ""),
    qty,
    rate,
    warranty,
    amount: qty * rate,
  };
});
  const subtotal = cleanItems.reduce((sum, it) => sum + it.amount, 0);
  const taxPct = Number(taxPercent) || 0;
  const tax = (subtotal * taxPct) / 100;
  const total = subtotal + tax;

  const bill = await Bill.create({
    billNo: billNo || "INV-0001",
    date: date || new Date().toISOString().slice(0, 10),
    client: client._id,
    clientName: client.name,
    clientPhone: client.phone,
    clientAddress: client.address,
    items: cleanItems,
    subtotal,
    taxPercent: taxPct,
    tax,
    total,
    notes: notes || "",
  });

  res.status(201).json(bill);
});

// PUT /api/bills/:id  -> bill me kuch bhi edit karo
router.put("/:id", async (req, res) => {
  const { clientName, clientPhone, clientAddress, billNo, date, items, taxPercent, notes } = req.body;

  const bill = await Bill.findById(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  if (!clientName || !clientName.trim()) return res.status(400).json({ error: "Client name is required" });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "At least one item is required" });

  const cleanItems = items.map((it) => {
  const qty = Number(it.qty) || 0;
  const rate = Number(it.rate) || 0;
  const warranty = String(it.warranty || "").trim();

  return {
    desc: String(it.desc || ""),
    qty,
    rate,
    warranty,
    amount: qty * rate,
  };
});
  const subtotal = cleanItems.reduce((sum, it) => sum + it.amount, 0);
  const taxPct = Number(taxPercent) || 0;
  const tax = (subtotal * taxPct) / 100;

  bill.billNo = billNo || bill.billNo;
  bill.date = date || bill.date;
  bill.clientName = clientName.trim();
  bill.clientPhone = clientPhone || "";
  bill.clientAddress = clientAddress || "";
  bill.items = cleanItems;
  bill.subtotal = subtotal;
  bill.taxPercent = taxPct;
  bill.tax = tax;
  bill.total = subtotal + tax;
  bill.notes = notes || "";

  await bill.save();
  res.json(bill);
});

// DELETE /api/bills/:id
router.delete("/:id", async (req, res) => {
  const bill = await Bill.findByIdAndDelete(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });
  res.json({ ok: true });
});

export default router;
