import React from 'react';
import { DietaryFilterState, MenuItem } from '../types';
import {
  X,
  SlidersHorizontal,
  Check,
  RotateCcw,
  Sparkles,
  Wheat,
  Leaf,
  Fish,
  Flame,
  Star,
  Wine,
  ShieldCheck,
  ChefHat,
} from 'lucide-react';

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DietaryFilterState;
  onChangeFilter: <K extends keyof DietaryFilterState>(key: K, value: boolean) => void;
  onResetFilters: () => void;
  items: MenuItem[];
  isDark?: boolean;
}

export const AdvancedFilterModal: React.FC<AdvancedFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onChangeFilter,
  onResetFilters,
  items,
  isDark = false,
}) => {
  if (!isOpen) return null;

  // Active filters count
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-lg rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col transition-all ${
          isDark
            ? 'bg-[#1C1C1B] border-[#383836] text-[#F6EFE4]'
            : 'bg-[#F6EFE4] border-[#B0AF9F]/40 text-[#3C3C3B]'
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 sm:px-6 py-3.5 sm:py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'bg-[#242423] border-[#333331]' : 'bg-white border-[#B0AF9F]/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DC5D5D]/15 border border-[#DC5D5D]/30 flex items-center justify-center text-[#DC5D5D] shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#DC5D5D] font-bold">
                Personalización
              </span>
              <h2 className="text-lg sm:text-xl font-brand font-black tracking-tight">
                Filtros Avanzados & Dietas
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-white/10 text-[#F6EFE4]' : 'hover:bg-gray-100 text-[#3C3C3B]'
            }`}
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Section: Preferencias & Dietas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-1.5 border-[#B0AF9F]/20">
              <span className="text-xs font-mono font-bold text-[#DC5D5D] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Dietas & Restricciones</span>
              </span>
            </div>

            <div className="space-y-2">
              {/* Sin TACC / Gluten Free */}
              <label
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  filters.onlyGlutenFree
                    ? 'bg-[#DC5D5D]/10 border-[#DC5D5D] text-[#DC5D5D]'
                    : isDark
                    ? 'bg-[#222221] border-[#333331] hover:bg-[#282827]'
                    : 'bg-white border-[#B0AF9F]/30 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <Wheat className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-brand font-bold">
                      Apto Celíacos (Sin TACC / Gluten Free)
                    </div>
                    <div
                      className={`text-[11px] font-mono leading-tight ${
                        isDark ? 'text-[#F6EFE4]/60' : 'text-[#3C3C3B]/70'
                      }`}
                    >
                      Oculta platos elaborados con panko o harina de trigo
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filters.onlyGlutenFree}
                  onChange={(e) => onChangeFilter('onlyGlutenFree', e.target.checked)}
                  className="w-5 h-5 rounded text-[#DC5D5D] accent-[#DC5D5D]"
                />
              </label>

              {/* Vegetariano */}
              <label
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  filters.onlyVeggie
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600'
                    : isDark
                    ? 'bg-[#222221] border-[#333331] hover:bg-[#282827]'
                    : 'bg-white border-[#B0AF9F]/30 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <Leaf className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-brand font-bold">
                      Vegetariano (Veggie)
                    </div>
                    <div
                      className={`text-[11px] font-mono leading-tight ${
                        isDark ? 'text-[#F6EFE4]/60' : 'text-[#3C3C3B]/70'
                      }`}
                    >
                      Platos con base de palta, vegetales, hongos y tofu
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filters.onlyVeggie}
                  onChange={(e) => onChangeFilter('onlyVeggie', e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-600 accent-emerald-600"
                />
              </label>

              {/* Vegano */}
              <label
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  filters.onlyVegan
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600'
                    : isDark
                    ? 'bg-[#222221] border-[#333331] hover:bg-[#282827]'
                    : 'bg-white border-[#B0AF9F]/30 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0 border border-teal-500/20">
                    <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-brand font-bold">
                      100% Vegano (Sin ingredientes animales)
                    </div>
                    <div
                      className={`text-[11px] font-mono leading-tight ${
                        isDark ? 'text-[#F6EFE4]/60' : 'text-[#3C3C3B]/70'
                      }`}
                    >
                      Sin pescados, mariscos ni lácteos
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filters.onlyVegan}
                  onChange={(e) => onChangeFilter('onlyVegan', e.target.checked)}
                  className="w-5 h-5 rounded text-teal-600 accent-teal-600"
                />
              </label>
            </div>
          </div>

          {/* Section: Alérgenos a Excluir */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-1.5 border-[#B0AF9F]/20">
              <span className="text-xs font-mono font-bold text-[#DC5D5D] uppercase tracking-wider flex items-center gap-1.5">
                <Fish className="w-4 h-4" strokeWidth={1.5} />
                <span>Exclusión de Alérgenos</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Sin Mariscos */}
              <label
                className={`p-3 rounded-2xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                  filters.excludeSeafood
                    ? 'bg-rose-500/10 border-rose-500 text-rose-600'
                    : isDark
                    ? 'bg-[#222221] border-[#333331]'
                    : 'bg-white border-[#B0AF9F]/30'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 border border-rose-500/20">
                    <Fish className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-brand font-bold truncate">Sin Mariscos</div>
                    <div className="text-[10px] font-mono opacity-70 truncate">Excluir langostinos y rabas</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filters.excludeSeafood}
                  onChange={(e) => onChangeFilter('excludeSeafood', e.target.checked)}
                  className="w-4 h-4 accent-[#DC5D5D]"
                />
              </label>

              {/* Sin Lácteos */}
              <label
                className={`p-3 rounded-2xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                  filters.excludeDairy
                    ? 'bg-amber-500/10 border-amber-500 text-amber-600'
                    : isDark
                    ? 'bg-[#222221] border-[#333331]'
                    : 'bg-white border-[#B0AF9F]/30'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-brand font-bold truncate">Sin Lácteos / Queso</div>
                    <div className="text-[10px] font-mono opacity-70 truncate">Excluir queso philadelphia</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filters.excludeDairy}
                  onChange={(e) => onChangeFilter('excludeDairy', e.target.checked)}
                  className="w-4 h-4 accent-[#DC5D5D]"
                />
              </label>
            </div>
          </div>

          {/* Section: Selección Especial */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-1.5 border-[#B0AF9F]/20">
              <span className="text-xs font-mono font-bold text-[#DC5D5D] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                <span>Recomendaciones & Barra</span>
              </span>
            </div>

            <div className="space-y-2">
              {/* Sugerencia del Sushiman */}
              <label
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  filters.onlySushimanSpecial
                    ? 'bg-[#DC5D5D]/15 border-[#DC5D5D] text-[#DC5D5D]'
                    : isDark
                    ? 'bg-[#222221] border-[#333331] hover:bg-[#282827]'
                    : 'bg-white border-[#B0AF9F]/30 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#DC5D5D]/10 text-[#DC5D5D] flex items-center justify-center shrink-0 border border-[#DC5D5D]/20">
                    <ChefHat className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-brand font-bold flex items-center gap-1.5">
                      <span>Sugerencia del Sushiman (Itamae)</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#DC5D5D] text-white">
                        TOP
                      </span>
                    </div>
                    <div
                      className={`text-[11px] font-mono leading-tight ${
                        isDark ? 'text-[#F6EFE4]/60' : 'text-[#3C3C3B]/70'
                      }`}
                    >
                      Platos insignia seleccionados personalmente por la barra
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filters.onlySushimanSpecial}
                  onChange={(e) => onChangeFilter('onlySushimanSpecial', e.target.checked)}
                  className="w-5 h-5 rounded text-[#DC5D5D] accent-[#DC5D5D]"
                />
              </label>

              {/* Platos con Maridaje */}
              <label
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  filters.onlyPairing
                    ? 'bg-rose-500/10 border-rose-500 text-rose-600'
                    : isDark
                    ? 'bg-[#222221] border-[#333331] hover:bg-[#282827]'
                    : 'bg-white border-[#B0AF9F]/30 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 border border-rose-500/20">
                    <Wine className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-brand font-bold">
                      Platos con Maridaje Sugerido
                    </div>
                    <div
                      className={`text-[11px] font-mono leading-tight ${
                        isDark ? 'text-[#F6EFE4]/60' : 'text-[#3C3C3B]/70'
                      }`}
                    >
                      Opciones con recomendación de vino, cerveza o cóctel
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filters.onlyPairing}
                  onChange={(e) => onChangeFilter('onlyPairing', e.target.checked)}
                  className="w-5 h-5 rounded text-rose-600 accent-rose-600"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-4 sm:px-6 py-3.5 sm:py-4 border-t flex items-center justify-between gap-3 shrink-0 ${
            isDark ? 'bg-[#242423] border-[#333331]' : 'bg-white border-[#B0AF9F]/30'
          }`}
        >
          <button
            onClick={onResetFilters}
            disabled={activeCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold text-gray-500 hover:text-[#DC5D5D] disabled:opacity-40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar ({activeCount})</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#DC5D5D] hover:bg-[#c94e4e] text-white font-brand font-bold text-xs shadow-md transition-all"
          >
            Aplicar Filtros {activeCount > 0 ? `(${activeCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
