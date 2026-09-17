import React, { useState } from 'react';
import { MenuItem } from '../types';
import { MENU_CATEGORIES } from '../data/initialMenu';
import { PHOTO_PRESETS } from '../data/photoGallery';
import { LazyImage } from './LazyImage';
import { DishImagePreview } from './DishImagePreview';
import { X, Upload, Image as ImageIcon, Sparkles, Check, Trash2, Wine, Plus } from 'lucide-react';

interface EditDishModalProps {
  item: MenuItem | null; // null means adding new dish
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Partial<MenuItem>) => void;
  onDelete?: (id: string) => void;
  existingCategories?: string[];
  existingTags?: string[];
}

export const EditDishModal: React.FC<EditDishModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
  onDelete,
  existingCategories = [],
  existingTags = [],
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(item);

  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState(item?.category || 'Sushi Rolls');
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [price, setPrice] = useState(item?.price?.toString() || '0');
  const [unit, setUnit] = useState(item?.unit || '8 piezas');
  const [priceScales, setPriceScales] = useState(item?.priceScales || '');
  const [description, setDescription] = useState(item?.description || '');
  const [pairing, setPairing] = useState(item?.pairing || '');
  const [imageUrl, setImageUrl] = useState(item?.imageUrl || '');
  const [available, setAvailable] = useState(item?.available ?? true);
  const [tags, setTags] = useState<string[]>(item?.tags || []);
  const [isChefSpecial, setIsChefSpecial] = useState(item?.isChefSpecial ?? false);
  const [isSushimanSpecial, setIsSushimanSpecial] = useState(item?.isSushimanSpecial ?? false);
  const [tagInput, setTagInput] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  // Merge categories
  const categoriesList = Array.from(
    new Set([...MENU_CATEGORIES, ...existingCategories, category].filter(Boolean))
  );

  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setImageUrl(loadEvt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
    const finalCategory = isCustomCategoryMode && customCategoryInput.trim()
      ? customCategoryInput.trim()
      : category;

    onSave({
      name: name.trim(),
      category: finalCategory,
      price: numericPrice,
      unit: unit.trim(),
      priceScales: priceScales.trim(),
      description: description.trim(),
      pairing: pairing.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      available,
      tags,
      isChefSpecial,
      isSushimanSpecial,
    });
    onClose();
  };

  const commonTags = Array.from(
    new Set([
      'Favorito',
      'Veggie',
      'Picante',
      'Sin TACC',
      'Apto Celíaco',
      'Para compartir',
      'Recomendado',
      'Maridaje Especial',
      ...existingTags,
    ])
  );

  const quickPairingSuggestions = [
    'Sauvignon Blanc fresco',
    'Torrontés salteño',
    'Chardonnay roble',
    'Pisco Sour Nikkei',
    'Gin Tonic con pepino',
    'Pinot Noir patagónico',
    'Rosé seco de Malbec',
    'Cerveza rubia helada',
    'Limonada menta & jengibre',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#F6EFE4] w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-[#B0AF9F]/40 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-[#B0AF9F]/30 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#DC5D5D] font-bold">
              {isEditing ? 'Editar Plato en Tiempo Real' : 'Nuevo Plato para la Carta'}
            </span>
            <h2 className="text-lg sm:text-xl font-brand font-bold text-[#3C3C3B]">
              {isEditing ? item?.name : 'Agregar Nuevo Plato'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-[#3C3C3B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1">
                Nombre del Plato *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej: New York phila"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-sm focus:outline-none focus:border-[#DC5D5D]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80">
                  Categoría *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCategoryMode(!isCustomCategoryMode);
                    if (!isCustomCategoryMode) {
                      setCustomCategoryInput('');
                    }
                  }}
                  className="text-[11px] font-mono text-[#DC5D5D] hover:underline font-bold"
                >
                  {isCustomCategoryMode ? '← Elegir existente' : '+ Nueva categoría'}
                </button>
              </div>

              {isCustomCategoryMode ? (
                <input
                  type="text"
                  required
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  placeholder="Nombre de la nueva categoría (ej: Cócteles, Vinos...)"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DC5D5D] text-sm focus:outline-none focus:ring-1 focus:ring-[#DC5D5D]"
                />
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-sm focus:outline-none focus:border-[#DC5D5D]"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Pricing & Units */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1">
                Precio Principal ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-[#3C3C3B]/60 font-mono">$</span>
                <input
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="16240"
                  className="w-full pl-7 pr-3.5 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-sm font-mono font-bold text-[#DC5D5D] focus:outline-none focus:border-[#DC5D5D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1">
                Unidad / Porción
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="ej: 8 piezas, 1 porción"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-sm focus:outline-none focus:border-[#DC5D5D]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1">
                Precios / Escalas (Opcional)
              </label>
              <input
                type="text"
                value={priceScales}
                onChange={(e) => setPriceScales(e.target.value)}
                placeholder="ej: 4 piezas $9.280"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-sm focus:outline-none focus:border-[#DC5D5D]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1">
              Descripción e Ingredientes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detallar ingredientes frescos, terminaciones, aderezos..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-sm focus:outline-none focus:border-[#DC5D5D]"
            />
          </div>

          {/* Maridaje Sugerido (Pairing) */}
          <div className="bg-white p-4 rounded-2xl border border-[#B0AF9F]/30 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase font-bold text-[#DC5D5D] flex items-center gap-1.5">
                <Wine className="w-4 h-4" /> Maridaje Sugerido (Vinos, Cócteles o Bebidas)
              </label>
              <span className="text-[10px] font-mono text-[#3C3C3B]/60">
                Aparece destacado en la carta digital
              </span>
            </div>
            <input
              type="text"
              value={pairing}
              onChange={(e) => setPairing(e.target.value)}
              placeholder="ej: Sauvignon Blanc fresco o Pisco Sour Nikkei"
              className="w-full px-3.5 py-2 rounded-xl bg-[#F6EFE4]/40 border border-[#B0AF9F]/40 text-xs font-mono focus:outline-none focus:border-[#DC5D5D]"
            />
            {/* Quick pairing pills */}
            <div>
              <span className="text-[10px] font-mono text-[#3C3C3B]/60 block mb-1">
                Sugerencias rápidas para añadir:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPairingSuggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      if (!pairing) setPairing(sug);
                      else if (!pairing.includes(sug)) setPairing(`${pairing} o ${sug}`);
                    }}
                    className="px-2.5 py-1 text-[10px] font-mono rounded-lg bg-[#F6EFE4] hover:bg-[#DC5D5D]/10 hover:text-[#DC5D5D] border border-[#B0AF9F]/30 text-[#3C3C3B] transition-colors"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dedicated Photo Preview & Upload Status Component */}
          <div className="bg-white p-4 rounded-2xl border border-[#B0AF9F]/30 space-y-3">
            <DishImagePreview
              imageUrl={imageUrl}
              onImageUrlChange={(url) => setImageUrl(url)}
              dishName={name}
              category={category}
              price={Number(price) || 0}
              tags={tags}
              unit={unit}
              isDark={false}
            />

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="text-xs text-[#DC5D5D] hover:underline font-mono flex items-center gap-1 font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {showPresets ? 'Ocultar Galería Curada' : 'Elegir de Galería Recomendada Nikkei'}
              </button>
            </div>

            {/* Presets Grid */}
            {showPresets && (
              <div className="pt-3 border-t border-[#B0AF9F]/20">
                <p className="text-xs text-[#3C3C3B]/70 mb-2 font-mono">
                  Fotos culinarias curadas estilo Suteki Nikkei:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                  {PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.url);
                        setShowPresets(false);
                      }}
                      className="group relative rounded-lg overflow-hidden border border-[#B0AF9F]/30 aspect-square hover:border-[#DC5D5D]"
                    >
                      <LazyImage
                        src={preset.url}
                        alt={preset.name}
                        themePlaceholder="cream"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        wrapperClassName="w-full h-full"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[9px] p-0.5 truncate block z-10">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tags & Flags */}
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80">
              Etiquetas Dietarias y Destacados
            </label>
            <div className="flex flex-wrap gap-2">
              {commonTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    tags.includes(tag)
                      ? 'bg-[#DC5D5D] text-white border-[#DC5D5D]'
                      : 'bg-white text-[#3C3C3B] border-[#B0AF9F]/40 hover:bg-gray-50'
                  }`}
                >
                  {tags.includes(tag) && <Check className="w-3 h-3 inline mr-1" />}
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Agregar etiqueta personalizada..."
                className="px-3 py-1.5 text-xs rounded-xl bg-white border border-[#B0AF9F]/40 focus:outline-none focus:border-[#DC5D5D]"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                disabled={!tagInput.trim()}
                className="px-3 py-1.5 bg-[#3C3C3B] text-white text-xs font-medium rounded-xl hover:bg-black transition-colors disabled:opacity-40"
              >
                + Añadir
              </button>
            </div>
          </div>

          {/* Availability & Chef Special Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#B0AF9F]/30">
            <label className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#B0AF9F]/30 cursor-pointer">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="w-4 h-4 text-[#DC5D5D] rounded focus:ring-[#DC5D5D]"
              />
              <div>
                <span className="text-xs font-bold text-[#3C3C3B] block">
                  {available ? '🟢 Plato Disponible' : '🔴 Agotado / No Disponible'}
                </span>
                <span className="text-[11px] text-[#3C3C3B]/60">
                  {available ? 'Visible en el menú digital' : 'Se muestra como agotado en el menú'}
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#B0AF9F]/30 cursor-pointer">
              <input
                type="checkbox"
                checked={isChefSpecial}
                onChange={(e) => setIsChefSpecial(e.target.checked)}
                className="w-4 h-4 text-[#DC5D5D] rounded focus:ring-[#DC5D5D]"
              />
              <div>
                <span className="text-xs font-bold text-[#3C3C3B] block">⭐ Sugerencia del Chef</span>
                <span className="text-[11px] text-[#3C3C3B]/60">Destacado visualmente en la carta</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#DC5D5D]/40 cursor-pointer sm:col-span-2">
              <input
                type="checkbox"
                checked={isSushimanSpecial}
                onChange={(e) => setIsSushimanSpecial(e.target.checked)}
                className="w-4 h-4 text-[#DC5D5D] rounded focus:ring-[#DC5D5D]"
              />
              <div>
                <span className="text-xs font-bold text-[#DC5D5D] flex items-center gap-1">
                  🍣 Insignia «Sugerencia del Sushiman» (Recomendación de Barra Nikkei)
                </span>
                <span className="text-[11px] text-[#3C3C3B]/65">
                  Muestra la insignia oficial del Sushiman con sello de autor en el menú digital del comensal.
                </span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#B0AF9F]/30 flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (item && confirm(`¿Eliminar definitivamente "${item.name}"?`)) {
                    onDelete(item.id);
                    onClose();
                  }
                }}
                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Eliminar plato
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#B0AF9F]/40 text-xs font-medium text-[#3C3C3B] hover:bg-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#DC5D5D] text-white text-xs font-brand font-bold hover:bg-[#c94e4e] transition-colors shadow-xs"
              >
                {isEditing ? 'Guardar Cambios' : 'Crear Plato'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
