'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
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
    { label: 'Aktivitas Harian', href: '/activities', icon: CalendarCheck },
    { label: 'Proyek & Unit', href: '/projects', icon: Building2 },
    { label: 'Rencana Marketing', href: '/plans', icon: Target },
    { label: 'Evaluasi', href: '/evaluations', icon: FileSpreadsheet },
    { label: 'Kalender Konten', href: '/content', icon: CalendarDays },
    { label: 'Kanal & Insight', href: '/channels', icon: Share2 },
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
      <header className="sticky top-0 z-40 bg-paper-white/95 backdrop-blur-sm border-b border-sand-border px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-ink-black flex items-center justify-center text-paper-white font-bold text-xs">
            S
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-ink-black block leading-none">
              SEDAYA HQ
            </span>
            <span className="text-[10px] text-stone-gray font-medium">Medan / Deli Serdang</span>
          </div>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation"
          className="p-1.5 rounded-lg border border-sand-border text-stone-gray hover:text-ink-black hover:bg-warm-cream"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Slide-out Full Menu Drawer */}
      {isOpen && (
        <div className="fixed inset-0 top-[49px] z-50 bg-paper-white flex flex-col justify-between overflow-y-auto p-4 pb-24">
          <div className="space-y-1">
            <p className="px-3 py-2 text-xs font-bold text-ash-gray uppercase tracking-wider">
              Menu Navigasi
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    active
                      ? 'bg-ink-black text-paper-white font-semibold'
                      : 'text-stone-gray hover:bg-warm-cream'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-sand-border mt-6">
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Keluar Akun
            </button>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar for Quick Actions on Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-paper-white/95 backdrop-blur-sm border-t border-sand-border flex items-center justify-around py-2 px-1">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium ${
            isActive('/') && pathname === '/' ? 'text-ink-black font-bold' : 'text-stone-gray'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Ikhtisar</span>
        </Link>
        <Link
          href="/activities"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium ${
            isActive('/activities') ? 'text-ink-black font-bold' : 'text-stone-gray'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Aktivitas</span>
        </Link>
        <Link
          href="/projects"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium ${
            isActive('/projects') ? 'text-ink-black font-bold' : 'text-stone-gray'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Proyek</span>
        </Link>
        <Link
          href="/content"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium ${
            isActive('/content') ? 'text-ink-black font-bold' : 'text-stone-gray'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Konten</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium ${
            isOpen ? 'text-ink-black font-bold' : 'text-stone-gray'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span>Lainnya</span>
        </button>
      </nav>
    </div>
  );
}
