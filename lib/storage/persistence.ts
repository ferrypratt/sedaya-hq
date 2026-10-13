'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Universal safe localStorage helper for client components.
 */
export function getLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    const stringified = JSON.stringify(value);
    window.localStorage.setItem(key, stringified);
    // Dispatch custom event to notify all components in the current tab
    window.dispatchEvent(
      new CustomEvent('sedaya_storage_update', {
        detail: { key, raw: stringified },
      })
    );
  } catch {
    // Storage quota exceeded or disabled
  }
}

// Memory cache to preserve reference equality across getSnapshot calls
const cache: Record<string, { raw: string; parsed: unknown }> = {};

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('sedaya_storage_update', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('sedaya_storage_update', callback);
  };
}

/**
 * React hook for real-time persistent state backed by localStorage
 * with automatic sync across pages and tabs via useSyncExternalStore.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, (valOrUpdater: T | ((prev: T) => T)) => void, boolean] {
  const getSnapshot = (): T => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initialValue;
      if (cache[key] && cache[key].raw === raw) {
        return cache[key].parsed as T;
      }
      const parsed = JSON.parse(raw) as T;
      cache[key] = { raw, parsed };
      return parsed;
    } catch {
      return initialValue;
    }
  };

  const getServerSnapshot = (): T => initialValue;

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setPersistentState = useCallback(
    (valOrUpdater: T | ((prev: T) => T)) => {
      const current = getSnapshot();
      const nextValue =
        typeof valOrUpdater === 'function'
          ? (valOrUpdater as (prev: T) => T)(current)
          : valOrUpdater;
      setLocalStorage(key, nextValue);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return [state, setPersistentState, true];
}

/**
 * Storage keys used throughout Sedaya HQ
 */
export const STORAGE_KEYS = {
  ACTIVITIES: 'sedaya_activities',
  CONTENT_ITEMS: 'sedaya_content_items',
  HOUSING_SNAPSHOTS: 'sedaya_unit_snapshots',
  KOS_SNAPSHOTS: 'sedaya_kos_snapshots',
  MARKETING_PLANS: 'sedaya_marketing_plans',
  EVALUATIONS: 'sedaya_evaluations',
  OFFLINE_EVENTS: 'sedaya_offline_events',
  SALES_SUPPORT: 'sedaya_sales_support',
  SOSIALISASI: 'sedaya_sosialisasi',
  MARKETING_PROPS: 'sedaya_marketing_props',
} as const;

/**
 * Asynchronous background sync to Supabase when connected.
 * Fails silently so offline or demo mode operates uninterrupted.
 */
export async function syncActivityToCloud(activity: Record<string, unknown>): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('daily_activities').upsert(activity, { onConflict: 'id' });
  } catch {
    // Silently continue with local storage
  }
}
