'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, HelpCircle, Users, Megaphone } from 'lucide-react';

export function OfflineNavTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      href: '/offline/events',
      label: 'Event & Pameran',
      icon: Calendar,
      description: 'Agenda expo & booth',
    },
    {
      href: '/offline/sales-support',
      label: 'Dukungan Sales',
      icon: HelpCircle,
      description: 'Materi CRO & Sales',
    },
    {
      href: '/offline/sosialisasi',
      label: 'Sosialisasi',
      icon: Users,
      description: 'Outreach pabrik & instansi',
    },
    {
      href: '/offline/props',
      label: 'Alat Peraga & Reklame',
      icon: Megaphone,
      description: 'Baliho, spanduk & papan',
    },
  ];

  return (
    <nav
      aria-label="Sub-modul Marketing Lapangan"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 bg-warm-cream border border-sand-border rounded-2xl mb-6"
    >
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={`px-3.5 py-2.5 min-h-12 rounded-xl transition-colors text-left flex items-center gap-3 border ${
              isActive
                ? 'bg-paper-white border-ink-black text-ink-black'
                : 'bg-transparent border-transparent text-stone-gray hover:text-ink-black hover:bg-paper-white/60 hover:border-sand-border'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                isActive
                  ? 'bg-ink-black text-paper-white border-ink-black'
                  : 'bg-paper-white text-stone-gray border-sand-border'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate text-ink-black">
                {tab.label}
              </span>
              <span className="text-[11px] text-stone-gray block truncate">
                {tab.description}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
