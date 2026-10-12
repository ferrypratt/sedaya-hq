'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Lock, Mail, AlertCircle, Building2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('Email atau kata sandi tidak valid. Silakan periksa kembali.');
        } else {
          setErrorMsg(error.message || 'Gagal masuk akun. Silakan coba lagi.');
        }
        setLoading(false);
        return;
      }

      if (data?.session) {
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setErrorMsg(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col justify-center items-center p-4 selection:bg-violet-pulse selection:text-white">
      {/* Top Brand Pill */}
      <div className="mb-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper-white border border-sand-border shadow-xs">
        <div className="w-5 h-5 rounded-full bg-ink-black flex items-center justify-center text-paper-white text-[10px] font-bold">
          S
        </div>
        <span className="text-xs font-semibold tracking-tight text-ink-black">
          Sedaya Property HQ
        </span>
        <span className="text-[10px] text-stone-gray font-medium">| Portal Internal</span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-paper-white border border-sand-border rounded-[28px] p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-black mb-2">
            Selamat Datang
          </h1>
          <p className="text-sm text-stone-gray">
            Masuk ke sistem operasional divisi <span className="font-semibold text-ink-black">Branding, Marketing & Research</span>.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-gray uppercase tracking-wider mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ash-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@sedayagroup.id"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cool-mist bg-paper-white text-ink-black text-sm placeholder:text-ash-gray focus:outline-none focus:border-ink-black focus:ring-1 focus:ring-ink-black transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-gray uppercase tracking-wider mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ash-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cool-mist bg-paper-white text-ink-black text-sm placeholder:text-ash-gray focus:outline-none focus:border-ink-black focus:ring-1 focus:ring-ink-black transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-full bg-ink-black text-paper-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition disabled:opacity-50"
            >
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-sand-border text-center">
          <p className="text-xs text-stone-gray flex items-center justify-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-ash-gray" />
            Akses khusus tim internal Sedaya Property (Medan & Deli Serdang).
          </p>
        </div>
      </div>

      {/* Security footer notice */}
      <p className="mt-6 text-[11px] text-stone-gray text-center max-w-xs">
        Sistem tertutup (invite-only). Pendaftaran akun publik tidak tersedia.
      </p>
    </div>
  );
}
