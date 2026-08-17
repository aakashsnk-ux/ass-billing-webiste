# Billing Book — MERN + Tailwind

Simple billing app: create bills, download as PDF, and reuse saved client
details automatically on the next bill.

Stack: React + Tailwind (frontend), Express + Node + MongoDB (backend).

## Folder structure
```
billing-app/
  backend/    Express + Mongoose API
  frontend/   React (Vite) + Tailwind UI
```

## 1. Backend setup

```
cd backend
npm install
cp .env.example .env      # edit MONGODB_URI if needed
npm run dev                # starts on http://localhost:5000
```

Requires a running MongoDB (local `mongod`, or an Atlas connection string
in `.env`).

## 2. Frontend setup

```
cd frontend
npm install
cp .env.example .env      # VITE_API_URL, default http://localhost:5000/api
npm run dev                # starts on http://localhost:5173
```

Open http://localhost:5173 on desktop, or your machine's local IP on
your phone (same wifi) to test the mobile view, e.g. http://192.168.x.x:5173

## API endpoints

- `GET  /api/clients?q=` — search/list clients
- `POST /api/clients` — create/update a client
- `GET  /api/bills?q=` — search/list bills
- `POST /api/bills` — create a bill (auto-creates/updates the client)
- `DELETE /api/bills/:id` — delete a bill
- `GET  /api/bills/next-number` — next auto bill number

## Notes
- Bill PDF is generated client-side with jsPDF — no extra backend work.
- Client autocomplete searches MongoDB directly (`GET /api/clients?q=`) as
  you type a name, and auto-fills phone/address on selection.
- Once you share your real bill format, the PDF layout in
  `frontend/src/pdf.js` (and the mirrored one if you keep the standalone
  HTML version) can be updated to match exactly.
