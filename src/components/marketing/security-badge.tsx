export default function SecurityBadge() {
  return (
    <svg
      viewBox="0 0 200 200"
      width="100%"
      height="auto"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#6D28D9" />
          <stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>
        <linearGradient id="shield-inner" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <filter id="shield-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.2" />
        </filter>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer shield */}
      <path
        d="M100 15 L175 50 L175 105 Q175 160 100 190 Q25 160 25 105 L25 50 Z"
        fill="url(#shield-grad)"
        filter="url(#shield-shadow)"
      />

      {/* Inner shield border */}
      <path
        d="M100 25 L165 55 L165 102 Q165 152 100 180 Q35 152 35 102 L35 55 Z"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.3"
      />

      {/* Shield accent line */}
      <path
        d="M100 25 L165 55 L165 102 Q165 152 100 180 Q35 152 35 102 L35 55 Z"
        fill="url(#shield-inner)"
        opacity="0.15"
      />

      {/* Lock body */}
      <rect x="82" y="90" width="36" height="28" rx="4" fill="white" opacity="0.95" />

      {/* Lock shackle */}
      <path
        d="M88 90 L88 78 Q88 68 100 68 Q112 68 112 78 L112 90"
        fill="none"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.95"
      />

      {/* Lock keyhole */}
      <circle cx="100" cy="102" r="3" fill="#6D28D9" />
      <rect x="99" y="102" width="2" height="6" rx="1" fill="#6D28D9" />

      {/* SOC 2 text */}
      <text x="100" y="140" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="1">
        SOC 2
      </text>

      {/* GDPR text */}
      <text x="100" y="158" textAnchor="middle" fill="white" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" letterSpacing="0.5" opacity="0.85">
        GDPR
      </text>

      {/* Checkmark top-right */}
      <circle cx="160" cy="40" r="14" fill="#10B981" filter="url(#glow)" />
      <path d="M153 40 L158 45 L168 35" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Checkmark bottom-right */}
      <circle cx="155" cy="160" r="12" fill="#10B981" filter="url(#glow)" />
      <path d="M149 160 L153 164 L162 155" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Checkmark top-left */}
      <circle cx="40" cy="40" r="14" fill="#10B981" filter="url(#glow)" />
      <path d="M33 40 L38 45 L48 35" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Checkmark bottom-left */}
      <circle cx="45" cy="160" r="12" fill="#10B981" filter="url(#glow)" />
      <path d="M39 160 L43 164 L52 155" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Decorative dots */}
      <circle cx="100" cy="20" r="2" fill="#C4B5FD" opacity="0.5" />
      <circle cx="100" cy="188" r="2" fill="#C4B5FD" opacity="0.5" />
    </svg>
  );
}
