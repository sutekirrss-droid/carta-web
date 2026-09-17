import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Smartphone,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { KoiIllustration } from './KoiIllustration';
import { normalizeImageUrl } from '../lib/imageOptimization';

interface DishImagePreviewProps {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  dishName: string;
  category: string;
  price: number;
  tags?: string[];
  unit?: string;
  isDark?: boolean;
}

export const DishImagePreview: React.FC<DishImagePreviewProps> = ({
  imageUrl,
  onImageUrlChange,
  dishName,
  category,
  price,
  tags = [],
  unit = '',
  isDark = false,
}) => {
  const [previewMode, setPreviewMode] = useState<'card' | 'expanded'>('card');
  const [imageStatus, setImageStatus] = useState<'empty' | 'loading' | 'valid' | 'error'>('empty');
  const [isDragging, setIsDragging] = useState(false);

  // Validate image URL on change
  useEffect(() => {
    if (!imageUrl || !imageUrl.trim()) {
      setImageStatus('empty');
      return;
    }

    setImageStatus('loading');
    const img = new Image();
    img.onload = () => setImageStatus('valid');
    img.onerror = () => setImageStatus('error');
    img.src = normalizeImageUrl(imageUrl);
  }, [imageUrl]);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccioná un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageUrlChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone & Status Bar */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-4 rounded-2xl border-2 transition-all ${
          isDragging
            ? 'border-[#DC5D5D] bg-[#DC5D5D]/10'
            : isDark
            ? 'border-[#444442] bg-[#242423]'
            : 'border-[#B0AF9F]/40 bg-[#F6EFE4]/60'
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 space-y-2 w-full">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase text-[#DC5D5D] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Fotografía del Plato
              </label>

              {/* Status Badge */}
              <div className="flex items-center gap-1 text-[11px] font-mono">
                {imageStatus === 'valid' && (
                  <span className="text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Foto verificada lista
                  </span>
                )}
                {imageStatus === 'empty' && (
                  <span className="text-[#3C3C3B]/70 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#DC5D5D]" /> Usando Washi Placeholder
                  </span>
                )}
                {imageStatus === 'loading' && (
                  <span className="text-amber-700 bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Verificando imagen...
                  </span>
                )}
                {imageStatus === 'error' && (
                  <span className="text-red-700 bg-red-100 dark:bg-red-950/40 dark:text-red-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Error al cargar URL
                  </span>
                )}
              </div>
            </div>

            {/* Input row */}
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => onImageUrlChange(e.target.value)}
                placeholder="Pegar URL de foto (https://images.unsplash.com/...)"
                className={`flex-1 px-3.5 py-2 text-xs rounded-xl border focus:outline-none focus:border-[#DC5D5D] font-mono ${
                  isDark
                    ? 'bg-[#1C1C1B] border-[#444442] text-[#F6EFE4]'
                    : 'bg-white border-[#B0AF9F]/40 text-[#3C3C3B]'
                }`}
              />
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => onImageUrlChange('')}
                  className="px-2.5 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-xs flex items-center"
                  title="Quitar imagen"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* File selection & drag hint */}
            <div className="flex items-center justify-between pt-1">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DC5D5D] text-white hover:bg-[#c84e4e] transition-colors text-xs font-mono font-bold shadow-xs">
                <Upload className="w-3.5 h-3.5" /> Subir archivo desde dispositivo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>

              <span className="text-[10px] font-mono opacity-60 hidden sm:inline-block">
                O arrastrá y soltá una foto aquí
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Live Preview Component */}
      <div
        className={`p-4 rounded-2xl border ${
          isDark ? 'bg-[#1F1F1E] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#DC5D5D]" />
            <span className="text-xs font-cubano">
              Vista Previa en Vivo (Carta del Cliente)
            </span>
          </div>

          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-0.5 rounded-lg text-xs font-mono">
            <button
              type="button"
              onClick={() => setPreviewMode('card')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                previewMode === 'card'
                  ? 'bg-[#DC5D5D] text-white font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Tarjeta en Menú
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('expanded')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                previewMode === 'expanded'
                  ? 'bg-[#DC5D5D] text-white font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Detalle Expandido
            </button>
          </div>
        </div>

        {/* Card View Preview */}
        {previewMode === 'card' ? (
          <div
            className={`max-w-sm mx-auto p-3.5 rounded-2xl border flex gap-3.5 shadow-xs transition-colors ${
              isDark ? 'bg-[#262625] border-[#3C3C3B]' : 'bg-[#F6EFE4] border-[#B0AF9F]/30'
            }`}
          >
            {/* Image Box */}
            <div className="w-24 h-24 rounded-xl overflow-hidden relative shrink-0 border border-black/10 bg-[#E8DFC8]/60 flex items-center justify-center">
              {imageUrl && imageStatus === 'valid' ? (
                <img
                  src={normalizeImageUrl(imageUrl)}
                  alt={dishName || 'Plato'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-[#EADDC9]">
                  <KoiIllustration className="w-10 h-10 opacity-30 text-[#DC5D5D]" />
                  <span className="text-[9px] font-mono text-[#DC5D5D] font-bold mt-0.5">
                    10年 SUTEKI
                  </span>
                </div>
              )}

              {/* Tag overlay */}
              {tags.length > 0 && (
                <span className="absolute bottom-1 left-1 bg-[#DC5D5D] text-white text-[8px] font-mono px-1 rounded-xs uppercase font-bold">
                  {tags[0]}
                </span>
              )}
            </div>

            {/* Dish Info in Preview */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <span className="text-[9px] font-mono text-[#DC5D5D] uppercase tracking-wider block font-bold truncate">
                  {category || 'Categoría'}
                </span>
                <h4 className="font-cubano text-sm tracking-tight truncate">
                  {dishName || 'Nombre del Plato'}
                </h4>
                {unit && (
                  <span className="text-[10px] font-mono opacity-60 block">
                    {unit}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 mt-2">
                <span className="font-cubano text-base text-[#DC5D5D]">
                  ${price ? price.toLocaleString('es-AR') : '0'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Expanded Modal View Preview */
          <div
            className={`max-w-md mx-auto rounded-2xl border overflow-hidden shadow-lg ${
              isDark ? 'bg-[#262625] border-[#3C3C3B]' : 'bg-[#F6EFE4] border-[#B0AF9F]/30'
            }`}
          >
            <div className="h-44 w-full relative bg-[#EADDC9] flex items-center justify-center overflow-hidden">
              {imageUrl && imageStatus === 'valid' ? (
                <img
                  src={normalizeImageUrl(imageUrl)}
                  alt={dishName || 'Plato'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <KoiIllustration className="w-16 h-16 opacity-35 text-[#DC5D5D] mb-1" />
                  <span className="text-xs font-cubano text-[#DC5D5D]">
                    Suteki Nikkei • Experiencia Visual
                  </span>
                  <span className="text-[10px] font-mono opacity-60 mt-0.5">
                    Placeholder con trama de marca
                  </span>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded-full backdrop-blur-xs">
                ${price ? price.toLocaleString('es-AR') : '0'}
              </div>
            </div>

            <div className="p-4 space-y-1">
              <span className="text-[10px] font-mono text-[#DC5D5D] font-bold uppercase tracking-wider">
                {category || 'Categoría'}
              </span>
              <h4 className="font-cubano text-lg">
                {dishName || 'Nombre del Plato'}
              </h4>
              <p className="text-xs font-mono opacity-70">
                Vista previa del plato tal como lo apreciará el comensal al hacer clic.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
