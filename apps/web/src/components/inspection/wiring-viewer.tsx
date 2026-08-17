import styles from "./inspection-view.module.css";

interface WiringViewerProps {
  scanning: boolean;
  detected: boolean;
  serialNo: string;
  confidence: number | null;
}

const terminalRows = [86, 136, 186, 236, 286];

export function WiringViewer({
  scanning,
  detected,
  serialNo,
  confidence,
}: WiringViewerProps) {
  return (
    <div className={styles.viewer}>
      {scanning ? <div className={styles.scanLine} /> : null}
      <svg viewBox="0 0 520 340" role="img" aria-label="MCC 내부 배선 모식도">
        <rect
          x="8"
          y="8"
          width="504"
          height="324"
          rx="8"
          fill="#11161c"
          stroke="#3a434e"
          strokeWidth="2"
        />
        <text x="24" y="34" fill="#64707b" fontSize="12" fontFamily="monospace">
          {serialNo} · CAM-01
        </text>
        {terminalRows.flatMap((y) => [
          <rect
            key={`left-${y}`}
            x="46"
            y={y - 12}
            width="24"
            height="26"
            rx="3"
            fill="#20272f"
            stroke="#3a434e"
          />,
          <rect
            key={`right-${y}`}
            x="430"
            y={y - 10}
            width="24"
            height="26"
            rx="3"
            fill="#20272f"
            stroke="#3a434e"
          />,
        ])}
        <path
          d="M70 90 C 150 60, 300 60, 430 96"
          stroke="#b8894a"
          strokeWidth="4"
          fill="none"
        />
        <path
          d="M70 140 C 170 120, 300 120, 430 146"
          stroke="#64707b"
          strokeWidth="4"
          fill="none"
        />
        <path
          d="M70 190 C 170 175, 300 175, 430 196"
          stroke="#9aa4ae"
          strokeWidth="4"
          fill="none"
        />
        <path
          d="M70 240 C 190 300, 330 180, 430 246"
          stroke={detected ? "#e3634b" : "#5594dc"}
          strokeWidth="4"
          fill="none"
        />
        <path
          d="M70 290 C 180 275, 310 275, 430 292"
          stroke="#42bd7b"
          strokeWidth="4"
          fill="none"
        />
        {detected ? (
          <g>
            <rect
              x="236"
              y="196"
              width="120"
              height="72"
              fill="none"
              stroke="#e3634b"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
            <rect x="236" y="176" width="150" height="20" fill="#e3634b" />
            <text
              x="243"
              y="190"
              fill="#fff"
              fontSize="11"
              fontFamily="monospace"
            >
              {`오결선 의심 ${confidence ?? "-"}%`}
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
}
