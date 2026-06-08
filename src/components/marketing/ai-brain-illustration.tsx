export default function AiBrainIllustration() {
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
        <linearGradient id="brainGrad" x1="100" y1="50" x2="300" y2="250" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="0.5" stopColor="#6d28d9" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="nodeGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background decorative circles */}
      <circle cx="200" cy="150" r="120" fill="#7c3aed" opacity="0.03" />
      <circle cx="200" cy="150" r="90" fill="#7c3aed" opacity="0.04" />
      <circle cx="200" cy="150" r="60" fill="#7c3aed" opacity="0.05" />

      {/* Brain outline - left hemisphere */}
      <path
        d="M200 60
           Q160 60, 130 80
           Q100 100, 95 140
           Q90 180, 110 210
           Q130 240, 160 250
           Q180 258, 200 260"
        stroke="url(#brainGrad)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Brain outline - right hemisphere */}
      <path
        d="M200 60
           Q240 60, 270 80
           Q300 100, 305 140
           Q310 180, 290 210
           Q270 240, 240 250
           Q220 258, 200 260"
        stroke="url(#brainGrad)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Brain center line */}
      <path
        d="M200 65 Q200 160, 200 255"
        stroke="url(#brainGrad)"
        strokeWidth="1"
        fill="none"
        opacity="0.4"
        strokeDasharray="4 4"
      />

      {/* Brain folds - left */}
      <path d="M140 100 Q160 110, 170 95" stroke="#7c3aed" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M115 140 Q140 150, 160 135" stroke="#7c3aed" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M120 180 Q145 190, 165 175" stroke="#7c3aed" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M140 215 Q160 220, 175 210" stroke="#7c3aed" strokeWidth="1.5" fill="none" opacity="0.5" />

      {/* Brain folds - right */}
      <path d="M260 100 Q240 110, 230 95" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M285 140 Q260 150, 240 135" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M280 180 Q255 190, 235 175" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M260 215 Q240 220, 225 210" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.5" />

      {/* Circuit pattern lines */}
      <g stroke="#7c3aed" strokeWidth="1" opacity="0.3">
        <line x1="130" y1="120" x2="100" y2="120" />
        <line x1="100" y1="120" x2="100" y2="90" />
        <line x1="270" y1="120" x2="300" y2="120" />
        <line x1="300" y1="120" x2="300" y2="90" />
        <line x1="120" y1="180" x2="85" y2="180" />
        <line x1="85" y1="180" x2="85" y2="210" />
        <line x1="280" y1="180" x2="315" y2="180" />
        <line x1="315" y1="180" x2="315" y2="210" />
        <line x1="150" y1="240" x2="130" y2="260" />
        <line x1="250" y1="240" x2="270" y2="260" />
      </g>

      {/* Circuit nodes */}
      <circle cx="100" cy="90" r="4" fill="#7c3aed" opacity="0.6" />
      <circle cx="300" cy="90" r="4" fill="#3b82f6" opacity="0.6" />
      <circle cx="85" cy="210" r="4" fill="#7c3aed" opacity="0.6" />
      <circle cx="315" cy="210" r="4" fill="#3b82f6" opacity="0.6" />
      <circle cx="130" cy="260" r="4" fill="#7c3aed" opacity="0.6" />
      <circle cx="270" cy="260" r="4" fill="#3b82f6" opacity="0.6" />

      {/* Connected nodes - orbiting */}
      <g filter="url(#glow)">
        {/* Node 1 - top */}
        <circle cx="200" cy="40" r="8" fill="url(#nodeGrad)" />
        <circle cx="200" cy="40" r="3" fill="white" opacity="0.8" />
        <line x1="200" y1="48" x2="200" y2="62" stroke="#7c3aed" strokeWidth="1" opacity="0.5" />

        {/* Node 2 - left */}
        <circle cx="75" cy="150" r="8" fill="url(#nodeGrad)" />
        <circle cx="75" cy="150" r="3" fill="white" opacity="0.8" />
        <line x1="83" y1="150" x2="95" y2="150" stroke="#7c3aed" strokeWidth="1" opacity="0.5" />

        {/* Node 3 - right */}
        <circle cx="325" cy="150" r="8" fill="url(#nodeGrad)" />
        <circle cx="325" cy="150" r="3" fill="white" opacity="0.8" />
        <line x1="317" y1="150" x2="305" y2="150" stroke="#7c3aed" strokeWidth="1" opacity="0.5" />

        {/* Node 4 - bottom left */}
        <circle cx="120" cy="270" r="6" fill="#7c3aed" opacity="0.7" />
        <circle cx="120" cy="270" r="2" fill="white" opacity="0.8" />

        {/* Node 5 - bottom right */}
        <circle cx="280" cy="270" r="6" fill="#3b82f6" opacity="0.7" />
        <circle cx="280" cy="270" r="2" fill="white" opacity="0.8" />
      </g>

      {/* Data flow lines */}
      <g stroke="#7c3aed" strokeWidth="0.8" opacity="0.25" strokeDasharray="3 5">
        <path d="M200 48 L200 62" />
        <path d="M83 150 L95 140" />
        <path d="M317 150 L305 140" />
        <path d="M120 264 L160 250" />
        <path d="M280 264 L240 250" />
      </g>

      {/* Pulsing dots */}
      <g filter="url(#softGlow)">
        <circle cx="160" cy="100" r="2.5" fill="#7c3aed">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="240" cy="100" r="2.5" fill="#3b82f6">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="140" cy="160" r="2.5" fill="#7c3aed">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="260" cy="160" r="2.5" fill="#3b82f6">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="170" cy="220" r="2.5" fill="#7c3aed">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="0.3s" repeatCount="indefinite" />
        </circle>
        <circle cx="230" cy="220" r="2.5" fill="#3b82f6">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="0.8s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Inner brain glow spots */}
      <circle cx="165" cy="130" r="15" fill="#7c3aed" opacity="0.06" />
      <circle cx="235" cy="130" r="15" fill="#3b82f6" opacity="0.06" />
      <circle cx="175" cy="190" r="12" fill="#7c3aed" opacity="0.05" />
      <circle cx="225" cy="190" r="12" fill="#3b82f6" opacity="0.05" />

      {/* AI text label */}
      <text x="200" y="295" fontSize="8" fill="#7c3aed" fontFamily="sans-serif" fontWeight="600" textAnchor="middle" opacity="0.6">
        INTELLIGENT AUTOMATION
      </text>
    </svg>
  );
}
