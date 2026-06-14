# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`flashcards-api` — the Express 5 + TypeScript REST backend for **MemoryNinja**, an AI flashcard generator. ESM, hexagonal architecture, talks to MySQL, Google Gemini, and Upstash Redis. This is an independent git repo; the parent `../CLAUDE.md` documents the full two-project workspace.

## Commands

```bash
pnpm dev               # hot-reload (nodemon + node --loader ts-node/esm)
pnpm build             # tsc -> dist/
pnpm start             # run compiled dist/index.js (build first)
pnpm lint              # eslint . --ext .ts (eslint-config-love)
pnpm test              # jest (ESM via ts-jest)
pnpm test:watch
pnpm test:ci           # jest --ci --coverage --watchAll=false
```
Single file: `pnpm test src/__tests__/path/to/file.test.ts` · By name: `pnpm test -t "partial name"`

## Architecture — Hexagonal (Ports & Adapters)

Trace a request through these layers in order:

1. **`routes/`** mount per-group middleware and rate limits, then wire the controller. `index.ts` is the composition root: it applies `validateAuth` + `limiter({...})` per route group (see endpoint map below).
2. **`middlewares/`**: `validateAuth` (Clerk JWT), `validateBody`/`validateIDInput` (Zod). `validateBody` **replaces** `req.body` with the parsed, typed result.
3. **`controllers/`** handle HTTP only. They import an **already-resolved service** — they never `new` a service.
4. **`services/`** hold business logic, receive dependencies via constructor.
5. **`infrastructure/`**: `db/MySQLRepository.ts` (pool + transactions), `ia/` AI adapters, `redis/` Upstash client, `di/` containers.

### Dependency Injection — the key split
- `di/userContainer.ts`, `themeContainer.ts`, `dashboardContainer.ts` export **pre-built singletons** (`export const userService = new UserService(new MySQLRepository())`).
- `di/container.ts` `resolveServices({ model })` resolves **AI-dependent** services at request time because the chosen Gemini model varies.
- New service rule: stateless/shared → pre-built container; model/request-dependent → resolver function.

### AI layer
`ia/IAInterface.ts` is the port; `ia/GeminiModel.ts` is the only adapter. Two model identities chosen by name string: `Kōga (甲賀)` / `Kurayami (暗闇)`, backed by env `GEMINI_KOGA` / `GEMINI_KURAYAMI`. Prompts are templates built in `ia/utils/` (`questionsBuilder`, `manyQuestionsBuilder`). Responses **stream** and are aggregated from chunks.
- **Gotcha**: `generateMultipleAnswer` parses the model's free-text reply with the regex `/Respuesta\s+(\d+):.../` to map answers back to question indices, and **throws if any answer slot is empty**. Changing the prompt format will break this parser.

### Database
MySQL via a connection **pool** (`infrastructure/db/mysql.ts`). Multi-table writes follow the transaction pattern: `pool.getConnection()` → `beginTransaction()` → pre-load lookups into a `Map` (avoids N+1) → batch `INSERT IGNORE` → `commit()`/`rollback()` → **always `release()` in `finally`** (see `MySQLRepository.saveFlashcard` / `deleteUser`).

### Auth
`validateAuth` reads `Authorization: Bearer <jwt>`, verifies it with `@clerk/backend` `verifyToken({ jwtKey: CLERK_JWT_KEY })`, then sets `req.user = { id: sub, userLevel }`. **`userLevel` is derived from the `pla` claim split on `:`** (`tokenData.pla.split(':')[1]`). The `req.user` type is augmented globally in this file.

## Rate limiting & plans

`services/rateLimiter.ts` `limiter({ minuteDuration, maxRequest })` **doubles `maxRequest` for PRO users**. Key = `${userId}/LEVEL:${userLevel}/PATH:${path}`. Plans in `entities/users/userPlans.ts`: `USER_PLANS.FREE = "free_tier"` / `PRO_USER = "pro_user"`.

Endpoint map (`index.ts`):

| Route | Auth | Limit/min |
|---|---|---|
| `/api/questions` | yes | 5 |
| `/api/user/create`, `/api/user/delete` | no | — |
| `/api/user` | yes | 20 |
| `/api/dashboard` | yes | 20 |
| `/api/themes` | yes | 10 |

### Free-tier enforcement (Redis-backed daily cap)
`controllers/QuestionController.ts` gates free users using `FREE_TIER_LIMITS` (`entities/users/userPlans.ts`):
- Free users are **forced onto the Kōga model** regardless of requested model.
- Max **3 AI generations/day**, counted in Upstash Redis (`infrastructure/redis/upstashClient.ts`). Key = `ai_gen:{userId}:{UTC-YYYY-MM-DD}`, TTL 86400s set only on the first `incr`. Over limit → `403` with code `AI_GENERATION_LIMIT_REACHED`.
- Other free limits (`MAX_FLASHCARDS: 25`, `MAX_THEMES: 3`) are enforced in their respective services.

## Conventions

- **ESM + NodeNext**: `"type": "module"`, `moduleResolution: NodeNext`. Relative imports **must include `.js`** (`import { env } from './config/env.js'`) even though source is `.ts`.
- **Env validation at boot**: `config/env.ts` throws at module load if `GEMINI_KOGA`, `GEMINI_KURAYAMI`, `API_KEY`, or `CLERK_JWT_KEY` are missing. Note `GEMINI_API_KEY` is *not* checked at boot — it's validated lazily inside `resolveServices`. `API_KEY` and `GEMINI_API_KEY` are distinct vars.
- **Naming**: `camelCase` (vars/fns), `PascalCase` (classes/types), `UPPER_SNAKE_CASE` (constants). Prefer named exports.
- **Errors**: `catch (error: unknown)` then narrow with `instanceof Error`. Success responses are wrapped as `{ success, message, data? }` (or `{ answer }` for the AI endpoint).

## Testing gotchas

Jest runs in **ESM mode** (`jest.config.js`, `preset: ts-jest/presets/default-esm`):
- `moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' }` strips the NodeNext `.js` extension so imports resolve to `.ts` sources under jest. **Required** — without it every relative import fails to resolve.
- Coverage thresholds enforced: branches 80%, functions/lines/statements 85%. `src/index.ts` is excluded.
- Tests live in `src/__tests__/`, matched as `*.test.ts` / `*.spec.ts`.
- Keep TypeScript pinned to `^5.x` — TS 6.0 breaks `ts-jest@29`.

## Build / deploy gotcha

`pnpm-workspace.yaml` uses an **`allowBuilds:`** block to approve native build scripts (`@clerk/shared`, `@google/genai`, `protobufjs`, `unrs-resolver`). pnpm 11.6 ignores build scripts by default; a missing/malformed `allowBuilds` makes `pnpm install --frozen-lockfile` fail with `ERR_PNPM_IGNORED_BUILDS`. `dist/` is gitignored.
