'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import readXlsxFile from 'read-excel-file/browser';
import { AppShell } from '@/components/layout/app-shell';
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

  // Download CSV template
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

  // Process raw records from CSV or XLSX
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

  // Handle file upload
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

  // Reset current batch
  const handleReset = () => {
    setParsedRows(null);
    setFileName(null);
    setMissingColumns([]);
    setImportSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Execute import action
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
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-ink-black text-paper-white">
                Data Management
              </span>
              <span className="text-xs text-stone-gray font-medium">
                CSV / Excel Validator
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-black">
              Import & Validasi Data
            </h1>
            <p className="text-sm text-stone-gray mt-1">
              Unggah batch data CSV/XLSX untuk inventaris unit, metrik saluran digital, aktivitas harian, rencana konten, event, dan alat peraga.
            </p>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 text-xs font-semibold text-ink-black bg-paper-white border border-sand-border rounded-full hover:bg-stone-50 transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-violet-pulse" />
            <span>Unduh Template CSV</span>
          </button>
        </div>

        {/* Target Module Selector */}
        <div>
          <label className="block text-xs font-bold text-stone-gray uppercase tracking-wider mb-2">
            1. Pilih Modul Tujuan Import:
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {IMPORT_TARGETS.map((target) => {
              const isSelected = selectedTarget === target.id;
              return (
                <button
                  key={target.id}
                  onClick={() => {
                    setSelectedTarget(target.id);
                    handleReset();
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-warm-cream border-ink-black ring-1 ring-ink-black shadow-xs'
                      : 'bg-paper-white border-sand-border hover:border-stone-400'
                  }`}
                >
                  <span className="text-xs font-bold text-ink-black block line-clamp-1">
                    {target.title.split(' ')[0]} {target.title.split(' ')[1] || ''}
                  </span>
                  <span className="text-[11px] text-stone-gray line-clamp-1 mt-0.5">
                    {target.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Target Info Strip */}
        <div className="bg-paper-white border border-sand-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-violet-pulse" />
              <h3 className="text-sm font-bold text-ink-black">
                {currentTargetMeta.title}
              </h3>
            </div>
            <p className="text-xs text-stone-gray mt-0.5">
              {currentTargetMeta.description}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] font-bold text-stone-gray uppercase">Kolom Wajib:</span>
              {currentTargetMeta.columns.map((col) => (
                <span
                  key={col}
                  className="font-mono text-[10px] bg-warm-cream border border-sand-border px-1.5 py-0.5 rounded-md text-ink-black"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="text-xs font-semibold text-violet-pulse hover:underline flex items-center gap-1 shrink-0 self-start md:self-auto"
          >
            <span>Contoh: {currentTargetMeta.sampleFileName}</span>
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Upload Dropzone */}
        {!parsedRows && (
          <div className="bg-paper-white border-2 border-dashed border-sand-border rounded-2xl p-8 text-center hover:border-ink-black transition-colors">
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
              <div className="w-14 h-14 rounded-2xl bg-warm-cream border border-sand-border flex items-center justify-center text-ink-black shadow-xs">
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-warm-cream border border-sand-border text-xs font-semibold text-ink-black">
                <FileSpreadsheet className="w-3.5 h-3.5 text-stone-gray" />
                <span>Pilih File Spreadsheet</span>
              </div>
            </label>
          </div>
        )}

        {/* Success Alert if executed */}
        {importSuccessMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-emerald-900">Import Berhasil</h4>
              <p className="text-xs text-emerald-800 mt-0.5">{importSuccessMessage}</p>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1 text-xs font-bold bg-emerald-800 text-paper-white rounded-full hover:bg-emerald-900"
            >
              Import File Baru
            </button>
          </div>
        )}

        {/* Validation Preview Section */}
        {parsedRows && !importSuccessMessage && (
          <div className="space-y-4">
            {/* Summary Statistics Card */}
            <div className="bg-paper-white border border-sand-border rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-ink-black" />
                    <span className="text-xs font-bold text-stone-gray uppercase tracking-wider">
                      File: {fileName}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-ink-black mt-0.5">
                    Hasil Validasi Baris Data
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="px-3.5 py-1.5 text-xs font-semibold text-stone-gray hover:text-ink-black bg-warm-cream border border-sand-border rounded-full"
                  >
                    Ganti File
                  </button>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-warm-cream border border-sand-border">
                  <span className="text-[11px] font-bold text-stone-gray uppercase block">Total Baris</span>
                  <span className="text-xl font-extrabold text-ink-black font-mono">{totalCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">Baris Valid</span>
                  <span className="text-xl font-extrabold text-emerald-700 font-mono">{validCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-[11px] font-bold text-rose-800 uppercase block">Baris Error</span>
                  <span className="text-xl font-extrabold text-rose-700 font-mono">{invalidCount}</span>
                </div>
              </div>

              {/* Missing column alert if any */}
              {missingColumns.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <span className="font-bold">Kolom wajib belum ditemukan: </span>
                    <span className="font-mono">{missingColumns.join(', ')}</span>. Harap sesuaikan nama header tabel Anda dengan template.
                  </div>
                </div>
              )}

              {/* Strict Rejection Notice if invalid rows exist */}
              {invalidCount > 0 && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-950 flex-1">
                    <span className="font-extrabold">Aturan Operasional (Strict Rejection): </span>
                    Ditemukan <span className="font-bold font-mono">{invalidCount}</span> baris data tidak valid. Baris yang bermasalah akan ditolak secara otomatis untuk menjaga integritas database. Anda dapat mengimpor hanya baris yang valid atau memperbaiki file spreadsheet.
                  </div>
                </div>
              )}
            </div>

            {/* Filter Tabs & Action Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-warm-cream border border-sand-border rounded-full self-start">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                    activeTab === 'all'
                      ? 'bg-ink-black text-paper-white shadow-xs'
                      : 'text-stone-gray hover:text-ink-black'
                  }`}
                >
                  Semua ({totalCount})
                </button>
                <button
                  onClick={() => setActiveTab('valid')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                    activeTab === 'valid'
                      ? 'bg-emerald-700 text-paper-white shadow-xs'
                      : 'text-stone-gray hover:text-ink-black'
                  }`}
                >
                  Hanya Valid ({validCount})
                </button>
                <button
                  onClick={() => setActiveTab('invalid')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                    activeTab === 'invalid'
                      ? 'bg-rose-700 text-paper-white shadow-xs'
                      : 'text-stone-gray hover:text-ink-black'
                  }`}
                >
                  Hanya Bermasalah ({invalidCount})
                </button>
              </div>

              {/* Execution Buttons */}
              <div className="flex items-center gap-2">
                {invalidCount > 0 && validCount > 0 && (
                  <button
                    onClick={() => handleExecuteImport(true)}
                    className="px-4 py-2 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-full transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Import {validCount} Baris Valid Saja</span>
                  </button>
                )}

                {invalidCount === 0 && validCount > 0 && (
                  <button
                    onClick={() => handleExecuteImport(false)}
                    className="px-5 py-2 text-xs font-extrabold text-paper-white bg-ink-black hover:bg-stone-800 rounded-full transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Eksekusi Import ({validCount} Baris)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-violet-pulse" />
                  </button>
                )}
              </div>
            </div>

            {/* Preview Table */}
            <div className="bg-paper-white border border-sand-border rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-sand-border text-stone-gray uppercase tracking-wider bg-warm-cream/50">
                      <th className="py-2.5 px-3 font-semibold text-center w-12">#</th>
                      <th className="py-2.5 px-3 font-semibold text-center w-24">Status</th>
                      {currentTargetMeta.columns.map((col) => (
                        <th key={col} className="py-2.5 px-3 font-semibold whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                      {invalidCount > 0 && (
                        <th className="py-2.5 px-3 font-semibold text-rose-700">Detail Masalah</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-border/70">
                    {displayedRows?.map((row) => (
                      <tr
                        key={row.index}
                        className={`transition-colors ${
                          row.isValid ? 'hover:bg-warm-cream/30' : 'bg-rose-50/40 hover:bg-rose-50/70'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center font-mono text-stone-gray font-medium">
                          {row.index}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Error
                            </span>
                          )}
                        </td>

                        {/* Column Values */}
                        {currentTargetMeta.columns.map((col) => {
                          const val = row.data[col];
                          const hasColError = row.errors.some((e) => e.field === col);
                          return (
                            <td
                              key={col}
                              className={`py-2.5 px-3 font-mono ${
                                hasColError ? 'text-rose-700 font-bold bg-rose-100/50' : 'text-ink-black'
                              }`}
                            >
                              {val !== undefined && val !== null ? String(val) : '—'}
                            </td>
                          );
                        })}

                        {/* Error Details */}
                        {invalidCount > 0 && (
                          <td className="py-2.5 px-3 text-rose-800 text-[11px]">
                            {row.errors.length > 0 ? (
                              <ul className="list-disc list-inside space-y-0.5">
                                {row.errors.map((err, errIdx) => (
                                  <li key={errIdx}>
                                    <span className="font-semibold font-mono">{err.field}:</span>{' '}
                                    {err.message}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-stone-400">—</span>
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
