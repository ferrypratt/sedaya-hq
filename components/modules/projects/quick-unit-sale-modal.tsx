'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { INITIAL_PROJECTS, INITIAL_PROFILES } from '@/lib/data/seed-data';
import { usePersistentState, STORAGE_KEYS, generateUUID } from '@/lib/storage/persistence';
import { UnitSnapshot, DailyActivity } from '@/lib/types/database';
import {
  Building2,
  CheckCircle2,
  TrendingUp,
  Tag,
  FileCheck,
  Ban,
  Lock,
  ArrowRight,
} from 'lucide-react';

export type TransactionType =
  | 'booking'
  | 'sp3k'
  | 'akad'
  | 'cash'
  | 'hold'
  | 'cancel';

const TRANSACTION_OPTIONS: {
  id: TransactionType;
  label: string;
  desc: string;
  icon: typeof TrendingUp;
  badgeClass: string;
}[] = [
  {
    id: 'booking',
    label: 'Booking Fee Masuk (+1 Booking)',
    desc: 'Konsumen membayar tanda jadi, mengurangi 1 unit belum terjual.',
    icon: Tag,
    badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  {
    id: 'sp3k',
    label: 'SP3K Terbit (+1 SP3K)',
    desc: 'Surat penegasan persetujuan kredit bank disetujui.',
    icon: FileCheck,
    badgeClass: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  {
    id: 'akad',
    label: 'Akad Kredit Selesai (+1 Akad)',
    desc: 'Penandatanganan akad kredit bank dan realisasi unit.',
    icon: CheckCircle2,
    badgeClass: 'text-forest bg-forest-surface border-forest-border',
  },
  {
    id: 'cash',
    label: 'Cash Keras Lunas (+1 Cash)',
    desc: 'Pembayaran cash keras lunas tanpa melalui bank.',
    icon: CheckCircle2,
    badgeClass: 'text-forest bg-forest-surface border-forest-border',
  },
  {
    id: 'hold',
    label: 'Hold Manajemen (+1 Hold)',
    desc: 'Unit ditahan sementara untuk pertimbangan direksi.',
    icon: Lock,
    badgeClass: 'text-stone-gray bg-warm-cream border-sand-border',
  },
  {
    id: 'cancel',
    label: 'Pembatalan / Batal Booking (-1 Booking)',
    desc: 'Konsumen mundur / berkas ditolak, unit kembali tersedia.',
    icon: Ban,
    badgeClass: 'text-rose-700 bg-rose-50 border-rose-200',
  },
];

interface QuickUnitSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  onSuccess?: (message: string) => void;
}

export function QuickUnitSaleModal({
  isOpen,
  onClose,
  defaultProjectId,
  onSuccess,
}: QuickUnitSaleModalProps) {
  const [allHousingSnapshots, setAllHousingSnapshots] = usePersistentState<
    Record<string, UnitSnapshot[]>
  >(STORAGE_KEYS.HOUSING_SNAPSHOTS, {});

  const [activities, setActivities] = usePersistentState<DailyActivity[]>(
    STORAGE_KEYS.ACTIVITIES,
    []
  );

  const activeProjects = INITIAL_PROJECTS.filter(
    (p) => p.kind === 'active_project'
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    defaultProjectId || activeProjects[0]?.id || ''
  );
  const [txType, setTxType] = useState<TransactionType>('booking');
  const [unitCode, setUnitCode] = useState('');
  const [consumerName, setConsumerName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProject =
    activeProjects.find((p) => p.id === selectedProjectId) || activeProjects[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setIsSubmitting(true);
    try {
      const todayStr = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());

      const snapshots = allHousingSnapshots[selectedProject.id] || [];
      const currentLatest = snapshots[0] || {
        id: generateUUID(),
        project_id: selectedProject.id,
        snapshot_date: todayStr,
        belum_terjual: selectedProject.total_units,
        booking: 0,
        sp3k: 0,
        akad_kredit: 0,
        cash_keras: 0,
        hold_manajemen: 0,
        created_at: new Date().toISOString(),
      };

      // Compute updated unit values based on transaction type
      let belumTerjual = currentLatest.belum_terjual;
      let booking = currentLatest.booking;
      let sp3k = currentLatest.sp3k;
      let akad = currentLatest.akad_kredit;
      let cash = currentLatest.cash_keras;
      let hold = currentLatest.hold_manajemen;

      let actionSummary = '';

      switch (txType) {
        case 'booking':
          if (belumTerjual > 0) belumTerjual -= 1;
          booking += 1;
          actionSummary = `Booking Unit ${unitCode || ''} (${consumerName || 'Konsumen Baru'})`;
          break;
        case 'sp3k':
          if (booking > 0) booking -= 1;
          sp3k += 1;
          actionSummary = `SP3K Terbit Unit ${unitCode || ''} (${consumerName || 'Konsumen'})`;
          break;
        case 'akad':
          if (sp3k > 0) {
            sp3k -= 1;
          } else if (booking > 0) {
            booking -= 1;
          } else if (belumTerjual > 0) {
            belumTerjual -= 1;
          }
          akad += 1;
          actionSummary = `Akad Kredit Unit ${unitCode || ''} (${consumerName || 'Konsumen'})`;
          break;
        case 'cash':
          if (belumTerjual > 0) belumTerjual -= 1;
          cash += 1;
          actionSummary = `Cash Keras Unit ${unitCode || ''} (${consumerName || 'Konsumen'})`;
          break;
        case 'hold':
          if (belumTerjual > 0) belumTerjual -= 1;
          hold += 1;
          actionSummary = `Hold Manajemen Unit ${unitCode || ''}`;
          break;
        case 'cancel':
          if (booking > 0) booking -= 1;
          belumTerjual += 1;
          actionSummary = `Pembatalan Unit ${unitCode || ''}`;
          break;
      }

      const newSnapshot: UnitSnapshot = {
        id: generateUUID(),
        project_id: selectedProject.id,
        snapshot_date: todayStr,
        belum_terjual: belumTerjual,
        booking: booking,
        sp3k: sp3k,
        akad_kredit: akad,
        cash_keras: cash,
        hold_manajemen: hold,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 1. Update Housing Snapshots in persistence
      setAllHousingSnapshots((prev) => ({
        ...prev,
        [selectedProject.id]: [newSnapshot, ...(prev[selectedProject.id] || [])],
      }));

      // 2. Automatically log an operational activity
      const newActivity: DailyActivity = {
        id: generateUUID(),
        pic_id: INITIAL_PROFILES[0].id,
        activity_date: todayStr,
        category: 'sales_support',
        project_id: selectedProject.id,
        title: `Pencatatan Penjualan: ${actionSummary} [${selectedProject.name}]`,
        description: notes
          ? `${actionSummary}. Catatan: ${notes}`
          : actionSummary,
        status: 'done',
        duration_minutes: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pic: INITIAL_PROFILES[0],
        project: selectedProject,
      };

      setActivities((prev) => [newActivity, ...prev]);

      const successMsg = `Transaksi berhasil dicatat: ${actionSummary} pada ${selectedProject.name}. Stok unit langsung disinkronkan.`;
      if (onSuccess) {
        onSuccess(successMsg);
      }

      // Reset form & close
      setUnitCode('');
      setConsumerName('');
      setNotes('');
      onClose();
    } catch {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Catat Transaksi / Perubahan Unit"
      description="Perbarui status inventaris perumahan secara instan. Data langsung tersimpan di sistem dan disinkronkan ke server."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div>
          <label
            htmlFor="quick-project"
            className="block text-xs font-bold text-ink-black uppercase tracking-[0.05em] mb-1.5"
          >
            Pilih Proyek Perumahan
          </label>
          <select
            id="quick-project"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="input-clay text-xs font-semibold w-full"
            required
          >
            {activeProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.total_units} Total Unit)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-black uppercase tracking-[0.05em] mb-1.5">
            Jenis Transaksi / Status Unit
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TRANSACTION_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = txType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTxType(opt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'border-ink-black bg-warm-cream shadow-xs'
                      : 'border-sand-border bg-paper-white hover:border-sand-hover hover:bg-warm-canvas/60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${opt.badgeClass}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-ink-black block truncate">
                      {opt.label}
                    </span>
                    <span className="text-[11px] text-stone-gray block leading-tight mt-0.5 line-clamp-2">
                      {opt.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="quick-unit-code"
              className="block text-xs font-bold text-ink-black uppercase tracking-[0.05em] mb-1.5"
            >
              Nomor / Blok Unit
            </label>
            <input
              id="quick-unit-code"
              type="text"
              value={unitCode}
              onChange={(e) => setUnitCode(e.target.value)}
              placeholder="Contoh: D-10, B-03, Blok C-12"
              className="input-clay text-xs font-medium w-full"
            />
          </div>

          <div>
            <label
              htmlFor="quick-consumer"
              className="block text-xs font-bold text-ink-black uppercase tracking-[0.05em] mb-1.5"
            >
              Nama Konsumen (Opsional)
            </label>
            <input
              id="quick-consumer"
              type="text"
              value={consumerName}
              onChange={(e) => setConsumerName(e.target.value)}
              placeholder="Contoh: Bapak Rian / Ibu Maya"
              className="input-clay text-xs font-medium w-full"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="quick-notes"
            className="block text-xs font-bold text-ink-black uppercase tracking-[0.05em] mb-1.5"
          >
            Catatan Tambahan
          </label>
          <input
            id="quick-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Keterangan bank KPR, berkas persyaratan, atau info pembayaran..."
            className="input-clay text-xs font-medium w-full"
          />
        </div>

        <div className="pt-3 border-t border-sand-border flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="btn-pill-ghost text-xs py-2 px-3.5"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn-pill-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
            disabled={isSubmitting}
          >
            <span>Simpan Perubahan Unit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </Modal>
  );
}
