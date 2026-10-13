'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { INITIAL_CHANNELS, INITIAL_CHANNEL_INSIGHTS } from '@/lib/data/seed-channels';
import { ChannelPlatform, ChannelKind, Channel } from '@/lib/types/database';
import { InstagramIcon, YouTubeIcon, TikTokIcon } from '@/components/shared/icons';
import {
  Globe,
  MapPin,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Radio,
  Building2,
  CheckCircle2,
  LayoutGrid,
  Table2,
} from 'lucide-react';

export default function ChannelsPage() {
  const [platformFilter, setPlatformFilter] = useState<'all' | ChannelPlatform>('all');
  const [kindFilter, setKindFilter] = useState<'all' | ChannelKind>('all');
  const [viewMode, setViewMode] = useState<'grouped' | 'table'>('grouped');

  const channels = INITIAL_CHANNELS;

  const filteredChannels = channels.filter((c) => {
    if (platformFilter !== 'all' && c.platform !== platformFilter) return false;
    if (kindFilter !== 'all' && c.kind !== kindFilter) return false;
    return true;
  });

  const getPlatformIcon = (platform: ChannelPlatform, className = 'w-5 h-5') => {
    switch (platform) {
      case 'instagram':
        return <InstagramIcon className={className} />;
      case 'website':
        return <Globe className={className} />;
      case 'google_maps':
        return <MapPin className={className} />;
      case 'youtube':
        return <YouTubeIcon className={className} />;
      case 'tiktok':
        return <TikTokIcon className={className} />;
      default:
        return <Radio className={className} />;
    }
  };

  const getPlatformLabel = (platform: ChannelPlatform) => {
    switch (platform) {
      case 'instagram':
        return 'Instagram';
      case 'website':
        return 'Website';
      case 'google_maps':
        return 'Google Maps';
      case 'youtube':
        return 'YouTube';
      case 'tiktok':
        return 'TikTok';
      default:
        return platform;
    }
  };

  const getKindBadge = (kind: ChannelKind) => {
    switch (kind) {
      case 'corporate':
        return { label: 'Korporat', color: 'bg-ink-black text-paper-white border-ink-black' };
      case 'project':
        return { label: 'Proyek', color: 'bg-warm-cream text-ink-black border-sand-border' };
      case 'business_unit':
        return { label: 'Unit Bisnis', color: 'bg-forest-surface text-forest-emerald border-forest-emerald/30' };
      case 'office':
        return { label: 'Kantor', color: 'bg-warm-cream text-stone-gray border-sand-border' };
      case 'gallery':
        return { label: 'Galeri', color: 'bg-warm-cream text-stone-gray border-sand-border' };
      default:
        return { label: kind, color: 'bg-warm-cream text-stone-gray border-sand-border' };
    }
  };

  const getChannelQuickMetric = (channelId: string, platform: ChannelPlatform) => {
    const channelInsights = INITIAL_CHANNEL_INSIGHTS.filter(
      (ci) => ci.channel_id === channelId && ci.period_type === '7d' && ci.period_start === '2026-10-05'
    );
    if (channelInsights.length === 0) return null;

    if (platform === 'instagram') {
      const reach = channelInsights.find((ci) => ci.metric_key === 'reach');
      if (reach) return { label: 'Reach 7h', value: reach.value.toLocaleString('id-ID') };
    } else if (platform === 'website') {
      const sessions = channelInsights.find((ci) => ci.metric_key === 'sessions');
      if (sessions) return { label: 'Sesi 7h', value: sessions.value.toLocaleString('id-ID') };
    } else if (platform === 'google_maps') {
      const views = channelInsights.find((ci) => ci.metric_key === 'profile_views');
      if (views) return { label: 'Views 7h', value: views.value.toLocaleString('id-ID') };
    } else if (platform === 'tiktok') {
      const views = channelInsights.find((ci) => ci.metric_key === 'video_views');
      if (views) return { label: 'Video Views 7h', value: views.value.toLocaleString('id-ID') };
    } else if (platform === 'youtube') {
      const views = channelInsights.find((ci) => ci.metric_key === 'views');
      if (views) return { label: 'Views 7h', value: views.value.toLocaleString('id-ID') };
    }
    return null;
  };

  const countsByPlatform: Record<ChannelPlatform, number> = {
    instagram: channels.filter((c) => c.platform === 'instagram').length,
    website: channels.filter((c) => c.platform === 'website').length,
    google_maps: channels.filter((c) => c.platform === 'google_maps').length,
    youtube: channels.filter((c) => c.platform === 'youtube').length,
    tiktok: channels.filter((c) => c.platform === 'tiktok').length,
  };

  // Group filtered channels so no single grid exceeds 6 cards (R-06)
  const channelGroups: {
    id: string;
    title: string;
    subtitle: string;
    items: (Channel & { projectName?: string })[];
  }[] = [
    {
      id: 'corporate-unit',
      title: 'Korporat & Unit Bisnis',
      subtitle: 'Saluran resmi PT Sedaya Property dan unit bisnis Kos Eksklusif.',
      items: filteredChannels.filter((c) => c.kind === 'corporate' || c.kind === 'business_unit').slice(0, 6),
    },
    {
      id: 'project-ig',
      title: 'Proyek Perumahan Subsidi (Instagram & Web)',
      subtitle: 'Saluran digital proyek perumahan aktif dan upcoming.',
      items: filteredChannels.filter((c) => c.kind === 'project' && c.platform !== 'google_maps').slice(0, 6),
    },
    {
      id: 'maps-presence',
      title: 'Google Business Profile & Titik Lokasi',
      subtitle: 'Kantor operasional, marketing gallery, dan titik peta proyek.',
      items: filteredChannels
        .filter((c) => c.platform === 'google_maps' || c.kind === 'office' || c.kind === 'gallery')
        .slice(0, 6),
    },
  ].filter((g) => g.items.length > 0);

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        <PageHeader
          eyebrow={`Registry Saluran • ${channels.length} Saluran Terdaftar`}
          title="Saluran & Insights Digital"
          description="Monitoring performa media sosial, web portal, YouTube, TikTok, dan Google Business Profile Sedaya Property."
          actions={
            <>
              <div className="inline-flex items-center p-1 bg-warm-cream border border-sand-border rounded-full">
                <button
                  type="button"
                  onClick={() => setViewMode('grouped')}
                  className={`inline-flex items-center gap-1.5 px-3 min-h-9 rounded-full text-xs font-bold transition-colors ${
                    viewMode === 'grouped'
                      ? 'bg-ink-black text-paper-white'
                      : 'text-stone-gray hover:text-ink-black'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grup Saluran</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`inline-flex items-center gap-1.5 px-3 min-h-9 rounded-full text-xs font-bold transition-colors ${
                    viewMode === 'table'
                      ? 'bg-ink-black text-paper-white'
                      : 'text-stone-gray hover:text-ink-black'
                  }`}
                >
                  <Table2 className="w-3.5 h-3.5" />
                  <span>Tabel Master ({filteredChannels.length})</span>
                </button>
              </div>
              <Link href="/import" className="btn-pill-ghost text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-violet-pulse" />
                <span>Import Metrik</span>
              </Link>
            </>
          }
        />

        {/* Platform Filter Ledger Bar */}
        <div className="card-cream p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPlatformFilter('all')}
              className={`inline-flex items-center gap-2 px-3.5 min-h-10 rounded-full text-xs font-bold transition-colors ${
                platformFilter === 'all'
                  ? 'bg-ink-black text-paper-white'
                  : 'bg-paper-white text-stone-gray border border-sand-border hover:text-ink-black'
              }`}
            >
              <span>Semua Platform</span>
              <span className="metric-mono text-[11px] opacity-80">({channels.length})</span>
            </button>

            {(['instagram', 'website', 'google_maps', 'youtube', 'tiktok'] as ChannelPlatform[]).map((plt) => {
              const isSelected = platformFilter === plt;
              return (
                <button
                  key={plt}
                  type="button"
                  onClick={() => setPlatformFilter(isSelected ? 'all' : plt)}
                  className={`inline-flex items-center gap-2 px-3.5 min-h-10 rounded-full text-xs font-bold transition-colors ${
                    isSelected
                      ? 'bg-ink-black text-paper-white'
                      : 'bg-paper-white text-stone-gray border border-sand-border hover:text-ink-black'
                  }`}
                >
                  {getPlatformIcon(plt, 'w-3.5 h-3.5')}
                  <span>{getPlatformLabel(plt)}</span>
                  <span className="metric-mono text-[11px] opacity-80">({countsByPlatform[plt]})</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="channel-kind-select" className="text-xs font-bold text-stone-gray uppercase tracking-wider">
              Kategori:
            </label>
            <select
              id="channel-kind-select"
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as 'all' | ChannelKind)}
              className="text-xs font-bold bg-paper-white border border-sand-border rounded-full px-3.5 min-h-10 text-ink-black focus:outline-hidden"
            >
              <option value="all">Semua Kategori</option>
              <option value="corporate">Korporat</option>
              <option value="project">Proyek Perumahan</option>
              <option value="business_unit">Unit Bisnis (Kos)</option>
              <option value="office">Kantor Operasional</option>
              <option value="gallery">Marketing Gallery</option>
            </select>
          </div>
        </div>

        {/* Grouped Cards View (<= 6 cards per grid section) */}
        {viewMode === 'grouped' ? (
          <div className="space-y-8">
            {channelGroups.map((group) => (
              <section key={group.id} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-sand-border pb-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-ink-black tracking-tight">{group.title}</h2>
                    <p className="text-xs text-stone-gray mt-0.5">{group.subtitle}</p>
                  </div>
                  <span className="text-xs font-bold metric-mono text-stone-gray">
                    Menampilkan {group.items.length} saluran
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((channel) => {
                    const kindBadge = getKindBadge(channel.kind);
                    const quickMetric = getChannelQuickMetric(channel.id, channel.platform);

                    return (
                      <div
                        key={channel.id}
                        className="card-clay p-5 hover:border-ink-black transition-colors flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-warm-cream border border-sand-border text-ink-black flex items-center justify-center shrink-0">
                                {getPlatformIcon(channel.platform, 'w-5 h-5')}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider block">
                                  {getPlatformLabel(channel.platform)}
                                </span>
                                <span
                                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5 ${kindBadge.color}`}
                                >
                                  {kindBadge.label}
                                </span>
                              </div>
                            </div>

                            {channel.active ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-forest-emerald bg-forest-surface px-2.5 py-0.5 rounded-full border border-forest-emerald/30 shrink-0">
                                <CheckCircle2 className="w-3 h-3" />
                                Aktif
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-stone-gray bg-warm-cream px-2.5 py-0.5 rounded-full border border-sand-border shrink-0">
                                Non-aktif
                              </span>
                            )}
                          </div>

                          <div className="mb-3">
                            <h3 className="font-extrabold text-base text-ink-black line-clamp-1">
                              {channel.name}
                            </h3>
                            <p className="text-xs text-stone-gray metric-mono mt-0.5 truncate">
                              {channel.handle || channel.url}
                            </p>
                          </div>

                          {channel.projectName && (
                            <div className="flex items-center gap-1.5 text-xs text-stone-gray bg-warm-cream px-2.5 py-1.5 rounded-xl border border-sand-border mb-3">
                              <Building2 className="w-3.5 h-3.5 text-stone-gray shrink-0" />
                              <span className="truncate font-medium text-ink-black">{channel.projectName}</span>
                            </div>
                          )}

                          {quickMetric && (
                            <div className="mb-3 p-2.5 rounded-xl bg-warm-cream border border-sand-border flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-violet-pulse" />
                                <span className="text-xs text-stone-gray font-semibold">{quickMetric.label}</span>
                              </div>
                              <span className="text-sm font-black text-ink-black metric-mono">
                                {quickMetric.value}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-sand-border flex items-center justify-between gap-2 mt-2">
                          {channel.url ? (
                            <a
                              href={channel.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-stone-gray hover:text-ink-black inline-flex items-center gap-1 px-3 min-h-9 rounded-full hover:bg-warm-cream transition-colors"
                            >
                              <span>Buka URL</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <div />
                          )}

                          <Link
                            href={`/channels/${channel.id}`}
                            className="inline-flex items-center gap-1 px-3.5 min-h-9 text-xs font-bold text-paper-white bg-ink-black rounded-full hover:bg-charcoal transition-colors"
                          >
                            <span>Lihat Insights</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            {/* Prompt to view full 19-channel table */}
            <div className="card-cream p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-ink-black">
                  Ingin melihat seluruh {filteredChannels.length} saluran sekaligus dalam satu daftar?
                </p>
                <p className="text-xs text-stone-gray">
                  Gunakan tampilan Tabel Master untuk membandingkan status dan metrik seluruh saluran.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className="btn-pill-ghost text-xs self-start sm:self-auto"
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Buka Tabel Master ({filteredChannels.length} Saluran)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Full 19-Channel Master Registry Table */
          <div className="card-clay overflow-hidden">
            <div className="p-5 border-b border-sand-border flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-ink-black tracking-tight">
                  Tabel Master Saluran Digital ({filteredChannels.length} Saluran)
                </h2>
                <p className="text-xs text-stone-gray mt-0.5">
                  Daftar lengkap seluruh saluran resmi korporat, proyek perumahan, dan Google Business Profile.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-sand-border bg-warm-cream text-stone-gray uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">Nama Saluran</th>
                    <th className="py-3 px-4 font-bold">Platform</th>
                    <th className="py-3 px-4 font-bold">Kategori</th>
                    <th className="py-3 px-4 font-bold">Handle / URL</th>
                    <th className="py-3 px-4 font-bold text-right">Metrik 7h</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border/70">
                  {filteredChannels.map((channel) => {
                    const kindBadge = getKindBadge(channel.kind);
                    const quickMetric = getChannelQuickMetric(channel.id, channel.platform);
                    return (
                      <tr key={channel.id} className="hover:bg-warm-cream/40 transition-colors">
                        <td className="py-3 px-4 font-extrabold text-ink-black">
                          <div>{channel.name}</div>
                          {channel.projectName && (
                            <div className="text-[11px] font-medium text-stone-gray mt-0.5">
                              {channel.projectName}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 font-bold text-ink-black">
                            {getPlatformIcon(channel.platform, 'w-3.5 h-3.5')}
                            <span>{getPlatformLabel(channel.platform)}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${kindBadge.color}`}>
                            {kindBadge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 metric-mono text-stone-gray">
                          {channel.handle || channel.url}
                        </td>
                        <td className="py-3 px-4 text-right metric-mono font-bold text-ink-black">
                          {quickMetric ? `${quickMetric.value} (${quickMetric.label})` : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {channel.active ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-forest-emerald bg-forest-surface px-2 py-0.5 rounded-full border border-forest-emerald/30">
                              Aktif
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-stone-gray bg-warm-cream px-2 py-0.5 rounded-full border border-sand-border">
                              Non-aktif
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/channels/${channel.id}`}
                            className="inline-flex items-center gap-1 px-3 min-h-8 text-xs font-bold text-ink-black bg-warm-cream border border-sand-border rounded-full hover:border-ink-black transition-colors"
                          >
                            <span>Insights</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

