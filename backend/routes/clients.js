import { Router } from "express";
import Client from "../models/Client.js";

const router = Router();

// GET /api/clients?q=search
router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim();
  const filter = q ? { name: { $regex: q, $options: "i" } } : {};
  const clients = await Client.find(filter).sort({ name: 1 });
  res.json(clients);
});

// POST /api/clients
router.post("/", async (req, res) => {
  const { name, phone, address } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "Client name is required" });

  const existing = await Client.findOne({ name: { $regex: `^${name.trim()}$`, $options: "i" } });
  if (existing) {
    existing.phone = phone || existing.phone;
    existing.address = address || existing.address;
    await existing.save();
    return res.json(existing);
  }

  const client = await Client.create({ name: name.trim(), phone: phone || "", address: address || "" });
  res.status(201).json(client);
});

// PUT /api/clients/:id
router.put("/:id", async (req, res) => {
  const { name, phone, address } = req.body;
  const client = await Client.findByIdAndUpdate(
    req.params.id,
    { name, phone, address },
    { new: true, runValidators: true }
  );
  if (!client) return res.status(404).json({ error: "Client not found" });
  res.json(client);
});

export default router;
