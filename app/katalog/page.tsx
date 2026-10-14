'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SedayaLogo } from '@/components/shared/sedaya-logo';
import {
  Building2,
  MapPin,
  CheckCircle2,
  Phone,
  Calculator,
  Compass,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Bed,
  Bath,
  Car,
  Maximize2,
} from 'lucide-react';

interface CatalogProject {
  id: string;
  slug: string;
  name: string;
  region: string;
  locationDetails: string;
  category: 'subsidi' | 'komersial';
  houseType: string;
  landBuildingSize: string;
  priceStartIdr: number;
  estMonthlyCicilanIdr: number;
  googleMapsUrl: string;
  specs: {
    bedrooms: number;
    bathrooms: number;
    carport: boolean;
    electricalWatt: number;
    waterSource: string;
    wallMaterial: string;
    roofMaterial: string;
    flooring: string;
  };
  highlights: string[];
  description: string;
  whatsappContact: string; // international format
}

const CATALOG_PROJECTS: CatalogProject[] = [
  {
    id: 'p-01',
    slug: 'grand-sevilla',
    name: 'Grand Sevilla (Tahap 1)',
    region: 'Batang Kuis',
    locationDetails: 'Jl. Batang Kuis, Deli Serdang (10 Menit ke Bandara Kualanamu)',
    category: 'subsidi',
    houseType: 'Tipe 36 Subsidi FLPP',
    landBuildingSize: 'LB: 36 m² • LT: 72 m² (6 x 12 m)',
    priceStartIdr: 166000000,
    estMonthlyCicilanIdr: 1050000,
    googleMapsUrl: 'https://maps.google.com/?q=Batang+Kuis+Deli+Serdang',
    specs: {
      bedrooms: 2,
      bathrooms: 1,
      carport: true,
      electricalWatt: 1300,
      waterSource: 'Sumur Bor Bersih / PDAM',
      wallMaterial: 'Batu Bata Merah Diplester & Dicat',
      roofMaterial: 'Rangka Baja Ringan & Genteng Metal',
      flooring: 'Keramik 40x40 cm Berkualitas',
    },
    highlights: [
      '10 Menit ke Bandara Internasional Kualanamu',
      'Row jalan lingkungan cor beton 7 - 8 meter',
      'Sudah padat terhuni dengan komunitas keluarga muda rukun',
      'Sistem drainase tertata bebas genangan air',
    ],
    description:
      'Perumahan subsidi paling dicari di Batang Kuis dengan akses kilat ke bandara dan stasiun. Sangat cocok bagi karyawan bandara, guru, dan keluarga muda yang menginginkan hunian strategis dengan cicilan flat tetap sampai lunas.',
    whatsappContact: '6281265000101',
  },
  {
    id: 'p-02',
    slug: 'grand-lestari',
    name: 'Grand Lestari',
    region: 'Lubuk Pakam',
    locationDetails: 'Lubuk Pakam, Deli Serdang (5 Menit ke Kompleks Perkantoran Pemkab)',
    category: 'subsidi',
    houseType: 'Tipe 36 Asri FLPP',
    landBuildingSize: 'LB: 36 m² • LT: 78 m² (6 x 13 m)',
    priceStartIdr: 166000000,
    estMonthlyCicilanIdr: 1050000,
    googleMapsUrl: 'https://maps.google.com/?q=Lubuk+Pakam+Deli+Serdang',
    specs: {
      bedrooms: 2,
      bathrooms: 1,
      carport: true,
      electricalWatt: 1300,
      waterSource: 'Sumur Bor Bersih',
      wallMaterial: 'Dinding Bata Merah Kokoh',
      roofMaterial: 'Baja Ringan SNI',
      flooring: 'Keramik 40x40 cm',
    },
    highlights: [
      'Dekat Kantor Bupati Deli Serdang & RSUD Amri Tambunan',
      '5 Menit ke Gerbang Tol Lubuk Pakam',
      'Sisa tanah halaman belakang luas untuk dapur',
      'Bebas biaya akad dan subsidi bantuan uang muka',
    ],
    description:
      'Hunian asri nan tenang di jantung Lubuk Pakam. Kawasan ramah anak dengan udara segar, jalan paving block rapi, dan kemudahan akses ke seluruh fasilitas pemerintahan dan layanan publik Deli Serdang.',
    whatsappContact: '6281265000102',
  },
  {
    id: 'p-03',
    slug: 'harmony-hills',
    name: 'Harmony Hills',
    region: 'Patumbak',
    locationDetails: 'Patumbak, Deli Serdang (Akses Langsung Medan Amplas)',
    category: 'subsidi',
    houseType: 'Tipe 36 Hills Modern',
    landBuildingSize: 'LB: 36 m² • LT: 72 m² (6 x 12 m)',
    priceStartIdr: 166000000,
    estMonthlyCicilanIdr: 1050000,
    googleMapsUrl: 'https://maps.google.com/?q=Patumbak+Deli+Serdang',
    specs: {
      bedrooms: 2,
      bathrooms: 1,
      carport: true,
      electricalWatt: 1300,
      waterSource: 'Sumur Bor Jernih',
      wallMaterial: 'Bata Merah Finishing Cat Weatherproof',
      roofMaterial: 'Rangka Baja Ringan & Atap Spandek/Metal',
      flooring: 'Keramik Granit Polos',
    },
    highlights: [
      '15 Menit ke Terminal Terpadu Amplas & Flyover',
      'Kontur perbukitan alami tinggi bebas banjir',
      'Desain fasad minimalis modern gaya Scandinavia',
      'Keamanan satu pintu (One-Gate Security)',
    ],
    description:
      'Pilihan favorit bagi warga Medan Selatan dan sekitarnya. Terletak di Patumbak dengan suasana perbukitan sejuk, bebas kebisingan kota, namun tetap sangat dekat dengan pusat kota Medan melalui koridor Amplas.',
    whatsappContact: '6281265000103',
  },
  {
    id: 'p-04',
    slug: 'setia-residence',
    name: 'Setia Residence',
    region: 'Klumpang',
    locationDetails: 'Klumpang, Kec. Hamparan Perak, Deli Serdang',
    category: 'subsidi',
    houseType: 'Tipe 36 Klumpang',
    landBuildingSize: 'LB: 36 m² • LT: 72 m² (6 x 12 m)',
    priceStartIdr: 166000000,
    estMonthlyCicilanIdr: 1050000,
    googleMapsUrl: 'https://maps.google.com/?q=Klumpang+Hamparan+Perak',
    specs: {
      bedrooms: 2,
      bathrooms: 1,
      carport: true,
      electricalWatt: 1300,
      waterSource: 'Sumur Bor',
      wallMaterial: 'Bata Merah Diplester',
      roofMaterial: 'Baja Ringan',
      flooring: 'Keramik 40x40 cm',
    },
    highlights: [
      'Akses ke Tol Marelan & Helvetia',
      'Kawasan berkembang pesat dengan prospek investasi tinggi',
      'Dekat sarana ibadah dan pasar tradisional',
    ],
    description:
      'Solusi rumah subsidi bagi keluarga di Medan Utara dan Hamparan Perak. Lingkungan tertata dengan harga terjangkau dan legalitas aman terverifikasi.',
    whatsappContact: '6281265000104',
  },
  {
    id: 'p-05',
    slug: 'samudera-residence',
    name: 'Samudera Residence',
    region: 'Binjai',
    locationDetails: 'Binjai Timur, Kota Binjai (Dekat Stasiun & Gerbang Tol)',
    category: 'subsidi',
    houseType: 'Tipe 36 Binjai Emas',
    landBuildingSize: 'LB: 36 m² • LT: 72 m² (6 x 12 m)',
    priceStartIdr: 166000000,
    estMonthlyCicilanIdr: 1050000,
    googleMapsUrl: 'https://maps.google.com/?q=Binjai+Timur+Sumatera+Utara',
    specs: {
      bedrooms: 2,
      bathrooms: 1,
      carport: true,
      electricalWatt: 1300,
      waterSource: 'PDAM / Sumur Bor',
      wallMaterial: 'Dinding Bata Merah',
      roofMaterial: 'Baja Ringan',
      flooring: 'Keramik 40x40 cm',
    },
    highlights: [
      'Akses kilat ke Stasiun Kereta Api Binjai',
      'Dekat jalan lintas Medan - Binjai',
      'Pusat niaga dan perbelanjaan Binjai terjangkau',
    ],
    description:
      'Miliki hunian impian di Kota Rambutan Binjai. Kemudahan komuter kereta api menuju pusat kota Medan dalam 20 menit menjadikan Samudera Residence pilihan investasi cerdas bagi pekerja komuter.',
    whatsappContact: '6281265000105',
  },
];

export default function PublicCatalogPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [activeSimModalProject, setActiveSimModalProject] = useState<CatalogProject | null>(null);

  const filteredProjects = CATALOG_PROJECTS.filter((proj) => {
    if (selectedRegion !== 'all' && proj.region !== selectedRegion) return false;
    return true;
  });

  const regions = ['all', 'Batang Kuis', 'Lubuk Pakam', 'Patumbak', 'Klumpang', 'Binjai'];

  const formatIdr = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getWhatsAppLink = (proj: CatalogProject) => {
    const text = encodeURIComponent(
      `Halo Tim Marketing PT Sedaya Property, saya berminat dengan unit di *${proj.name}* (${proj.region}).\n\nBoleh minta info sisa unit, simulasi angsuran KPR subsidi, dan jadwal survey ke lokasi? Terima kasih.`
    );
    return `https://wa.me/${proj.whatsappContact}?text=${text}`;
  };

  return (
    <div className="min-h-dvh bg-warm-canvas text-ink-black flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-paper-white/95 backdrop-blur-md border-b border-sand-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-paper-white border border-sand-border flex items-center justify-center p-1 shrink-0 shadow-xs">
              <SedayaLogo className="w-full h-full text-ink-black" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-ink-black block leading-none">
                SEDAYA PROPERTY
              </span>
              <span className="text-[11px] text-stone-gray font-medium block mt-0.5">
                Katalog Resmi Perumahan Subsidi • Medan & Deli Serdang
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/public"
              className="btn-pill-ghost text-xs py-2 px-3 text-stone-gray hover:text-ink-black"
            >
              <span>Portal Eksekutif</span>
            </Link>
            <Link
              href="/login"
              className="btn-pill-primary text-xs py-2 px-3 bg-forest text-paper-white hover:bg-forest-emerald"
            >
              <span>Login Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-paper-white border-b border-sand-border py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-surface border border-forest-border text-xs font-bold text-forest">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>KPR Bersubsidi Pemerintah (FLPP) 2026 • Bunga 5% Flat Sampai Lunas</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-black tracking-tight max-w-3xl mx-auto leading-tight">
            Wujudkan Rumah Impian Keluarga Anda di Kawasan Strategis Sumatera Utara
          </h1>

          <p className="text-xs sm:text-sm text-stone-gray max-w-2xl mx-auto leading-relaxed">
            Dikelola resmi oleh <strong>PT Sedaya Property</strong>. Booking fee mulai Rp 1 Juta, gratis biaya proses akad, dan didampingi proses bank sampai terima kunci.
          </p>

          {/* Region Tabs */}
          <div className="pt-4 flex flex-wrap justify-center items-center gap-2">
            {regions.map((reg) => (
              <button
                key={reg}
                type="button"
                onClick={() => setSelectedRegion(reg)}
                className={`px-4 py-2 min-h-10 rounded-full text-xs font-bold transition-all border ${
                  selectedRegion === reg
                    ? 'bg-ink-black text-paper-white border-ink-black shadow-xs'
                    : 'bg-paper-white text-stone-gray border-sand-border hover:text-ink-black hover:border-sand-hover'
                }`}
              >
                {reg === 'all' ? 'Semua Wilayah' : reg}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Catalog Cards Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="card-clay overflow-hidden flex flex-col justify-between border-sand-border hover:border-forest/50 transition-all group"
            >
              {/* Card Header & Visual Badge */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-forest-surface text-forest inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {proj.region}
                    </span>
                    <h2 className="text-xl font-bold text-ink-black mt-1.5 group-hover:text-forest transition-colors">
                      {proj.name}
                    </h2>
                    <p className="text-xs text-stone-gray mt-0.5">{proj.locationDetails}</p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-forest text-paper-white metric-mono">
                    {proj.houseType}
                  </span>
                </div>

                {/* Key Room Specs */}
                <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-xl bg-warm-cream border border-sand-border">
                  <div className="flex flex-col items-center">
                    <Bed className="w-4 h-4 text-forest" />
                    <span className="text-[11px] font-bold text-ink-black mt-1">
                      {proj.specs.bedrooms} KT
                    </span>
                    <span className="text-[9px] text-stone-gray">Kamar Tidur</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Bath className="w-4 h-4 text-forest" />
                    <span className="text-[11px] font-bold text-ink-black mt-1">
                      {proj.specs.bathrooms} KM
                    </span>
                    <span className="text-[9px] text-stone-gray">Kamar Mandi</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Car className="w-4 h-4 text-forest" />
                    <span className="text-[11px] font-bold text-ink-black mt-1">
                      {proj.specs.carport ? 'Ada' : '-'}
                    </span>
                    <span className="text-[9px] text-stone-gray">Carport Mobil</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Maximize2 className="w-4 h-4 text-forest" />
                    <span className="text-[11px] font-bold text-ink-black mt-1">Tipe 36</span>
                    <span className="text-[9px] text-stone-gray">72 m² Tanah</span>
                  </div>
                </div>

                <p className="text-xs text-stone-gray leading-relaxed font-sans">
                  {proj.description}
                </p>

                {/* Highlights */}
                <div className="space-y-1.5 pt-2 border-t border-sand-border">
                  <span className="text-[11px] font-bold text-ink-black uppercase tracking-wider block">
                    Keunggulan Utama:
                  </span>
                  {proj.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-stone-gray">
                      <Check className="w-3.5 h-3.5 text-forest shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Technical Specs Accordion/List */}
                <div className="p-3 rounded-xl bg-paper-white border border-sand-border space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-gray">
                    <span>Struktur Dinding:</span>
                    <strong className="text-ink-black font-semibold">{proj.specs.wallMaterial}</strong>
                  </div>
                  <div className="flex justify-between text-stone-gray">
                    <span>Rangka Atap:</span>
                    <strong className="text-ink-black font-semibold">{proj.specs.roofMaterial}</strong>
                  </div>
                  <div className="flex justify-between text-stone-gray">
                    <span>Lantai:</span>
                    <strong className="text-ink-black font-semibold">{proj.specs.flooring}</strong>
                  </div>
                  <div className="flex justify-between text-stone-gray">
                    <span>Listrik & Air:</span>
                    <strong className="text-ink-black font-semibold">
                      PLN {proj.specs.electricalWatt}W • {proj.specs.waterSource}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="p-5 sm:p-6 bg-warm-cream border-t border-sand-border space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-stone-gray uppercase tracking-wider font-bold block">
                      Harga Rumah Subsidi Resmi
                    </span>
                    <span className="metric-mono text-lg sm:text-xl font-bold text-ink-black block">
                      {formatIdr(proj.priceStartIdr)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-forest uppercase tracking-wider font-bold block">
                      Estimasi Angsuran KPR
                    </span>
                    <span className="metric-mono text-base sm:text-lg font-bold text-forest block">
                      ~{formatIdr(proj.estMonthlyCicilanIdr)}{' '}
                      <small className="text-[10px] text-stone-gray font-normal">/bulan</small>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveSimModalProject(proj)}
                    className="btn-pill-ghost text-xs py-2.5 px-3 flex items-center justify-center gap-1.5 border-sand-border bg-paper-white text-ink-black hover:border-sand-hover"
                  >
                    <Calculator className="w-3.5 h-3.5 text-stone-gray" />
                    <span>Simulasi KPR</span>
                  </button>

                  <a
                    href={getWhatsAppLink(proj)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-pill-primary text-xs py-2.5 px-3 flex items-center justify-center gap-1.5 bg-forest text-paper-white hover:bg-forest-emerald shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Tanya via WhatsApp</span>
                  </a>
                </div>

                <a
                  href={proj.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center text-[11px] font-semibold text-stone-gray hover:text-ink-black flex items-center justify-center gap-1 pt-1"
                >
                  <Compass className="w-3 h-3 text-forest" />
                  <span>Lihat Petunjuk Arah di Google Maps</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* SIMULASI MODAL POPUP */}
      {activeSimModalProject && (
        <div className="fixed inset-0 z-50 bg-ink-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper-white border border-sand-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between pb-3 border-b border-sand-border">
              <div>
                <span className="text-[10px] font-bold text-forest uppercase tracking-wider block">
                  Simulasi Angsuran Subsidi FLPP 2026
                </span>
                <h3 className="text-base font-bold text-ink-black mt-0.5">
                  {activeSimModalProject.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSimModalProject(null)}
                className="text-stone-gray hover:text-ink-black text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-warm-cream border border-sand-border flex justify-between items-center">
                <span className="text-stone-gray font-semibold">Harga Rumah:</span>
                <span className="metric-mono font-bold text-ink-black">
                  {formatIdr(activeSimModalProject.priceStartIdr)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-warm-cream border border-sand-border flex justify-between items-center">
                <span className="text-stone-gray font-semibold">Uang Muka (DP 1%):</span>
                <span className="metric-mono font-bold text-forest">Rp 1.660.000</span>
              </div>

              <div className="p-3 rounded-xl bg-warm-cream border border-sand-border flex justify-between items-center">
                <span className="text-stone-gray font-semibold">Plafond KPR BTN/BSI:</span>
                <span className="metric-mono font-bold text-ink-black">Rp 164.340.000</span>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider block">
                  Pilihan Tenor & Angsuran Tetap (Bunga 5% Flat):
                </span>
                <div className="p-2.5 rounded-lg bg-forest-surface border border-forest-border flex justify-between items-center">
                  <span className="font-bold text-forest">Tenor 20 Tahun:</span>
                  <span className="metric-mono font-bold text-forest">~Rp 1.050.000 / bulan</span>
                </div>
                <div className="p-2.5 rounded-lg bg-warm-canvas border border-sand-border flex justify-between items-center">
                  <span className="font-semibold text-ink-black">Tenor 15 Tahun:</span>
                  <span className="metric-mono font-bold text-ink-black">~Rp 1.290.000 / bulan</span>
                </div>
                <div className="p-2.5 rounded-lg bg-warm-canvas border border-sand-border flex justify-between items-center">
                  <span className="font-semibold text-ink-black">Tenor 10 Tahun:</span>
                  <span className="metric-mono font-bold text-ink-black">~Rp 1.740.000 / bulan</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Catatan Promo:</strong> Biaya proses bank, AJB, BPHTB, dan asuransi disubsidi pengembang untuk pembelian bulan ini.
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <a
                href={getWhatsAppLink(activeSimModalProject)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pill-primary w-full py-2.5 text-xs text-center flex items-center justify-center gap-1.5 bg-forest text-paper-white hover:bg-forest-emerald"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Konsultasikan Berkas via WA</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-paper-white border-t border-sand-border py-8 text-center text-xs text-stone-gray">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-2">
          <p className="font-semibold text-ink-black">
            PT SEDAYA PROPERTY • Divisi Pemasaran & Operasional Lapangan
          </p>
          <p className="text-[11px] text-stone-gray max-w-xl mx-auto">
            Terdaftar dan diawasi oleh Kementerian PKP Republik Indonesia & BP Tapera. Menjamin mutu bangunan berkualitas dan kemudahan akses kepemilikan rumah pertama.
          </p>
          <p className="text-[10px] text-stone-gray pt-2">
            © 2026 Sedaya Property. Hak cipta dilindungi undang-undang.
          </p>
        </div>
      </footer>
    </div>
  );
}
