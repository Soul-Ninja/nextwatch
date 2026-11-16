export type Season = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

// Each precision carries only the fields it can honestly have, so a vague window can never hold a fabricated instant.
export type ReleaseWindow =
  | { precision: 'EXACT'; instantUtc: string; timezone?: string } // timezone: IANA zone the source stated the time in
  | { precision: 'DAY'; localDate: string; timezone?: string }
  | { precision: 'MONTH'; year: number; month: number }
  | { precision: 'SEASON'; year: number; season: Season }
  | { precision: 'YEAR'; year: number }
  | { precision: 'TBA' };

export type DatePrecision = ReleaseWindow['precision'];

export type EventKind =
  | 'TV_BROADCAST' | 'STREAMING_RELEASE' | 'THEATRICAL_RELEASE'
  | 'TRAILER' | 'ANNOUNCEMENT';

export type EventStatus =
  | 'ANNOUNCED' | 'IN_PRODUCTION' | 'SCHEDULED' | 'DELAYED'
  | 'BROADCAST_AIRING' | 'BROADCAST_AIRED'
  | 'STREAMING_CONFIRMED' | 'STREAMING_AVAILABLE'
  | 'RELEASED' | 'UNKNOWN';

export interface Anime {
  id: string;
  slug: string;
  titles: Record<string, string>; // language tag -> title, e.g. { en: '...', ja: '...' }
  format?: 'TV' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL';
  studios?: string[];
  genres?: string[];
  relations?: Array<{ animeId: string; type: 'SEQUEL' | 'PREQUEL' | 'ADAPTATION' | 'OTHER' }>;
}

export interface ReleaseEvent {
  id: string;
  animeId: string;
  kind: EventKind;
  episode?: number;
  window: ReleaseWindow;
  status: EventStatus;
  region?: string; // ISO 3166-1 alpha-2; absent means unknown, never worldwide
  platform?: string;
  language?: string;
  evidenceIds: string[];
  lastVerifiedAt?: string;
  updatedAt: string;
  history?: Array<{ changedAt: string; previous: ReleaseWindow; evidenceId: string }>;
}

export interface SourceEvidence {
  id: string;
  sourceName: string;
  url: string;
  claim: string;
  observedAt: string;
  confidence: 'OFFICIAL' | 'SECONDARY' | 'UNVERIFIED';
  rightsStatus: 'APPROVED' | 'PENDING' | 'RESTRICTED';
}

export interface Seed {
  fictional: boolean; // true -> every page using this data must say so prominently
  anime: Anime[];
  events: ReleaseEvent[];
  evidence: SourceEvidence[];
}
