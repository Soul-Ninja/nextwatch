'use client';

import { useSyncExternalStore } from 'react';
import { FOLLOWS_KEY, FOLLOW_TITLES_KEY, parseFollows, parseFollowTitles, toggleFollow, type FollowTitles } from '../lib/follows';

interface FollowState {
  ids: string[];
  titles: FollowTitles;
  ready: boolean; // false on the server and during hydration, when the browser's list is not known yet
}

const SERVER_STATE: FollowState = { ids: [], titles: {}, ready: false };
let state: FollowState | null = null;
const listeners = new Set<() => void>();

function read(): FollowState {
  try {
    return { ids: parseFollows(localStorage.getItem(FOLLOWS_KEY)), titles: parseFollowTitles(localStorage.getItem(FOLLOW_TITLES_KEY)), ready: true };
  } catch {
    return { ids: [], titles: {}, ready: true }; // storage blocked (e.g. some private modes)
  }
}

function publish(next: FollowState) {
  state = next;
  listeners.forEach((listener) => listener());
}

// Another tab changed the list: adopt it so our next write does not overwrite theirs.
function onStorage(event: StorageEvent) {
  if (event.key === FOLLOWS_KEY || event.key === FOLLOW_TITLES_KEY || event.key === null) publish(read());
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener('storage', onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', onStorage);
  };
}

const getSnapshot = () => (state ??= read());
const getServerSnapshot = () => SERVER_STATE;

function toggle(animeId: string, label?: { title: string; slug: string }) {
  const ids = toggleFollow(getSnapshot().ids, animeId);
  const titles = Object.fromEntries(Object.entries({ ...getSnapshot().titles, ...(label ? { [animeId]: label } : {}) }).filter(([id]) => ids.includes(id)));
  try {
    localStorage.setItem(FOLLOWS_KEY, JSON.stringify(ids));
    localStorage.setItem(FOLLOW_TITLES_KEY, JSON.stringify(titles));
  } catch {
    // Storage unavailable: the follow still works for this session.
  }
  publish({ ids, titles, ready: true });
}

/** One shared follow list for every component, kept in this browser's localStorage. */
export function useFollows() {
  return { ...useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot), toggle };
}
