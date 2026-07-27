# Decarbon backend MVP — design

Date: 2026-07-27. Timebox: ~2 hours. Goal: the PoC becomes a real MVP — a TikTok
CTA will drive real traffic, so **signup** and **apply** must genuinely work in
production.

## Architecture

- **Backend**: existing `main-server` (Express, Node 20) at
  `~/Projects/Main/main-server`, deployed on Coolify at `https://api.t31k.cloud`.
  All endpoints live in one file, `routes/decarbon.js`, mounted at `/decarbon`
  in `app.js`. Auth mirrors `routes/yol.js`: bcrypt password hashes + JWT with
  audience `decarbon`, `Authorization: Bearer` header. CORS is already open.
- **Database**: shared Postgres on the VPS (reached locally via the `db` alias
  tunnel; main-server uses `DATABASE_URL`). Tables are prefixed `decarbon_`.
- **Frontend**: this repo (Next.js 16). The localStorage overlay
  (`lib/store.ts`/`lib/overlay.ts`) and seed-based auth are replaced with calls
  to `NEXT_PUBLIC_API_URL` (`https://api.t31k.cloud` in prod). JWT kept
  client-side; session context replaces the seed session.
- **Job ingest**: a Chrome extension (MV3). Workflow: the operator selects the
  job text on any job board page and presses **Cmd+Shift+Y**; the extension
  POSTs `{selection, url, title}` to `POST /decarbon/ingest` (shared-secret
  header). The server uses the existing OpenAI config to normalize raw text
  into a structured job row (`source: 'real'`, `source_url` kept, and
  `apply_url` — the link to the original application. On the job page, jobs
  with an `apply_url` show an external "Apply" link; jobs without one (posted
  in-app by employers) use the internal apply flow).

**Launch floor: at least 50 jobs live.** All seed + real-jobs entries are
migrated; the extension pipeline fills the rest with real scrapes.

## Tables

- `decarbon_users` — `id uuid PK, email citext/text UNIQUE, password_hash,
  name, role ('seeker'|'poster'), headline, company, company_logo, created_at`.
- `decarbon_jobs` — structured filter columns (`title, company, poster_id FK
  NULL, salary_min, salary_max, currency, city, country, remote, role_type,
  seniority, impact_area, posted_at, views, source, source_url`) plus a
  `detail jsonb` column for display-only content (about, impactSummary,
  impactStats, responsibilities, requirements, companyFacts, logos).
- `decarbon_applications` — `id uuid PK, job_id FK, seeker_id FK, status
  ('new'|'reviewing'|'interviewing'|'rejected'|'offer'), cover_note,
  applied_at`, `UNIQUE (job_id, seeker_id)`.

## Endpoints (all in routes/decarbon.js)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /decarbon/signup | — | Create user (seeker or poster), returns JWT |
| POST | /decarbon/login | — | Verify credentials, returns JWT |
| GET | /decarbon/me | JWT | Current user |
| GET | /decarbon/jobs | — | List/search/filter/paginate jobs |
| GET | /decarbon/jobs/:id | — | Job detail, increments views |
| POST | /decarbon/jobs | JWT poster | Create listing |
| POST | /decarbon/applications | JWT seeker | Apply (idempotent per job) |
| GET | /decarbon/applications/mine | JWT seeker | My applications |
| GET | /decarbon/employer/overview | JWT poster | Poster's jobs + applicants |
| PATCH | /decarbon/applications/:id | JWT poster | Update status (own jobs only) |
| POST | /decarbon/ingest | shared secret | Raw text → GPT-normalized job |

## Seed migration

One-off script pushes `data/seed.json` + `data/real-jobs.json` jobs and the two
demo accounts (bcrypt-hashed) into the tables so the site is never empty.

## Out of scope (2h cut)

Password reset, emails, profile editing, favorites, admin UI, rate limiting,
refresh tokens.

## Testing / verification

Existing vitest suite keeps passing (pure helpers stay). Backend smoke-tested
locally against the tunneled DB with curl before deploy; frontend `next build`
must pass; final end-to-end check on production URLs.
