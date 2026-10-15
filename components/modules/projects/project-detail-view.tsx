'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Modal } from '@/components/ui/modal';
import { getClientTodayString } from '@/lib/utils/date-utils';
import {
  INITIAL_UNIT_SNAPSHOTS,
  INITIAL_KOS_SNAPSHOTS,
} from '@/lib/data/seed-data';
import { Project, UnitSnapshot, KosSnapshot } from '@/lib/types/database';
import { usePersistentState, STORAGE_KEYS, generateUUID } from '@/lib/storage/persistence';
import {
  ArrowLeft,
  AlertTriangle,
  Plus,
  History,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { InstagramIcon } from '@/components/shared/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ProjectDetailViewProps {
  project: Project;
}

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const isHousing = project.kind === 'active_project';
  const isKos = project.kind === 'business_unit';

  const [allHousingSnapshots, setAllHousingSnapshots] = usePersistentState<
    Record<string, UnitSnapshot[]>
  >(STORAGE_KEYS.HOUSING_SNAPSHOTS, INITIAL_UNIT_SNAPSHOTS);
  const [allKosSnapshots, setAllKosSnapshots] = usePersistentState<
    Record<string, KosSnapshot[]>
  >(STORAGE_KEYS.KOS_SNAPSHOTS, INITIAL_KOS_SNAPSHOTS);

  const housingSnapshots = allHousingSnapshots[project.id] || [];
  const kosSnapshots = allKosSnapshots[project.id] || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDate, setNewDate] = useState('2026-10-13');

  useEffect(() => {
    setNewDate(getClientTodayString());
  }, []);

  const latestHousing = housingSnapshots[0];
  const [formHousing, setFormHousing] = useState({
    belum_terjual: latestHousing?.belum_terjual ?? 0,
    booking: latestHousing?.booking ?? 0,
    sp3k: latestHousing?.sp3k ?? 0,
    akad_kredit: latestHousing?.akad_kredit ?? 0,
    cash_keras: latestHousing?.cash_keras ?? 0,
    hold_manajemen: latestHousing?.hold_manajemen ?? 0,
  });

  const latestKos = kosSnapshots[0];
  const [formKos, setFormKos] = useState({
    terisi: latestKos?.terisi ?? 0,
    belum_terisi: latestKos?.belum_terisi ?? 0,
    booking_hold: latestKos?.booking_hold ?? 0,
  });

  const housingAllocated = latestHousing
    ? latestHousing.belum_terjual +
      latestHousing.booking +
      latestHousing.sp3k +
      latestHousing.akad_kredit +
      latestHousing.cash_keras +
      latestHousing.hold_manajemen
    : 0;

  const housingUnallocated = project.total_units - housingAllocated;

  const previewAllocated =
    formHousing.belum_terjual +
    formHousing.booking +
    formHousing.sp3k +
    formHousing.akad_kredit +
    formHousing.cash_keras +
    formHousing.hold_manajemen;
  const previewUnallocated = project.total_units - previewAllocated;

  const handleSaveSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (isHousing) {
      const newSnap: UnitSnapshot = {
        id: generateUUID(),
        project_id: project.id,
        snapshot_date: newDate,
        belum_terjual: Number(formHousing.belum_terjual),
        booking: Number(formHousing.booking),
        sp3k: Number(formHousing.sp3k),
        akad_kredit: Number(formHousing.akad_kredit),
        cash_keras: Number(formHousing.cash_keras),
        hold_manajemen: Number(formHousing.hold_manajemen),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setAllHousingSnapshots((prev) => ({
        ...prev,
        [project.id]: [newSnap, ...(prev[project.id] || [])],
      }));
    } else if (isKos) {
      const newSnap: KosSnapshot = {
        id: generateUUID(),
        project_id: project.id,
        snapshot_date: newDate,
        terisi: Number(formKos.terisi),
        belum_terisi: Number(formKos.belum_terisi),
        booking_hold: Number(formKos.booking_hold),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setAllKosSnapshots((prev) => ({
        ...prev,
        [project.id]: [newSnap, ...(prev[project.id] || [])],
      }));
    }
    setIsModalOpen(false);
  };

  const funnelData = latestHousing
    ? [
        { stage: 'Belum Terjual', count: latestHousing.belum_terjual, color: '#6e6a63' },
        { stage: 'Booking Unit', count: latestHousing.booking, color: '#c2410c' },
        { stage: 'Proses SP3K', count: latestHousing.sp3k, color: '#2b4be0' },
        { stage: 'Akad Kredit', count: latestHousing.akad_kredit, color: '#02693e' },
        { stage: 'Cash Keras', count: latestHousing.cash_keras, color: '#0b7a6e' },
        { stage: 'Hold Manajemen', count: latestHousing.hold_manajemen, color: '#1d1d1b' },
      ]
    : [];

  return (
    <AppShell>
      <div className="space-y-7">
        {/* Back Link & Header */}
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-gray hover:text-ink-black mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Proyek</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-sand-border">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-gray">
                <span className="font-semibold uppercase tracking-[0.05em] text-ash-gray">
                  {project.kind === 'active_project' ? 'Perumahan Subsidi' : 'Entitas Korporat'}
                </span>
                <span aria-hidden="true" className="text-sand-border">
                  /
                </span>
                <span className="inline-flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-ash-gray" />
                  <span>{project.location}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-[32px] font-bold tracking-tight text-ink-black">
                  {project.name}
                </h1>
                {project.instagram_handle && (
                  <a
                    href={`https://instagram.com/${project.instagram_handle}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Instagram ${project.name}`}
                    className="min-w-9 min-h-9 rounded-full bg-warm-cream border border-sand-border inline-flex items-center justify-center text-stone-gray hover:text-ink-black transition-colors"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {isHousing && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="btn-pill-primary self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Snapshot Inventaris</span>
              </button>
            )}
          </div>
        </div>

        {/* Mandatory Unallocated Reconciliation Banner */}
        {isHousing && housingUnallocated !== 0 && (
          <div className="p-5 rounded-2xl bg-ember-surface border border-ember-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-ember-orange shrink-0 mt-0.5" />
              <div>
                <h2 className="font-bold text-sm text-ink-black">
                  Peringatan Rekonsiliasi: <span className="metric-mono text-ember-orange">{housingUnallocated} {project.unit_label}</span> Belum Teralokasi (Unallocated)
                </h2>
                <p className="text-xs text-slate-gray mt-1 leading-relaxed max-w-2xl">
                  Kapasitas master proyek adalah <strong className="metric-mono">{project.total_units} {project.unit_label}</strong>, sedangkan jumlah unit pada 6 tahapan funnel saat ini adalah <strong className="metric-mono">{housingAllocated} {project.unit_label}</strong>. Sistem menjaga integritas angka asli tanpa pembulatan otomatis.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-pill-primary shrink-0 self-start sm:self-center"
            >
              <span>Sesuaikan Snapshot</span>
            </button>
          </div>
        )}

        {/* Housing Funnel & Status Matrix */}
        {isHousing && latestHousing && (
          <div className="space-y-6">
            {/* Unified Tactile Inventory Ledger Strip */}
            <section className="card-cream p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-sand-border">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ash-gray block">
                    Posisi Funnel Terkini ({latestHousing.snapshot_date})
                  </span>
                  <h2 className="text-base font-bold text-ink-black mt-0.5">
                    Rincian 6 Tahapan Alokasi Unit
                  </h2>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="metric-mono font-semibold text-stone-gray">
                    Teralokasi: <strong className="text-ink-black">{housingAllocated}</strong> / {project.total_units} unit
                  </span>
                  {housingUnallocated === 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-forest-surface text-forest border border-forest-border font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Balance</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-xl bg-paper-white border border-sand-border">
                  <span className="text-[11px] font-semibold text-ash-gray uppercase block">
                    Belum Terjual
                  </span>
                  <span className="metric-mono text-2xl font-bold text-ink-black mt-1 block">
                    {latestHousing.belum_terjual}
                  </span>
                  <span className="text-[11px] text-stone-gray">Stok Bebas</span>
                </div>

                <div className="p-3.5 rounded-xl bg-paper-white border border-sand-border">
                  <span className="text-[11px] font-semibold text-ember-orange uppercase block">
                    Booking
                  </span>
                  <span className="metric-mono text-2xl font-bold text-ink-black mt-1 block">
                    {latestHousing.booking}
                  </span>
                  <span className="text-[11px] text-stone-gray">Tanda Jadi</span>
                </div>

                <div className="p-3.5 rounded-xl bg-paper-white border border-sand-border">
                  <span className="text-[11px] font-semibold text-violet-pulse uppercase block">
                    SP3K
                  </span>
                  <span className="metric-mono text-2xl font-bold text-ink-black mt-1 block">
                    {latestHousing.sp3k}
                  </span>
                  <span className="text-[11px] text-stone-gray">Persetujuan Bank</span>
                </div>

                <div className="p-3.5 rounded-xl bg-forest-surface border border-forest-border">
                  <span className="text-[11px] font-bold text-forest uppercase block">
                    Akad Kredit
                  </span>
                  <span className="metric-mono text-2xl font-bold text-forest mt-1 block">
                    {latestHousing.akad_kredit}
                  </span>
                  <span className="text-[11px] text-forest">Realisasi KPR</span>
                </div>

                <div className="p-3.5 rounded-xl bg-paper-white border border-sand-border">
                  <span className="text-[11px] font-semibold text-teal-mark uppercase block">
                    Cash Keras
                  </span>
                  <span className="metric-mono text-2xl font-bold text-ink-black mt-1 block">
                    {latestHousing.cash_keras}
                  </span>
                  <span className="text-[11px] text-stone-gray">Lunas Tunai</span>
                </div>

                <div className="p-3.5 rounded-xl bg-paper-white border border-sand-border">
                  <span className="text-[11px] font-semibold text-stone-gray uppercase block">
                    Hold
                  </span>
                  <span className="metric-mono text-2xl font-bold text-ink-black mt-1 block">
                    {latestHousing.hold_manajemen}
                  </span>
                  <span className="text-[11px] text-stone-gray">Cadangan Manajemen</span>
                </div>
              </div>
            </section>

            {/* Two-Column Split: Visual Chart & Snapshot Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 card-clay p-5 flex flex-col justify-between">
                <div className="mb-4">
                  <h2 className="font-bold text-base text-ink-black">
                    Proporsi Tahapan Funnel
                  </h2>
                  <p className="text-xs text-stone-gray">
                    Distribusi visual per status inventaris ({latestHousing.snapshot_date})
                  </p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={funnelData}
                      layout="vertical"
                      margin={{ left: 20, right: 16 }}
                    >
                      <XAxis type="number" stroke="#6e6a63" fontSize={11} />
                      <YAxis
                        dataKey="stage"
                        type="category"
                        stroke="#000000"
                        fontSize={11}
                        width={105}
                      />
                      <Tooltip
                        formatter={(value) => [`${value ?? 0} unit`, 'Jumlah']}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #dad4c8',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-7 card-clay p-0 overflow-hidden flex flex-col">
                <div className="px-5 py-4 bg-warm-cream border-b border-sand-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-ink-black" />
                    <h2 className="font-bold text-base text-ink-black">
                      Riwayat Snapshot Inventaris
                    </h2>
                  </div>
                  <span className="metric-mono text-xs text-stone-gray">
                    {housingSnapshots.length} catatan
                  </span>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-sand-border bg-warm-cream/50 text-ash-gray uppercase font-semibold text-[10px]">
                        <th className="py-3 px-4">Tanggal</th>
                        <th className="py-3 px-2.5 text-right">Tersedia</th>
                        <th className="py-3 px-2.5 text-right">Book</th>
                        <th className="py-3 px-2.5 text-right">SP3K</th>
                        <th className="py-3 px-2.5 text-right">Akad</th>
                        <th className="py-3 px-2.5 text-right">Cash</th>
                        <th className="py-3 px-2.5 text-right">Hold</th>
                        <th className="py-3 px-3 text-right">Alokasi</th>
                        <th className="py-3 px-4 text-right">Selisih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand-border">
                      {housingSnapshots.map((snap, idx) => {
                        const totalAlloc =
                          snap.belum_terjual +
                          snap.booking +
                          snap.sp3k +
                          snap.akad_kredit +
                          snap.cash_keras +
                          snap.hold_manajemen;
                        const unalloc = project.total_units - totalAlloc;

                        return (
                          <tr
                            key={snap.id}
                            className={idx === 0 ? 'bg-warm-cream/60 font-medium' : ''}
                          >
                            <td className="py-3 px-4 metric-mono font-semibold text-ink-black">
                              <span>{snap.snapshot_date}</span>
                              {idx === 0 && (
                                <span className="ml-2 text-[9px] font-sans font-bold text-forest bg-forest-surface border border-forest-border px-1.5 py-0.5 rounded">
                                  AKTIF
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2.5 text-right metric-mono">
                              {snap.belum_terjual}
                            </td>
                            <td className="py-3 px-2.5 text-right metric-mono">
                              {snap.booking}
                            </td>
                            <td className="py-3 px-2.5 text-right metric-mono">
                              {snap.sp3k}
                            </td>
                            <td className="py-3 px-2.5 text-right metric-mono font-bold text-forest">
                              {snap.akad_kredit}
                            </td>
                            <td className="py-3 px-2.5 text-right metric-mono">
                              {snap.cash_keras}
                            </td>
                            <td className="py-3 px-2.5 text-right metric-mono">
                              {snap.hold_manajemen}
                            </td>
                            <td className="py-3 px-3 text-right metric-mono font-bold text-ink-black">
                              {totalAlloc}
                            </td>
                            <td className="py-3 px-4 text-right metric-mono">
                              {unalloc !== 0 ? (
                                <span className="px-2 py-0.5 rounded-full bg-ember-surface text-ember-orange border border-ember-border font-bold">
                                  {unalloc}
                                </span>
                              ) : (
                                <span className="text-stone-gray">0</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Corporate / Business Unit Detail View */}
        {isKos && (
          <div className="card-clay p-6 space-y-4">
            <h2 className="text-base font-bold text-ink-black">
              Profil Entitas Korporat
            </h2>
            <p className="text-xs sm:text-sm text-stone-gray max-w-2xl leading-relaxed">
              Entitas induk PT Sedaya Property yang menaungi komunikasi korporat, portal website utama, dan koordinasi lintas proyek di wilayah Medan serta Deli Serdang.
            </p>
            {latestKos && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-warm-cream border border-sand-border">
                  <span className="text-xs font-semibold text-stone-gray block">Terisi</span>
                  <span className="metric-mono text-2xl font-bold text-ink-black mt-1 block">
                    {latestKos.terisi}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-warm-cream border border-sand-border">
                  <span className="text-xs font-semibold text-stone-gray block">Kosong</span>
                  <span className="metric-mono text-2xl font-bold text-ink-black mt-1 block">
                    {latestKos.belum_terisi}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-warm-cream border border-sand-border">
                  <span className="text-xs font-semibold text-stone-gray block">Booking / Hold</span>
                  <span className="metric-mono text-2xl font-bold text-ink-black mt-1 block">
                    {latestKos.booking_hold}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Accessible Modal for Updating Inventory Snapshot */}
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Catat Snapshot Inventaris Baru"
          subtitle={`Proyek: ${project.name} (Master: ${project.total_units} ${project.unit_label})`}
        >
          <form onSubmit={handleSaveSnapshot} className="space-y-4">
            <div>
              <label
                htmlFor="snap-date"
                className="block text-xs font-semibold text-ink-black mb-1"
              >
                Tanggal Snapshot
              </label>
              <input
                id="snap-date"
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="input-clay metric-mono"
              />
            </div>

            {isHousing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="snap-available"
                      className="block text-xs font-semibold text-stone-gray mb-1"
                    >
                      Belum Terjual
                    </label>
                    <input
                      id="snap-available"
                      type="number"
                      min="0"
                      value={formHousing.belum_terjual}
                      onChange={(e) =>
                        setFormHousing({
                          ...formHousing,
                          belum_terjual: Number(e.target.value),
                        })
                      }
                      className="input-clay metric-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="snap-booking"
                      className="block text-xs font-semibold text-stone-gray mb-1"
                    >
                      Booking Unit
                    </label>
                    <input
                      id="snap-booking"
                      type="number"
                      min="0"
                      value={formHousing.booking}
                      onChange={(e) =>
                        setFormHousing({
                          ...formHousing,
                          booking: Number(e.target.value),
                        })
                      }
                      className="input-clay metric-mono font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="snap-sp3k"
                      className="block text-xs font-semibold text-stone-gray mb-1"
                    >
                      Lolos SP3K
                    </label>
                    <input
                      id="snap-sp3k"
                      type="number"
                      min="0"
                      value={formHousing.sp3k}
                      onChange={(e) =>
                        setFormHousing({
                          ...formHousing,
                          sp3k: Number(e.target.value),
                        })
                      }
                      className="input-clay metric-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="snap-akad"
                      className="block text-xs font-bold text-forest mb-1"
                    >
                      Akad Kredit (KPR)
                    </label>
                    <input
                      id="snap-akad"
                      type="number"
                      min="0"
                      value={formHousing.akad_kredit}
                      onChange={(e) =>
                        setFormHousing({
                          ...formHousing,
                          akad_kredit: Number(e.target.value),
                        })
                      }
                      className="input-clay metric-mono font-bold bg-forest-surface border-forest-border text-forest"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="snap-cash"
                      className="block text-xs font-semibold text-stone-gray mb-1"
                    >
                      Cash Keras
                    </label>
                    <input
                      id="snap-cash"
                      type="number"
                      min="0"
                      value={formHousing.cash_keras}
                      onChange={(e) =>
                        setFormHousing({
                          ...formHousing,
                          cash_keras: Number(e.target.value),
                        })
                      }
                      className="input-clay metric-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="snap-hold"
                      className="block text-xs font-semibold text-stone-gray mb-1"
                    >
                      Hold Manajemen
                    </label>
                    <input
                      id="snap-hold"
                      type="number"
                      min="0"
                      value={formHousing.hold_manajemen}
                      onChange={(e) =>
                        setFormHousing({
                          ...formHousing,
                          hold_manajemen: Number(e.target.value),
                        })
                      }
                      className="input-clay metric-mono font-semibold"
                    />
                  </div>
                </div>

                {/* Live Reconciliation Calculator */}
                <div className="p-3.5 rounded-xl bg-warm-cream border border-sand-border text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-stone-gray">Total Teralokasi:</span>
                    <span className="metric-mono font-bold text-ink-black">
                      {previewAllocated} unit
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-gray">Kapasitas Master:</span>
                    <span className="metric-mono font-bold text-ink-black">
                      {project.total_units} unit
                    </span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-sand-border">
                    <span className="font-semibold text-ink-black">
                      Selisih (Unallocated):
                    </span>
                    <span
                      className={`metric-mono font-bold ${
                        previewUnallocated !== 0 ? 'text-ember-orange' : 'text-forest'
                      }`}
                    >
                      {previewUnallocated} unit
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="kos-terisi"
                    className="block text-xs font-semibold text-stone-gray mb-1"
                  >
                    Kamar Terisi
                  </label>
                  <input
                    id="kos-terisi"
                    type="number"
                    min="0"
                    value={formKos.terisi}
                    onChange={(e) =>
                      setFormKos({ ...formKos, terisi: Number(e.target.value) })
                    }
                    className="input-clay metric-mono font-semibold"
                  />
                </div>
                <div>
                  <label
                    htmlFor="kos-kosong"
                    className="block text-xs font-semibold text-stone-gray mb-1"
                  >
                    Kamar Kosong
                  </label>
                  <input
                    id="kos-kosong"
                    type="number"
                    min="0"
                    value={formKos.belum_terisi}
                    onChange={(e) =>
                      setFormKos({
                        ...formKos,
                        belum_terisi: Number(e.target.value),
                      })
                    }
                    className="input-clay metric-mono font-semibold"
                  />
                </div>
                <div>
                  <label
                    htmlFor="kos-hold"
                    className="block text-xs font-semibold text-stone-gray mb-1"
                  >
                    Booking / Hold
                  </label>
                  <input
                    id="kos-hold"
                    type="number"
                    min="0"
                    value={formKos.booking_hold}
                    onChange={(e) =>
                      setFormKos({
                        ...formKos,
                        booking_hold: Number(e.target.value),
                      })
                    }
                    className="input-clay metric-mono font-semibold"
                  />
                </div>
              </div>
            )}

            <div className="pt-3 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-pill-ghost"
              >
                Batal
              </button>
              <button type="submit" className="btn-pill-primary">
                Simpan Snapshot
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
