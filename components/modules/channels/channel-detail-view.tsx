'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Channel, ChannelInsight, ChannelPlatform } from '@/lib/types/database';
import {
  getPlatformMetrics,
  formatMetricValue,
  MetricDefinition,
} from '@/lib/config/metrics';
import { INITIAL_CHANNEL_INSIGHTS, CHANNEL_TREND_SERIES } from '@/lib/data/seed-channels';
import { InstagramIcon, YouTubeIcon, TikTokIcon } from '@/components/shared/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft,
  ExternalLink,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  MapPin,
  Radio,
  Building2,
  X,
  CheckCircle2,
  Database,
} from 'lucide-react';

let nextInsightCounter = 1000;
function generateInsightId(): string {
  nextInsightCounter += 1;
  return `ci-manual-${nextInsightCounter}`;
}

interface ChannelDetailViewProps {
  channel: Channel & { projectName?: string };
}

export function ChannelDetailView({ channel }: ChannelDetailViewProps) {
  const [periodType, setPeriodType] = useState<'7d' | '30d'>('7d');
  const [insights, setInsights] = useState<ChannelInsight[]>(INITIAL_CHANNEL_INSIGHTS);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual Form State
  const platformMetrics = getPlatformMetrics(channel.platform);
  const [formData, setFormData] = useState({
    period_type: '7d' as '7d' | '30d',
    period_start: '2026-10-12',
    period_end: '2026-10-18',
    metric_key: platformMetrics[0]?.key || '',
    value: '',
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

  // Filter insights for this channel & selected period
  const channelInsights = insights.filter(
    (ci) => ci.channel_id === channel.id && ci.period_type === periodType
  );

  // Current period is 2026-10-05 to 2026-10-11 for 7d (or latest)
  const currentInsights = channelInsights.filter((ci) => ci.period_start === '2026-10-05');
  const prevInsights = channelInsights.filter((ci) => ci.period_start === '2026-09-28');

  // Trend series for chart
  const trendData = CHANNEL_TREND_SERIES[channel.id] || [
    { date: 'Mgg 1', [platformMetrics[0]?.key || 'val']: 450 },
    { date: 'Mgg 2', [platformMetrics[0]?.key || 'val']: 620 },
    { date: 'Mgg 3', [platformMetrics[0]?.key || 'val']: 780 },
    { date: 'Mgg 4', [platformMetrics[0]?.key || 'val']: 950 },
    { date: 'Mgg 5', [platformMetrics[0]?.key || 'val']: 1180 },
  ];

  // Active chart metric
  const availableChartKeys = Object.keys(trendData[0] || {}).filter((k) => k !== 'date');
  const [selectedChartMetric, setSelectedChartMetric] = useState<string>(
    availableChartKeys[0] || platformMetrics[0]?.key || ''
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.metric_key || !formData.value) return;

    const newInsight: ChannelInsight = {
      id: generateInsightId(),
      channel_id: channel.id,
      period_type: formData.period_type,
      period_start: formData.period_start,
      period_end: formData.period_end,
      metric_key: formData.metric_key,
      value: parseFloat(formData.value) || 0,
      source: 'manual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setInsights([newInsight, ...insights]);
    setIsManualModalOpen(false);
    setFormData({
      period_type: periodType,
      period_start: '2026-10-12',
      period_end: '2026-10-18',
      metric_key: platformMetrics[0]?.key || '',
      value: '',
    });
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-gray">
          <Link href="/channels" className="hover:text-ink-black flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Daftar Saluran</span>
          </Link>
          <span>/</span>
          <span className="text-ink-black uppercase tracking-wider">{getPlatformLabel(channel.platform)}</span>
          <span>/</span>
          <span className="text-ink-black truncate">{channel.name}</span>
        </div>

        {/* Header Banner */}
        <div className="bg-paper-white border border-sand-border rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-warm-cream border border-sand-border text-ink-black shrink-0">
                {getPlatformIcon(channel.platform, 'w-7 h-7')}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-black text-ink-black tracking-tight">
                    {channel.name}
                  </h1>
                  {channel.active ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Aktif
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full">
                      Non-aktif
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-stone-gray">
                  {channel.handle && (
                    <span className="font-mono bg-warm-cream px-2 py-0.5 rounded-md border border-sand-border">
                      {channel.handle}
                    </span>
                  )}
                  {channel.projectName && (
                    <span className="inline-flex items-center gap-1 bg-warm-cream px-2 py-0.5 rounded-md border border-sand-border">
                      <Building2 className="w-3.5 h-3.5" />
                      {channel.projectName}
                    </span>
                  )}
                  {channel.url && (
                    <a
                      href={channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-violet-pulse hover:underline font-semibold"
                    >
                      <span>Kunjungi URL Saluran</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons & Period Toggle */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
              {/* Period Switcher */}
              <div className="flex items-center p-1 bg-warm-cream border border-sand-border rounded-full">
                <button
                  onClick={() => setPeriodType('7d')}
                  className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                    periodType === '7d'
                      ? 'bg-ink-black text-paper-white shadow-xs'
                      : 'text-stone-gray hover:text-ink-black'
                  }`}
                >
                  7 Hari (7d)
                </button>
                <button
                  onClick={() => setPeriodType('30d')}
                  className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                    periodType === '30d'
                      ? 'bg-ink-black text-paper-white shadow-xs'
                      : 'text-stone-gray hover:text-ink-black'
                  }`}
                >
                  30 Hari (30d)
                </button>
              </div>

              {/* Manual Input Trigger */}
              <button
                onClick={() => setIsManualModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-paper-white bg-ink-black rounded-full hover:bg-stone-800 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Input Metrik Manual</span>
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-extrabold text-ink-black tracking-tight">
              Ringkasan Metrik {getPlatformLabel(channel.platform)} ({periodType === '7d' ? '7 Hari Terakhir' : '30 Hari Terakhir'})
            </h2>
            <span className="text-xs text-stone-gray font-medium">
              Dibandingkan periode sebelumnya
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {platformMetrics.map((def: MetricDefinition) => {
              const currentItem = currentInsights.find((ci) => ci.metric_key === def.key);
              const prevItem = prevInsights.find((ci) => ci.metric_key === def.key);

              const currVal = currentItem?.value ?? 0;
              const prevVal = prevItem?.value ?? null;

              let deltaPct: number | null = null;

              if (prevVal !== null && prevVal !== 0) {
                deltaPct = ((currVal - prevVal) / prevVal) * 100;
              } else if (prevVal === 0 && currVal > 0) {
                deltaPct = 100;
              }

              return (
                <div
                  key={def.key}
                  className="bg-paper-white border border-sand-border rounded-2xl p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-xs font-semibold text-stone-gray uppercase tracking-wider truncate">
                        {def.shortLabel || def.label}
                      </span>
                      {currentItem?.source && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-warm-cream border border-sand-border text-stone-500">
                          {currentItem.source}
                        </span>
                      )}
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-ink-black font-mono">
                      {formatMetricValue(currVal, def)}
                    </div>
                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {def.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-sand-border/70 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-stone-gray">
                      Lalu:{' '}
                      <span className="font-mono font-medium text-ink-black">
                        {prevVal !== null ? formatMetricValue(prevVal, def) : '—'}
                      </span>
                    </span>

                    {deltaPct !== null ? (
                      <div
                        className={`inline-flex items-center gap-0.5 font-bold text-[11px] px-1.5 py-0.5 rounded-full ${
                          deltaPct > 0
                            ? 'text-emerald-700 bg-emerald-50'
                            : deltaPct < 0
                            ? 'text-rose-700 bg-rose-50'
                            : 'text-stone-600 bg-stone-100'
                        }`}
                      >
                        {deltaPct > 0 ? (
                          <TrendingUp className="w-3 h-3 text-emerald-600" />
                        ) : deltaPct < 0 ? (
                          <TrendingDown className="w-3 h-3 text-rose-600" />
                        ) : (
                          <Minus className="w-3 h-3 text-stone-500" />
                        )}
                        <span>
                          {deltaPct > 0 ? '+' : ''}
                          {deltaPct.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-stone-400">Baru</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trend Line Chart */}
        <div className="bg-paper-white border border-sand-border rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-extrabold text-ink-black tracking-tight">
                Tren Performa Historis
              </h2>
              <p className="text-xs text-stone-gray mt-0.5">
                Perkembangan performa dari waktu ke waktu per minggu operasi.
              </p>
            </div>

            {/* Metric Selector for Chart */}
            <div className="flex flex-wrap items-center gap-1.5">
              {availableChartKeys.map((metricKey) => {
                const def = platformMetrics.find((m) => m.key === metricKey);
                const isSelected = selectedChartMetric === metricKey;
                return (
                  <button
                    key={metricKey}
                    onClick={() => setSelectedChartMetric(metricKey)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                      isSelected
                        ? 'bg-ink-black text-paper-white shadow-xs'
                        : 'bg-warm-cream text-stone-gray hover:text-ink-black border border-sand-border'
                    }`}
                  >
                    {def?.shortLabel || metricKey}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dad4c8" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#737373' }}
                  axisLine={{ stroke: '#dad4c8' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#737373' }}
                  axisLine={{ stroke: '#dad4c8' }}
                  tickLine={false}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const dataPoint = payload[0];
                      const def = platformMetrics.find((m) => m.key === selectedChartMetric);
                      return (
                        <div className="bg-paper-white p-3 border border-sand-border rounded-xl shadow-lg">
                          <p className="text-xs font-bold text-ink-black mb-1">Periode: {label}</p>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-violet-pulse" />
                            <span className="text-xs text-stone-gray">
                              {def?.label || selectedChartMetric}:
                            </span>
                            <span className="text-xs font-bold text-ink-black font-mono">
                              {Number(dataPoint.value).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={selectedChartMetric}
                  stroke="#3859f9"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3859f9', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#000000', stroke: '#3859f9', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Insights Data Table */}
        <div className="bg-paper-white border border-sand-border rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-ink-black tracking-tight flex items-center gap-2">
                <Database className="w-4 h-4 text-violet-pulse" />
                <span>Log Catatan Metrik Terdaftar</span>
              </h2>
              <p className="text-xs text-stone-gray mt-0.5">
                Riwayat catatan hasil import dan entri manual saluran {channel.name}.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-warm-cream border border-sand-border text-ink-black">
              {channelInsights.length} Entri
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-sand-border text-stone-gray uppercase tracking-wider bg-warm-cream/50">
                  <th className="py-2.5 px-3 font-semibold">Rentang Periode</th>
                  <th className="py-2.5 px-3 font-semibold">Tipe</th>
                  <th className="py-2.5 px-3 font-semibold">Metrik</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Nilai Tercatat</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Sumber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-border/70">
                {channelInsights.map((item) => {
                  const def = platformMetrics.find((m) => m.key === item.metric_key);
                  return (
                    <tr key={item.id} className="hover:bg-warm-cream/30 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-ink-black whitespace-nowrap">
                        {item.period_start} s/d {item.period_end}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                          {item.period_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-ink-black">
                        {def?.label || item.metric_key}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-ink-black font-mono">
                        {formatMetricValue(item.value, def)}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            item.source === 'import'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {item.source}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Metric Entry Modal */}
        {isManualModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-paper-white border border-sand-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="absolute top-4 right-4 text-stone-gray hover:text-ink-black p-1.5 rounded-full hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-warm-cream border border-sand-border text-ink-black">
                  <PlusCircle className="w-5 h-5 text-violet-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink-black tracking-tight">
                    Input Metrik Manual
                  </h3>
                  <p className="text-xs text-stone-gray">{channel.name}</p>
                </div>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1.5">
                    Tipe Periode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, period_type: '7d' })}
                      className={`py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                        formData.period_type === '7d'
                          ? 'bg-ink-black text-paper-white border-ink-black'
                          : 'bg-paper-white text-ink-black border-sand-border'
                      }`}
                    >
                      7 Hari (7d)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, period_type: '30d' })}
                      className={`py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                        formData.period_type === '30d'
                          ? 'bg-ink-black text-paper-white border-ink-black'
                          : 'bg-paper-white text-ink-black border-sand-border'
                      }`}
                    >
                      30 Hari (30d)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={formData.period_start}
                      onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                      required
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Tanggal Selesai
                    </label>
                    <input
                      type="date"
                      value={formData.period_end}
                      onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                      required
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1.5">
                    Pilih Metrik
                  </label>
                  <select
                    value={formData.metric_key}
                    onChange={(e) => setFormData({ ...formData, metric_key: e.target.value })}
                    required
                    className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                  >
                    {platformMetrics.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.label} ({m.shortLabel || m.key})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1.5">
                    Nilai Metrik
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="Contoh: 18450"
                    required
                    className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black font-mono focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsManualModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-gray hover:text-ink-black bg-stone-100 rounded-full"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-paper-white bg-ink-black rounded-full hover:bg-stone-800 transition-colors shadow-xs"
                  >
                    Simpan Metrik
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
