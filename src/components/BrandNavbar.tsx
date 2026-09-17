import React from 'react';
import { AppViewMode, RestaurantConfig } from '../types';
import { SutekiHankoSeal } from './SutekiBrandAssets';
import {
  Utensils,
  SlidersHorizontal,
  QrCode,
  RefreshCw,
  Sun,
  Moon,
  Lock,
  LogOut,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

interface BrandNavbarProps {
  currentView: AppViewMode;
  onViewChange: (view: AppViewMode) => void;
  config: RestaurantConfig;
  isSyncing: boolean;
  isConnected: boolean;
  tableParam?: string;
  isDark: boolean;
  onToggleTheme: () => void;
  isAdminAuthenticated: boolean;
  onOpenLogin: () => void;
  onLogoutAdmin: () => void;
  onOpenPinModal?: () => void;
}

export const BrandNavbar: React.FC<BrandNavbarProps> = ({
  currentView,
  onViewChange,
  config,
  isSyncing,
  isConnected,
  tableParam,
  isDark,
  onToggleTheme,
  isAdminAuthenticated,
  onOpenLogin,
  onLogoutAdmin,
  onOpenPinModal,
}) => {
  return (
    <header
      className={`sticky top-0 z-40 transition-colors backdrop-blur-md border-b px-2.5 sm:px-4 h-14 sm:h-16 flex items-center ${
        isDark
          ? 'bg-[#181818]/95 border-[#333332]'
          : 'bg-[#F6EFE4]/95 border-[#B0AF9F]/30'
      }`}
    >
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo & Kanji */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div
            onClick={() => onViewChange('customer')}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group shrink-0"
          >
            <SutekiHankoSeal size="sm" color="#DC5D5D" />
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-cubano text-lg sm:text-xl text-[#DC5D5D] tracking-tight group-hover:text-[#943535] transition-colors">
                  {config.name}
                </span>
                <span
                  className={`hidden sm:inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${
                    isDark
                      ? 'text-[#F6EFE4]/70 bg-[#252524] border-[#3C3C3B]'
                      : 'text-[#3C3C3B]/60 bg-white/80 border-[#B0AF9F]/30'
                  }`}
                >
                  林 • 10年
                </span>
                {isAdminAuthenticated && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-mono font-bold bg-[#DC5D5D] text-white shadow-2xs">
                    <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    ADMIN
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sync indicator (Only in admin mode or subtle for staff) */}
          {isAdminAuthenticated && (
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono shrink-0 ${
                isDark
                  ? 'bg-[#252524] border-[#3C3C3B] text-[#F6EFE4]/80'
                  : 'bg-white/80 border-[#B0AF9F]/20 text-[#3C3C3B]/80'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="font-medium">
                {isSyncing ? 'Guardando...' : isConnected ? 'En vivo' : 'Reconectando'}
              </span>
              {isSyncing && <RefreshCw className="w-2.5 h-2.5 animate-spin text-[#DC5D5D]" />}
            </div>
          )}

          {/* Scanned Table Pill for Customers */}
          {tableParam && (
            <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DC5D5D]/10 text-[#DC5D5D] text-[11px] font-mono font-bold border border-[#DC5D5D]/20 shrink-0">
              <span>{tableParam.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border transition-all flex items-center gap-1.5 text-xs font-mono font-bold ${
              isDark
                ? 'bg-[#262625] text-amber-300 border-[#3C3C3B] hover:bg-[#30302F]'
                : 'bg-white text-[#3C3C3B] border-[#B0AF9F]/30 hover:bg-[#F6EFE4]'
            }`}
            title={isDark ? 'Cambiar a modo claro (Día)' : 'Cambiar a modo oscuro (Noche / Salón)'}
            aria-label="Alternar tema oscuro o claro"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                <span className="hidden md:inline text-xs text-[#F6EFE4]">Día</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#3C3C3B]" />
                <span className="hidden md:inline text-xs text-[#3C3C3B]">Noche</span>
              </>
            )}
          </button>

          {/* If Logged In as Admin: Show View Switchers and Logout */}
          {isAdminAuthenticated ? (
            <>
              <div
                className={`flex items-center p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border shadow-xs ${
                  isDark ? 'bg-[#222221] border-[#333332]' : 'bg-white border-[#B0AF9F]/30'
                }`}
              >
                <button
                  onClick={() => onViewChange('customer')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-cubano transition-all flex items-center gap-1 sm:gap-1.5 ${
                    currentView === 'customer'
                      ? 'bg-[#DC5D5D] text-white shadow-xs'
                      : isDark
                      ? 'text-[#F6EFE4]/80 hover:bg-[#2C2C2B]'
                      : 'text-[#3C3C3B]/80 hover:bg-[#F6EFE4]'
                  }`}
                  title="Ver Carta como comensal"
                >
                  <Utensils className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Carta</span>
                </button>

                <button
                  onClick={() => onViewChange('admin')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-cubano transition-all flex items-center gap-1 sm:gap-1.5 ${
                    currentView === 'admin'
                      ? 'bg-[#3C3C3B] text-white shadow-xs'
                      : isDark
                      ? 'text-[#F6EFE4]/80 hover:bg-[#2C2C2B]'
                      : 'text-[#3C3C3B]/80 hover:bg-[#F6EFE4]'
                  }`}
                  title="Panel de Gestión de Platos y Precios"
                >
                  <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E37A7B] shrink-0" />
                  <span className="hidden sm:inline">Gestión</span>
                </button>

                <button
                  onClick={() => onViewChange('qr-studio')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-cubano transition-all flex items-center gap-1 sm:gap-1.5 ${
                    currentView === 'qr-studio'
                      ? 'bg-[#943535] text-white shadow-xs'
                      : isDark
                      ? 'text-[#F6EFE4]/80 hover:bg-[#2C2C2B]'
                      : 'text-[#3C3C3B]/80 hover:bg-[#F6EFE4]'
                  }`}
                  title="Generador de Códigos QR para Mesas"
                >
                  <QrCode className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 shrink-0" />
                  <span className="hidden sm:inline">QR</span>
                </button>
              </div>

              {/* Quick PIN Configuration Shortcut for Admin - ALWAYS VISIBLE */}
              {onOpenPinModal && (
                <button
                  onClick={onOpenPinModal}
                  className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border transition-all flex items-center gap-1 text-[11px] sm:text-xs font-mono font-bold shrink-0 shadow-2xs active:scale-95 ${
                    isDark
                      ? 'bg-[#2A2218] text-amber-300 border-amber-500/40 hover:bg-[#342a1e]'
                      : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  }`}
                  title="Configurar o Cambiar PIN de Acceso (siempre disponible)"
                  aria-label="Configurar PIN de Administración"
                >
                  <KeyRound className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#DC5D5D] shrink-0" />
                  <span className="font-bold">PIN</span>
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={onLogoutAdmin}
                className={`p-1.5 sm:p-2 rounded-xl border transition-all flex items-center gap-1 text-xs font-mono font-bold text-red-500 hover:bg-red-500/10 shrink-0 ${
                  isDark ? 'border-[#3C3C3B]' : 'border-[#B0AF9F]/30'
                }`}
                title="Cerrar sesión de administración"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden lg:inline text-[11px]">Salir</span>
              </button>
            </>
          ) : (
            /* Clear & Visible Admin Access Button for Owner/Staff */
            <button
              onClick={onOpenLogin}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-mono font-bold shadow-xs active:scale-95 shrink-0 ${
                isDark
                  ? 'bg-[#222221] text-[#DC5D5D] border-[#DC5D5D]/40 hover:bg-[#DC5D5D] hover:text-white'
                  : 'bg-white text-[#DC5D5D] border-[#DC5D5D]/40 hover:bg-[#DC5D5D] hover:text-white'
              }`}
              title="Ingresar con PIN para administrar carta y precios"
            >
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Acceso Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
