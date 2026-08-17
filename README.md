# DNS Smart Factory MES

수배전반 제조 현장의 수주, 공정, AI 검사, 자재 재고, 품질 이력을 하나의 운영 화면으로 연결한 스마트팩토리 MES 데모입니다.

이 프로젝트는 단순 모니터링 화면이 아니라 **납기 위험과 자재 부족을 사전에 계산하고, 호기 단위 품질 이력을 추적하는 운영형 MVP**를 목표로 합니다.

## 핵심 기능

| 모듈        | 주요 기능                                                               |
| ----------- | ----------------------------------------------------------------------- |
| 통합 관제   | 금일 실적, 진행 호기, 납기준수율, 재작업, 설비 가동률 KPI와 공정별 현황 |
| 수주·공정   | 호기별 진척률, 현재 공정, 잔여 표준공수 기반 납기 위험 자동 판정        |
| AI 배선검사 | 검사 대상 선택, AI 검사 시뮬레이션, 결과 저장 및 호기별 검사 이력 조회  |
| 자재·재고   | BOM과 확정 수주를 반영한 2주 소요량, 부족 수량, 발주 필요일 계산        |
| 시험·품질   | 절연저항·내전압·동작시험 결과와 자재 LOT·생산·검사 이력 통합 추적       |
| 다국어      | 한국어/영어 전환, locale별 날짜·숫자·복수형 처리, 선택 언어 저장        |

## 시스템 구성

```mermaid
flowchart LR
    U["Operator Browser"] --> W["Next.js 16 Web"]
    W -->|"REST / JSON"| A["NestJS 11 API"]
    A --> D["Prisma ORM 7"]
    D --> P[("PostgreSQL 16")]

    subgraph "Web"
      W --> SWR["SWR polling + retry"]
      W --> I18N["i18next KO / EN"]
    end

    subgraph "API Domains"
      A --> DASH["Dashboard"]
      A --> ORD["Orders"]
      A --> INS["Inspections"]
      A --> INV["Inventory"]
      A --> QLT["Quality"]
    end
```

## 기술 스택

- **Frontend:** Next.js 16, React 19, TypeScript, SWR, i18next, CSS Modules
- **Backend:** NestJS 11, TypeScript, Swagger
- **Database:** PostgreSQL 16, Prisma ORM 7, Prisma driver adapter
- **Workspace:** npm workspaces monorepo
- **Local infrastructure:** Docker Compose

## 프로젝트 구조

```text
dns_smart_factory/
├── apps/
│   ├── api/                  # NestJS REST API
│   │   └── src/modules/      # Domain modules
│   └── web/                  # Next.js operations UI
│       ├── public/locales/   # ko/en translation resources
│       └── src/components/   # Feature and shared UI components
├── packages/
│   └── db/                   # Prisma schema, migrations, seed, shared client
├── docker-compose.yml        # PostgreSQL 16
├── docker-compose.prod.yml   # Production Web, API, migration, PostgreSQL
├── Dockerfile.api            # NestJS runtime and database tools images
├── Dockerfile.web            # Next.js standalone runtime image
└── package.json              # Workspace commands
```

## 실행 방법

### 요구 환경

- Node.js 20 이상
- npm 10 이상
- Docker 및 Docker Compose

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 준비

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp packages/db/.env.example packages/db/.env
```

기본 설정은 로컬 PostgreSQL `localhost:5432`, API `localhost:3000`, Web `localhost:3001`을 사용합니다.

### 3. 데이터베이스 실행 및 초기화

```bash
docker compose up -d db
npm run db:generate
npm run db:deploy
npm run db:seed
```

### 4. API와 Web 실행

각 명령을 별도 터미널에서 실행합니다.

```bash
npm run dev:api
```

```bash
npm run dev:web
```

### 접속 주소

- Web UI: [http://localhost:3001](http://localhost:3001)
- REST API: [http://localhost:3000/api](http://localhost:3000/api)
- Swagger: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- Health check: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## Production 배포

Production 구성은 Next.js standalone Web, NestJS API, PostgreSQL, Prisma migration을 각각 독립 container로 실행합니다. API는 DB 연결 health check를 통과한 뒤에만 Web을 시작하며, migration이 실패하면 API가 시작되지 않습니다.

```bash
cp deploy/.env.example deploy/.env
# deploy/.env의 비밀번호와 공개 URL을 실제 값으로 변경
npm run deploy:up

# 데모 데이터가 필요한 최초 1회만 실행
npm run deploy:seed
```

`NEXT_PUBLIC_API_URL`은 Web image build 시점에 포함되므로 API 공개 주소가 바뀌면 Web image를 다시 build해야 합니다. 운영 서버에서는 TLS reverse proxy 또는 hosting provider의 HTTPS endpoint를 Web/API 앞에 배치하고 `ENABLE_SWAGGER=false`를 권장합니다.

환경 변수, 외부 DB 사용법, 검증 및 rollback 체크리스트는 [DEPLOYMENT.md](DEPLOYMENT.md)를 참고합니다.

## 주요 API

| Method | Endpoint                          | 설명                                 |
| ------ | --------------------------------- | ------------------------------------ |
| `GET`  | `/api/dashboard/overview`         | KPI, 공정 현황, 주간 실적, 최근 알림 |
| `GET`  | `/api/orders`                     | 수주 목록, 호기 진척, 납기 위험      |
| `GET`  | `/api/orders/:orderNo`            | 수주 상세와 공정 기록                |
| `GET`  | `/api/inspections/targets`        | AI 검사 가능 호기 목록               |
| `POST` | `/api/inspections/analyze`        | AI 검사 시뮬레이션 및 결과 저장      |
| `GET`  | `/api/inspections/unit/:serialNo` | 호기별 검사 이력                     |
| `GET`  | `/api/inventory/overview`         | 재고, 수요, 부족 수량, 발주 제안     |
| `GET`  | `/api/quality/trace/:orderNo`     | 수주별 자재·공정·검사·시험 통합 이력 |

## 핵심 계산 로직

### 납기 위험

```text
productionDays = remainingStandardHours / 8
requiredDays   = productionDays + bufferDays
marginDays     = availableDays - requiredDays
```

- `marginDays < 0`: 납기 위험
- `0 <= marginDays <= 1`: 지연 주의
- `marginDays > 1`: 정상
- 여러 호기가 있을 때 가장 늦은 호기의 잔여 표준공수를 수주 위험 계산에 사용합니다.

### 자재 부족 및 발주일

```text
twoWeekDemand = remainingUnits × quantityPerUnit × (1 + scrapRate / 100)
requiredStock = twoWeekDemand + safetyStock
shortage      = max(requiredStock - currentStock, 0)
purchaseByAt  = earliestRequiredAt - leadTimeDays
```

`earliestRequiredAt`은 납기일이 아니라 **생산 착수 예정일**을 우선 사용하며, 착수 예정일이 없을 때만 납기일을 fallback으로 사용합니다.

## 데모 시나리오

1. **통합 관제:** 자동 집계 KPI와 공정 병목을 확인합니다.
2. **수주·공정:** 납기 위험 수주를 선택하고 역산 계산 근거를 설명합니다.
3. **AI 배선검사:** 호기를 선택해 검사를 실행하고 결과가 이력에 저장되는 것을 확인합니다.
4. **자재·재고:** 부족 자재와 리드타임 기반 발주 제안을 확인합니다.
5. **시험·품질:** 수주번호 하나로 자재 LOT부터 시험성적서까지 추적합니다.
6. **다국어:** 우측 상단 `KO / EN`으로 전체 UI 언어와 포맷이 변경되는 것을 확인합니다.

## 검증

```bash
npm run build -w packages/db
npm run build -w apps/api
npm run lint -w apps/web
npm run build -w apps/web
npm run test -w apps/api -- --runInBand
```

## 발표 준비

- [6분 데모 가이드](docs/DEMO_GUIDE.md)
- [기술 면접 Q&A](docs/INTERVIEW_QA.md)

## MVP 범위

현재 MVP는 로컬 제조 데이터 흐름을 명확하게 시연하기 위해 REST API와 15~30초 polling을 사용합니다. MQTT, WebSocket, TimescaleDB는 필수 요구사항이 아니므로 범위에서 제외했습니다.

실제 운영 환경으로 확장할 경우 다음 순서가 적절합니다.

1. 설비 이벤트 수집을 위한 MQTT 또는 OPC-UA adapter
2. 긴급 알림과 상태 변경을 위한 WebSocket gateway
3. 고주기 센서 시계열 분석을 위한 TimescaleDB
4. 인증·권한, 감사 로그, 외부 ERP 연동

## Demo Data Notice

본 프로젝트의 회사명, 수주번호, 생산 수치, 검사 결과는 모두 과제 시연을 위한 가상 데이터입니다.
