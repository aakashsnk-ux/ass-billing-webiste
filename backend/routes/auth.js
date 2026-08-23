import { Router } from "express";

const router = Router();

// POST /api/auth/login  { email, password }
router.post("/login", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  const okEmail = String(process.env.AUTH_EMAIL || "").trim().toLowerCase();
  const okPassword = String(process.env.AUTH_PASSWORD || "");

  if (!okEmail || !okPassword) {
    return res.status(500).json({ error: "Login not setup on server" });
  }

  if (email !== okEmail || password !== okPassword) {
    return res.status(401).json({ error: "Galat email ya password" });
  }

  res.json({ token: process.env.AUTH_TOKEN, email: okEmail });
});

export default router;
