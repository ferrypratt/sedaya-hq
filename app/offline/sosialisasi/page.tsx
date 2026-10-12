'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { OfflineNavTabs } from '@/components/modules/offline/offline-nav-tabs';
import { INITIAL_SOSIALISASI_ASSISTS } from '@/lib/data/seed-offline';
import { INITIAL_PROJECTS, INITIAL_PROFILES } from '@/lib/data/seed-data';
import { SosialisasiAssist } from '@/lib/types/database';
import {
  Users,
  PlusCircle,
  Calendar,
  MapPin,
  Building2,
  ExternalLink,
  X,
  Sparkles,
} from 'lucide-react';

let nextSosialisasiCounter = 100;
function generateSosialisasiId(): string {
  nextSosialisasiCounter += 1;
  return `sos-${nextSosialisasiCounter}`;
}

export default function SosialisasiPage() {
  const [assists, setAssists] = useState<SosialisasiAssist[]>(INITIAL_SOSIALISASI_ASSISTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    institution: '',
    location: '',
    activity_date: '2026-10-18',
    project_id: INITIAL_PROJECTS[1].id,
    expected_attendees: '',
    actual_attendees: '',
    support_provided: '',
    outcome: '',
    status: 'terjadwal',
    pic_id: INITIAL_PROFILES[0].id,
  });

  const totalActivities = assists.length;
  const totalAttendeesExpected = assists.reduce((sum, a) => sum + a.expected_attendees, 0);
  const totalAttendeesActual = assists.reduce((sum, a) => sum + a.actual_attendees, 0);

  const handleCreateAssist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.institution || !formData.location) return;

    const newAssist: SosialisasiAssist = {
      id: generateSosialisasiId(),
      activity_date: formData.activity_date,
      location: formData.location,
      institution: formData.institution,
      project_id: formData.project_id,
      expected_attendees: parseInt(formData.expected_attendees, 10) || 0,
      actual_attendees: parseInt(formData.actual_attendees, 10) || 0,
      support_provided: formData.support_provided || null,
      outcome: formData.outcome || null,
      status: formData.status,
      pic_id: formData.pic_id,
      documentation_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pic: INITIAL_PROFILES.find((p) => p.id === formData.pic_id),
      project: INITIAL_PROJECTS.find((p) => p.id === formData.project_id),
    };

    setAssists([newAssist, ...assists]);
    setIsModalOpen(false);
    setFormData({
      institution: '',
      location: '',
      activity_date: '2026-10-18',
      project_id: INITIAL_PROJECTS[1].id,
      expected_attendees: '',
      actual_attendees: '',
      support_provided: '',
      outcome: '',
      status: 'terjadwal',
      pic_id: INITIAL_PROFILES[0].id,
    });
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Navigation Tabs */}
        <OfflineNavTabs />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-ink-black text-paper-white">
                Offline Marketing
              </span>
              <span className="text-xs text-stone-gray font-medium">
                Outreach Lembaga & Komunitas
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-black">
              Sosialisasi Instansi & Pabrik
            </h1>
            <p className="text-sm text-stone-gray mt-1">
              Pendampingan dan edukasi KPR subsidi ke serikat pekerja pabrik, kantor dinas pemerintah, koperasi, dan komunitas.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-paper-white bg-ink-black rounded-full hover:bg-stone-800 transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Catat Sosialisasi Baru</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-paper-white border border-sand-border rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-stone-gray uppercase tracking-wider block mb-1">
              Total Kegiatan Sosialisasi
            </span>
            <div className="text-2xl font-black text-ink-black font-mono">{totalActivities}</div>
            <span className="text-[11px] text-stone-500 mt-1 block">Instansi & serikat pekerja</span>
          </div>

          <div className="bg-paper-white border border-sand-border rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-stone-gray uppercase tracking-wider block mb-1">
              Total Estimasi Peserta
            </span>
            <div className="text-2xl font-black text-blue-900 font-mono">{totalAttendeesExpected}</div>
            <span className="text-[11px] text-stone-500 mt-1 block">Target audiens terdata</span>
          </div>

          <div className="bg-paper-white border border-sand-border rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-stone-gray uppercase tracking-wider block mb-1">
              Realisasi Kehadiran Peserta
            </span>
            <div className="text-2xl font-black text-emerald-700 font-mono">{totalAttendeesActual}</div>
            <span className="text-[11px] text-emerald-600 mt-1 block">Peserta aktif yang hadir</span>
          </div>
        </div>

        {/* Cards List */}
        {assists.length === 0 ? (
          <div className="rounded-[28px] bg-paper-white border border-sand-border p-8 sm:p-12 text-center shadow-xs">
            <Users className="w-12 h-12 text-ash-gray mx-auto mb-3" />
            <h3 className="text-base font-bold text-ink-black mb-1">
              Belum Ada Kegiatan Sosialisasi
            </h3>
            <p className="text-xs sm:text-sm text-stone-gray max-w-md mx-auto mb-6">
              Belum ada kegiatan sosialisasi instansi atau edukasi komunitas yang tercatat. Klik tombol di bawah untuk mencatat sosialisasi baru.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-pill-primary text-xs"
            >
              Catat Sosialisasi Baru
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {assists.map((assist) => (
            <div
              key={assist.id}
              className="bg-paper-white border border-sand-border rounded-2xl p-5 hover:border-stone-400 transition-all shadow-xs"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        assist.status === 'selesai'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-blue-50 text-blue-800 border-blue-300'
                      }`}
                    >
                      {assist.status === 'selesai' ? 'Selesai Terlaksana' : 'Terjadwal'}
                    </span>
                    {assist.project && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 bg-warm-cream px-2.5 py-0.5 rounded-full border border-sand-border">
                        <Building2 className="w-3 h-3 text-stone-500" />
                        {assist.project.name}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-ink-black">
                      {assist.institution}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-gray mt-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{assist.location}</span>
                    </div>
                  </div>

                  {/* Support provided */}
                  {assist.support_provided && (
                    <div className="p-3 rounded-xl bg-warm-cream border border-sand-border text-xs">
                      <span className="font-bold text-ink-black block mb-0.5">Dukungan yang Diberikan:</span>
                      <p className="text-stone-700 leading-relaxed">{assist.support_provided}</p>
                    </div>
                  )}

                  {/* Outcome */}
                  {assist.outcome && (
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                      <span className="font-bold text-emerald-950 flex items-center gap-1 mb-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Hasil Tindak Lanjut:
                      </span>
                      <p className="text-emerald-900 leading-relaxed">{assist.outcome}</p>
                    </div>
                  )}

                  {/* Footer metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-gray pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-violet-pulse" />
                      <span className="font-medium text-ink-black">{assist.activity_date}</span>
                    </div>
                    {assist.pic && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        <span>PIC: <strong className="text-ink-black">{assist.pic.full_name}</strong></span>
                      </div>
                    )}
                    {assist.documentation_url && (
                      <a
                        href={assist.documentation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-violet-pulse font-semibold hover:underline"
                      >
                        <span>Dokumentasi Foto</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Attendee numbers box */}
                <div className="bg-warm-cream border border-sand-border rounded-xl p-3 text-center shrink-0 w-36">
                  <span className="text-[10px] font-bold text-stone-gray uppercase block">Kehadiran</span>
                  <div className="text-xl font-black text-ink-black font-mono mt-0.5">
                    {assist.actual_attendees > 0 ? assist.actual_attendees : '—'}
                  </div>
                  <span className="text-[10px] text-stone-500 block mt-0.5">
                    Target: {assist.expected_attendees} org
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

        {/* Modal Catat Sosialisasi */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-paper-white border border-sand-border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-stone-gray hover:text-ink-black p-1.5 rounded-full hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-warm-cream border border-sand-border text-ink-black">
                  <Users className="w-5 h-5 text-violet-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink-black tracking-tight">
                    Catat Agenda Sosialisasi Baru
                  </h3>
                  <p className="text-xs text-stone-gray">Presentasi perumahan ke instansi atau komunitas</p>
                </div>
              </div>

              <form onSubmit={handleCreateAssist} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                    Nama Lembaga / Instansi / Serikat
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="Contoh: Serikat Pekerja PT Musim Mas KIM 2"
                    required
                    className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                    Lokasi Kegiatan
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Contoh: Aula Serbaguna Pabrik PT Musim Mas, Jl. Pulau Nias"
                    required
                    className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Tanggal Pelaksanaan
                    </label>
                    <input
                      type="date"
                      value={formData.activity_date}
                      onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                      required
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                      Proyek yang Ditawarkan
                    </label>
                    <select
                      value={formData.project_id}
                      onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    >
                      {INITIAL_PROJECTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                      Estimasi Peserta (Orang)
                    </label>
                    <input
                      type="number"
                      value={formData.expected_attendees}
                      onChange={(e) => setFormData({ ...formData, expected_attendees: e.target.value })}
                      placeholder="Contoh: 80"
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black font-mono focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                      PIC Sedaya
                    </label>
                    <select
                      value={formData.pic_id}
                      onChange={(e) => setFormData({ ...formData, pic_id: e.target.value })}
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    >
                      {INITIAL_PROFILES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.full_name} ({p.position})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                    Dukungan yang Disiapkan
                  </label>
                  <textarea
                    rows={2}
                    value={formData.support_provided}
                    onChange={(e) => setFormData({ ...formData, support_provided: e.target.value })}
                    placeholder="Contoh: Materi paparan presentasi PPT, 100 brosur, sampel denah rumah..."
                    className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-gray hover:text-ink-black bg-stone-100 rounded-full"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-paper-white bg-ink-black rounded-full hover:bg-stone-800 transition-colors shadow-xs"
                  >
                    Simpan Agenda
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
