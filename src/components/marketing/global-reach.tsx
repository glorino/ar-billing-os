export default function GlobalReach() {
  return (
    <svg
      viewBox="0 0 800 400"
      width="100%"
      height="auto"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="globe-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0E7FF" />
          <stop offset="100%" stopColor="#C7D2FE" />
        </linearGradient>
        <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="dot-purple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="dot-green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="dot-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="dot-orange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <filter id="map-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodOpacity="0.08" />
        </filter>
        <filter id="dot-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="800" height="400" fill="#FAFBFF" rx="16" />

      {/* Simplified world map outline */}
      <g opacity="0.12" fill="none" stroke="#6D28D9" strokeWidth="1.5">
        {/* North America */}
        <path d="M120 120 Q140 100 180 105 Q220 95 250 110 Q270 105 290 115 Q280 130 260 145 Q240 155 220 150 Q200 160 170 155 Q150 165 130 155 Q115 145 120 120 Z" />
        {/* South America */}
        <path d="M220 200 Q240 190 250 210 Q260 230 255 260 Q245 290 230 310 Q215 320 205 305 Q195 280 200 255 Q195 235 210 215 Q215 205 220 200 Z" />
        {/* Europe */}
        <path d="M370 100 Q390 90 420 95 Q445 100 460 110 Q470 120 460 135 Q445 145 425 140 Q405 145 385 135 Q370 125 370 100 Z" />
        {/* Africa */}
        <path d="M400 160 Q420 150 445 155 Q465 165 470 190 Q475 220 465 250 Q450 275 430 280 Q410 275 395 255 Q385 230 385 200 Q385 175 400 160 Z" />
        {/* Asia */}
        <path d="M500 90 Q540 80 580 90 Q620 95 650 110 Q670 125 660 145 Q645 160 620 155 Q595 160 570 150 Q545 155 520 145 Q500 130 495 115 Q490 100 500 90 Z" />
        {/* Australia */}
        <path d="M620 260 Q650 250 675 260 Q695 275 690 295 Q680 310 660 315 Q640 310 625 300 Q615 285 620 260 Z" />
      </g>

      {/* Grid lines */}
      <g stroke="#E5E7EB" strokeWidth="0.5" opacity="0.4">
        <line x1="0" y1="100" x2="800" y2="100" strokeDasharray="4 4" />
        <line x1="0" y1="200" x2="800" y2="200" strokeDasharray="4 4" />
        <line x1="0" y1="300" x2="800" y2="300" strokeDasharray="4 4" />
        <line x1="200" y1="0" x2="200" y2="400" strokeDasharray="4 4" />
        <line x1="400" y1="0" x2="400" y2="400" strokeDasharray="4 4" />
        <line x1="600" y1="0" x2="600" y2="400" strokeDasharray="4 4" />
      </g>

      {/* Connecting lines between regions */}
      <g stroke="url(#line-grad)" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="6 3">
        {/* Americas to Europe */}
        <path d="M200 150 Q300 80 400 110" />
        {/* Europe to Asia */}
        <path d="M440 120 Q520 90 590 120" />
        {/* Americas to Africa */}
        <path d="M220 200 Q310 210 400 180" />
        {/* Europe to Africa */}
        <path d="M420 140 Q410 160 420 180" />
        {/* Asia to Australia */}
        <path d="M620 150 Q640 200 650 260" />
      </g>

      {/* Region dots with labels */}
      {/* Americas */}
      <circle cx="180" cy="145" r="10" fill="url(#dot-purple)" filter="url(#dot-glow)" />
      <circle cx="180" cy="145" r="5" fill="white" />
      <text x="180" y="175" textAnchor="middle" fill="#4C1D95" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif">Americas</text>

      {/* Europe */}
      <circle cx="420" cy="115" r="10" fill="url(#dot-green)" filter="url(#dot-glow)" />
      <circle cx="420" cy="115" r="5" fill="white" />
      <text x="420" y="145" textAnchor="middle" fill="#059669" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif">Europe</text>

      {/* Africa */}
      <circle cx="430" cy="210" r="10" fill="url(#dot-orange)" filter="url(#dot-glow)" />
      <circle cx="430" cy="210" r="5" fill="white" />
      <text x="430" y="240" textAnchor="middle" fill="#EA580C" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif">Africa</text>

      {/* Asia */}
      <circle cx="590" cy="125" r="10" fill="url(#dot-blue)" filter="url(#dot-glow)" />
      <circle cx="590" cy="125" r="5" fill="white" />
      <text x="590" y="155" textAnchor="middle" fill="#2563EB" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif">Asia</text>

      {/* Australia */}
      <circle cx="660" cy="280" r="8" fill="url(#dot-purple)" filter="url(#dot-glow)" />
      <circle cx="660" cy="280" r="4" fill="white" />
      <text x="660" y="305" textAnchor="middle" fill="#4C1D95" fontSize="9" fontWeight="600" fontFamily="system-ui, sans-serif">APAC</text>

      {/* Pulse rings */}
      <circle cx="180" cy="145" r="16" fill="none" stroke="#8B5CF6" strokeWidth="1" opacity="0.3">
        <animate attributeName="r" values="10;22;10" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="420" cy="115" r="16" fill="none" stroke="#059669" strokeWidth="1" opacity="0.3">
        <animate attributeName="r" values="10;22;10" dur="3s" repeatCount="indefinite" begin="0.5s" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" begin="0.5s" />
      </circle>
      <circle cx="590" cy="125" r="16" fill="none" stroke="#2563EB" strokeWidth="1" opacity="0.3">
        <animate attributeName="r" values="10;22;10" dur="3s" repeatCount="indefinite" begin="1s" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" begin="1s" />
      </circle>
    </svg>
  );
}
