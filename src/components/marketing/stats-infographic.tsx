export default function StatsInfographic() {
  return (
    <svg
      viewBox="0 0 800 250"
      width="100%"
      height="auto"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="stats-purple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="stats-green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="stats-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <filter id="stats-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Connecting lines */}
      <line x1="170" y1="125" x2="330" y2="125" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="6 4" />
      <line x1="470" y1="125" x2="630" y2="125" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="6 4" />

      {/* Circle 1 - Purple */}
      <circle cx="125" cy="100" r="72" fill="url(#stats-purple)" filter="url(#stats-shadow)" />
      <circle cx="125" cy="100" r="72" fill="none" stroke="white" strokeWidth="2" opacity="0.2" />
      <text x="125" y="95" textAnchor="middle" fill="white" fontSize="26" fontWeight="700" fontFamily="system-ui, sans-serif">
        $2B+
      </text>
      <text x="125" y="118" textAnchor="middle" fill="white" fontSize="11" fontWeight="400" fontFamily="system-ui, sans-serif" opacity="0.8">
        Revenue Managed
      </text>
      <text x="125" y="205" textAnchor="middle" fill="#6B7280" fontSize="14" fontWeight="600" fontFamily="system-ui, sans-serif">
        Total Billing Volume
      </text>
      <text x="125" y="225" textAnchor="middle" fill="#9CA3AF" fontSize="11" fontFamily="system-ui, sans-serif">
        Processed annually
      </text>

      {/* Circle 2 - Green */}
      <circle cx="400" cy="100" r="72" fill="url(#stats-green)" filter="url(#stats-shadow)" />
      <circle cx="400" cy="100" r="72" fill="none" stroke="white" strokeWidth="2" opacity="0.2" />
      <text x="400" y="95" textAnchor="middle" fill="white" fontSize="26" fontWeight="700" fontFamily="system-ui, sans-serif">
        100M+
      </text>
      <text x="400" y="118" textAnchor="middle" fill="white" fontSize="11" fontWeight="400" fontFamily="system-ui, sans-serif" opacity="0.8">
        Invoices Generated
      </text>
      <text x="400" y="205" textAnchor="middle" fill="#6B7280" fontSize="14" fontWeight="600" fontFamily="system-ui, sans-serif">
        Transactions Processed
      </text>
      <text x="400" y="225" textAnchor="middle" fill="#9CA3AF" fontSize="11" fontFamily="system-ui, sans-serif">
        Across all clients
      </text>

      {/* Circle 3 - Blue */}
      <circle cx="675" cy="100" r="72" fill="url(#stats-blue)" filter="url(#stats-shadow)" />
      <circle cx="675" cy="100" r="72" fill="none" stroke="white" strokeWidth="2" opacity="0.2" />
      <text x="675" y="95" textAnchor="middle" fill="white" fontSize="26" fontWeight="700" fontFamily="system-ui, sans-serif">
        99.99%
      </text>
      <text x="675" y="118" textAnchor="middle" fill="white" fontSize="11" fontWeight="400" fontFamily="system-ui, sans-serif" opacity="0.8">
        Uptime SLA
      </text>
      <text x="675" y="205" textAnchor="middle" fill="#6B7280" fontSize="14" fontWeight="600" fontFamily="system-ui, sans-serif">
        Platform Reliability
      </text>
      <text x="675" y="225" textAnchor="middle" fill="#9CA3AF" fontSize="11" fontFamily="system-ui, sans-serif">
        Enterprise-grade uptime
      </text>
    </svg>
  );
}
