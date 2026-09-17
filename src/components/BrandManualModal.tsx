import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Sparkles, Image, Palette, Type, Layers, Eye, Download } from 'lucide-react';
import {
  BRAND_COLORS,
  SutekiLogo,
  SutekiHankoSeal,
  SutekiKoiPattern,
  ChopstickWrapperGraphic,
  SUTEKI_BACKGROUND_TEXTURES,
  SutekiBrandIllustration,
} from './SutekiBrandAssets';
import { KoiIllustration } from './KoiIllustration';

interface BrandManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const BrandManualModal: React.FC<BrandManualModalProps> = ({
  isOpen,
  onClose,
  isDark,
}) => {
  const [activeTab, setActiveTab] = useState<'01-marca' | '02-paleta' | '03-tipografia' | '04-aplicaciones' | '05-fondos'>('01-marca');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className={`w-full max-w-4xl rounded-3xl overflow-hidden border shadow-2xl my-6 transition-colors flex flex-col max-h-[92vh] ${
          isDark
            ? 'bg-[#1C1C1B] border-[#444442] text-[#F6EFE4]'
            : 'bg-[#F6EFE4] border-[#B0AF9F]/40 text-[#3C3C3B]'
        }`}
      >
        {/* Header with authentic manual aesthetic */}
        <div className="relative px-6 py-5 bg-[#DC5D5D] text-[#F6EFE4] flex items-center justify-between border-b border-[#943535] overflow-hidden">
          {/* Subtle Koi background */}
          <div className="absolute right-0 top-0 opacity-15 pointer-events-none">
            <KoiIllustration className="w-48 h-48" color="#FFFFFF" secondaryColor="#FFFFFF" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-sm">
                Manual de Marca • Suteki
              </span>
              <span className="text-[10px] font-mono opacity-85">10年 de Identidad</span>
            </div>
            <h2 className="text-2xl font-cubano tracking-tight">Manual & Recursos de Identidad</h2>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            title="Cerrar manual de marca"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs styled like the manual */}
        <div className={`flex border-b overflow-x-auto no-scrollbar ${isDark ? 'border-[#333331] bg-[#161615]' : 'border-[#B0AF9F]/30 bg-white/60'}`}>
          <button
            onClick={() => setActiveTab('01-marca')}
            className={`px-5 py-3 text-xs font-mono font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === '01-marca'
                ? 'border-[#DC5D5D] text-[#DC5D5D] bg-[#DC5D5D]/5'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>01. MARCA & LOGO</span>
          </button>

          <button
            onClick={() => setActiveTab('02-paleta')}
            className={`px-5 py-3 text-xs font-mono font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === '02-paleta'
                ? 'border-[#DC5D5D] text-[#DC5D5D] bg-[#DC5D5D]/5'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>02. PALETA CROMÁTICA</span>
          </button>

          <button
            onClick={() => setActiveTab('03-tipografia')}
            className={`px-5 py-3 text-xs font-mono font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === '03-tipografia'
                ? 'border-[#DC5D5D] text-[#DC5D5D] bg-[#DC5D5D]/5'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>03. TIPOGRAFÍAS</span>
          </button>

          <button
            onClick={() => setActiveTab('04-aplicaciones')}
            className={`px-5 py-3 text-xs font-mono font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === '04-aplicaciones'
                ? 'border-[#DC5D5D] text-[#DC5D5D] bg-[#DC5D5D]/5'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>04. PIEZAS & PACKAGING</span>
          </button>

          <button
            onClick={() => setActiveTab('05-fondos')}
            className={`px-5 py-3 text-xs font-mono font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === '05-fondos'
                ? 'border-[#DC5D5D] text-[#DC5D5D] bg-[#DC5D5D]/5'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#DC5D5D]" />
            <span>05. TRAMAS & FONDOS (DRIVE)</span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: 01. MARCA */}
          {activeTab === '01-marca' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Horizontal Lockup Card */}
                <div
                  className={`p-6 rounded-3xl border relative overflow-hidden flex flex-col items-center justify-center text-center ${
                    isDark ? 'bg-[#242423] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'
                  }`}
                >
                  <span className="absolute top-3 left-4 text-[10px] font-mono text-[#DC5D5D] font-bold uppercase tracking-wider">
                    Logotipo + Tagline • Horizontal
                  </span>
                  <div className="my-6">
                    <SutekiLogo variant="horizontal" colorMode="coral" showTagline={true} />
                  </div>
                  <p className="text-[11px] font-mono opacity-70 max-w-xs">
                    Composición primaria para cabeceras, cartas digitales y marquesinas.
                  </p>
                </div>

                {/* Lockup on Dark Card */}
                <div
                  className={`p-6 rounded-3xl border relative overflow-hidden flex flex-col items-center justify-center text-center ${
                    isDark ? 'bg-[#181817] border-[#383836]' : 'bg-[#2E2E2D] border-[#444442] text-[#F6EFE4]'
                  }`}
                >
                  <span className="absolute top-3 left-4 text-[10px] font-mono text-amber-200 font-bold uppercase tracking-wider">
                    Logotipo Claro • Fondo Oscuro
                  </span>
                  <div className="my-6">
                    <SutekiLogo variant="horizontal" colorMode="white" showTagline={true} />
                  </div>
                  <p className="text-[11px] font-mono opacity-70 max-w-xs text-[#F6EFE4]/80">
                    Versión oficial clara para cabeceras contrastadas, redes y ambientación nocturna.
                  </p>
                </div>
              </div>

              {/* Protection Area & Hanko Seal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Hanko Seal */}
                <div
                  className={`p-5 rounded-2xl border flex flex-col items-center justify-center text-center ${
                    isDark ? 'bg-[#242423] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'
                  }`}
                >
                  <SutekiHankoSeal size="lg" className="mb-3" />
                  <span className="text-xs font-cubano text-[#DC5D5D]">Sello Hanko (SU / KS)</span>
                  <p className="text-[10px] font-mono opacity-70 mt-1">
                    Firma tradicional japonesa aplicada en esquinas y estampas de fidelidad.
                  </p>
                </div>

                {/* Kanji Mark */}
                <div
                  className={`p-5 rounded-2xl border flex flex-col items-center justify-center text-center ${
                    isDark ? 'bg-[#242423] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'
                  }`}
                >
                  <span className="text-3xl font-mono font-black text-[#DC5D5D] mb-1">林</span>
                  <span className="text-xs font-cubano">Ideograma Hayashi (Bosque / Armonía)</span>
                  <p className="text-[10px] font-mono opacity-70 mt-1">
                    Símbolo de frescura y respeto por la naturaleza marina.
                  </p>
                </div>

                {/* 10 Years Badge */}
                <div
                  className={`p-5 rounded-2xl border flex flex-col items-center justify-center text-center ${
                    isDark ? 'bg-[#242423] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'
                  }`}
                >
                  <span className="text-2xl font-mono font-bold text-[#DC5D5D] px-2 py-0.5 rounded-sm border border-[#DC5D5D]/30 mb-2">
                    10年
                  </span>
                  <span className="text-xs font-cubano">Década de Trayectoria</span>
                  <p className="text-[10px] font-mono opacity-70 mt-1">
                    10 años de cocina nikkei y pasión artesanal.
                  </p>
                </div>
              </div>

              {/* Area de proteccion note */}
              <div
                className={`p-4 rounded-2xl border text-xs font-mono space-y-1.5 ${
                  isDark ? 'bg-[#262625] border-[#3C3C3B]' : 'bg-white border-[#B0AF9F]/40'
                }`}
              >
                <div className="flex items-center gap-2 text-[#DC5D5D] font-bold">
                  <span>.Área de protección</span>
                </div>
                <p className="opacity-80 leading-relaxed text-[11px]">
                  El área de protección establecida resguarda el logotipo de cualquier elemento cercano a él.
                  Se calcula a partir del ancho y alto del punto de la letra <strong>"i"</strong> de Suteki.
                  Respetar este esquema garantiza máxima visibilidad y distinción de la marca.
                </p>
              </div>

              {/* Official Google Drive Logos Showcase */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-cubano text-[#DC5D5D]">
                      Archivos Oficiales de Logotipo (Google Drive)
                    </h3>
                    <p className="text-[10px] font-mono opacity-70">
                      Versiones maestras en alta resolución (4500px, transparentes y vectoriales)
                    </p>
                  </div>
                  <a
                    href="/assets/branding/manual-marca-suteki.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-[#DC5D5D] hover:underline flex items-center gap-1 font-bold"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar Manual PDF (15MB)
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* 1. Logo Rojo + Tagline */}
                  <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${isDark ? 'bg-[#242423] border-[#383836]' : 'bg-[#F6EFE4] border-[#B0AF9F]/30'}`}>
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                        <span className="font-bold text-[#DC5D5D]">1. Rojo + Tagline</span>
                        <span className="opacity-60">Fondo Claro</span>
                      </div>
                      <div className="h-20 bg-white rounded-xl flex items-center justify-center p-3 border border-black/5">
                        <img
                          src="/assets/branding/logos/logo-tagline-rojo-trimmed.png"
                          alt="Logo Tagline Rojo"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-mono">
                      <a
                        href="/assets/branding/logos/logo-tagline-rojo.png"
                        download="suteki-logo-tagline-rojo.png"
                        className="text-[#DC5D5D] hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Descargar PNG
                      </a>
                      <span className="opacity-50">4500x4500</span>
                    </div>
                  </div>

                  {/* 2. Logo Rojo sin Tagline */}
                  <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${isDark ? 'bg-[#242423] border-[#383836]' : 'bg-[#F6EFE4] border-[#B0AF9F]/30'}`}>
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                        <span className="font-bold text-[#DC5D5D]">2. Rojo Wordmark</span>
                        <span className="opacity-60">Solo Isologo</span>
                      </div>
                      <div className="h-20 bg-white rounded-xl flex items-center justify-center p-3 border border-black/5">
                        <img
                          src="/assets/branding/logos/logo-rojo-trimmed.png"
                          alt="Logo Rojo"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-mono">
                      <a
                        href="/assets/branding/logos/logo-rojo.png"
                        download="suteki-logo-rojo.png"
                        className="text-[#DC5D5D] hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Descargar PNG
                      </a>
                      <span className="opacity-50">4500x4500</span>
                    </div>
                  </div>

                  {/* 3. Logo Claro + Tagline */}
                  <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${isDark ? 'bg-[#242423] border-[#383836]' : 'bg-[#2E2E2D] text-[#F6EFE4] border-[#444442]'}`}>
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                        <span className="font-bold text-amber-200">3. Claro + Tagline</span>
                        <span className="opacity-60">Fondo Oscuro</span>
                      </div>
                      <div className="h-20 bg-[#1A1A19] rounded-xl flex items-center justify-center p-3 border border-white/10">
                        <img
                          src="/assets/branding/logos/logo-tagline-claro-trimmed.png"
                          alt="Logo Tagline Claro"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                      <a
                        href="/assets/branding/logos/logo-tagline-claro.png"
                        download="suteki-logo-tagline-claro.png"
                        className="text-amber-200 hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Descargar PNG
                      </a>
                      <span className="opacity-50">4501x4500</span>
                    </div>
                  </div>

                  {/* 4. Logo Claro sin Tagline */}
                  <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${isDark ? 'bg-[#242423] border-[#383836]' : 'bg-[#2E2E2D] text-[#F6EFE4] border-[#444442]'}`}>
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                        <span className="font-bold text-amber-200">4. Claro Wordmark</span>
                        <span className="opacity-60">Solo Isologo</span>
                      </div>
                      <div className="h-20 bg-[#1A1A19] rounded-xl flex items-center justify-center p-3 border border-white/10">
                        <img
                          src="/assets/branding/logos/logo-claro-trimmed.png"
                          alt="Logo Claro"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                      <a
                        href="/assets/branding/logos/logo-claro.png"
                        download="suteki-logo-claro.png"
                        className="text-amber-200 hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Descargar PNG
                      </a>
                      <span className="opacity-50">4501x4500</span>
                    </div>
                  </div>

                  {/* 5. Logo Negro + Tagline */}
                  <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${isDark ? 'bg-[#242423] border-[#383836]' : 'bg-[#F6EFE4] border-[#B0AF9F]/30'}`}>
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                        <span className="font-bold text-[#3C3C3B]">5. Negro + Tagline</span>
                        <span className="opacity-60">Monocromo</span>
                      </div>
                      <div className="h-20 bg-white rounded-xl flex items-center justify-center p-3 border border-black/5">
                        <img
                          src="/assets/branding/logos/logo-tagline-negro-trimmed.png"
                          alt="Logo Tagline Negro"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-mono">
                      <a
                        href="/assets/branding/logos/logo-tagline-negro.png"
                        download="suteki-logo-tagline-negro.png"
                        className="text-[#3C3C3B] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Download className="w-3 h-3" /> Descargar PNG
                      </a>
                      <span className="opacity-50">4501x4500</span>
                    </div>
                  </div>

                  {/* 6. Logo Negro sin Tagline */}
                  <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${isDark ? 'bg-[#242423] border-[#383836]' : 'bg-[#F6EFE4] border-[#B0AF9F]/30'}`}>
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                        <span className="font-bold text-[#3C3C3B]">6. Negro Wordmark</span>
                        <span className="opacity-60">Solo Isologo</span>
                      </div>
                      <div className="h-20 bg-white rounded-xl flex items-center justify-center p-3 border border-black/5">
                        <img
                          src="/assets/branding/logos/logo-negro-trimmed.png"
                          alt="Logo Negro"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-mono">
                      <a
                        href="/assets/branding/logos/logo-negro.png"
                        download="suteki-logo-negro.png"
                        className="text-[#3C3C3B] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Download className="w-3 h-3" /> Descargar PNG
                      </a>
                      <span className="opacity-50">4501x4500</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 02. PALETA CROMÁTICA */}
          {activeTab === '02-paleta' && (
            <div className="space-y-6">
              <div className="text-xs font-mono opacity-70 mb-2">
                Tocá cualquier color para copiar el código HEX directamente a tu portapapeles:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {BRAND_COLORS.map((c) => (
                  <div
                    key={c.hex}
                    onClick={() => handleCopyHex(c.hex)}
                    className={`rounded-2xl border overflow-hidden cursor-pointer group transition-all hover:scale-[1.02] shadow-xs ${
                      isDark ? 'border-[#383836] bg-[#242423]' : 'border-[#B0AF9F]/30 bg-white'
                    }`}
                  >
                    <div
                      className="h-28 relative p-3 flex flex-col justify-between"
                      style={{ backgroundColor: c.hex }}
                    >
                      <span
                        className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm self-start font-bold"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.25)',
                          color: '#FFFFFF',
                        }}
                      >
                        {c.role}
                      </span>
                      <div className="flex items-center justify-between">
                        <span
                          className="font-mono font-bold text-sm tracking-wider"
                          style={{ color: c.textColor }}
                        >
                          {c.hex}
                        </span>
                        <div className="p-1.5 rounded-md bg-black/20 text-white">
                          {copiedHex === c.hex ? (
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-cubano text-[#DC5D5D]">{c.name}</h4>
                        {copiedHex === c.hex && (
                          <span className="text-[10px] font-mono text-emerald-600 font-bold">
                            ¡Copiado!
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono opacity-75 leading-tight">
                        {c.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 03. TIPOGRAFÍAS */}
          {activeTab === '03-tipografia' && (
            <div className="space-y-6">
              {/* Primary: Cubano */}
              <div
                className={`p-6 rounded-3xl border space-y-4 ${
                  isDark ? 'bg-[#242423] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-3 border-[#B0AF9F]/20">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#DC5D5D] font-bold">
                      04. TIPOGRAFÍAS • .Principal
                    </span>
                    <h3 className="text-2xl font-cubano text-[#DC5D5D]">CUBANO</h3>
                  </div>
                  <span className="text-xs font-mono opacity-70">Títulos, Logos & Días</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#DC5D5D]/10 border border-[#DC5D5D]/20">
                  <div className="text-4xl sm:text-5xl font-cubano text-[#DC5D5D] tracking-tight">
                    AA BB CC DD EE FF GG HH
                  </div>
                  <div className="text-2xl sm:text-3xl font-cubano text-[#3C3C3B] mt-2 tracking-tight">
                    01 02 03 04 05 06 07 08 09 10
                  </div>
                  <div className="text-lg font-mono opacity-80 mt-2">
                    ¿ ? ! # & / ( ) = + -
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <span className="px-3 py-1 rounded-full bg-[#DC5D5D] text-white font-bold font-cubano">
                    JUEVES
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#3C3C3B] text-white font-bold font-cubano">
                    MARTES
                  </span>
                  <span className="px-3 py-1 rounded-full border border-[#DC5D5D] text-[#DC5D5D] font-bold font-cubano">
                    COMBO VERANO
                  </span>
                </div>
              </div>

              {/* Secondary: Monospace */}
              <div
                className={`p-6 rounded-3xl border space-y-4 ${
                  isDark ? 'bg-[#242423] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-3 border-[#B0AF9F]/20">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#DC5D5D] font-bold">
                      04. TIPOGRAFÍAS • .Complementaria
                    </span>
                    <h3 className="text-xl font-mono font-bold">Roboto Mono / Typewriter</h3>
                  </div>
                  <span className="text-xs font-mono opacity-70">Lectura & Ficha Técnica</span>
                </div>

                <div className="p-4 rounded-2xl border font-mono text-xs space-y-1.5 opacity-90 leading-relaxed">
                  <p>.Normas de utilización</p>
                  <p>.Usos correctos e incorrectos</p>
                  <p>.Precios, ingredientes, maridajes y gramajes</p>
                  <p>1234567890 • 19:00 a 23:30 hs • Mesa 04</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 04. APLICACIONES */}
          {activeTab === '04-aplicaciones' && (
            <div className="space-y-6">
              {/* Promotional Cards Preview */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#DC5D5D] font-bold mb-3">
                  Piezas Gráficas • Promos de la Carta
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Martes Combo Verano Promo */}
                  <div className="rounded-2xl border overflow-hidden p-5 bg-[#DC5D5D] text-white relative shadow-sm">
                    <div className="absolute right-2 bottom-2 opacity-15">
                      <KoiIllustration className="w-32 h-32" color="#FFFFFF" secondaryColor="#FFFFFF" />
                    </div>
                    <div className="relative z-10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-sm font-bold">
                          Suteki Promo
                        </span>
                        <span className="text-2xl font-cubano bg-[#F6EFE4] text-[#DC5D5D] px-2.5 py-0.5 rounded-lg shadow-xs">
                          20% OFF
                        </span>
                      </div>
                      <h3 className="text-3xl font-cubano tracking-tight">MARTES</h3>
                      <p className="text-xs font-mono leading-relaxed opacity-95">
                        COMBO VERANO • Vinchu mix 15 piezas + bebida artesanal
                      </p>
                    </div>
                  </div>

                  {/* Jueves Gringo 16 Promo */}
                  <div
                    className={`rounded-2xl border p-5 relative shadow-sm ${
                      isDark ? 'bg-[#242423] border-[#DC5D5D]/50' : 'bg-white border-[#DC5D5D]'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono tracking-widest uppercase text-[#DC5D5D] font-bold">
                          Especial del Chef
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#93C2BC]/20 text-[#153A35] font-bold">
                          Roll Insignia
                        </span>
                      </div>
                      <h3 className="text-3xl font-cubano text-[#DC5D5D] tracking-tight">JUEVES</h3>
                      <p className="text-xs font-mono leading-relaxed opacity-85">
                        Gringo 16 piezas • Salmón macerado con palta y tartar flambeado
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chopstick Wrapper & Business Card Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Chopstick Wrapper */}
                <div
                  className={`p-5 rounded-2xl border space-y-3 ${
                    isDark ? 'bg-[#242423] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase text-[#DC5D5D] font-bold block">
                    Faja de Palillos Japoneses
                  </span>
                  <div className="py-2">
                    <ChopstickWrapperGraphic className="w-full justify-center" />
                  </div>
                  <p className="text-[11px] font-mono opacity-70">
                    Diseño impreso sobre papel kraft washi con el ideograma 林 y la leyenda Nikkei.
                  </p>
                </div>

                {/* Business Card Layout */}
                <div
                  className={`p-5 rounded-2xl border space-y-3 ${
                    isDark ? 'bg-[#242423] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase text-[#DC5D5D] font-bold block">
                    Tarjeta Institucional
                  </span>
                  <div className="p-3 rounded-xl bg-[#DC5D5D] text-white text-xs font-mono space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-cubano text-sm">Suteki</span>
                      <span className="text-[10px]">Julián Pereiro • Founder</span>
                    </div>
                    <div className="text-[10px] opacity-80 pt-1">
                      www.suteki.com.ar • @suteki.sushi • 11-4444-3333
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 05. TRAMAS & FONDOS OFICIALES (GOOGLE DRIVE) */}
          {activeTab === '05-fondos' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl border bg-[#DC5D5D]/5 border-[#DC5D5D]/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#DC5D5D] font-bold">
                    Recursos Oficiales de Marca (Google Drive)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#DC5D5D]/10 text-[#DC5D5D]">
                    Carpeta Drive Oficial
                  </span>
                </div>
                <h3 className="text-xl font-brand font-black text-[#DC5D5D]">
                  Tramas Nikkei, Ilustraciones & Fondos de Marca
                </h3>
                <p className="text-xs font-mono opacity-80 mt-1 leading-relaxed">
                  Recursos extraídos directamente de la carpeta de identidad de Suteki (archivos PDF vectoriales procesados a texturas web y PNGs con canal alfa). Se aplican como base en el menú público sobre el fondo crema/washi (#F6EFE4).
                </p>
              </div>

              {/* Grid of textures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Trama Aletas */}
                <div className={`p-5 rounded-3xl border flex flex-col justify-between ${isDark ? 'bg-[#242423] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'}`}>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="text-xs font-cubano text-[#DC5D5D]">01. Trama Aletas</span>
                        <span className="text-[10px] font-mono block opacity-60">Origen: Trama Aletas.pdf</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                        Washi Oficial
                      </span>
                    </div>

                    <div
                      className="h-36 rounded-2xl border border-black/10 relative overflow-hidden shadow-inner"
                      style={{
                        backgroundColor: '#F6EFE4',
                        backgroundImage: 'url(/assets/branding/trama-aletas.jpg)',
                        backgroundRepeat: 'repeat',
                        backgroundSize: '340px auto',
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-3">
                        <span className="text-[10px] font-mono text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                          Repetición de trama 340px
                        </span>
                      </div>
                    </div>

                    <p className="text-xs font-mono opacity-80 mt-3 leading-relaxed">
                      Patrón de aletas y escamas geométricas en línea suave sobre el tono crema washi. Utilizado como fondo institucional principal en la carta digital y piezas impresas.
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between">
                    <a
                      href="/assets/branding/trama-aletas.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[#DC5D5D] hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver en alta resolución
                    </a>
                    <button
                      onClick={() => {
                        localStorage.setItem('suteki_bg_pattern', 'aletas');
                        window.location.reload();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#DC5D5D] text-white text-xs font-brand font-bold hover:bg-[#c84e4e] transition-colors"
                    >
                      Aplicar al Menú
                    </button>
                  </div>
                </div>

                {/* 2. Trama Koi */}
                <div className={`p-5 rounded-3xl border flex flex-col justify-between ${isDark ? 'bg-[#242423] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'}`}>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="text-xs font-cubano text-[#DC5D5D]">02. Trama Carpas Koi</span>
                        <span className="text-[10px] font-mono block opacity-60">Origen: Trama Koi.pdf</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold">
                        Peces en Washi
                      </span>
                    </div>

                    <div
                      className="h-36 rounded-2xl border border-black/10 relative overflow-hidden shadow-inner"
                      style={{
                        backgroundColor: '#F6EFE4',
                        backgroundImage: 'url(/assets/branding/trama-koi.jpg)',
                        backgroundRepeat: 'repeat',
                        backgroundSize: '400px auto',
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-3">
                        <span className="text-[10px] font-mono text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                          Repetición de carpas 400px
                        </span>
                      </div>
                    </div>

                    <p className="text-xs font-mono opacity-80 mt-3 leading-relaxed">
                      Carpas koi nadando en círculos armónicos, reflejando el movimiento y la frescura de la cocina nikkei. Ideal para ocasiones festivas y barras en vivo.
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between">
                    <a
                      href="/assets/branding/trama-koi.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[#DC5D5D] hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver en alta resolución
                    </a>
                    <button
                      onClick={() => {
                        localStorage.setItem('suteki_bg_pattern', 'koi');
                        window.location.reload();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#DC5D5D] text-white text-xs font-brand font-bold hover:bg-[#c84e4e] transition-colors"
                    >
                      Aplicar al Menú
                    </button>
                  </div>
                </div>

                {/* 3. Trama Aletas Verde */}
                <div className={`p-5 rounded-3xl border flex flex-col justify-between ${isDark ? 'bg-[#242423] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'}`}>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="text-xs font-cubano text-[#DC5D5D]">03. Trama Jade Matcha</span>
                        <span className="text-[10px] font-mono block opacity-60">Origen: Trama aletas verde.pdf</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 font-bold">
                        Pigmento Verde
                      </span>
                    </div>

                    <div
                      className="h-36 rounded-2xl border border-black/10 relative overflow-hidden shadow-inner"
                      style={{
                        backgroundColor: '#F6EFE4',
                        backgroundImage: 'url(/assets/branding/trama-aletas-verde.jpg)',
                        backgroundRepeat: 'repeat',
                        backgroundSize: '340px auto',
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-3">
                        <span className="text-[10px] font-mono text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                          Repetición verde matcha 340px
                        </span>
                      </div>
                    </div>

                    <p className="text-xs font-mono opacity-80 mt-3 leading-relaxed">
                      Variante con tinte matcha y jade nikkei. Simboliza los ingredientes botánicos, el alga nori, el wasabi y la frescura vegetal de las piezas rolls y salads.
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between">
                    <a
                      href="/assets/branding/trama-aletas-verde.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[#DC5D5D] hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver en alta resolución
                    </a>
                    <button
                      onClick={() => {
                        localStorage.setItem('suteki_bg_pattern', 'aletas-verde');
                        window.location.reload();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#DC5D5D] text-white text-xs font-brand font-bold hover:bg-[#c84e4e] transition-colors"
                    >
                      Aplicar al Menú
                    </button>
                  </div>
                </div>

                {/* 4. Recurso 1-8 */}
                <div className={`p-5 rounded-3xl border flex flex-col justify-between ${isDark ? 'bg-[#242423] border-[#383836]' : 'bg-white border-[#B0AF9F]/30'}`}>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="text-xs font-cubano text-[#DC5D5D]">04. Recurso 1-8</span>
                        <span className="text-[10px] font-mono block opacity-60">Origen: Recurso 1-8.png</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-bold">
                        PNG Oficial
                      </span>
                    </div>

                    <div
                      className="h-36 rounded-2xl border border-black/10 relative overflow-hidden flex items-center justify-center p-3"
                      style={{
                        backgroundColor: isDark ? '#1C1C1B' : '#F6EFE4',
                      }}
                    >
                      <img
                        src="/assets/branding/recurso-1-8.png"
                        alt="Recurso Oficial 1-8"
                        className="max-h-full max-w-full object-contain filter contrast-105"
                      />
                    </div>

                    <p className="text-xs font-mono opacity-80 mt-3 leading-relaxed">
                      Ilustración oficial compuesta de la carpa nadando en círculos con transparencias y texturas de marca. Utilizada como sello artístico en el pie del menú y portadas.
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between">
                    <a
                      href="/assets/branding/recurso-1-8.png"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[#DC5D5D] hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Abrir imagen original
                    </a>
                    <span className="text-[11px] font-mono text-[#3C3C3B]/60">
                      Transparente PNG
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between ${
            isDark ? 'border-[#333331] bg-[#161615]' : 'border-[#B0AF9F]/30 bg-white/70'
          }`}
        >
          <div className="flex items-center gap-2">
            <SutekiHankoSeal size="sm" />
            <span className="text-[11px] font-mono opacity-75">
              Identidad visual oficial Suteki • Sushi & Cocina Nikkei
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#DC5D5D] text-white font-cubano text-xs hover:bg-[#c84e4e] transition-colors"
          >
            Cerrar Manual
          </button>
        </div>
      </div>
    </div>
  );
};
