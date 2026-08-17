# SMART OPS 기술 면접 Q&A

## 1. 왜 모노레포로 구성했나요?

> Web, API, DB의 배포 단위와 책임은 분리하면서도 한 저장소에서 타입과 개발 명령을 일관되게 관리하기 위해 npm workspaces를 사용했습니다. 특히 Prisma Client를 `@dns-smart-factory/db` 패키지로 분리해 데이터 접근 책임과 generated code를 API에서 직접 관리하지 않도록 했습니다.

**핵심:** 편의성 때문만이 아니라 책임 분리와 재현 가능한 빌드가 목적이다.

## 2. 왜 NestJS와 Next.js를 선택했나요?

> NestJS는 module, controller, service 구조가 명확해 dashboard, orders, inspections, inventory, quality 도메인을 분리하기 좋았습니다. Next.js는 운영 화면을 component 단위로 구성하고 client-side data fetching과 i18n을 적용하기에 적합했습니다. 두 프레임워크 모두 TypeScript를 사용해 프론트와 백엔드의 모델을 일관되게 관리할 수 있습니다.

## 3. 왜 계산 로직을 프론트가 아니라 백엔드에 두었나요?

> 납기 위험과 재고 부족은 여러 화면과 향후 외부 시스템에서도 동일하게 사용해야 하는 업무 규칙입니다. 프론트에서 계산하면 client마다 결과가 달라질 수 있고 검증과 감사가 어렵습니다. 그래서 백엔드 service가 원본 데이터로 계산하고 프론트는 결과를 표현하도록 분리했습니다.

## 4. 납기 위험은 어떻게 계산하나요?

> 미완료 공정의 표준공수를 합산해 호기별 잔여 공수를 만들고, 수주 내 호기 중 가장 큰 잔여 공수를 사용합니다. 이를 하루 8시간으로 나눈 생산일에 수주 버퍼를 더하고, 납기까지 남은 일수에서 차감해 margin을 구합니다. margin이 음수면 HIGH, 0~1일이면 MEDIUM, 그보다 크면 ON_TRACK입니다.

```text
productionDays = remainingStandardHours / 8
requiredDays   = productionDays + bufferDays
marginDays     = availableDays - requiredDays
```

## 5. 왜 모든 호기의 공수를 더하지 않고 가장 큰 값을 사용하나요?

> 현재 MVP는 여러 호기가 병렬로 생산될 수 있다고 가정하고, 수주 완료 시점을 결정하는 critical unit을 찾기 위해 최대 잔여 공수를 사용했습니다. 실제 공장이 동일 인력이나 설비를 공유해 직렬 제약이 생긴다면 설비 capacity와 작업 우선순위를 포함한 scheduling model로 확장해야 합니다.

## 6. 재고 부족은 어떻게 계산하나요?

> BOM의 단위당 소요량에 미완료 호기 수와 scrap rate를 반영해 2주 수요를 계산합니다. 여기에 안전재고를 더한 required stock과 현재 LOT 재고 합계를 비교합니다. 부족 수량이 있으면 리드타임을 생산 착수 예정일에서 역산해 발주 필요일을 제안합니다.

## 7. `purchaseByAt`을 납기일에서 계산하지 않은 이유는 무엇인가요?

> 자재는 제품 납기일이 아니라 해당 생산 공정이 시작되기 전에 입고되어야 합니다. 따라서 `plannedStartAt`을 우선 사용하고, 일정 정보가 없을 때만 `dueDate`를 fallback으로 사용했습니다. 운영 환경에서는 자재별 투입 공정의 예정 시작일을 사용하는 것이 더 정확합니다.

## 8. AI 검사는 실제 모델인가요?

> 아닙니다. 과제 범위에서는 판정 결과를 생성하는 mock입니다. 다만 검사 대상 조회, analyze API, 트랜잭션 저장, 이벤트 생성, 이력 갱신까지 애플리케이션 흐름은 실제로 구현했습니다. 실제 모델 연결 시 service가 inference adapter를 호출하도록 교체하고 API contract는 유지할 수 있습니다.

**피해야 할 답변:** “실제 AI 모델을 구현했습니다.”

## 9. 검사 결과와 이벤트를 왜 같은 트랜잭션에 저장하나요?

> 검사 결과는 저장됐지만 알림 이벤트가 누락되거나, 반대로 이벤트만 생성되는 불일치를 막기 위해서입니다. 두 데이터는 하나의 업무 사건이므로 원자적으로 성공하거나 실패해야 합니다.

## 10. WebSocket 없이 실시간이라고 할 수 있나요?

> 현재 MVP의 정확한 표현은 near real-time polling입니다. 변경 빈도와 2일 과제 범위를 고려해 dashboard와 orders는 15초, inventory와 quality는 30초 polling을 사용했습니다. 긴급 알림이나 설비 상태처럼 즉시성이 필요한 이벤트는 WebSocket, 설비 수집은 MQTT 또는 OPC-UA가 더 적합합니다.

## 11. 왜 지금 WebSocket과 MQTT를 넣지 않았나요?

> 우선 end-to-end 업무 흐름과 계산 정확도를 완성하는 것이 더 높은 우선순위였습니다. WebSocket과 MQTT를 동시에 추가하면 broker, reconnect, message ordering, idempotency까지 검증 범위가 커집니다. 현재는 REST contract와 event entity를 먼저 만들었고, 다음 단계에서 event publisher와 gateway를 추가할 수 있습니다.

## 12. TimescaleDB는 왜 사용하지 않았나요?

> 현재 데이터는 수주, 공정 기록, 검사, LOT처럼 관계와 트랜잭션이 중요한 업무 데이터입니다. PostgreSQL이 적합합니다. 초 단위 이하의 고주기 센서 데이터가 대량으로 들어오고 time-bucket 집계와 retention policy가 필요해질 때 TimescaleDB를 검토하겠습니다.

## 13. Prisma schema를 왜 여러 파일로 나눴나요?

> sales, production, inventory, quality, event처럼 도메인별로 나눠 모델의 책임과 관계를 빠르게 파악할 수 있도록 했습니다. schema folder를 하나의 Prisma schema로 generate하므로 relation과 migration의 일관성은 유지됩니다.

## 14. 프론트의 API 오류는 어떻게 처리하나요?

> 공통 `ApiError`가 network, HTTP request, invalid response를 구분합니다. 각 화면은 공통 `AsyncState`를 사용해 loading, error, retry UX를 동일하게 제공합니다. SWR의 `mutate`를 retry action에 연결해 전체 페이지를 새로고침하지 않고 복구합니다.

## 15. i18n 구조를 설명해 주세요.

> `react-i18next`와 HTTP backend를 사용하고 번역 리소스는 `public/locales/ko`와 `public/locales/en`에 분리했습니다. component에는 translation key만 두고, status logic은 한국어 문자열이 아니라 enum code를 사용합니다. 날짜, 숫자, 단수·복수도 locale에 맞게 처리하며 언어 선택은 localStorage에 저장합니다.

## 16. API 성능은 어떻게 고려했나요?

> 독립적인 집계는 `Promise.all`로 병렬 실행하고, 필요한 relation과 field만 select합니다. 프론트에서는 SWR이 동일 요청을 deduplicate하고 화면별 갱신 주기를 분리합니다. 데이터가 커지면 KPI용 pre-aggregation, cursor pagination, Redis cache, query plan과 index 점검을 추가하겠습니다.

## 17. 현재 테스트의 한계는 무엇인가요?

> 현재는 TypeScript build, frontend lint, 기본 API unit test와 수동 end-to-end demo를 검증했습니다. 과제 시간상 계산 service의 자동 테스트가 충분하지 않은 것이 가장 큰 기술 부채입니다. 우선순위는 납기 경계값, 재고 부족과 리드타임, 검사 트랜잭션 integration test, 그리고 Playwright 핵심 flow test입니다.

**좋은 태도:** 테스트가 충분하다고 과장하지 말고 구체적인 다음 테스트를 말한다.

## 18. 보안 측면에서 무엇이 부족한가요?

> 현재는 로컬 데모라 인증과 권한을 제외했습니다. 운영 전에는 OIDC 기반 인증, 역할별 RBAC, DTO validation, rate limit, audit log, secret manager, CORS allowlist, 검사 이미지 접근 제어가 필요합니다.

## 19. 데이터가 동시에 변경되면 어떻게 하나요?

> 검사 생성처럼 하나의 업무 사건에 속한 write는 DB transaction으로 묶었습니다. 재고 차감처럼 경쟁 가능성이 높은 write를 추가한다면 optimistic concurrency 또는 row-level lock, idempotency key를 적용해야 합니다. 화면 조회는 SWR revalidation으로 최신 상태를 다시 동기화합니다.

## 20. 실제 공장에 적용하려면 무엇을 먼저 하겠습니까?

> 첫째, 현장 담당자와 공정 코드, 표준시간, BOM, 품질 판정 기준을 검증합니다. 둘째, OPC-UA/MQTT 수집 adapter와 idempotent event ingestion을 구축합니다. 셋째, 인증·권한과 감사 로그를 적용합니다. 마지막으로 한 개 라인에서 shadow mode로 기존 수기 결과와 비교한 뒤 단계적으로 확대합니다.

## 21. 가장 중요한 설계 trade-off는 무엇이었나요?

> 실제 설비 통신이나 비전 모델의 폭을 넓히는 대신, 수주에서 검사와 품질 이력까지 이어지는 end-to-end 깊이를 선택했습니다. 그래서 외부 시스템은 mock이지만 데이터 모델, 계산, API, persistence, UI feedback은 실제 흐름으로 만들었습니다.

## 22. 시간이 하루 더 있다면 무엇을 하겠습니까?

> 새로운 기능보다 먼저 핵심 계산 unit test와 API integration test를 추가하겠습니다. 그다음 dockerized one-command startup과 demo reset command를 만들고, 마지막으로 critical alert 하나만 WebSocket으로 push해 polling과 event-driven update의 경계를 보여 주겠습니다.

## 30초 요약 답변

> 이 프로젝트는 수배전반 제조의 수주, 공정, 검사, 재고, 품질 데이터를 호기 단위로 연결한 MES MVP입니다. NestJS가 납기와 재고 업무 규칙을 계산하고 PostgreSQL에 이력을 저장하며, Next.js가 운영 화면과 한국어·영어 UI를 제공합니다. 외부 AI와 설비 연동은 mock 범위지만 API부터 저장, 알림, 추적까지 end-to-end 흐름은 실제로 구현했습니다.

## 면접에서 사용하면 좋은 답변 구조

1. **결론:** 무엇을 선택했는지 먼저 말한다.
2. **이유:** 현재 요구사항과 제약을 연결한다.
3. **한계:** 무엇을 단순화했는지 솔직히 말한다.
4. **확장:** 운영 환경에서는 어떻게 발전시킬지 말한다.

예시:

> 현재는 REST polling을 선택했습니다. 2일 MVP에서 업무 흐름의 안정성이 우선이었기 때문입니다. 즉시성에는 한계가 있으므로 운영 환경의 critical event는 WebSocket으로 분리하겠습니다.
