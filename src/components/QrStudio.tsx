import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { RestaurantConfig } from '../types';
import { KoiIllustration } from './KoiIllustration';
import { SutekiLogo, SutekiHankoSeal, BRAND_COLORS } from './SutekiBrandAssets';
import { Download, Printer, Copy, Check, ExternalLink, Sparkles, Wifi, MapPin, KeyRound } from 'lucide-react';
import { SecurityPinModal } from './SecurityPinModal';

interface QrStudioProps {
  config: RestaurantConfig;
  onOpenCustomerView: () => void;
  onOpenPinModal?: () => void;
  onUpdateConfig?: (newConfig: Partial<RestaurantConfig>) => void;
}

export const QrStudio: React.FC<QrStudioProps> = ({
  config,
  onOpenCustomerView,
  onOpenPinModal,
  onUpdateConfig,
}) => {
  const [selectedTable, setSelectedTable] = useState<string>('General');
  const [customTableInput, setCustomTableInput] = useState<string>('');
  const [qrColor, setQrColor] = useState<string>('#3C3C3B');
  const [qrBgColor, setQrBgColor] = useState<string>('#FFFFFF');
  const [includeCenterLogo, setIncludeCenterLogo] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Compute destination URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://suteki.com.ar';
  
  const targetUrl = React.useMemo(() => {
    const url = new URL(baseUrl);
    url.searchParams.set('view', 'menu');
    if (selectedTable !== 'General') {
      url.searchParams.set('mesa', selectedTable);
    }
    return url.toString();
  }, [baseUrl, selectedTable]);

  // Generate QR Code with high resolution
  useEffect(() => {
    async function generate() {
      try {
        const url = await QRCode.toDataURL(targetUrl, {
          width: 800,
          margin: 2,
          color: {
            dark: qrColor,
            light: qrBgColor,
          },
          errorCorrectionLevel: 'H', // High error correction to allow center icon
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Failed to generate QR code', err);
      }
    }
    generate();
  }, [targetUrl, qrColor, qrBgColor]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadQrPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-Suteki-${selectedTable.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const tablePresets = ['General', 'Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4', 'Mesa 5', 'Barra', 'Terraza', 'Delivery'];

  return (
    <div className="w-full min-h-[calc(100vh-64px)] overflow-y-auto overscroll-contain">
      <div className="max-w-6xl mx-auto px-3 sm:px-5 md:px-6 pt-3 sm:pt-6 pb-28 sm:pb-24">
        {/* Header Banner */}
        <div className="bg-[#DC5D5D] text-[#F6EFE4] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-5 sm:mb-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none">
          <KoiIllustration className="w-48 sm:w-64 h-48 sm:h-64" color="#FFFFFF" secondaryColor="#943535" />
        </div>
        
        <div className="z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/15 text-[11px] sm:text-xs tracking-wider uppercase mb-2 sm:mb-3 font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Generador de QR Oficial Suteki
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-brand font-black tracking-tight mb-2">
            Código QR para Mesas & Clientes
          </h2>
          <p className="text-white/90 text-xs sm:text-sm md:text-base leading-relaxed">
            Imprimí este código QR para colocarlo en los acrílicos de las mesas, servilleteros o barra. Los comensales escanean con la cámara de su celular y ven la carta actualizada en tiempo real.
          </p>
        </div>

        <div className="z-10 flex flex-wrap gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={onOpenCustomerView}
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F6EFE4] text-[#DC5D5D] font-brand font-bold text-xs sm:text-sm hover:bg-white transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Menú de Clientes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          {/* Table / Location Selection */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#B0AF9F]/30 shadow-xs">
            <h3 className="font-brand font-bold text-lg text-[#3C3C3B] mb-3 flex items-center gap-2">
              1. Seleccionar Mesa o Sector
            </h3>
            <p className="text-xs text-[#3C3C3B]/70 mb-4">
              Podés generar un QR único para todo el local o individualizar por mesa para identificar pedidos:
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {tablePresets.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTable(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedTable === tab
                      ? 'bg-[#DC5D5D] text-white shadow-xs'
                      : 'bg-[#F6EFE4] text-[#3C3C3B] hover:bg-[#B0AF9F]/20'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customTableInput}
                onChange={(e) => setCustomTableInput(e.target.value)}
                placeholder="Otra mesa (ej: Mesa 14, VIP...)"
                className="flex-1 px-3.5 py-2 text-xs bg-[#F6EFE4]/60 border border-[#B0AF9F]/40 rounded-xl focus:outline-none focus:border-[#DC5D5D]"
              />
              <button
                onClick={() => {
                  if (customTableInput.trim()) {
                    setSelectedTable(customTableInput.trim());
                    setCustomTableInput('');
                  }
                }}
                disabled={!customTableInput.trim()}
                className="px-4 py-2 bg-[#3C3C3B] text-[#F6EFE4] text-xs font-brand font-semibold rounded-xl hover:bg-black transition-colors disabled:opacity-50"
              >
                Asignar
              </button>
            </div>
          </div>

          {/* Style Customization */}
          <div className="bg-white rounded-3xl p-6 border border-[#B0AF9F]/30 shadow-xs space-y-5">
            <h3 className="font-brand font-bold text-lg text-[#3C3C3B] flex items-center gap-2">
              2. Personalización Visual
            </h3>

            <div>
              <label className="text-xs text-[#3C3C3B]/70 block mb-2 font-medium">Color del Código QR:</label>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { name: 'Carbón', hex: '#3C3C3B' },
                  { name: 'Coral Suteki', hex: '#DC5D5D' },
                  { name: 'Granate', hex: '#943535' },
                  { name: 'Menta Nikkei', hex: '#153A35' },
                ].map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setQrColor(c.hex)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      qrColor === c.hex
                        ? 'border-[#DC5D5D] ring-2 ring-[#DC5D5D]/20'
                        : 'border-[#B0AF9F]/30 hover:border-gray-400'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#B0AF9F]/20">
              <span className="text-xs font-medium text-[#3C3C3B]">Insignia central Suteki</span>
              <button
                type="button"
                onClick={() => setIncludeCenterLogo(!includeCenterLogo)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  includeCenterLogo ? 'bg-[#DC5D5D]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    includeCenterLogo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Destination Link Info */}
          <div className="bg-white rounded-3xl p-6 border border-[#B0AF9F]/30 shadow-xs">
            <h3 className="font-brand font-bold text-sm text-[#3C3C3B] mb-2">Enlace de Destino</h3>
            <div className="p-3 bg-[#F6EFE4] rounded-2xl border border-[#B0AF9F]/30 flex items-center justify-between gap-3 text-xs font-mono text-[#3C3C3B] break-all">
              <span className="truncate">{targetUrl}</span>
              <button
                onClick={handleCopyUrl}
                className="p-2 rounded-xl bg-white text-[#DC5D5D] hover:bg-gray-50 transition-colors shrink-0"
                title="Copiar enlace"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-emerald-600 mt-1 font-medium">¡Enlace copiado al portapapeles!</p>
            )}
          </div>
        </div>

        {/* Preview & Print Column */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#3C3C3B]/70 font-semibold">
              Vista previa: Atril de Mesa Suteki (10 x 15 cm)
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadQrPng}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#B0AF9F]/40 text-xs font-medium hover:bg-[#F6EFE4] transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#DC5D5D]" /> Descargar PNG
              </button>
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-xl bg-[#3C3C3B] text-white text-xs font-medium hover:bg-black transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Atril
              </button>
            </div>
          </div>

          {/* Printable Card */}
          <div
            ref={printAreaRef}
            id="printable-card"
            className="w-full max-w-sm bg-[#F6EFE4] border-2 border-[#DC5D5D]/20 rounded-3xl p-8 text-center shadow-lg relative overflow-hidden print:m-0 print:shadow-none print:border-none print:w-full print:max-w-none"
            style={{ backgroundColor: '#F6EFE4' }}
          >
            {/* Japanese Koi Watermark */}
            <div className="absolute -top-6 -right-6 opacity-10 pointer-events-none">
              <KoiIllustration className="w-40 h-40" color="#DC5D5D" secondaryColor="#943535" />
            </div>

            {/* Top Brand Header */}
            <div className="mb-4 flex flex-col items-center">
              <SutekiLogo
                variant="horizontal"
                colorMode="coral"
                showTagline={true}
              />
            </div>

            {/* Table Badge */}
            <div className="inline-block bg-[#DC5D5D] text-white px-4 py-1.5 rounded-full text-xs font-cubano tracking-wide mb-6 shadow-xs">
              {selectedTable === 'General' ? 'CARTA DIGITAL OFICIAL' : selectedTable.toUpperCase()}
            </div>

            {/* QR Container with Frame */}
            <div className="relative mx-auto w-56 h-56 bg-white p-3 rounded-2xl border-2 border-[#DC5D5D]/30 shadow-md flex items-center justify-center">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR Code ${selectedTable}`}
                  className="w-full h-full object-contain rounded-lg"
                />
              )}
              {includeCenterLogo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="p-1 rounded-xl bg-white shadow-sm border border-[#DC5D5D]/30 flex items-center justify-center">
                    <SutekiHankoSeal size="sm" color="#DC5D5D" />
                  </div>
                </div>
              )}
            </div>

            {/* Instruction Callout */}
            <div className="mt-5 mb-5">
              <p className="font-cubano text-lg text-[#3C3C3B]">
                Escaneá con tu celular
              </p>
              <p className="text-xs font-mono text-[#3C3C3B]/70 mt-0.5">
                Carta visual completa, fotos, maridajes y precios en vivo
              </p>
            </div>

            {/* Wi-Fi & Slogan Footer */}
            <div className="pt-4 border-t border-[#B0AF9F]/30 space-y-2">
              <p className="font-cubano text-xs text-[#DC5D5D] tracking-wider uppercase">
                {config.slogan}
              </p>
              
              {config.wifiNetwork && (
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#3C3C3B]/80 bg-white/70 px-3 py-1 rounded-lg border border-[#B0AF9F]/20">
                  <Wifi className="w-3 h-3 text-[#DC5D5D]" />
                  <span>Wi-Fi: <strong className="text-[#3C3C3B]">{config.wifiNetwork}</strong></span>
                  {config.wifiPassword && (
                    <span className="text-[#3C3C3B]/60">| Clave: <strong className="text-[#3C3C3B]">{config.wifiPassword}</strong></span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-center gap-1 text-[10px] text-[#3C3C3B]/60 font-mono">
                <MapPin className="w-2.5 h-2.5" />
                <span>{config.address}</span>
              </div>
            </div>
          </div>
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

      {/* Security PIN Change Modal */}
      <SecurityPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        currentPin={config.adminPin || '2026'}
        onSavePin={(newPin) => {
          if (onUpdateConfig) {
            onUpdateConfig({ adminPin: newPin });
          }
        }}
        isDark={false}
      />
    </div>
  );
};
