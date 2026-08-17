import { QUALITY_TEST_ROWS } from "../../data/quality.mock";
import { DataTable } from "../ui/data-table";
import { Panel } from "../ui/panel";
import { StatusBadge } from "../ui/status-badge";
import { TraceFlow } from "./trace-flow";
import styles from "./quality-view.module.css";

export function QualityView() {
  return (
    <div className={styles.view}>
      <Panel
        title="시험성적 전산화"
        subtitle="절연저항·내전압·동작시험 결과가 계측기에서 시스템으로 — 수기 성적서 0"
      >
        <DataTable>
          <thead>
            <tr>
              <th>호기</th>
              <th>시험항목</th>
              <th>측정값</th>
              <th>기준</th>
              <th>판정</th>
              <th>시험자 / 일시</th>
            </tr>
          </thead>
          <tbody>
            {QUALITY_TEST_ROWS.map((row) => (
              <tr key={`${row.unit}-${row.testName}`}>
                <td className={styles.mono}>{row.unit}</td>
                <td>{row.testName}</td>
                <td className={styles.mono}>{row.measuredValue}</td>
                <td className={styles.mono}>{row.standard}</td>
                <td>
                  <StatusBadge
                    tone={row.result === "PASS" ? "success" : "danger"}
                  >
                    {row.result === "PASS" ? "PASS" : "FAIL → 재시험"}
                  </StatusBadge>
                </td>
                <td className={styles.mono}>{row.operatorAndTime}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Panel>
      <Panel
        title="이력 추적 (Traceability)"
        subtitle="발주처 문의·클레임 시, 호기 번호 하나로 전 이력 3초 소환"
      >
        <TraceFlow />
        <p className={styles.traceNote}>
          호기 명판에 QR 부착 → 현장에서 스캔하면 준공 후에도 동일 이력 열람.
          유지보수·개보수 수주로 이어지는 접점이 됩니다.
        </p>
      </Panel>
    </div>
  );
}
