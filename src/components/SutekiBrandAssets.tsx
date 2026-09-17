import React from 'react';
import { KoiIllustration } from './KoiIllustration';

export const BRAND_COLORS = [
  {
    name: 'Coral Suteki',
    hex: '#DC5D5D',
    role: 'Color Principal de Marca',
    description: 'Logotipo, elementos primarios, promociones y destaque de platos insignia.',
    textColor: '#FFFFFF',
  },
  {
    name: 'Crema Washi',
    hex: '#F6EFE4',
    role: 'Fondo & Lienzo Principal',
    description: 'Inspirado en papel washi tradicional japonés y arroz de sushi.',
    textColor: '#3C3C3B',
  },
  {
    name: 'Sumi Charcoal',
    hex: '#3C3C3B',
    role: 'Texto & Tinta Sumi-e',
    description: 'Tipografía de lectura, contrastes fuertes y fondos del panel de gestión.',
    textColor: '#F6EFE4',
  },
  {
    name: 'Arena / Salmón Mate',
    hex: '#B0AF9F',
    role: 'Tono Secundario & Divisores',
    description: 'Líneas guías, bordes sutiles, detalles de packaging y texturas de fondo.',
    textColor: '#3C3C3B',
  },
  {
    name: 'Jade Mint',
    hex: '#93C2BC',
    role: 'Acento Fresco & Océano',
    description: 'Pescados frescos, maridajes recomendados, sellos de sustentabilidad y hojas shiso.',
    textColor: '#153A35',
  },
];

export const SUTEKI_OFFICIAL_LOGOS = {
  rojoWithTagline: '/assets/branding/logos/logo-tagline-rojo-trimmed.png',
  rojo: '/assets/branding/logos/logo-rojo-trimmed.png',
  claroWithTagline: '/assets/branding/logos/logo-tagline-claro-trimmed.png',
  claro: '/assets/branding/logos/logo-claro-trimmed.png',
  negroWithTagline: '/assets/branding/logos/logo-tagline-negro-trimmed.png',
  negro: '/assets/branding/logos/logo-negro-trimmed.png',
  rawRojoWithTagline: '/assets/branding/logos/logo-tagline-rojo.png',
  rawRojo: '/assets/branding/logos/logo-rojo.png',
  rawClaroWithTagline: '/assets/branding/logos/logo-tagline-claro.png',
  rawClaro: '/assets/branding/logos/logo-claro.png',
  rawNegroWithTagline: '/assets/branding/logos/logo-tagline-negro.png',
  rawNegro: '/assets/branding/logos/logo-negro.png',
} as const;

interface SutekiLogoProps {
  variant?: 'horizontal' | 'stacked' | 'with-koi' | 'compact' | 'image-only';
  colorMode?: 'coral' | 'white' | 'charcoal' | 'cream';
  className?: string;
  showTagline?: boolean;
  showBadge?: boolean;
}

/**
 * Authentic Suteki Brand Logo Lockup
 * Uses the official logo assets provided in Google Drive (Logos / PNG)
 */
export const SutekiLogo: React.FC<SutekiLogoProps> = ({
  variant = 'horizontal',
  colorMode = 'coral',
  className = '',
  showTagline = true,
  showBadge = true,
}) => {
  const getColors = () => {
    switch (colorMode) {
      case 'white':
        return {
          primary: '#FFFFFF',
          secondary: '#FFFFFF',
          tagline: '#FFFFFF',
          border: 'rgba(255, 255, 255, 0.4)',
        };
      case 'charcoal':
        return {
          primary: '#3C3C3B',
          secondary: '#DC5D5D',
          tagline: '#3C3C3B',
          border: 'rgba(60, 60, 59, 0.2)',
        };
      case 'cream':
        return {
          primary: '#F6EFE4',
          secondary: '#E37A7B',
          tagline: '#F6EFE4',
          border: 'rgba(246, 239, 228, 0.3)',
        };
      case 'coral':
      default:
        return {
          primary: '#DC5D5D',
          secondary: '#943535',
          tagline: '#DC5D5D',
          border: 'rgba(220, 93, 93, 0.35)',
        };
    }
  };

  const getLogoImageSrc = () => {
    if (colorMode === 'white' || colorMode === 'cream') {
      return showTagline
        ? SUTEKI_OFFICIAL_LOGOS.claroWithTagline
        : SUTEKI_OFFICIAL_LOGOS.claro;
    }
    if (colorMode === 'charcoal') {
      return showTagline
        ? SUTEKI_OFFICIAL_LOGOS.negroWithTagline
        : SUTEKI_OFFICIAL_LOGOS.negro;
    }
    // coral default
    return showTagline
      ? SUTEKI_OFFICIAL_LOGOS.rojoWithTagline
      : SUTEKI_OFFICIAL_LOGOS.rojo;
  };

  const colors = getColors();
  const logoImageSrc = getLogoImageSrc();

  if (variant === 'compact') {
    const compactSrc =
      colorMode === 'white' || colorMode === 'cream'
        ? SUTEKI_OFFICIAL_LOGOS.claro
        : colorMode === 'charcoal'
        ? SUTEKI_OFFICIAL_LOGOS.negro
        : SUTEKI_OFFICIAL_LOGOS.rojo;

    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <img
          src={compactSrc}
          alt="Suteki"
          className="h-6 sm:h-7 w-auto object-contain select-none"
          referrerPolicy="no-referrer"
        />
        {showBadge && (
          <span
            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm border"
            style={{
              color: colors.primary,
              borderColor: colors.border,
            }}
          >
            10年
          </span>
        )}
      </div>
    );
  }

  if (variant === 'with-koi') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {/* Kanji left + Official Logo from Google Drive + 10年 right */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <span
            className="text-xs sm:text-sm font-mono font-bold tracking-wider opacity-85 select-none"
            style={{ color: colors.primary }}
          >
            林
          </span>

          <h1 className="flex items-center justify-center select-none">
            <img
              src={logoImageSrc}
              alt="Suteki - Sushi, Salads & Cocina Nikkei"
              className="h-14 sm:h-20 md:h-24 w-auto max-w-[320px] sm:max-w-[440px] object-contain drop-shadow-sm transition-transform duration-200"
              referrerPolicy="no-referrer"
            />
          </h1>

          <span
            className="text-xs sm:text-sm font-mono font-bold tracking-wider opacity-85 select-none"
            style={{ color: colors.primary }}
          >
            10年
          </span>
        </div>
      </div>
    );
  }

  // Standard horizontal configuration using official Google Drive logo
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className="flex items-center justify-center gap-2.5 sm:gap-3">
        {/* Left Kanji symbol: 林 */}
        <span
          className="text-xs sm:text-sm font-mono font-bold tracking-wider select-none"
          style={{ color: colors.primary }}
          title="Suteki Hayashi mark"
        >
          林
        </span>

        {/* Main Brand Logo Image from Google Drive */}
        <span className="inline-flex items-center justify-center select-none">
          <img
            src={logoImageSrc}
            alt="Suteki - Sushi, Salads & Cocina Nikkei"
            className="h-9 sm:h-12 w-auto max-w-[240px] sm:max-w-[320px] object-contain drop-shadow-xs"
            referrerPolicy="no-referrer"
          />
        </span>

        {/* Right Badge: 10年 */}
        <span
          className="text-xs sm:text-sm font-mono font-bold tracking-wider select-none"
          style={{ color: colors.primary }}
        >
          10年
        </span>
      </div>
    </div>
  );
};

/**
 * Authentic Japanese Red Inkan / Hanko Seal Stamp (SU / KS)
 * Taken directly from the brand guide corners and identity cards.
 */
export const SutekiHankoSeal: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}> = ({ size = 'md', className = '', color = '#DC5D5D' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[8px]',
    md: 'w-8 h-8 text-[10px]',
    lg: 'w-11 h-11 text-xs',
  };

  return (
    <div
      className={`hanko-seal transform -rotate-3 transition-transform hover:rotate-0 select-none shadow-xs ${sizeClasses[size]} ${className}`}
      style={{
        color: color,
        borderColor: color,
        backgroundColor: 'rgba(220, 93, 93, 0.08)',
      }}
      title="Sello Oficial Suteki (Hanko)"
    >
      <span className="font-mono font-black tracking-tighter leading-tight">SU</span>
      <span className="font-mono font-black tracking-tighter leading-tight">KS</span>
    </div>
  );
};

/**
 * Authentic Background Textures & Patterns from Suteki Brand Assets (Google Drive)
 * Sources: Trama Aletas.pdf, Trama Koi.pdf, Trama aletas verde.pdf, Recurso 1-8.png
 */
export const SUTEKI_BACKGROUND_TEXTURES = {
  aletas: {
    id: 'aletas',
    name: 'Trama Aletas',
    shortName: 'Aletas',
    description: 'Patrón geométrico de aletas en tono crema washi oficial',
    url: '/assets/branding/trama-aletas.jpg',
    source: 'Trama Aletas.pdf',
    defaultScale: '520px auto',
  },
  koi: {
    id: 'koi',
    name: 'Trama Koi',
    shortName: 'Peces Koi',
    description: 'Patrón de peces koi nadando en fondo crema washi',
    url: '/assets/branding/trama-koi.jpg',
    source: 'Trama Koi.pdf',
    defaultScale: '620px auto',
  },
  'aletas-verde': {
    id: 'aletas-verde',
    name: 'Trama Aletas Verde',
    shortName: 'Jade Matcha',
    description: 'Variante de aletas en tono jade matcha nikkei',
    url: '/assets/branding/trama-aletas-verde.jpg',
    source: 'Trama aletas verde.pdf',
    defaultScale: '520px auto',
  },
  recurso: {
    id: 'recurso',
    name: 'Recurso 1-8 (Ilustración Nikkei)',
    shortName: 'Recurso 1-8',
    description: 'Motivo ilustrado oficial con transparencias de marca',
    url: '/assets/branding/recurso-1-8.png',
    source: 'Recurso 1-8.png',
    defaultScale: 'contain',
  },
} as const;

/**
 * Authentic Fullscreen / Section Background Layer with real Suteki Tramas
 */
export const SutekiBackgroundLayer: React.FC<{
  pattern?: 'aletas' | 'koi' | 'aletas-verde' | 'none';
  opacity?: number;
  isDark?: boolean;
}> = ({ pattern = 'aletas', opacity = 0.22, isDark = false }) => {
  if (pattern === 'none') return null;
  const texture = SUTEKI_BACKGROUND_TEXTURES[pattern] || SUTEKI_BACKGROUND_TEXTURES.aletas;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
      style={{
        backgroundImage: `url(${texture.url})`,
        backgroundRepeat: 'repeat',
        backgroundSize: texture.defaultScale,
        backgroundPosition: 'center top',
        opacity: isDark ? opacity * 0.22 : opacity,
        mixBlendMode: isDark ? 'screen' : 'multiply',
      }}
      aria-hidden="true"
    />
  );
};

/**
 * Authentic Brand Illustration (Recurso 1-8.png)
 */
export const SutekiBrandIllustration: React.FC<{
  className?: string;
  opacity?: number;
}> = ({ className = 'w-48 h-auto', opacity = 0.85 }) => {
  return (
    <img
      src="/assets/branding/recurso-1-8-preview.jpg"
      alt="Suteki Ilustración Oficial"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
      referrerPolicy="no-referrer"
    />
  );
};

/**
 * Authentic Wallpaper / Pattern of Japanese Koi fish or Aletas
 * Uses authentic raster assets from Google Drive
 */
export const SutekiKoiPattern: React.FC<{
  className?: string;
  opacity?: number;
  patternType?: 'aletas' | 'koi' | 'aletas-verde';
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light';
}> = ({ className = 'absolute inset-0', opacity = 0.22, patternType = 'aletas', blendMode = 'multiply' }) => {
  const texture = SUTEKI_BACKGROUND_TEXTURES[patternType] || SUTEKI_BACKGROUND_TEXTURES.aletas;
  return (
    <div
      className={`pointer-events-none overflow-hidden ${className}`}
      style={{
        backgroundImage: `url(${texture.url})`,
        backgroundRepeat: 'repeat',
        backgroundSize: texture.defaultScale,
        opacity,
        mixBlendMode: blendMode,
      }}
      aria-hidden="true"
    />
  );
};

/**
 * Chopstick Wrapper Graphic (Faja de Palillos Japoneses)
 * Seen in the packaging application on SUTEKI branding-06.jpg
 */
export const ChopstickWrapperGraphic: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <div
      className={`relative inline-flex items-center gap-3 px-4 py-1.5 rounded-sm bg-[#F6EFE4] text-[#3C3C3B] border border-[#B0AF9F]/50 shadow-xs select-none ${className}`}
      style={{
        boxShadow: '0 2px 8px rgba(60,60,59,0.06)',
      }}
    >
      <span className="text-[10px] font-mono text-[#DC5D5D] font-bold">林</span>
      <span className="font-cubano text-sm tracking-tight text-[#DC5D5D]">Suteki</span>
      <span className="text-[8px] font-mono tracking-widest uppercase opacity-75 hidden sm:inline">
        SUSHI SALADS COCINA NIKKEI
      </span>
      <span className="text-[9px] font-mono px-1 py-0.2 bg-[#DC5D5D] text-white rounded-xs font-bold">
        10年
      </span>
    </div>
  );
};
