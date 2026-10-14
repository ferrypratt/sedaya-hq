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
  Sparkles,
  Palette,
  Flame,
  BookOpen,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Profile } from '@/lib/types/database';
import { SedayaLogo } from '@/components/shared/sedaya-logo';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const mainNav: NavItem[] = [
  { label: 'Ikhtisar', href: '/', icon: LayoutDashboard },
  { label: 'Proyek & Unit', href: '/projects', icon: Building2, badge: '7' },
  { label: 'Aktivitas Harian', href: '/activities', icon: CalendarCheck },
  { label: 'Kalender Konten', href: '/content', icon: CalendarDays },
  { label: 'Kanal & Insight', href: '/channels', icon: Share2 },
  { label: 'Rencana Marketing', href: '/plans', icon: Target },
  { label: 'Evaluasi Kinerja', href: '/evaluations', icon: FileSpreadsheet },
];

const brandingNav: NavItem[] = [
  { label: 'Marketing Studio', href: '/content/studio', icon: Sparkles, badge: 'Studio' },
  { label: 'Kampanye Promo', href: '/campaigns', icon: Flame },
  { label: 'Brand Hub & Aset', href: '/brand-hub', icon: Palette },
  { label: 'E-Katalog Publik', href: '/katalog', icon: BookOpen },
];

const offlineNav: NavItem[] = [
  { label: 'Event & Pameran', href: '/offline/events', icon: CalendarClock },
  { label: 'Dukungan Sales', href: '/offline/sales-support', icon: HelpCircle },
  { label: 'Sosialisasi', href: '/offline/sosialisasi', icon: Users },
  { label: 'Materi / Baliho', href: '/offline/props', icon: Megaphone },
];

const systemNav: NavItem[] = [
  { label: 'Import Data', href: '/import', icon: UploadCloud },
  { label: 'Laporan PDF', href: '/reports', icon: FileText },
  { label: 'Pengaturan', href: '/settings', icon: Settings },
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
          setProfile({
            id: user.id,
            full_name:
              user.user_metadata?.full_name ||
              user.email?.split('@')[0] ||
              'Petugas Operasional',
            role: 'leader',
            position: 'Marketing Operations',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    }
    fetchUser();
  }, [supabase]);

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

  const renderSection = (title: string, items: NavItem[]) => (
    <div>
      <div className="px-3 mb-1.5 text-[11px] font-semibold tracking-[0.06em] text-ash-gray uppercase">
        {title}
      </div>
      <nav className="space-y-0.5" aria-label={title}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`group flex items-center justify-between px-3 py-2 min-h-10 rounded-xl text-[13px] transition-colors border ${
                active
                  ? 'bg-ink-black text-paper-white border-ink-black font-semibold'
                  : 'bg-transparent text-stone-gray border-transparent hover:text-ink-black hover:bg-paper-white hover:border-sand-border font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active
                      ? 'text-paper-white'
                      : 'text-ash-gray group-hover:text-ink-black'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`metric-mono text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${
                    active
                      ? 'bg-paper-white/20 text-paper-white'
                      : 'bg-paper-white border border-sand-border text-stone-gray'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <aside className="w-64 shrink-0 bg-warm-cream border-r border-sand-border h-dvh sticky top-0 hidden md:flex flex-col justify-between select-none">
      <div className="flex flex-col flex-1 overflow-y-auto overscroll-contain">
        {/* Brand Identity Header */}
        <div className="h-13 px-5 border-b border-sand-border flex items-center justify-between shrink-0 bg-warm-cream">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-paper-white border border-sand-border flex items-center justify-center p-0.5 text-ink-black shrink-0 shadow-xs">
              <SedayaLogo className="w-full h-full" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm tracking-tight block text-ink-black leading-none truncate">
                SEDAYA HQ
              </span>
              <span className="text-[10px] font-medium text-stone-gray uppercase tracking-[0.06em] block mt-0.5 truncate">
                Marketing & Research
              </span>
            </div>
          </Link>
          <span className="metric-mono px-2 py-0.5 rounded-full text-[10px] font-semibold bg-paper-white border border-sand-border text-stone-gray">
            v2.0
          </span>
        </div>

        {/* Navigation Groups */}
        <div className="p-3 space-y-5">
          {renderSection('Operasional Utama', mainNav)}
          {renderSection('Branding & Kreatif', brandingNav)}
          {renderSection('Marketing Lapangan', offlineNav)}
          {renderSection('Sistem & Laporan', systemNav)}
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-sand-border bg-warm-cream shrink-0">
        <div className="p-2.5 rounded-xl bg-paper-white border border-sand-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-warm-cream border border-sand-border text-ink-black font-bold text-xs flex items-center justify-center shrink-0">
              {profile?.full_name ? profile.full_name[0].toUpperCase() : 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink-black truncate">
                {profile?.full_name || 'Tim Sedaya'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-forest shrink-0" />
                <p className="text-[11px] text-stone-gray truncate">
                  {profile?.position ||
                    (profile?.role === 'leader' ? 'Leader / SPV' : 'Officer')}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Keluar Akun"
            aria-label="Keluar Akun"
            className="min-w-9 min-h-9 inline-flex items-center justify-center rounded-lg text-stone-gray hover:text-ember-orange hover:bg-ember-surface transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
