# Auth email flows — design

Date: 2026-07-28
Repos: `ecolution-web` (client), `~/Projects/Main/main-server` (auth authority)

## Problem

Signup and login work today: `components/auth-form.tsx` posts to `/decarbon/signup`
and `/decarbon/login`, the returned JWT lands in `localStorage` via `lib/session.ts`,
and `AuthGuard` does client-side redirects. Everything around that is missing.

A user who forgets their password has no way back into their account. Nothing
confirms an email address is real, so applications and job listings can carry
addresses nobody can reach. The Google/Apple/GitHub buttons on the auth form are
inert placeholders.

## Scope

In: email verification, forgot/reset password, magic-link sign-in.

Out: social OAuth (the dead provider buttons stay dead, and stay disabled with
their existing tooltip). Out: moving auth into Next, cookie sessions, or
server-side route protection — `main-server` remains the sole auth authority and
`ecolution-web` remains a client of it.

## Architecture

Three flows, one shape: a request endpoint mints a single-use token and emails a
link; a confirm endpoint redeems it. Reset and magic-link confirms return
`{ token, user }` in the same shape as `/decarbon/login`, so the web client feeds
them to the existing `signIn()` with no change to session handling.

### Data

Two columns on `decarbon_users`:

- `email_verified boolean NOT NULL DEFAULT false`
- `email_verified_at timestamptz`

Existing rows backfill to `false`. See "Existing accounts" below for why that is
safe.

One new table:

```sql
CREATE TABLE decarbon_auth_tokens (
  id          text PRIMARY KEY,
  user_id     text NOT NULL REFERENCES decarbon_users(id) ON DELETE CASCADE,
  purpose     text NOT NULL CHECK (purpose IN ('verify', 'reset', 'magic')),
  token_hash  text NOT NULL,
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX decarbon_auth_tokens_hash ON decarbon_auth_tokens (token_hash);
CREATE INDEX decarbon_auth_tokens_user ON decarbon_auth_tokens (user_id, purpose, created_at DESC);
```

One table rather than three sets of columns on the user row: the three flows share
a lifecycle (mint, expire, redeem once) and a cleanup story, and single-use
enforcement lives in exactly one place.

The raw token is 32 bytes from `crypto.randomBytes`, base64url-encoded. Only its
SHA-256 hash is stored, so a database read cannot be replayed into an account
takeover. Lookup is by hash, which is why the hash column is indexed. Plain
SHA-256 rather than bcrypt is correct here: the token is full-entropy random, so
there is nothing to brute-force, and the lookup must be a single indexed query.

Lifetimes: `verify` 24 hours, `reset` 30 minutes, `magic` 30 minutes.

Redemption is a single atomic statement — `UPDATE … SET used_at = now() WHERE
token_hash = $1 AND used_at IS NULL AND expires_at > now() RETURNING user_id` —
so two concurrent clicks on the same link cannot both succeed.

A successful password reset additionally marks every other unused `reset` and
`magic` token for that user as used. Someone who resets because they suspect
compromise gets all outstanding links killed.

Expired and used rows are deleted opportunistically: each mint first clears rows
for that user that are used or expired. No cron job; the table stays small on its
own.

### Endpoints

All under `/decarbon`, added to `routes/decarbon.js` alongside the existing auth
routes, following that file's existing conventions (`pool.query`, `publicUser`,
`makeJwt`, flat error JSON).

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/verify/send` | Bearer | — | `{ ok: true }` |
| POST | `/verify/confirm` | none | `{ token }` | `{ token, user }` |
| POST | `/password/forgot` | none | `{ email }` | `{ ok: true }` |
| POST | `/password/reset` | none | `{ token, password }` | `{ token, user }` |
| POST | `/magic/request` | none | `{ email }` | `{ ok: true }` |
| POST | `/magic/confirm` | none | `{ token }` | `{ token, user }` |

The three request endpoints return `{ ok: true }` whether or not the address
belongs to an account, and take the same code path either way. An attacker cannot
use them to enumerate who has an account.

`/verify/confirm` returns a fresh JWT and user so the client can replace its stored
session immediately — otherwise a user who verifies in a second tab keeps a stale
`emailVerified: false` in the first.

Confirm endpoints distinguish their failures, because the UI copy differs:
`400 invalid_token` (no match), `400 token_expired`, `400 token_used`.

`publicUser()` gains `emailVerified` (from `email_verified`). The JWT payload does
**not** — verification state changes during a token's 30-day life, so it is read
from the database on each check, never trusted from the JWT.

### Rate limiting

Send endpoints throttle on the token table itself rather than adding Redis: a mint
is refused if the same user has a token of that purpose created within 60 seconds,
or 5 within the last hour. A refusal still returns `{ ok: true }` — surfacing "too
many requests" here would re-open the enumeration hole the flat response closes.

This is per-account, not per-IP. It bounds email sent to any one victim address,
which is the abuse that matters. It does not bound total send volume from a
distributed attacker hitting many addresses; Resend's own account limits are the
backstop there, and a real IP-level limit belongs at the reverse proxy, not in
this route file.

### Email

`config/resend.js` gains `decarbon: new Resend(process.env.RESEND_KEY_DECARBON)`,
matching the existing per-product key convention. The key is already set in
`main-server/.env` and on Coolify (MAIN-SERVER app); **Coolify needs a redeploy for
it to reach the running container.**

Templates live in a new `utils/decarbon/email.js` as table-based HTML, following
the `utils/yuree/email.js` precedent (inline styles, fixed-width table, plain-text
fallback link under the CTA). Three: verify, reset, magic.

Links are built from a new `DECARBON_WEB_URL` env var — `http://localhost:3000`
locally, the production web origin on Coolify. It must be added in both places
before the flows work.

Sending happens after the database commit and its failure does not fail the
request: the token is already valid, and a user who sees "check your email" and
gets nothing can retry. Send failures are logged with the Resend error.

**From address: `onboarding@resend.dev` for now.** This is a build-and-test
placeholder. Resend only delivers from that address to the account owner's own
email, so *no other address will receive anything*. Combined with verification
gating this means only the account owner can complete a signup end to end. A
verified sending domain is a hard prerequisite for real users — tracked below as a
launch blocker, not a follow-up nicety.

### Enforcement — built, but off for MVP

`requireVerified` middleware is written and wired into `POST /decarbon/applications`
and `POST /decarbon/jobs`, rejecting with `403 { error: 'email_not_verified' }`. It
is controlled by `DECARBON_REQUIRE_VERIFIED`, **which defaults to `false`**.

The gate cannot be on for the MVP. `onboarding@resend.dev` delivers only to the
account owner's own inbox, so no seeded account and no test signup can ever
complete verification. Turning the gate on would make "log in and see both sides"
impossible — the exact goal of this work. So verification is tracked, emailed, and
nudged with a banner, but nothing is blocked until a real sending domain exists and
the flag is flipped.

Login, browsing, and reading stay open regardless. Locking someone out of their own
account over an unclicked link is hostile; the cost being prevented is wasted human
time on the receiving end of a bogus application or listing.

#### Existing accounts

Existing rows backfill to `email_verified = false`. With the gate off this changes
nothing functionally — they simply see the banner. When the flag is eventually
turned on, decide then whether to backfill pre-existing accounts to `true` rather
than locking out real users who never had a chance to verify.

## Seed data

The database currently holds 103 real scraped jobs, one poster, **zero seekers and
zero applications** — which is why both signed-in dashboards render empty. Fixing
that is part of this work, not separate from it.

`scripts/seed/` in `ecolution-web` generates `data/seed.json`, a fixture from the
pre-backend POC. It is not the tool for this: the target is now Postgres. A new
`main-server` script, `bash/seed_decarbon.js`, seeds the live database directly and
is idempotent (`ON CONFLICT DO NOTHING` on email and job id) so it can be re-run.

It creates:

- Two demo accounts with known bcrypt-hashed passwords — one `seeker`, one
  `poster` — both `email_verified = true`, so they work whatever the gate is set to.
- A handful of `posted` jobs owned by the demo poster, so the employer dashboard
  and "my listings" have content distinct from the scraped `real` jobs.
- Applications from the demo seeker across a mix of both posted and real jobs, in
  varied statuses, so the seeker's applications list and the employer's applicant
  view are both populated.

Credentials are printed on completion. They are demo accounts for a pre-launch
database and are documented as such; they must not survive into a production launch
with real users.

## Web client

New routes under `app/auth/`:

- `forgot/page.tsx` — email field, posts `/password/forgot`, then shows a
  "check your inbox" state unconditionally.
- `reset/page.tsx` — reads `?token=`, new-password field, posts `/password/reset`,
  signs in and redirects on success.
- `verify/page.tsx` — reads `?token=`, confirms on mount, replaces the session,
  shows success or a typed error with a resend action.
- `magic/page.tsx` — reads `?token=`, confirms on mount, signs in and redirects.

These pages reuse the existing `app/auth/page.tsx` split-panel shell so the flows
look like one product rather than four bolted-on forms.

`components/auth-form.tsx` gains a "Forgot password?" link beside the password
label (login mode only) and an "Email me a link instead" toggle that swaps the
password field for a single submit posting `/magic/request`.

`components/unverified-banner.tsx` is a new dismissible banner rendered in the
account and employer shells when `session.user.emailVerified` is false, with a
resend action calling `/verify/send`.

`lib/api.ts` gains typed functions for the six endpoints; `ApiUser` gains
`emailVerified: boolean`.

`lib/session.ts` is unchanged. Confirm endpoints return the login response shape,
so `signIn()` already handles them.

Sessions stored before this change lack `emailVerified`. `isSession()` in
`lib/session.ts` only checks `token` and `user`, so those sessions stay valid and
read `undefined` — which is falsy, and so shows the banner. The banner's resend
action refreshes the session from `/decarbon/me`, which self-heals the stored
shape.

## Testing

Vitest in `ecolution-web` covers only pure modules today (`lib/filters.ts`,
`lib/job-view.ts`), and `main-server` has no test setup. This design does not
introduce one — that is its own decision, not a rider on this work.

What gets tested here is the token logic, which is where the security-relevant
bugs live and which is pure enough to test without a harness: hash-and-compare,
expiry boundaries, single-use redemption, and reset-invalidates-siblings. These go
in `ecolution-web/tests/` against a small extracted module only if the logic is
mirrored there; otherwise verification is manual against a local main-server.

Manual verification per flow, against `localhost:3001` with the account owner's own
email (the only address `resend.dev` will reach): request → receive → click →
confirm → session updated. Plus the negative paths: reused link, expired link,
unknown email (must look identical to known), and applying while unverified.

## Sequencing

1. Migration: user columns + token table.
2. `main-server`: token helpers, six endpoints, `requireVerified` (flag off).
3. `main-server`: Resend client, three templates, `DECARBON_WEB_URL` in both envs.
4. `main-server`: `bash/seed_decarbon.js`, run against the local database.
5. `ecolution-web`: `lib/api.ts` + `ApiUser`.
6. `ecolution-web`: four pages, auth-form changes, banner.

Steps 1–4 ship independently of 5–6; nothing user-visible changes until step 6.
Step 4 is what makes the signed-in views non-empty, so it lands before the UI work
rather than after.

## Launch blockers

- Verified Resend sending domain, replacing `onboarding@resend.dev`. Nothing
  reaches real users until this is done, and `DECARBON_REQUIRE_VERIFIED` cannot be
  turned on before it.
- Remove the demo seed accounts before a launch with real users.
- Coolify redeploy of MAIN-SERVER, so `RESEND_KEY_DECARBON` reaches the container.
- `DECARBON_WEB_URL` set locally and on Coolify.
- Revoke the live Resend key hardcoded at `main-server/send_email.js:6`
  (`re_Q1CmDMfr…`), which is committed to the repository. Unrelated to this work,
  but it is a live credential in version control.
- Rotate `RESEND_KEY_DECARBON`, which was pasted into a chat transcript.
