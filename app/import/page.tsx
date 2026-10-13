'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import readXlsxFile from 'read-excel-file/browser';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import {
  IMPORT_TARGETS,
  ImportTarget,
  getValidatorForTarget,
  TargetMetadata,
} from '@/lib/import/schemas';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Database,
  RefreshCw,
} from 'lucide-react';

interface RowValidationError {
  rowIndex: number;
  field: string;
  message: string;
  value: unknown;
}

interface ParsedRowResult {
  index: number;
  data: Record<string, unknown>;
  isValid: boolean;
  errors: RowValidationError[];
}

export default function ImportPage() {
  const [selectedTarget, setSelectedTarget] = useState<ImportTarget>('insights');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRowResult[] | null>(null);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'valid' | 'invalid'>('all');
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTargetMeta: TargetMetadata =
    IMPORT_TARGETS.find((t) => t.id === selectedTarget) || IMPORT_TARGETS[0];

  const handleDownloadTemplate = () => {
    const blob = new Blob([currentTargetMeta.templateCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', currentTargetMeta.sampleFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const validateAndSetData = (headers: string[], rawRows: Record<string, unknown>[]) => {
    const requiredCols = currentTargetMeta.columns;
    const missing = requiredCols.filter(
      (rc) => !headers.map((h) => h.trim().toLowerCase()).includes(rc.toLowerCase())
    );
    setMissingColumns(missing);

    const validator = getValidatorForTarget(selectedTarget);
    const results: ParsedRowResult[] = [];

    rawRows.forEach((row, idx) => {
      const parseResult = validator.safeParse(row);
      if (parseResult.success) {
        results.push({
          index: idx + 1,
          data: parseResult.data as Record<string, unknown>,
          isValid: true,
          errors: [],
        });
      } else {
        const errors: RowValidationError[] = parseResult.error.issues.map((issue) => {
          const fieldKey = String(issue.path[0] ?? '');
          return {
            rowIndex: idx + 1,
            field: issue.path.join('.'),
            message: issue.message,
            value: fieldKey ? row[fieldKey] : undefined,
          };
        });
        results.push({
          index: idx + 1,
          data: row,
          isValid: false,
          errors,
        });
      }
    });

    setParsedRows(results);
    setIsProcessing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFileName(file.name);
    setParsedRows(null);
    setMissingColumns([]);
    setImportSuccessMessage(null);

    const isCsv = file.name.endsWith('.csv');
    const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isCsv) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          const rows = results.data as Record<string, unknown>[];
          validateAndSetData(headers, rows);
        },
        error: (err) => {
          alert(`Gagal membaca file CSV: ${err.message}`);
          setIsProcessing(false);
        },
      });
    } else if (isXlsx) {
      try {
        const excelRows = (await readXlsxFile(file)) as unknown as unknown[][];
        if (!excelRows || excelRows.length === 0) {
          alert('File spreadsheet kosong');
          setIsProcessing(false);
          return;
        }

        const headers = (excelRows[0] || []).map((h) => String(h || '').trim());
        const dataRows: Record<string, unknown>[] = [];

        for (let i = 1; i < excelRows.length; i++) {
          const rowData: Record<string, unknown> = {};
          const rowCells = excelRows[i] || [];
          headers.forEach((header, colIdx) => {
            rowData[header] = rowCells[colIdx];
          });
          dataRows.push(rowData);
        }

        validateAndSetData(headers, dataRows);
      } catch (err) {
        alert(`Gagal membaca file Excel: ${err instanceof Error ? err.message : String(err)}`);
        setIsProcessing(false);
      }
    } else {
      alert('Format file tidak didukung. Harap upload file .csv atau .xlsx');
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setParsedRows(null);
    setFileName(null);
    setMissingColumns([]);
    setImportSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExecuteImport = (onlyValid: boolean) => {
    if (!parsedRows) return;
    const targetRows = onlyValid ? parsedRows.filter((r) => r.isValid) : parsedRows;
    if (targetRows.length === 0) {
      alert('Tidak ada baris data valid untuk di-import');
      return;
    }

    setImportSuccessMessage(
      `Sukses mengimpor ${targetRows.length} baris data ke modul "${currentTargetMeta.title}". Data telah divalidasi dan tersimpan.`
    );
  };

  const validCount = parsedRows?.filter((r) => r.isValid).length || 0;
  const invalidCount = parsedRows?.filter((r) => !r.isValid).length || 0;
  const totalCount = parsedRows?.length || 0;

  const displayedRows = parsedRows?.filter((r) => {
    if (activeTab === 'valid') return r.isValid;
    if (activeTab === 'invalid') return !r.isValid;
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        <PageHeader
          eyebrow="Data Management • CSV / Excel Validator"
          title="Import & Validasi Data"
          description="Unggah batch data CSV/XLSX untuk inventaris unit, metrik saluran digital, aktivitas harian, rencana konten, event, dan alat peraga."
          actions={
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="btn-pill-ghost text-xs"
            >
              <Download className="w-3.5 h-3.5 text-violet-pulse" />
              <span>Unduh Template CSV</span>
            </button>
          }
        />

        {/* Step 1: Target Module Selector (<= 6 cards in grid) */}
        <div className="space-y-2.5">
          <span className="block text-xs font-bold text-stone-gray uppercase tracking-wider">
            1. Pilih Modul Tujuan Import:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
            {IMPORT_TARGETS.map((target) => {
              const isSelected = selectedTarget === target.id;
              return (
                <button
                  key={target.id}
                  type="button"
                  onClick={() => {
                    setSelectedTarget(target.id);
                    handleReset();
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-colors min-h-14 ${
                    isSelected
                      ? 'bg-ink-black border-ink-black text-paper-white'
                      : 'bg-paper-white border-sand-border text-ink-black hover:border-ink-black'
                  }`}
                >
                  <span className="text-xs font-extrabold block line-clamp-1">
                    {target.title.split(' ')[0]} {target.title.split(' ')[1] || ''}
                  </span>
                  <span
                    className={`text-[11px] metric-mono line-clamp-1 mt-0.5 block ${
                      isSelected ? 'text-sand-border' : 'text-stone-gray'
                    }`}
                  >
                    {target.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Selected Target Schema Ledger */}
        <div className="card-cream p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-violet-pulse" />
              <h2 className="text-sm font-extrabold text-ink-black">
                {currentTargetMeta.title}
              </h2>
            </div>
            <p className="text-xs text-stone-gray mt-0.5">
              {currentTargetMeta.description}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-[10px] font-bold text-stone-gray uppercase">Kolom Wajib:</span>
              {currentTargetMeta.columns.map((col) => (
                <span
                  key={col}
                  className="metric-mono text-[10px] font-bold bg-paper-white border border-sand-border px-2 py-0.5 rounded-md text-ink-black"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="text-xs font-bold text-violet-pulse hover:underline inline-flex items-center gap-1.5 shrink-0 self-start md:self-auto"
          >
            <span>Contoh: {currentTargetMeta.sampleFileName}</span>
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step 3: Upload Dropzone */}
        {!parsedRows && (
          <div className="card-clay border-2 border-dashed border-sand-border p-8 sm:p-10 text-center hover:border-ink-black transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.xlsx,.xls"
              className="hidden"
              id="file-import-input"
            />
            <label
              htmlFor="file-import-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-warm-cream border border-sand-border flex items-center justify-center text-ink-black">
                {isProcessing ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-violet-pulse" />
                ) : (
                  <Upload className="w-6 h-6 text-ink-black" />
                )}
              </div>
              <div>
                <p className="text-sm font-extrabold text-ink-black">
                  Klik untuk pilih file atau seret file ke sini
                </p>
                <p className="text-xs text-stone-gray mt-1">
                  Mendukung format .CSV atau .XLSX (Maks. 5MB)
                </p>
              </div>
              <div className="btn-pill-ghost text-xs">
                <FileSpreadsheet className="w-3.5 h-3.5 text-stone-gray" />
                <span>Pilih File Spreadsheet</span>
              </div>
            </label>
          </div>
        )}

        {/* Success Alert if executed */}
        {importSuccessMessage && (
          <div className="p-4 rounded-2xl bg-forest-surface border border-forest-emerald/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-forest-emerald shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-extrabold text-ink-black">Import Berhasil</h4>
              <p className="text-xs text-stone-gray mt-0.5">{importSuccessMessage}</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="btn-pill-primary text-xs"
            >
              Import File Baru
            </button>
          </div>
        )}

        {/* Validation Preview Section */}
        {parsedRows && !importSuccessMessage && (
          <div className="space-y-4">
            <div className="card-clay p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-ink-black" />
                    <span className="text-xs font-bold text-stone-gray uppercase tracking-wider metric-mono">
                      File: {fileName}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-ink-black mt-0.5">
                    Hasil Validasi Baris Data
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-pill-ghost text-xs self-start sm:self-auto"
                >
                  Ganti File
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-warm-cream border border-sand-border">
                  <span className="text-[11px] font-bold text-stone-gray uppercase block">Total Baris</span>
                  <span className="text-xl font-black text-ink-black metric-mono">{totalCount}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-forest-surface border border-forest-emerald/30">
                  <span className="text-[11px] font-bold text-forest-emerald uppercase block">Baris Valid</span>
                  <span className="text-xl font-black text-forest-emerald metric-mono">{validCount}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-ember-surface border border-ember-orange/30">
                  <span className="text-[11px] font-bold text-ember-orange uppercase block">Baris Error</span>
                  <span className="text-xl font-black text-ember-orange metric-mono">{invalidCount}</span>
                </div>
              </div>

              {missingColumns.length > 0 && (
                <div className="mt-4 p-3.5 rounded-xl bg-ember-surface border border-ember-orange/30 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-ember-orange shrink-0 mt-0.5" />
                  <div className="text-xs text-ink-black">
                    <span className="font-bold">Kolom wajib belum ditemukan: </span>
                    <span className="metric-mono font-bold text-ember-orange">{missingColumns.join(', ')}</span>. Harap sesuaikan nama header tabel Anda dengan template.
                  </div>
                </div>
              )}

              {invalidCount > 0 && (
                <div className="mt-4 p-3.5 rounded-xl bg-ember-surface border border-ember-orange/30 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-ember-orange shrink-0 mt-0.5" />
                  <div className="text-xs text-ink-black flex-1">
                    <span className="font-extrabold text-ember-orange">Aturan Operasional (Strict Rejection): </span>
                    Ditemukan <span className="font-bold metric-mono">{invalidCount}</span> baris data tidak valid. Baris yang bermasalah akan ditolak secara otomatis untuk menjaga integritas database. Anda dapat mengimpor hanya baris yang valid atau memperbaiki file spreadsheet.
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-warm-cream border border-sand-border rounded-full self-start">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 min-h-9 text-xs font-bold rounded-full transition-colors ${
                    activeTab === 'all'
                      ? 'bg-ink-black text-paper-white'
                      : 'text-stone-gray hover:text-ink-black'
                  }`}
                >
                  Semua ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('valid')}
                  className={`px-3 min-h-9 text-xs font-bold rounded-full transition-colors ${
                    activeTab === 'valid'
                      ? 'bg-forest-emerald text-paper-white'
                      : 'text-stone-gray hover:text-ink-black'
                  }`}
                >
                  Hanya Valid ({validCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('invalid')}
                  className={`px-3 min-h-9 text-xs font-bold rounded-full transition-colors ${
                    activeTab === 'invalid'
                      ? 'bg-ember-orange text-paper-white'
                      : 'text-stone-gray hover:text-ink-black'
                  }`}
                >
                  Hanya Bermasalah ({invalidCount})
                </button>
              </div>

              <div className="flex items-center gap-2">
                {invalidCount > 0 && validCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleExecuteImport(true)}
                    className="btn-pill-primary text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-emerald" />
                    <span>Import {validCount} Baris Valid Saja</span>
                  </button>
                )}

                {invalidCount === 0 && validCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleExecuteImport(false)}
                    className="btn-pill-primary text-xs"
                  >
                    <span>Eksekusi Import ({validCount} Baris)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="card-clay overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-sand-border text-stone-gray uppercase tracking-wider bg-warm-cream">
                      <th className="py-2.5 px-3 font-bold text-center w-12">#</th>
                      <th className="py-2.5 px-3 font-bold text-center w-24">Status</th>
                      {currentTargetMeta.columns.map((col) => (
                        <th key={col} className="py-2.5 px-3 font-bold whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                      {invalidCount > 0 && (
                        <th className="py-2.5 px-3 font-bold text-ember-orange">Detail Masalah</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-border/70">
                    {displayedRows?.map((row) => (
                      <tr
                        key={row.index}
                        className={`transition-colors ${
                          row.isValid ? 'hover:bg-warm-cream/40' : 'bg-ember-surface/50'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center metric-mono text-stone-gray font-bold">
                          {row.index}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-forest-emerald bg-forest-surface px-2 py-0.5 rounded-full border border-forest-emerald/30">
                              <CheckCircle2 className="w-3 h-3" />
                              Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ember-orange bg-ember-surface px-2 py-0.5 rounded-full border border-ember-orange/30">
                              <XCircle className="w-3 h-3" />
                              Error
                            </span>
                          )}
                        </td>

                        {currentTargetMeta.columns.map((col) => {
                          const val = row.data[col];
                          const hasColError = row.errors.some((e) => e.field === col);
                          return (
                            <td
                              key={col}
                              className={`py-2.5 px-3 metric-mono ${
                                hasColError ? 'text-ember-orange font-bold bg-ember-surface' : 'text-ink-black'
                              }`}
                            >
                              {val !== undefined && val !== null ? String(val) : '-'}
                            </td>
                          );
                        })}

                        {invalidCount > 0 && (
                          <td className="py-2.5 px-3 text-ember-orange text-[11px]">
                            {row.errors.length > 0 ? (
                              <ul className="list-disc list-inside space-y-0.5">
                                {row.errors.map((err, errIdx) => (
                                  <li key={errIdx}>
                                    <span className="font-bold metric-mono">{err.field}:</span>{' '}
                                    {err.message}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-stone-gray">-</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

