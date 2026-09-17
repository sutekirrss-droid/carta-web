import React from 'react';
import { Star, MapPin, ExternalLink, Heart, MessageSquareHeart } from 'lucide-react';
import { SutekiHankoSeal } from './SutekiBrandAssets';

interface GoogleReviewCardProps {
  reviewUrl?: string;
  isDark?: boolean;
}

export const GoogleReviewCard: React.FC<GoogleReviewCardProps> = ({
  reviewUrl = 'https://www.google.com/maps/search/?api=1&query=Suteki+Sushi+Bella+Vista',
  isDark = false,
}) => {
  return (
    <div
      className={`max-w-4xl mx-auto my-8 px-4 sm:px-6 py-6 sm:py-7 rounded-3xl border relative overflow-hidden transition-all shadow-md ${
        isDark
          ? 'bg-gradient-to-br from-[#221313] via-[#1E1717] to-[#181817] border-[#DC5D5D]/35 text-[#F6EFE4]'
          : 'bg-gradient-to-br from-[#FFF7F5] via-[#FAF3EB] to-[#F5EBE1] border-[#DC5D5D]/30 text-[#3C3C3B]'
      }`}
    >
      {/* Subtle Japanese stamp watermark */}
      <div className="absolute -right-4 -bottom-4 opacity-15 pointer-events-none select-none hidden sm:block">
        <SutekiHankoSeal size="lg" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
        {/* Left: Star rating and branding */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DC5D5D]/15 border border-[#DC5D5D]/30 text-[#DC5D5D] text-[11px] font-mono font-bold uppercase tracking-wider">
              <MessageSquareHeart className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Suteki • Bella Vista</span>
            </span>

            {/* Stars row */}
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" strokeWidth={1.5} />
              ))}
              <span className="text-xs font-mono font-bold ml-1 text-amber-500">4.8</span>
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-brand font-black tracking-tight text-[#DC5D5D]">
            ¿Cómo estuvo tu experiencia hoy en Suteki?
          </h3>

          <p
            className={`text-xs font-mono leading-relaxed ${
              isDark ? 'text-[#F6EFE4]/75' : 'text-[#3C3C3B]/80'
            }`}
          >
            Nos encanta recibirte en <strong>Bella Vista</strong>. Tu reseña y fotos en Google Maps nos
            ayudan muchísimo a seguir cuidando cada detalle de nuestra barra Nikkei.
          </p>
        </div>

        {/* Right: Direct Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <a
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#DC5D5D] hover:bg-[#c94d4d] text-white font-brand font-bold text-xs shadow-md active:scale-98 transition-all group"
          >
            <Star className="w-4 h-4 fill-white text-white group-hover:rotate-12 transition-transform" strokeWidth={1.5} />
            <span>Dejar Reseña en Google</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" strokeWidth={1.5} />
          </a>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Suteki+Sushi+Bella+Vista"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-2xl border text-xs font-mono transition-all ${
              isDark
                ? 'bg-[#181817] border-[#383836] text-[#F6EFE4]/80 hover:bg-white/10'
                : 'bg-white border-[#B0AF9F]/30 text-[#3C3C3B] hover:bg-stone-50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#DC5D5D]" strokeWidth={1.5} />
            <span>Ver Ubicación</span>
          </a>
        </div>
      </div>
    </div>
  );
};
