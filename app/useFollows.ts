'use client';

import { useSyncExternalStore } from 'react';
import { FOLLOWS_KEY, parseFollows, toggleFollow } from '../lib/follows';

interface FollowState {
  ids: string[];
  ready: boolean; // false on the server and during hydration, when the browser's list is not known yet
}

const SERVER_STATE: FollowState = { ids: [], ready: false };
let state: FollowState | null = null;
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    return parseFollows(localStorage.getItem(FOLLOWS_KEY));
  } catch {
    return []; // storage blocked (e.g. some private modes)
  }
}

function publish(ids: string[]) {
  state = { ids, ready: true };
  listeners.forEach((listener) => listener());
}

// Another tab changed the list: adopt it so our next write does not overwrite theirs.
function onStorage(event: StorageEvent) {
  if (event.key === FOLLOWS_KEY || event.key === null) publish(read());
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener('storage', onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', onStorage);
  };
}

const getSnapshot = () => (state ??= { ids: read(), ready: true });
const getServerSnapshot = () => SERVER_STATE;

function toggle(animeId: string) {
  const ids = toggleFollow(getSnapshot().ids, animeId);
  try {
    localStorage.setItem(FOLLOWS_KEY, JSON.stringify(ids));
  } catch {
    // Storage unavailable: the follow still works for this session.
  }
  publish(ids);
}

/** One shared follow list for every component, kept in this browser's localStorage. */
export function useFollows() {
  return { ...useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot), toggle };
}
