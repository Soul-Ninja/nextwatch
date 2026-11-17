# Nextwatch
**The Anime Anticipation & Live Release Radar**

> **Planning-stage repository — no app implementation is included.**

Nextwatch is an event-driven anime discovery and upcoming-release experience: **Apex** (flagship premiere), **Radar** (daily local-time airing schedule), **Horizon** (future releases), **My Universe** (personal follows) and **Pulse** (post-MVP community anticipation).

## Documents
1. [`AGENTS.md`](AGENTS.md) — how to work: hard rules, time and release-state rules, checks, sign-off boundaries.
2. [`PROJECT_PLAN.md`](PROJECT_PLAN.md) — what to build: requirements, acceptance tests, domain model, architecture, design, phases, tickets, release checklist, decisions.
3. [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) — provider evaluation, provenance and copyright gate.

## Current status
- API/data permissions: **not yet approved**.
- Data model, validator and fictional fixtures: in `lib/` (NW-002). Run `npm install`, then `npm test` and `npm run typecheck`.
- Radar (this week in your local time) on `/`, using fictional data. Run `npm run dev` and open http://localhost:3000.
- One-click follows (saved in this browser) and My Universe at `/my-universe`.
- Horizon at `/horizon`: upcoming titles by season, filterable by format.
- Featured premiere (Apex) with countdown on `/`, title pages at `/anime/[slug]`, and title search at `/search`.
- Database, live data, deployment: **not yet implemented**.
- First milestone: **NW-001** (data rights and coverage), in parallel with mock-only prototype work.
