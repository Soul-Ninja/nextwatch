# Nextwatch — Data Sources, Provenance and Asset Policy

**Status:** REQUIRED PRE-IMPLEMENTATION RESEARCH. No provider is automatically approved by inclusion below.

## 1. Non-negotiable source gate
Before importing or redistributing third-party data, record **current** terms, authorization for this particular product, commercial-use rules, attribution, caching/storage restrictions, rate limits, redistribution, asset rights, and contact/approval evidence. Free-to-query does **not** mean free-to-republish or commercially reuse. A third-party API's uptime does not imply perpetual availability.

### Provider evaluation register
Terms read 2026-11-17 from the providers' own pages. Not legal advice; nothing below is an approval.

| Candidate | Intended use | What the current terms say | Status |
|---|---|---|---|
| AniList GraphQL | Exact Japan airing times (`airingSchedule`), seasons, titles, `idMal` link | Free for non-commercial use; commercial use free under $150/month revenue, a licence above that. **Prohibits** "competing, non-complementary services of the same nature" (names list/tracker services, applies to media data too), using the API "as a backup or data storage service", and "hoarding or mass collection". Rate limit 90/min, **currently degraded to 30/min**, plus a burst limiter; a 429 means a 1-minute timeout with `Retry-After`; limit raises not accepted now. ([terms](https://docs.anilist.co/guide/terms-of-use), [rate limits](https://docs.anilist.co/guide/rate-limiting)) | **PENDING: owner emailed AniList (2026-11-17); not used until they reply** |
| MyAnimeList API v2 | Cross-check broadcast day/time and dates | Agreement last modified 2019-08-08. Must notify MAL before release (and before adding ads); MAL may review and disapprove. Subscriptions, paid tiers or donation quotas need written authorisation; non-disruptive ads are tolerated in non-commercial apps. **No combining the API with services not authorised in writing**, no derivative works of MAL content, no imitating MAL. No server-side storage of MAL user data; remove content within 24 hours on request. Client ID must stay secret. No rate limit published; MAL may limit at will. Images not addressed: treat as not permitted. ([agreement](https://myanimelist.net/static/apiagreement.html)) | **APPROVED WITH LIMITS by the project owner (2026-11-18).** Notice sent to MAL support 2026-11-17 (section 4(b)); MAL support replied 2026-11-18 that it cannot give individual permission but "please feel free to use it within the guidelines", and that excessive requests may lead to restricted access. Limits: weekly broadcast slot and dates only, used as a cross-check and labelled "Expected"; no MAL images; at most a few requests per refresh; Client ID kept server-side in `MAL_CLIENT_ID`; notify MAL before adding ads. Updates: [MAL API Club](https://myanimelist.net/clubs.php?cid=13727), [apiconfig](https://myanimelist.net/apiconfig). |
| Jikan | MAL-derived data/trailers | Not reviewed; unofficial scraper of MAL, so it inherits MAL's terms problem. | **Do not use** |
| Kitsu | Supplemental identity/metadata | Terms page is behind a Cloudflare check and could not be read; docs found publish no rate limit, key requirement or airing-time data. | **Unapproved: terms unread** |
| TMDB | Anime films' per-country release dates; possibly streaming availability | Free licence is **non-commercial only**; ads count as commercial and need a paid agreement (price not published). Cache at most 6 months; purge on termination. Attribution required with an approved logo and "uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB". Rate limit about 40 requests per **second**, may change; respect 429. Watch-provider (JustWatch) rules not covered by these pages. ([terms](https://www.themoviedb.org/api-terms-of-use), [rate limits](https://developer.themoviedb.org/docs/rate-limiting)) | **APPROVED WITH LIMITS by the project owner (2026-11-17): non-commercial use only, with TMDB attribution; adding ads first requires a TMDB commercial agreement** |
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
