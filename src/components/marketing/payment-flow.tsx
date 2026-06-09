export default function PaymentFlow() {
  return (
    <svg
      width="100%"
      height="auto"
      viewBox="0 0 600 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background gradient */}
      <defs>
        <linearGradient id="paymentBg" x1="0" y1="0" x2="600" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#667eea" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#43e97b" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect width="600" height="200" rx="12" fill="url(#paymentBg)" />

      {/* Credit card icon */}
      <g transform="translate(60, 50)">
        <rect x="0" y="16" width="120" height="72" rx="10" fill="#667eea" />
        <rect x="0" y="32" width="120" height="16" fill="#5a67d8" />
        <rect x="12" y="56" width="40" height="8" rx="2" fill="#ffffff" opacity="0.6" />
        <rect x="12" y="68" width="24" height="6" rx="1" fill="#ffffff" opacity="0.4" />
        <rect x="80" y="60" width="28" height="12" rx="2" fill="#fa709a" opacity="0.8" />
        <circle cx="90" cy="66" r="4" fill="#ffffff" opacity="0.3" />
        <circle cx="100" cy="66" r="4" fill="#ffffff" opacity="0.3" />
      </g>

      {/* Arrow with processing text */}
      <g transform="translate(220, 72)">
        {/* Arrow body */}
        <rect x="0" y="8" width="120" height="4" rx="2" fill="#667eea" opacity="0.3" />
        <rect x="0" y="8" width="80" height="4" rx="2" fill="#667eea" />

        {/* Arrow head */}
        <path d="M112 2 L132 10 L112 18" fill="none" stroke="#667eea" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Processing dots */}
        <circle cx="30" cy="10" r="3" fill="#667eea">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0s" />
        </circle>
        <circle cx="46" cy="10" r="3" fill="#667eea">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
        </circle>
        <circle cx="62" cy="10" r="3" fill="#667eea">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.6s" />
        </circle>

        {/* Processing text */}
        <text x="66" y="40" textAnchor="middle" fill="#667eea" fontSize="12" fontFamily="sans-serif" fontWeight="500">
          Processing...
        </text>
      </g>

      {/* Checkmark / Complete */}
      <g transform="translate(420, 50)">
        <circle cx="40" cy="52" r="40" fill="#43e97b" opacity="0.12" />
        <circle cx="40" cy="52" r="32" fill="#43e97b" opacity="0.15" />
        <circle cx="40" cy="52" r="24" fill="#43e97b" />

        {/* Checkmark */}
        <path
          d="M30 52 L37 59 L52 44"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Complete text */}
        <text x="40" y="100" textAnchor="middle" fill="#43e97b" fontSize="13" fontFamily="sans-serif" fontWeight="600">
          Complete
        </text>
      </g>

      {/* Payment method icons */}
      <g transform="translate(150, 148)">
        {/* ACH */}
        <rect x="0" y="0" width="100" height="36" rx="8" fill="#1a1a3e" />
        <rect x="12" y="8" width="32" height="8" rx="2" fill="#667eea" opacity="0.7" />
        <rect x="12" y="20" width="48" height="6" rx="1" fill="#ffffff" opacity="0.3" />

        {/* Wire */}
        <rect x="120" y="0" width="100" height="36" rx="8" fill="#1a1a3e" />
        <rect x="132" y="8" width="28" height="8" rx="2" fill="#4facfe" opacity="0.7" />
        <rect x="132" y="20" width="44" height="6" rx="1" fill="#ffffff" opacity="0.3" />

        {/* Card */}
        <rect x="240" y="0" width="100" height="36" rx="8" fill="#1a1a3e" />
        <rect x="252" y="8" width="24" height="8" rx="2" fill="#fa709a" opacity="0.7" />
        <rect x="252" y="20" width="40" height="6" rx="1" fill="#ffffff" opacity="0.3" />
      </g>

      {/* Labels under payment methods */}
      <text x="200" y="198" textAnchor="middle" fill="#667eea" fontSize="10" fontFamily="sans-serif" fontWeight="500">
        ACH Transfer
      </text>
      <text x="320" y="198" textAnchor="middle" fill="#4facfe" fontSize="10" fontFamily="sans-serif" fontWeight="500">
        Wire Transfer
      </text>
      <text x="440" y="198" textAnchor="middle" fill="#fa709a" fontSize="10" fontFamily="sans-serif" fontWeight="500">
        Credit Card
      </text>
    </svg>
  );
}
