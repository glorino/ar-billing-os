export default function DashboardPreview() {
  return (
    <svg
      width="100%"
      height="auto"
      viewBox="0 0 600 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Browser window frame */}
      <rect x="20" y="20" width="560" height="360" rx="12" fill="#1a1a2e" />
      <rect x="20" y="20" width="560" height="40" rx="12" fill="#16213e" />
      <rect x="20" y="48" width="560" height="12" fill="#16213e" />

      {/* Title bar dots */}
      <circle cx="44" cy="40" r="6" fill="#ff5f57" />
      <circle cx="64" cy="40" r="6" fill="#ffbd2e" />
      <circle cx="84" cy="40" r="6" fill="#28ca41" />

      {/* Dashboard content area */}
      <rect x="40" y="80" width="520" height="280" rx="8" fill="#0f0f23" />

      {/* Top metric cards */}
      <rect x="56" y="100" width="112" height="56" rx="8" fill="#1a1a3e" />
      <rect x="64" y="108" width="60" height="8" rx="2" fill="#667eea" />
      <rect x="64" y="124" width="40" height="16" rx="2" fill="#ffffff" opacity="0.9" />
      <rect x="64" y="144" width="50" height="6" rx="1" fill="#43e97b" />

      <rect x="184" y="100" width="112" height="56" rx="8" fill="#1a1a3e" />
      <rect x="192" y="108" width="50" height="8" rx="2" fill="#43e97b" />
      <rect x="192" y="124" width="36" height="16" rx="2" fill="#ffffff" opacity="0.9" />
      <rect x="192" y="144" width="45" height="6" rx="1" fill="#fa709a" />

      <rect x="312" y="100" width="112" height="56" rx="8" fill="#1a1a3e" />
      <rect x="320" y="108" width="55" height="8" rx="2" fill="#fa709a" />
      <rect x="320" y="124" width="32" height="16" rx="2" fill="#ffffff" opacity="0.9" />
      <rect x="320" y="144" width="42" height="6" rx="1" fill="#4facfe" />

      <rect x="440" y="100" width="112" height="56" rx="8" fill="#1a1a3e" />
      <rect x="448" y="108" width="48" height="8" rx="2" fill="#4facfe" />
      <rect x="448" y="124" width="38" height="16" rx="2" fill="#ffffff" opacity="0.9" />
      <rect x="448" y="144" width="40" height="6" rx="1" fill="#667eea" />

      {/* Bar chart area */}
      <rect x="56" y="172" width="360" height="176" rx="8" fill="#1a1a3e" />
      <rect x="68" y="188" width="80" height="8" rx="2" fill="#ffffff" opacity="0.3" />

      {/* Chart bars */}
      <rect x="76" y="280" width="28" height="56" rx="4" fill="#667eea" />
      <rect x="116" y="256" width="28" height="80" rx="4" fill="#43e97b" />
      <rect x="156" y="232" width="28" height="104" rx="4" fill="#fa709a" />
      <rect x="196" y="264" width="28" height="72" rx="4" fill="#4facfe" />
      <rect x="236" y="244" width="28" height="92" rx="4" fill="#667eea" />
      <rect x="276" y="272" width="28" height="64" rx="4" fill="#43e97b" />
      <rect x="316" y="240" width="28" height="96" rx="4" fill="#fa709a" />
      <rect x="356" y="260" width="28" height="76" rx="4" fill="#4facfe" />

      {/* Chart grid lines */}
      <line x1="72" y1="280" x2="400" y2="280" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" />
      <line x1="72" y1="256" x2="400" y2="256" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" />
      <line x1="72" y1="232" x2="400" y2="232" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" />

      {/* Small table */}
      <rect x="436" y="172" width="116" height="176" rx="8" fill="#1a1a3e" />
      <rect x="444" y="188" width="72" height="8" rx="2" fill="#ffffff" opacity="0.3" />

      {/* Table rows */}
      <rect x="444" y="208" width="100" height="6" rx="1" fill="#ffffff" opacity="0.08" />
      <rect x="444" y="220" width="80" height="6" rx="1" fill="#667eea" />
      <rect x="444" y="236" width="100" height="6" rx="1" fill="#ffffff" opacity="0.08" />
      <rect x="444" y="248" width="90" height="6" rx="1" fill="#43e97b" />
      <rect x="444" y="264" width="100" height="6" rx="1" fill="#ffffff" opacity="0.08" />
      <rect x="444" y="276" width="70" height="6" rx="1" fill="#fa709a" />
      <rect x="444" y="292" width="100" height="6" rx="1" fill="#ffffff" opacity="0.08" />
      <rect x="444" y="304" width="85" height="6" rx="1" fill="#4facfe" />
      <rect x="444" y="320" width="100" height="6" rx="1" fill="#ffffff" opacity="0.08" />
      <rect x="444" y="332" width="75" height="6" rx="1" fill="#667eea" />
    </svg>
  );
}
