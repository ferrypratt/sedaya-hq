'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';
import { Plus, Building2, UploadCloud, Search } from 'lucide-react';
import { SyncStatusIndicator } from '@/components/ui/sync-status-indicator';
import { CommandPalette, openCommandPalette } from '@/components/ui/command-palette';

const emptySubscribe = () => () => {};

const ROUTE_LABELS: Record<string, { group: string; label: string }> = {
  '/': { group: 'Komando Eksekutif', label: 'Ikhtisar Operasional' },
  '/activities': { group: 'Operasional Utama', label: 'Log Aktivitas Harian' },
  '/projects': { group: 'Operasional Utama', label: 'Portofolio Proyek & Rekonsiliasi Unit' },
  '/plans': { group: 'Operasional Utama', label: 'Rencana Marketing & Matriks KPI' },
  '/evaluations': { group: 'Operasional Utama', label: 'Evaluasi Kinerja Tim' },
  '/content': { group: 'Operasional Utama', label: 'Kalender & Antrian Konten' },
  '/channels': { group: 'Operasional Utama', label: 'Registri Kanal Digital & Insight' },
  '/offline/events': { group: 'Marketing Lapangan', label: 'Event & Pameran' },
  '/offline/sales-support': { group: 'Marketing Lapangan', label: 'Dukungan Sales & CRO' },
  '/offline/sosialisasi': { group: 'Marketing Lapangan', label: 'Sosialisasi' },
  '/offline/props': { group: 'Marketing Lapangan', label: 'Alat Peraga & Reklame' },
  '/import': { group: 'Sistem & Laporan', label: 'Pusat Import Data' },
  '/reports': { group: 'Sistem & Laporan', label: 'Generator Laporan PDF' },
  '/settings': { group: 'Sistem & Laporan', label: 'Pengaturan & Master Data' },
};

function resolveRouteMeta(pathname: string) {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  if (pathname.startsWith('/projects/')) {
    return { group: 'Portofolio Proyek', label: 'Detail Inventaris & Operasional Proyek' };
  }
  if (pathname.startsWith('/channels/')) {
    return { group: 'Kanal Digital', label: 'Analitik Performa Kanal' };
  }
  return { group: 'Sedaya HQ', label: 'Workspace Operasional' };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const routeMeta = resolveRouteMeta(pathname);
  const todayFormatted = useSyncExternalStore(
    emptySubscribe,
    () =>
      new Intl.DateTimeFormat('id-ID', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date()),
    () => 'Okt 2026'
  );

  return (
    <div className="min-h-dvh flex flex-col md:flex-row bg-paper-white text-ink-black overflow-x-hidden">
      <Sidebar />
      <MobileNav />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Contextual Top Workbench Bar */}
        <header className="hidden md:flex items-center justify-between h-13 px-6 lg:px-8 border-b border-sand-border workbench-blur sticky top-0 z-30">
          <div className="flex items-center gap-2.5 text-xs min-w-0">
            <span className="font-semibold text-ash-gray uppercase tracking-[0.06em] truncate">
              {routeMeta.group}
            </span>
            <span aria-hidden="true" className="text-sand-border text-sm">
              /
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta shrink-0" />
              <span className="font-bold text-ink-black truncate">
                {routeMeta.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warm-cream border border-sand-border text-[11px] text-stone-gray font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
              <span>Medan • Deli Serdang</span>
            </div>
            <button
              type="button"
              onClick={openCommandPalette}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-gray bg-warm-cream border border-sand-border hover:border-sand-hover hover:text-ink-black transition-colors"
              title="Buka pencarian cepat dan aksi (Cmd + K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cari...</span>
              <kbd className="text-[10px] bg-paper-white border border-sand-border px-1.5 py-0.5 rounded font-mono">
                ⌘K
              </kbd>
            </button>
            <SyncStatusIndicator />
            <span className="metric-mono text-xs text-stone-gray px-2.5 py-1 rounded-full bg-warm-cream border border-sand-border">
              {todayFormatted}
            </span>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-ink-black bg-paper-white border border-sand-border hover:bg-warm-cream hover:border-sand-hover transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-stone-gray" />
              <span>Stok 7 Proyek</span>
            </Link>
            <Link
              href="/import"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-ink-black bg-paper-white border border-sand-border hover:bg-warm-cream hover:border-sand-hover transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-stone-gray" />
              <span>Import CSV</span>
            </Link>
            <Link
              href="/activities"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-terracotta text-paper-white hover:bg-terracotta-hover active:scale-[0.97] transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Aktivitas</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-10">
          <div className="w-full max-w-[1360px] mx-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {children}
          </div>
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
