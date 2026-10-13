'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { INITIAL_PROFILES, INITIAL_PROJECTS } from '@/lib/data/seed-data';
import { INITIAL_CHANNELS } from '@/lib/data/seed-channels';
import { Profile, Project, Channel } from '@/lib/types/database';
import {
  Users,
  Building2,
  Share2,
  Shield,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profiles' | 'projects' | 'channels'>('profiles');
  const [profiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [projects] = useState<Project[]>(INITIAL_PROJECTS);
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleToggleChannelActive = (id: string) => {
    setChannels(
      channels.map((c) => (c.id === id ? { ...c, active: !c.active, updated_at: new Date().toISOString() } : c))
    );
    showNotice('Status keaktifan saluran diperbarui.');
  };

  const showNotice = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        <PageHeader
          eyebrow="Admin Area • Akses Terbatas: Leader Only"
          title="Pengaturan Sistem & Master Data"
          description="Konfigurasi master data PIC operasional, proyek perumahan subsidi, dan integrasi saluran digital."
          actions={
            <div className="inline-flex items-center gap-2 px-3.5 min-h-10 rounded-full bg-warm-cream border border-sand-border text-xs font-bold text-ink-black">
              <Shield className="w-3.5 h-3.5 text-violet-pulse" />
              <span>Hak Akses Leader</span>
            </div>
          }
        />

        {/* Notice Banner */}
        {savedNotice && (
          <div className="p-3.5 rounded-2xl bg-forest-surface border border-forest-emerald/30 text-xs font-bold text-ink-black flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-forest-emerald shrink-0" />
            <span>{savedNotice}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 bg-warm-cream border border-sand-border rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('profiles')}
            className={`p-3 min-h-12 rounded-xl transition-colors text-left flex items-center gap-2.5 border ${
              activeTab === 'profiles'
                ? 'bg-ink-black border-ink-black text-paper-white'
                : 'bg-transparent border-transparent text-stone-gray hover:text-ink-black hover:bg-paper-white/60'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="text-xs font-extrabold">Profil PIC ({profiles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`p-3 min-h-12 rounded-xl transition-colors text-left flex items-center gap-2.5 border ${
              activeTab === 'projects'
                ? 'bg-ink-black border-ink-black text-paper-white'
                : 'bg-transparent border-transparent text-stone-gray hover:text-ink-black hover:bg-paper-white/60'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="text-xs font-extrabold">Data Proyek ({projects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('channels')}
            className={`p-3 min-h-12 rounded-xl transition-colors text-left flex items-center gap-2.5 border ${
              activeTab === 'channels'
                ? 'bg-ink-black border-ink-black text-paper-white'
                : 'bg-transparent border-transparent text-stone-gray hover:text-ink-black hover:bg-paper-white/60'
            }`}
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span className="text-xs font-extrabold">Master Saluran ({channels.length})</span>
          </button>
        </div>

        {/* Tab Content: Profiles */}
        {activeTab === 'profiles' && (
          <div className="card-clay p-6">
            <h2 className="text-base font-extrabold text-ink-black mb-1">
              Daftar PIC Operasional
            </h2>
            <p className="text-xs text-stone-gray mb-5">
              Pengguna internal aktif divisi Branding, Marketing & Research.
            </p>

            <div className="space-y-3">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-warm-cream border border-sand-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-ink-black">{p.full_name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                          p.role === 'leader'
                            ? 'bg-ink-black text-paper-white border-ink-black'
                            : 'bg-paper-white text-stone-gray border-sand-border'
                        }`}
                      >
                        {p.role}
                      </span>
                    </div>
                    <p className="text-xs text-stone-gray mt-0.5">{p.position}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-gray metric-mono">ID: {p.id.substring(0, 8)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Projects */}
        {activeTab === 'projects' && (
          <div className="card-clay p-6">
            <h2 className="text-base font-extrabold text-ink-black mb-1">
              Master Proyek Sedaya Property
            </h2>
            <p className="text-xs text-stone-gray mb-5">
              6 Proyek Perumahan Subsidi, 1 Unit Bisnis Kos, dan 2 Proyek Mendatang.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-sand-border text-stone-gray uppercase tracking-wider bg-warm-cream">
                    <th className="py-3 px-4 font-bold">Nama Proyek</th>
                    <th className="py-3 px-4 font-bold">Lokasi</th>
                    <th className="py-3 px-4 font-bold">Kategori</th>
                    <th className="py-3 px-4 font-bold text-right">Kapasitas</th>
                    <th className="py-3 px-4 font-bold">Instagram</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border/70">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-warm-cream/40 transition-colors">
                      <td className="py-3 px-4 font-extrabold text-ink-black">{proj.name}</td>
                      <td className="py-3 px-4 text-stone-gray">{proj.location}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-warm-cream border border-sand-border text-ink-black">
                          {proj.kind}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right metric-mono font-extrabold text-ink-black">
                        {proj.total_units} {proj.unit_label}
                      </td>
                      <td className="py-3 px-4 metric-mono text-stone-gray">
                        {proj.instagram_handle ? `@${proj.instagram_handle}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Channels */}
        {activeTab === 'channels' && (
          <div className="card-clay p-6">
            <h2 className="text-base font-extrabold text-ink-black mb-1">
              Daftar 19 Saluran Digital
            </h2>
            <p className="text-xs text-stone-gray mb-5">
              Kelola tautan dan status keaktifan saluran media sosial.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-sand-border text-stone-gray uppercase tracking-wider bg-warm-cream">
                    <th className="py-3 px-4 font-bold">Platform</th>
                    <th className="py-3 px-4 font-bold">Nama Saluran</th>
                    <th className="py-3 px-4 font-bold">Handle / URL</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                    <th className="py-3 px-4 font-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border/70">
                  {channels.map((chan) => (
                    <tr key={chan.id} className="hover:bg-warm-cream/40 transition-colors">
                      <td className="py-3 px-4 font-bold uppercase text-[10px] text-stone-gray">
                        {chan.platform}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-ink-black">{chan.name}</td>
                      <td className="py-3 px-4 metric-mono text-stone-gray">
                        {chan.handle || chan.url}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            chan.active
                              ? 'bg-forest-surface text-forest-emerald border-forest-emerald/30'
                              : 'bg-warm-cream text-stone-gray border-sand-border'
                          }`}
                        >
                          {chan.active ? 'Aktif' : 'Non-aktif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleChannelActive(chan.id)}
                          className="text-xs font-bold text-stone-gray hover:text-ink-black underline min-h-9 px-2"
                        >
                          {chan.active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

