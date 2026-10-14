'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  CalendarDays,
  Menu,
  X,
  Target,
  FileSpreadsheet,
  Share2,
  CalendarClock,
  HelpCircle,
  Users,
  Megaphone,
  UploadCloud,
  FileText,
  Settings,
  LogOut,
  Sparkles,
  Palette,
  Flame,
  BookOpen,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SedayaLogo } from '@/components/shared/sedaya-logo';
import { SyncStatusIndicator } from '@/components/ui/sync-status-indicator';

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    document.cookie = 'sedaya_demo=; path=/; max-age=0; SameSite=Lax';
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const navItems = [
    { label: 'Ikhtisar', href: '/', icon: LayoutDashboard },
    { label: 'Proyek & Unit', href: '/projects', icon: Building2 },
    { label: 'Aktivitas Harian', href: '/activities', icon: CalendarCheck },
    { label: 'Kalender Konten', href: '/content', icon: CalendarDays },
    { label: 'Marketing Studio', href: '/content/studio', icon: Sparkles },
    { label: 'Kampanye Promo', href: '/campaigns', icon: Flame },
    { label: 'Brand Hub & Aset', href: '/brand-hub', icon: Palette },
    { label: 'E-Katalog Publik', href: '/katalog', icon: BookOpen },
    { label: 'Kanal & Insight', href: '/channels', icon: Share2 },
    { label: 'Rencana Marketing', href: '/plans', icon: Target },
    { label: 'Evaluasi Kinerja', href: '/evaluations', icon: FileSpreadsheet },
    { label: 'Event & Pameran', href: '/offline/events', icon: CalendarClock },
    { label: 'Dukungan Sales', href: '/offline/sales-support', icon: HelpCircle },
    { label: 'Sosialisasi', href: '/offline/sosialisasi', icon: Users },
    { label: 'Materi / Baliho', href: '/offline/props', icon: Megaphone },
    { label: 'Import Data', href: '/import', icon: UploadCloud },
    { label: 'Laporan PDF', href: '/reports', icon: FileText },
    { label: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  return (
    <div className="md:hidden">
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-40 bg-paper-white border-b border-sand-border px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 min-h-11">
          <div className="w-8 h-8 rounded-lg bg-paper-white border border-sand-border flex items-center justify-center p-0.5 text-ink-black shrink-0 shadow-xs">
            <SedayaLogo className="w-full h-full" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-ink-black block leading-none">
              SEDAYA HQ
            </span>
            <span className="text-[11px] text-stone-gray font-medium block mt-0.5">
              Marketing & Research Ops
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <SyncStatusIndicator compact />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            className="min-w-11 min-h-11 inline-flex items-center justify-center rounded-xl border border-sand-border text-ink-black bg-warm-cream hover:border-sand-hover transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Slide-out Full Menu Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu Navigasi Lengkap"
          className="fixed inset-0 top-14 z-50 bg-paper-white flex flex-col justify-between overflow-y-auto overscroll-contain p-4 pb-28"
        >
          <div className="space-y-1">
            <p className="px-3 py-2 text-[11px] font-bold text-ash-gray uppercase tracking-[0.06em]">
              Semua Modul Operasional
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 min-h-11 rounded-xl text-sm font-medium transition-colors border ${
                    active
                      ? 'bg-ink-black text-paper-white border-ink-black font-semibold'
                      : 'text-stone-gray border-transparent hover:text-ink-black hover:bg-warm-cream'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-sand-border mt-6">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full min-h-11 flex items-center justify-center gap-2 py-2.5 rounded-full border border-ember-border bg-ember-surface text-ember-orange font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Dock (Max 5 Items per R-30, Min 48px Height per R-03) */}
      <nav
        aria-label="Navigasi Cepat Mobile"
        className="fixed bottom-0 left-0 right-0 z-40 bg-paper-white border-t border-sand-border grid grid-cols-5 px-1 py-1"
      >
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className={`flex flex-col items-center justify-center gap-1 min-h-12 rounded-xl text-[11px] transition-colors ${
            isActive('/') && pathname === '/'
              ? 'text-ink-black font-bold bg-warm-cream'
              : 'text-stone-gray font-medium'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Ikhtisar</span>
        </Link>
        <Link
          href="/projects"
          onClick={() => setIsOpen(false)}
          className={`flex flex-col items-center justify-center gap-1 min-h-12 rounded-xl text-[11px] transition-colors ${
            isActive('/projects')
              ? 'text-ink-black font-bold bg-warm-cream'
              : 'text-stone-gray font-medium'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Proyek</span>
        </Link>
        <Link
          href="/activities"
          onClick={() => setIsOpen(false)}
          className={`flex flex-col items-center justify-center gap-1 min-h-12 rounded-xl text-[11px] transition-colors ${
            isActive('/activities')
              ? 'text-ink-black font-bold bg-warm-cream'
              : 'text-stone-gray font-medium'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Aktivitas</span>
        </Link>
        <Link
          href="/content"
          onClick={() => setIsOpen(false)}
          className={`flex flex-col items-center justify-center gap-1 min-h-12 rounded-xl text-[11px] transition-colors ${
            isActive('/content')
              ? 'text-ink-black font-bold bg-warm-cream'
              : 'text-stone-gray font-medium'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Konten</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className={`flex flex-col items-center justify-center gap-1 min-h-12 rounded-xl text-[11px] transition-colors ${
            isOpen
              ? 'text-ink-black font-bold bg-warm-cream'
              : 'text-stone-gray font-medium'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}
