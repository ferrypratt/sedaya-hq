'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
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
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-ink-black text-paper-white">
                Admin Area
              </span>
              <span className="text-xs text-stone-gray font-medium flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-violet-pulse" />
                Akses Terbatas: Leader Only
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-black">
              Pengaturan Sistem & Master Data
            </h1>
            <p className="text-sm text-stone-gray mt-1">
              Konfigurasi master data PIC operasional, proyek perumahan subsidi, dan integrasi saluran digital.
            </p>
          </div>
        </div>

        {/* Notice Banner */}
        {savedNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-semibold text-emerald-900 flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedNotice}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2.5 p-1.5 bg-warm-cream border border-sand-border rounded-2xl">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`p-3 rounded-xl transition-all text-left flex items-center gap-2 ${
              activeTab === 'profiles'
                ? 'bg-paper-white border border-sand-border text-ink-black shadow-xs ring-1 ring-ink-black/10'
                : 'text-stone-gray hover:text-ink-black'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold">Profil PIC ({profiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`p-3 rounded-xl transition-all text-left flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'bg-paper-white border border-sand-border text-ink-black shadow-xs ring-1 ring-ink-black/10'
                : 'text-stone-gray hover:text-ink-black'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span className="text-xs font-bold">Data Proyek ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('channels')}
            className={`p-3 rounded-xl transition-all text-left flex items-center gap-2 ${
              activeTab === 'channels'
                ? 'bg-paper-white border border-sand-border text-ink-black shadow-xs ring-1 ring-ink-black/10'
                : 'text-stone-gray hover:text-ink-black'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span className="text-xs font-bold">Master Saluran ({channels.length})</span>
          </button>
        </div>

        {/* Tab Content: Profiles */}
        {activeTab === 'profiles' && (
          <div className="space-y-4">
            <div className="bg-paper-white border border-sand-border rounded-2xl p-5 shadow-xs">
              <h3 className="text-base font-extrabold text-ink-black mb-1">
                Daftar PIC Operasional
              </h3>
              <p className="text-xs text-stone-gray mb-4">
                Pengguna internal aktif divisi Branding, Marketing & Research.
              </p>

              <div className="space-y-3">
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-warm-cream/50 border border-sand-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-ink-black">{p.full_name}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            p.role === 'leader'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {p.role}
                        </span>
                      </div>
                      <p className="text-xs text-stone-gray mt-0.5">{p.position}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-400 font-mono">ID: {p.id.substring(0, 8)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Projects */}
        {activeTab === 'projects' && (
          <div className="bg-paper-white border border-sand-border rounded-2xl p-5 shadow-xs">
            <h3 className="text-base font-extrabold text-ink-black mb-1">
              Master Proyek Sedaya Property
            </h3>
            <p className="text-xs text-stone-gray mb-4">
              5 Proyek Aktif Subsidi, 1 Unit Bisnis Kos, dan 2 Proyek Mendatang.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-sand-border text-stone-gray uppercase tracking-wider bg-warm-cream/50">
                    <th className="py-2.5 px-3 font-semibold">Nama Proyek</th>
                    <th className="py-2.5 px-3 font-semibold">Lokasi</th>
                    <th className="py-2.5 px-3 font-semibold">Kategori</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Kapasitas</th>
                    <th className="py-2.5 px-3 font-semibold">Instagram</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border/70">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-warm-cream/30 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-ink-black">{proj.name}</td>
                      <td className="py-2.5 px-3 text-stone-gray">{proj.location}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-800">
                          {proj.kind}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-ink-black">
                        {proj.total_units} {proj.unit_label}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-stone-gray">
                        {proj.instagram_handle ? `@${proj.instagram_handle}` : '—'}
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
          <div className="bg-paper-white border border-sand-border rounded-2xl p-5 shadow-xs">
            <h3 className="text-base font-extrabold text-ink-black mb-1">
              Daftar 19 Saluran Digital
            </h3>
            <p className="text-xs text-stone-gray mb-4">
              Kelola tautan dan status keaktifan saluran media sosial.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-sand-border text-stone-gray uppercase tracking-wider bg-warm-cream/50">
                    <th className="py-2.5 px-3 font-semibold">Platform</th>
                    <th className="py-2.5 px-3 font-semibold">Nama Saluran</th>
                    <th className="py-2.5 px-3 font-semibold">Handle / URL</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border/70">
                  {channels.map((chan) => (
                    <tr key={chan.id} className="hover:bg-warm-cream/30 transition-colors">
                      <td className="py-2.5 px-3 font-bold uppercase text-[10px] text-stone-gray">
                        {chan.platform}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-ink-black">{chan.name}</td>
                      <td className="py-2.5 px-3 font-mono text-stone-gray">
                        {chan.handle || chan.url}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            chan.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {chan.active ? 'Aktif' : 'Non-aktif'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleChannelActive(chan.id)}
                          className="text-[11px] font-semibold text-stone-gray hover:text-ink-black underline"
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
