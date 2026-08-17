# Production Deployment

## 구성

| Service   | 역할                         | 시작 조건         |
| --------- | ---------------------------- | ----------------- |
| `db`      | PostgreSQL 16 데이터 저장    | 자체 health check |
| `migrate` | `prisma migrate deploy` 실행 | DB healthy        |
| `api`     | NestJS REST API              | migration 성공    |
| `web`     | Next.js standalone UI        | API healthy       |
| `seed`    | 과제용 demo data 생성        | 수동 실행만 가능  |

`migrate` container가 migration 완료 후 `Exited (0)` 상태가 되는 것은 정상입니다. `seed`는 Compose profile로 분리되어 일반 배포 시 자동 실행되지 않습니다.

## 1. 환경 변수

```bash
cp deploy/.env.example deploy/.env
```

`deploy/.env`에서 다음 값을 변경합니다.

| 변수                  | 설명                                            |
| --------------------- | ----------------------------------------------- |
| `POSTGRES_PASSWORD`   | 충분히 긴 production DB 비밀번호                |
| `DATABASE_URL`        | API와 migration이 사용할 PostgreSQL URL         |
| `WEB_URL`             | CORS에 허용할 Web origin. 여러 개면 쉼표로 구분 |
| `NEXT_PUBLIC_API_URL` | 브라우저가 호출할 공개 API URL                  |
| `ENABLE_SWAGGER`      | 외부 공개 환경에서는 `false` 권장               |

Compose 내부 PostgreSQL을 사용할 때 `DATABASE_URL` host는 service name인 `db`입니다. 비밀번호에 `@`, `:`, `/`, `#` 같은 문자가 있으면 URL encoding된 값을 `DATABASE_URL`에 사용해야 합니다.

`NEXT_PUBLIC_API_URL`은 Next.js build-time 변수입니다. URL을 변경한 뒤에는 Web image를 반드시 다시 build합니다.

## 2. 실행

```bash
npm run deploy:up
```

최초 demo 환경에서만 seed를 실행합니다.

```bash
npm run deploy:seed
```

상태와 로그를 확인합니다.

```bash
docker compose --env-file deploy/.env -f docker-compose.prod.yml ps
npm run deploy:logs
```

기본 local production 주소는 다음과 같습니다.

- Web: `http://localhost:3001`
- API health: `http://localhost:3000/api/health`
- Swagger: `http://localhost:3000/api/docs`

## 3. 검증

```bash
curl --fail http://localhost:3000/api/health
curl --fail http://localhost:3000/api/dashboard/overview
curl --fail http://localhost:3001/locales/en/common.json
```

정상 health response 예시는 다음과 같습니다.

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-08-17T00:00:00.000Z"
}
```

## 4. Hosting provider에 분리 배포

Provider가 Compose 대신 service별 Docker 배포를 요구하면 다음 단위를 사용합니다.

| 배포 단위     | Dockerfile / target                | 필수 설정                                    |
| ------------- | ---------------------------------- | -------------------------------------------- |
| Web           | `Dockerfile.web`, `runner`         | build arg `NEXT_PUBLIC_API_URL`, port `3001` |
| API           | `Dockerfile.api`, `runner`         | `DATABASE_URL`, `WEB_URL`, port `3000`       |
| Migration job | `Dockerfile.api`, `database-tools` | command `npm run db:deploy`                  |
| Database      | Managed PostgreSQL 16              | provider의 connection URL                    |

Public traffic은 Web과 API에만 연결합니다. DB와 migration job은 외부 port를 열지 않습니다. TLS는 hosting provider 또는 Nginx/Caddy 같은 reverse proxy에서 종료합니다.

## 5. Release 체크리스트

- `npm audit --omit=dev` 결과가 clean인지 확인
- production image build 성공 확인
- DB backup 또는 snapshot 생성
- migration job 성공 확인
- `/api/health`가 DB connected를 반환하는지 확인
- Web에서 dashboard API data와 KO/EN locale 확인
- `WEB_URL`이 실제 Web origin과 일치하는지 확인
- `ENABLE_SWAGGER=false` 적용 여부 결정
- demo가 아닌 운영 DB에서는 `deploy:seed`를 실행하지 않음

## 6. 중지와 rollback

```bash
npm run deploy:down
```

`deploy:down`은 container와 network만 중지하며 PostgreSQL named volume은 삭제하지 않습니다. App rollback은 이전 Web/API image tag를 다시 배포합니다. Prisma migration은 자동 rollback하지 않으므로 breaking schema 변경 전에는 DB backup과 별도 rollback SQL을 준비합니다.
