'use client';

import { useSyncExternalStore } from 'react';
import { Heart } from 'lucide-react';

const STORAGE_KEY = 'wypozycz:favorites';
const EVENT = 'wypozycz:favorites-changed';
let cachedValue;
let cachedIds = new Set();

function getFavorites() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value !== cachedValue) {
      const ids = JSON.parse(value || '[]');
      cachedIds = new Set(Array.isArray(ids) ? ids : []);
      cachedValue = value;
    }
  } catch {
    // Keep the current session usable if browser storage is unavailable.
  }
  return cachedIds;
}

function subscribe(listener) {
  window.addEventListener(EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}

export function useFavorites() {
  return useSyncExternalStore(subscribe, getFavorites, () => null);
}

export default function FavoriteButton({ id, className = '' }) {
  const saved = useFavorites()?.has(id) ?? false;

  function toggle() {
    const next = new Set(getFavorites());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    const value = JSON.stringify([...next]);
    try {
      localStorage.setItem(STORAGE_KEY, value);
      cachedValue = value;
    } catch {
      // The in-memory list still works until the page is closed.
    }
    cachedIds = next;
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <button type="button" aria-label="Ulubione" aria-pressed={saved} title={saved ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'} onClick={toggle} className={`grid size-11 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white text-market-navy shadow-sm hover:bg-amber-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 ${className}`}>
      <Heart size={19} fill={saved ? 'currentColor' : 'none'} className={saved ? 'text-brand-600 dark:text-market-yellow' : ''} aria-hidden="true" />
    </button>
  );
}
