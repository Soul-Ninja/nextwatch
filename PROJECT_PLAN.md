# NEXTWATCH — Project Plan

> **Status:** Planning / pre-implementation. Nothing here asserts that code exists.
> **Version:** 1.3 · 2026-11-16 (merges the former PRD, architecture, design system, roadmap, QA checklist and decision log; architecture simplified per DEC-008)
> **Tagline:** The Anime Anticipation & Live Release Radar
> **Core principle:** We are not building a place to look up anime. We are building a place to look forward to anime.

How to work is in `AGENTS.md`. Data and asset rights are in `docs/DATA_SOURCES.md`.

## 1. Summary
**UX-first directive:** functional completeness, intuitive navigation and accurate release information take precedence over visual effects. Build a minimal, polished interface that works on touch, keyboard and low-end devices; validate it with anime fans; then layer in optional signature motion. The product **must be useful with every animation turned off**. This rule supersedes any conflicting emphasis elsewhere.

Nextwatch is an anticipation-first anime discovery and release platform: an editorial flagship premiere (**Apex**), a timezone-correct daily broadcast console (**Radar**), a navigable future-release timeline (**Horizon**), a personal collection of anticipated titles (**My Universe**) and, once a real audience exists, a first-party anticipation leaderboard (**Pulse**).

**Release center of gravity:** a *release event*, not a catalog record. A title can have a TV broadcast, a streaming debut in a region, a theatrical opening in Japan, a trailer debut or a release-date announcement. Each is a distinct event with its own evidence and precision.

### Core user jobs
1. **Right now:** what's airing today, and at what time in my timezone?
2. **Next:** what anime, sequel or movie is coming soon or later?
3. **Mine:** what changed about the anime I'm waiting for?
4. **Event:** what happens when a major premiere approaches or arrives?

### Audience
- **Weekly watcher:** next Japanese broadcast and known regional streaming release, in local date/time.
- **Season explorer:** what's arriving this/next season; quick filters; trailer and studio information where licensed.
- **Franchise fan:** follow a sequel or movie despite an unconfirmed date; see new announcements.
- **Premiere enthusiast:** a major launch event with countdown, source-backed status and a shareable page.

### Not in the first public release
Rebuilding MAL/AniList libraries, review scores, forums or episode-completion tracking; chat, comments, watch parties or a social network; accounts and cross-device sync; push/email notifications; recommendation engine; native mobile apps; Pulse from first-party metrics; 3D tilt, parallax, particles and elaborate transitions; piracy or unverified streaming links; AI-generated fake posters; fake countdowns, fabricated hype metrics or viewer numbers; any provider, artwork or data without approved rights.

## 2. Scope
| Pillar | User outcome | After initial validation |
|---|---|---|
| **Apex** | Feel the excitement of a marquee premiere | Rotating events, richer atmospheres |
| **Radar** | Find local upcoming episode broadcasts quickly | Regional streaming feeds, opt-in alerts |
| **Horizon** | Navigate upcoming seasons and TBA titles | Milestone exploration, personalized suggestions |
| **My Universe** | Follow titles without friction | Accounts, cross-device sync, notifications |
| **Pulse** | See rising anticipation | Deferred; first-party follows and momentum ranking with abuse controls |

### Requirements
- **R-00 UX-first interaction contract [MVP blocker].**
  - A new user identifies where to check today's airings, upcoming anime and followed titles without a tutorial (target ~3 seconds of orientation; measure, don't assume).
  - Follow/unfollow directly from a card with one action, immediate feedback and browser persistence; no account.
  - Main navigation is obvious on small screens; any core destination is at most two steps from Home; nothing important lives only behind hover.
  - Essential date, episode, source confidence and broadcast-vs-streaming context are visible without an accordion or animation. Secondary filters and metadata sit behind optional controls.
  - A visually finished but functionally incomplete feature **fails** review.
- **R-01 Global navigation [MVP].** Home, Radar, Horizon, My Universe. Pulse hidden or explicitly marked preview until real. Links are bookmarkable, keyboard accessible and retain query filter state where appropriate.
- **R-02 Apex [MVP, lightweight].** Editorially selected flagship release: title, kind of event, official artwork only if authorized, release date precision, source evidence, link to event, follow CTA. Exact countdown only with an exact trusted timestamp. Trailer is an optional verified authorized embed; no auto-playing sound. On TBA show status/milestone instead of a timer.
- **R-03 Radar [MVP critical].** 7-day selector anchored in the viewer's local zone and date; optional next/previous week. Shows episode number, title, channel/region qualifiers where verified, local time, event status and follow action. Sorted chronologically; handles simultaneous releases; separates Japanese broadcast from verified distribution releases. Missing event time is visibly unknown.
- **R-04 Horizon [MVP].** Views: current season, next season, next year, beyond/TBA. Filters: TV/movie/OVA, sequel/new adaptation/original, studio and genre where reliable. Explains source data limitations. Presents `YYYY`, season or TBA accurately. Every card links to a meaningful detail page.
- **R-05 Detail and premiere event [MVP].** Title summary, stage of release, evidence and date precision, authorized images/trailers, milestones/change history, follow CTA and official links. Dedicated premiere view for exact-date major events: Before -> Broadcast window -> Post-broadcast, where `available to stream` is a separate verified status. A clock reaching zero must not imply availability in all regions.
- **R-06 My Universe [MVP].** Follow/unfollow without login; persist locally; list followed items with the next verifiable milestone/event. Empty and reset states. Say plainly that follows live in this browser only; no promise of cross-device sync before accounts exist. Import/export is deferred (section 6).
- **R-07 Release intelligence [basic at first].** Store meaningful metadata changes, especially date changes and delays; show source and time. Surface changes on My Universe. Notification delivery is out of MVP.
- **R-08 Pulse [post-beta].** Aggregate consent-respecting unique follows, compare rolling periods, require a minimum eligible sample, define transparent ranking and privacy rules, implement abuse controls. Editorial picks are clearly labeled until first-party metrics are meaningful.
- **R-09 Source attribution [MVP blocker].** Every publishable time-sensitive claim has a source URL, checked-at timestamp and applicable region, or is labeled uncertain/editorial. On errors show a last-updated indicator without overstating current availability.
- **R-10 Search/SEO [MVP].** Visible title search with no-results state and keyboard access; indexable pages for series and public release events (subject to licensed content), page metadata, canonical pages, structured data where accurate, shareable event URLs, correct Open Graph previews.

### Homepage composition
1. Global navigation: Nextwatch, Radar, Horizon, Pulse (only when live), My Universe.
2. **Apex:** responsive, accessible marquee event with truthful countdown/date display. On mobile it is compact enough that the next airing is reachable immediately.
3. **Today's Radar:** viewer-local schedule and 7-day selector, without excessive scrolling.
4. **Upcoming Horizon:** current season, next season, next year, beyond/TBA.
5. **Discovery:** editorial picks until genuine first-party signals exist.
6. **My Universe preview:** followed events for returning users; a discovery invitation for new users.
7. Footer: methodology, data attribution, content credits, privacy, contact, correction channel.

### User journeys
- **UJ-01 See today's releases.** Home -> Radar -> local day -> title and episode -> event -> follow. Success: next relevant airing identified in under 10 seconds in moderated testing.
- **UJ-02 Follow an upcoming TBA release.** Horizon -> filter by year/TBA/studio -> title -> follow -> My Universe. Success: no invented countdown; title stays followable at `TBA` or year/season precision.
- **UJ-03 Experience a premiere.** Apex -> premiere page -> verified time and context -> optional trailer -> follow -> state transition only when evidence justifies it.
- **UJ-04 Respond to a postponed premiere.** Refresh detects official change -> editorial validation where appropriate -> change log -> updated countdown or `Delayed` -> My Universe change badge. Success: previous date is not silently overwritten.
- **UJ-05 Offline or upstream outage.** Return with browser cache -> see most recent known information and its `last updated` timestamp -> no unsupported live/availability claims -> retry without data loss.

## 3. Vocabulary and copy
- `ANNOUNCED`: officially disclosed, no reliable specific release window.
- `IN_PRODUCTION`: formally in production, possibly still without a date.
- `SCHEDULED`: planned release with a precise or partial window.
- `DELAYED`: prior commitment moved or postponed.
- `BROADCAST_AIRING` / `BROADCAST_AIRED`: TV broadcast timing only.
- `STREAMING_CONFIRMED` / `STREAMING_AVAILABLE`: explicit region/platform-specific verification.
- `RELEASED`: event completed within its defined scope (not necessarily globally accessible).
- `UNKNOWN`: insufficient evidence; never force a confident label.

**Prefer:** `Airs in Japan at 8:00 PM IST`, `Streaming time not yet confirmed`, `Streaming release not confirmed for your region`, `Expected Fall 2027`, `Release date TBA`, `Delayed—new date pending`.
**Avoid:** `Out now everywhere`, `Confirmed` without evidence, `12,480 fans waiting` unless genuinely measured, second-level countdowns to speculative windows.

## 4. Acceptance tests (must pass)
0. A first-time user locates Today's Radar, finds a coming title and follows it on mobile without instruction; friction is observed and documented, not inferred from a screenshot.
1. A user in Asia/Kolkata and a user in America/Los_Angeles see correct local dates for the same UTC event.
2. An event at 00:15 Japan time groups under the viewer's day, even when that is the previous calendar day.
3. `Fall 2027` and `TBA` do not display ticking countdowns.
4. A broadcast event passing its scheduled time does not claim streaming availability.
5. A date postponement updates the display and preserves change history.
6. All key actions work on touch, keyboard, screen reader and `prefers-reduced-motion`.
7. User can follow, refresh, go offline and retain follows; a corrupt stored value does not crash the page.
8. Malformed provider payloads don't crash Home or show fictional fields.
9. Absent art or trailer yields a clean fallback.
10. Pulse doesn't display invented viewers or unsupported growth figures.

### Unassisted usability test
Run without explaining the interface, with at least 5 anime fans on the first prototype and 10–20 before public beta. Record time to completion, taps, wrong paths, confidence and confusion caused by timing labels. Do not prefill successful outcomes. Fix blocking friction before any visual upgrade.
1. "Find the next anime episode airing in your timezone and explain when it becomes watchable."
2. "Find a sequel announced for next year and follow it."
3. "Find a movie announced without an exact date—what does Nextwatch show?"
4. "A followed anime has been delayed. How would you know?"
5. "Return after closing the tab. Is your followed list still here?"

### Targets and metrics
- Next-airing discovery in **under 10 seconds** in observed tasks (a test target, not a guarantee).
- Real-user Core Web Vitals at 75th percentile: LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1.
- Zero known wrong timezone/day conversions; no synthetic exact times for vague dates.
- Source-backed schedule accuracy and date-change latency tracked.
- Accurate last-updated indicator on every schedule view; errors and data age monitored.
- First-session follow rate and 7-day return rate: establish baselines rather than inventing growth claims.

## 5. Domain model
Conceptual TypeScript types; NW-002 finalizes them.

```ts
type DatePrecision = 'EXACT' | 'DAY' | 'MONTH' | 'SEASON' | 'YEAR' | 'TBA';
type EventKind =
  | 'TV_BROADCAST' | 'STREAMING_RELEASE' | 'THEATRICAL_RELEASE'
  | 'TRAILER' | 'ANNOUNCEMENT';
type EventStatus = // same list as section 3
  | 'ANNOUNCED' | 'IN_PRODUCTION' | 'SCHEDULED' | 'DELAYED'
  | 'BROADCAST_AIRING' | 'BROADCAST_AIRED'
  | 'STREAMING_CONFIRMED' | 'STREAMING_AVAILABLE'
  | 'RELEASED' | 'UNKNOWN';

interface Anime {
  id: string; slug: string; titles: Record<string, string>;
  format?: 'TV' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL';
  studios?: string[]; genres?: string[];
  relations?: Array<{ animeId: string; type: 'SEQUEL' | 'PREQUEL' | 'ADAPTATION' | 'OTHER' }>;
}
interface ReleaseWindow {
  precision: DatePrecision;
  instantUtc?: string; // ISO 8601 only when EXACT
  localDate?: string; // YYYY-MM-DD for DAY precision
  month?: string; year?: number;
  season?: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
  timezone?: string; // when source expresses a local time
}
interface ReleaseEvent {
  id: string; animeId: string; kind: EventKind;
  episode?: number; window: ReleaseWindow;
  status: EventStatus; region?: string; platform?: string;
  language?: string; evidenceIds: string[];
  lastVerifiedAt?: string; updatedAt: string;
  history?: Array<{ changedAt: string; previous: ReleaseWindow; evidenceId: string }>;
}
interface SourceEvidence {
  id: string; sourceName: string; url: string;
  claim: string; observedAt: string; confidence: 'OFFICIAL' | 'SECONDARY' | 'UNVERIFIED';
  rightsStatus: 'APPROVED' | 'PENDING' | 'RESTRICTED';
}
// Follows are a string[] of anime IDs in localStorage (section 6).
```

**Invariants:** `instantUtc` is required iff `precision=EXACT`; month/season/year windows never create fabricated instants. A distribution event is scoped to its region and platform; missing scope means unknown, not worldwide. A changed window appends the previous one to `history` with its evidence.

## 6. Architecture
**One Next.js app with its data in the repo.** Pages are statically rendered from a typed, hand-curated seed file. There is no database, API layer, ingestion service or admin UI until a trigger in the table at the end of this section is met. The first prototype runs on visibly labeled fixtures in the same shape. Accounts, Pulse and notifications remain post-beta.

- **Stack:** Next.js App Router, TypeScript, React, Tailwind CSS; Vitest + Playwright; lint, typecheck and CI before deployments. CSS transitions first; Motion for React only where it adds value. Proposed, not installed.
- **Data:** one typed seed module holding `Anime`, `ReleaseEvent` and `SourceEvidence` records (section 5). A unit test asserts the invariants over the whole seed. Editing the file and committing is the editorial workflow; a rebuild publishes it. Git records who edited what. A changed date is appended to `ReleaseEvent.history` with its evidence, never overwritten, so the UI can show it.
- **Code layout:** start with one `lib/` folder: types, seed and pure functions (group by local day, precision label, next event for a title). Split into `catalog` / `events` / `provenance` / `personalization` modules when a file becomes hard to navigate, not before.
- **Routes:**
  - `/` — Apex + next release + Horizon entry points.
  - `/radar?date=YYYY-MM-DD` — viewer-local schedule; timezone preference stored separately; shared links explain temporal context.
  - `/horizon?window=next-season&format=movie` — indexable base pages with canonical handling.
  - `/anime/[slug]` — overview, sourced event list, follow button.
  - `/anime/[slug]/premiere/[eventId]` — exact event page, only when warranted.
  - `/my-universe` — browser personalization; no login.
  - `/pulse` — only after metrics are genuine and privacy-reviewed.
  - No `/api` routes: server components import the seed directly.
- **Rendering:** static generation with minimal hydrated controls; never hide schedule content behind JS-only fetching. Every schedule view shows each event's `lastVerifiedAt`, the build time and any known-unverified state.
- **Timezone:** the server cannot know the viewer's zone. Radar is rendered in Japan time, grouped by Japan day and labeled as such; on load the client regroups by the viewer's local day with `Intl.DateTimeFormat` and relabels. The day selector and `?date=` are handled client-side. Acceptance tests 1 and 2 run in Playwright with emulated timezones.
- **Client storage:** follows are a JSON array of anime IDs under one `localStorage` key. Read defensively: an invalid value becomes an empty list, never a crash. Tell users plainly that follows live in this browser only. Limit: only IDs are stored, so offline use (UJ-05) goes no further than what the browser itself has cached.
- **Ingestion pipeline (only once a provider is approved):** `Discover -> License/Permission Gate -> Fetch -> Validate -> Normalize -> Deduplicate -> Compare -> Verify -> Publish -> Monitor`.
  - Gate: if a source is `unknown`, `restricted` or `denied`, no production ingestion.
  - Fetch on the backend only, with bounded concurrency, retries, backoff and conditional requests where permitted.
  - Reject malformed or implausible records; quarantine them for review.
  - Never use an external provider ID as the only canonical identity; ambiguous cross-provider matches go to human review.
  - Record changes and their source rather than overwriting. Official announcements take precedence only after authenticity is checked; low-confidence records are labeled or withheld.
  - Invalidate only affected pages. Monitor source health, ingestion lag, failure count and stale schedules.
- **Security and privacy:** validate client inputs (search, query parameters, stored follows); escape or sanitize HTML; no secrets in the browser bundle; follows never leave the browser without consent. Protected editorial endpoints, cross-origin rules and rate limits apply once a server API exists. Pulse must document signal collection and retention before launch.
- **Reliability:** the failure mode of a static site is stale data, so freshness is always visible and nothing is fabricated when metadata is missing. Retries, per-source health, safe source disabling, migration rollback and feature flags arrive with ingestion and the database.

**Deferred until triggered**

| Piece | Add it when |
|---|---|
| Ingestion jobs and provider adapters | A provider is approved in `docs/DATA_SOURCES.md` |
| PostgreSQL and migrations | An approved feed is too large to hand-merge, or an editor who cannot commit needs to change data |
| `/api/v1/*` | A second client needs the data |
| Admin/editorial UI | A non-developer editor joins |
| IndexedDB and a service worker | My Universe must work offline with cached event data |
| Follow export/import | Users ask for it, or accounts are being planned |

## 7. Design
Cinematic anticipation plus broadcast-console clarity: an elegant dark aesthetic, sharp typographic hierarchy and restrained structural accents, without copying any existing brand. Tokens are proposals, subject to prototype and usability validation.

| Token | Proposed value | Role |
|---|---|---|
| `--bg` | `#09090D` | Obsidian surface |
| `--surface` | `#16161E` | Cards/dialogs |
| `--surface-raised` | `#20202B` | Hover/active layers |
| `--text` | `#F5F5F8` | Primary text |
| `--muted` | `#B6B6C3` | Secondary text |
| `--signal` | `#E83944` | Premiere urgency, selective CTA |
| `--pulse` | `#9675FC` | Anticipation visualizations |
| `--radar` | `#42D7C3` | Broadcast/confirmed signal |

- **Color and contrast:** check every text/background pairing, particularly over artwork. Never rely on color alone to convey release state. New UI reuses tokens and core components.
- **Layout:** small always-legible header; Apex with readable overlay over licensed artwork; Radar above the fold with day switcher, local timezone label and chronological rows; Horizon with uncluttered cards and easily reached filters; My Universe with next events, changed dates, empty and offline states.
- **Responsive:** design first for 360px-class widths and keyboard users. Mobile compresses Apex, stacks actions and avoids full-screen video. Tablet uses two columns where density allows. Respect user font scaling; no fixed-width cards that overflow.
- **Interaction:** follow buttons show an unambiguous active state and accessible name; seven-day navigation supports touch, keyboard and wrapping across weeks; TBA uses a milestone cue rather than a disabled timer; tooltips are supplements; release dates show local time with explicit context, and the original source timezone can be inspected.
- **Accessibility:** semantic links/buttons; visible keyboard focus; descriptive alt text for informative art, decorative art hidden from screen readers; dialogs with correct focus behavior; large tap targets; no autoplay audio; functional without WebGL/Canvas.
- **Motion tiers:**

| Tier | Usage | Rule |
|---|---|---|
| Base | Simple focus/hover/route polish | CSS, low overhead, no layout jank |
| Signature (after usability gate) | Apex reveal, featured card tilt, tasteful depth | Deferred until core flows pass tests; desktop capability gated |
| Atmosphere (post-beta candidate) | Embers/sakura/colors | Not required for MVP; lazy, optional, off for reduced motion and low-power profiles |

  Countdowns update once per second **locally** for exact trusted timestamps, not by API polling. Never animate core content into being invisible for several seconds. Avoid motion that mimics urgent warnings when none exists.
- **Components to build first:** `AppHeader`, `ApexSpotlight`, `EventCountdown`, `ReleasePrecisionLabel`, `WeekDaySelector`, `RadarRow`, `HorizonCard`, `EventSourceLink`, `FollowButton`, `ReleaseChangeBadge`, `StaleDataNotice`, `EmptyState`, `SkeletonCard`.

## 8. Phases and exit gates
Weeks are planning targets, not commitments; provider permission or licensing work can delay delivery. A blocked data license means live ingestion cannot ship; mock-only prototype work continues in parallel.

### Phase 0 — Product and feasibility (week 1)
- [ ] Approve product principles, first-audience definition and feature boundaries.
- [ ] Check product name, domain, brand conflicts and brand assets.
- [ ] Evaluate providers' current licenses, competing-product restrictions, rate limits, caching and commercial usage rights.
- [ ] Establish permission for images, trailer embeds and source attribution.
- [ ] Finalize editorial seed strategy if API access is incomplete.
- [ ] Sign off on the release-event data model and success criteria.

**Exit:** a viable, lawful path to sufficient content is documented; unresolved sources are not described as ready.

### Phase 1 — Functional UX prototype (weeks 2–3)
- [ ] Responsive wireframes: Home, Radar, Horizon, title detail/premiere, My Universe.
- [ ] Design tokens, card system, skeletons, empty/error/stale states.
- [ ] Functional mock-data flows for timezones, follows, countdown, TBA, delay, using visibly labeled mock data.
- [ ] Accessibility, keyboard-only, touch and reduced-motion variants.
- [ ] Global search, obvious navigation and one-click follow on cards.
- [ ] Unassisted tests with at least 5 anime fans; log errors and friction, then revise.

**Exit:** complete responsive prototype with truthful mock examples and validated navigation.

### Phase 2 — Core data and useful product (weeks 4–5)
- [ ] Typed domain entities and a seed file whose invariants are tested.
- [ ] Hand-curated events with source evidence; a provider adapter only if NW-001 approves one.
- [ ] Freshness timestamps, change history and correctness tests over the seed.
- [ ] Radar with local-time day grouping and status labels.
- [ ] Horizon with date precision and filters.
- [ ] Follow/unfollow via localStorage, personal feed.
- [ ] SEO-friendly route rendering with minimal client-side JS.

**Exit:** complete core product operating against approved data or openly labeled editorial seed data.

### Phase 3 — Usability gate and essential premiere experience (week 6)
- [ ] Fix the highest-impact issues from unassisted tests; re-test before cosmetic upgrades.
- [ ] Apex artwork and editorial feature selection, initially a lightweight static layout.
- [ ] Accessible countdowns based on exact verified timestamps.
- [ ] Event detail page with sources, status and official trailer when permitted.
- [ ] Premiere page states, postponement handling, credible share previews.
- [ ] Only basic, non-blocking motion.

**Exit:** release pages are accurate before, at and after a countdown reaches zero.

### Phase 4 — Quality and private alpha (week 7)
- [ ] Timezone, DST, date precision and region cases covered.
- [ ] Keyboard, screen reader, contrast, touch and reduced motion tested.
- [ ] Performance and security review; failure recovery verified.
- [ ] Content rights, SEO, privacy copy and attribution checked.
- [ ] Analytics and observability configured with privacy safeguards.

**Exit:** no critical unresolved correctness, safety, security or accessibility defects.

### Phase 5 — Public beta and iteration (week 8)
- [ ] Recruit 10–20 target users for structured alpha tasks.
- [ ] Measure first-session follow rate, return intent, release-find speed and confusion about broadcast vs streaming.
- [ ] Fix top task blockers; stage deployment and rollback.
- [ ] Open public beta with feedback and correction reporting.

**Exit:** users can repeatedly answer the core questions with trustworthy release information.

### Phase 6 — Post-beta, gated by evidence
- [ ] First-party Pulse (unique follows, velocity, minimum sample thresholds).
- [ ] Optional accounts and cross-device follow sync.
- [ ] Opt-in reminders with timezone and channel settings.
- [ ] Verified platform/region-specific streaming availability.
- [ ] Expanded editorial coverage and automation.
- [ ] Optional signature motion and atmosphere.

**Gate:** enough real users, data quality, moderation capacity and reliable infrastructure. Do not delay first launch for these.

## 9. Tickets
All NOT STARTED. **Start with NW-001, plus mock-only prototyping in parallel.** Do not begin live API integration until rights are cleared.

| Ticket | Priority | Task | Requires | Acceptance |
|---|---|---|---|---|
| NW-001 | P0 | Data-provider approval and rights register | None | Evidence for permission and fallback path |
| NW-002 | P0 | Anime + release event typed contracts and fixtures | None | Tests for exact, season, TBA and region-specific events |
| NW-003 | P0 | Responsive minimal nav, search and homepage shell | None | Unassisted fan can locate core features on mobile/keyboard |
| NW-004 | P0 | Local timezone Radar | NW-002, NW-003 | Week grouping/time tests pass |
| NW-005 | P0 | Local follow flow (localStorage) | NW-002, NW-003 | Follows survive reload/offline; corrupt storage handled |
| NW-005A | P0 | One-click follow UX across cards | NW-003, NW-005 | No account, immediate clear feedback, no extra navigation |
| NW-005B | P0 | Unassisted UX test and iteration | NW-003, NW-004, NW-005A, NW-007 | >=5 fan tests with tracked task success, friction fixes documented |
| NW-006 | P0 | Hand-curated seed data with evidence; provider adapter only if approved | NW-001, NW-002 | Every event traceable to a source; stale state visible |
| NW-007 | P0 | Horizon precision-aware discovery | NW-002, NW-003, data fixtures | No false countdowns; filters work |
| NW-008 | P1 | Lightweight Apex marquee and event countdown | NW-002, NW-003 | Accurate, clear, useful without visual effects |
| NW-009 | P1 | Premiere detail and change history | NW-002, NW-006 | Dates and source evidence visible |
| NW-010 | P0 | Full QA and privacy/performance review | NW-004..009 | Release checklist green |
| NW-011 | P0 | Private alpha and public beta preparation | NW-010 | User-flow results and rollback plan |
| NW-012 | P2 | Hype measurement feasibility | Public beta + privacy review | Real counts, thresholds and transparent methodology |
| NW-013 | P2 | Optional synced accounts | Real demand | Secure migration and account controls |
| NW-014 | P2 | Followed-event notifications | NW-013 or local permission approach | Consent, delivery reliability, timezone and opt-out |
| NW-015 | P2 | Optional 3D tilt, parallax and cinematic effects | NW-005B, public beta, performance review | Usability maintained; reduced-motion and low-power fallback |

### Priorities
- **P0 (non-negotiable):** accurate dates and states; source authorization; fast usable Radar; transparent broadcast vs stream distinction; correct local time; mobile accessibility; follow persistence; error recovery.
- **P1 (signature):** clear, attractive static Apex; understandable premiere pages; Horizon filters; simple interactions; good image handling; useful SEO pages.
- **P2 (growth/polish):** Pulse, accounts, notifications, recommendations, regional distribution integration, 3D effects, particles and advanced atmosphere.

**Scope-change rule:** every new feature must answer (a) which core user job it improves, (b) which metric could validate it, (c) what schedule/rights/performance cost it introduces, (d) what is removed or deferred to make room. Otherwise backlog it.

## 10. Risks
| Risk | Response | Stop/go criterion |
|---|---|---|
| Provider license disallows competing trackers | Obtain written permission or replace provider | No production ingestion until approved |
| Public API discontinued or changes | Adapter abstraction, monitored ingestion, editorial fallback | Core pages remain usable with approved data |
| Japanese airing != stream availability | Model distinct events, platform + region, cautious labels | Never say `Watchable Now` from broadcast alone |
| Dates postponed, uncertain or unknown | Precision enum and sourced change history | No false countdown |
| Copyrighted artwork/trailer usage | Authorized asset inventory, attribution, embed checks | Remove unsupported assets |
| Small community yields fake-looking hype | Editorial curation with explicit labeling until sample adequate | No fabricated metric |
| Animations compromise speed | Feature budgets, lazy enhancement, reduced-motion mode | Core information appears before effects |
| Privacy/abuse with future Pulse | Aggregation, opt-in where needed, bot controls, retention rules | Defer launch until reviewed |

## 11. Release checklist
All unverified until executed.

**Time and data accuracy**
- [ ] 7-day Radar shows the correct viewer-local weekday for UTC and JST events.
- [ ] DST boundaries do not duplicate or omit an event; midnight, month, year and leap-day rollovers work.
- [ ] Mixed precise and partial windows are labeled correctly; `TBA`/`SEASON`/`YEAR` never show timers.
- [ ] Japan broadcast passing does not imply regional streaming availability; platform and country qualifiers appear on every streaming claim.
- [ ] A delayed date updates the countdown and preserves source-backed change history.
- [ ] Stale cache displays freshness and does not claim real-time confirmation.
- [ ] Missing art, trailer and studio metadata degrade gracefully.

**Personalization**
- [ ] Follow/unfollow works consistently on Home, detail, Horizon and Radar.
- [ ] Follows persist across reloads and temporary offline usage.
- [ ] A corrupt or unknown stored follow value is ignored without breaking the page.
- [ ] Clearing browser storage is described honestly; no cloud-sync promises.

**Design and accessibility**
- [ ] Five or more unassisted fan sessions completed and documented (section 4).
- [ ] Main destinations and title search are obvious on a 360px-class screen.
- [ ] Semantic markup, keyboard focus and screen reader labels tested; hover effects have touch/keyboard equivalents.
- [ ] Reduced motion removes parallax and atmosphere but preserves function; no JS/fallback behavior reviewed.
- [ ] Adequate text contrast on every art and gradient variant.
- [ ] No unmuted autoplay; trailers respect explicit user intent.
- [ ] Narrow viewport, zoom/text enlargement and landscape work; loading causes no significant layout shift.
- [ ] Empty, loading and error states are accessible and useful.

**Data, assets and privacy**
- [ ] Every production provider has a current approved usage record.
- [ ] Every image and trailer use is authorized and attributed where required.
- [ ] No third-party data is cached, stored or redistributed outside its conditions.
- [ ] Sources and last-updated timestamps are visible where time-sensitive.
- [ ] No secrets in client bundles, logs, commits or repo history.
- [ ] Tracking, retention, consent and privacy information are accurate; a content correction channel exists.
- [ ] Abuse/rate limits exist for public write or community endpoints.

**Engineering and operations**
- [ ] CI passes: install -> typecheck -> lint -> unit/integration tests -> build -> essential Playwright paths.
- [ ] Core Web Vitals targets checked on representative devices.
- [ ] Robots, sitemap, canonical metadata, OG images and event URLs validated.
- [ ] Oldest `lastVerifiedAt` is visible, so a stale schedule is noticed.
- [ ] Dependency and secret scans completed.
- [ ] If ingestion, a database or an admin UI exist: job health alerts configured, migrations reviewed with rollback, privileges secured.
- [ ] Staging validated for real timezone, attribution, caching and browser fallbacks.
- [ ] Production smoke test after deploy: Home -> Radar -> Horizon -> Follow -> Premiere.
- [ ] Rollback plan ready, including disabling a suspect source or feature by configuration.
- [ ] Known issues and limitations documented.

## 12. Decisions
Proposed and pending project-owner approval, except DEC-008.

| ID | Decision | Tradeoff |
|---|---|---|
| DEC-001 | Release-event-first domain: broadcasts, streaming debuts, theatrical openings, trailers and announcements are explicit events on a series | More domain complexity than a catalog card |
| DEC-002 | One Next.js app; revised by DEC-008 | Shared codebase and deployment until scaling warrants separation |
| DEC-003 | Source authorization gate: no live integration or production media until terms and permissions fit | Source decisions still unresolved |
| DEC-004 | Anonymous local follows; optional sync post-beta; storage revised by DEC-008 | Local data can be lost; explain it |
| DEC-005 | Pulse follows traction: editorial curation in MVP | No community ranking at launch |
| DEC-006 | Visual enhancement budget: accurate content first, selective art and motion with reduced-motion fallback | — |
| DEC-007 | UX-first (2026-11-16): usable Radar, Horizon, search, one-click follow and lightweight Apex before signature motion; five unassisted tests first | First beta has less spectacle |
| DEC-008 | Simplest architecture first (2026-11-16, approved by project owner): static pages from a typed seed file in the repo, follows as IDs in localStorage. Replaces the earlier proposal of PostgreSQL, `/api/v1`, scheduled ingestion, IndexedDB and export/import, each now deferred behind a trigger in section 6 | Data is hand-curated; no offline event cache; follows cannot be exported yet |

### Open questions
- Which data provider(s) authorize this use and supply sufficient release coverage? What minimum data can be consistently and legally acquired to support weekly use?
- Which official artwork sources and trailer embeds can be hosted, proxied or embedded legally?
- Which static host fits budget and traffic?
- How should domestic broadcast vs worldwide streaming appear in the first release?
- What editorial verification capacity exists for curated seed data?
- Primary launch markets and translations? Default: English and viewer-local time.
- Are all movie premieres tracked globally, or Japan-first with transparent territory labels?
- What brand/domain options are actually available?
- `EventStatus` now uses the full section 3 vocabulary. The earlier architecture type lacked `BROADCAST_AIRING`, `STREAMING_CONFIRMED` and `STREAMING_AVAILABLE`; confirm before NW-002.

These must be resolved before claiming global completeness.
