export default function PaymentIllustration() {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="auto"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="400" y2="300" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="lockGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
          <stop stopColor="#16a34a" />
          <stop offset="1" stopColor="#15803d" />
        </linearGradient>
        <filter id="shadow1" x="-4" y="-2" width="calc(100% + 8px)" height="calc(100% + 6px)">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#7c3aed" floodOpacity="0.2" />
        </filter>
        <filter id="shadow2" x="-4" y="-2" width="calc(100% + 8px)" height="calc(100% + 6px)">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#16a34a" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* Credit card */}
      <g filter="url(#shadow1)">
        <rect x="30" y="60" width="150" height="100" rx="12" fill="url(#cardGrad)" />
        {/* Card chip */}
        <rect x="48" y="82" width="22" height="16" rx="3" fill="#fbbf24" opacity="0.9" />
        <line x1="48" y1="87" x2="70" y2="87" stroke="#d97706" strokeWidth="0.5" />
        <line x1="48" y1="93" x2="70" y2="93" stroke="#d97706" strokeWidth="0.5" />
        <line x1="59" y1="82" x2="59" y2="98" stroke="#d97706" strokeWidth="0.5" />
        {/* Card number */}
        <text x="48" y="120" fontSize="7" fill="white" fontFamily="monospace" opacity="0.9">
          4532 •••• •••• 7891
        </text>
        {/* Card holder */}
        <text x="48" y="138" fontSize="5" fill="white" fontFamily="sans-serif" opacity="0.7">
          CARDHOLDER NAME
        </text>
        <text x="48" y="148" fontSize="6" fill="white" fontFamily="sans-serif" fontWeight="500">
          JOHN DOE
        </text>
        {/* Expiry */}
        <text x="120" y="138" fontSize="5" fill="white" fontFamily="sans-serif" opacity="0.7">
          EXPIRES
        </text>
        <text x="120" y="148" fontSize="6" fill="white" fontFamily="sans-serif" fontWeight="500">
          12/26
        </text>
        {/* Contactless icon */}
        <g transform="translate(155, 82)">
          <path d="M0 8 Q4 4, 4 0" stroke="white" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M3 10 Q7 6, 7 0" stroke="white" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M6 12 Q10 8, 10 0" stroke="white" strokeWidth="1" fill="none" opacity="0.6" />
        </g>
      </g>

      {/* Arrow 1: Card to Lock */}
      <g>
        <path
          d="M200 110 L240 110"
          stroke="#e5e7eb"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <polygon points="238,106 246,110 238,114" fill="#7c3aed" />
      </g>

      {/* Lock / Security */}
      <g filter="url(#shadow2)">
        <circle cx="280" cy="110" r="40" fill="url(#lockGrad)" />
        {/* Lock body */}
        <rect x="268" y="108" width="24" height="18" rx="3" fill="white" />
        {/* Lock shackle */}
        <path
          d="M274 108 L274 100 Q274 92, 280 92 Q286 92, 286 100 L286 108"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {/* Keyhole */}
        <circle cx="280" cy="116" r="2.5" fill="#16a34a" />
        <rect x="279" y="116" width="2" height="4" rx="0.5" fill="#16a34a" />
        <text x="280" y="168" fontSize="7" fill="#374151" fontFamily="sans-serif" fontWeight="600" textAnchor="middle">
          Secure
        </text>
        <text x="280" y="178" fontSize="5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="middle">
          256-bit SSL
        </text>
      </g>

      {/* Arrow 2: Lock to Checkmark */}
      <g>
        <path
          d="M330 110 L355 110"
          stroke="#e5e7eb"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <polygon points="353,106 361,110 353,114" fill="#16a34a" />
      </g>

      {/* Success checkmark */}
      <g>
        <circle cx="380" cy="110" r="22" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
        <path
          d="M370 110 L377 117 L392 102"
          stroke="#16a34a"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x="380" y="148" fontSize="7" fill="#374151" fontFamily="sans-serif" fontWeight="600" textAnchor="middle">
          Success
        </text>
        <text x="380" y="158" fontSize="5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="middle">
          Payment complete
        </text>
      </g>

      {/* Bottom decorative elements */}
      <rect x="30" y="200" width="340" height="70" rx="12" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="0.5" />

      {/* Process steps */}
      <circle cx="80" cy="235" r="14" fill="#7c3aed" opacity="0.1" />
      <text x="80" y="239" fontSize="12" fill="#7c3aed" fontFamily="sans-serif" fontWeight="700" textAnchor="middle">
        1
      </text>
      <text x="80" y="260" fontSize="6" fill="#6b7280" fontFamily="sans-serif" textAnchor="middle">
        Enter Details
      </text>

      <line x1="102" y1="235" x2="138" y2="235" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="3 3" />
      <polygon points="136,232 142,235 136,238" fill="#d1d5db" />

      <circle cx="168" cy="235" r="14" fill="#7c3aed" opacity="0.1" />
      <text x="168" y="239" fontSize="12" fill="#7c3aed" fontFamily="sans-serif" fontWeight="700" textAnchor="middle">
        2
      </text>
      <text x="168" y="260" fontSize="6" fill="#6b7280" fontFamily="sans-serif" textAnchor="middle">
        Verify
      </text>

      <line x1="190" y1="235" x2="226" y2="235" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="3 3" />
      <polygon points="224,232 230,235 224,238" fill="#d1d5db" />

      <circle cx="256" cy="235" r="14" fill="#7c3aed" opacity="0.1" />
      <text x="256" y="239" fontSize="12" fill="#7c3aed" fontFamily="sans-serif" fontWeight="700" textAnchor="middle">
        3
      </text>
      <text x="256" y="260" fontSize="6" fill="#6b7280" fontFamily="sans-serif" textAnchor="middle">
        Process
      </text>

      <line x1="278" y1="235" x2="314" y2="235" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="3 3" />
      <polygon points="312,232 318,235 312,238" fill="#d1d5db" />

      <circle cx="344" cy="235" r="14" fill="#16a34a" opacity="0.1" />
      <text x="344" y="239" fontSize="12" fill="#16a34a" fontFamily="sans-serif" fontWeight="700" textAnchor="middle">
        4
      </text>
      <text x="344" y="260" fontSize="6" fill="#6b7280" fontFamily="sans-serif" textAnchor="middle">
        Complete
      </text>
    </svg>
  );
}
