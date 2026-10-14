'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { INITIAL_CAMPAIGNS } from '@/lib/data/seed-campaigns';
import { INITIAL_PROJECTS } from '@/lib/data/seed-data';
import { usePersistentState, STORAGE_KEYS, generateUUID } from '@/lib/storage/persistence';
import { Campaign, CampaignCreativeAsset, ChannelPlatform } from '@/lib/types/database';
import { InstagramIcon, TikTokIcon } from '@/components/shared/icons';
import {
  Megaphone,
  Plus,
  Target,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  FileText,
  Building2,
  ExternalLink,
  Flame,
  Check,
  Trash2,
} from 'lucide-react';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = usePersistentState<Campaign[]>(
    STORAGE_KEYS.CAMPAIGNS,
    INITIAL_CAMPAIGNS
  );

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-purge old dummy seed campaigns if they exist in client storage
  useEffect(() => {
    if (campaigns.some((c) => c.id.startsWith('c1010101-'))) {
      setCampaigns((prev) => prev.filter((c) => !c.id.startsWith('c1010101-')));
    }
  }, [campaigns, setCampaigns]);

  const handleDeleteCampaign = (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Hapus kampanye promosi ini?')) {
      return;
    }
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const handleClearAll = () => {
    if (typeof window !== 'undefined' && !window.confirm('Kosongkan semua data kampanye promosi?')) {
      return;
    }
    setCampaigns([]);
  };

  // New Campaign Form State
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    period_start: '2026-10-15',
    period_end: '2026-11-15',
    project_id: INITIAL_PROJECTS[0].id,
    budget_idr: 10000000,
    target_leads: 100,
    target_bookings: 10,
    key_message: '',
    channels: ['instagram', 'tiktok', 'website'] as ChannelPlatform[],
  });

  const filteredCampaigns = campaigns.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  // KPI Calculations
  const activeCount = campaigns.filter((c) => c.status === 'active').length;
  const totalBudget = campaigns
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + (c.budget_idr || 0), 0);
  const totalBookingsTarget = campaigns
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + (c.target_bookings || 0), 0);
  const totalBookingsActual = campaigns
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + (c.actual_bookings || 0), 0);

  const formatIdr = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleToggleAssetStatus = (campaignId: string, assetId: string) => {
    setCampaigns((prev) =>
      prev.map((camp) => {
        if (camp.id !== campaignId) return camp;
        return {
          ...camp,
          creative_assets: camp.creative_assets.map((asset) => {
            if (asset.id !== assetId) return asset;
            const nextStatus: 'pending' | 'in_progress' | 'ready' =
              asset.status === 'pending'
                ? 'in_progress'
                : asset.status === 'in_progress'
                ? 'ready'
                : 'pending';
            return { ...asset, status: nextStatus };
          }),
        };
      })
    );
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const newCamp: Campaign = {
      id: generateUUID(),
      title: formData.title,
      tagline: formData.tagline,
      period_start: formData.period_start,
      period_end: formData.period_end,
      project_id: formData.project_id,
      status: 'active',
      budget_idr: Number(formData.budget_idr),
      target_leads: Number(formData.target_leads),
      target_bookings: Number(formData.target_bookings),
      actual_leads: 0,
      actual_bookings: 0,
      channels: formData.channels,
      key_message: formData.key_message,
      creative_assets: [
        {
          id: generateUUID(),
          name: 'Video Reel Hook & Storytelling',
          asset_type: 'reel_video',
          status: 'pending',
          notes: 'Buat di Marketing Studio',
        },
        {
          id: generateUUID(),
          name: 'Carousel 6 Slide Edukasi Promo',
          asset_type: 'carousel',
          status: 'pending',
        },
        {
          id: generateUUID(),
          name: 'Spanduk / Baliho Lokasi',
          asset_type: 'spanduk',
          status: 'pending',
        },
        {
          id: generateUUID(),
          name: 'Format Siaran WA ke Grup & Agen',
          asset_type: 'wa_broadcast',
          status: 'pending',
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCampaigns((prev) => [newCamp, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          section="Pemasaran & Kampanye"
          title="Campaign & Promo Planner"
          description="Perencanaan promosi tematik bulanan, alokasi anggaran, checklist materi kreatif, dan tracking target booking unit perumahan Sedaya Property."
          actions={
            <div className="flex items-center gap-2">
              {campaigns.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="btn-pill-ghost text-xs py-2 px-3 text-stone-gray hover:text-ember-orange flex items-center gap-1.5"
                  title="Kosongkan seluruh data kampanye"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan Data</span>
                </button>
              )}
              <Link
                href="/content/studio"
                className="btn-pill-secondary flex items-center gap-1.5 text-xs py-2 px-3.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-forest" />
                <span>Buka Marketing Studio</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="btn-pill-primary text-xs py-2 px-3.5 flex items-center gap-1.5 bg-forest text-paper-white hover:bg-forest-emerald shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Kampanye Baru</span>
              </button>
            </div>
          }
        />

        {/* Executive KPI Bar */}
        <section className="card-cream p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ash-gray block">
              Kampanye Aktif
            </span>
            <span className="metric-mono text-2xl font-bold text-ink-black mt-0.5 block">
              {activeCount}
            </span>
            <span className="text-[10px] text-stone-gray block">Sedang berjalan bulan ini</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-forest block">
              Anggaran Promo Aktif
            </span>
            <span className="metric-mono text-lg sm:text-xl font-bold text-forest mt-0.5 block">
              {formatIdr(totalBudget)}
            </span>
            <span className="text-[10px] text-stone-gray block">Alokasi digital & cetak</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 block">
              Target vs Realisasi Booking
            </span>
            <span className="metric-mono text-xl font-bold text-ink-black mt-0.5 block">
              {totalBookingsActual} / {totalBookingsTarget}{' '}
              <span className="text-xs text-stone-gray">Unit</span>
            </span>
            <span className="text-[10px] text-stone-gray block">
              {totalBookingsTarget > 0
                ? `${Math.round((totalBookingsActual / totalBookingsTarget) * 100)}% tercapai`
                : 'Belum ada target'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-black block">
              Eksekusi Materi
            </span>
            <Link
              href="/content/studio"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline mt-1 block"
            >
              <span>Marketing Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[10px] text-stone-gray block mt-0.5">
              Generator naskah & copy iklan
            </span>
          </div>
        </section>

        {/* Status Filter Tabs */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-warm-cream border border-sand-border rounded-full">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                statusFilter === 'all'
                  ? 'bg-ink-black text-paper-white'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              Semua ({campaigns.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                statusFilter === 'active'
                  ? 'bg-forest text-paper-white'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              Berjalan ({campaigns.filter((c) => c.status === 'active').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                statusFilter === 'draft'
                  ? 'bg-ink-black text-paper-white'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              Draf
            </button>
          </div>

          <span className="text-xs text-stone-gray font-semibold">
            Klik status aset untuk memperbarui progres
          </span>
        </div>

        {/* Campaign Cards List */}
        <div className="space-y-5">
          {filteredCampaigns.length === 0 && (
            <div className="card-clay p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-warm-cream border border-sand-border flex items-center justify-center mx-auto text-forest shadow-xs">
                <Megaphone className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-bold text-ink-black">
                  Belum Ada Data Kampanye Promo
                </h3>
                <p className="text-xs text-stone-gray leading-relaxed font-sans">
                  Seluruh data kampanye telah dikosongkan. Anda dapat mulai menambahkan rencana kampanye promo, alokasi anggaran, dan checklist materi promosi secara mandiri.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="btn-pill-primary text-xs py-2 px-4 bg-forest text-paper-white hover:bg-forest-emerald inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Kampanye Pertama</span>
              </button>
            </div>
          )}

          {filteredCampaigns.map((camp) => {
            const project = INITIAL_PROJECTS.find((p) => p.id === camp.project_id);
            const readyCount = camp.creative_assets.filter((a) => a.status === 'ready').length;
            const progressPct =
              camp.creative_assets.length > 0
                ? Math.round((readyCount / camp.creative_assets.length) * 100)
                : 0;

            return (
              <div
                key={camp.id}
                className="card-clay p-5 sm:p-6 space-y-5 border-sand-border hover:border-forest/40 transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          camp.status === 'active'
                            ? 'bg-forest-surface text-forest border border-forest-border'
                            : 'bg-warm-cream text-stone-gray border border-sand-border'
                        }`}
                      >
                        {camp.status === 'active' ? 'Sedang Berjalan' : camp.status}
                      </span>
                      {project && (
                        <span className="text-xs font-semibold text-stone-gray flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-forest" />
                          {project.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-ink-black">{camp.title}</h3>
                    <p className="text-xs font-bold text-forest italic">
                      &ldquo;{camp.tagline}&rdquo;
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] text-stone-gray font-bold uppercase tracking-wider block">
                      Periode Kampanye
                    </span>
                    <span className="metric-mono text-xs font-semibold text-ink-black block mt-0.5">
                      {camp.period_start} s/d {camp.period_end}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCampaign(camp.id)}
                      className="text-stone-gray hover:text-ember-orange text-xs flex items-center gap-1 sm:justify-end mt-1.5 transition-colors"
                      title="Hapus Kampanye"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>

                {/* Key Message Box */}
                <div className="p-3.5 rounded-xl bg-warm-cream border border-sand-border text-xs text-stone-gray leading-relaxed font-sans">
                  <strong className="text-ink-black font-semibold">Pesan Inti (Offer):</strong>{' '}
                  {camp.key_message}
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-warm-canvas border border-sand-border">
                  <div>
                    <span className="text-[10px] text-stone-gray uppercase tracking-wider font-semibold block">
                      Anggaran
                    </span>
                    <span className="metric-mono text-sm font-bold text-ink-black block mt-0.5">
                      {formatIdr(camp.budget_idr)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-gray uppercase tracking-wider font-semibold block">
                      Prospek Masuk
                    </span>
                    <span className="metric-mono text-sm font-bold text-forest block mt-0.5">
                      {camp.actual_leads} / {camp.target_leads}{' '}
                      <small className="text-[10px] text-stone-gray font-normal">leads</small>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-gray uppercase tracking-wider font-semibold block">
                      Realisasi Booking
                    </span>
                    <span className="metric-mono text-sm font-bold text-ink-black block mt-0.5">
                      {camp.actual_bookings} / {camp.target_bookings}{' '}
                      <small className="text-[10px] text-stone-gray font-normal">unit</small>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-gray uppercase tracking-wider font-semibold block">
                      Kesiapan Aset ({progressPct}%)
                    </span>
                    <div className="h-2 w-full rounded-full bg-sand-border mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-forest transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Integrated Creative Assets Checklist */}
                <div className="space-y-2.5 pt-2 border-t border-sand-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-ink-black uppercase tracking-wider block">
                      Checklist Aset Materi Promosi ({readyCount}/{camp.creative_assets.length} Siap)
                    </span>
                    <Link
                      href="/content/studio"
                      className="text-[11px] font-bold text-forest hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Buat Materi di Studio</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {camp.creative_assets.map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => handleToggleAssetStatus(camp.id, asset.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 select-none ${
                          asset.status === 'ready'
                            ? 'bg-forest-surface/60 border-forest-border text-ink-black'
                            : asset.status === 'in_progress'
                            ? 'bg-amber-50 border-amber-200 text-amber-950'
                            : 'bg-paper-white border-sand-border text-stone-gray'
                        }`}
                        title="Klik untuk mengubah status: Pending -> Dalam Proses -> Siap"
                      >
                        <div>
                          <span className="font-bold block text-ink-black">{asset.name}</span>
                          {asset.notes && (
                            <span className="text-[10px] text-stone-gray block mt-0.5">
                              {asset.notes}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                            asset.status === 'ready'
                              ? 'bg-forest text-paper-white'
                              : asset.status === 'in_progress'
                              ? 'bg-amber-600 text-paper-white'
                              : 'bg-warm-cream text-stone-gray'
                          }`}
                        >
                          {asset.status === 'ready'
                            ? 'Siap'
                            : asset.status === 'in_progress'
                            ? 'Proses'
                            : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Tambah Kampanye Baru */}
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Rencanakan Kampanye Promosi Baru"
        >
          <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
            <div>
              <label className="text-stone-gray font-bold uppercase tracking-wider block mb-1">
                Nama Kampanye Promo
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Gebyar Akhir Tahun Tanpa DP"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-xs font-semibold bg-warm-canvas border border-sand-border rounded-xl px-3 py-2 focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="text-stone-gray font-bold uppercase tracking-wider block mb-1">
                Tagline / Hook Promosi
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Miliki Rumah Subsidi Dekat Bandara Kualanamu, Bebas Biaya Akad"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full text-xs font-semibold bg-warm-canvas border border-sand-border rounded-xl px-3 py-2 focus:outline-none focus:border-forest"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-stone-gray font-bold uppercase tracking-wider block mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  required
                  value={formData.period_start}
                  onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                  className="w-full text-xs font-semibold bg-warm-canvas border border-sand-border rounded-xl px-3 py-2 focus:outline-none focus:border-forest"
                />
              </div>
              <div>
                <label className="text-stone-gray font-bold uppercase tracking-wider block mb-1">
                  Tanggal Berakhir
                </label>
                <input
                  type="date"
                  required
                  value={formData.period_end}
                  onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                  className="w-full text-xs font-semibold bg-warm-canvas border border-sand-border rounded-xl px-3 py-2 focus:outline-none focus:border-forest"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-stone-gray font-bold uppercase tracking-wider block mb-1">
                  Target Proyek
                </label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full text-xs font-semibold bg-warm-canvas border border-sand-border rounded-xl px-2.5 py-2 focus:outline-none focus:border-forest"
                >
                  {INITIAL_PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-stone-gray font-bold uppercase tracking-wider block mb-1">
                  Alokasi Anggaran (Rp)
                </label>
                <input
                  type="number"
                  step="500000"
                  required
                  value={formData.budget_idr}
                  onChange={(e) => setFormData({ ...formData, budget_idr: Number(e.target.value) })}
                  className="w-full text-xs font-semibold bg-warm-canvas border border-sand-border rounded-xl px-3 py-2 focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="text-stone-gray font-bold uppercase tracking-wider block mb-1">
                  Target Booking
                </label>
                <input
                  type="number"
                  required
                  value={formData.target_bookings}
                  onChange={(e) =>
                    setFormData({ ...formData, target_bookings: Number(e.target.value) })
                  }
                  className="w-full text-xs font-semibold bg-warm-canvas border border-sand-border rounded-xl px-3 py-2 focus:outline-none focus:border-forest"
                />
              </div>
            </div>

            <div>
              <label className="text-stone-gray font-bold uppercase tracking-wider block mb-1">
                Pesan Utama / Offer Promosi
              </label>
              <textarea
                rows={3}
                required
                placeholder="Rincian promo: DP nol, free BPHTB, subsidi biaya notaris, atau hadiah elektronik..."
                value={formData.key_message}
                onChange={(e) => setFormData({ ...formData, key_message: e.target.value })}
                className="w-full text-xs font-semibold bg-warm-canvas border border-sand-border rounded-xl px-3 py-2 focus:outline-none focus:border-forest font-sans"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-sand-border">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-pill-ghost text-xs py-2 px-4"
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-pill-primary text-xs py-2 px-5 bg-forest text-paper-white hover:bg-forest-emerald"
              >
                Simpan & Aktifkan Kampanye
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
