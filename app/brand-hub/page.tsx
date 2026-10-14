'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { SedayaLogo } from '@/components/shared/sedaya-logo';
import { INITIAL_PROJECTS } from '@/lib/data/seed-data';
import {
  Download,
  Copy,
  Check,
  Palette,
  Type,
  ShieldCheck,
  Building2,
  FileCheck2,
  ExternalLink,
  Sparkles,
  Layers,
} from 'lucide-react';

interface ColorToken {
  name: string;
  variable: string;
  hex: string;
  rgb: string;
  usage: string;
  bgClass: string;
  textClass: string;
}

const BRAND_COLORS: ColorToken[] = [
  {
    name: 'Forest Emerald',
    variable: '--color-forest',
    hex: '#22593D',
    rgb: 'rgb(34, 89, 61)',
    usage: 'Warna aksen identitas utama Sedaya Property, tombol konversi utama, badge status positif.',
    bgClass: 'bg-forest',
    textClass: 'text-paper-white',
  },
  {
    name: 'Forest Surface',
    variable: '--color-forest-surface',
    hex: '#EAF3ED',
    rgb: 'rgb(234, 243, 237)',
    usage: 'Latar belakang badge, container aksen hijau, status sinkronisasi aktif.',
    bgClass: 'bg-forest-surface',
    textClass: 'text-forest',
  },
  {
    name: 'Warm Canvas',
    variable: '--color-warm-canvas',
    hex: '#F7F5F0',
    rgb: 'rgb(247, 245, 240)',
    usage: 'Latar belakang seluruh halaman aplikasi (Clay aesthetic, mengurangi kelelahan mata).',
    bgClass: 'bg-warm-canvas',
    textClass: 'text-ink-black',
  },
  {
    name: 'Warm Cream',
    variable: '--color-warm-cream',
    hex: '#EFECE6',
    rgb: 'rgb(239, 236, 230)',
    usage: 'Latar belakang sub-kontainer, card sekunder, track progress bar.',
    bgClass: 'bg-warm-cream',
    textClass: 'text-ink-black',
  },
  {
    name: 'Sand Border',
    variable: '--color-sand-border',
    hex: '#E6E0D4',
    rgb: 'rgb(230, 224, 212)',
    usage: 'Garis pembatas kartu, separator tabel, dan border komponen form.',
    bgClass: 'bg-sand-border',
    textClass: 'text-ink-black',
  },
  {
    name: 'Ink Black',
    variable: '--color-ink-black',
    hex: '#1A1917',
    rgb: 'rgb(26, 25, 23)',
    usage: 'Tipografi teks judul utama, tombol dark, teks kontras tinggi.',
    bgClass: 'bg-ink-black',
    textClass: 'text-paper-white',
  },
  {
    name: 'Stone Gray',
    variable: '--color-stone-gray',
    hex: '#6E6B65',
    rgb: 'rgb(110, 107, 101)',
    usage: 'Teks deskripsi sekunder, metadata tanggal, label pendukung (WCAG AAA compliant).',
    bgClass: 'bg-stone-gray',
    textClass: 'text-paper-white',
  },
  {
    name: 'Clay Terracotta',
    variable: '--color-clay',
    hex: '#A44224',
    rgb: 'rgb(164, 66, 36)',
    usage: 'Aksen tanah liat arsitektur bata, elemen visual hangat, badge prioritas.',
    bgClass: 'bg-amber-800',
    textClass: 'text-paper-white',
  },
];

const PROJECT_USPS = [
  {
    slug: 'grand-sevilla',
    name: 'Grand Sevilla (Tahap 1)',
    location: 'Batang Kuis, Deli Serdang',
    tagline: '10 Menit ke Bandara Internasional Kualanamu, Hunian Subsidi Paling Strategis',
    uspList: [
      'Akses Kilat Bandara Kualanamu & Stasiun Kereta Api Bandara',
      'Row jalan cor beton 7 - 8 meter, muat 2 mobil leluasa',
      'Sudah padat terhuni dengan komunitas keluarga muda rukun',
      'Bebas banjir dengan sistem drainase terbuka terencana',
      'Struktur bata merah kokoh dan sisa tanah belakang luas',
    ],
    priceNote: 'Rumah Subsidi FLPP Mulai Rp 166.000.000 • Cicilan Rp 1.050.000 / bln flat',
  },
  {
    slug: 'grand-lestari',
    name: 'Grand Lestari',
    location: 'Lubuk Pakam, Deli Serdang',
    tagline: 'Kawasan Asri Lubuk Pakam, Dekat Kantor Bupati & Gerbang Tol',
    uspList: [
      '5 Menit ke Kompleks Perkantoran Pemkab Deli Serdang & RSUD',
      'Akses cepat ke Gerbang Tol Lubuk Pakam (Tol Medan - Tebing Tinggi)',
      'Lingkungan hijau asri, bebas polusi dan kebisingan',
      'Pondasi batu kali dan rangka atap baja ringan bergaransi',
      'Bantuan proses pemberkasan KPR Bank BTN & BSI sampai tuntas',
    ],
    priceNote: 'Rumah Subsidi FLPP Mulai Rp 166.000.000 • Cicilan Rp 1.050.000 / bln flat',
  },
  {
    slug: 'harmony-hills',
    name: 'Harmony Hills',
    location: 'Patumbak, Deli Serdang',
    tagline: 'Hunian Sejuk Bernuansa Asri, Akses Langsung ke Medan Amplas',
    uspList: [
      'Hanya 15 menit dari Terminal Amplas & Flyover Simpang Amplas',
      'Kontur tanah tinggi bebas genangan air',
      'Desain fasad minimalis modern kekinian',
      'Keamanan lingkungan terpadu satu pintu (One-Gate System)',
    ],
    priceNote: 'Rumah Subsidi FLPP Mulai Rp 166.000.000 • Cicilan Rp 1.050.000 / bln flat',
  },
  {
    slug: 'setia-residence',
    name: 'Setia Residence',
    location: 'Klumpang, Deli Serdang',
    tagline: 'Rumah Subsidi Modern Dekat Hamparan Perak & Tol Marelan',
    uspList: [
      'Akses mudah ke Medan Utara, Helvetia, dan Tol Belmera',
      'Kawasan berkembang pesat dengan potensi kenaikan nilai investasi',
      'Dekat sarana ibadah, sekolah, dan pasar tradisional',
    ],
    priceNote: 'Rumah Subsidi FLPP Mulai Rp 166.000.000 • Cicilan Rp 1.050.000 / bln flat',
  },
  {
    slug: 'samudera-residence',
    name: 'Samudera Residence',
    location: 'Binjai Timur, Kota Binjai',
    tagline: 'Lokasi Emas Binjai, Akses Mudah ke Stasiun & Megawati',
    uspList: [
      'Dekat jalan lintas Medan - Binjai dan Gerbang Tol Binjai',
      'Akses cepat ke Stasiun Kereta Api Binjai untuk komuter Medan',
      'Kawasan pemukiman mandiri yang nyaman dan tertata',
    ],
    priceNote: 'Unit Subsidi & Komersial Pilihan • Cicilan Ringan Bank Rekanan',
  },
];

export default function BrandHubPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const downloadSvgLogo = () => {
    const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 500 540" fill="none" xmlns="http://www.w3.org/2000/svg">
  <text x="250" y="120" text-anchor="middle" fill="#1A1917" style="font-family:'Plus Jakarta Sans','Inter',sans-serif;font-weight:900;font-size:118px;letter-spacing:-0.015em">SEDAYA</text>
  <path d="M20 170 H108 V288 H166 V170 H254 V452 H166 V348 H108 V452 H20 Z" fill="#1A1917"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M372 170 C312 170 268 218 268 310 C268 402 312 452 372 452 C402 452 428 438 447 416 L447 430 C447 438 450 445 456 450 C440 464 416 472 388 472 C350 472 316 458 288 440 C278 434 265 438 260 448 C255 458 259 471 269 477 C304 500 345 514 388 514 C432 514 466 498 483 470 C488 462 488 452 485 444 C482 436 476 430 468 426 L468 402 C474 376 476 344 476 310 C476 218 432 170 372 170 Z M372 232 C404 232 422 262 422 310 C422 358 404 390 372 390 C340 390 322 358 322 310 C322 262 340 232 372 232 Z" fill="#1A1917"/>
  <path d="M266 450 C295 478 338 496 385 496 C426 496 458 480 476 456 C466 478 436 492 400 492 C355 492 316 474 286 446 C278 438 268 442 266 450 Z" fill="#1A1917"/>
</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sedaya-property-logo-official.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const legalDisclaimerText = `PT Sedaya Property merupakan pengembang resmi perumahan bersubsidi (FLPP) yang terdaftar dan diawasi oleh Kementerian Perumahan dan Kawasan Permukiman Republik Indonesia serta Badan Pengelola Tabungan Perumahan Rakyat (BP Tapera). Seluruh unit telah mengantongi Persetujuan Bangunan Gedung (PBG) dan sertifikat induk pemecahan hak milik (SHM). Simulasi angsuran mengikuti ketetapan suku bunga FLPP 5% tetap sampai masa tenor berakhir melalui bank penyalur resmi (Bank BTN, Bank BTN Syariah, BSI, Mandiri).`;

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          section="Pedoman Identitas & Aset"
          title="Brand Identity & Asset Hub"
          description="Pusat unduh logo resmi, palet warna Clay Design System, panduan tipografi, nilai jual proyek (USP), serta standar redaksional legal PT Sedaya Property."
        />

        {/* SECTION 1: LOGO DOWNLOAD CENTER */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-sand-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-forest" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-black">
                Pusat Unduh Logo Resmi Sedaya Property
              </h2>
            </div>
            <span className="text-xs text-stone-gray font-semibold">
              Format Vektor SVG & PNG Transparan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Logo Light Background */}
            <div className="card-clay p-6 flex flex-col justify-between items-center text-center space-y-5 bg-paper-white">
              <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider">
                Logo Utama (Latar Terang)
              </span>
              <div className="w-32 h-32 flex items-center justify-center p-2">
                <SedayaLogo className="w-full h-full text-ink-black" />
              </div>
              <div className="w-full space-y-2">
                <p className="text-xs text-stone-gray">
                  Digunakan untuk dokumen resmi, kop surat, kop PDF, dan materi promosi berlatar terang.
                </p>
                <button
                  type="button"
                  onClick={downloadSvgLogo}
                  className="btn-pill-primary w-full text-xs py-2 flex items-center justify-center gap-2 bg-forest text-paper-white hover:bg-forest-emerald"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Vektor SVG Resmi</span>
                </button>
              </div>
            </div>

            {/* Card 2: Logo Dark Contrast */}
            <div className="card-clay p-6 flex flex-col justify-between items-center text-center space-y-5 bg-ink-black text-paper-white border-ink-black">
              <span className="text-[11px] font-bold text-ash-gray uppercase tracking-wider">
                Logo Monokrom (Latar Gelap)
              </span>
              <div className="w-32 h-32 flex items-center justify-center p-2">
                <SedayaLogo className="w-full h-full text-paper-white" />
              </div>
              <div className="w-full space-y-2">
                <p className="text-xs text-ash-gray">
                  Digunakan untuk poster malam, konten reels kontras gelap, dan billboard LED outdoor.
                </p>
                <button
                  type="button"
                  onClick={downloadSvgLogo}
                  className="btn-pill-ghost w-full text-xs py-2 flex items-center justify-center gap-2 border-stone-gray text-paper-white hover:bg-paper-white/10"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Versi Latar Gelap</span>
                </button>
              </div>
            </div>

            {/* Card 3: Watermark Overlay for Video Editors */}
            <div className="card-clay p-6 flex flex-col justify-between items-center text-center space-y-5 bg-warm-cream">
              <span className="text-[11px] font-bold text-forest uppercase tracking-wider">
                Watermark Pojok Video Reels / TikTok
              </span>
              <div className="w-32 h-32 flex items-center justify-center p-4 rounded-2xl bg-paper-white/70 border border-sand-border shadow-xs">
                <div className="opacity-75">
                  <SedayaLogo className="w-20 h-20 text-forest" />
                </div>
              </div>
              <div className="w-full space-y-2">
                <p className="text-xs text-stone-gray">
                  Format transparan 75% opacity untuk disematkan di pojok kanan atas video promosi.
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy('watermark_specs', 'Posisi: Pojok Kanan Atas, Ukuran: 80x80px, Opacity: 75%')}
                  className="btn-pill-ghost w-full text-xs py-2 flex items-center justify-center gap-2 border-sand-border text-ink-black hover:bg-paper-white"
                >
                  {copiedKey === 'watermark_specs' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-forest" />
                      <span>Panduan Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-gray" />
                      <span>Salin Standar Editor</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: CLAY DESIGN SYSTEM COLOR PALETTE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-sand-border">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-forest" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-black">
                Palet Warna Resmi Sedaya (Clay Design Tokens)
              </h2>
            </div>
            <span className="text-xs text-stone-gray font-semibold">
              Klik kartu untuk menyalin kode HEX
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BRAND_COLORS.map((col) => (
              <div
                key={col.hex}
                onClick={() => handleCopy(`color_${col.hex}`, col.hex)}
                className="card-clay p-4 cursor-pointer hover:border-forest transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-ink-black">{col.name}</h3>
                    <span className="metric-mono text-[11px] text-stone-gray block mt-0.5">
                      {col.hex}
                    </span>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-lg border border-sand-border shadow-xs shrink-0 ${col.bgClass}`}
                  />
                </div>
                <p className="text-[11px] text-stone-gray mt-2 leading-relaxed">
                  {col.usage}
                </p>
                <div className="mt-3 pt-2 border-t border-sand-border flex items-center justify-between text-[10px] text-stone-gray">
                  <span className="metric-mono">{col.rgb}</span>
                  <span className="font-bold text-forest group-hover:underline flex items-center gap-1">
                    {copiedKey === `color_${col.hex}` ? (
                      <>
                        <Check className="w-3 h-3 text-forest" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-stone-gray" />
                        <span>Salin HEX</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: TYPOGRAPHY STANDARDS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-sand-border">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-forest" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-black">
                Standar Tipografi & Huruf
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-clay p-5 space-y-3">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-forest-surface text-forest metric-mono">
                Judul & Display
              </span>
              <h3 className="text-2xl font-extrabold text-ink-black tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Plus Jakarta Sans
              </h3>
              <p className="text-xs text-stone-gray leading-relaxed">
                Digunakan untuk judul poster, headline banner iklan, nama proyek perumahan, dan judul halaman. Memberikan kesan modern, tegap, dan berwibawa.
              </p>
            </div>

            <div className="card-clay p-5 space-y-3">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-warm-cream text-stone-gray metric-mono">
                Isi Teks & Paragraf
              </span>
              <h3 className="text-2xl font-bold text-ink-black tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                Inter
              </h3>
              <p className="text-xs text-stone-gray leading-relaxed">
                Digunakan untuk isi deskripsi, naskah narasi video, caption Instagram, formulir, dan tabel data agar tingkat keterbacaan (readability) selalu maksimal di HP.
              </p>
            </div>

            <div className="card-clay p-5 space-y-3">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-warm-cream text-stone-gray metric-mono">
                Angka & Finansial
              </span>
              <h3 className="text-2xl font-bold text-ink-black metric-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                JetBrains Mono
              </h3>
              <p className="text-xs text-stone-gray leading-relaxed">
                Digunakan khusus untuk penulisan harga rumah (Rp 166.000.000), estimasi angsuran, nomor blok unit, persentase serapan, dan metrik analitik.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: OFFICIAL PROJECT USPs & POSITIONING MATRIX */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-sand-border">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-forest" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-black">
                Bank Tagline Resmi & Nilai Jual Proyek (USPs)
              </h2>
            </div>
            <span className="text-xs text-stone-gray font-semibold">
              Resmi Disetujui Manajemen untuk Materi Promosi
            </span>
          </div>

          <div className="space-y-4">
            {PROJECT_USPS.map((proj) => (
              <div key={proj.slug} className="card-clay p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-forest-surface text-forest">
                        {proj.location}
                      </span>
                      <h3 className="text-base font-bold text-ink-black">
                        {proj.name}
                      </h3>
                    </div>
                    <p className="text-xs font-bold text-ink-black mt-1 italic">
                      &ldquo;{proj.tagline}&rdquo;
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `usp_${proj.slug}`,
                        `${proj.name} (${proj.location})\nTagline: "${proj.tagline}"\n\nKeunggulan Utama:\n${proj.uspList.map((u) => `• ${u}`).join('\n')}\n\n${proj.priceNote}`
                      )
                    }
                    className="btn-pill-ghost text-xs py-1.5 px-3 self-start shrink-0"
                  >
                    {copiedKey === `usp_${proj.slug}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-forest" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-gray" />
                        <span>Salin USP Proyek</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-sand-border">
                  {proj.uspList.map((usp, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-stone-gray">
                      <Check className="w-3.5 h-3.5 text-forest shrink-0" />
                      <span>{usp}</span>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-warm-cream border border-sand-border flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-gray">Skema Harga Resmi:</span>
                  <span className="metric-mono font-bold text-forest">{proj.priceNote}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: LEGAL DISCLAIMER & FLPP BOILERPLATE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-sand-border">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-forest" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-black">
                Standar Redaksional Legalitas & Kepatuhan FLPP
              </h2>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('legal_boilerplate', legalDisclaimerText)}
              className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
            >
              {copiedKey === 'legal_boilerplate' ? (
                <>
                  <Check className="w-3 h-3 text-forest" />
                  <span>Disalin ke Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-stone-gray" />
                  <span>Salin Teks Legal Lengkap</span>
                </>
              )}
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-warm-cream border border-sand-border space-y-2">
            <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider block">
              Teks Wajib Kaki Brosur, Landing Page & Proposal Bank
            </span>
            <p className="text-xs text-stone-gray leading-relaxed font-sans">
              {legalDisclaimerText}
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
