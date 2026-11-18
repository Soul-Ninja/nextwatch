# Nextwatch — Agent Instructions

These instructions apply to AI coding agents and human contributors working in this repository. Three documents carry the rules: this file (how to work), `PROJECT_PLAN.md` (what to build) and `docs/DATA_SOURCES.md` (which data and assets may be used).

## Before making changes
1. Read `PROJECT_PLAN.md`, and `docs/DATA_SOURCES.md` for anything touching data or media.
2. Inspect files, git status and existing tests. Documentation is not evidence that code exists.
3. State the selected phase/ticket, dependencies, risks and intended checks.
4. Do the smallest useful vertical slice; avoid unrelated features and refactors.
5. If a core dependency is unapproved, build against local typed fixtures, not a production integration.

## Product identity
**Highest-priority directive:** build useful, understandable features before sophisticated visual presentation. No 3D hover, Canvas particles, cinematic page transitions or large motion dependency until key journeys are implemented and verified with real users. Simplicity does not mean deleting planned capabilities; make the existing capabilities easier to reach.

- Nextwatch is **not** a MAL/AniList clone or a reviews-and-forums product.
- Its center is **anticipating a release event**, backed by credible information.
- Five product systems: Apex, Radar, Horizon, My Universe and post-MVP Pulse.
- Cinema is part of the brand; information clarity, mobile speed and accessibility are foundational.

## Hard rules
- Never treat a polished mockup, animation, or demo-only interaction as a finished feature.
- Core tasks must work without signup, hover, animation, desktop-only controls or explanatory walkthroughs.
- Prefer one-click follow, obvious mobile navigation, plain-language release labels and progressive disclosure over decorative complexity.
- Use testable user outcomes and explicit UX evidence as a review gate for core flow changes.
- Never bypass API usage restrictions, licensing, rights, robots/ToS controls or commercial use requirements. No scraping of restricted websites.
- Never presume that a Japan broadcast timestamp indicates worldwide streaming access.
- Never fabricate an exact date for year/season/TBA-only metadata.
- Never invent counts of people waiting, current viewers, legal streaming platforms or release status.
- Do not ship misleading mock data on production pages without prominent labeling.
- Do not silently overwrite changes to release dates: log old/new values and provenance.
- Do not install unnecessary dependencies, create microservices or make major architecture changes without review.
- Protect secrets, user data, browser storage and source credentials.

## Function-first gate
- No visual-only work (parallax, particles, 3D tilt, elaborate transitions) starts until Radar, Horizon, one-click follow, essential Apex and navigation work and have passed at least five unassisted fan tests (prompts in `PROJECT_PLAN.md`).
- If a test user fails a task, fix the interaction before any animation or decoration.
- Never mark a task complete on appearance alone.

## Time and release-state rules
- Store exact instants as UTC; display with `Intl.DateTimeFormat` and IANA zone IDs. Never add a fixed number of hours from JST.
- Store imprecise windows separately (`EXACT`, `DAY`, `MONTH`, `SEASON`, `YEAR`, `TBA`). Date-only and seasonal windows are not UTC instants.
- A Japan TV broadcast, India streaming availability, a US dubbed release and a theatrical opening are separate event/distribution facts. Missing region or platform means unknown, not worldwide.
- Group Radar by the viewer's **local calendar day** at the instant in question, not the Japanese calendar day.
- Use `Confirmed broadcast`, `Expected`, `Aired in Japan`, `Streaming availability unverified`, `Available on [platform] in [region]` only when evidence supports the wording.
- Do not mark anything `Available` because `now >= scheduledAt` alone.
- Show provenance, `lastVerifiedAt` and data age wherever users may act on time-sensitive facts.
- When a source changes a date, retain the previous date, detect the postponement and invalidate the countdown.
- If source certainty drops, degrade to a less specific date label.
- For SSR, use a safe timezone fallback until client settings are available and prevent misleading hydration flashes.

## Implementation standards
- TypeScript strict typing, input validation, clear domain boundaries, accessible semantic UI.
- Server-rendered discoverable content; cached data with honest freshness labels.
- Proper loading, empty, offline, degraded, error and reduced-motion states.
- Unit tests for data math, integration tests for adapters, e2e tests for critical journeys.
- Visual effects are progressive enhancements and should respect performance budgets.
- Order inside a slice: types and schema validation -> fixtures (exact date, TBA, delay, timezone crossing, source unavailable) -> deterministic data logic with provenance -> accessible static UI, then client behavior -> complete the task on a narrow mobile viewport and keyboard-only -> typecheck, lint, tests, build, relevant e2e -> update `PROJECT_PLAN.md` status with evidence.

## Minimum checks per change
| Change | Minimum checks |
|---|---|
| Timezone/scheduling | UTC/JST conversions, DST, +/-1 day boundaries, leap day if relevant, unknown time |
| Release event status | exact vs vague date, postponement, stale source, streaming vs broadcast |
| Provider adapter | malformed payload, rate limit, timeout, retry, duplicate, attribution |
| Local follows | reload, offline, duplicate toggles, corrupt stored value |
| Page/UI | mobile, desktop, keyboard, focus, contrast, reduced motion, loading/error/empty states |
| SEO/rendering | correct metadata, canonical links, structured data validity, no misleading SSR timestamps |
| Community feature | unique activity, minimum sample, abuse/rate limiting, privacy controls |

For each significant slice, run automated checks **and** manually verify one end-to-end user journey. A new or changed core journey also needs an unassisted test with a target fan.

## Tickets and changes
- A ticket (`NW-###`) states the user outcome, scope (includes/excludes), dependencies, acceptance criteria and tests before work starts.
- **Done** means: acceptance criteria met; mobile and accessible modes handled; tests pass; source use authorized; no misleading time/availability claims; failure behavior exists; `PROJECT_PLAN.md` updated; a reviewer validated the user-facing flow.
- Do not check off work on agent prose. Require a merged change, passing tests, a working demo and, for content integrations, source-rights evidence.
- Blocked work is recorded with blocker, owner, impact and safe fallback. Never mark it done.
- One deliverable per change; keep refactors separate from features unless inseparable. Commit messages: `feat(radar): group events by viewer-local day`.
- Never commit API keys, personal data, unauthorized media, generated caches or `.env` files.
- No force pushes or destructive database operations without explicit approval and a recovery plan.

## Requires human sign-off
Provider license interpretation or approval, any new third-party data source, commercial asset usage, spending, production secret changes, destructive database migrations, public launch, brand changes, retention/privacy decisions, and material changes to user-facing promises.

## Reporting
At the end of work, list changed files, functional behavior, tests actually run/results, source approvals relied on, anything based on mocks rather than live sources, unverified assumptions, blocked dependencies, and the next smallest task. Never imply external approvals or deployment occurred if they did not.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
