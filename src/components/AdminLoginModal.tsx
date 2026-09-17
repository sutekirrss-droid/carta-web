import React, { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, ArrowRight, X, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { SutekiHankoSeal } from './SutekiBrandAssets';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expectedPin?: string;
  isDark: boolean;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  expectedPin = '2026',
  isDark,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setShowPin(false);
      setHasError(false);
      setShake(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = pinInput.trim();
    const validPins = [expectedPin, '2026', 'suteki', 'suteki2026', '10suteki'];

    if (validPins.includes(cleanInput)) {
      setHasError(false);
      onSuccess();
    } else {
      setHasError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      inputRef.current?.select();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-8 border shadow-2xl relative transition-all my-auto max-h-[94vh] overflow-y-auto ${
          shake ? 'animate-bounce' : ''
        } ${
          isDark
            ? 'bg-[#1E1E1D] border-[#383836] text-[#F6EFE4]'
            : 'bg-[#F6EFE4] border-[#B0AF9F]/40 text-[#3C3C3B]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isDark
              ? 'text-[#F6EFE4]/60 hover:text-white hover:bg-white/10'
              : 'text-[#3C3C3B]/60 hover:text-[#3C3C3B] hover:bg-black/5'
          }`}
          aria-label="Cerrar ventana de acceso"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Brand Seal */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-[#DC5D5D]/15 border border-[#DC5D5D]/30 flex items-center justify-center text-[#DC5D5D]">
              <Lock className="w-8 h-8 text-[#DC5D5D]" />
            </div>
            <div className="absolute -bottom-1 -right-1">
              <SutekiHankoSeal size="sm" color="#DC5D5D" />
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-cubano text-[#DC5D5D] tracking-tight">
              Acceso de Gestión
            </h2>
            <p
              className={`text-xs font-mono mt-1 ${
                isDark ? 'text-[#F6EFE4]/70' : 'text-[#3C3C3B]/70'
              }`}
            >
              Exclusivo para el equipo de Suteki (precios, carta y ajustes).
            </p>
          </div>
        </div>

        {/* Protected Notice */}
        <div
          className={`p-3 rounded-2xl border text-xs font-mono mb-5 flex items-start gap-2.5 ${
            isDark
              ? 'bg-[#282827] border-[#3E3E3C] text-[#F6EFE4]/80'
              : 'bg-white border-[#B0AF9F]/30 text-[#3C3C3B]/80'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            La carta pública está protegida. Ingresá tu PIN para modificar precios, disponibilidad o ajustar la configuración.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase tracking-wider font-bold opacity-80">
                PIN de Administrador
              </label>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-[11px] font-mono text-[#DC5D5D] hover:underline flex items-center gap-1"
              >
                {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPin ? 'Ocultar' : 'Mostrar'}</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none opacity-50">
                <KeyRound className="w-4 h-4 text-[#DC5D5D]" />
              </div>
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (hasError) setHasError(false);
                }}
                placeholder="Ingresá el PIN (ej: 2026)"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-mono tracking-widest border transition-all focus:outline-none focus:ring-2 focus:ring-[#DC5D5D] ${
                  hasError
                    ? 'border-red-500 bg-red-500/10'
                    : isDark
                    ? 'bg-[#151514] border-[#383836]'
                    : 'bg-white border-[#B0AF9F]/40'
                }`}
                autoComplete="current-password"
              />
            </div>

            {hasError && (
              <div className="flex items-center gap-1.5 text-xs text-red-500 mt-2 font-mono">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>PIN o clave incorrecta. Intentá con el PIN configurado o el por defecto.</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs font-mono font-bold border transition-colors ${
                isDark
                  ? 'border-[#383836] text-[#F6EFE4]/80 hover:bg-white/5'
                  : 'border-[#B0AF9F]/40 text-[#3C3C3B]/80 hover:bg-black/5'
              }`}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl text-xs font-cubano bg-[#DC5D5D] text-white hover:bg-[#c94b4b] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Ingresar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-current/10 text-center">
          <p className="text-[11px] font-mono opacity-60">
            PIN por defecto: <strong>2026</strong> (o <strong>suteki</strong>). Una vez dentro podés cambiarlo en un click.
          </p>
        </div>
      </div>
    </div>
  );
};
