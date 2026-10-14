'use client';

import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { MarketingStudioView } from '@/components/modules/content/marketing-studio-view';
import Link from 'next/link';
import { ArrowLeft, CalendarDays } from 'lucide-react';

export default function MarketingStudioPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/content"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-gray hover:text-ink-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Kalender Konten</span>
          </Link>
          <Link
            href="/content"
            className="btn-pill-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 text-stone-gray hover:text-ink-black"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Buka Kanban Konten</span>
          </Link>
        </div>

        <PageHeader
          section="Branding & Kreatif"
          title="Marketing Studio & Naskah Kreatif"
          description="Studio pembuatan naskah video pendek (Reels/TikTok/Shorts), copywriter Carousel 6 slide, dan materi iklan berbayar terpadu untuk proyek Sedaya Property."
        />

        <MarketingStudioView />
      </div>
    </AppShell>
  );
}
