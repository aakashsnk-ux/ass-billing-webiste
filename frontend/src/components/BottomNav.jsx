import React from "react";

const tabs = [
  {
    key: "newbill",
    label: "New Bill",
    icon: "＋",
  },
  {
    key: "bills",
    label: "Bills",
    icon: "▤",
  },
  {
    key: "clients",
    label: "Customers",
    icon: "◍",
  },
];

export default function BottomNav({ view, setView }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[70px] w-full max-w-xl items-center justify-around px-2">
        {tabs.map((tab) => {
          const active = view === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setView(tab.key)}
              className={`relative flex min-w-[76px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition ${
                active
                  ? "text-accent"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span
                className={`flex h-8 w-12 items-center justify-center rounded-xl text-[21px] transition ${
                  active
                    ? "bg-accent-soft"
                    : "bg-transparent"
                }`}
              >
                {tab.icon}
              </span>

              <span
                className={`text-[11px] ${
                  active
                    ? "font-bold"
                    : "font-medium"
                }`}
              >
                {tab.label}
              </span>

              {active && (
                <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}