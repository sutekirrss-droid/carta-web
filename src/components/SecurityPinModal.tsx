import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, ShieldCheck, Check, X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { SutekiHankoSeal } from './SutekiBrandAssets';

interface SecurityPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPin: string;
  onSavePin: (newPin: string) => void;
  isDark?: boolean;
}

export const SecurityPinModal: React.FC<SecurityPinModalProps> = ({
  isOpen,
  onClose,
  currentPin,
  onSavePin,
  isDark = false,
}) => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNewPin(currentPin || '2026');
      setConfirmPin(currentPin || '2026');
      setError(null);
      setSuccess(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, currentPin]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = newPin.trim();
    const cleanConfirm = confirmPin.trim();

    if (!cleanPin) {
      setError('El PIN no puede estar vacío');
      return;
    }
    if (cleanPin.length < 2) {
      setError('El PIN debe tener al menos 2 caracteres');
      return;
    }
    if (cleanPin !== cleanConfirm) {
      setError('Los PINs no coinciden');
      return;
    }

    onSavePin(cleanPin);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-8 border shadow-2xl relative transition-all my-auto max-h-[92vh] overflow-y-auto ${
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
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-[#DC5D5D]/15 border border-[#DC5D5D]/30 flex items-center justify-center text-[#DC5D5D]">
              <KeyRound className="w-7 h-7 text-[#DC5D5D]" />
            </div>
            <div className="absolute -bottom-1 -right-1">
              <SutekiHankoSeal size="sm" color="#DC5D5D" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-cubano text-[#DC5D5D] tracking-tight">
            Configurar PIN de Administración
          </h2>
          <p className="text-xs font-mono opacity-70 max-w-xs">
            Este código protege la edición de precios, disponibilidad y la carta digital de Suteki.
          </p>
        </div>

        {/* Current PIN status */}
        <div
          className={`p-3.5 rounded-2xl border text-xs font-mono mb-5 flex items-center justify-between ${
            isDark
              ? 'bg-[#282827] border-[#3E3E3C] text-[#F6EFE4]'
              : 'bg-white border-[#B0AF9F]/30 text-[#3C3C3B]'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>PIN actual de seguridad:</span>
          </div>
          <span className="font-bold text-sm text-[#DC5D5D] bg-[#DC5D5D]/10 px-2 py-0.5 rounded-md font-mono">
            {currentPin || '2026'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase tracking-wider font-bold opacity-80">
                Nuevo PIN o Clave
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
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                value={newPin}
                onChange={(e) => {
                  setNewPin(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="ej: 2026 o clave secreta"
                className={`w-full px-4 py-3 rounded-2xl text-base font-mono tracking-widest border transition-all focus:outline-none focus:ring-2 focus:ring-[#DC5D5D] ${
                  isDark
                    ? 'bg-[#151514] border-[#383836] text-[#F6EFE4]'
                    : 'bg-white border-[#B0AF9F]/40 text-[#3C3C3B]'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider font-bold mb-1.5 opacity-80">
              Confirmar Nuevo PIN
            </label>
            <input
              type={showPin ? 'text' : 'password'}
              value={confirmPin}
              onChange={(e) => {
                setConfirmPin(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Reescribí el nuevo PIN"
              className={`w-full px-4 py-3 rounded-2xl text-base font-mono tracking-widest border transition-all focus:outline-none focus:ring-2 focus:ring-[#DC5D5D] ${
                isDark
                  ? 'bg-[#151514] border-[#383836] text-[#F6EFE4]'
                  : 'bg-white border-[#B0AF9F]/40 text-[#3C3C3B]'
              }`}
            />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-500 font-mono bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-mono bg-emerald-100 p-2.5 rounded-xl border border-emerald-300">
              <Check className="w-4 h-4 shrink-0" />
              <span>¡PIN actualizado exitosamente!</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-3">
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
              disabled={success}
              className="flex-1 py-3 px-4 rounded-2xl text-xs font-cubano bg-[#DC5D5D] text-white hover:bg-[#c94b4b] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Nuevo PIN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
