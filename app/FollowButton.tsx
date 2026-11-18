'use client';

import { useFollows } from './useFollows';
import { useSeed } from './SeedProvider';

export function FollowButton({ animeId, title }: { animeId: string; title: string }) {
  const { ids, ready, toggle } = useFollows();
  const anime = useSeed().anime.find((a) => a.id === animeId);
  const following = ids.includes(animeId);
  return (
    <button type="button" className="follow" aria-pressed={following} disabled={!ready} onClick={() => toggle(animeId, anime ? { title, slug: anime.slug } : undefined)}>
      {following ? 'Following' : 'Follow'}
      <span className="sr-only"> {title}</span>
    </button>
  );
}
