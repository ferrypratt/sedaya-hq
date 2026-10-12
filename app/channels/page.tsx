'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { INITIAL_CHANNELS, INITIAL_CHANNEL_INSIGHTS } from '@/lib/data/seed-channels';
import { ChannelPlatform, ChannelKind } from '@/lib/types/database';
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
} from 'lucide-react';

export default function ChannelsPage() {
  const [platformFilter, setPlatformFilter] = useState<'all' | ChannelPlatform>('all');
  const [kindFilter, setKindFilter] = useState<'all' | ChannelKind>('all');

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
        return { label: 'Korporat', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'project':
        return { label: 'Proyek', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'business_unit':
        return { label: 'Unit Bisnis', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'office':
        return { label: 'Kantor', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'gallery':
        return { label: 'Galeri', color: 'bg-pink-100 text-pink-800 border-pink-300' };
      default:
        return { label: kind, color: 'bg-stone-100 text-stone-800 border-sand-border' };
    }
  };

  // Quick 7d metrics lookup for card highlight
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

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-ink-black text-paper-white">
                Registry Saluran
              </span>
              <span className="text-xs text-stone-gray font-medium">
                {channels.length} Saluran Terdaftar
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-black">
              Saluran & Insights Digital
            </h1>
            <p className="text-sm text-stone-gray mt-1">
              Monitoring performa media sosial, web portal, YouTube, TikTok, dan Google Business Profile Sedaya Property.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/import"
              className="px-4 py-2 text-sm font-semibold text-ink-black bg-paper-white border border-sand-border rounded-full hover:bg-stone-50 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-violet-pulse" />
              <span>Import Metrik</span>
            </Link>
          </div>
        </div>

        {/* Platform Stat Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(['instagram', 'website', 'google_maps', 'youtube', 'tiktok'] as ChannelPlatform[]).map((plt) => {
            const isSelected = platformFilter === plt;
            return (
              <button
                key={plt}
                onClick={() => setPlatformFilter(isSelected ? 'all' : plt)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-warm-cream border-ink-black ring-1 ring-ink-black'
                    : 'bg-paper-white border-sand-border hover:border-stone-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-1.5 rounded-lg bg-stone-100 text-ink-black">
                    {getPlatformIcon(plt, 'w-4 h-4')}
                  </div>
                  <span className="text-xs font-bold text-ink-black bg-stone-100 px-2 py-0.5 rounded-full">
                    {countsByPlatform[plt]}
                  </span>
                </div>
                <div className="text-xs font-semibold text-stone-gray uppercase tracking-wider">
                  {getPlatformLabel(plt)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-warm-cream border border-sand-border rounded-2xl">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-stone-gray uppercase tracking-wider mr-1">Platform:</span>
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                platformFilter === 'all'
                  ? 'bg-ink-black text-paper-white'
                  : 'bg-paper-white text-ink-black border border-sand-border hover:bg-stone-50'
              }`}
            >
              Semua ({channels.length})
            </button>
            {(['instagram', 'website', 'google_maps', 'youtube', 'tiktok'] as ChannelPlatform[]).map((plt) => (
              <button
                key={plt}
                onClick={() => setPlatformFilter(plt)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  platformFilter === plt
                    ? 'bg-ink-black text-paper-white'
                    : 'bg-paper-white text-ink-black border border-sand-border hover:bg-stone-50'
                }`}
              >
                {getPlatformLabel(plt)} ({countsByPlatform[plt]})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-gray uppercase tracking-wider">Tipe:</span>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as 'all' | ChannelKind)}
              aria-label="Filter kategori saluran"
              className="text-xs font-semibold bg-paper-white border border-sand-border rounded-full px-3 py-1 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
            >
              <option value="all">Semua Tipe</option>
              <option value="corporate">Korporat</option>
              <option value="project">Proyek Perumahan</option>
              <option value="business_unit">Unit Bisnis (Kos)</option>
              <option value="office">Kantor Operasional</option>
              <option value="gallery">Marketing Gallery</option>
            </select>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChannels.map((channel) => {
            const kindBadge = getKindBadge(channel.kind);
            const quickMetric = getChannelQuickMetric(channel.id, channel.platform);

            return (
              <div
                key={channel.id}
                className="bg-paper-white border border-sand-border rounded-2xl p-5 hover:border-stone-400 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Platform & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-warm-cream border border-sand-border text-ink-black">
                        {getPlatformIcon(channel.platform, 'w-5 h-5')}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-stone-gray uppercase tracking-wider block">
                          {getPlatformLabel(channel.platform)}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.2 rounded-full border ${kindBadge.color}`}>
                          {kindBadge.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {channel.active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Aktif
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                          Non-aktif
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Channel Title & Handle */}
                  <div className="mb-3">
                    <h3 className="font-bold text-base text-ink-black line-clamp-1">{channel.name}</h3>
                    <p className="text-xs text-stone-gray font-mono mt-0.5">
                      {channel.handle || channel.url}
                    </p>
                  </div>

                  {/* Project Relation Tag if any */}
                  {channel.projectName && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-gray bg-warm-cream px-2.5 py-1 rounded-lg border border-sand-border mb-4">
                      <Building2 className="w-3.5 h-3.5 text-stone-gray shrink-0" />
                      <span className="truncate">{channel.projectName}</span>
                    </div>
                  )}

                  {/* Quick Metric Strip if available */}
                  {quickMetric && (
                    <div className="mb-4 p-2.5 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-violet-pulse" />
                        <span className="text-xs text-blue-900 font-medium">{quickMetric.label}</span>
                      </div>
                      <span className="text-sm font-extrabold text-blue-950 font-mono">
                        {quickMetric.value}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-sand-border flex items-center justify-between gap-2 mt-2">
                  {channel.url ? (
                    <a
                      href={channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-stone-gray hover:text-ink-black flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-warm-cream transition-colors"
                    >
                      <span>Buka Tautan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <div />
                  )}

                  <Link
                    href={`/channels/${channel.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-paper-white bg-ink-black rounded-full hover:bg-stone-800 transition-colors"
                  >
                    <span>Lihat Insights</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
