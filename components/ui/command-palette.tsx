'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Building2,
  CalendarCheck,
  CalendarDays,
  Target,
  FileSpreadsheet,
  Share2,
  FileText,
  Settings,
  Tag,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface PaletteItem {
  id: string;
  category: 'Aksi Cepat' | 'Navigasi Menu' | 'Proyek Perumahan';
  title: string;
  subtitle?: string;
  icon: typeof Search;
  href?: string;
  onSelect?: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('sedaya_open_command_palette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('sedaya_open_command_palette', handleCustomOpen);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const items: PaletteItem[] = [
    // Aksi Cepat
    {
      id: 'act-new-activity',
      category: 'Aksi Cepat',
      title: 'Catat Aktivitas Harian Baru',
      subtitle: 'Buka formulir pencatatan tugas operasional',
      icon: Plus,
      href: '/activities',
    },
    {
      id: 'act-new-sale',
      category: 'Aksi Cepat',
      title: 'Catat Penjualan / Perubahan Unit',
      subtitle: 'Catat booking, SP3K, akad, atau cash perumahan',
      icon: Tag,
      href: '/projects',
    },
    {
      id: 'act-public-portal',
      category: 'Aksi Cepat',
      title: 'Buka Portal Eksekutif Publik',
      subtitle: 'Tampilan terbuka untuk direksi & manajemen tanpa login',
      icon: ExternalLink,
      href: '/public',
    },
    {
      id: 'act-reports-pdf',
      category: 'Aksi Cepat',
      title: 'Cetak Laporan PDF Resmi A4',
      subtitle: 'Generator dokumen rekapitulasi operasional',
      icon: FileText,
      href: '/reports',
    },

    // Navigasi Menu
    {
      id: 'nav-dashboard',
      category: 'Navigasi Menu',
      title: 'Ikhtisar Operasional (Dashboard)',
      subtitle: 'Pusat pantauan portofolio dan KPI',
      icon: Sparkles,
      href: '/',
    },
    {
      id: 'nav-activities',
      category: 'Navigasi Menu',
      title: 'Log Aktivitas Harian Tim',
      subtitle: 'Daftar eksekusi harian Ferry & Ziyad',
      icon: CalendarCheck,
      href: '/activities',
    },
    {
      id: 'nav-projects',
      category: 'Navigasi Menu',
      title: 'Portofolio Proyek & Unit',
      subtitle: 'Status unit, booking, SP3K, akad, dan kos',
      icon: Building2,
      href: '/projects',
    },
    {
      id: 'nav-content',
      category: 'Navigasi Menu',
      title: 'Kalender Konten Media Sosial',
      subtitle: 'Jadwal posting Reels, TikTok, Carousel',
      icon: CalendarDays,
      href: '/content',
    },
    {
      id: 'nav-plans',
      category: 'Navigasi Menu',
      title: 'Rencana Marketing & KPI',
      subtitle: 'Matriks program mingguan dan bulanan',
      icon: Target,
      href: '/plans',
    },
    {
      id: 'nav-evaluations',
      category: 'Navigasi Menu',
      title: 'Evaluasi Kinerja Tim',
      subtitle: 'Retrospektif dan rasio penyelesaian tugas',
      icon: FileSpreadsheet,
      href: '/evaluations',
    },
    {
      id: 'nav-channels',
      category: 'Navigasi Menu',
      title: 'Registri Kanal Digital',
      subtitle: 'Instagram, TikTok, Website, Google Maps',
      icon: Share2,
      href: '/channels',
    },
    {
      id: 'nav-settings',
      category: 'Navigasi Menu',
      title: 'Pengaturan & Master Data',
      subtitle: 'Konfigurasi profil PIC, proyek, dan saluran',
      icon: Settings,
      href: '/settings',
    },

    // Proyek Perumahan
    {
      id: 'proj-grand-sevilla',
      category: 'Proyek Perumahan',
      title: 'Grand Sevilla (Tahap 1 & 2)',
      subtitle: 'Kapasitas 160 Unit • Deli Serdang',
      icon: Building2,
      href: '/projects/grand-sevilla',
    },
    {
      id: 'proj-grand-lestari',
      category: 'Proyek Perumahan',
      title: 'Grand Lestari',
      subtitle: 'Kapasitas 35 Unit • Deli Serdang',
      icon: Building2,
      href: '/projects/grand-lestari',
    },
    {
      id: 'proj-harmony-hills',
      category: 'Proyek Perumahan',
      title: 'Harmony Hills Residence',
      subtitle: 'Kapasitas 18 Unit • Deli Serdang',
      icon: Building2,
      href: '/projects/harmony-hills',
    },
    {
      id: 'proj-setia-residence',
      category: 'Proyek Perumahan',
      title: 'Setia Residence',
      subtitle: 'Kapasitas 6 Unit • Deli Serdang',
      icon: Building2,
      href: '/projects/setia-residence',
    },
    {
      id: 'proj-samudera-residence',
      category: 'Proyek Perumahan',
      title: 'Samudera Residence',
      subtitle: 'Kapasitas 15 Unit • Medan',
      icon: Building2,
      href: '/projects/samudera-residence',
    },
    {
      id: 'proj-kos-bidadari',
      category: 'Proyek Perumahan',
      title: 'Kos Pondok Bidadari (CozyKOS)',
      subtitle: 'Kapasitas 12 Kamar • Unit Bisnis',
      icon: Building2,
      href: '/projects/kos-pondok-bidadari',
    },
  ];

  const filteredItems = items.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item: PaletteItem) => {
    setIsOpen(false);
    if (item.onSelect) {
      item.onSelect();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? Math.max(0, filteredItems.length - 1) : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian Cepat & Navigasi"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-ink-black/50 backdrop-blur-xs animate-fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-paper-white rounded-2xl border border-sand-border shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownList}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-sand-border bg-warm-cream">
          <Search className="w-4 h-4 text-stone-gray shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Ketik tujuan navigasi, proyek, atau aksi cepat..."
            className="w-full bg-transparent text-sm font-semibold text-ink-black placeholder:text-ash-gray focus:outline-hidden"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-paper-white border border-sand-border text-[10px] font-semibold text-stone-gray">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-sand-border/50">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-gray">
              Tidak ada hasil yang cocok dengan &quot;{query}&quot;.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-ink-black text-paper-white'
                      : 'hover:bg-warm-cream text-ink-black'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-white/20 bg-white/10 text-paper-white'
                          : 'border-sand-border bg-warm-cream text-stone-gray'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span
                          className={`text-[11px] block truncate ${
                            isSelected ? 'text-sand-border' : 'text-stone-gray'
                          }`}
                        >
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${
                        isSelected
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-warm-cream border-sand-border text-stone-gray'
                      }`}
                    >
                      {item.category}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-paper-white' : 'text-ash-gray'
                      }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-warm-cream border-t border-sand-border flex items-center justify-between text-[11px] text-stone-gray">
          <span>Gunakan panah untuk navigasi, enter untuk memilih</span>
          <span className="hidden sm:inline">Pintasan: ⌘K / Ctrl+K</span>
        </div>
      </div>
    </div>
  );
}

export function openCommandPalette() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sedaya_open_command_palette'));
  }
}
