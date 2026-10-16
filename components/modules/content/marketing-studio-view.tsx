'use client';

import { useState } from 'react';
import {
  Sparkles,
  Video,
  Layers,
  Megaphone,
  Copy,
  Check,
  CalendarPlus,
  RefreshCw,
  Building2,
  Clock,
  Flame,
  ArrowRight,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { INITIAL_PROJECTS, INITIAL_PROFILES } from '@/lib/data/seed-data';
import { usePersistentState, STORAGE_KEYS, generateUUID } from '@/lib/storage/persistence';
import { ContentItem, ContentPillar, ContentFormat, ContentStatus } from '@/lib/types/database';
import { INITIAL_CONTENT_ITEMS } from '@/lib/data/seed-plans-content';

type StudioMode = 'reels' | 'carousel' | 'ads';

interface ScriptScene {
  timeframe: string;
  section: string;
  visualCue: string;
  audioVoiceover: string;
  textOnScreen: string;
}

interface GeneratedReelScript {
  title: string;
  hookHeadline: string;
  targetDuration: string;
  scenes: ScriptScene[];
  caption: string;
  hashtags: string[];
}

interface GeneratedCarousel {
  title: string;
  slides: {
    number: number;
    title: string;
    body: string;
    visualNote: string;
  }[];
  caption: string;
  hashtags: string[];
}

interface GeneratedAdCopy {
  campaignName: string;
  headlines: string[];
  primaryTexts: { label: string; text: string }[];
  ctaButton: string;
  targetAudienceAdvice: string;
}

export function MarketingStudioView({
  onSavedToCalendar,
}: {
  onSavedToCalendar?: () => void;
}) {
  const [items, setItems] = usePersistentState<ContentItem[]>(
    STORAGE_KEYS.CONTENT_ITEMS,
    INITIAL_CONTENT_ITEMS
  );

  const [activeMode, setActiveMode] = useState<StudioMode>('reels');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    INITIAL_PROJECTS[0].id
  );
  const [selectedAngle, setSelectedAngle] = useState<string>('ngontrak_vs_beli');
  const [selectedTone, setSelectedTone] = useState<string>('relatable');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const currentProject =
    INITIAL_PROJECTS.find((p) => p.id === selectedProjectId) || INITIAL_PROJECTS[0];

  const copyToClipboard = (key: string, text: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Pre-configured dynamic generators tailored to Sedaya Property projects
  const getReelScript = (): GeneratedReelScript => {
    const isKualanamu = currentProject.location.toLowerCase().includes('batang kuis');
    const isPakam = currentProject.location.toLowerCase().includes('lubuk pakam');

    if (selectedAngle === 'ngontrak_vs_beli') {
      return {
        title: `Naskah Reel: Ngontrak vs Cicil ${currentProject.name}`,
        hookHeadline: 'Masih mau buang 1,5 juta sebulan cuma buat bayar kontrakan orang?',
        targetDuration: '30 Detik',
        scenes: [
          {
            timeframe: '00:00 - 00:03',
            section: 'Hook (Stopping Power)',
            visualCue:
              'Talenta memegang kuitansi sewa kontrakan sambil menghela nafas di depan kamera (fast zoom-in).',
            audioVoiceover:
              '"Tiap awal bulan gajian lewat cuma buat bayar kontrakan yang ujungnya bukan punya kita?"',
            textOnScreen: 'STOP BUANG UANG KONTRAKAN!',
          },
          {
            timeframe: '00:04 - 00:10',
            section: 'Agitasi Masalah',
            visualCue:
              'Cut ke cuplikan jalanan macet dan rumah sempit kontrakan di Medan.',
            audioVoiceover:
              '"Padahal di tahun 2026 ini, cicilan rumah subsidi resmi dari pemerintah itu cuma 1 jutaan flat per bulan."',
            textOnScreen: 'Cicilan 1 Jutaan Flat / Bulan',
          },
          {
            timeframe: '00:11 - 00:20',
            section: 'Solusi & Spill Proyek',
            visualCue: `Transisi cepat ke gerbang megah ${currentProject.name} di ${currentProject.location}, jalan cor beton lebar dan fasad rumah asri.`,
            audioVoiceover: `"Kenalin ${currentProject.name}! Lokasinya cuma ${
              isKualanamu
                ? '10 menit dari Bandara Kualanamu'
                : isPakam
                ? '5 menit dari pusat Lubuk Pakam & Tol'
                : 'sangat dekat dengan akses utama kota'
            }. Sudah ramai penghuni dan bebas banjir."`,
            textOnScreen: `${currentProject.name} • ${currentProject.location}`,
          },
          {
            timeframe: '00:21 - 00:26',
            section: 'Spesifikasi & Promo',
            visualCue:
              'Kamera masuk ke dalam rumah contoh: ruang tamu lega, 2 kamar tidur, dan sisa tanah belakang.',
            audioVoiceover:
              '"Tipe 36, 2 kamar tidur, dinding bata merah kokoh. Booking fee cuma 1 Juta dan bebas biaya akad!"',
            textOnScreen: 'Booking 1 Juta • Free Biaya Akad',
          },
          {
            timeframe: '00:27 - 00:30',
            section: 'Call To Action',
            visualCue:
              'Talenta tersenyum di depan carport sambil menunjuk ke link profil / bio.',
            audioVoiceover:
              '"Jangan tunggu kuota FLPP habis. Ketik MAU di kolom komentar sekarang buat dapetin jadwal survey!"',
            textOnScreen: 'Ketik "MAU" di Komentar 👇',
          },
        ],
        caption: `Stop buang uang kontrakan tiap bulan! Di ${currentProject.name} (${currentProject.location}), kamu sudah bisa punya rumah sendiri dengan cicilan mulai 1 jutaan flat per bulan.\n\nKeunggulan:\n✅ Legalitas aman & sertifikat SHM\n✅ Akses super strategis\n✅ Dinding bata merah kokoh & jalan cor beton\n✅ Bebas biaya proses akad kredit\n\nKuota subsidi FLPP 2026 terbatas! Klik link di bio atau ketik "MAU" di kolom komentar untuk dibantu konsultasi berkas sampai akad.`,
        hashtags: [
          '#RumahSubsidiMedan',
          `#${currentProject.name.replace(/\s+/g, '')}`,
          `#Rumah${currentProject.location.replace(/\s+/g, '')}`,
          '#KPRSubsidiBTN',
          '#SedayaProperty',
          '#RumahPertama',
        ],
      };
    }

    if (selectedAngle === 'edukasi_kpr') {
      return {
        title: `Naskah Reel: Cara Lolos KPR Subsidi di ${currentProject.name}`,
        hookHeadline: 'Gaji 3 sampai 6 juta tapi takut ditolak bank? Terapkan 3 rumus ini!',
        targetDuration: '35 Detik',
        scenes: [
          {
            timeframe: '00:00 - 00:03',
            section: 'Hook (Edukasi)',
            visualCue:
              'Talenta duduk di meja kantor pemasaran Sedaya Property dengan map berkas bertuliskan "KPR Disetujui".',
            audioVoiceover:
              '"Banyak yang ngira beli rumah subsidi itu susah. Padahal kalau kamu tahu 3 rumus ini, pengajuan KPR kamu pasti lolos!"',
            textOnScreen: '3 RUMUS LOLOS KPR SUBSIDI 2026',
          },
          {
            timeframe: '00:04 - 00:14',
            section: 'Poin 1 & 2',
            visualCue:
              'Grafis teks bersih: 1. SLIK OJK bersih dari pinjol/paylater. 2. Rekening koran aktif 3 bulan.',
            audioVoiceover:
              '"Pertama, pastikan BI Checking atau SLIK kamu bersih dari tunggakan paylater. Kedua, slip gaji dan mutasi rekening 3 bulan harus rapi."',
            textOnScreen: '1. Bersihkan Paylater\n2. Rekening Koran Rapi',
          },
          {
            timeframe: '00:15 - 00:24',
            section: 'Poin 3 & Value',
            visualCue: `Shoot video jalan perumahan ${currentProject.name} dan rumah-rumah yang sudah serah terima kunci.`,
            audioVoiceover: `"Dan ketiga, pilih developer resmi terpercaya seperti ${currentProject.name}. Tim marketing kami bakal dampingi berkas kamu dari awal sampai akad di bank rekanan."`,
            textOnScreen: `Didampingi Sampai Akad • ${currentProject.name}`,
          },
          {
            timeframe: '00:25 - 00:35',
            section: 'Call To Action',
            visualCue:
              'Talenta memegang kunci rumah di teras unit contoh sambil memberikan gesture ramah.',
            audioVoiceover:
              '"Mau dibantu cek BI Checking dan kelayakan KPR secara gratis? Klik tombol WhatsApp di profil Sedaya Property sekarang juga!"',
            textOnScreen: 'Cek Kelayakan KPR Gratis via WA 📲',
          },
        ],
        caption: `Jangan biarkan impian punya rumah terkubur cuma karena takut ribet berkas! Tim profesional Sedaya Property siap membantu dan mendampingi proses KPR subsidi kamu di ${currentProject.name} sampai serah terima kunci.\n\nSyarat mudah:\n1. Belum pernah memiliki rumah subsidi\n2. Gaji pokok sesuai ketentuan pemerintah\n3. SLIK OJK lancar\n\nKonsultasikan berkas kamu secara gratis melalui link di bio.`,
        hashtags: [
          '#EdukasiKPR',
          '#SyaratKPRSubsidi',
          `#${currentProject.name.replace(/\s+/g, '')}`,
          '#SedayaProperty',
          '#KPRBankBTN',
          '#RumahMedan',
        ],
      };
    }

    // Default: Aksesibilitas
    return {
      title: `Naskah Reel: Spill Lokasi Emas ${currentProject.name}`,
      hookHeadline: `Ternyata cuma 10 menit ke Bandara Kualanamu ada perumahan subsidi sekeren ini!`,
      targetDuration: '30 Detik',
      scenes: [
        {
          timeframe: '00:00 - 00:03',
          section: 'Hook (Visual Shock)',
          visualCue:
            'Pesawat landing di Bandara Kualanamu cut langsung ke plang jalan menuju Batang Kuis / proyek.',
          audioVoiceover: `"Siapa bilang rumah dekat fasilitas utama itu harus mahal ratusan juta?"`,
          textOnScreen: 'RUMAH SUBSIDI DEKAT KUALANAMU ✈️',
        },
        {
          timeframe: '00:04 - 00:15',
          section: 'Jarak & Akses',
          visualCue:
            'Footage speedometer motor/mobil dan rute mulus beraspal menuju lokasi proyek.',
          audioVoiceover: `"Dari bandara ke ${currentProject.name} cuma sekitar 10 menit! Dekat stasiun kereta api, pasar tradisional, dan sekolah."`,
          textOnScreen: '10 Menit Bandara • Bebas Macet',
        },
        {
          timeframe: '00:16 - 00:25',
          section: 'Fasilitas Kawasan',
          visualCue:
            'Drone shot kawasan perumahan yang asri, jalan cor lebar, drainase rapi tertutup.',
          audioVoiceover:
            '"Kawasannya sudah padat terhuni, tetangga ramah, jalan paving/cor lebar muat 2 mobil, dan pastinya bebas banjir."',
          textOnScreen: 'Kawasan Asri & Tetangga Ramah',
        },
        {
          timeframe: '00:26 - 00:30',
          section: 'Call To Action',
          visualCue:
            'Penyerahan kunci ke konsumen bahagia di depan rumah tipe 36.',
          audioVoiceover:
            '"Sisa unit posisi hook dan depan tinggal sedikit. DM sekarang buat amankan blok terbaik kamu!"',
          textOnScreen: 'DM Sekarang Buat Amankan Unit!',
        },
      ],
      caption: `Lokasi strategis adalah kunci kenyamanan keluarga! ${currentProject.name} di ${currentProject.location} hadir dengan akses kilat ke transportasi publik dan pusat kota.\n\n📍 Dekat Bandara Internasional Kualanamu\n📍 Lingkungan aman dengan one-gate system\n📍 Cicilan tetap 1 jutaan flat\n\nAmankan posisi unit favoritmu sebelum kehabisan. Chat admin di bio sekarang!`,
      hashtags: [
        '#LokasiStrategis',
        `#${currentProject.name.replace(/\s+/g, '')}`,
        '#BatangKuis',
        '#BandaraKualanamu',
        '#RumahSubsidiDeliSerdang',
        '#SedayaProperty',
      ],
    };
  };

  const getCarouselData = (): GeneratedCarousel => {
    return {
      title: `Carousel 6 Slide: 5 Alasan Memilih ${currentProject.name}`,
      slides: [
        {
          number: 1,
          title: 'Slide 1 (Cover)',
          body: `5 ALASAN KENAPA ${currentProject.name.toUpperCase()} JADI PILIHAN TERBAIK KELUARGA MUDA DI TAHUN 2026`,
          visualNote:
            'Foto tajam fasad rumah minimalis tipe 36 dengan pencahayaan sore hari dan badge "Rumah Subsidi Resmi".',
        },
        {
          number: 2,
          title: 'Slide 2 (Lokasi Strategis)',
          body: `1. AKSES MUDAH & CEPAT\nTerletak di kawasan berkembang ${currentProject.location}. Dekat jalan lintas utama, fasilitas pendidikan, rumah sakit, dan pusat perbelanjaan lokal.`,
          visualNote: 'Grafis peta infografis jarak tempuh menit ke fasilitas utama.',
        },
        {
          number: 3,
          title: 'Slide 3 (Kualitas Bangunan)',
          body: `2. SPESIFIKASI DI ATAS RATA-RATA\nMenggunakan dinding batu bata merah kokoh berplester, struktur beton bertulang, atap baja ringan anti-rayap, dan kusen aluminium tahan cuaca.`,
          visualNote: 'Close-up foto detail finishing dinding dan atap kokoh.',
        },
        {
          number: 4,
          title: 'Slide 4 (Lingkungan & Fasilitas)',
          body: `3. KAWASAN SUDAH RAMAI & BEBAS BANJIR\nBukan perumahan mati di tengah hutan. Row jalan lingkungan lebar 7-8 meter, saluran drainase terencana, dan suasana ramah anak.`,
          visualNote: 'Foto suasana jalan kompleks yang bersih dengan mobil terparkir rapi.',
        },
        {
          number: 5,
          title: 'Slide 5 (Kepastian Biaya & Angsuran)',
          body: `4. CICILAN RINGAN MULAI RP 1 JUTAAN\nSkema KPR FLPP subsidi pemerintah dengan suku bunga 5% fixed sampai lunas. Bebas biaya PPN dan subsidi bantuan uang muka.`,
          visualNote: 'Tabel perbandingan cicilan tenor 10, 15, dan 20 tahun.',
        },
        {
          number: 6,
          title: 'Slide 6 (Call to Action)',
          body: `AMANKAN BLOK FAVORIT KAMU HARI INI!\n\nBooking fee hanya Rp 1.000.000.\nKonsultasi syarat KPR & jadwal survey lokasi:\n📲 Klik link di bio @sedayagroup\n💬 Atau ketik "SURVEY" di kolom komentar.`,
          visualNote:
            'Logo resmi Sedaya Property, kontak WhatsApp kantor pemasaran, dan foto tim sales ramah.',
        },
      ],
      caption: `Sedang cari rumah pertama dengan cicilan terjangkau tapi gak mau kompromi soal lokasi dan kualitas? Geser slide di atas untuk tahu kenapa ${currentProject.name} jadi primadona di ${currentProject.location}!\n\nJangan tunda sampai harga material dan kuota subsidi berganti. Konsultasikan bersama kami sekarang.\n\n#SedayaProperty #${currentProject.name.replace(/\s+/g, '')} #RumahSubsidi #KPRSubsidi`,
      hashtags: [
        '#CarouselProperti',
        '#TipsBeliRumah',
        `#${currentProject.name.replace(/\s+/g, '')}`,
        '#SedayaProperty',
      ],
    };
  };

  const getAdCopyData = (): GeneratedAdCopy => {
    return {
      campaignName: `Meta & TikTok Ads: ${currentProject.name}`,
      headlines: [
        `Rumah Subsidi di ${currentProject.location}, Cicilan 1 Juta Flat!`,
        `Cuma 10 Menit ke Kualanamu, DP Nol & Bebas Biaya Akad`,
        `Stop Bayar Kontrakan! Miliki Rumah Sendiri di ${currentProject.name}`,
      ],
      primaryTexts: [
        {
          label: 'Versi Pendek (High CTR)',
          text: `Gaji UMR Medan & Deli Serdang bisa punya rumah sendiri! ${currentProject.name} (${currentProject.location}) menawarkan unit subsidi tipe 36 dengan cicilan mulai Rp 1 jutaan flat. Booking cuma 1 Juta, gratis biaya akad. Kuota terbatas! Klik Kirim Pesan untuk info blok.`,
        },
        {
          label: 'Versi Panjang (Storytelling & Filtering)',
          text: `Capek tiap bulan bayar kontrakan yang nilainya naik terus tapi bukan jadi milik sendiri?\n\nKini hadir solusi hunian resmi bersubsidi pemerintah di ${currentProject.location}: ${currentProject.name}.\n\nKeunggulan Utama:\n• Struktur kokoh dinding bata merah & atap baja ringan\n• 2 Kamar Tidur, 1 Kamar Mandi, sisa tanah belakang luas\n• Kawasan tertata dengan row jalan lebar dan bebas banjir\n• Suku bunga KPR subsidi 5% tetap sampai lunas\n\nTim marketing kami siap mendampingi pengecekan BI Checking dan pemberkasan bank secara gratis sampai akad disetujui.\n\nKlik tombol Kirim Pesan di bawah untuk klaim promo bebas biaya akad bulan ini!`,
        },
      ],
      ctaButton: 'Kirim Pesan WhatsApp / Selengkapnya',
      targetAudienceAdvice:
        'Target Wilayah: Kota Medan, Deli Serdang (Kec. Batang Kuis, Lubuk Pakam, Tanjung Morawa, Percut Sei Tuan). Usia: 23 - 42 tahun. Minat: KPR, Rumah Idaman, Bank BTN, Bank Syariah Indonesia, Investasi Properti.',
    };
  };

  const reelScript = getReelScript();
  const carouselData = getCarouselData();
  const adCopyData = getAdCopyData();

  const handleSaveToCalendar = () => {
    const newItem: ContentItem = {
      id: generateUUID(),
      title:
        activeMode === 'reels'
          ? reelScript.title
          : activeMode === 'carousel'
          ? carouselData.title
          : `Iklan Digital: ${currentProject.name}`,
      pillar: activeMode === 'ads' ? 'promo' : 'product_info',
      format: activeMode === 'reels' ? 'reel' : activeMode === 'carousel' ? 'carousel' : 'single_post',
      publish_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      publish_time: '19:00',
      project_id: selectedProjectId,
      channel_id: '22222222-2222-2222-2222-222222222201',
      pic_id: INITIAL_PROFILES[1].id, // Ziyad as branding officer
      status: 'in_production',
      brief:
        activeMode === 'reels'
          ? `Naskah Reel Hook: "${reelScript.hookHeadline}" (Durasi ${reelScript.targetDuration})`
          : activeMode === 'carousel'
          ? `Carousel 6 slide perumahan ${currentProject.name}`
          : `Ad copy varian untuk kampanye berbayar`,
      caption:
        activeMode === 'reels'
          ? `${reelScript.caption}\n\n${reelScript.hashtags.join(' ')}`
          : activeMode === 'carousel'
          ? `${carouselData.caption}\n\n${carouselData.hashtags.join(' ')}`
          : adCopyData.primaryTexts[1].text,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project: currentProject,
      pic: INITIAL_PROFILES[1],
    };

    setItems((prev) => [newItem, ...prev]);
    setSaveSuccessMsg(`Berhasil dijadwalkan ke Kalender Konten! (Status: Dalam Produksi)`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
    if (onSavedToCalendar) onSavedToCalendar();
  };

  return (
    <div className="space-y-6">
      {/* Studio Mode Selector & Controls */}
      <div className="bento-card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-surface border border-forest-border flex items-center justify-center text-forest shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-ink-black flex items-center gap-2">
              Marketing Studio & Naskah Kreatif
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest text-paper-white uppercase tracking-wider">
                Sedaya Engine
              </span>
            </h2>
            <p className="text-xs text-stone-gray mt-0.5">
              Generator naskah video Reels/TikTok 5 bagian, copywriter Carousel, dan ad creative matrix.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-warm-cream border border-sand-border self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setActiveMode('reels')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'reels'
                ? 'bg-paper-white text-ink-black shadow-xs border border-sand-border'
                : 'text-stone-gray hover:text-ink-black'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-forest" />
            <span>Naskah Video Reels / TikTok</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('carousel')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'carousel'
                ? 'bg-paper-white text-ink-black shadow-xs border border-sand-border'
                : 'text-stone-gray hover:text-ink-black'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Copy Carousel (6 Slide)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('ads')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'ads'
                ? 'bg-paper-white text-ink-black shadow-xs border border-sand-border'
                : 'text-stone-gray hover:text-ink-black'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-blue-600" />
            <span>Teks Iklan Meta / Ads</span>
          </button>
        </div>
      </div>

      {/* Configuration Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card-clay p-3">
          <label className="text-[11px] font-bold text-stone-gray uppercase tracking-wider block mb-1">
            Target Proyek
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full text-xs font-semibold bg-paper-white border border-sand-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-forest"
          >
            {INITIAL_PROJECTS.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name} ({proj.location})
              </option>
            ))}
          </select>
        </div>

        <div className="card-clay p-3">
          <label className="text-[11px] font-bold text-stone-gray uppercase tracking-wider block mb-1">
            Sudut Pandang (Angle)
          </label>
          <select
            value={selectedAngle}
            onChange={(e) => setSelectedAngle(e.target.value)}
            className="w-full text-xs font-semibold bg-paper-white border border-sand-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-forest"
          >
            <option value="ngontrak_vs_beli">Ngontrak vs Beli Rumah Sendiri</option>
            <option value="edukasi_kpr">Edukasi KPR Subsidi & Syarat Gaji</option>
            <option value="akses_lokasi">Akses Strategis & Dekat Kualanamu / Tol</option>
          </select>
        </div>

        <div className="card-clay p-3">
          <label className="text-[11px] font-bold text-stone-gray uppercase tracking-wider block mb-1">
            Gaya Bahasa / Tone
          </label>
          <select
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value)}
            className="w-full text-xs font-semibold bg-paper-white border border-sand-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-forest"
          >
            <option value="relatable">Santai, Dekat & Menggugah</option>
            <option value="formal">Edukatif, Kredibel & Terpercaya</option>
            <option value="urgent">Mendesak (Promo Kuota Terbatas)</option>
          </select>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 rounded-xl bg-forest-surface border border-forest-border text-forest text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* MODE 1: REELS SCRIPT GENERATOR */}
      {activeMode === 'reels' && (
        <div className="space-y-4">
          <div className="bento-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sand-border">
              <div>
                <span className="text-[11px] font-bold text-terracotta uppercase tracking-wider block">
                  Naskah Produksi Konten Video
                </span>
                <h3 className="text-base font-bold text-ink-black mt-0.5">
                  {reelScript.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      'all_script',
                      reelScript.scenes
                        .map(
                          (s) =>
                            `[${s.timeframe}] ${s.section}\nVisual: ${s.visualCue}\nVO: ${s.audioVoiceover}\nText: ${s.textOnScreen}`
                        )
                        .join('\n\n')
                    )
                  }
                  className="btn-pill-ghost text-xs py-1.5 px-3"
                >
                  {copiedKey === 'all_script' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-forest" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-gray" />
                      <span>Salin Naskah</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleSaveToCalendar}
                  className="btn-pill-terracotta text-xs py-1.5 px-3 shadow-2xs"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Jadwalkan ke Kalender Konten</span>
                </button>
              </div>
            </div>

            {/* Hook Highlight */}
            <div className="p-3.5 rounded-xl bg-forest-surface border border-forest-border flex items-start gap-3">
              <Flame className="w-5 h-5 text-forest shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-forest block">
                  3 Detik Pertama (Stopping Hook)
                </span>
                <p className="text-xs sm:text-sm font-bold text-ink-black mt-0.5">
                  &ldquo;{reelScript.hookHeadline}&rdquo;
                </p>
              </div>
            </div>

            {/* Structured 5-Scene Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sand-border text-stone-gray uppercase text-[10px] tracking-wider bg-warm-cream/50">
                    <th className="py-2.5 px-3 font-bold w-24">Durasi</th>
                    <th className="py-2.5 px-3 font-bold w-36">Bagian</th>
                    <th className="py-2.5 px-3 font-bold">Panduan Visual & Aksi Kamera</th>
                    <th className="py-2.5 px-3 font-bold">Audio & Naskah Voiceover</th>
                    <th className="py-2.5 px-3 font-bold w-44">Teks di Layar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border">
                  {reelScript.scenes.map((scene, idx) => (
                    <tr key={idx} className="hover:bg-warm-canvas/40 transition-colors">
                      <td className="py-3 px-3 metric-mono font-bold text-ink-black whitespace-nowrap align-top">
                        {scene.timeframe}
                      </td>
                      <td className="py-3 px-3 font-bold text-ink-black align-top">
                        <span className="px-2 py-0.5 rounded-md bg-warm-cream border border-sand-border block text-center text-[10px]">
                          {scene.section}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-stone-gray leading-relaxed align-top">
                        {scene.visualCue}
                      </td>
                      <td className="py-3 px-3 font-medium text-ink-black leading-relaxed align-top">
                        {scene.audioVoiceover}
                      </td>
                      <td className="py-3 px-3 metric-mono text-[11px] font-bold text-forest align-top">
                        {scene.textOnScreen}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Caption & Hashtags Box */}
            <div className="p-4 rounded-xl bg-warm-canvas border border-sand-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-ink-black uppercase tracking-wider">
                  Rekomendasi Caption & Tagar Siap Pakai
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      'caption_box',
                      `${reelScript.caption}\n\n${reelScript.hashtags.join(' ')}`
                    )
                  }
                  className="text-[11px] font-bold text-forest hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Salin Caption</span>
                </button>
              </div>
              <p className="text-xs text-stone-gray whitespace-pre-line leading-relaxed font-sans">
                {reelScript.caption}
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                {reelScript.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="metric-mono text-[11px] font-semibold text-stone-gray px-2 py-0.5 rounded-full bg-paper-white border border-sand-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: CAROUSEL COPYWRITER */}
      {activeMode === 'carousel' && (
        <div className="space-y-4">
          <div className="card-clay p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sand-border">
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                  Perencana Slide Carousel Instagram (6 Slide)
                </span>
                <h3 className="text-base font-bold text-ink-black mt-0.5">
                  {carouselData.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      'carousel_all',
                      carouselData.slides
                        .map((s) => `[SLIDE ${s.number}] ${s.title}\n${s.body}\nVisual: ${s.visualNote}`)
                        .join('\n\n')
                    )
                  }
                  className="btn-pill-ghost text-xs py-1.5 px-3"
                >
                  {copiedKey === 'carousel_all' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-forest" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-gray" />
                      <span>Salin Semua Slide</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleSaveToCalendar}
                  className="btn-pill-primary text-xs py-1.5 px-3 bg-forest text-paper-white hover:bg-forest-emerald"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Jadwalkan ke Kalender Konten</span>
                </button>
              </div>
            </div>

            {/* 6-Slide Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {carouselData.slides.map((slide) => (
                <div
                  key={slide.number}
                  className="p-4 rounded-xl bg-warm-canvas border border-sand-border flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-ink-black text-paper-white metric-mono">
                        Slide {slide.number}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`slide_${slide.number}`, slide.body)}
                        className="text-[11px] text-stone-gray hover:text-ink-black"
                        title="Salin teks slide"
                      >
                        {copiedKey === `slide_${slide.number}` ? (
                          <Check className="w-3.5 h-3.5 text-forest" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <h4 className="text-xs font-bold text-ink-black mt-2">
                      {slide.title}
                    </h4>
                    <p className="text-xs text-stone-gray mt-1.5 whitespace-pre-line leading-relaxed font-sans">
                      {slide.body}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-sand-border">
                    <span className="text-[10px] text-stone-gray font-semibold block">
                      Catatan Desain / Visual:
                    </span>
                    <span className="text-[11px] text-ink-black italic block mt-0.5">
                      {slide.visualNote}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Caption */}
            <div className="p-4 rounded-xl bg-warm-canvas border border-sand-border space-y-2">
              <span className="text-[11px] font-bold text-ink-black uppercase tracking-wider block">
                Caption Carousel
              </span>
              <p className="text-xs text-stone-gray whitespace-pre-line leading-relaxed">
                {carouselData.caption}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: AD COPY MATRIX */}
      {activeMode === 'ads' && (
        <div className="space-y-4">
          <div className="card-clay p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sand-border">
              <div>
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                  Materi Iklan Digital (Meta Ads & TikTok Ads)
                </span>
                <h3 className="text-base font-bold text-ink-black mt-0.5">
                  {adCopyData.campaignName}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleSaveToCalendar}
                className="btn-pill-primary text-xs py-1.5 px-3 bg-forest text-paper-white hover:bg-forest-emerald self-start sm:self-auto"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Simpan Rekomendasi Iklan</span>
              </button>
            </div>

            {/* Headlines Matrix */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-ink-black uppercase tracking-wider block">
                Pilihan Judul Iklan (Headlines)
              </span>
              <div className="space-y-2">
                {adCopyData.headlines.map((headline, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-warm-canvas border border-sand-border flex items-center justify-between gap-3"
                  >
                    <span className="text-xs font-bold text-ink-black font-sans">
                      &ldquo;{headline}&rdquo;
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`headline_${idx}`, headline)}
                      className="btn-pill-ghost text-xs py-1 px-2.5 shrink-0"
                    >
                      {copiedKey === `headline_${idx}` ? (
                        <>
                          <Check className="w-3 h-3 text-forest" />
                          <span>Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-stone-gray" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Texts */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-ink-black uppercase tracking-wider block">
                Teks Utama Iklan (Primary Text)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {adCopyData.primaryTexts.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-warm-canvas border border-sand-border flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-forest uppercase">
                          {pt.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`primary_${idx}`, pt.text)}
                          className="text-xs font-semibold text-stone-gray hover:text-ink-black flex items-center gap-1"
                        >
                          {copiedKey === `primary_${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-forest" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>Salin</span>
                        </button>
                      </div>
                      <p className="text-xs text-ink-black font-medium mt-2 whitespace-pre-line leading-relaxed font-sans">
                        {pt.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Audience Advice */}
            <div className="p-4 rounded-xl bg-forest-surface border border-forest-border space-y-1.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest" />
                <span className="text-xs font-bold text-forest uppercase tracking-wider">
                  Rekomendasi Penargetan Audiens (Targeting Advice)
                </span>
              </div>
              <p className="text-xs text-ink-black font-medium leading-relaxed">
                {adCopyData.targetAudienceAdvice}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
