import React, { useState } from 'react';
import { MenuItem, RestaurantConfig } from '../types';
import { MENU_CATEGORIES } from '../data/initialMenu';
import { X, Plus, Trash2, Tag, Layers, Wine, Check, Sparkles } from 'lucide-react';

interface CategoryTagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RestaurantConfig;
  items: MenuItem[];
  onUpdateConfig: (updates: Partial<RestaurantConfig>) => void;
  onSelectCategoryFilter?: (cat: string) => void;
}

export const CategoryTagManagerModal: React.FC<CategoryTagManagerModalProps> = ({
  isOpen,
  onClose,
  config,
  items,
  onUpdateConfig,
  onSelectCategoryFilter,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'categories' | 'tags' | 'pairings'>('categories');
  const [newCatInput, setNewCatInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  // Collect all unique categories
  const allCategories = Array.from(
    new Set([
      ...MENU_CATEGORIES,
      ...(config.customCategories || []),
      ...items.map((i) => i.category).filter(Boolean),
    ])
  );

  // Collect all unique tags
  const defaultTags = ['Favorito', 'Veggie', 'Picante', 'Para compartir', 'Recomendado'];
  const allTags = Array.from(
    new Set([
      ...defaultTags,
      ...(config.customTags || []),
      ...items.flatMap((i) => i.tags || []).filter(Boolean),
    ])
  );

  const handleAddCategory = (catToAdd?: string) => {
    const name = (catToAdd || newCatInput).trim();
    if (!name) return;
    if (allCategories.includes(name)) {
      setNewCatInput('');
      return;
    }
    const currentCustom = config.customCategories || [];
    const updated = [...currentCustom, name];
    onUpdateConfig({ customCategories: updated });
    setNewCatInput('');
  };

  const handleRemoveCategory = (catToRemove: string) => {
    // Cannot remove if items are using it unless confirmed
    const count = items.filter((i) => i.category === catToRemove).length;
    if (count > 0) {
      if (!confirm(`La categoría "${catToRemove}" tiene ${count} platos activos. ¿Deseas removerla de las listas personalizadas?`)) {
        return;
      }
    }
    const currentCustom = config.customCategories || [];
    const updated = currentCustom.filter((c) => c !== catToRemove);
    onUpdateConfig({ customCategories: updated });
  };

  const handleAddTag = (tagToAdd?: string) => {
    const name = (tagToAdd || newTagInput).trim();
    if (!name) return;
    if (allTags.includes(name)) {
      setNewTagInput('');
      return;
    }
    const currentCustom = config.customTags || [];
    const updated = [...currentCustom, name];
    onUpdateConfig({ customTags: updated });
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentCustom = config.customTags || [];
    const updated = currentCustom.filter((t) => t !== tagToRemove);
    onUpdateConfig({ customTags: updated });
  };

  const suggestedCategories = [
    'Bebidas & Tragos',
    'Vinos & Espumantes',
    'Cócteles de Autor',
    'Wok & Brasas',
    'Sashimi Especial',
    'Sugerencias de Temporada',
    'Menú Mediodía',
  ];

  const suggestedTags = [
    'Sin TACC',
    'Apto Celíaco',
    'Maridaje Especial',
    'Pesca del Día',
    'Picante Suave',
    'Flambeado',
    'Dulce',
    'Clásico',
    'Novedad',
  ];

  const suggestedPairingsList = [
    {
      style: 'Vinos Blancos Frescos',
      drinks: 'Sauvignon Blanc, Torrontés salteño, Pinot Grigio',
      recommendation: 'Ideal para ceviches, tiraditos y nigiris frescos con toques de lima y cilantro.',
    },
    {
      style: 'Vinos Blancos con Cuerpo',
      drinks: 'Chardonnay con paso por roble, Viognier',
      recommendation: 'Perfecto para piezas con salmón rosado, palta, queso Philadelphia y salsas teriyaki.',
    },
    {
      style: 'Vinos Rosados & Tintos Ligeros',
      drinks: 'Rosé seco de Malbec, Pinot Noir patagónico',
      recommendation: 'Ideal para rolls fritos (hot rolls), carnes nikkei y piezas flambeables.',
    },
    {
      style: 'Coctelería Nikkei & Botánicos',
      drinks: 'Pisco Sour con maracuyá, Gin Tonic con pepino y wasabi, Mule de jengibre',
      recommendation: 'Limpia el paladar y complementa a la perfección platos con frituras en panko y salsas agridulces.',
    },
    {
      style: 'Cervezas & Sin Alcohol',
      drinks: 'Cerveza Asahi / Stella Artois rubia, Té frío de jazmín, Limonada menta y jengibre',
      recommendation: 'Refrescante, ligero y accesible para cualquier plato del menú.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#F6EFE4] w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-[#B0AF9F]/40 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-[#B0AF9F]/30 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#DC5D5D] font-bold">
              Configuración de Carta
            </span>
            <h2 className="text-lg sm:text-xl font-brand font-black text-[#3C3C3B]">
              Categorías, Filtros y Maridaje
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-[#3C3C3B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#B0AF9F]/30 bg-[#EFE7D8]/80 px-3 sm:px-6 pt-2 sm:pt-3 gap-1.5 sm:gap-2 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 sm:px-4 py-2 text-xs font-brand font-bold rounded-t-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-white text-[#DC5D5D] border-t border-x border-[#B0AF9F]/30 shadow-xs'
                : 'text-[#3C3C3B]/70 hover:text-[#3C3C3B]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Categorías ({allCategories.length})
          </button>

          <button
            onClick={() => setActiveTab('tags')}
            className={`px-4 py-2 text-xs font-brand font-bold rounded-t-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'tags'
                ? 'bg-white text-[#DC5D5D] border-t border-x border-[#B0AF9F]/30 shadow-xs'
                : 'text-[#3C3C3B]/70 hover:text-[#3C3C3B]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Filtros & Etiquetas ({allTags.length})
          </button>

          <button
            onClick={() => setActiveTab('pairings')}
            className={`px-4 py-2 text-xs font-brand font-bold rounded-t-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'pairings'
                ? 'bg-white text-[#DC5D5D] border-t border-x border-[#B0AF9F]/30 shadow-xs'
                : 'text-[#3C3C3B]/70 hover:text-[#3C3C3B]'
            }`}
          >
            <Wine className="w-3.5 h-3.5 text-[#DC5D5D]" />
            Ideas de Maridaje 🍷
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Add category form */}
              <div className="bg-white p-4 rounded-2xl border border-[#B0AF9F]/30 shadow-xs space-y-3">
                <label className="text-xs font-mono font-bold uppercase text-[#3C3C3B] block">
                  Agregar Nueva Categoría a la Carta
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                    placeholder="ej: Bebidas, Cócteles de Autor, Wok..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[#F6EFE4]/50 border border-[#B0AF9F]/40 focus:outline-none focus:border-[#DC5D5D]"
                  />
                  <button
                    onClick={() => handleAddCategory()}
                    disabled={!newCatInput.trim()}
                    className="px-4 py-2 bg-[#DC5D5D] text-white text-xs font-brand font-bold rounded-xl hover:bg-[#c94e4e] transition-colors disabled:opacity-40 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>

                {/* Suggestions */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#3C3C3B]/60 block mb-1.5">
                    Sugerencias frecuentes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedCategories.map((sug) => {
                      const exists = allCategories.includes(sug);
                      return (
                        <button
                          key={sug}
                          onClick={() => handleAddCategory(sug)}
                          disabled={exists}
                          className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all ${
                            exists
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default'
                              : 'bg-white text-[#3C3C3B] border-[#B0AF9F]/30 hover:border-[#DC5D5D] hover:text-[#DC5D5D]'
                          }`}
                        >
                          {exists ? `✓ ${sug}` : `+ ${sug}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Existing Categories List */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-[#3C3C3B] block">
                  Categorías en Carta ({allCategories.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {allCategories.map((cat) => {
                    const count = items.filter((i) => i.category === cat).length;
                    const isCustom = config.customCategories?.includes(cat);

                    return (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#B0AF9F]/30 shadow-xs"
                      >
                        <div>
                          <p className="text-xs font-brand font-bold text-[#3C3C3B]">{cat}</p>
                          <span className="text-[10px] font-mono text-[#3C3C3B]/60">
                            {count} {count === 1 ? 'plato' : 'platos'}
                            {isCustom && ' • Personalizada'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isCustom && (
                            <button
                              onClick={() => handleRemoveCategory(cat)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remover categoría"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TAGS & FILTERS */}
          {activeTab === 'tags' && (
            <div className="space-y-6">
              {/* Add tag form */}
              <div className="bg-white p-4 rounded-2xl border border-[#B0AF9F]/30 shadow-xs space-y-3">
                <label className="text-xs font-mono font-bold uppercase text-[#3C3C3B] block">
                  Agregar Nueva Etiqueta / Filtro Culinario
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="ej: Sin TACC, Apto Celíaco, Dulce..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[#F6EFE4]/50 border border-[#B0AF9F]/40 focus:outline-none focus:border-[#DC5D5D]"
                  />
                  <button
                    onClick={() => handleAddTag()}
                    disabled={!newTagInput.trim()}
                    className="px-4 py-2 bg-[#DC5D5D] text-white text-xs font-brand font-bold rounded-xl hover:bg-[#c94e4e] transition-colors disabled:opacity-40 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>

                {/* Suggestions */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#3C3C3B]/60 block mb-1.5">
                    Etiquetas gastronómicas recomendadas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedTags.map((sug) => {
                      const exists = allTags.includes(sug);
                      return (
                        <button
                          key={sug}
                          onClick={() => handleAddTag(sug)}
                          disabled={exists}
                          className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all ${
                            exists
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default'
                              : 'bg-white text-[#3C3C3B] border-[#B0AF9F]/30 hover:border-[#DC5D5D] hover:text-[#DC5D5D]'
                          }`}
                        >
                          {exists ? `✓ ${sug}` : `+ ${sug}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Existing Tags */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-[#3C3C3B] block">
                  Etiquetas activas en la carta ({allTags.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => {
                    const count = items.filter((i) => i.tags?.includes(tag)).length;
                    const isCustom = config.customTags?.includes(tag);

                    return (
                      <div
                        key={tag}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#B0AF9F]/30 shadow-xs text-xs font-mono"
                      >
                        <span className="font-bold text-[#3C3C3B]">{tag}</span>
                        <span className="text-[10px] text-[#3C3C3B]/50">({count})</span>
                        {isCustom && (
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="text-red-500 hover:text-red-700 ml-1"
                            title="Remover filtro"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WINE & BEVERAGE PAIRINGS (Ideas de Maridaje) */}
          {activeTab === 'pairings' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#DC5D5D]/10 border border-[#DC5D5D]/20 text-[#3C3C3B] space-y-1.5">
                <div className="flex items-center gap-2">
                  <Wine className="w-5 h-5 text-[#DC5D5D]" />
                  <h3 className="font-brand font-bold text-sm text-[#DC5D5D]">
                    ¿Por qué el maridaje es clave para Suteki?
                  </h3>
                </div>
                <p className="text-xs font-mono leading-relaxed text-[#3C3C3B]/80">
                  La cocina Nikkei combina la sutiliza del pescado fresco con notas ácidas, picantes y salsas agridulces. Recomendar una bebida específica por plato:
                </p>
                <ul className="text-xs font-mono text-[#3C3C3B]/90 list-disc list-inside space-y-1 pt-1">
                  <li><strong>Orienta al comensal</strong>: Evita que elijan bebidas que tapen el sabor del salmón o el arroz de sushi.</li>
                  <li><strong>Aumenta el ticket promedio</strong>: Estimula la venta de vinos blancos, espumantes y coctelería de autor.</li>
                  <li><strong>Añade valor de restaurante gourmet</strong>: Transforma una simple carta en una recomendación de sommelier.</li>
                </ul>
              </div>

              <span className="text-xs font-mono font-bold uppercase text-[#3C3C3B] block">
                Guía de Maridajes para la Cocina de Suteki
              </span>

              <div className="space-y-3">
                {suggestedPairingsList.map((pairing) => (
                  <div
                    key={pairing.style}
                    className="p-4 rounded-2xl bg-white border border-[#B0AF9F]/30 shadow-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-brand font-bold text-xs text-[#DC5D5D]">
                        {pairing.style}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F6EFE4] text-[#3C3C3B]/80 border border-[#B0AF9F]/20">
                        Sugerencia Sommelier
                      </span>
                    </div>
                    <p className="text-xs font-mono font-bold text-[#3C3C3B]">
                      {pairing.drinks}
                    </p>
                    <p className="text-[11px] font-mono text-[#3C3C3B]/70 leading-relaxed">
                      {pairing.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#B0AF9F]/30 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#3C3C3B] text-white text-xs font-brand font-bold hover:bg-black transition-colors shadow-xs"
          >
            Listo / Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
