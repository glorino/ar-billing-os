export default function TeamIllustration() {
  return (
    <svg
      width="100%"
      height="auto"
      viewBox="0 0 600 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="teamBg" x1="0" y1="0" x2="600" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#667eea" stopOpacity="0.08" />
          <stop offset="50%" stopColor="#43e97b" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#fa709a" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="person1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
        <linearGradient id="person2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#43e97b" />
          <stop offset="100%" stopColor="#38f9d7" />
        </linearGradient>
        <linearGradient id="person3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fa709a" />
          <stop offset="100%" stopColor="#fee140" />
        </linearGradient>
        <linearGradient id="person4" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4facfe" />
          <stop offset="100%" stopColor="#00f2fe" />
        </linearGradient>
        <linearGradient id="person5" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a18cd1" />
          <stop offset="100%" stopColor="#fbc2eb" />
        </linearGradient>
        <linearGradient id="person6" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffecd2" />
          <stop offset="100%" stopColor="#fcb69f" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="600" height="300" fill="url(#teamBg)" />

      {/* Dotted connection lines */}
      <path
        d="M120 150 Q180 100 240 120"
        fill="none"
        stroke="#667eea"
        strokeWidth="2"
        strokeDasharray="6 4"
        opacity="0.4"
      />
      <path
        d="M240 120 Q300 80 360 130"
        fill="none"
        stroke="#43e97b"
        strokeWidth="2"
        strokeDasharray="6 4"
        opacity="0.4"
      />
      <path
        d="M360 130 Q420 90 480 140"
        fill="none"
        stroke="#fa709a"
        strokeWidth="2"
        strokeDasharray="6 4"
        opacity="0.4"
      />
      <path
        d="M120 150 Q180 200 240 180"
        fill="none"
        stroke="#4facfe"
        strokeWidth="2"
        strokeDasharray="6 4"
        opacity="0.4"
      />
      <path
        d="M240 180 Q300 220 360 170"
        fill="none"
        stroke="#a18cd1"
        strokeWidth="2"
        strokeDasharray="6 4"
        opacity="0.4"
      />
      <path
        d="M360 170 Q420 210 480 160"
        fill="none"
        stroke="#fcb69f"
        strokeWidth="2"
        strokeDasharray="6 4"
        opacity="0.4"
      />
      <path
        d="M120 150 L480 160"
        fill="none"
        stroke="#667eea"
        strokeWidth="1"
        strokeDasharray="4 6"
        opacity="0.15"
      />
      <path
        d="M240 120 L360 170"
        fill="none"
        stroke="#43e97b"
        strokeWidth="1"
        strokeDasharray="4 6"
        opacity="0.15"
      />

      {/* Person 1 - far left */}
      <g transform="translate(80, 100)">
        <circle cx="40" cy="30" r="22" fill="url(#person1)" />
        <ellipse cx="40" cy="80" rx="30" ry="24" fill="url(#person1)" />
        <circle cx="40" cy="30" r="8" fill="#ffffff" opacity="0.15" />
      </g>

      {/* Person 2 - left center */}
      <g transform="translate(200, 72)">
        <circle cx="40" cy="30" r="24" fill="url(#person2)" />
        <ellipse cx="40" cy="82" rx="32" ry="26" fill="url(#person2)" />
        <circle cx="40" cy="30" r="9" fill="#ffffff" opacity="0.15" />
      </g>

      {/* Person 3 - center */}
      <g transform="translate(320, 84)">
        <circle cx="40" cy="30" r="26" fill="url(#person3)" />
        <ellipse cx="40" cy="84" rx="34" ry="28" fill="url(#person3)" />
        <circle cx="40" cy="30" r="10" fill="#ffffff" opacity="0.15" />
      </g>

      {/* Person 4 - right center */}
      <g transform="translate(440, 96)">
        <circle cx="40" cy="30" r="23" fill="url(#person4)" />
        <ellipse cx="40" cy="80" rx="31" ry="25" fill="url(#person4)" />
        <circle cx="40" cy="30" r="8" fill="#ffffff" opacity="0.15" />
      </g>

      {/* Person 5 - bottom left */}
      <g transform="translate(200, 148)">
        <circle cx="40" cy="28" r="20" fill="url(#person5)" />
        <ellipse cx="40" cy="74" rx="28" ry="22" fill="url(#person5)" />
        <circle cx="40" cy="28" r="7" fill="#ffffff" opacity="0.15" />
      </g>

      {/* Person 6 - bottom right */}
      <g transform="translate(360, 136)">
        <circle cx="40" cy="28" r="21" fill="url(#person6)" />
        <ellipse cx="40" cy="76" rx="29" ry="23" fill="url(#person6)" />
        <circle cx="40" cy="28" r="7" fill="#ffffff" opacity="0.15" />
      </g>

      {/* Collaboration dots */}
      <circle cx="180" cy="140" r="4" fill="#667eea" opacity="0.6" />
      <circle cx="300" cy="110" r="4" fill="#43e97b" opacity="0.6" />
      <circle cx="420" cy="130" r="4" fill="#fa709a" opacity="0.6" />
      <circle cx="300" cy="190" r="3" fill="#4facfe" opacity="0.5" />
      <circle cx="380" cy="180" r="3" fill="#a18cd1" opacity="0.5" />
    </svg>
  );
}
