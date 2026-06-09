export default function IntegrationGrid() {
  return (
    <svg
      viewBox="0 0 600 600"
      width="100%"
      height="auto"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grid-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5F3FF" />
          <stop offset="100%" stopColor="#EDE9FE" />
        </linearGradient>
        <linearGradient id="cell-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="cell-2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="cell-3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="cell-4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="cell-5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="cell-6" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="cell-7" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>
        <linearGradient id="cell-8" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>
        <linearGradient id="cell-9" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
        <linearGradient id="conn-line" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <filter id="cell-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Background */}
      <rect width="600" height="600" fill="url(#grid-bg)" rx="16" />

      {/* Connecting lines */}
      <g stroke="url(#conn-line)" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 3">
        {/* Horizontal */}
        <line x1="155" y1="150" x2="245" y2="150" />
        <line x1="355" y1="150" x2="445" y2="150" />
        <line x1="155" y1="300" x2="245" y2="300" />
        <line x1="355" y1="300" x2="445" y2="300" />
        <line x1="155" y1="450" x2="245" y2="450" />
        <line x1="355" y1="450" x2="445" y2="450" />
        {/* Vertical */}
        <line x1="150" y1="155" x2="150" y2="245" />
        <line x1="300" y1="155" x2="300" y2="245" />
        <line x1="450" y1="155" x2="450" y2="245" />
        <line x1="150" y1="355" x2="150" y2="445" />
        <line x1="300" y1="355" x2="300" y2="445" />
        <line x1="450" y1="355" x2="450" y2="445" />
        {/* Diagonal */}
        <line x1="150" y1="150" x2="300" y2="300" />
        <line x1="450" y1="150" x2="300" y2="300" />
        <line x1="150" y1="450" x2="300" y2="300" />
        <line x1="450" y1="450" x2="300" y2="300" />
      </g>

      {/* Row 1 */}
      {/* Cell 1 - QuickBooks */}
      <g filter="url(#cell-shadow)">
        <rect x="70" y="70" width="160" height="160" rx="16" fill="url(#cell-1)" />
        <rect x="80" y="80" width="140" height="140" rx="12" fill="white" opacity="0.1" />
        <text x="150" y="145" textAnchor="middle" fill="white" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">QuickBooks</text>
        <text x="150" y="165" textAnchor="middle" fill="white" fontSize="10" fontFamily="system-ui, sans-serif" opacity="0.8">Accounting</text>
      </g>

      {/* Cell 2 - Stripe */}
      <g filter="url(#cell-shadow)">
        <rect x="220" y="70" width="160" height="160" rx="16" fill="url(#cell-2)" />
        <rect x="230" y="80" width="140" height="140" rx="12" fill="white" opacity="0.1" />
        <text x="300" y="145" textAnchor="middle" fill="white" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">Stripe</text>
        <text x="300" y="165" textAnchor="middle" fill="white" fontSize="10" fontFamily="system-ui, sans-serif" opacity="0.8">Payments</text>
      </g>

      {/* Cell 3 - Salesforce */}
      <g filter="url(#cell-shadow)">
        <rect x="370" y="70" width="160" height="160" rx="16" fill="url(#cell-3)" />
        <rect x="380" y="80" width="140" height="140" rx="12" fill="white" opacity="0.1" />
        <text x="450" y="145" textAnchor="middle" fill="white" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">Salesforce</text>
        <text x="450" y="165" textAnchor="middle" fill="white" fontSize="10" fontFamily="system-ui, sans-serif" opacity="0.8">CRM</text>
      </g>

      {/* Row 2 */}
      {/* Cell 4 - Xero */}
      <g filter="url(#cell-shadow)">
        <rect x="70" y="220" width="160" height="160" rx="16" fill="url(#cell-4)" />
        <rect x="80" y="230" width="140" height="140" rx="12" fill="white" opacity="0.1" />
        <text x="150" y="295" textAnchor="middle" fill="white" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">Xero</text>
        <text x="150" y="315" textAnchor="middle" fill="white" fontSize="10" fontFamily="system-ui, sans-serif" opacity="0.8">Accounting</text>
      </g>

      {/* Cell 5 - HubSpot */}
      <g filter="url(#cell-shadow)">
        <rect x="220" y="220" width="160" height="160" rx="16" fill="url(#cell-5)" />
        <rect x="230" y="230" width="140" height="140" rx="12" fill="white" opacity="0.1" />
        <text x="300" y="295" textAnchor="middle" fill="white" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">HubSpot</text>
        <text x="300" y="315" textAnchor="middle" fill="white" fontSize="10" fontFamily="system-ui, sans-serif" opacity="0.8">Marketing</text>
      </g>

      {/* Cell 6 - Slack */}
      <g filter="url(#cell-shadow)">
        <rect x="370" y="220" width="160" height="160" rx="16" fill="url(#cell-6)" />
        <rect x="380" y="230" width="140" height="140" rx="12" fill="white" opacity="0.1" />
        <text x="450" y="295" textAnchor="middle" fill="white" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">Slack</text>
        <text x="450" y="315" textAnchor="middle" fill="white" fontSize="10" fontFamily="system-ui, sans-serif" opacity="0.8">Communication</text>
      </g>

      {/* Row 3 */}
      {/* Cell 7 - Zoom */}
      <g filter="url(#cell-shadow)">
        <rect x="70" y="370" width="160" height="160" rx="16" fill="url(#cell-7)" />
        <rect x="80" y="380" width="140" height="140" rx="12" fill="white" opacity="0.1" />
        <text x="150" y="445" textAnchor="middle" fill="white" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">Zoom</text>
        <text x="150" y="465" textAnchor="middle" fill="white" fontSize="10" fontFamily="system-ui, sans-serif" opacity="0.8">Meetings</text>
      </g>

      {/* Cell 8 - Google */}
      <g filter="url(#cell-shadow)">
        <rect x="220" y="370" width="160" height="160" rx="16" fill="url(#cell-8)" />
        <rect x="230" y="380" width="140" height="140" rx="12" fill="white" opacity="0.1" />
        <text x="300" y="445" textAnchor="middle" fill="white" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">Google</text>
        <text x="300" y="465" textAnchor="middle" fill="white" fontSize="10" fontFamily="system-ui, sans-serif" opacity="0.8">Workspace</text>
      </g>

      {/* Cell 9 - PayPal */}
      <g filter="url(#cell-shadow)">
        <rect x="370" y="370" width="160" height="160" rx="16" fill="url(#cell-9)" />
        <rect x="380" y="380" width="140" height="140" rx="12" fill="white" opacity="0.1" />
        <text x="450" y="445" textAnchor="middle" fill="white" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">PayPal</text>
        <text x="450" y="465" textAnchor="middle" fill="white" fontSize="10" fontFamily="system-ui, sans-serif" opacity="0.8">Payments</text>
      </g>

      {/* Center hub indicator */}
      <circle cx="300" cy="300" r="24" fill="white" filter="url(#cell-shadow)" />
      <circle cx="300" cy="300" r="20" fill="url(#cell-1)" />
      <text x="300" y="304" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="system-ui, sans-serif">API</text>
    </svg>
  );
}
