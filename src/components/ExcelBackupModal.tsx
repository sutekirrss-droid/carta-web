import React, { useState, useRef } from 'react';
import { MenuItem, RestaurantConfig } from '../types';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  Database,
  CheckCircle,
  AlertTriangle,
  FileText,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface ExcelBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  config: RestaurantConfig;
  onImportItems: (newItems: MenuItem[], mode: 'replace' | 'merge') => void;
  onImportConfig?: (newConfig: Partial<RestaurantConfig>) => void;
}

export const ExcelBackupModal: React.FC<ExcelBackupModalProps> = ({
  isOpen,
  onClose,
  items,
  config,
  onImportItems,
  onImportConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'excel' | 'json'>('excel');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importPreview, setImportPreview] = useState<MenuItem[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Export menu as Excel-friendly CSV with UTF-8 BOM and semicolon separator (standard for Latin America/Excel)
  const exportToExcelCsv = () => {
    const headers = [
      'ID',
      'Categoria',
      'Nombre',
      'Precio',
      'Unidad',
      'Descripcion',
      'Tags',
      'Disponible',
      'SugerenciaSushiman',
      'EspecialChef',
      'Maridaje',
      'UrlImagen',
    ];

    const rows = items.map((item) => {
      return [
        `"${item.id}"`,
        `"${(item.category || '').replace(/"/g, '""')}"`,
        `"${(item.name || '').replace(/"/g, '""')}"`,
        item.price,
        `"${(item.unit || '').replace(/"/g, '""')}"`,
        `"${(item.description || '').replace(/"/g, '""')}"`,
        `"${(item.tags || []).join(', ').replace(/"/g, '""')}"`,
        item.available ? 'SI' : 'NO',
        item.isSushimanSpecial ? 'SI' : 'NO',
        item.isChefSpecial ? 'SI' : 'NO',
        `"${(item.pairing || '').replace(/"/g, '""')}"`,
        `"${(item.imageUrl || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `Suteki_Carta_Menu_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download Sample Excel Template
  const downloadSampleTemplate = () => {
    const headers = [
      'ID',
      'Categoria',
      'Nombre',
      'Precio',
      'Unidad',
      'Descripcion',
      'Tags',
      'Disponible',
      'SugerenciaSushiman',
      'EspecialChef',
      'Maridaje',
      'UrlImagen',
    ];

    const sampleRows = [
      [
        '"rolls--suteki-roll-ejemplo"',
        '"Sushi Rolls"',
        '"Suteki Roll Dragón"',
        '18500',
        '"8 piezas"',
        '"Langostinos furai, palta y queso philadelphia con láminas de salmón flambeado y salsa nikkei."',
        '"Favorito, Picante"',
        'SI',
        'SI',
        'SI',
        '"Cerveza Asahi o Vino Sauvignon Blanc"',
        '"https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80"',
      ].join(';'),
    ];

    const csvContent = '\uFEFF' + [headers.join(';'), ...sampleRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Plantilla_Ejemplo_Carta_Suteki.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export full JSON backup
  const exportFullJsonBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      restaurant: config.name,
      config,
      items,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `Suteki_Backup_Completo_${dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to parse CSV line
  const parseCsvLine = (line: string, delimiter: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Parse uploaded CSV/Excel file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error('El archivo está vacío');

        // Clean BOM if present
        const cleanText = text.replace(/^\uFEFF/, '');
        const lines = cleanText
          .split(/\r\n|\n|\r/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        if (lines.length < 2) {
          throw new Error('El archivo CSV debe tener al menos la fila de encabezados y un plato.');
        }

        // Determine delimiter (; or ,)
        const firstLine = lines[0];
        const delimiter = firstLine.includes(';') ? ';' : ',';
        const headers = parseCsvLine(firstLine, delimiter).map((h) =>
          h.toLowerCase().replace(/[^a-z0-9]/g, '')
        );

        // Find index of standard columns
        const colId = headers.findIndex((h) => h.includes('id'));
        const colCat = headers.findIndex((h) => h.includes('cat') || h.includes('rubro'));
        const colName = headers.findIndex((h) => h.includes('nom') || h.includes('plato'));
        const colPrice = headers.findIndex((h) => h.includes('prec') || h.includes('val'));
        const colUnit = headers.findIndex((h) => h.includes('uni') || h.includes('cant'));
        const colDesc = headers.findIndex((h) => h.includes('desc') || h.includes('ingred'));
        const colTags = headers.findIndex((h) => h.includes('tag') || h.includes('etiqueta'));
        const colAvail = headers.findIndex((h) => h.includes('disp') || h.includes('activo'));
        const colSushi = headers.findIndex((h) => h.includes('sushi') || h.includes('itamae'));
        const colChef = headers.findIndex((h) => h.includes('chef') || h.includes('especial'));
        const colPair = headers.findIndex((h) => h.includes('marid') || h.includes('vino'));
        const colImg = headers.findIndex((h) => h.includes('img') || h.includes('foto') || h.includes('imagen') || h.includes('url'));

        if (colName === -1 || colPrice === -1) {
          throw new Error(
            'El archivo debe contener al menos las columnas "Nombre" y "Precio". Por favor usa la plantilla recomendada.'
          );
        }

        const parsedItems: MenuItem[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = parseCsvLine(lines[i], delimiter);
          if (row.length === 0 || !row[colName]) continue;

          const rawName = row[colName] || '';
          if (!rawName.trim()) continue;

          // Parse price
          const priceRaw = (row[colPrice] || '').replace(/[^0-9.,]/g, '').replace(',', '.');
          const priceNum = parseFloat(priceRaw) || 0;

          // Category
          const category = colCat !== -1 && row[colCat] ? row[colCat] : 'Sushi Rolls';

          // ID
          let id = colId !== -1 && row[colId] ? row[colId] : '';
          if (!id) {
            id = `${category.toLowerCase().replace(/\s+/g, '-')}-${rawName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
          }

          // Tags
          const rawTags = colTags !== -1 && row[colTags] ? row[colTags] : '';
          const tags = rawTags
            ? rawTags.split(',').map((t) => t.trim()).filter(Boolean)
            : [];

          // Booleans
          const isAvailRaw = colAvail !== -1 && row[colAvail] ? row[colAvail].toUpperCase() : 'SI';
          const available = !['NO', 'FALSE', '0', 'AGOTADO'].includes(isAvailRaw);

          const isSushiRaw = colSushi !== -1 && row[colSushi] ? row[colSushi].toUpperCase() : 'NO';
          const isSushimanSpecial = ['SI', 'YES', 'TRUE', '1'].includes(isSushiRaw);

          const isChefRaw = colChef !== -1 && row[colChef] ? row[colChef].toUpperCase() : 'NO';
          const isChefSpecial = ['SI', 'YES', 'TRUE', '1'].includes(isChefRaw);

          parsedItems.push({
            id,
            category,
            name: rawName,
            price: priceNum,
            unit: colUnit !== -1 ? row[colUnit] || '' : '',
            description: colDesc !== -1 ? row[colDesc] || '' : '',
            tags,
            available,
            order: i,
            updatedAt: new Date().toISOString().split('T')[0],
            isSushimanSpecial,
            isChefSpecial,
            pairing: colPair !== -1 ? row[colPair] || '' : '',
            imageUrl: colImg !== -1 ? row[colImg] || '' : '',
          });
        }

        if (parsedItems.length === 0) {
          throw new Error('No se pudieron extraer platos válidos del archivo.');
        }

        setImportPreview(parsedItems);
      } catch (err: any) {
        setImportError(err.message || 'Error al procesar el archivo CSV.');
        setImportPreview(null);
      }
    };
    reader.readAsText(file);
  };

  // Parse JSON backup
  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        if (!data.items || !Array.isArray(data.items)) {
          throw new Error('El archivo de copia de seguridad no contiene una lista de platos válida.');
        }

        if (data.config && onImportConfig) {
          onImportConfig(data.config);
        }

        onImportItems(data.items, 'replace');
        setImportSuccessMessage(
          `¡Copia restaurada con éxito! Se cargaron ${data.items.length} platos y la configuración del local.`
        );
      } catch (err: any) {
        setImportError(err.message || 'Error al restaurar copia JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Apply previewed CSV items
  const handleConfirmImport = () => {
    if (!importPreview || importPreview.length === 0) return;

    onImportItems(importPreview, importMode);
    setImportSuccessMessage(
      `¡Importación exitosa! Se procesaron ${importPreview.length} platos (${
        importMode === 'merge' ? 'fusionados con la carta existente' : 'reemplazando la carta anterior'
      }).`
    );
    setImportPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-[#B0AF9F]/40 shadow-2xl bg-[#F6EFE4] text-[#3C3C3B] overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-white border-b border-[#B0AF9F]/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#DC5D5D] font-bold">
                Gestión de Datos & Copias
              </span>
              <h2 className="text-lg sm:text-xl font-brand font-black text-[#3C3C3B]">
                Respaldo e Importación desde Excel
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-[#3C3C3B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#B0AF9F]/30 bg-[#EFE7D8]/80 px-4 sm:px-6 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('excel')}
            className={`px-4 py-2 text-xs font-brand font-bold rounded-t-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'excel'
                ? 'bg-white text-emerald-700 border-t border-x border-[#B0AF9F]/30 shadow-xs'
                : 'text-[#3C3C3B]/70 hover:text-[#3C3C3B]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel / CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2 text-xs font-brand font-bold rounded-t-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'bg-white text-[#DC5D5D] border-t border-x border-[#B0AF9F]/30 shadow-xs'
                : 'text-[#3C3C3B]/70 hover:text-[#3C3C3B]'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-[#DC5D5D]" />
            <span>Copia de Seguridad JSON</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Alerts */}
          {importSuccessMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>{importSuccessMessage}</div>
            </div>
          )}

          {importError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-300 text-red-800 text-xs font-mono flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{importError}</div>
            </div>
          )}

          {activeTab === 'excel' ? (
            <div className="space-y-5">
              {/* Export Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#B0AF9F]/30 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
                    <Download className="w-4 h-4" />
                    <span>Exportar Carta a Excel</span>
                  </div>
                  <span className="text-xs font-mono text-gray-500">
                    {items.length} platos cargados
                  </span>
                </div>

                <p className="text-xs text-[#3C3C3B]/75 leading-relaxed">
                  Descarga un archivo <strong>CSV compatible con Microsoft Excel y Google Sheets</strong>{' '}
                  con todas las columnas de la carta (categoría, precio, descripción, fotos, sugerencias
                  del sushiman y maridajes).
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={exportToExcelCsv}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-brand font-bold text-xs shadow-xs transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Carta en Excel (.csv)</span>
                  </button>

                  <button
                    onClick={downloadSampleTemplate}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#B0AF9F]/40 bg-stone-50 hover:bg-stone-100 text-[#3C3C3B] font-mono text-xs transition-all"
                    title="Descargar plantilla con encabezados para completar"
                  >
                    <FileText className="w-3.5 h-3.5 text-gray-500" />
                    <span>Descargar Plantilla Vacía</span>
                  </button>
                </div>
              </div>

              {/* Import Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#B0AF9F]/30 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#DC5D5D] uppercase tracking-wider">
                  <Upload className="w-4 h-4" />
                  <span>Importar / Actualizar desde Excel</span>
                </div>

                <p className="text-xs text-[#3C3C3B]/75 leading-relaxed">
                  Sube tu archivo editado de Excel (.csv) para actualizar precios en bloque o agregar nuevos
                  platos a la carta de forma masiva.
                </p>

                {/* Import Mode Selector */}
                <div className="p-3 rounded-xl bg-[#F6EFE4] border border-[#B0AF9F]/30 space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider font-bold block text-gray-600">
                    Modo de importación:
                  </span>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="accent-[#DC5D5D]"
                      />
                      <span>
                        <strong>Actualizar & Fusionar</strong> (Mantiene platos y actualiza coincidencias)
                      </span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="accent-[#DC5D5D]"
                      />
                      <span>
                        <strong>Reemplazar todo</strong>
                      </span>
                    </label>
                  </div>
                </div>

                {/* File Upload Input */}
                <div className="pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="block w-full text-xs font-mono file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-brand file:font-bold file:bg-[#DC5D5D] file:text-white hover:file:bg-[#c94e4e] cursor-pointer"
                  />
                </div>

                {/* Preview Table if file parsed */}
                {importPreview && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-300/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Vista previa: {importPreview.length} platos detectados</span>
                      </span>
                      <span className="text-[11px] font-mono text-amber-800">
                        Listo para aplicar
                      </span>
                    </div>

                    <div className="max-h-40 overflow-y-auto rounded-xl border border-amber-200 bg-white text-xs font-mono divide-y divide-gray-100">
                      {importPreview.slice(0, 10).map((p, idx) => (
                        <div key={idx} className="p-2 flex items-center justify-between gap-2">
                          <div className="truncate">
                            <strong className="text-[#3C3C3B]">{p.name}</strong>{' '}
                            <span className="text-gray-500">({p.category})</span>
                          </div>
                          <div className="shrink-0 font-bold text-[#DC5D5D]">
                            ${(p.price ?? 0).toLocaleString('es-AR')}
                          </div>
                        </div>
                      ))}
                      {importPreview.length > 10 && (
                        <div className="p-2 text-center text-gray-500 italic text-[11px]">
                          ... y {importPreview.length - 10} platos más.
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => {
                          setImportPreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-mono text-gray-600 hover:bg-gray-100"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleConfirmImport}
                        className="px-4 py-1.5 rounded-xl bg-[#DC5D5D] hover:bg-[#c94e4e] text-white font-brand font-bold text-xs shadow-xs"
                      >
                        Confirmar y Cargar a la Carta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* JSON Tab */
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#B0AF9F]/30 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#DC5D5D] uppercase tracking-wider">
                  <Database className="w-4 h-4" />
                  <span>Respaldo Total de Seguridad (JSON)</span>
                </div>

                <p className="text-xs text-[#3C3C3B]/75 leading-relaxed">
                  Guarda un archivo de respaldo completo que incluye absolutamente todo: todos los platos,
                  imágenes, categorías personalizadas, PIN de seguridad, información del local y ajustes de
                  promoción.
                </p>

                <div className="pt-1">
                  <button
                    onClick={exportFullJsonBackup}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#262625] hover:bg-black text-white font-brand font-bold text-xs shadow-xs transition-all"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>Descargar Respaldo Total (.json)</span>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#B0AF9F]/30 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#DC5D5D] uppercase tracking-wider">
                  <RefreshCw className="w-4 h-4" />
                  <span>Restaurar Copia Total</span>
                </div>

                <p className="text-xs text-[#3C3C3B]/75 leading-relaxed">
                  Restaura el sistema a partir de un archivo <code>.json</code> guardado anteriormente.
                </p>

                <input
                  type="file"
                  ref={jsonFileInputRef}
                  accept=".json"
                  onChange={handleJsonUpload}
                  className="block w-full text-xs font-mono file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-brand file:font-bold file:bg-[#DC5D5D] file:text-white hover:file:bg-[#c94e4e] cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-white border-t border-[#B0AF9F]/30 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-[#3C3C3B] font-brand font-bold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
