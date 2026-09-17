import React, { useState } from 'react';
import { RestaurantConfig } from '../types';
import { MENU_CATEGORIES } from '../data/initialMenu';
import { AMBIENCE_PHOTO_PRESETS } from '../data/photoGallery';
import { LazyImage } from './LazyImage';
import { X, Percent, Store, Wifi, Calendar, Sparkles, Camera, Image, Upload, Check, Eye, Layers, Lock, KeyRound, ShieldCheck } from 'lucide-react';

interface AdminConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RestaurantConfig;
  onSaveConfig: (updates: Partial<RestaurantConfig>) => void;
  onBulkPriceAdjust: (percent: number, category?: string) => void;
}

export const AdminConfigModal: React.FC<AdminConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onBulkPriceAdjust,
}) => {
  const [activeTab, setActiveTab] = useState<'ambience' | 'fondos' | 'promo' | 'prices' | 'info' | 'security'>('ambience');

  // Restaurant info fields
  const [adminPin, setAdminPin] = useState(config.adminPin || '2026');
  const [promoText, setPromoText] = useState(config.promoText || '');
  const [activePromoDiscount, setActivePromoDiscount] = useState(config.activePromoDiscount || '');
  const [wifiNetwork, setWifiNetwork] = useState(config.wifiNetwork || '');
  const [wifiPassword, setWifiPassword] = useState(config.wifiPassword || '');
  const [schedule, setSchedule] = useState(config.schedule || '');
  const [phone, setPhone] = useState(config.phone || '');
  const [address, setAddress] = useState(config.address || '');

  // Ambience fields
  const [ambienceImageUrl, setAmbienceImageUrl] = useState(config.ambienceImageUrl || '');
  const [showAmbienceHero, setShowAmbienceHero] = useState(config.showAmbienceHero !== false);
  const [ambienceTitle, setAmbienceTitle] = useState(config.ambienceTitle || 'Salón & Barra Nikkei Suteki');
  const [ambienceDescription, setAmbienceDescription] = useState(
    config.ambienceDescription ||
      'Mural de garzas y luna roja, iluminación cálida y barra tradicional para disfrutar la experiencia sushi.'
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Background pattern fields (Authentic Google Drive Brand Assets)
  const [backgroundPattern, setBackgroundPattern] = useState<'aletas' | 'koi' | 'aletas-verde' | 'none'>(
    config.backgroundPattern || 'aletas'
  );
  const [backgroundPatternOpacity, setBackgroundPatternOpacity] = useState<number>(
    config.backgroundPatternOpacity ?? 0.22
  );

  // Bulk price fields
  const [pricePercent, setPricePercent] = useState<number>(10);
  const [priceCategory, setPriceCategory] = useState<string>('all');
  const [priceAdjustmentDone, setPriceAdjustmentDone] = useState(false);

  if (!isOpen) return null;

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      promoText,
      activePromoDiscount,
      wifiNetwork,
      wifiPassword,
      schedule,
      phone,
      address,
      ambienceImageUrl,
      showAmbienceHero,
      ambienceTitle,
      ambienceDescription,
      backgroundPattern,
      backgroundPatternOpacity,
      adminPin: adminPin.trim() || '2026',
    });
    onClose();
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      if (dataUrl) {
        setAmbienceImageUrl(dataUrl);
        try {
          const res = await fetch('/api/upload-ambience', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUrl }),
          });
          const data = await res.json();
          if (data.url) {
            setAmbienceImageUrl(data.url);
            onSaveConfig({ ambienceImageUrl: data.url, showAmbienceHero: true });
          }
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 3000);
        } catch {
          // fallback to client-side dataUrl
          onSaveConfig({ ambienceImageUrl: dataUrl, showAmbienceHero: true });
        }
      }
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPricePercent = () => {
    const cat = priceCategory === 'all' ? undefined : priceCategory;
    onBulkPriceAdjust(pricePercent, cat);
    setPriceAdjustmentDone(true);
    setTimeout(() => setPriceAdjustmentDone(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#F6EFE4] w-full max-w-xl rounded-2xl sm:rounded-3xl border border-[#B0AF9F]/40 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-[#B0AF9F]/30 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#DC5D5D] font-bold">
              Configuración & Promos
            </span>
            <h2 className="text-lg sm:text-xl font-brand font-bold text-[#3C3C3B]">
              Ajustes del Menú & Local
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-[#3C3C3B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#B0AF9F]/30 bg-[#F6EFE4] px-3 sm:px-6 pt-2 sm:pt-3 gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('ambience')}
            className={`pb-2.5 sm:pb-3 px-2.5 sm:px-3 text-xs font-brand font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'ambience'
                ? 'border-[#DC5D5D] text-[#DC5D5D]'
                : 'border-transparent text-[#3C3C3B]/70 hover:text-[#3C3C3B]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 inline mr-1" /> Salón & Ambiente
          </button>
          <button
            onClick={() => setActiveTab('fondos')}
            className={`pb-2.5 sm:pb-3 px-2.5 sm:px-3 text-xs font-brand font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'fondos'
                ? 'border-[#DC5D5D] text-[#DC5D5D]'
                : 'border-transparent text-[#3C3C3B]/70 hover:text-[#3C3C3B]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 inline mr-1" /> Tramas & Fondo
          </button>
          <button
            onClick={() => setActiveTab('promo')}
            className={`pb-2.5 sm:pb-3 px-2.5 sm:px-3 text-xs font-brand font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'promo'
                ? 'border-[#DC5D5D] text-[#DC5D5D]'
                : 'border-transparent text-[#3C3C3B]/70 hover:text-[#3C3C3B]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Promoción
          </button>
          <button
            onClick={() => setActiveTab('prices')}
            className={`pb-2.5 sm:pb-3 px-2.5 sm:px-3 text-xs font-brand font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'prices'
                ? 'border-[#DC5D5D] text-[#DC5D5D]'
                : 'border-transparent text-[#3C3C3B]/70 hover:text-[#3C3C3B]'
            }`}
          >
            <Percent className="w-3.5 h-3.5 inline mr-1" /> Ajuste Precios
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 sm:pb-3 px-2.5 sm:px-3 text-xs font-brand font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-[#DC5D5D] text-[#DC5D5D]'
                : 'border-transparent text-[#3C3C3B]/70 hover:text-[#3C3C3B]'
            }`}
          >
            <Store className="w-3.5 h-3.5 inline mr-1" /> Datos & Wi-Fi
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2.5 sm:pb-3 px-2.5 sm:px-3 text-xs font-brand font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-[#DC5D5D] text-[#DC5D5D]'
                : 'border-transparent text-[#3C3C3B]/70 hover:text-[#3C3C3B]'
            }`}
          >
            <Lock className="w-3.5 h-3.5 inline mr-1" /> PIN & Seguridad
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Tab: Salón & Ambiente */}
          {activeTab === 'ambience' && (
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-brand font-bold text-[#3C3C3B]">
                    Fotografía de Ambiente & Salón Suteki
                  </h3>
                  <p className="text-xs text-[#3C3C3B]/70 leading-relaxed mt-0.5">
                    Subí la foto del salón, la barra de sushi o el mural de garzas y luna roja para lucirla en la cabecera del menú digital y en la sección de experiencia.
                  </p>
                </div>
              </div>

              {/* Photo Preview & Banner Simulator */}
              <div className="relative rounded-2xl overflow-hidden border border-[#B0AF9F]/40 shadow-xs bg-black/90 aspect-[16/9] sm:aspect-[21/9]">
                {ambienceImageUrl ? (
                  <LazyImage
                    src={ambienceImageUrl}
                    alt="Vista previa ambiente"
                    themePlaceholder="coral"
                    className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
                    wrapperClassName="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/50 p-4">
                    <Image className="w-8 h-8 mb-2 opacity-60" />
                    <span className="text-xs font-mono">Sin foto de salón configurada</span>
                  </div>
                )}

                {/* Overlay Header Simulator */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 p-4 flex flex-col justify-end">
                  <span className="text-[10px] font-mono tracking-widest text-[#DC5D5D] uppercase font-bold">
                    Vista previa cabecera menú
                  </span>
                  <h4 className="text-lg font-brand font-black text-white drop-shadow-xs">
                    {config.name}
                  </h4>
                  <p className="text-[11px] font-mono text-white/80 line-clamp-1">
                    {ambienceTitle || config.tagline}
                  </p>
                </div>

                {uploadSuccess && (
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1 shadow-md">
                    <Check className="w-3.5 h-3.5" /> ¡Foto actualizada!
                  </div>
                )}
              </div>

              {/* Upload Input & URL Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5 text-[#DC5D5D]" /> Subir archivo desde tu dispositivo
                  </label>
                  <label className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed border-[#DC5D5D]/40 bg-white hover:bg-rose-50/50 cursor-pointer transition-colors text-center">
                    <Camera className="w-6 h-6 text-[#DC5D5D] mb-1" />
                    <span className="text-xs font-brand font-bold text-[#3C3C3B]">
                      {isUploadingImage ? 'Cargando foto...' : 'Elegir foto del salón'}
                    </span>
                    <span className="text-[10px] font-mono text-[#3C3C3B]/60 mt-0.5">
                      JPG, PNG o WEBP (salón, mural o barra)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1">
                    O pegar URL directa de imagen
                  </label>
                  <input
                    type="url"
                    value={ambienceImageUrl}
                    onChange={(e) => setAmbienceImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-xs focus:outline-none focus:border-[#DC5D5D]"
                  />

                  {/* Toggle banner hero */}
                  <label className="flex items-center gap-2 mt-2 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showAmbienceHero}
                      onChange={(e) => setShowAmbienceHero(e.target.checked)}
                      className="w-4 h-4 rounded text-[#DC5D5D] accent-[#DC5D5D] cursor-pointer"
                    />
                    <span className="text-xs font-medium text-[#3C3C3B]">
                      Usar foto como fondo de cabecera en el menú
                    </span>
                  </label>
                </div>
              </div>

              {/* Presets */}
              <div>
                <span className="block text-[11px] font-mono uppercase font-semibold text-[#3C3C3B]/70 mb-1.5">
                  Galería de Estilos & Presets de Salón Suteki:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AMBIENCE_PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAmbienceImageUrl(preset.url)}
                      className={`group text-left p-1.5 rounded-xl border transition-all ${
                        ambienceImageUrl === preset.url
                          ? 'border-[#DC5D5D] ring-2 ring-[#DC5D5D]/20 bg-rose-50/60'
                          : 'border-[#B0AF9F]/30 hover:border-[#DC5D5D]/50 bg-white'
                      }`}
                    >
                      <div className="w-full h-14 rounded-lg overflow-hidden mb-1">
                        <LazyImage
                          src={preset.url}
                          alt={preset.name}
                          themePlaceholder="coral"
                          className="w-full h-full object-cover"
                          wrapperClassName="w-full h-full"
                        />
                      </div>
                      <span className="text-[10px] font-brand font-bold text-[#3C3C3B] line-clamp-1 block">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title and Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1">
                    Título de la Sección Salón
                  </label>
                  <input
                    type="text"
                    value={ambienceTitle}
                    onChange={(e) => setAmbienceTitle(e.target.value)}
                    placeholder="Salón & Barra Nikkei Suteki"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1">
                    Descripción del Ambiente
                  </label>
                  <input
                    type="text"
                    value={ambienceDescription}
                    onChange={(e) => setAmbienceDescription(e.target.value)}
                    placeholder="Mural de garzas y luna roja, iluminación cálida..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#B0AF9F]/20">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-[#B0AF9F]/40 text-xs font-medium text-[#3C3C3B]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#DC5D5D] text-white text-xs font-brand font-bold hover:bg-[#c94e4e] transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Guardar Ambiente
                </button>
              </div>
            </form>
          )}

          {/* Tab: Tramas & Fondo Oficial (Google Drive Brand Assets) */}
          {activeTab === 'fondos' && (
            <form onSubmit={handleSaveInfo} className="space-y-5">
              <div>
                <h3 className="text-sm font-brand font-bold text-[#3C3C3B]">
                  Tramas & Fondos Oficiales de Marca (Google Drive)
                </h3>
                <p className="text-xs text-[#3C3C3B]/70 leading-relaxed mt-0.5">
                  Seleccioná la textura oficial que se aplicará como fondo principal en el menú de clientes sobre el fondo crema/washi (#F6EFE4).
                </p>
              </div>

              {/* Texture Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'aletas',
                    title: 'Trama Aletas',
                    sub: 'Trama Aletas.pdf',
                    url: '/assets/branding/trama-aletas.jpg',
                    desc: 'Geometría nikkei de aletas en tono crema washi oficial',
                  },
                  {
                    id: 'koi',
                    title: 'Trama Koi',
                    sub: 'Trama Koi.pdf',
                    url: '/assets/branding/trama-koi.jpg',
                    desc: 'Peces carpa koi nadando en textura washi tradicional',
                  },
                  {
                    id: 'aletas-verde',
                    title: 'Trama Jade Matcha',
                    sub: 'Trama aletas verde.pdf',
                    url: '/assets/branding/trama-aletas-verde.jpg',
                    desc: 'Variante en pigmento vegetal matcha y jade nikkei',
                  },
                  {
                    id: 'none',
                    title: 'Washi Liso',
                    sub: 'Sin textura superpuesta',
                    url: '',
                    desc: 'Fondo puro crema washi (#F6EFE4) sin tramado adicional',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setBackgroundPattern(item.id as any)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      backgroundPattern === item.id
                        ? 'border-[#DC5D5D] bg-[#DC5D5D]/5 shadow-sm'
                        : 'border-[#B0AF9F]/30 hover:border-[#B0AF9F]/70 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-xs font-brand font-bold text-[#3C3C3B] block">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#DC5D5D] block">
                          {item.sub}
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          backgroundPattern === item.id
                            ? 'border-[#DC5D5D] bg-[#DC5D5D]'
                            : 'border-[#B0AF9F]'
                        }`}
                      >
                        {backgroundPattern === item.id && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                    </div>

                    {/* Preview window */}
                    <div
                      className="h-20 rounded-xl border border-black/10 overflow-hidden relative"
                      style={{
                        backgroundColor: '#F6EFE4',
                        backgroundImage: item.url ? `url(${item.url})` : 'none',
                        backgroundRepeat: 'repeat',
                        backgroundSize: '240px auto',
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/85 text-[#3C3C3B] shadow-xs backdrop-blur-xs">
                          {item.id === 'none' ? 'Liso Washi' : 'Muestra 100%'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] font-mono text-[#3C3C3B]/70 mt-2">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Opacity slider */}
              <div className="p-4 rounded-2xl bg-white border border-[#B0AF9F]/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#3C3C3B]">Intensidad / Opacidad del fondo:</span>
                  <span className="font-bold text-[#DC5D5D]">
                    {Math.round(backgroundPatternOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.45"
                  step="0.01"
                  value={backgroundPatternOpacity}
                  onChange={(e) => setBackgroundPatternOpacity(parseFloat(e.target.value))}
                  className="w-full accent-[#DC5D5D] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#3C3C3B]/60">
                  <span>Sutil (5%)</span>
                  <span>Equilibrado (22%)</span>
                  <span>Marcado (45%)</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#B0AF9F]/20">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-[#B0AF9F]/40 text-xs font-medium text-[#3C3C3B]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#DC5D5D] text-white text-xs font-brand font-bold hover:bg-[#c94e4e] transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Guardar Fondo
                </button>
              </div>
            </form>
          )}
          {/* Tab 1: Promo of the day */}
          {activeTab === 'promo' && (
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <p className="text-xs text-[#3C3C3B]/70 leading-relaxed">
                Personalizá la promo destacada en la parte superior del menú digital (como la promo oficial de los martes del manual de marca).
              </p>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1">
                  Texto de la Promoción
                </label>
                <input
                  type="text"
                  value={promoText}
                  onChange={(e) => setPromoText(e.target.value)}
                  placeholder="ej: MARTES: COMBO VERANO - Vinchu mix + bebida"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-sm focus:outline-none focus:border-[#DC5D5D]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1">
                  Insignia de Descuento
                </label>
                <input
                  type="text"
                  value={activePromoDiscount}
                  onChange={(e) => setActivePromoDiscount(e.target.value)}
                  placeholder="ej: 20% OFF"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-sm font-bold text-[#DC5D5D] focus:outline-none focus:border-[#DC5D5D]"
                />
              </div>

              {/* Preview */}
              <div className="p-4 rounded-2xl bg-[#DC5D5D]/10 border border-[#DC5D5D]/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#DC5D5D]">
                    Vista previa en el menú digital
                  </span>
                  <p className="text-xs font-bold text-[#3C3C3B] mt-0.5">
                    {promoText || 'Sin promoción activa'}
                  </p>
                </div>
                {activePromoDiscount && (
                  <span className="px-3 py-1 bg-[#DC5D5D] text-white font-brand font-black text-xs rounded-xl shadow-xs">
                    {activePromoDiscount}
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-[#B0AF9F]/40 text-xs font-medium text-[#3C3C3B]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#DC5D5D] text-white text-xs font-brand font-bold hover:bg-[#c94e4e] transition-colors"
                >
                  Guardar Promoción
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Bulk price updates */}
          {activeTab === 'prices' && (
            <div className="space-y-4">
              <p className="text-xs text-[#3C3C3B]/70 leading-relaxed">
                Permite actualizar precios de forma porcentual (por ejemplo +10% por inflación o ajuste estacional) en una categoría específica o en toda la carta, redondeando automáticamente al múltiplo de $10 más cercano.
              </p>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1">
                  Categoría a Aplicar
                </label>
                <select
                  value={priceCategory}
                  onChange={(e) => setPriceCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-sm focus:outline-none focus:border-[#DC5D5D]"
                >
                  <option value="all">Toda la carta (102 platos)</option>
                  {MENU_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      Solo: {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1">
                  Porcentaje de Modificación (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="1"
                    value={pricePercent}
                    onChange={(e) => setPricePercent(parseFloat(e.target.value) || 0)}
                    className="w-28 px-3.5 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-sm font-mono font-bold text-[#DC5D5D]"
                  />
                  <div className="flex gap-1.5">
                    {[5, 10, 15, -5].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPricePercent(p)}
                        className={`px-2.5 py-1 text-xs font-mono rounded-lg border ${
                          pricePercent === p
                            ? 'bg-[#DC5D5D] text-white border-[#DC5D5D]'
                            : 'bg-white text-[#3C3C3B] border-[#B0AF9F]/40 hover:bg-gray-50'
                        }`}
                      >
                        {p > 0 ? `+${p}%` : `${p}%`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                ⚠️ <strong>Atención:</strong> Esta acción modificará los precios de{' '}
                {priceCategory === 'all' ? 'todos los platos' : `la categoría "${priceCategory}"`} en un{' '}
                <strong>{pricePercent > 0 ? `+${pricePercent}%` : `${pricePercent}%`}</strong> en tiempo real.
              </div>

              {priceAdjustmentDone && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                  ✅ ¡Precios actualizados y sincronizados exitosamente con el servidor!
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-[#B0AF9F]/40 text-xs font-medium text-[#3C3C3B]"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleApplyPricePercent}
                  className="px-5 py-2 rounded-xl bg-[#3C3C3B] text-white text-xs font-brand font-bold hover:bg-black transition-colors"
                >
                  Aplicar Modificación Masiva
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Restaurant Info */}
          {activeTab === 'info' && (
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1 flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-[#DC5D5D]" /> Red Wi-Fi
                  </label>
                  <input
                    type="text"
                    value={wifiNetwork}
                    onChange={(e) => setWifiNetwork(e.target.value)}
                    placeholder="Suteki-Guest"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1">
                    Clave Wi-Fi
                  </label>
                  <input
                    type="text"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="sushilover2026"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#DC5D5D]" /> Horarios de Atención
                </label>
                <input
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="Martes a Domingo de 19:00 a 23:30 hs"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="11-4444-3333"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Av. Libertador 2953"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#B0AF9F]/40 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-[#B0AF9F]/40 text-xs font-medium text-[#3C3C3B]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#DC5D5D] text-white text-xs font-brand font-bold hover:bg-[#c94e4e] transition-colors"
                >
                  Guardar Datos
                </button>
              </div>
            </form>
          )}

          {/* Tab 4: PIN & Seguridad */}
          {activeTab === 'security' && (
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-950 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Menú público protegido:</strong> Los comensales no pueden ver los paneles de gestión ni editar precios o disponibilidad.
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#3C3C3B]/80 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#DC5D5D]" /> PIN de Seguridad Administrador
                </label>
                <input
                  type="text"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#B0AF9F]/40 text-sm font-mono tracking-widest font-bold text-[#DC5D5D] focus:outline-none focus:border-[#DC5D5D]"
                />
                <p className="text-[11px] font-mono text-[#3C3C3B]/60 mt-1">
                  Este PIN se solicitará al presionar el botón "Staff / Acceso Personal" para ingresar al panel de gestión.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-[#B0AF9F]/40 text-xs font-medium text-[#3C3C3B]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#DC5D5D] text-white text-xs font-brand font-bold hover:bg-[#c94e4e] transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Guardar PIN
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
