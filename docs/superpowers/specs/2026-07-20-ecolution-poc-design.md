# Ecolution end-to-end PoC — design

**Date:** 2026-07-20
**Status:** Approved, ready for implementation planning
**Goal:** A client-facing proof of concept, deployed at ecolutionnetwork.com, that works end to end as both a job seeker and a job poster.

---

## 1. Context

The site currently renders five screens ported from Stitch designs (`/`, `/browse`, `/jobs/[id]`, `/employer`, `/auth`), all backed by hardcoded fixture arrays. Nothing is interactive: search does nothing, filters do nothing, Apply does nothing, and the two job data shapes (`BrowseJob` in `lib/jobs.ts`, `Job` in `app/jobs/[id]/job-data.ts`) are maintained separately — which already caused every Details link to 404 when their ids drifted apart.

This spec turns that into a working demo.

## 2. Decisions taken

| Decision | Choice | Why |
|---|---|---|
| Deployment | Deployed (ecolutionnetwork.com) | Client explores on their own time |
| Persistence | Seed JSON (read-only) + localStorage overlay | Serverless filesystems are read-only; file writes would fail silently in front of the client |
| Job data | Generated, calibrated against real listings | greenjobs.net is a link portal, not a board; its downstream listings are policy/legal/nonprofit roles that contradict Ecolution's climate-tech positioning |
| Volume | ~500 jobs, unevenly distributed across 10 posters | Populated browse; poster dashboards differ meaningfully |
| Auth | Plain-text compare + one-click demo login | Shared demo password; hashing would imply security this does not have |
| Flow scope | Search/filter/apply/track + dashboard/applicants/status/post | Smallest set demonstrating a real round trip |

### Rejected: writing to a JSON file on disk

The literal reading of the original request. Works on localhost, throws `EROFS` on a deployed serverless host. The Apply button would break during the demo. Rejected for the deployed target.

### Rejected: scraping greenjobs.net

`robots.txt` permits it (`Disallow:` with an empty value) and the site returns 200, so this was rejected on data quality, not access. greenjobs.net hosts no listings itself — it links out to climatechangejobs.com and similar. Those listings are titles like "Summer 2026 Organizing Fellow" and "Assistant General Counsel — Environmental Regulatory". Seeding the board with them would leave the "Engineering" and "$160k+" filters returning almost nothing.

---

## 3. Data model

### 3.1 One unified job record

`BrowseJob` and `Job` merge into a single `Job` type in the seed. Both the browse card and the detail page read from the same record, eliminating the id-drift bug class.

Two constraints shape the schema:

**Icons cannot be serialised.** `BrowseJob.impact.icon` is currently a `LucideIcon` component reference. The seed stores a string key instead, resolved through a lookup map at render time:

```ts
// data: impactArea: "carbon-capture"
const IMPACT_ICONS: Record<ImpactArea, LucideIcon> = {
  "renewable-energy": Leaf,
  "carbon-capture": Cloud,
  "water-systems": Droplet,
  "circular-economy": RefreshCw,
};
```

**Filters need structured fields.** `"$140k – $185k"` cannot be filtered numerically. Structured fields are stored alongside the display strings, so rendering is unchanged:

```ts
type Job = {
  id: string;
  title: string;
  posterId: string;

  // structured — drives filtering
  salaryMin: number;
  salaryMax: number;
  currency: "USD" | "EUR" | "GBP";
  city: string;
  country: string;        // ISO-3166 alpha-2
  remote: boolean;
  roleType: RoleType;      // engineering | data-science | product | policy | operations
  seniority: Seniority;    // intern | junior | mid | senior | staff | director
  impactArea: ImpactArea;
  postedAt: string;        // ISO 8601
  views: number;           // seeded; drives employer dashboard counts

  // display — rendered as-is
  salaryDisplay: string;   // "$140k – $185k"
  locationDisplay: string; // "Austin, TX (Hybrid)"

  // detail page
  about: string;
  impactSummary: string;
  impactStats: { value: string; label: string }[];
  responsibilities: string[];
  requirements: string[];
  companyFacts: { label: string; value: string }[];
  // ...company/logo fields
};
```

`postedAt` is an absolute timestamp. Relative strings ("Posted 2h ago") are derived at render, so the demo does not visibly rot.

### 3.2 Application record

```ts
type AppStatus = "new" | "reviewing" | "interviewing" | "rejected" | "offer";

type Application = {
  id: string;
  jobId: string;
  seekerId: string;
  status: AppStatus;
  coverNote: string;
  appliedAt: string;   // ISO 8601
};
```

Status flows forward through the list but any transition is permitted — a poster can move an applicant back to `reviewing`. `rejected` and `offer` are terminal in presentation only.

### 3.3 Seed file

`data/seed.json`:

```
jobs         ~500  unevenly distributed across 10 posters (~92 down to ~12)
posters      10    company profile, logo, plan
seekers      20    name, email, headline, experience
applications ~40   pre-seeded so poster dashboards are not empty
```

### 3.4 Seed generation

`scripts/generate-seed.ts`, run once, output committed to the repo. **Deterministic** — a fixed PRNG seed means regeneration reproduces identical data, so screenshots and demo scripts stay valid.

Realism rules:

- Real companies matched to roles they would plausibly hire for (Watershed → carbon accounting; Helion → fusion; Form Energy → iron-air storage). No invented "EcoCorp" names.
- Salary bands derived from seniority × city, in that city's currency.
- Requirements naming real tools: PyPSA, PLEXOS, PVSyst, ETAP, GHG Protocol.
- Seniority distribution weighted to mid-level, with a few staff/principal and a handful of internships.
- `postedAt` clustered in the recent past with a long tail.
- Prose varied across several templates so 500 listings do not read as one sentence with nouns swapped.

---

## 4. Storage architecture

### 4.1 Server reads the seed; the URL holds the query

500 full job records is roughly 1–2 MB. Shipping that to the browser for client-side filtering would make `/browse` slow.

Instead, **search and filter state lives in URL search params**, and filtering happens on the server:

```
/browse?q=grid&country=DE&role=engineering&salaryMin=90000&page=2
```

- The filter sidebar and hero search write to the URL (`useRouter().push`)
- The `/browse` server component reads `searchParams`, filters the seed, returns one page
- Payload stays small; links are shareable; the back button works

### 4.2 Mutations live in localStorage

One key, `ecolution:demo:v1`, holding an overlay merged over the seed on read:

```ts
type Overlay = {
  applications: Application[];              // seeker submissions
  listings: Job[];                          // poster-created jobs
  statusPatches: Record<string, AppStatus>; // applicationId -> status
  session: { userId: string; role: "seeker" | "poster" } | null;
};
```

Merge rules:

- **Applications** — seed applications concatenated with overlay applications; `statusPatches` applied last by id
- **Listings** — overlay listings merged client-side on top of server results (only ever a handful)
- **Reset** — a "Reset demo" control clears the key, restoring pristine seed state

### 4.3 Boundary summary

| Concern | Where |
|---|---|
| Job catalogue, users, seeded applications | Server, from `data/seed.json` |
| Search, filters, pagination | Server, driven by URL params |
| Applications, new listings, status changes, session | Client, localStorage |

---

## 5. Auth

`/auth` gains working sign-in: email and password compared in plain text against the seed, session written to the localStorage overlay. Two one-click demo buttons sign in as `jobseeker@email.com` or `jobposter@email.com` so the client never types credentials.

The existing account-type toggle (job seeker / employer) determines which demo button is emphasised and where sign-in redirects.

Route guards on `/employer/*` and `/account/*` redirect to `/auth` when no session exists.

> **Security note, deliberately recorded.** This is not authentication. The guard is client-side and trivially bypassed by navigating directly. The seed ships every account's password to the browser. Acceptable for a PoC with fictional data; must be replaced entirely before any real user account exists.

---

## 6. Seeker journey

| Step | Route | Behaviour |
|---|---|---|
| Search | `/` | Hero query + country push to `/browse?q=…&country=…` |
| Browse | `/browse` | Working search, role/salary/location/impact filters, pagination |
| Detail | `/jobs/[id]` | Full record from seed |
| Apply | `/jobs/[id]` | Dialog: name/email prefilled from session, plus cover note → writes `applications[]` |
| Track | `/account` | Applications with live status |

Applying twice to the same job is blocked — the button reads "Applied" and links to `/account`.

`jobseeker1@` and `jobseeker2@` carry pre-seeded applications, per the original request.

## 7. Poster journey

| Step | Route | Behaviour |
|---|---|---|
| Dashboard | `/employer` | Real counts computed from seed, replacing hardcoded 42.8k/12/341 |
| Listings | `/employer/jobs` | This poster's listings with real view/application counts |
| Applicants | `/employer/jobs/[id]` | Applicants for one listing |
| Review | `/employer/applicants/[id]` | Applicant detail + status dropdown → `statusPatches` |
| Post | `/employer/post` | Form creating a listing that appears in browse immediately |

**The round trip that demonstrates the product:** apply as seeker → sign out → sign in as poster → the application is waiting in the dashboard.

## 8. Hero country dropdown

The hero currently has a free-text "Remote or City" input. It becomes a country `<select>` populated from countries actually present in the seed, plus a "Remote" option — so every choice returns results. Both hero fields push to `/browse`.

## 9. Filter semantics

| Filter | Control | Matching |
|---|---|---|
| Query | Text | Case-insensitive substring over title, company, and requirements |
| Role type | Checkbox group | OR within the group |
| Salary | Range slider | `job.salaryMax >= selected` |
| Location | Country select | Exact country, or `remote === true` when Remote is chosen |
| Impact area | Chip group | OR within the group |

Groups combine with AND. Active filters render as removable chips above the results, with a count and a "Clear all" that resets the URL.

**Empty state:** when filters match nothing, show which filters are active and offer to clear them — never a bare empty list.

---

## 10. Build sequence

This spec is larger than a single implementation plan should carry. Each stage below is a separate plan-and-build cycle with its own verification, ordered by dependency. Each is independently demoable, so a partial build still shows something working.

1. **Seed + storage** — generator, `data/seed.json`, unified `Job` type, storage module. Everything depends on this.
2. **Auth** — sign-in, session, demo buttons, route guards.
3. **Seeker flow** — apply dialog, `/account`.
4. **Poster flow** — real dashboard counts, applicant lists, status changes, post form.
5. **Search + filters** — URL params, server filtering, hero dropdown, empty states.

## 11. Out of scope

Saved jobs; editable seeker profiles; resume upload; email notifications; payment or subscription logic; server-side sessions; real password hashing; cross-device state sharing.

## 12. Risks

| Risk | Mitigation |
|---|---|
| Client opens the demo on a second device and sees none of their prior actions | Expected: overlay is per-browser. Frame "Reset demo" as a feature. Flag to the client before they explore. |
| Generated listings read as synthetic | Real companies, real tools, varied prose, seniority-appropriate salary bands. |
| Seed file bloats the bundle | Read on the server only; never imported into a client component. Verified by checking the client bundle after implementation. |
| localStorage unavailable (private mode) | Feature-detect; fall back to in-memory state for the session, with a visible notice. |
