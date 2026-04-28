# APK Fraud Intelligence Investigator

An autonomous threat-analyst platform where security teams submit forensic data extracted from suspicious Android APKs and receive a complete AI-generated investigation: executive summary, technical breakdown, campaign attribution, root-offender analysis, risk matrix, threat prediction, plain-English brief, IOCs, MITRE tactics, detection/mitigation rules, and reasoning chain.

## Architecture

Pnpm monorepo with three runtime artifacts and shared libraries.

### Artifacts
- `artifacts/apk-investigator` — React + Vite SOC console UI (preview path `/`)
- `artifacts/api-server` — Express 5 + Drizzle backend (path `/api`)
- `artifacts/mockup-sandbox` — design sandbox (not in active use)

### Shared libraries
- `lib/api-spec` — single OpenAPI 3.1 source of truth (`openapi.yaml`)
- `lib/api-client-react` — generated TanStack Query hooks (do not edit)
- `lib/api-zod` — generated zod request/response validators (do not edit)
- `lib/db` — Drizzle ORM schema + connection (uses `DATABASE_URL`)

After editing `lib/api-spec/openapi.yaml`, run:
```
pnpm --filter @workspace/api-spec run codegen
```
This regenerates client hooks and zod schemas, then typechecks the libs.

## Data model

Single `investigations` table stores: sample identity, permissions, code snippets, network indicators, certificate intelligence, third-party threat-intel scores, ML/graph signals, computed verdict (verdict / riskLevel / riskScore / confidence / primaryThreatType), and the full LLM-produced AnalysisReport as JSONB (`analysis` column).

## Endpoints

- `GET /api/healthz`
- `GET /api/investigations` (search + riskLevel filter)
- `POST /api/investigations` — runs autonomous AI investigation (30-60s) and persists
- `GET /api/investigations/:id` — full report
- `DELETE /api/investigations/:id`
- `GET /api/investigations/:id/iocs`
- `GET /api/campaigns` — clusters grouped by `clusterId`
- `GET /api/campaigns/:clusterId` — cluster + member samples
- `GET /api/dashboard/stats`
- `GET /api/dashboard/recent`
- `GET /api/dashboard/risk-distribution`
- `GET /api/dashboard/top-iocs`
- `GET /api/dashboard/behaviors`

## AI investigator

`artifacts/api-server/src/lib/investigator.ts` calls the Replit-proxied OpenAI endpoint (`AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`) using `gpt-5.4` chat completions with a strict JSON-schema response_format that mirrors the `AnalysisReport` OpenAPI schema. The system prompt enforces evidence-based, calibrated, multi-source reasoning.

## Frontend

- Routing via `wouter`; data via TanStack React Query (hooks from `@workspace/api-client-react` only)
- Dark-themed minimalist SOC console
- Pages: `/`, `/investigations`, `/investigations/new`, `/investigations/:id`, `/campaigns`, `/campaigns/:clusterId`
- New-investigation form supports comma/newline-separated array fields and a "Load sample" prefill
- Detail page tabs: Brief, Behaviors, Code & Permissions, Network, Attribution, Risk & Prediction, Rules & IOCs

## Seed data

3 realistic example investigations are seeded via the live API on first run (FastBank banking trojan, PhotoMagicEditor adware/data exfil, TaxRefund-Helper banking trojan) — two share `CLUSTER-ANUBIS-X4` to demonstrate the campaign clustering view.

## Workflows

- `artifacts/api-server: API Server` — Express server on assigned `PORT`
- `artifacts/apk-investigator: web` — Vite dev server on assigned `PORT`
