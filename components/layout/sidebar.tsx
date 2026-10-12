'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  CalendarDays,
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
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Profile } from '@/lib/types/database';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  leaderOnly?: boolean;
}

const mainNav: NavItem[] = [
  { label: 'Ikhtisar', href: '/', icon: LayoutDashboard },
  { label: 'Aktivitas Harian', href: '/activities', icon: CalendarCheck },
  { label: 'Proyek & Unit', href: '/projects', icon: Building2 },
  { label: 'Rencana Marketing', href: '/plans', icon: Target },
  { label: 'Evaluasi Kinerja', href: '/evaluations', icon: FileSpreadsheet },
  { label: 'Kalender Konten', href: '/content', icon: CalendarDays },
  { label: 'Kanal & Insight', href: '/channels', icon: Share2 },
];

const offlineNav: NavItem[] = [
  { label: 'Event & Pameran', href: '/offline/events', icon: CalendarClock },
  { label: 'Dukungan Sales', href: '/offline/sales-support', icon: HelpCircle },
  { label: 'Sosialisasi Instansi', href: '/offline/sosialisasi', icon: Users },
  { label: 'Materi / Baliho', href: '/offline/props', icon: Megaphone },
];

const systemNav: NavItem[] = [
  { label: 'Import Data', href: '/import', icon: UploadCloud },
  { label: 'Laporan PDF', href: '/reports', icon: FileText },
  { label: 'Pengaturan', href: '/settings', icon: Settings, leaderOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) {
          setProfile(data as Profile);
        } else {
          // Fallback profile if row not yet inserted
          setProfile({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Petugas',
            role: 'officer',
            position: 'Branding Officer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    }
    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-warm-cream border-r border-sand-border min-h-screen flex flex-col justify-between hidden md:flex">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="p-5 border-b border-sand-border flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-ink-black flex items-center justify-center text-paper-white font-bold text-sm tracking-tight">
              S
            </div>
            <div>
              <span className="font-bold text-base tracking-tight block text-ink-black leading-none">
                SEDAYA HQ
              </span>
              <span className="text-[11px] font-medium text-stone-gray uppercase tracking-wider">
                Branding & Ops
              </span>
            </div>
          </Link>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-paper-white border border-sand-border text-stone-gray">
            v1.0
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-6">
          {/* Main Modules */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-ash-gray uppercase">
              Operasional Utama
            </div>
            <nav className="space-y-0.5">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-ink-black text-paper-white shadow-sm font-semibold'
                        : 'text-stone-gray hover:text-ink-black hover:bg-paper-white/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-paper-white' : 'text-stone-gray'}`} />
                      <span>{item.label}</span>
                    </div>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-paper-white/70" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Offline Marketing */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-ash-gray uppercase">
              Marketing Lapangan
            </div>
            <nav className="space-y-0.5">
              {offlineNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-ink-black text-paper-white shadow-sm font-semibold'
                        : 'text-stone-gray hover:text-ink-black hover:bg-paper-white/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-paper-white' : 'text-stone-gray'}`} />
                      <span>{item.label}</span>
                    </div>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-paper-white/70" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Tools & System */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-ash-gray uppercase">
              Alat & Laporan
            </div>
            <nav className="space-y-0.5">
              {systemNav.map((item) => {
                if (item.leaderOnly && profile?.role !== 'leader') return null;
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-ink-black text-paper-white shadow-sm font-semibold'
                        : 'text-stone-gray hover:text-ink-black hover:bg-paper-white/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-paper-white' : 'text-stone-gray'}`} />
                      <span>{item.label}</span>
                    </div>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-paper-white/70" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-sand-border bg-paper-white/50">
        <div className="p-2.5 rounded-2xl bg-paper-white border border-sand-border flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-violet-pulse/10 text-violet-pulse font-bold text-xs flex items-center justify-center flex-shrink-0">
              {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink-black truncate">
                {profile?.full_name || 'Petugas'}
              </p>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    profile?.role === 'leader' ? 'bg-violet-pulse' : 'bg-emerald-600'
                  }`}
                />
                <p className="text-[10px] text-stone-gray truncate">
                  {profile?.role === 'leader' ? 'Leader / SPV' : 'Officer'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar"
            className="p-1.5 rounded-lg text-stone-gray hover:text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
