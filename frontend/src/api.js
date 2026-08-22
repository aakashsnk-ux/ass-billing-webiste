const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "billing_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}
export function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function headers(json) {
  const h = { "x-auth-token": getToken() };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

async function handle(res) {
  if (res.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error("Login required");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Request failed");
  }
  return res.json();
}

export const api = {
  login: (email, password) =>
    fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Login failed");
      }
      return res.json();
    }),

  getClients: (q = "") =>
    fetch(`${BASE}/clients${q ? `?q=${encodeURIComponent(q)}` : ""}`, { headers: headers() }).then(handle),

  getBills: (q = "") =>
    fetch(`${BASE}/bills${q ? `?q=${encodeURIComponent(q)}` : ""}`, { headers: headers() }).then(handle),

  getNextBillNo: () => fetch(`${BASE}/bills/next-number`, { headers: headers() }).then(handle),

  createBill: (payload) =>
    fetch(`${BASE}/bills`, {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify(payload),
    }).then(handle),

  updateBill: (id, payload) =>
    fetch(`${BASE}/bills/${id}`, {
      method: "PUT",
      headers: headers(true),
      body: JSON.stringify(payload),
    }).then(handle),

  deleteBill: (id) =>
    fetch(`${BASE}/bills/${id}`, { method: "DELETE", headers: headers() }).then(handle),
};
