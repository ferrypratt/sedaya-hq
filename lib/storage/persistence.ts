'use client';

import { useCallback, useSyncExternalStore, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Universal UUID generator compatible with Postgres UUID primary keys.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'local';

let globalSyncStatus: SyncStatus = 'synced';
let lastSyncTimestamp: number = Date.now();

export function notifySyncStatus(status: SyncStatus) {
  globalSyncStatus = status;
  if (status === 'synced') {
    lastSyncTimestamp = Date.now();
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sedaya_sync_status_change', {
        detail: { status, timestamp: lastSyncTimestamp },
      })
    );
  }
}

export function useSyncStatus(): { status: SyncStatus; lastSynced: number } {
  const subscribeSync = (callback: () => void) => {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener('sedaya_sync_status_change', callback);
    return () => window.removeEventListener('sedaya_sync_status_change', callback);
  };

  const getSnapshot = () => `${globalSyncStatus}:${lastSyncTimestamp}`;
  const getServerSnapshot = () => 'synced:0';

  const raw = useSyncExternalStore(subscribeSync, getSnapshot, getServerSnapshot);
  const [status, timeStr] = raw.split(':');

  return {
    status: (status || 'synced') as SyncStatus,
    lastSynced: Number(timeStr) || lastSyncTimestamp,
  };
}

/**
 * React hook for real-time persistent state backed by localStorage
 * and synchronized with Vercel Cloud Server & Supabase Database.
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

  // Background Cloud Sync on mount: fetch latest records from server/database
  useEffect(() => {
    let isCancelled = false;

    async function syncFromCloud() {
      try {
        const res = await fetch(`/api/sync?module=${encodeURIComponent(key)}`);
        if (!res.ok) return;
        const json = await res.json();
        if (!isCancelled && json.success && json.data) {
          const cloudData = json.data;
          // If cloud data is non-empty, update local store so all devices stay in sync
          const hasContent =
            Array.isArray(cloudData)
              ? cloudData.length > 0
              : typeof cloudData === 'object' && Object.keys(cloudData).length > 0;

          if (hasContent) {
            setLocalStorage(key, cloudData);
          }
          notifySyncStatus('synced');
        }
      } catch {
        // Silently continue with local storage
      }
    }

    syncFromCloud();

    return () => {
      isCancelled = true;
    };
  }, [key]);

  const setPersistentState = useCallback(
    (valOrUpdater: T | ((prev: T) => T)) => {
      const current = getSnapshot();
      const nextValue =
        typeof valOrUpdater === 'function'
          ? (valOrUpdater as (prev: T) => T)(current)
          : valOrUpdater;

      // 1. Instant local persistence (0ms latency)
      setLocalStorage(key, nextValue);

      // 2. Asynchronous push to cloud server & Supabase database
      notifySyncStatus('syncing');
      try {
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module: key,
            items: Array.isArray(nextValue) ? nextValue : undefined,
            item: !Array.isArray(nextValue) ? nextValue : undefined,
          }),
        })
          .then((res) => {
            if (res.ok) {
              notifySyncStatus('synced');
            } else {
              notifySyncStatus('local');
            }
          })
          .catch(() => {
            notifySyncStatus('offline');
          });
      } catch {
        notifySyncStatus('offline');
      }
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
 * Asynchronous background sync directly to Supabase when connected.
 */
export async function syncActivityToCloud(activity: Record<string, unknown>): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const supabase = createClient();
    const copy = { ...activity };
    delete copy.pic;
    delete copy.project;
    await supabase.from('daily_activities').upsert(copy, { onConflict: 'id' });
  } catch {
    // Silently continue
  }
}

/**
 * Permanently delete a record from cloud server and database.
 */
export async function deleteFromCloud(moduleKey: string, id: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch(
      `/api/sync?module=${encodeURIComponent(moduleKey)}&id=${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );
    return res.ok;
  } catch {
    return false;
  }
}

