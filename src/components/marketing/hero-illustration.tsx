export default function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 600 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="auto"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heroBg" x1="0" y1="0" x2="600" y2="400" gradientUnits="userSpaceOnUse">
          <stop stopColor="#faf5ff" />
          <stop offset="1" stopColor="#ede9fe" />
        </linearGradient>
        <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="cardGrad2" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="#faf5ff" />
        </linearGradient>
        <filter id="heroShadow" x="-10%" y="-5%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#7c3aed" floodOpacity="0.12" />
        </filter>
        <filter id="floatShadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#7c3aed" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Background decorative elements */}
      <circle cx="80" cy="80" r="160" fill="#7c3aed" opacity="0.03" />
      <circle cx="520" cy="320" r="180" fill="#7c3aed" opacity="0.04" />
      <circle cx="500" cy="60" r="60" fill="#3b82f6" opacity="0.03" />

      {/* Decorative lines */}
      <line x1="0" y1="120" x2="100" y2="120" stroke="#7c3aed" strokeWidth="0.5" opacity="0.1" />
      <line x1="500" y1="300" x2="600" y2="300" stroke="#7c3aed" strokeWidth="0.5" opacity="0.1" />
      <line x1="150" y1="0" x2="150" y2="50" stroke="#7c3aed" strokeWidth="0.5" opacity="0.1" />

      {/* Small decorative dots */}
      <circle cx="50" cy="50" r="2" fill="#7c3aed" opacity="0.2" />
      <circle cx="550" cy="50" r="2" fill="#7c3aed" opacity="0.2" />
      <circle cx="50" cy="350" r="2" fill="#7c3aed" opacity="0.2" />
      <circle cx="550" cy="350" r="2" fill="#7c3aed" opacity="0.2" />
      <circle cx="300" cy="30" r="1.5" fill="#3b82f6" opacity="0.3" />
      <circle cx="250" cy="380" r="1.5" fill="#3b82f6" opacity="0.3" />

      {/* Main dashboard */}
      <g filter="url(#heroShadow)">
        {/* Dashboard card */}
        <rect x="100" y="60" width="400" height="280" rx="16" fill="url(#cardGrad2)" stroke="#e5e7eb" strokeWidth="1" />

        {/* Dashboard header */}
        <rect x="100" y="60" width="400" height="44" rx="16" fill="url(#dashGrad)" />
        <rect x="100" y="92" width="400" height="12" fill="url(#dashGrad)" />

        {/* Header content */}
        <rect x="120" y="74" width="24" height="12" rx="3" fill="white" opacity="0.9" />
        <text x="132" y="83" fontSize="5" fill="#7c3aed" fontFamily="sans-serif" fontWeight="600" textAnchor="middle">
          AR
        </text>
        <text x="160" y="83" fontSize="8" fill="white" fontFamily="sans-serif" fontWeight="600">
          Accounts Receivable
        </text>

        {/* Header nav dots */}
        <circle cx="440" cy="80" r="3" fill="white" opacity="0.5" />
        <circle cx="452" cy="80" r="3" fill="white" opacity="0.5" />
        <circle cx="464" cy="80" r="3" fill="white" opacity="0.5" />

        {/* Sidebar */}
        <rect x="100" y="104" width="60" height="236" fill="#f9fafb" />
        <rect x="110" y="116" width="40" height="6" rx="3" fill="#7c3aed" opacity="0.15" />
        <rect x="110" y="130" width="36" height="4" rx="2" fill="#e5e7eb" />
        <rect x="110" y="142" width="40" height="4" rx="2" fill="#e5e7eb" />
        <rect x="110" y="154" width="32" height="4" rx="2" fill="#e5e7eb" />
        <rect x="110" y="166" width="38" height="4" rx="2" fill="#e5e7eb" />

        {/* Main content area - top metrics */}
        <rect x="172" y="116" width="108" height="50" rx="8" fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
        <text x="184" y="132" fontSize="5" fill="#9ca3af" fontFamily="sans-serif">
          Total Outstanding
        </text>
        <text x="184" y="148" fontSize="11" fill="#374151" fontFamily="sans-serif" fontWeight="700">
          $284,500
        </text>
        <text x="270" y="148" fontSize="5" fill="#16a34a" fontFamily="sans-serif" fontWeight="600">
          +8.2%
        </text>

        <rect x="290" y="116" width="108" height="50" rx="8" fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
        <text x="302" y="132" fontSize="5" fill="#9ca3af" fontFamily="sans-serif">
          Collected (MTD)
        </text>
        <text x="302" y="148" fontSize="11" fill="#16a34a" fontFamily="sans-serif" fontWeight="700">
          $142,800
        </text>
        <text x="390" y="148" fontSize="5" fill="#16a34a" fontFamily="sans-serif" fontWeight="600">
          +12.5%
        </text>

        <rect x="408" y="116" width="80" height="50" rx="8" fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
        <text x="418" y="132" fontSize="5" fill="#9ca3af" fontFamily="sans-serif">
          Aging
        </text>
        <text x="418" y="148" fontSize="11" fill="#f59e0b" fontFamily="sans-serif" fontWeight="700">
          32 days
        </text>

        {/* Chart area */}
        <rect x="172" y="176" width="316" height="116" rx="8" fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
        <text x="184" y="192" fontSize="6" fill="#374151" fontFamily="sans-serif" fontWeight="600">
          Collection Trend
        </text>

        {/* Mini bar chart */}
        <g transform="translate(184, 200)">
          <rect x="0" y="50" width="12" height="30" rx="2" fill="#7c3aed" opacity="0.2" />
          <rect x="0" y="60" width="12" height="20" rx="2" fill="#7c3aed" opacity="0.6" />

          <rect x="20" y="40" width="12" height="40" rx="2" fill="#7c3aed" opacity="0.2" />
          <rect x="20" y="50" width="12" height="30" rx="2" fill="#7c3aed" opacity="0.6" />

          <rect x="40" y="30" width="12" height="50" rx="2" fill="#7c3aed" opacity="0.2" />
          <rect x="40" y="38" width="12" height="42" rx="2" fill="#7c3aed" opacity="0.6" />

          <rect x="60" y="20" width="12" height="60" rx="2" fill="#7c3aed" opacity="0.2" />
          <rect x="60" y="28" width="12" height="52" rx="2" fill="#7c3aed" opacity="0.6" />

          <rect x="80" y="15" width="12" height="65" rx="2" fill="#7c3aed" opacity="0.2" />
          <rect x="80" y="22" width="12" height="58" rx="2" fill="#7c3aed" opacity="0.6" />

          <rect x="100" y="10" width="12" height="70" rx="2" fill="#7c3aed" opacity="0.2" />
          <rect x="100" y="16" width="12" height="64" rx="2" fill="#7c3aed" opacity="0.7" />

          <rect x="120" y="5" width="12" height="75" rx="2" fill="#7c3aed" opacity="0.2" />
          <rect x="120" y="10" width="12" height="70" rx="2" fill="#7c3aed" opacity="0.8" />

          <rect x="140" y="0" width="12" height="80" rx="2" fill="#7c3aed" opacity="0.2" />
          <rect x="140" y="5" width="12" height="75" rx="2" fill="#7c3aed" opacity="0.9" />

          <rect x="160" y="-2" width="12" height="82" rx="2" fill="#7c3aed" opacity="0.2" />
          <rect x="160" y="2" width="12" height="78" rx="2" fill="#7c3aed" />
        </g>

        {/* Trend line */}
        <path
          d="M184 260 L204 252 L224 248 L244 240 L264 235 L284 228 L304 222 L324 218 L344 212 L364 208 L384 200 L404 196 L424 192 L444 188 L464 182 L480 178"
          stroke="#16a34a"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Floating metric card - top left */}
      <g filter="url(#floatShadow)" transform="translate(-20, 30)">
        <rect x="10" y="20" width="100" height="52" rx="10" fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
        <circle cx="28" cy="40" r="10" fill="#7c3aed" opacity="0.1" />
        <path d="M24 40 L28 34 L32 40" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M24 44 L28 50 L32 44" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <text x="46" y="38" fontSize="5" fill="#9ca3af" fontFamily="sans-serif">
          Invoices
        </text>
        <text x="46" y="50" fontSize="9" fill="#374151" fontFamily="sans-serif" fontWeight="700">
          1,248
        </text>
      </g>

      {/* Floating metric card - top right */}
      <g filter="url(#floatShadow)" transform="translate(20, 10)">
        <rect x="480" y="30" width="108" height="52" rx="10" fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
        <circle cx="498" cy="50" r="10" fill="#16a34a" opacity="0.1" />
        <path d="M494 54 L498 44 L502 54" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <text x="516" y="48" fontSize="5" fill="#9ca3af" fontFamily="sans-serif">
          Collected
        </text>
        <text x="516" y="60" fontSize="9" fill="#16a34a" fontFamily="sans-serif" fontWeight="700">
          94.2%
        </text>
      </g>

      {/* Floating metric card - bottom left */}
      <g filter="url(#floatShadow)" transform="translate(-10, 20)">
        <rect x="20" y="310" width="100" height="52" rx="10" fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
        <circle cx="38" cy="330" r="10" fill="#f59e0b" opacity="0.1" />
        <circle cx="38" cy="330" r="5" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="38" y1="327" x2="38" y2="330" stroke="#f59e0b" strokeWidth="1" />
        <line x1="38" y1="330" x2="41" y2="332" stroke="#f59e0b" strokeWidth="1" />
        <text x="56" y="328" fontSize="5" fill="#9ca3af" fontFamily="sans-serif">
          Avg Days
        </text>
        <text x="56" y="340" fontSize="9" fill="#f59e0b" fontFamily="sans-serif" fontWeight="700">
          28 days
        </text>
      </g>

      {/* Floating metric card - bottom right */}
      <g filter="url(#floatShadow)" transform="translate(10, 15)">
        <rect x="480" y="320" width="108" height="52" rx="10" fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
        <circle cx="498" cy="340" r="10" fill="#3b82f6" opacity="0.1" />
        <rect x="493" y="335" width="10" height="10" rx="2" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
        <path d="M496 340 L500 337 L504 340 L500 343 Z" fill="#3b82f6" opacity="0.4" />
        <text x="516" y="338" fontSize="5" fill="#9ca3af" fontFamily="sans-serif">
          Customers
        </text>
        <text x="516" y="350" fontSize="9" fill="#3b82f6" fontFamily="sans-serif" fontWeight="700">
          386
        </text>
      </g>

      {/* Decorative connecting lines */}
      <line x1="100" y1="80" x2="30" y2="50" stroke="#7c3aed" strokeWidth="0.5" opacity="0.15" strokeDasharray="3 3" />
      <line x1="500" y1="70" x2="580" y2="50" stroke="#7c3aed" strokeWidth="0.5" opacity="0.15" strokeDasharray="3 3" />
      <line x1="100" y1="330" x2="40" y2="340" stroke="#7c3aed" strokeWidth="0.5" opacity="0.15" strokeDasharray="3 3" />
      <line x1="500" y1="340" x2="580" y2="350" stroke="#7c3aed" strokeWidth="0.5" opacity="0.15" strokeDasharray="3 3" />

      {/* Pulsing accent dots */}
      <circle cx="200" cy="50" r="2" fill="#7c3aed" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="400" cy="380" r="2" fill="#3b82f6" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" begin="1s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="200" r="1.5" fill="#16a34a" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" begin="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
