export default function InvoiceIllustration() {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="auto"
      aria-hidden="true"
    >
      {/* Card shadow */}
      <rect x="8" y="8" width="320" height="260" rx="16" fill="#f3f4f6" />

      {/* Main card */}
      <rect x="4" y="4" width="320" height="260" rx="16" fill="white" stroke="#e5e7eb" strokeWidth="1" />

      {/* Header bar */}
      <rect x="4" y="4" width="320" height="48" rx="16" fill="#7c3aed" />
      <rect x="4" y="36" width="320" height="16" fill="#7c3aed" />

      {/* Company logo placeholder */}
      <rect x="24" y="18" width="28" height="14" rx="3" fill="white" opacity="0.9" />
      <text x="38" y="29" fontSize="8" fill="white" fontFamily="sans-serif" fontWeight="600" textAnchor="middle">
        LOGO
      </text>

      {/* Invoice title */}
      <text x="280" y="22" fontSize="9" fill="white" fontFamily="sans-serif" fontWeight="700" textAnchor="end" opacity="0.9">
        INVOICE
      </text>
      <text x="280" y="34" fontSize="6" fill="white" fontFamily="sans-serif" opacity="0.7" textAnchor="end">
        #INV-2024-001
      </text>

      {/* Bill To section */}
      <text x="24" y="76" fontSize="6" fill="#7c3aed" fontFamily="sans-serif" fontWeight="700">
        BILL TO
      </text>
      <text x="24" y="88" fontSize="7" fill="#374151" fontFamily="sans-serif" fontWeight="600">
        Acme Corp
      </text>
      <text x="24" y="98" fontSize="5" fill="#9ca3af" fontFamily="sans-serif">
        123 Business St
      </text>
      <text x="24" y="106" fontSize="5" fill="#9ca3af" fontFamily="sans-serif">
        New York, NY 10001
      </text>

      {/* Ship To section */}
      <text x="170" y="76" fontSize="6" fill="#7c3aed" fontFamily="sans-serif" fontWeight="700">
        SHIP TO
      </text>
      <text x="170" y="88" fontSize="7" fill="#374151" fontFamily="sans-serif" fontWeight="600">
        Warehouse B
      </text>
      <text x="170" y="98" fontSize="5" fill="#9ca3af" fontFamily="sans-serif">
        456 Industrial Ave
      </text>
      <text x="170" y="106" fontSize="5" fill="#9ca3af" fontFamily="sans-serif">
        Brooklyn, NY 11201
      </text>

      {/* Table header */}
      <rect x="20" y="118" width="288" height="18" rx="3" fill="#f9fafb" />
      <text x="28" y="130" fontSize="5" fill="#6b7280" fontFamily="sans-serif" fontWeight="600">
        DESCRIPTION
      </text>
      <text x="180" y="130" fontSize="5" fill="#6b7280" fontFamily="sans-serif" fontWeight="600">
        QTY
      </text>
      <text x="220" y="130" fontSize="5" fill="#6b7280" fontFamily="sans-serif" fontWeight="600">
        RATE
      </text>
      <text x="280" y="130" fontSize="5" fill="#6b7280" fontFamily="sans-serif" fontWeight="600" textAnchor="end">
        AMOUNT
      </text>

      {/* Row 1 */}
      <text x="28" y="146" fontSize="5.5" fill="#374151" fontFamily="sans-serif">
        Web Development
      </text>
      <text x="184" y="146" fontSize="5.5" fill="#6b7280" fontFamily="sans-serif">
        40
      </text>
      <text x="224" y="146" fontSize="5.5" fill="#6b7280" fontFamily="sans-serif">
        $150.00
      </text>
      <text x="284" y="146" fontSize="5.5" fill="#374151" fontFamily="sans-serif" textAnchor="end">
        $6,000.00
      </text>

      {/* Row 2 */}
      <rect x="20" y="150" width="288" height="14" fill="#faf5ff" />
      <text x="28" y="160" fontSize="5.5" fill="#374151" fontFamily="sans-serif">
        UI/UX Design
      </text>
      <text x="184" y="160" fontSize="5.5" fill="#6b7280" fontFamily="sans-serif">
        20
      </text>
      <text x="224" y="160" fontSize="5.5" fill="#6b7280" fontFamily="sans-serif">
        $120.00
      </text>
      <text x="284" y="160" fontSize="5.5" fill="#374151" fontFamily="sans-serif" textAnchor="end">
        $2,400.00
      </text>

      {/* Row 3 */}
      <text x="28" y="174" fontSize="5.5" fill="#374151" fontFamily="sans-serif">
        Project Management
      </text>
      <text x="184" y="174" fontSize="5.5" fill="#6b7280" fontFamily="sans-serif">
        10
      </text>
      <text x="224" y="174" fontSize="5.5" fill="#6b7280" fontFamily="sans-serif">
        $100.00
      </text>
      <text x="284" y="174" fontSize="5.5" fill="#374151" fontFamily="sans-serif" textAnchor="end">
        $1,000.00
      </text>

      {/* Row 4 */}
      <rect x="20" y="178" width="288" height="14" fill="#faf5ff" />
      <text x="28" y="190" fontSize="5.5" fill="#374151" fontFamily="sans-serif">
        QA Testing
      </text>
      <text x="184" y="190" fontSize="5.5" fill="#6b7280" fontFamily="sans-serif">
        8
      </text>
      <text x="224" y="190" fontSize="5.5" fill="#6b7280" fontFamily="sans-serif">
        $95.00
      </text>
      <text x="284" y="190" fontSize="5.5" fill="#374151" fontFamily="sans-serif" textAnchor="end">
        $760.00
      </text>

      {/* Divider */}
      <line x1="20" y1="202" x2="308" y2="202" stroke="#e5e7eb" strokeWidth="0.5" />

      {/* Subtotal */}
      <text x="210" y="214" fontSize="5.5" fill="#6b7280" fontFamily="sans-serif">
        Subtotal
      </text>
      <text x="284" y="214" fontSize="5.5" fill="#374151" fontFamily="sans-serif" textAnchor="end">
        $10,160.00
      </text>

      {/* Tax */}
      <text x="210" y="224" fontSize="5.5" fill="#6b7280" fontFamily="sans-serif">
        Tax (8%)
      </text>
      <text x="284" y="224" fontSize="5.5" fill="#374151" fontFamily="sans-serif" textAnchor="end">
        $812.80
      </text>

      {/* Total divider */}
      <line x1="210" y1="230" x2="308" y2="230" stroke="#7c3aed" strokeWidth="1" />

      {/* Total */}
      <text x="210" y="244" fontSize="8" fill="#7c3aed" fontFamily="sans-serif" fontWeight="700">
        TOTAL
      </text>
      <text x="284" y="244" fontSize="8" fill="#7c3aed" fontFamily="sans-serif" fontWeight="700" textAnchor="end">
        $10,972.80
      </text>

      {/* Payment status badge */}
      <rect x="20" y="248" width="52" height="16" rx="8" fill="#dcfce7" />
      <text x="46" y="258" fontSize="6" fill="#16a34a" fontFamily="sans-serif" fontWeight="600" textAnchor="middle">
        PAID
      </text>

      {/* Decorative accent */}
      <circle cx="330" y="240" r="20" fill="#7c3aed" opacity="0.05" />
      <circle cx="340" y="250" r="12" fill="#7c3aed" opacity="0.08" />
    </svg>
  );
}
