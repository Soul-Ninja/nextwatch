# Nextwatch — Data Sources, Provenance and Asset Policy

**Status:** REQUIRED PRE-IMPLEMENTATION RESEARCH. No provider is automatically approved by inclusion below.

## 1. Non-negotiable source gate
Before importing or redistributing third-party data, record **current** terms, authorization for this particular product, commercial-use rules, attribution, caching/storage restrictions, rate limits, redistribution, asset rights, and contact/approval evidence. Free-to-query does **not** mean free-to-republish or commercially reuse. A third-party API's uptime does not imply perpetual availability.

### Provider evaluation register
| Candidate | Intended use | Potential issues requiring verification | Status |
|---|---|---|---|
| AniList GraphQL | Anime metadata, future airing schedule | Competing-service restrictions, caching, rate limits, commercial use | **Unapproved; verify directly** |
| MyAnimeList official API | Metadata and catalog | API approval, permitted uses, content rights, completeness of schedule | **Unapproved; verify directly** |
| Jikan | MAL-derived data/trailers | Public service availability/changes, upstream rights, derivative usage | **Do not assume available** |
| Kitsu | Supplemental identity/metadata | Current API terms, coverage, uptime, licenses | **Unapproved; verify directly** |
| TMDB | Film/series details or artwork | Attribution, commercial rights, content matching, asset use restrictions | **Unapproved; verify directly** |
| Official studio/distributor websites | Event announcements, official trailers | Rights to copy/host metadata, images and videos; automation rules | **Case-by-case verification** |
| Editorial curated entries | Early seed catalog and corrections | Human verification, original source attribution, accuracy and upkeep | **Permitted only with lawful source material** |

This list is a research queue, **not** permission to connect or scrape these services. Re-check provider terms at integration and periodically afterward.

## 2. Approval record template
```md
## Provider: ...
- URL and API owner:
- Intended use / product context:
- Terms URL and date checked:
- Commercial use permitted? Evidence:
- Competing app restriction? Evidence:
- Allowed fields / redistribution / caching TTL:
- Image and trailer ownership / embedding rights:
- Rate limiting / auth requirements:
- Outage and retirement policy:
- Attribution wording:
- Reviewer / approver / date:
- Decision: APPROVED | APPROVED WITH LIMITS | PENDING | REJECTED
```

## 3. Fact hierarchy and provenance
Store source links and verification times per claim. Prefer official studio, production committee, distributor or platform announcements for exact releases; flag secondary database entries as secondary evidence. Editorial correction is a documented override, not a silent truth rewrite. Maintain old/new changes and their sources, particularly postponements and changes in precision.

## 4. Date-precision and distribution policy
- **EXACT:** a confirmed timestamp and timezone; countdown to this event only.
- **DAY:** confirmed calendar day without dependable time; show date only.
- **MONTH:** show month/year.
- **SEASON:** show winter/spring/summer/fall + year; anime season convention may need explicit definition.
- **YEAR:** show year only.
- **TBA:** show `Release date unannounced`.
- TV broadcasts, international streaming, local cinema releases, sub/dub releases and trailer events must not share a fake global `releaseAt`.
- `Broadcast aired in Japan` does not mean `available to stream in India` or any other region.
- A changed/retracted date invalidates previous countdown and generates an audit record.

## 5. Images, trailers, typography
- Maintain an inventory of assets: source, creator/owner, license or authorization, attribution, format and expiry/limits.
- Prefer authorized official poster/key art URLs or licensed assets; do not assume any API image can be downloaded, rehosted, transformed or redistributed.
- Embed official trailer videos where the host and owner permit embedding; use platform controls; respect privacy and autoplay policies.
- Use original, commissioned or properly licensed art for general branding and atmospheric backgrounds.
- Never ship artist images scraped from search results as production assets without permissions.
- Do not distribute proprietary fonts without license.

## 6. Ingestion quality and corrections
Every ingestion batch logs source status, fetch timestamp, normalization version, rejected rows, changed records and current freshness. Keep low-confidence/ambiguous matches out of public definitive claims. Provide a user-facing correction/report link; document manual fixes with verification evidence.

## 7. Immediate feasibility checkpoint
The app is **not ready for live-source implementation** until at least one adequate source or curated publishing workflow has approved rights to supply a useful catalog and release-event information. Mock fixtures are safe for development when clearly identified as fictional examples; they are not license substitutes at public launch.
