export default function InvoicePreview() {
  return (
    <svg
      width="100%"
      height="auto"
      viewBox="0 0 400 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Paper shadow */}
      <rect x="32" y="32" width="336" height="456" rx="8" fill="#000000" opacity="0.2" />

      {/* Paper */}
      <rect x="24" y="24" width="352" height="456" rx="8" fill="#ffffff" />

      {/* Header accent */}
      <rect x="24" y="24" width="352" height="72" rx="8" fill="#667eea" />
      <rect x="24" y="72" width="352" height="24" fill="#667eea" />

      {/* Company logo area */}
      <rect x="48" y="44" width="40" height="40" rx="8" fill="#ffffff" opacity="0.3" />
      <rect x="56" y="52" width="24" height="24" rx="4" fill="#ffffff" opacity="0.6" />

      {/* Company name */}
      <rect x="100" y="48" width="120" height="12" rx="2" fill="#ffffff" opacity="0.9" />
      <rect x="100" y="68" width="80" height="8" rx="2" fill="#ffffff" opacity="0.6" />

      {/* Invoice badge */}
      <rect x="280" y="48" width="72" height="28" rx="14" fill="#ffffff" opacity="0.2" />
      <rect x="296" y="56" width="40" height="12" rx="2" fill="#ffffff" opacity="0.8" />

      {/* Bill To section */}
      <rect x="48" y="120" width="64" height="8" rx="2" fill="#667eea" opacity="0.8" />

      <rect x="48" y="144" width="100" height="8" rx="2" fill="#1a1a2e" opacity="0.8" />
      <rect x="48" y="160" width="80" height="6" rx="1" fill="#1a1a2e" opacity="0.4" />
      <rect x="48" y="172" width="90" height="6" rx="1" fill="#1a1a2e" opacity="0.4" />
      <rect x="48" y="184" width="70" height="6" rx="1" fill="#1a1a2e" opacity="0.4" />

      {/* Invoice details */}
      <rect x="248" y="120" width="80" height="8" rx="2" fill="#667eea" opacity="0.8" />
      <rect x="248" y="144" width="60" height="6" rx="1" fill="#1a1a2e" opacity="0.4" />
      <rect x="248" y="156" width="50" height="6" rx="1" fill="#1a1a2e" opacity="0.4" />
      <rect x="248" y="168" width="65" height="6" rx="1" fill="#1a1a2e" opacity="0.4" />
      <rect x="248" y="184" width="45" height="6" rx="1" fill="#1a1a2e" opacity="0.4" />

      {/* Line items header */}
      <rect x="48" y="220" width="304" height="32" rx="4" fill="#f0f0ff" />
      <rect x="60" y="230" width="100" height="8" rx="2" fill="#667eea" opacity="0.6" />
      <rect x="180" y="230" width="40" height="8" rx="2" fill="#667eea" opacity="0.6" />
      <rect x="240" y="230" width="30" height="8" rx="2" fill="#667eea" opacity="0.6" />
      <rect x="296" y="230" width="40" height="8" rx="2" fill="#667eea" opacity="0.6" />

      {/* Line items rows */}
      <rect x="48" y="260" width="304" height="28" fill="#ffffff" />
      <rect x="60" y="268" width="80" height="6" rx="1" fill="#1a1a2e" opacity="0.6" />
      <rect x="180" y="268" width="30" height="6" rx="1" fill="#1a1a2e" opacity="0.4" />
      <rect x="240" y="268" width="20" height="6" rx="1" fill="#1a1a2e" opacity="0.4" />
      <rect x="296" y="268" width="36" height="6" rx="1" fill="#1a1a2e" opacity="0.6" />

      <rect x="48" y="288" width="304" height="28" fill="#fafafa" />
      <rect x="60" y="296" width="90" height="6" rx="1" fill="#1a1a2e" opacity="0.6" />
      <rect x="180" y="296" width="25" height="6" rx="1" fill="#1a1a2e" opacity="0.4" />
      <rect x="240" y="296" width="18" height="6" rx="1" fill="#1a1a2e" opacity="0.4" />
      <rect x="296" y="296" width="32" height="6" rx="1" fill="#1a1a2e" opacity="0.6" />

      <rect x="48" y="316" width="304" height="28" fill="#ffffff" />
      <rect x="60" y="324" width="70" height="6" rx="1" fill="#1a1a2e" opacity="0.6" />
      <rect x="180" y="324" width="35" height="6" rx="1" fill="#1a1a2e" opacity="0.4" />
      <rect x="240" y="324" width="22" height="6" rx="1" fill="#1a1a2e" opacity="0.4" />
      <rect x="296" y="324" width="38" height="6" rx="1" fill="#1a1a2e" opacity="0.6" />

      <rect x="48" y="344" width="304" height="28" fill="#fafafa" />
      <rect x="60" y="352" width="85" height="6" rx="1" fill="#1a1a2e" opacity="0.6" />
      <rect x="180" y="352" width="28" height="6" rx="1" fill="#1a1a2e" opacity="0.4" />
      <rect x="240" y="352" width="20" height="6" rx="1" fill="#1a1a2e" opacity="0.4" />
      <rect x="296" y="352" width="34" height="6" rx="1" fill="#1a1a2e" opacity="0.6" />

      {/* Divider */}
      <line x1="48" y1="388" x2="352" y2="388" stroke="#667eea" strokeOpacity="0.2" strokeWidth="1" />

      {/* Total section */}
      <rect x="248" y="400" width="60" height="8" rx="2" fill="#1a1a2e" opacity="0.6" />
      <rect x="296" y="398" width="56" height="12" rx="2" fill="#1a1a2e" opacity="0.9" />

      {/* PAID stamp */}
      <g transform="translate(240, 420) rotate(-12)">
        <rect x="0" y="0" width="100" height="36" rx="6" fill="#43e97b" opacity="0.15" />
        <rect x="2" y="2" width="96" height="32" rx="4" fill="none" stroke="#43e97b" strokeWidth="2" strokeDasharray="4 2" />
        <text x="50" y="24" textAnchor="middle" fill="#43e97b" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
          PAID
        </text>
      </g>

      {/* Footer accent */}
      <rect x="24" y="456" width="352" height="24" rx="0" fill="#f0f0ff" />
      <rect x="48" y="464" width="60" height="6" rx="1" fill="#667eea" opacity="0.3" />
      <rect x="292" y="464" width="60" height="6" rx="1" fill="#667eea" opacity="0.3" />
    </svg>
  );
}
