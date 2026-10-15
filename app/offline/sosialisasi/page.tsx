'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { getCurrentWeekRange, getClientTodayString } from '@/lib/utils/date-utils';
import { OfflineNavTabs } from '@/components/modules/offline/offline-nav-tabs';
import { INITIAL_SOSIALISASI_ASSISTS } from '@/lib/data/seed-offline';
import { INITIAL_PROJECTS, INITIAL_PROFILES } from '@/lib/data/seed-data';
import { usePersistentState, STORAGE_KEYS, generateUUID } from '@/lib/storage/persistence';
import { SosialisasiAssist } from '@/lib/types/database';
import {
  Users,
  PlusCircle,
  Calendar,
  MapPin,
  Building2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export default function SosialisasiPage() {
  const [assists, setAssists] = usePersistentState<SosialisasiAssist[]>(
    STORAGE_KEYS.SOSIALISASI,
    INITIAL_SOSIALISASI_ASSISTS
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      activity_date: getCurrentWeekRange().end,
    }));
  }, []);

  const totalActivities = assists.length;
  const totalAttendeesExpected = assists.reduce((sum, a) => sum + a.expected_attendees, 0);
  const totalAttendeesActual = assists.reduce((sum, a) => sum + a.actual_attendees, 0);

  const handleCreateAssist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.institution || !formData.location) return;

    const newAssist: SosialisasiAssist = {
      id: generateUUID(),
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
      activity_date: getCurrentWeekRange().end,
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
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        <OfflineNavTabs />

        <PageHeader
          eyebrow="Offline Marketing • Outreach Lembaga & Komunitas"
          title="Sosialisasi"
          description="Pendampingan dan edukasi KPR subsidi ke serikat pekerja pabrik, kantor dinas pemerintah, koperasi, dan komunitas."
          actions={
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-pill-primary text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Catat Sosialisasi Baru</span>
            </button>
          }
        />

        {/* Compact Field Operations Ledger Bar */}
        <div className="card-cream p-5 flex flex-wrap items-center gap-6">
          <div>
            <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider block">
              Total Kegiatan Sosialisasi
            </span>
            <span className="text-2xl font-black text-ink-black metric-mono">{totalActivities}</span>
            <span className="text-xs text-stone-gray ml-2">Instansi & serikat pekerja</span>
          </div>
          <div className="h-8 w-px bg-sand-border hidden sm:block" />
          <div>
            <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider block">
              Total Estimasi Peserta
            </span>
            <span className="text-2xl font-black text-ink-black metric-mono">{totalAttendeesExpected}</span>
            <span className="text-xs text-stone-gray ml-2">Target audiens</span>
          </div>
          <div className="h-8 w-px bg-sand-border hidden sm:block" />
          <div>
            <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider block">
              Realisasi Kehadiran Peserta
            </span>
            <span className="text-2xl font-black text-forest-emerald metric-mono">{totalAttendeesActual}</span>
            <span className="text-xs text-stone-gray ml-2">Peserta aktif hadir</span>
          </div>
        </div>

        {/* Cards List */}
        {assists.length === 0 ? (
          <div className="card-clay p-8 sm:p-12 text-center">
            <Users className="w-10 h-10 text-ash-gray mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-ink-black mb-1">
              Belum Ada Kegiatan Sosialisasi
            </h3>
            <p className="text-xs sm:text-sm text-stone-gray max-w-md mx-auto mb-6">
              Belum ada kegiatan sosialisasi instansi atau edukasi komunitas yang tercatat. Klik tombol di bawah untuk mencatat sosialisasi baru.
            </p>
            <button
              type="button"
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
                className="card-clay p-5 hover:border-ink-black transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          assist.status === 'selesai'
                            ? 'bg-forest-surface text-forest-emerald border-forest-emerald/30'
                            : 'bg-ink-black text-paper-white border-ink-black'
                        }`}
                      >
                        {assist.status === 'selesai' ? 'Selesai Terlaksana' : 'Terjadwal'}
                      </span>
                      {assist.project && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-black bg-warm-cream px-2.5 py-0.5 rounded-full border border-sand-border">
                          <Building2 className="w-3 h-3 text-stone-gray" />
                          {assist.project.name}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-ink-black">
                        {assist.institution}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-stone-gray mt-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-gray shrink-0" />
                        <span>{assist.location}</span>
                      </div>
                    </div>

                    {assist.support_provided && (
                      <div className="p-3 rounded-xl bg-warm-cream border border-sand-border text-xs">
                        <span className="font-bold text-ink-black block mb-0.5">Dukungan yang Diberikan:</span>
                        <p className="text-stone-gray leading-relaxed">{assist.support_provided}</p>
                      </div>
                    )}

                    {assist.outcome && (
                      <div className="p-3 rounded-xl bg-forest-surface border border-forest-emerald/30 text-xs">
                        <span className="font-bold text-forest-emerald flex items-center gap-1 mb-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Hasil Tindak Lanjut:
                        </span>
                        <p className="text-ink-black leading-relaxed">{assist.outcome}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-gray pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-violet-pulse" />
                        <span className="font-bold text-ink-black metric-mono">{assist.activity_date}</span>
                      </div>
                      {assist.pic && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-stone-gray" />
                          <span>PIC: <strong className="text-ink-black">{assist.pic.full_name}</strong></span>
                        </div>
                      )}
                      {assist.documentation_url && (
                        <a
                          href={assist.documentation_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-violet-pulse font-bold hover:underline"
                        >
                          <span>Dokumentasi Foto</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="bg-warm-cream border border-sand-border rounded-xl p-3 text-center shrink-0 w-36">
                    <span className="text-[10px] font-bold text-stone-gray uppercase block">Kehadiran</span>
                    <div className="text-xl font-black text-ink-black metric-mono mt-0.5">
                      {assist.actual_attendees > 0 ? assist.actual_attendees : '-'}
                    </div>
                    <span className="text-[10px] text-stone-gray block mt-0.5 metric-mono">
                      Target: {assist.expected_attendees} org
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Catat Agenda Sosialisasi Baru"
          description="Presentasi perumahan ke instansi atau komunitas"
        >
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
                className="input-clay text-xs"
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
                className="input-clay text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-gray uppercase tracking-wider mb-1">
                  Tanggal Pelaksanaan
                </label>
                <input
                  type="date"
                  value={formData.activity_date}
                  onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                  required
                  className="input-clay text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                  Proyek yang Ditawarkan
                </label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="input-clay text-xs"
                >
                  {INITIAL_PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                  Estimasi Peserta (Orang)
                </label>
                <input
                  type="number"
                  value={formData.expected_attendees}
                  onChange={(e) => setFormData({ ...formData, expected_attendees: e.target.value })}
                  placeholder="Contoh: 80"
                  className="input-clay text-xs metric-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                  PIC Sedaya
                </label>
                <select
                  value={formData.pic_id}
                  onChange={(e) => setFormData({ ...formData, pic_id: e.target.value })}
                  className="input-clay text-xs"
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
                className="input-clay text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-pill-ghost text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-pill-primary text-xs"
              >
                Simpan Agenda
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}

