export default function HeroDashboardMockup() {
  return (
    <svg
      width="100%"
      height="auto"
      viewBox="0 0 800 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heroGlow" x1="0" y1="0" x2="800" y2="500" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#667eea" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#43e97b" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      <rect width="800" height="500" fill="url(#heroGlow)" />

      {/* Browser window frame */}
      <rect x="40" y="20" width="720" height="460" rx="16" fill="#0d0d1a" />
      <rect x="40" y="20" width="720" height="48" rx="16" fill="#12122a" />
      <rect x="40" y="52" width="720" height="16" fill="#12122a" />

      {/* Window controls */}
      <circle cx="68" cy="44" r="6" fill="#ff5f57" />
      <circle cx="92" cy="44" r="6" fill="#ffbd2e" />
      <circle cx="116" cy="44" r="6" fill="#28ca41" />

      {/* URL bar */}
      <rect x="148" y="34" width="280" height="20" rx="10" fill="#1a1a3e" />
      <rect x="164" y="40" width="16" height="8" rx="2" fill="#43e97b" opacity="0.6" />
      <rect x="188" y="40" width="120" height="8" rx="2" fill="#ffffff" opacity="0.2" />

      {/* Dashboard content */}
      <rect x="56" y="88" width="688" height="376" rx="10" fill="#0a0a18" />

      {/* Left sidebar - dark */}
      <rect x="56" y="88" width="60" height="376" rx="10" fill="#0f0f24" />
      <rect x="56" y="120" width="60" height="344" fill="#0f0f24" />

      {/* Sidebar icons */}
      <rect x="72" y="104" width="28" height="28" rx="6" fill="#667eea" opacity="0.2" />
      <rect x="80" y="112" width="12" height="12" rx="2" fill="#667eea" opacity="0.8" />

      <rect x="72" y="148" width="28" height="28" rx="6" fill="#ffffff" opacity="0.06" />
      <rect x="80" y="156" width="12" height="12" rx="2" fill="#ffffff" opacity="0.25" />

      <rect x="72" y="188" width="28" height="28" rx="6" fill="#ffffff" opacity="0.06" />
      <rect x="80" y="196" width="12" height="12" rx="2" fill="#ffffff" opacity="0.25" />

      <rect x="72" y="228" width="28" height="28" rx="6" fill="#ffffff" opacity="0.06" />
      <rect x="80" y="236" width="12" height="12" rx="2" fill="#ffffff" opacity="0.25" />

      <rect x="72" y="268" width="28" height="28" rx="6" fill="#ffffff" opacity="0.06" />
      <rect x="80" y="276" width="12" height="12" rx="2" fill="#ffffff" opacity="0.25" />

      {/* Top bar */}
      <rect x="116" y="88" width="628" height="44" fill="#0d0d1a" />

      {/* Search bar */}
      <rect x="132" y="98" width="240" height="24" rx="12" fill="#1a1a3e" />
      <rect x="144" y="106" width="16" height="8" rx="2" fill="#ffffff" opacity="0.2" />
      <rect x="168" y="106" width="80" height="8" rx="2" fill="#ffffff" opacity="0.15" />

      {/* Profile avatar */}
      <circle cx="720" cy="110" r="14" fill="#667eea" opacity="0.3" />
      <circle cx="720" cy="107" r="5" fill="#ffffff" opacity="0.4" />
      <ellipse cx="720" cy="118" rx="8" ry="5" fill="#ffffff" opacity="0.3" />

      {/* Notification bell */}
      <rect x="680" y="100" width="20" height="20" rx="10" fill="#ffffff" opacity="0.06" />
      <rect x="686" y="106" width="8" height="8" rx="4" fill="#fa709a" opacity="0.6" />

      {/* Metric cards row */}
      <rect x="132" y="148" width="148" height="72" rx="10" fill="#1a1a3e" />
      <rect x="144" y="160" width="60" height="8" rx="2" fill="#667eea" opacity="0.7" />
      <rect x="144" y="176" width="48" height="18" rx="2" fill="#ffffff" opacity="0.9" />
      <rect x="144" y="200" width="56" height="6" rx="1" fill="#43e97b" />
      <rect x="248" y="172" width="20" height="20" rx="10" fill="#667eea" opacity="0.12" />
      <rect x="254" y="178" width="8" height="8" rx="2" fill="#667eea" opacity="0.5" />

      <rect x="296" y="148" width="148" height="72" rx="10" fill="#1a1a3e" />
      <rect x="308" y="160" width="50" height="8" rx="2" fill="#43e97b" opacity="0.7" />
      <rect x="308" y="176" width="44" height="18" rx="2" fill="#ffffff" opacity="0.9" />
      <rect x="308" y="200" width="48" height="6" rx="1" fill="#fa709a" />
      <rect x="404" y="172" width="20" height="20" rx="10" fill="#43e97b" opacity="0.12" />
      <rect x="410" y="178" width="8" height="8" rx="2" fill="#43e97b" opacity="0.5" />

      <rect x="460" y="148" width="148" height="72" rx="10" fill="#1a1a3e" />
      <rect x="472" y="160" width="55" height="8" rx="2" fill="#fa709a" opacity="0.7" />
      <rect x="472" y="176" width="40" height="18" rx="2" fill="#ffffff" opacity="0.9" />
      <rect x="472" y="200" width="52" height="6" rx="1" fill="#4facfe" />
      <rect x="568" y="172" width="20" height="20" rx="10" fill="#fa709a" opacity="0.12" />
      <rect x="574" y="178" width="8" height="8" rx="2" fill="#fa709a" opacity="0.5" />

      <rect x="624" y="148" width="108" height="72" rx="10" fill="#1a1a3e" />
      <rect x="636" y="160" width="45" height="8" rx="2" fill="#4facfe" opacity="0.7" />
      <rect x="636" y="176" width="36" height="18" rx="2" fill="#ffffff" opacity="0.9" />
      <rect x="636" y="200" width="44" height="6" rx="1" fill="#667eea" />
      <rect x="708" y="172" width="16" height="20" rx="8" fill="#4facfe" opacity="0.12" />
      <rect x="712" y="178" width="8" height="8" rx="2" fill="#4facfe" opacity="0.5" />

      {/* Large chart area */}
      <rect x="132" y="236" width="460" height="216" rx="10" fill="#1a1a3e" />
      <rect x="148" y="252" width="80" height="10" rx="2" fill="#ffffff" opacity="0.25" />
      <rect x="148" y="272" width="420" height="164" rx="6" fill="#0f0f24" />

      {/* Chart grid */}
      <line x1="168" y1="300" x2="556" y2="300" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
      <line x1="168" y1="330" x2="556" y2="330" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
      <line x1="168" y1="360" x2="556" y2="360" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
      <line x1="168" y1="390" x2="556" y2="390" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />

      {/* Chart area fill */}
      <path
        d="M176 400 L176 350 L216 340 L256 360 L296 320 L336 330 L376 290 L416 310 L456 280 L496 300 L536 270 L536 400 Z"
        fill="url(#heroGlow)"
      />

      {/* Chart line */}
      <path
        d="M176 350 L216 340 L256 360 L296 320 L336 330 L376 290 L416 310 L456 280 L496 300 L536 270"
        fill="none"
        stroke="#667eea"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Chart line glow */}
      <path
        d="M176 350 L216 340 L256 360 L296 320 L336 330 L376 290 L416 310 L456 280 L496 300 L536 270"
        fill="none"
        stroke="#667eea"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.15"
      />

      {/* Chart dots */}
      <circle cx="176" cy="350" r="3" fill="#667eea" />
      <circle cx="256" cy="360" r="3" fill="#667eea" />
      <circle cx="336" cy="330" r="3" fill="#667eea" />
      <circle cx="416" cy="310" r="3" fill="#667eea" />
      <circle cx="496" cy="300" r="3" fill="#667eea" />
      <circle cx="536" cy="270" r="4" fill="#667eea" />
      <circle cx="536" cy="270" r="8" fill="#667eea" opacity="0.15" />

      {/* Bar chart overlay */}
      <rect x="196" y="370" width="18" height="24" rx="3" fill="#43e97b" opacity="0.3" />
      <rect x="236" y="362" width="18" height="32" rx="3" fill="#43e97b" opacity="0.35" />
      <rect x="276" y="374" width="18" height="20" rx="3" fill="#43e97b" opacity="0.3" />
      <rect x="316" y="350" width="18" height="44" rx="3" fill="#43e97b" opacity="0.4" />
      <rect x="356" y="358" width="18" height="36" rx="3" fill="#43e97b" opacity="0.35" />
      <rect x="396" y="340" width="18" height="54" rx="3" fill="#43e97b" opacity="0.45" />
      <rect x="436" y="346" width="18" height="48" rx="3" fill="#43e97b" opacity="0.4" />
      <rect x="476" y="330" width="18" height="64" rx="3" fill="#43e97b" opacity="0.5" />
      <rect x="516" y="310" width="18" height="84" rx="3" fill="#43e97b" opacity="0.55" />

      {/* Chart legend */}
      <rect x="148" y="436" width="8" height="8" rx="2" fill="#667eea" />
      <rect x="162" y="438" width="40" height="4" rx="1" fill="#ffffff" opacity="0.2" />
      <rect x="212" y="436" width="8" height="8" rx="2" fill="#43e97b" />
      <rect x="226" y="438" width="36" height="4" rx="1" fill="#ffffff" opacity="0.2" />

      {/* Right sidebar - activity feed */}
      <rect x="608" y="236" width="124" height="216" rx="10" fill="#1a1a3e" />
      <rect x="620" y="252" width="60" height="8" rx="2" fill="#ffffff" opacity="0.25" />

      {/* Activity items */}
      <circle cx="632" cy="284" r="8" fill="#667eea" opacity="0.25" />
      <rect x="648" y="278" width="68" height="5" rx="1" fill="#ffffff" opacity="0.15" />
      <rect x="648" y="287" width="52" height="4" rx="1" fill="#ffffff" opacity="0.08" />
      <rect x="620" y="300" width="104" height="1" fill="#ffffff" opacity="0.05" />

      <circle cx="632" cy="320" r="8" fill="#43e97b" opacity="0.25" />
      <rect x="648" y="314" width="60" height="5" rx="1" fill="#ffffff" opacity="0.15" />
      <rect x="648" y="323" width="48" height="4" rx="1" fill="#ffffff" opacity="0.08" />
      <rect x="620" y="336" width="104" height="1" fill="#ffffff" opacity="0.05" />

      <circle cx="632" cy="356" r="8" fill="#fa709a" opacity="0.25" />
      <rect x="648" y="350" width="64" height="5" rx="1" fill="#ffffff" opacity="0.15" />
      <rect x="648" y="359" width="44" height="4" rx="1" fill="#ffffff" opacity="0.08" />
      <rect x="620" y="372" width="104" height="1" fill="#ffffff" opacity="0.05" />

      <circle cx="632" cy="392" r="8" fill="#4facfe" opacity="0.25" />
      <rect x="648" y="386" width="56" height="5" rx="1" fill="#ffffff" opacity="0.15" />
      <rect x="648" y="395" width="40" height="4" rx="1" fill="#ffffff" opacity="0.08" />
      <rect x="620" y="408" width="104" height="1" fill="#ffffff" opacity="0.05" />

      <circle cx="632" cy="428" r="8" fill="#a18cd1" opacity="0.25" />
      <rect x="648" y="422" width="58" height="5" rx="1" fill="#ffffff" opacity="0.15" />
      <rect x="648" y="431" width="46" height="4" rx="1" fill="#ffffff" opacity="0.08" />
    </svg>
  );
}
