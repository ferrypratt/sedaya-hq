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
      label: 'Sales Support',
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
      description: 'Baliho, spanduk, umbul-umbul',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-1.5 bg-warm-cream border border-sand-border rounded-2xl mb-6">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`p-3 rounded-xl transition-all text-left flex items-start gap-2.5 ${
              isActive
                ? 'bg-paper-white border border-sand-border text-ink-black shadow-xs ring-1 ring-ink-black/10'
                : 'text-stone-gray hover:text-ink-black hover:bg-paper-white/50'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                isActive ? 'bg-ink-black text-paper-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">{tab.label}</span>
              <span className="text-[10px] text-stone-gray block truncate">{tab.description}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
