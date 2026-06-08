export default function AnalyticsIllustration() {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="auto"
      aria-hidden="true"
    >
      {/* Main dashboard card shadow */}
      <rect x="16" y="16" width="368" height="268" rx="16" fill="#f3f4f6" />

      {/* Main dashboard card */}
      <rect x="12" y="12" width="368" height="268" rx="16" fill="white" stroke="#e5e7eb" strokeWidth="1" />

      {/* Chart header */}
      <text x="32" y="44" fontSize="10" fill="#374151" fontFamily="sans-serif" fontWeight="700">
        Revenue Overview
      </text>
      <text x="32" y="58" fontSize="6" fill="#9ca3af" fontFamily="sans-serif">
        Last 12 months
      </text>

      {/* Time filter pills */}
      <rect x="260" y="34" width="28" height="14" rx="7" fill="#f3f4f6" />
      <text x="274" y="43" fontSize="5" fill="#6b7280" fontFamily="sans-serif" textAnchor="middle">
        1W
      </text>
      <rect x="292" y="34" width="28" height="14" rx="7" fill="#f3f4f6" />
      <text x="306" y="43" fontSize="5" fill="#6b7280" fontFamily="sans-serif" textAnchor="middle">
        1M
      </text>
      <rect x="324" y="34" width="28" height="14" rx="7" fill="#7c3aed" />
      <text x="338" y="43" fontSize="5" fill="white" fontFamily="sans-serif" textAnchor="middle">
        1Y
      </text>

      {/* Y-axis labels */}
      <text x="28" y="82" fontSize="5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="end">
        50K
      </text>
      <text x="28" y="118" fontSize="5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="end">
        40K
      </text>
      <text x="28" y="154" fontSize="5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="end">
        30K
      </text>
      <text x="28" y="190" fontSize="5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="end">
        20K
      </text>
      <text x="28" y="226" fontSize="5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="end">
        10K
      </text>

      {/* Grid lines */}
      <line x1="36" y1="78" x2="350" y2="78" stroke="#f3f4f6" strokeWidth="0.5" />
      <line x1="36" y1="114" x2="350" y2="114" stroke="#f3f4f6" strokeWidth="0.5" />
      <line x1="36" y1="150" x2="350" y2="150" stroke="#f3f4f6" strokeWidth="0.5" />
      <line x1="36" y1="186" x2="350" y2="186" stroke="#f3f4f6" strokeWidth="0.5" />
      <line x1="36" y1="222" x2="350" y2="222" stroke="#f3f4f6" strokeWidth="0.5" />

      {/* Chart area fill */}
      <path
        d="M40 200 L70 190 L100 182 L130 175 L160 165 L190 150 L220 138 L250 125 L280 108 L310 95 L340 78 L340 222 L40 222 Z"
        fill="url(#chartGradient)"
        opacity="0.3"
      />

      {/* Line chart */}
      <path
        d="M40 200 L70 190 L100 182 L130 175 L160 165 L190 150 L220 138 L250 125 L280 108 L310 95 L340 78"
        stroke="#7c3aed"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Data points */}
      <circle cx="40" cy="200" r="3" fill="white" stroke="#7c3aed" strokeWidth="2" />
      <circle cx="100" cy="182" r="3" fill="white" stroke="#7c3aed" strokeWidth="2" />
      <circle cx="160" cy="165" r="3" fill="white" stroke="#7c3aed" strokeWidth="2" />
      <circle cx="220" cy="138" r="3" fill="white" stroke="#7c3aed" strokeWidth="2" />
      <circle cx="280" cy="108" r="3" fill="white" stroke="#7c3aed" strokeWidth="2" />
      <circle cx="340" cy="78" r="4" fill="#7c3aed" stroke="white" strokeWidth="2" />

      {/* X-axis labels */}
      <text x="40" y="238" fontSize="5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="middle">
        Jan
      </text>
      <text x="100" y="238" fontSize="5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="middle">
        Mar
      </text>
      <text x="160" y="238" fontSize="5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="middle">
        May
      </text>
      <text x="220" y="238" fontSize="5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="middle">
        Jul
      </text>
      <text x="280" y="238" fontSize="5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="middle">
        Sep
      </text>
      <text x="340" y="238" fontSize="5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="middle">
        Nov
      </text>

      {/* Revenue metric card */}
      <rect x="32" y="252" width="148" height="40" rx="8" fill="#faf5ff" stroke="#e9d5ff" strokeWidth="0.5" />
      <circle cx="50" cy="272" r="8" fill="#7c3aed" opacity="0.15" />
      <path d="M47 272 L50 269 L53 272 L50 275 Z" fill="#7c3aed" />
      <text x="66" y="268" fontSize="5.5" fill="#6b7280" fontFamily="sans-serif">
        Revenue
      </text>
      <text x="66" y="282" fontSize="9" fill="#7c3aed" fontFamily="sans-serif" fontWeight="700">
        $148,250
      </text>
      <text x="164" y="276" fontSize="6" fill="#16a34a" fontFamily="sans-serif" fontWeight="600">
        +12.5%
      </text>

      {/* Growth metric card */}
      <rect x="192" y="252" width="148" height="40" rx="8" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.5" />
      <circle cx="210" cy="272" r="8" fill="#16a34a" opacity="0.15" />
      <path d="M207 275 L210 269 L213 275" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <text x="226" y="268" fontSize="5.5" fill="#6b7280" fontFamily="sans-serif">
        Growth
      </text>
      <text x="226" y="282" fontSize="9" fill="#16a34a" fontFamily="sans-serif" fontWeight="700">
        24.8%
      </text>
      <text x="324" y="276" fontSize="6" fill="#16a34a" fontFamily="sans-serif" fontWeight="600">
        +3.2%
      </text>

      <defs>
        <linearGradient id="chartGradient" x1="190" y1="78" x2="190" y2="222" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" stopOpacity="0.4" />
          <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
