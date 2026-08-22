import React, { useState } from "react";
import Login from "./components/Login.jsx";
import { getToken, clearToken } from "./api.js";
import BottomNav from "./components/BottomNav.jsx";
import NewBill from "./components/NewBill.jsx";
import BillsList from "./components/BillsList.jsx";
import ClientsList from "./components/ClientsList.jsx";
import logo from "./assets/logo.jpeg";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [view, setView] = useState("newbill");
  const [prefillClient, setPrefillClient] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function goToNewBillWithClient(client) {
    setPrefillClient(client);
    setView("newbill");
  }

  function onBillSaved() {
    setRefreshKey((k) => k + 1);
  }

  function handleLogout() {
    if (!confirm("Want to Logout?")) return;
    clearToken();
    setLoggedIn(false);
  }

  const pageTitle = {
    newbill: "New Bill",
    bills: "Bills",
    clients: "Clients",
  };

  const pageSubtitle = {
    newbill: "Create a new invoice",
    bills: "Manage your invoices",
    clients: "Your saved customers",
  };

  if (!loggedIn) {
    return <Login onLoggedIn={() => setLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <img
                src={logo}
                alt="ASS logo"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-[16px] font-bold tracking-tight sm:text-lg">
                Billing Book
              </h1>

            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">
                {pageTitle[view]}
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                {pageSubtitle[view]}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-6xl overflow-x-hidden px-3 pb-28 pt-5 sm:px-6 sm:pt-7 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {view === "newbill" && (
            <NewBill
              prefillClient={prefillClient}
              clearPrefill={() => setPrefillClient(null)}
              onSaved={onBillSaved}
            />
          )}

          {view === "bills" && (
            <BillsList refreshKey={refreshKey} />
          )}

          {view === "clients" && (
            <ClientsList
              refreshKey={refreshKey}
              onUseClient={goToNewBillWithClient}
            />
          )}
        </div>
      </main>

      <BottomNav view={view} setView={setView} />
    </div>
  );
}