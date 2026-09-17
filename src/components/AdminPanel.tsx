import React, { useState, useMemo } from 'react';
import { MenuItem, RestaurantConfig } from '../types';
import { MENU_CATEGORIES } from '../data/initialMenu';
import { formatPrice } from '../lib/formatters';
import { EditDishModal } from './EditDishModal';
import { AdminConfigModal } from './AdminConfigModal';
import { CategoryTagManagerModal } from './CategoryTagManagerModal';
import { BrandManualModal } from './BrandManualModal';
import { SecurityPinModal } from './SecurityPinModal';
import { ExcelBackupModal } from './ExcelBackupModal';
import { SutekiHankoSeal, BRAND_COLORS } from './SutekiBrandAssets';
import { LazyImage } from './LazyImage';
import {
  Search,
  Plus,
  Percent,
  Settings,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Edit3,
  Image as ImageIcon,
  Flame,
  Leaf,
  Star,
  Layers,
  ArrowUpDown,
  Wine,
  Tag,
  Camera,
  Palette,
  Sparkles,
  KeyRound,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';

interface AdminPanelProps {
  items: MenuItem[];
  config: RestaurantConfig;
  isSyncing: boolean;
  isConnected: boolean;
  lastSyncTime: Date;
  onToggleAvailability: (id: string) => void;
  onUpdatePrice: (id: string, newPrice: number) => void;
  onUpdateItem: (id: string, updates: Partial<MenuItem>) => void;
  onAddItem: (item: Partial<MenuItem>) => void;
  onDeleteItem: (id: string) => void;
  onUpdateConfig: (updates: Partial<RestaurantConfig>) => void;
  onBulkPriceAdjust: (percent: number, category?: string) => void;
  onResetToDefaults: () => void;
  onViewCustomerMenu: () => void;
  onOpenQrStudio: () => void;
  onOpenPinModal?: () => void;
  onImportItems?: (items: MenuItem[], mode: 'replace' | 'merge') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  items,
  config,
  isSyncing,
  isConnected,
  lastSyncTime,
  onToggleAvailability,
  onUpdatePrice,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onUpdateConfig,
  onBulkPriceAdjust,
  onResetToDefaults,
  onViewCustomerMenu,
  onOpenQrStudio,
  onOpenPinModal,
  onImportItems,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [onlyAgotados, setOnlyAgotados] = useState(false);
  const [onlySushiman, setOnlySushiman] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isCategoryTagModalOpen, setIsCategoryTagModalOpen] = useState(false);
  const [isBrandManualOpen, setIsBrandManualOpen] = useState(false);
  const [isExcelBackupModalOpen, setIsExcelBackupModalOpen] = useState(false);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlinePriceVal, setInlinePriceVal] = useState<string>('');

  // Collect all unique categories
  const allCategories = useMemo(() => {
    return Array.from(
      new Set([
        ...MENU_CATEGORIES,
        ...(config.customCategories || []),
        ...items.map((i) => i.category).filter(Boolean),
      ])
    );
  }, [items, config.customCategories]);

  // Stats
  const totalItems = items.length;
  const availableItems = items.filter((i) => i.available).length;
  const unavailableItems = totalItems - availableItems;
  const sushimanItems = items.filter((i) => i.isSushimanSpecial).length;

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== 'Todos' && item.category !== selectedCategory) {
        return false;
      }
      if (onlyAgotados && item.available) {
        return false;
      }
      if (onlySushiman && !item.isSushimanSpecial) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        const matchesPairing = item.pairing?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesPairing) return false;
      }
      return true;
    });
  }, [items, selectedCategory, onlyAgotados, onlySushiman, searchQuery]);

  const handleStartInlineEdit = (item: MenuItem) => {
    setInlineEditingId(item.id);
    setInlinePriceVal(item.price.toString());
  };

  const handleSaveInlinePrice = (id: string) => {
    const num = parseInt(inlinePriceVal.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && num > 0) {
      onUpdatePrice(id, num);
    }
    setInlineEditingId(null);
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] overflow-y-auto overscroll-contain">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6 pt-3 sm:pt-6 pb-28 sm:pb-24 space-y-3.5 sm:space-y-6">
        {/* Top Admin Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#B0AF9F]/30 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
        <div className="w-full lg:w-auto">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5">
            <span className="px-2.5 sm:px-3 py-0.5 rounded-full bg-[#DC5D5D]/10 text-[#DC5D5D] text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase">
              Panel de Control en Vivo
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-[#3C3C3B]/70">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isConnected ? 'Sincronización activa' : 'Conectando al servidor...'}
            </span>
            {isSyncing && (
              <span className="text-[11px] sm:text-xs text-[#DC5D5D] font-mono animate-pulse flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Guardando...
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-brand font-black text-[#3C3C3B]">
            Gestión de Carta - {config.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#3C3C3B]/70 mt-0.5">
            Editá precios, fotos, categorías, filtros y maridajes al instante para los comensales que escanean el QR.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
          {/* PIN Button - Highlighted & intuitive */}
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="w-full sm:w-auto px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#DC5D5D] text-white text-xs font-brand font-bold hover:bg-[#c94e4e] transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 border border-[#DC5D5D]"
            title="Cambiar PIN de seguridad para acceder a la administración"
          >
            <KeyRound className="w-4 h-4 text-amber-200" />
            <span>PIN de Acceso: <strong className="font-mono tracking-wider">{config.adminPin || '2026'}</strong> 🔐</span>
          </button>

          <button
            onClick={() => setIsNewItemModalOpen(true)}
            className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#DC5D5D] text-white text-xs font-brand font-bold hover:bg-[#c94e4e] transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" /> Nuevo Plato
          </button>

          <button
            onClick={() => setIsCategoryTagModalOpen(true)}
            className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-brand font-bold hover:bg-amber-100 transition-all flex items-center justify-center gap-1.5 shadow-xs"
            title="Administrar categorías, filtros y recomendaciones de maridaje"
          >
            <Layers className="w-4 h-4 text-amber-700" /> Categorías & Filtros 🍷
          </button>

          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-rose-50 text-rose-950 border border-rose-200 text-xs font-brand font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-1.5 shadow-xs"
            title="Subir o cambiar foto del salón, mural y barra"
          >
            <Camera className="w-4 h-4 text-[#DC5D5D]" /> Foto Salón 🏮
          </button>

          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#F6EFE4] text-[#3C3C3B] text-xs font-brand font-bold hover:bg-white border border-[#B0AF9F]/40 transition-all flex items-center justify-center gap-1.5"
          >
            <Settings className="w-4 h-4 text-[#DC5D5D]" /> Ajustes
          </button>

          <button
            onClick={() => setIsExcelBackupModalOpen(true)}
            className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-brand font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-1.5 shadow-xs"
            title="Exportar la carta completa a Excel / CSV o restaurar desde un archivo"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" /> Excel / Respaldo 📊
          </button>

          <button
            onClick={onOpenQrStudio}
            className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#3C3C3B] text-[#F6EFE4] text-xs font-brand font-bold hover:bg-black transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Layers className="w-4 h-4 text-[#E37A7B]" /> QR Mesas
          </button>

          <button
            onClick={onViewCustomerMenu}
            className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white text-[#DC5D5D] border border-[#DC5D5D]/40 text-xs font-brand font-bold hover:bg-[#DC5D5D]/5 transition-all flex items-center justify-center gap-1.5"
          >
            <Eye className="w-4 h-4" /> Ver Carta
          </button>
        </div>
      </div>

      {/* Brand Identity & Resource Quick Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-[#B0AF9F]/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <SutekiHankoSeal size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-cubano text-[#DC5D5D]">
                01. Identidad de Marca Oficial Suteki
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#DC5D5D]/10 text-[#DC5D5D] font-bold">
                10年
              </span>
            </div>
            <p className="text-xs font-mono text-[#3C3C3B]/70">
              Paleta cromática oficial, tipografía Cubano y carpa Koi aplicadas en todo el sistema.
            </p>
          </div>
        </div>

        {/* 5 Official Swatches Preview */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-0.5">
          {BRAND_COLORS.map((c) => (
            <div
              key={c.hex}
              onClick={() => setIsBrandManualOpen(true)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl border border-black/10 shadow-xs cursor-pointer transform hover:scale-115 transition-transform flex items-center justify-center text-[9px] font-mono font-bold shrink-0"
              style={{ backgroundColor: c.hex, color: c.textColor }}
              title={`${c.name} (${c.hex}) - Click para ver manual`}
            >
              •
            </div>
          ))}
          <button
            onClick={() => setIsBrandManualOpen(true)}
            className="ml-1 sm:ml-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-[#DC5D5D]/30 text-xs font-mono font-bold text-[#DC5D5D] hover:bg-[#DC5D5D]/5 transition-colors whitespace-nowrap"
          >
            Manual
          </button>
        </div>
      </div>

      {/* Security & PIN Quick Management Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-[#DC5D5D]/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#DC5D5D]/10 border border-[#DC5D5D]/25 flex items-center justify-center text-[#DC5D5D] shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#DC5D5D]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-cubano text-[#DC5D5D]">
                Seguridad de Carta & PIN Administrador
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                Protegido
              </span>
            </div>
            <p className="text-xs font-mono text-[#3C3C3B]/70 mt-0.5">
              PIN activo: <strong className="text-[#DC5D5D] text-sm tracking-wider font-mono">{config.adminPin || '2026'}</strong>. Protege precios y carta ante los comensales.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPinModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl bg-[#DC5D5D] text-white text-xs font-brand font-bold hover:bg-[#c94e4e] transition-all flex items-center justify-center gap-2 shadow-xs whitespace-nowrap active:scale-95"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-200" />
          <span>Modificar PIN de Acceso</span>
        </button>
      </div>

      {/* Ambience & Brand Visual Card */}
      {config.ambienceImageUrl && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-[#B0AF9F]/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border border-[#B0AF9F]/40 shadow-xs">
              <LazyImage
                src={config.ambienceImageUrl}
                alt="Ambiente del Salón"
                themePlaceholder="coral"
                className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
                wrapperClassName="w-full h-full"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[9px] sm:text-[10px] font-mono font-bold uppercase">
                  Foto de Salón Activa
                </span>
                {config.showAmbienceHero !== false && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-mono font-bold">
                    Portada
                  </span>
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-brand font-bold text-[#3C3C3B] truncate">
                {config.ambienceTitle || 'Salón & Barra Nikkei Suteki'}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#3C3C3B]/70 line-clamp-1 max-w-xl">
                {config.ambienceDescription || 'Mural de garzas y luna roja, barra tradicional y luces cálidas.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[#B0AF9F]/40 hover:bg-[#F6EFE4] text-xs font-brand font-bold text-[#3C3C3B] transition-colors shrink-0 flex items-center justify-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5 text-[#DC5D5D]" /> Cambiar Foto o Textos
          </button>
        </div>
      )}

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#B0AF9F]/30 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-mono text-[#3C3C3B]/60 uppercase">Total Platos</span>
          <p className="text-xl sm:text-2xl font-brand font-black text-[#3C3C3B]">{totalItems}</p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-100 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-mono text-emerald-700 uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" /> Disponibles
          </span>
          <p className="text-xl sm:text-2xl font-brand font-black text-emerald-700">{availableItems}</p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-red-100 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-mono text-red-600 uppercase flex items-center gap-1">
            <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" /> Agotados (86)
          </span>
          <p className="text-xl sm:text-2xl font-brand font-black text-red-600">{unavailableItems}</p>
        </div>

        <div
          onClick={() => setOnlySushiman(!onlySushiman)}
          className={`bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border shadow-xs cursor-pointer transition-all ${
            onlySushiman ? 'border-[#DC5D5D] ring-2 ring-[#DC5D5D]/20 bg-rose-50/50' : 'border-[#DC5D5D]/30 hover:border-[#DC5D5D]'
          }`}
        >
          <span className="text-[10px] sm:text-[11px] font-mono text-[#DC5D5D] uppercase flex items-center justify-between font-bold">
            <span>🍣 Sushiman</span>
            <span className="text-[9px] underline">Filtrar</span>
          </span>
          <p className="text-xl sm:text-2xl font-brand font-black text-[#DC5D5D]">{sushimanItems}</p>
        </div>

        <div
          onClick={() => setIsCategoryTagModalOpen(true)}
          className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#B0AF9F]/30 shadow-xs cursor-pointer hover:border-[#DC5D5D] transition-colors group"
        >
          <span className="text-[10px] sm:text-[11px] font-mono text-[#3C3C3B]/60 uppercase flex items-center justify-between">
            Categorías <span className="text-[#DC5D5D] font-bold text-[9px] sm:text-[10px] group-hover:underline">Gestionar</span>
          </span>
          <p className="text-xl sm:text-2xl font-brand font-black text-[#3C3C3B]">{allCategories.length}</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-[#B0AF9F]/30 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80 lg:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 sm:top-3 text-[#3C3C3B]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por plato, ingrediente, maridaje..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#F6EFE4]/60 border border-[#B0AF9F]/40 focus:outline-none focus:border-[#DC5D5D]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs text-[#3C3C3B]/50 hover:text-black"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
            <button
              onClick={() => setOnlyAgotados(!onlyAgotados)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all border ${
                onlyAgotados
                  ? 'bg-red-50 text-red-700 border-red-300 ring-2 ring-red-200'
                  : 'bg-white text-[#3C3C3B]/80 border-[#B0AF9F]/30 hover:bg-gray-50'
              }`}
            >
              {onlyAgotados ? 'Mostrando: Agotados' : 'Filtrar Agotados'}
            </button>

            <button
              onClick={() => setOnlySushiman(!onlySushiman)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all border flex items-center gap-1.5 ${
                onlySushiman
                  ? 'bg-[#DC5D5D] text-white border-[#DC5D5D] ring-2 ring-[#DC5D5D]/20 shadow-xs'
                  : 'bg-white text-[#DC5D5D] border-[#DC5D5D]/40 hover:bg-[#DC5D5D]/5'
              }`}
            >
              <span>🍣</span>
              <span>{onlySushiman ? 'Mostrando: Sushiman' : `Sugerencia Sushiman (${sushimanItems})`}</span>
            </button>

            <button
              onClick={() => setIsCategoryTagModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-[#F6EFE4] text-[#3C3C3B] hover:bg-white border border-[#B0AF9F]/30 transition-all flex items-center gap-1"
            >
              <Tag className="w-3.5 h-3.5 text-[#DC5D5D]" /> Filtros & Categorías
            </button>

            <button
              onClick={onResetToDefaults}
              className="text-xs text-[#3C3C3B]/60 hover:text-[#DC5D5D] transition-colors font-mono underline ml-auto md:ml-0"
              title="Restaurar los platos y configuración original"
            >
              Restablecer
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar border-t border-[#B0AF9F]/20 pt-2.5 sm:pt-3 -mx-1 px-1">
          <button
            onClick={() => setSelectedCategory('Todos')}
            className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-brand font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'Todos'
                ? 'bg-[#DC5D5D] text-white shadow-xs'
                : 'bg-[#F6EFE4] text-[#3C3C3B] hover:bg-[#B0AF9F]/20'
            }`}
          >
            Todos ({items.length})
          </button>
          {allCategories.map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-brand font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#DC5D5D] text-white shadow-xs'
                    : 'bg-[#F6EFE4] text-[#3C3C3B] hover:bg-[#B0AF9F]/20'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
          <button
            onClick={() => setIsCategoryTagModalOpen(true)}
            className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-[#DC5D5D] border border-dashed border-[#DC5D5D] hover:bg-[#DC5D5D]/10 whitespace-nowrap shrink-0"
          >
            + Nueva Categoría
          </button>
        </div>
      </div>

      {/* Items Table / List */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#B0AF9F]/30 shadow-xs overflow-hidden">
        {/* Desktop / Tablet Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#B0AF9F]/30 bg-[#F6EFE4]/60 text-[11px] font-mono uppercase text-[#3C3C3B]/80">
                <th className="py-3 px-4 font-semibold w-16">Foto</th>
                <th className="py-3 px-4 font-semibold">Plato & Descripción</th>
                <th className="py-3 px-4 font-semibold w-36">Categoría</th>
                <th className="py-3 px-4 font-semibold w-36">
                  Precio <span className="text-[9px] lowercase">(click para editar)</span>
                </th>
                <th className="py-3 px-4 font-semibold w-40 text-center">Disponibilidad en Vivo</th>
                <th className="py-3 px-4 font-semibold w-24 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B0AF9F]/20 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#3C3C3B]/60 font-mono">
                    No se encontraron platos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#F6EFE4]/40 transition-colors ${
                      !item.available ? 'bg-red-50/40 opacity-80' : ''
                    }`}
                  >
                    {/* Photo Thumbnail */}
                    <td className="py-3 px-4 align-middle">
                      <div
                        onClick={() => setEditingItem(item)}
                        className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#B0AF9F]/30 cursor-pointer group shrink-0"
                        title="Click para cambiar foto"
                      >
                        <LazyImage
                          src={item.imageUrl}
                          alt={item.name}
                          themePlaceholder={item.isChefSpecial ? 'coral' : 'cream'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          wrapperClassName="w-full h-full"
                          fallbackIcon={
                            <div className="w-full h-full flex items-center justify-center text-[#B0AF9F]">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          }
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                          <Edit3 className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    </td>

                    {/* Name & Details */}
                    <td className="py-3 px-4 align-middle">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-brand font-bold text-sm text-[#3C3C3B]">
                          {item.name}
                        </span>
                        {item.unit && (
                          <span className="text-[10px] font-mono text-[#3C3C3B]/60 px-2 py-0.5 rounded-md bg-[#F6EFE4] border border-[#B0AF9F]/20">
                            {item.unit}
                          </span>
                        )}
                        {item.isChefSpecial && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Especial
                          </span>
                        )}
                        {item.isSushimanSpecial && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#DC5D5D]/15 text-[#DC5D5D] border border-[#DC5D5D]/30 text-[10px] font-bold">
                            🍣 Sushiman
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onUpdateItem(item.id, { isSushimanSpecial: !item.isSushimanSpecial })}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                            item.isSushimanSpecial
                              ? 'text-[#DC5D5D] bg-[#DC5D5D]/10 hover:bg-[#DC5D5D]/20 font-bold'
                              : 'text-stone-400 hover:text-[#DC5D5D] hover:bg-stone-100'
                          }`}
                          title={item.isSushimanSpecial ? "Quitar recomendación del Sushiman" : "Marcar como Recomendación del Sushiman"}
                        >
                          {item.isSushimanSpecial ? '★ Barra' : '+ 🍣 Sushiman'}
                        </button>
                      </div>

                      {item.description && (
                        <p className="text-[11px] text-[#3C3C3B]/70 line-clamp-1 max-w-md mt-0.5">
                          {item.description}
                        </p>
                      )}

                      {/* Tags & Price scales */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        {item.tags.map((t) => (
                          <span
                            key={t}
                            className={`text-[9px] px-1.5 py-0.2 rounded-md font-mono ${
                              t === 'Veggie'
                                ? 'bg-emerald-100 text-emerald-800'
                                : t === 'Picante'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-[#F6EFE4] text-[#3C3C3B]/70'
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                        {item.priceScales && (
                          <span className="text-[10px] text-[#DC5D5D] font-mono">
                            • {item.priceScales}
                          </span>
                        )}
                      </div>

                      {/* Maridaje badge if present */}
                      {item.pairing && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-[#DC5D5D] bg-[#DC5D5D]/10 px-2 py-0.5 rounded-md inline-flex border border-[#DC5D5D]/20">
                          <Wine className="w-3 h-3 shrink-0" />
                          <span className="line-clamp-1">Maridaje: {item.pairing}</span>
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 align-middle">
                      <span className="px-2.5 py-1 rounded-lg bg-[#F6EFE4] text-[#3C3C3B] text-xs font-mono font-medium border border-[#B0AF9F]/20">
                        {item.category}
                      </span>
                    </td>

                    {/* Price with In-Line Edit */}
                    <td className="py-3 px-4 align-middle">
                      {inlineEditingId === item.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            autoFocus
                            value={inlinePriceVal}
                            onChange={(e) => setInlinePriceVal(e.target.value)}
                            onBlur={() => handleSaveInlinePrice(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveInlinePrice(item.id);
                              if (e.key === 'Escape') setInlineEditingId(null);
                            }}
                            className="w-24 px-2 py-1 bg-white border border-[#DC5D5D] rounded-lg text-xs font-mono font-bold text-[#DC5D5D] focus:outline-none"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartInlineEdit(item)}
                          className="group flex items-center gap-1.5 px-2.5 py-1 rounded-xl hover:bg-gray-100 transition-colors text-left"
                          title="Click para editar precio"
                        >
                          <span className="font-mono font-bold text-sm text-[#DC5D5D]">
                            {formatPrice(item.price)}
                          </span>
                          <Edit3 className="w-3 h-3 text-[#3C3C3B]/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </td>

                    {/* Fast Real-Time Availability Switch */}
                    <td className="py-3 px-4 align-middle text-center">
                      <button
                        onClick={() => onToggleAvailability(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-brand font-bold transition-all shadow-xs ${
                          item.available
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                            : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-300'
                        }`}
                        title="Click para cambiar disponibilidad en tiempo real"
                      >
                        {item.available ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                            Disponible
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-red-600" />
                            Agotado (86'd)
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 align-middle text-right">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 rounded-lg text-[#3C3C3B]/70 hover:text-[#DC5D5D] hover:bg-[#F6EFE4] transition-colors"
                        title="Editar plato completo"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Touch-Optimized Cards View (prevents horizontal overflow on phones) */}
        <div className="md:hidden divide-y divide-[#B0AF9F]/20">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-[#3C3C3B]/60 font-mono text-xs">
              No se encontraron platos con los filtros seleccionados.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 space-y-2.5 transition-colors ${
                  !item.available ? 'bg-red-50/40' : ''
                }`}
              >
                {/* Header: Photo, Name, Category, Edit Action */}
                <div className="flex items-start gap-3">
                  <div
                    onClick={() => setEditingItem(item)}
                    className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#B0AF9F]/30 cursor-pointer shrink-0"
                    title="Click para cambiar foto"
                  >
                    <LazyImage
                      src={item.imageUrl}
                      alt={item.name}
                      themePlaceholder={item.isChefSpecial ? 'coral' : 'cream'}
                      className="w-full h-full object-cover"
                      wrapperClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 active:opacity-100">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-brand font-bold text-sm text-[#3C3C3B] leading-snug">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 rounded-lg text-[#3C3C3B]/70 hover:text-[#DC5D5D] hover:bg-[#F6EFE4] transition-colors shrink-0"
                        title="Editar plato"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      <span className="px-2 py-0.5 rounded-md bg-[#F6EFE4] text-[#3C3C3B] text-[10px] font-mono font-medium border border-[#B0AF9F]/20">
                        {item.category}
                      </span>
                      {item.unit && (
                        <span className="text-[10px] font-mono text-[#3C3C3B]/60 px-1.5 py-0.5 rounded-md bg-[#F6EFE4]">
                          {item.unit}
                        </span>
                      )}
                      {item.isChefSpecial && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[9px] font-bold">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Especial
                        </span>
                      )}
                      {item.isSushimanSpecial && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#DC5D5D]/15 text-[#DC5D5D] border border-[#DC5D5D]/30 text-[9px] font-bold">
                          🍣 Sushiman
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onUpdateItem(item.id, { isSushimanSpecial: !item.isSushimanSpecial })}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors ${
                          item.isSushimanSpecial
                            ? 'text-[#DC5D5D] bg-[#DC5D5D]/10 font-bold'
                            : 'text-stone-400 hover:text-[#DC5D5D]'
                        }`}
                        title={item.isSushimanSpecial ? "Quitar recomendación del Sushiman" : "Marcar como Recomendación del Sushiman"}
                      >
                        {item.isSushimanSpecial ? '★ Barra' : '+ 🍣'}
                      </button>
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-[#3C3C3B]/70 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Controls: In-line Price + Big Touch Availability Toggle */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#B0AF9F]/15">
                  {/* Price with In-line Edit */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-[#3C3C3B]/60 uppercase">Precio:</span>
                    {inlineEditingId === item.id ? (
                      <input
                        type="text"
                        autoFocus
                        value={inlinePriceVal}
                        onChange={(e) => setInlinePriceVal(e.target.value)}
                        onBlur={() => handleSaveInlinePrice(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveInlinePrice(item.id);
                          if (e.key === 'Escape') setInlineEditingId(null);
                        }}
                        className="w-20 px-2 py-1 bg-white border border-[#DC5D5D] rounded-lg text-xs font-mono font-bold text-[#DC5D5D] focus:outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => handleStartInlineEdit(item)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F6EFE4]/90 hover:bg-[#F6EFE4] text-xs font-mono font-bold text-[#DC5D5D] border border-[#B0AF9F]/30"
                        title="Tocar para editar precio"
                      >
                        <span>{formatPrice(item.price)}</span>
                        <Edit3 className="w-3 h-3 opacity-60" />
                      </button>
                    )}
                  </div>

                  {/* Availability Button with 42px touch height */}
                  <button
                    onClick={() => onToggleAvailability(item.id)}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-brand font-bold transition-all shadow-2xs flex items-center gap-1.5 active:scale-95 ${
                      item.available
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.available ? 'bg-emerald-600 animate-pulse' : 'bg-red-600'
                      }`}
                    />
                    <span>{item.available ? 'Disponible' : 'Agotado (86)'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer bar showing status */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#F6EFE4]/40 border-t border-[#B0AF9F]/20 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#3C3C3B]/60 gap-1 sm:gap-0 text-center sm:text-left">
          <span>Mostrando {filteredItems.length} de {items.length} platos en carta</span>
          <span>Última sincronización: {lastSyncTime.toLocaleTimeString()}</span>
        </div>
      </div>
      </div>

      {/* Fixed / Sticky PIN Access Bar at the Bottom - Always accessible without scroll */}
      <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[94vw] sm:max-w-md w-full px-2 pointer-events-none">
        <button
          onClick={() => (onOpenPinModal ? onOpenPinModal() : setIsPinModalOpen(true))}
          className="pointer-events-auto w-full flex items-center justify-between gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-[#262625]/95 hover:bg-[#1E1E1D] text-white shadow-2xl border border-[#B0AF9F]/40 backdrop-blur-md active:scale-98 transition-all hover:border-[#DC5D5D] group"
          title="Ver o cambiar PIN de administración"
          aria-label="Acceso al PIN de administración"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#DC5D5D]/20 border border-[#DC5D5D]/40 flex items-center justify-center text-[#DC5D5D] shrink-0 group-hover:scale-105 transition-transform">
              <KeyRound className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-left min-w-0">
              <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
                <span>PIN de Administración</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-xs sm:text-sm font-mono font-bold text-white tracking-widest truncate">
                {config.adminPin || '2026'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#DC5D5D] group-hover:bg-[#c94e4e] text-white text-[11px] sm:text-xs font-brand font-bold shadow-xs transition-colors flex items-center gap-1">
              Cambiar PIN 🔐
            </span>
          </div>
        </button>
      </div>

      {/* Edit Dish Modal */}
      <EditDishModal
        item={editingItem}
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        existingCategories={allCategories}
        existingTags={config.customTags || []}
        onSave={(data) => {
          if (editingItem) {
            onUpdateItem(editingItem.id, data);
          }
        }}
        onDelete={(id) => onDeleteItem(id)}
      />

      {/* New Dish Modal */}
      <EditDishModal
        item={null}
        isOpen={isNewItemModalOpen}
        onClose={() => setIsNewItemModalOpen(false)}
        existingCategories={allCategories}
        existingTags={config.customTags || []}
        onSave={(data) => onAddItem(data)}
      />

      {/* Category, Tag & Pairing Manager Modal */}
      <CategoryTagManagerModal
        isOpen={isCategoryTagModalOpen}
        onClose={() => setIsCategoryTagModalOpen(false)}
        config={config}
        items={items}
        onUpdateConfig={onUpdateConfig}
        onSelectCategoryFilter={(cat) => setSelectedCategory(cat)}
      />

      {/* Admin Config & Price Adjust Modal */}
      <AdminConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={config}
        onSaveConfig={onUpdateConfig}
        onBulkPriceAdjust={onBulkPriceAdjust}
      />

      {/* Brand Identity & Guidelines Manual Modal */}
      <BrandManualModal
        isOpen={isBrandManualOpen}
        onClose={() => setIsBrandManualOpen(false)}
        isDark={false}
      />

      {/* Security PIN Change Modal */}
      <SecurityPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        currentPin={config.adminPin || '2026'}
        onSavePin={(newPin) => onUpdateConfig({ adminPin: newPin })}
        isDark={false}
      />

      {/* Excel / CSV Backup and Import Modal */}
      <ExcelBackupModal
        isOpen={isExcelBackupModalOpen}
        onClose={() => setIsExcelBackupModalOpen(false)}
        items={items}
        onImport={(importedItems, mode) => {
          if (onImportItems) {
            onImportItems(importedItems, mode);
          } else {
            // Fallback: update individually or alert
            importedItems.forEach((item) => onUpdateItem(item.id, item));
          }
        }}
      />
    </div>
  );
};
