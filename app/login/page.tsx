'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Lock, Mail, AlertCircle, Building2, ShieldCheck } from 'lucide-react';
import { SedayaLogo } from '@/components/shared/sedaya-logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const enterDemoWorkspace = () => {
    document.cookie = 'sedaya_demo=1; path=/; max-age=86400; SameSite=Lax';
    router.push('/');
    router.refresh();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const configuredUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_FERRYPRATASUPABASE_URL;

      const isPlaceholder = !configuredUrl || configuredUrl.includes('placeholder');

      if (isPlaceholder) {
        enterDemoWorkspace();
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (
          error.message.includes('fetch') ||
          error.message.includes('network') ||
          error.message.includes('Failed to fetch')
        ) {
          enterDemoWorkspace();
          return;
        }
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('Email atau kata sandi tidak sesuai. Periksa kembali kredensial Anda.');
        } else {
          setErrorMsg(error.message || 'Gagal masuk ke sistem. Silakan coba kembali.');
        }
        setLoading(false);
        return;
      }

      if (data?.session) {
        document.cookie = 'sedaya_demo=; path=/; max-age=0; SameSite=Lax';
        router.push('/');
        router.refresh();
        return;
      }

      setLoading(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi gangguan jaringan.';
      if (
        message.includes('fetch') ||
        message.includes('network') ||
        message.includes('placeholder')
      ) {
        enterDemoWorkspace();
        return;
      }
      setErrorMsg(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-12 bg-paper-white text-ink-black">
      {/* Left Column: Editorial Architecture & Operational Thesis */}
      <section className="group lg:col-span-7 bg-warm-cream hover:bg-[#f4f1e8] border-b lg:border-b-0 lg:border-r border-sand-border hover:border-sand-hover p-6 sm:p-10 lg:p-14 flex flex-col justify-between transition-all duration-300 ease-out">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-paper-white border border-sand-border group-hover:border-sand-hover flex items-center justify-center p-1 text-ink-black shadow-xs shrink-0 transition-transform duration-300 group-hover:scale-105">
              <SedayaLogo className="w-full h-full" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-ink-black block leading-none">
                SEDAYA PROPERTY HQ
              </span>
              <span className="text-[11px] font-medium text-stone-gray uppercase tracking-[0.06em] block mt-0.5">
                Divisi Branding, Marketing & Riset
              </span>
            </div>
          </div>
          <span className="metric-mono text-xs font-semibold px-3 py-1 rounded-full bg-paper-white border border-sand-border group-hover:border-sand-hover text-stone-gray transition-colors duration-200">
            Medan & Deli Serdang
          </span>
        </div>

        <div className="my-10 lg:my-0 max-w-xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper-white border border-sand-border group-hover:border-sand-hover text-xs font-semibold text-stone-gray transition-colors duration-200">
            <Building2 className="w-3.5 h-3.5 text-ink-black" />
            <span>Workspace Operasional Internal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-ink-black tracking-tight leading-[1.08]">
            Kendali terpadu stok unit, kampanye digital, dan eksekusi lapangan.
          </h1>
          <p className="text-sm sm:text-base text-stone-gray leading-relaxed max-w-[56ch]">
            Satu sistem kerja untuk memantau rekonsiliasi inventaris perumahan, pencatatan aktivitas harian PIC, distribusi konten, dan pelaporan eksekutif secara presisi.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-sand-border group-hover:border-sand-hover/70 transition-colors duration-300">
          <div className="transition-transform duration-200 group-hover:translate-y-[-1px]">
            <span className="metric-mono text-xl sm:text-2xl font-bold text-ink-black block">
              7
            </span>
            <span className="text-xs text-stone-gray font-medium">
              Entitas & Proyek Aktif
            </span>
          </div>
          <div className="transition-transform duration-200 group-hover:translate-y-[-1px]">
            <span className="metric-mono text-xl sm:text-2xl font-bold text-ink-black block">
              346
            </span>
            <span className="text-xs text-stone-gray font-medium">
              Total Unit Terpantau
            </span>
          </div>
          <div className="transition-transform duration-200 group-hover:translate-y-[-1px]">
            <span className="metric-mono text-xl sm:text-2xl font-bold text-ink-black block">
              14
            </span>
            <span className="text-xs text-stone-gray font-medium">
              Kanal Digital Terdaftar
            </span>
          </div>
        </div>
      </section>

      {/* Right Column: Authentication Workbench */}
      <main className="lg:col-span-5 bg-paper-white p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
        <div className="w-full max-w-sm mx-auto space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-ink-black tracking-tight">
              Masuk ke Sistem
            </h2>
            <p className="text-sm text-stone-gray">
              Gunakan akun resmi Sedaya Group untuk mengakses portal operasional.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-ember-surface border border-ember-border flex items-start gap-2.5 text-ember-orange text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-ink-black mb-1.5"
              >
                Alamat Email Kerja
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ash-gray absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@sedayagroup.id"
                  className="input-clay !pl-11 pr-4 min-h-11"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-ink-black mb-1.5"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ash-gray absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="input-clay !pl-11 pr-4 min-h-11"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-pill-primary w-full min-h-11 text-sm"
              >
                <span>{loading ? 'Memverifikasi Kredensial...' : 'Masuk ke Workspace'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={enterDemoWorkspace}
                className="btn-pill-ghost w-full min-h-11 text-xs"
              >
                <span>Eksplorasi Portal (Mode Demo)</span>
              </button>
            </div>
          </form>

          <div className="pt-6 border-t border-sand-border flex items-start gap-2.5 text-xs text-stone-gray">
            <ShieldCheck className="w-4 h-4 text-ash-gray shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Akses bersifat tertutup (khusus anggota tim yang diundang). Hubungi Supervisor Marketing jika Anda memerlukan reset akses.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
