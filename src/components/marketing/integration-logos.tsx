"use client";

const integrations = [
  { name: "Stripe", color: "from-violet-500/10 to-violet-600/10 text-violet-600 border-violet-200" },
  { name: "PayPal", color: "from-blue-500/10 to-blue-600/10 text-blue-600 border-blue-200" },
  { name: "QuickBooks", color: "from-green-500/10 to-green-600/10 text-green-600 border-green-200" },
  { name: "Xero", color: "from-sky-500/10 to-sky-600/10 text-sky-600 border-sky-200" },
  { name: "Sage", color: "from-emerald-500/10 to-emerald-600/10 text-emerald-600 border-emerald-200" },
  { name: "FreshBooks", color: "from-teal-500/10 to-teal-600/10 text-teal-600 border-teal-200" },
  { name: "Wave", color: "from-cyan-500/10 to-cyan-600/10 text-cyan-600 border-cyan-200" },
  { name: "NetSuite", color: "from-indigo-500/10 to-indigo-600/10 text-indigo-600 border-indigo-200" },
];

export function IntegrationLogos() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {integrations.map((integration) => (
        <div
          key={integration.name}
          className={`flex items-center justify-center px-6 py-4 rounded-xl border bg-gradient-to-br font-semibold text-sm transition-all duration-200 hover:scale-105 ${integration.color}`}
        >
          {integration.name}
        </div>
      ))}
    </div>
  );
}