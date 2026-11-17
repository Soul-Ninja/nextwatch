'use client';

import { useFollows } from './useFollows';

export function FollowButton({ animeId, title }: { animeId: string; title: string }) {
  const { ids, ready, toggle } = useFollows();
  const following = ids.includes(animeId);
  return (
    <button type="button" className="follow" aria-pressed={following} disabled={!ready} onClick={() => toggle(animeId)}>
      {following ? 'Following' : 'Follow'}
      <span className="sr-only"> {title}</span>
    </button>
  );
}
