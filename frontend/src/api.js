const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Request failed");
  }
  return res.json();
}

export const api = {
  getClients: (q = "") =>
    fetch(`${BASE}/clients${q ? `?q=${encodeURIComponent(q)}` : ""}`).then(handle),

  getBills: (q = "") =>
    fetch(`${BASE}/bills${q ? `?q=${encodeURIComponent(q)}` : ""}`).then(handle),

  getNextBillNo: () => fetch(`${BASE}/bills/next-number`).then(handle),

  createBill: (payload) =>
    fetch(`${BASE}/bills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle),

  deleteBill: (id) =>
    fetch(`${BASE}/bills/${id}`, { method: "DELETE" }).then(handle),
};
