export default function CollectionIllustration() {
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
        <linearGradient id="overdueGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ef4444" />
          <stop offset="1" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="bellGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Calendar */}
      <g>
        <rect x="24" y="40" width="100" height="90" rx="8" fill="white" stroke="#e5e7eb" strokeWidth="1" />
        {/* Calendar header */}
        <rect x="24" y="40" width="100" height="22" rx="8" fill="#7c3aed" />
        <rect x="24" y="54" width="100" height="8" fill="#7c3aed" />
        <text x="74" y="55" fontSize="7" fill="white" fontFamily="sans-serif" fontWeight="600" textAnchor="middle">
          JUNE 2024
        </text>
        {/* Calendar grid */}
        <text x="38" y="76" fontSize="4.5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="middle">
          Mo
        </text>
        <text x="54" y="76" fontSize="4.5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="middle">
          Tu
        </text>
        <text x="70" y="76" fontSize="4.5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="middle">
          We
        </text>
        <text x="86" y="76" fontSize="4.5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="middle">
          Th
        </text>
        <text x="102" y="76" fontSize="4.5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="middle">
          Fr
        </text>
        <text x="116" y="76" fontSize="4.5" fill="#9ca3af" fontFamily="sans-serif" textAnchor="middle">
          Sa
        </text>
        {/* Week 1 */}
        <text x="38" y="88" fontSize="5" fill="#6b7280" fontFamily="sans-serif" textAnchor="middle">
          28
        </text>
        <text x="54" y="88" fontSize="5" fill="#6b7280" fontFamily="sans-serif" textAnchor="middle">
          29
        </text>
        <text x="70" y="88" fontSize="5" fill="#6b7280" fontFamily="sans-serif" textAnchor="middle">
          30
        </text>
        <text x="86" y="88" fontSize="5" fill="#374151" fontFamily="sans-serif" textAnchor="middle">
          1
        </text>
        <text x="102" y="88" fontSize="5" fill="#374151" fontFamily="sans-serif" textAnchor="middle">
          2
        </text>
        <text x="116" y="88" fontSize="5" fill="#374151" fontFamily="sans-serif" textAnchor="middle">
          3
        </text>
        {/* Week 2 */}
        <text x="38" y="100" fontSize="5" fill="#374151" fontFamily="sans-serif" textAnchor="middle">
          4
        </text>
        <text x="54" y="100" fontSize="5" fill="#374151" fontFamily="sans-serif" textAnchor="middle">
          5
        </text>
        <text x="70" y="100" fontSize="5" fill="#374151" fontFamily="sans-serif" textAnchor="middle">
          6
        </text>
        <text x="86" y="100" fontSize="5" fill="#374151" fontFamily="sans-serif" textAnchor="middle">
          7
        </text>
        {/* Overdue marker on 8th */}
        <circle cx="102" cy="98" r="7" fill="url(#overdueGrad)" />
        <text x="102" y="100.5" fontSize="5" fill="white" fontFamily="sans-serif" fontWeight="700" textAnchor="middle">
          8
        </text>
        <text x="116" y="100" fontSize="5" fill="#374151" fontFamily="sans-serif" textAnchor="middle">
          9
        </text>
        {/* Week 3 */}
        <text x="38" y="112" fontSize="5" fill="#374151" fontFamily="sans-serif" textAnchor="middle">
          10
        </text>
        <text x="54" y="112" fontSize="5" fill="#374151" fontFamily="sans-serif" textAnchor="middle">
          11
        </text>
        <text x="70" y="112" fontSize="5" fill="#374151" fontFamily="sans-serif" textAnchor="middle">
          12
        </text>
        <text x="86" y="112" fontSize="5" fill="#374151" fontFamily="sans-serif" textAnchor="middle">
          13
        </text>
        <text x="102" y="112" fontSize="5" fill="#374151" fontFamily="sans-serif" textAnchor="middle">
          14
        </text>
        <text x="116" y="112" fontSize="5" fill="#374151" fontFamily="sans-serif" textAnchor="middle">
          15
        </text>
        {/* Overdue badge */}
        <rect x="20" y="134" width="42" height="14" rx="7" fill="#fef2f2" stroke="#fecaca" strokeWidth="0.5" />
        <circle cx="30" cy="141" r="3" fill="#ef4444" />
        <text x="44" y="144" fontSize="5" fill="#ef4444" fontFamily="sans-serif" fontWeight="600">
          OVERDUE
        </text>
      </g>

      {/* Notification bell */}
      <g>
        <circle cx="180" cy="60" r="30" fill="#fffbeb" stroke="#fde68a" strokeWidth="1" />
        {/* Bell body */}
        <path
          d="M180 40 Q164 40, 160 56 L156 72 L204 72 L200 56 Q196 40, 180 40 Z"
          fill="url(#bellGrad)"
        />
        {/* Bell top */}
        <circle cx="180" cy="40" r="3" fill="#d97706" />
        {/* Bell clapper */}
        <circle cx="180" cy="76" r="4" fill="#d97706" />
        {/* Notification badge */}
        <circle cx="196" cy="46" r="8" fill="#ef4444" />
        <text x="196" y="49" fontSize="7" fill="white" fontFamily="sans-serif" fontWeight="700" textAnchor="middle">
          3
        </text>
        {/* Sound waves */}
        <path d="M210 50 Q218 56, 210 62" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M216 46 Q228 56, 216 66" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.3" />
      </g>

      {/* Escalation steps */}
      <g>
        <text x="280" y="32" fontSize="6" fill="#6b7280" fontFamily="sans-serif" fontWeight="600" textAnchor="middle">
          ESCALATION
        </text>

        {/* Step 1 */}
        <rect x="240" y="190" width="80" height="22" rx="4" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.5" />
        <text x="250" y="204" fontSize="5" fill="#16a34a" fontFamily="sans-serif" fontWeight="600">
          Email
        </text>
        <text x="280" y="204" fontSize="5" fill="#9ca3af" fontFamily="sans-serif">
          Day 1
        </text>
        <circle cx="310" cy="201" r="4" fill="#16a34a" opacity="0.2" />
        <path d="M308 201 L312 201 M310 199 L310 203" stroke="#16a34a" strokeWidth="1" />

        {/* Arrow up */}
        <line x1="280" y1="188" x2="280" y2="178" stroke="#d1d5db" strokeWidth="1" />
        <polygon points="277,180 280,174 283,180" fill="#d1d5db" />

        {/* Step 2 */}
        <rect x="240" y="148" width="80" height="22" rx="4" fill="#fffbeb" stroke="#fde68a" strokeWidth="0.5" />
        <text x="250" y="162" fontSize="5" fill="#d97706" fontFamily="sans-serif" fontWeight="600">
          SMS
        </text>
        <text x="280" y="162" fontSize="5" fill="#9ca3af" fontFamily="sans-serif">
          Day 7
        </text>
        <circle cx="310" cy="159" r="4" fill="#f59e0b" opacity="0.2" />
        <path d="M308 159 L312 159 M310 157 L310 161" stroke="#d97706" strokeWidth="1" />

        {/* Arrow up */}
        <line x1="280" y1="146" x2="280" y2="136" stroke="#d1d5db" strokeWidth="1" />
        <polygon points="277,138 280,132 283,138" fill="#d1d5db" />

        {/* Step 3 */}
        <rect x="240" y="106" width="80" height="22" rx="4" fill="#fef2f2" stroke="#fecaca" strokeWidth="0.5" />
        <text x="250" y="120" fontSize="5" fill="#dc2626" fontFamily="sans-serif" fontWeight="600">
          Call
        </text>
        <text x="280" y="120" fontSize="5" fill="#9ca3af" fontFamily="sans-serif">
          Day 14
        </text>
        <circle cx="310" cy="117" r="4" fill="#ef4444" opacity="0.2" />
        <path d="M308 117 L312 117 M310 115 L310 119" stroke="#dc2626" strokeWidth="1" />

        {/* Arrow up */}
        <line x1="280" y1="104" x2="280" y2="94" stroke="#d1d5db" strokeWidth="1" />
        <polygon points="277,96 280,90 283,96" fill="#d1d5db" />

        {/* Step 4 - Final */}
        <rect x="240" y="64" width="80" height="22" rx="4" fill="#fef2f2" stroke="#fca5a5" strokeWidth="1" />
        <text x="250" y="78" fontSize="5" fill="#991b1b" fontFamily="sans-serif" fontWeight="700">
          Legal
        </text>
        <text x="280" y="78" fontSize="5" fill="#9ca3af" fontFamily="sans-serif">
          Day 30
        </text>
        <circle cx="310" cy="75" r="4" fill="#ef4444" opacity="0.3" />
        <path d="M308 75 L312 75 M310 73 L310 77" stroke="#991b1b" strokeWidth="1.5" />
      </g>

      {/* Clock */}
      <g>
        <circle cx="90" cy="210" r="36" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
        <circle cx="90" cy="210" r="32" fill="white" stroke="#7c3aed" strokeWidth="1" opacity="0.2" />

        {/* Clock tick marks */}
        <line x1="90" y1="182" x2="90" y2="186" stroke="#d1d5db" strokeWidth="1" />
        <line x1="90" y1="234" x2="90" y2="238" stroke="#d1d5db" strokeWidth="1" />
        <line x1="62" y1="210" x2="66" y2="210" stroke="#d1d5db" strokeWidth="1" />
        <line x1="114" y1="210" x2="118" y2="210" stroke="#d1d5db" strokeWidth="1" />

        {/* Clock hour hand */}
        <line x1="90" y1="210" x2="90" y2="196" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
        {/* Clock minute hand */}
        <line x1="90" y1="210" x2="104" y2="204" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
        {/* Clock center */}
        <circle cx="90" cy="210" r="2.5" fill="#7c3aed" />

        {/* Clock label */}
        <text x="90" y="256" fontSize="6" fill="#6b7280" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">
          Time Passing
        </text>
      </g>

      {/* Connecting dotted line from calendar to bell */}
      <path
        d="M130 85 Q150 85, 155 65"
        stroke="#d1d5db"
        strokeWidth="1"
        fill="none"
        strokeDasharray="3 3"
      />

      {/* Connecting line from clock to escalation */}
      <path
        d="M130 210 Q180 210, 240 201"
        stroke="#d1d5db"
        strokeWidth="1"
        fill="none"
        strokeDasharray="3 3"
      />
    </svg>
  );
}
