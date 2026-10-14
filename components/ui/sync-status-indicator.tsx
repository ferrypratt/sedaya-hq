'use client';

import { useSyncStatus } from '@/lib/storage/persistence';
import { CloudCheck, RefreshCw, AlertCircle, Cloud } from 'lucide-react';

export function SyncStatusIndicator({ compact = false }: { compact?: boolean }) {
  const { status } = useSyncStatus();

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-warm-cream border border-sand-border text-[11px] font-semibold text-stone-gray"
        title="Status sinkronisasi data cloud real-time"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            status === 'synced'
              ? 'bg-forest-emerald'
              : status === 'syncing'
              ? 'bg-amber-500 animate-pulse'
              : 'bg-stone-gray'
          }`}
        />
        <span className="hidden sm:inline">
          {status === 'synced'
            ? 'Cloud Aktif'
            : status === 'syncing'
            ? 'Sync...'
            : 'Lokal'}
        </span>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warm-cream border border-sand-border text-xs font-medium text-ink-black select-none transition-colors"
      title="Data operasional tersimpan otomatis di perangkat lokal (0ms) dan tersinkronisasi ke server cloud Supabase"
    >
      {status === 'synced' && (
        <>
          <span className="w-2 h-2 rounded-full bg-forest-emerald shadow-[0_0_6px_rgba(2,105,62,0.4)]" />
          <span className="text-[11px] font-semibold text-ink-black">
            Tersimpan di Cloud
          </span>
        </>
      )}

      {status === 'syncing' && (
        <>
          <RefreshCw className="w-3 h-3 animate-spin text-amber-600 shrink-0" />
          <span className="text-[11px] font-semibold text-amber-700">
            Menyinkronkan...
          </span>
        </>
      )}

      {(status === 'offline' || status === 'local') && (
        <>
          <AlertCircle className="w-3 h-3 text-stone-gray shrink-0" />
          <span className="text-[11px] font-semibold text-stone-gray">
            Tersimpan Lokal
          </span>
        </>
      )}
    </div>
  );
}
