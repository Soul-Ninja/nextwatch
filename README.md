# Nextwatch
**The Anime Anticipation & Live Release Radar**

> **Functional prototype — live TMDB integration, with labelled fictional samples when no token is configured. Not approved for public launch.**

Nextwatch is an event-driven anime discovery and upcoming-release experience: **Apex** (flagship premiere), **Radar** (daily local-time airing schedule), **Horizon** (future releases), **My Universe** (personal follows) and **Pulse** (post-MVP community anticipation).

## Documents
1. [`AGENTS.md`](AGENTS.md) — how to work: hard rules, time and release-state rules, checks, sign-off boundaries.
2. [`PROJECT_PLAN.md`](PROJECT_PLAN.md) — what to build: requirements, acceptance tests, domain model, architecture, design, phases, tickets, release checklist, decisions.
3. [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) — provider evaluation, provenance and copyright gate.

## Current status
- Data: **TMDB** (approved for non-commercial use). Copy `.env.example` to `.env.local` and set `TMDB_TOKEN` to load live data; without it the site shows labelled fictional samples. AniList and MyAnimeList are pending permission.
- Data model, validator and fictional fixtures: in `lib/` (NW-002).
- Checks: `npm run typecheck`, `npm run lint`, `npm test` (unit), `npm run e2e` (browser tests; first run `npx playwright install chromium`). CI runs all of them on every push.
- Radar (this week in your local time) on `/`, using fictional data. Run `npm run dev` and open http://localhost:3000.
- One-click follows (saved in this browser) and My Universe at `/my-universe`.
- Horizon at `/horizon`: upcoming titles by season, filterable by format.
- Featured premiere (Apex) with countdown on `/`, title pages at `/anime/[slug]`, title search at `/search`, and an About page at `/about`.
- With `TMDB_TOKEN`, search queries TMDB TV and movies directly, including Japanese-language animation outside the upcoming feed. Release details are loaded in batches of four: upcoming dates and TBA production entries appear first, with an Upcoming filter. Future season premiere dates are read even when no next episode is listed. Pagination preserves the query/filter; partial detail failures show a warning. Search results open `/anime/tmdb-tv-ID` or `/anime/tmdb-movie-ID` on demand. A TV record and its movies remain separate titles, with a link to search matching upcoming titles instead of guessing franchise relationships.
- Follows still store IDs locally, with public title labels in a separate localStorage key so out-of-feed titles remain visible after reload. No episode facts are cached in browser storage; open the title to load its release details.
- The weekly feed is still a limited discovery selection and reads only the next episode per series. Exact airing times, full weekly coverage and date-change retention need further work. No database or deployment is included.
- First milestone: **NW-001** (data rights and coverage), in parallel with mock-only prototype work.
