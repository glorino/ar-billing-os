export default function WorkflowDiagram() {
  const nodes = [
    { label: "Customer", icon: "person", x: 60 },
    { label: "Invoice", icon: "document", x: 174 },
    { label: "Reminder", icon: "bell", x: 288 },
    { label: "Payment", icon: "card", x: 402 },
    { label: "Reconcile", icon: "check", x: 516 },
    { label: "Ledger", icon: "book", x: 630 },
    { label: "Report", icon: "chart", x: 744 },
  ];

  const cy = 80;
  const nodeR = 28;

  return (
    <svg
      viewBox="0 0 800 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="auto"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="flowGrad" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="0.5" stopColor="#6d28d9" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#7c3aed" opacity="0.6" />
        </marker>
        <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#7c3aed" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Background track line */}
      <line x1="88" y1={cy} x2="716" y2={cy} stroke="#e5e7eb" strokeWidth="2" />

      {/* Animated flow line */}
      <line x1="88" y1={cy} x2="716" y2={cy} stroke="url(#flowGrad)" strokeWidth="2.5" strokeDasharray="8 4">
        <animate attributeName="stroke-dashoffset" values="0;-24" dur="1.5s" repeatCount="indefinite" />
      </line>

      {/* Connection arrows */}
      {nodes.slice(0, -1).map((node, i) => {
        const next = nodes[i + 1];
        const midX = (node.x + next.x) / 2;
        return (
          <g key={`arrow-${i}`}>
            <line
              x1={node.x + nodeR + 4}
              y1={cy}
              x2={next.x - nodeR - 8}
              y2={cy}
              stroke="#7c3aed"
              strokeWidth="1.5"
              opacity="0.3"
              markerEnd="url(#arrowhead)"
            />
          </g>
        );
      })}

      {/* Return arrow (cycle) */}
      <path
        d={`M${nodes[6].x} ${cy + nodeR + 4} Q${400} ${cy + 70}, ${nodes[0].x} ${cy + nodeR + 4}`}
        stroke="#7c3aed"
        strokeWidth="1.5"
        fill="none"
        opacity="0.2"
        strokeDasharray="4 4"
        markerEnd="url(#arrowhead)"
      />
      <text x={400} y={cy + 68} fontSize="6" fill="#9ca3af" fontFamily="sans-serif" textAnchor="middle">
        continuous cycle
      </text>

      {/* Nodes */}
      {nodes.map((node, i) => (
        <g key={node.label} filter="url(#nodeShadow)">
          {/* Outer glow */}
          <circle cx={node.x} cy={cy} r={nodeR + 4} fill="#7c3aed" opacity="0.05" />

          {/* Node circle */}
          <circle cx={node.x} cy={cy} r={nodeR} fill="white" stroke="#7c3aed" strokeWidth="2" />

          {/* Inner fill */}
          <circle cx={node.x} cy={cy} r={nodeR - 4} fill="#faf5ff" />

          {/* Icons */}
          {node.icon === "person" && (
            <g transform={`translate(${node.x - 8}, ${cy - 10})`}>
              <circle cx="8" cy="4" r="4" fill="#7c3aed" />
              <path d="M0 16 Q0 10, 8 10 Q16 10, 16 16" fill="#7c3aed" />
            </g>
          )}
          {node.icon === "document" && (
            <g transform={`translate(${node.x - 7}, ${cy - 10})`}>
              <rect x="0" y="0" width="14" height="18" rx="2" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
              <line x1="3" y1="5" x2="11" y2="5" stroke="#7c3aed" strokeWidth="1" />
              <line x1="3" y1="9" x2="11" y2="9" stroke="#7c3aed" strokeWidth="1" />
              <line x1="3" y1="13" x2="8" y2="13" stroke="#7c3aed" strokeWidth="1" />
            </g>
          )}
          {node.icon === "bell" && (
            <g transform={`translate(${node.x - 7}, ${cy - 10})`}>
              <path d="M7 0 Q1 0, 0 6 L-1 12 L15 12 L14 6 Q13 0, 7 0 Z" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
              <circle cx="7" cy="14" r="2" fill="#7c3aed" />
            </g>
          )}
          {node.icon === "card" && (
            <g transform={`translate(${node.x - 9}, ${cy - 7})`}>
              <rect x="0" y="0" width="18" height="14" rx="2" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
              <line x1="0" y1="4" x2="18" y2="4" stroke="#7c3aed" strokeWidth="1.5" />
              <rect x="2" y="8" width="6" height="2" rx="0.5" fill="#7c3aed" opacity="0.4" />
            </g>
          )}
          {node.icon === "check" && (
            <g transform={`translate(${node.x - 8}, ${cy - 8})`}>
              <circle cx="8" cy="8" r="8" fill="none" stroke="#16a34a" strokeWidth="1.5" />
              <path d="M3 8 L6 11 L13 4" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
          {node.icon === "book" && (
            <g transform={`translate(${node.x - 8}, ${cy - 9})`}>
              <rect x="0" y="0" width="16" height="18" rx="1" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
              <line x1="8" y1="0" x2="8" y2="18" stroke="#7c3aed" strokeWidth="1" />
              <line x1="2" y1="4" x2="6" y2="4" stroke="#7c3aed" strokeWidth="0.8" />
              <line x1="2" y1="7" x2="6" y2="7" stroke="#7c3aed" strokeWidth="0.8" />
              <line x1="10" y1="4" x2="14" y2="4" stroke="#7c3aed" strokeWidth="0.8" />
              <line x1="10" y1="7" x2="14" y2="7" stroke="#7c3aed" strokeWidth="0.8" />
            </g>
          )}
          {node.icon === "chart" && (
            <g transform={`translate(${node.x - 8}, ${cy - 8})`}>
              <rect x="0" y="0" width="16" height="16" rx="2" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
              <polyline points="3,12 6,8 9,10 13,4" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}

          {/* Step number */}
          <circle cx={node.x + nodeR - 4} cy={cy - nodeR + 4} r="6" fill="#7c3aed" />
          <text
            x={node.x + nodeR - 4}
            y={cy - nodeR + 6.5}
            fontSize="6"
            fill="white"
            fontFamily="sans-serif"
            fontWeight="700"
            textAnchor="middle"
          >
            {i + 1}
          </text>

          {/* Label */}
          <text
            x={node.x}
            y={cy + nodeR + 16}
            fontSize="8"
            fill="#374151"
            fontFamily="sans-serif"
            fontWeight="600"
            textAnchor="middle"
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
