'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  INITIAL_UNIT_SNAPSHOTS,
  INITIAL_KOS_SNAPSHOTS,
} from '@/lib/data/seed-data';
import { Project, UnitSnapshot, KosSnapshot } from '@/lib/types/database';
import {
  ArrowLeft,
  AlertTriangle,
  PlusCircle,
  X,
  History,
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

  // State for snapshots
  const [housingSnapshots, setHousingSnapshots] = useState<UnitSnapshot[]>(
    INITIAL_UNIT_SNAPSHOTS[project.id] || []
  );
  const [kosSnapshots, setKosSnapshots] = useState<KosSnapshot[]>(
    INITIAL_KOS_SNAPSHOTS[project.id] || []
  );

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDate, setNewDate] = useState('2026-10-13');

  // Form state for housing
  const latestHousing = housingSnapshots[0];
  const [formHousing, setFormHousing] = useState({
    belum_terjual: latestHousing?.belum_terjual ?? 0,
    booking: latestHousing?.booking ?? 0,
    sp3k: latestHousing?.sp3k ?? 0,
    akad_kredit: latestHousing?.akad_kredit ?? 0,
    cash_keras: latestHousing?.cash_keras ?? 0,
    hold_manajemen: latestHousing?.hold_manajemen ?? 0,
  });

  // Form state for kos
  const latestKos = kosSnapshots[0];
  const [formKos, setFormKos] = useState({
    terisi: latestKos?.terisi ?? 0,
    belum_terisi: latestKos?.belum_terisi ?? 0,
    booking_hold: latestKos?.booking_hold ?? 0,
  });

  // Housing calculations
  const housingAllocated = latestHousing
    ? latestHousing.belum_terjual +
      latestHousing.booking +
      latestHousing.sp3k +
      latestHousing.akad_kredit +
      latestHousing.cash_keras +
      latestHousing.hold_manajemen
    : 0;

  const housingUnallocated = project.total_units - housingAllocated;

  // New form preview calculation
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
        id: `us-${Date.now()}`,
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
      setHousingSnapshots([newSnap, ...housingSnapshots]);
    } else if (isKos) {
      const newSnap: KosSnapshot = {
        id: `ks-${Date.now()}`,
        project_id: project.id,
        snapshot_date: newDate,
        terisi: Number(formKos.terisi),
        belum_terisi: Number(formKos.belum_terisi),
        booking_hold: Number(formKos.booking_hold),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setKosSnapshots([newSnap, ...kosSnapshots]);
    }
    setIsModalOpen(false);
  };

  // Funnel chart data
  const funnelData = latestHousing
    ? [
        { stage: 'Belum Terjual', count: latestHousing.belum_terjual, color: '#9f9b93' },
        { stage: 'Booking Unit', count: latestHousing.booking, color: '#ff7614' },
        { stage: 'Proses SP3K', count: latestHousing.sp3k, color: '#429dff' },
        { stage: 'Akad Kredit', count: latestHousing.akad_kredit, color: '#02693e' },
        { stage: 'Cash Keras', count: latestHousing.cash_keras, color: '#0ec5b0' },
        { stage: 'Hold Manajemen', count: latestHousing.hold_manajemen, color: '#8b045c' },
      ]
    : [];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back Link & Header */}
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-gray hover:text-ink-black mb-3 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Proyek</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-warm-cream border border-sand-border text-stone-gray">
                  {project.kind === 'active_project' ? 'Perumahan Subsidi' : 'Unit Bisnis'}
                </span>
                <span className="text-xs text-stone-gray font-medium">📍 {project.location}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-black flex items-center gap-2.5">
                <span>{project.name}</span>
                {project.instagram_handle && (
                  <a
                    href={`https://instagram.com/${project.instagram_handle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-stone-gray hover:text-pink-600 transition"
                  >
                    <InstagramIcon className="w-5 h-5" />
                  </a>
                )}
              </h1>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-pill-primary text-xs sm:text-sm inline-flex items-center gap-2 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Perbarui Inventori (Catat Snapshot)</span>
            </button>
          </div>
        </div>

        {/* UNALLOCATED WARNING BADGE (Strict Requirement) */}
        {isHousing && housingUnallocated !== 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">
                Peringatan: Terdapat {housingUnallocated} {project.unit_label} Belum Teralokasi (Unallocated)!
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Total unit terdaftar adalah <strong>{project.total_units} {project.unit_label}</strong>, namun jumlah status saat ini hanya <strong>{housingAllocated} {project.unit_label}</strong>. Sistem tidak mengubah angka secara otomatis. Harap verifikasi ketersediaan fisik di lapangan.
              </p>
            </div>
          </div>
        )}

        {/* Housing Funnel & Status KPI Cards */}
        {isHousing && latestHousing && (
          <div className="space-y-6">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-2xl bg-paper-white border border-sand-border text-center">
                <span className="text-[11px] font-medium text-ash-gray uppercase block">Tersedia</span>
                <span className="text-xl font-bold text-ink-black mt-1 block">
                  {latestHousing.belum_terjual}
                </span>
                <span className="text-[10px] text-stone-gray">Belum Terjual</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-paper-white border border-sand-border text-center">
                <span className="text-[11px] font-medium text-amber-600 uppercase block">Booking</span>
                <span className="text-xl font-bold text-amber-700 mt-1 block">
                  {latestHousing.booking}
                </span>
                <span className="text-[10px] text-stone-gray">Tanda Jadi</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-paper-white border border-sand-border text-center">
                <span className="text-[11px] font-medium text-sky-600 uppercase block">SP3K</span>
                <span className="text-xl font-bold text-sky-700 mt-1 block">
                  {latestHousing.sp3k}
                </span>
                <span className="text-[10px] text-stone-gray">Lolos Berkas</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-center">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">Akad Kredit</span>
                <span className="text-xl font-bold text-emerald-900 mt-1 block">
                  {latestHousing.akad_kredit}
                </span>
                <span className="text-[10px] text-emerald-700">KPR Realisasi</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-paper-white border border-sand-border text-center">
                <span className="text-[11px] font-medium text-teal-600 uppercase block">Cash Keras</span>
                <span className="text-xl font-bold text-teal-700 mt-1 block">
                  {latestHousing.cash_keras}
                </span>
                <span className="text-[10px] text-stone-gray">Lunas Tunai</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-paper-white border border-sand-border text-center">
                <span className="text-[11px] font-medium text-rose-600 uppercase block">Hold</span>
                <span className="text-xl font-bold text-rose-700 mt-1 block">
                  {latestHousing.hold_manajemen}
                </span>
                <span className="text-[10px] text-stone-gray">Manajemen</span>
              </div>
            </div>

            {/* Visual Funnel Bar Chart */}
            <div className="p-5 sm:p-6 rounded-[24px] bg-paper-white border border-sand-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-base text-ink-black">Grafik Funnel Penjualan</h2>
                  <p className="text-xs text-stone-gray">
                    Distribusi alokasi unit pada snapshot tanggal {latestHousing.snapshot_date}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-gray block">Total Unit</span>
                  <span className="text-sm font-bold text-ink-black">{project.total_units} unit</span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ left: 30, right: 20 }}>
                    <XAxis type="number" stroke="#9f9b93" fontSize={11} />
                    <YAxis dataKey="stage" type="category" stroke="#000000" fontSize={11} width={100} />
                    <Tooltip
                      formatter={(value) => [`${value ?? 0} unit`, 'Jumlah']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #dad4c8',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Snapshot History Table */}
            <div className="p-5 sm:p-6 rounded-[24px] bg-paper-white border border-sand-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-stone-gray" />
                  <h2 className="font-bold text-base text-ink-black">Riwayat Snapshot Inventori</h2>
                </div>
                <span className="text-xs text-stone-gray">
                  {housingSnapshots.length} catatan tersimpan
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-sand-border text-ash-gray uppercase font-semibold text-[10px]">
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">Belum Terjual</th>
                      <th className="py-2.5 px-3">Booking</th>
                      <th className="py-2.5 px-3">SP3K</th>
                      <th className="py-2.5 px-3">Akad Kredit</th>
                      <th className="py-2.5 px-3">Cash</th>
                      <th className="py-2.5 px-3">Hold</th>
                      <th className="py-2.5 px-3">Total Alokasi</th>
                      <th className="py-2.5 px-3">Unallocated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cool-mist">
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
                        <tr key={snap.id} className={idx === 0 ? 'bg-warm-cream/50 font-medium' : ''}>
                          <td className="py-2.5 px-3 font-semibold text-ink-black">
                            {snap.snapshot_date} {idx === 0 && <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">TERKINI</span>}
                          </td>
                          <td className="py-2.5 px-3">{snap.belum_terjual}</td>
                          <td className="py-2.5 px-3">{snap.booking}</td>
                          <td className="py-2.5 px-3">{snap.sp3k}</td>
                          <td className="py-2.5 px-3 text-emerald-700 font-semibold">{snap.akad_kredit}</td>
                          <td className="py-2.5 px-3">{snap.cash_keras}</td>
                          <td className="py-2.5 px-3">{snap.hold_manajemen}</td>
                          <td className="py-2.5 px-3 font-bold text-ink-black">{totalAlloc}</td>
                          <td className="py-2.5 px-3">
                            {unalloc !== 0 ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
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
        )}

        {/* CozyKOS Detail View */}
        {isKos && latestKos && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs font-semibold text-emerald-700 uppercase">Kamar Terisi</span>
                <span className="text-3xl font-bold text-emerald-900 mt-2 block">{latestKos.terisi}</span>
                <span className="text-xs text-emerald-700 mt-1 block">
                  Okupansi {Math.round((latestKos.terisi / project.total_units) * 100)}%
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-paper-white border border-sand-border text-center">
                <span className="text-xs font-semibold text-stone-gray uppercase">Kamar Kosong</span>
                <span className="text-3xl font-bold text-ink-black mt-2 block">{latestKos.belum_terisi}</span>
                <span className="text-xs text-stone-gray mt-1 block">Siap disewakan</span>
              </div>
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-xs font-semibold text-amber-800 uppercase">Booking / Hold</span>
                <span className="text-3xl font-bold text-amber-900 mt-2 block">{latestKos.booking_hold}</span>
                <span className="text-xs text-amber-700 mt-1 block">Menunggu check-in</span>
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-[24px] bg-paper-white border border-sand-border space-y-4">
              <h2 className="font-bold text-base text-ink-black">Riwayat Okupansi Kos</h2>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-sand-border text-ash-gray uppercase font-semibold text-[10px]">
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Terisi</th>
                    <th className="py-2.5 px-3">Belum Terisi</th>
                    <th className="py-2.5 px-3">Booking / Hold</th>
                    <th className="py-2.5 px-3">Total Kamar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cool-mist">
                  {kosSnapshots.map((snap, idx) => (
                    <tr key={snap.id} className={idx === 0 ? 'bg-warm-cream/50 font-medium' : ''}>
                      <td className="py-2.5 px-3 font-semibold text-ink-black">{snap.snapshot_date}</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-bold">{snap.terisi}</td>
                      <td className="py-2.5 px-3">{snap.belum_terisi}</td>
                      <td className="py-2.5 px-3">{snap.booking_hold}</td>
                      <td className="py-2.5 px-3 font-bold">{project.total_units}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal "Update Inventory" */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-paper-white border border-sand-border rounded-[28px] max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-sand-border mb-4">
                <div>
                  <h3 className="font-bold text-lg text-ink-black">Catat Snapshot Inventori Baru</h3>
                  <p className="text-xs text-stone-gray">Proyek: {project.name}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full text-stone-gray hover:text-ink-black hover:bg-warm-cream"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSnapshot} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-gray uppercase tracking-wider mb-1">
                    Tanggal Snapshot
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-cool-mist bg-paper-white text-ink-black text-sm focus:outline-none focus:border-ink-black"
                  />
                </div>

                {isHousing && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-gray mb-1">
                          Belum Terjual
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formHousing.belum_terjual}
                          onChange={(e) =>
                            setFormHousing({ ...formHousing, belum_terjual: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-cool-mist text-sm font-semibold focus:outline-none focus:border-ink-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-gray mb-1">
                          Booking Unit
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formHousing.booking}
                          onChange={(e) =>
                            setFormHousing({ ...formHousing, booking: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-cool-mist text-sm font-semibold focus:outline-none focus:border-ink-black"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-gray mb-1">
                          Lolos SP3K
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formHousing.sp3k}
                          onChange={(e) =>
                            setFormHousing({ ...formHousing, sp3k: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-cool-mist text-sm font-semibold focus:outline-none focus:border-ink-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-800 mb-1">
                          Akad Kredit (KPR)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formHousing.akad_kredit}
                          onChange={(e) =>
                            setFormHousing({ ...formHousing, akad_kredit: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-sm font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-gray mb-1">
                          Cash Keras
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formHousing.cash_keras}
                          onChange={(e) =>
                            setFormHousing({ ...formHousing, cash_keras: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-cool-mist text-sm font-semibold focus:outline-none focus:border-ink-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-gray mb-1">
                          Hold Manajemen
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formHousing.hold_manajemen}
                          onChange={(e) =>
                            setFormHousing({ ...formHousing, hold_manajemen: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-cool-mist text-sm font-semibold focus:outline-none focus:border-ink-black"
                        />
                      </div>
                    </div>

                    {/* Live preview check */}
                    <div className="p-3 rounded-xl bg-warm-cream border border-sand-border text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-gray">Total Dialokasikan:</span>
                        <span className="font-bold text-ink-black">{previewAllocated} unit</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-gray">Kapasitas Proyek:</span>
                        <span className="font-bold text-ink-black">{project.total_units} unit</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-cool-mist">
                        <span className="font-medium text-stone-gray">Unallocated:</span>
                        <span className={`font-bold ${previewUnallocated !== 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {previewUnallocated} unit {previewUnallocated !== 0 && '(Akan menampilkan peringatan)'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {isKos && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-800 mb-1">
                        Kamar Terisi
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formKos.terisi}
                        onChange={(e) => setFormKos({ ...formKos, terisi: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-cool-mist text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-gray mb-1">
                        Kamar Belum Terisi
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formKos.belum_terisi}
                        onChange={(e) => setFormKos({ ...formKos, belum_terisi: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-cool-mist text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-gray mb-1">
                        Booking / Hold
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formKos.booking_hold}
                        onChange={(e) => setFormKos({ ...formKos, booking_hold: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-cool-mist text-sm font-semibold"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-full border border-sand-border text-xs font-semibold text-stone-gray hover:bg-warm-cream"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full bg-ink-black text-paper-white text-xs font-semibold hover:opacity-90"
                  >
                    Simpan Snapshot
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
