export default function FeatureComparison() {
  return (
    <svg
      viewBox="0 0 600 400"
      width="100%"
      height="auto"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="comp-header" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#6D28D9" />
          <stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>
        <linearGradient id="comp-row-alt" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F9FAFB" />
          <stop offset="100%" stopColor="#F3F4F6" />
        </linearGradient>
        <filter id="comp-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Table container */}
      <rect x="40" y="20" width="520" height="360" rx="12" fill="white" filter="url(#comp-shadow)" stroke="#E5E7EB" strokeWidth="1" />

      {/* Header */}
      <rect x="40" y="20" width="520" height="56" rx="12" fill="url(#comp-header)" />
      <rect x="40" y="56" width="520" height="20" fill="url(#comp-header)" />
      <text x="180" y="56" textAnchor="middle" fill="white" fontSize="14" fontWeight="600" fontFamily="system-ui, sans-serif">Starter</text>
      <text x="340" y="56" textAnchor="middle" fill="white" fontSize="14" fontWeight="600" fontFamily="system-ui, sans-serif">Growth</text>
      <text x="480" y="56" textAnchor="middle" fill="white" fontSize="14" fontWeight="600" fontFamily="system-ui, sans-serif">Enterprise</text>

      {/* Feature column header */}
      <text x="120" y="56" textAnchor="middle" fill="white" fontSize="12" fontWeight="400" fontFamily="system-ui, sans-serif" opacity="0.8">Feature</text>

      {/* Row 1 */}
      <rect x="40" y="76" width="520" height="44" fill="white" />
      <line x1="40" y1="120" x2="560" y2="120" stroke="#F3F4F6" strokeWidth="1" />
      <text x="120" y="103" textAnchor="middle" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">Invoice Generation</text>
      <text x="180" y="103" textAnchor="middle" fill="#10B981" fontSize="18">✓</text>
      <text x="340" y="103" textAnchor="middle" fill="#10B981" fontSize="18">✓</text>
      <text x="480" y="103" textAnchor="middle" fill="#10B981" fontSize="18">✓</text>

      {/* Row 2 */}
      <rect x="40" y="120" width="520" height="44" fill="url(#comp-row-alt)" />
      <line x1="40" y1="164" x2="560" y2="164" stroke="#F3F4F6" strokeWidth="1" />
      <text x="120" y="147" textAnchor="middle" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">Payment Tracking</text>
      <text x="180" y="147" textAnchor="middle" fill="#10B981" fontSize="18">✓</text>
      <text x="340" y="147" textAnchor="middle" fill="#10B981" fontSize="18">✓</text>
      <text x="480" y="147" textAnchor="middle" fill="#10B981" fontSize="18">✓</text>

      {/* Row 3 */}
      <rect x="40" y="164" width="520" height="44" fill="white" />
      <line x1="40" y1="208" x2="560" y2="208" stroke="#F3F4F6" strokeWidth="1" />
      <text x="120" y="191" textAnchor="middle" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">Multi-Currency</text>
      <text x="180" y="191" textAnchor="middle" fill="#EF4444" fontSize="16">×</text>
      <text x="340" y="191" textAnchor="middle" fill="#10B981" fontSize="18">✓</text>
      <text x="480" y="191" textAnchor="middle" fill="#10B981" fontSize="18">✓</text>

      {/* Row 4 */}
      <rect x="40" y="208" width="520" height="44" fill="url(#comp-row-alt)" />
      <line x1="40" y1="252" x2="560" y2="252" stroke="#F3F4F6" strokeWidth="1" />
      <text x="120" y="235" textAnchor="middle" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">API Access</text>
      <text x="180" y="235" textAnchor="middle" fill="#EF4444" fontSize="16">×</text>
      <text x="340" y="235" textAnchor="middle" fill="#10B981" fontSize="18">✓</text>
      <text x="480" y="235" textAnchor="middle" fill="#10B981" fontSize="18">✓</text>

      {/* Row 5 */}
      <rect x="40" y="252" width="520" height="44" fill="white" />
      <line x1="40" y1="296" x2="560" y2="296" stroke="#F3F4F6" strokeWidth="1" />
      <text x="120" y="279" textAnchor="middle" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">Custom Branding</text>
      <text x="180" y="279" textAnchor="middle" fill="#EF4444" fontSize="16">×</text>
      <text x="340" y="279" textAnchor="middle" fill="#EF4444" fontSize="16">×</text>
      <text x="480" y="279" textAnchor="middle" fill="#10B981" fontSize="18">✓</text>

      {/* Row 6 */}
      <rect x="40" y="296" width="520" height="44" fill="url(#comp-row-alt)" />
      <text x="120" y="323" textAnchor="middle" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">Dedicated Support</text>
      <text x="180" y="323" textAnchor="middle" fill="#EF4444" fontSize="16">×</text>
      <text x="340" y="323" textAnchor="middle" fill="#EF4444" fontSize="16">×</text>
      <text x="480" y="323" textAnchor="middle" fill="#10B981" fontSize="18">✓</text>

      {/* Bottom border */}
      <rect x="40" y="364" width="520" height="16" rx="0 0 12 12" fill="#F9FAFB" />
    </svg>
  );
}
