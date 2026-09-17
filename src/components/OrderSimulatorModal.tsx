import React, { useState, useMemo } from 'react';
import { OrderItem } from '../types';
import { formatPrice } from '../lib/formatters';
import { normalizeImageUrl } from '../lib/imageOptimization';
import { SutekiLogo, SutekiHankoSeal } from './SutekiBrandAssets';
import {
  X,
  Users,
  Plus,
  Minus,
  Trash2,
  Copy,
  Check,
  Receipt,
  Sparkles,
  Calculator,
  UtensilsCrossed,
  Coins,
  MessageSquare,
  MessageCircle,
  Share2,
  Edit3,
  ArrowRight,
} from 'lucide-react';

export interface OrderSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: OrderItem[];
  onUpdateQuantity: (dishId: string, delta: number) => void;
  onRemoveItem: (dishId: string) => void;
  onClearOrder: () => void;
  onUpdateNote?: (dishId: string, note: string) => void;
  currencySymbol?: string;
  tableNumber?: string;
  onTableNumberChange?: (table: string) => void;
  onAddMoreItems?: () => void;
  availableMenuItems?: any[];
  onQuickAddItem?: (dish: any) => void;
  restaurantPhone?: string;
  isDark?: boolean;
}

export const OrderSimulatorModal: React.FC<OrderSimulatorModalProps> = ({
  isOpen,
  onClose,
  orderItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearOrder,
  onUpdateNote,
  tableNumber = '',
  onTableNumberChange,
  onAddMoreItems,
  restaurantPhone,
  isDark = false,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'split'>('items');
  const [dinersCount, setDinersCount] = useState<number>(2);
  const [tipPercentage, setTipPercentage] = useState<number>(10);
  const [customTip, setCustomTip] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [editingNoteDishId, setEditingNoteDishId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');

  // Safe helper to extract dish info from OrderItem (supporting legacy or alternative formats)
  const getItemDish = (item: OrderItem) => {
    return (
      item.dish ||
      (item as any).item || {
        id: item.dishId || 'unknown',
        name: 'Plato',
        price: 0,
        unit: '',
        imageUrl: undefined,
      }
    );
  };

  // Calculate totals safely
  const subtotal = useMemo(() => {
    return orderItems.reduce((acc, item) => {
      const dish = getItemDish(item);
      const price = typeof dish?.price === 'number' ? dish.price : 0;
      const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
      return acc + price * qty;
    }, 0);
  }, [orderItems]);

  const effectiveTipRate = useMemo(() => {
    if (customTip !== '') {
      const parsed = parseFloat(customTip);
      return isNaN(parsed) ? 0 : Math.max(0, parsed);
    }
    return tipPercentage;
  }, [tipPercentage, customTip]);

  const tipAmount = useMemo(() => {
    return Math.round((subtotal * effectiveTipRate) / 100);
  }, [subtotal, effectiveTipRate]);

  const total = subtotal + tipAmount;

  const totalPerDiner = useMemo(() => {
    if (dinersCount <= 0) return total;
    return Math.round(total / dinersCount);
  }, [total, dinersCount]);

  const totalItemsCount = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [orderItems]);

  // Generate shareable receipt summary for table companions / clipboard
  const generateReceiptText = () => {
    const lines: string[] = [];
    lines.push(`🍣 *SUTEKI SUSHI & NIKKEI* 🍣`);
    lines.push(`📋 *Nuestra selección para pedir al mozo:*`);
    if (tableNumber.trim()) {
      lines.push(`📍 *Mesa:* ${tableNumber.trim().toUpperCase()}`);
    }
    lines.push(`───────────────────────`);

    orderItems.forEach((item) => {
      const dish = getItemDish(item);
      const price = typeof dish?.price === 'number' ? dish.price : 0;
      const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
      lines.push(`• ${qty}x ${dish.name || 'Plato'} - ${formatPrice(price * qty)}`);
      if (item.note && item.note.trim()) {
        lines.push(`   ↳ _Nota: ${item.note.trim()}_`);
      }
    });

    lines.push(`───────────────────────`);
    lines.push(`Subtotal estimado: ${formatPrice(subtotal)}`);
    if (effectiveTipRate > 0) {
      lines.push(`Propina sugerida (${effectiveTipRate}%): ${formatPrice(tipAmount)}`);
    }
    lines.push(`*TOTAL ESTIMADO: ${formatPrice(total)}*`);
    lines.push(`───────────────────────`);
    lines.push(
      `👥 *División (${dinersCount} ${dinersCount === 1 ? 'persona' : 'personas'}):*\n👉 *${formatPrice(totalPerDiner)} c/u*`
    );
    lines.push(`\nℹ️ _El mozo tomará el pedido directamente en la mesa._`);
    lines.push(`¡Buen provecho en Suteki! ✨🥢`);
    return lines.join('\n');
  };

  const handleCopySummary = async () => {
    const text = generateReceiptText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  const handleShareWhatsApp = () => {
    const text = generateReceiptText();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSaveNote = (dishId: string) => {
    if (onUpdateNote) {
      onUpdateNote(dishId, tempNote.trim());
    }
    setEditingNoteDishId(null);
    setTempNote('');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-2xl rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col transition-all ${
          isDark
            ? 'bg-[#1C1C1B] border-[#383836] text-[#F6EFE4]'
            : 'bg-[#F6EFE4] border-[#B0AF9F]/40 text-[#3C3C3B]'
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 sm:px-6 py-3.5 sm:py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'bg-[#242423] border-[#333331]' : 'bg-white border-[#B0AF9F]/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DC5D5D]/15 border border-[#DC5D5D]/30 flex items-center justify-center text-[#DC5D5D] shrink-0">
              <UtensilsCrossed className="w-5 h-5 text-[#DC5D5D]" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-brand font-black tracking-tight">
                  Mis Platos Elegidos
                </h2>
                {orderItems.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#DC5D5D] text-white text-[11px] font-mono font-bold">
                    {totalItemsCount} {totalItemsCount === 1 ? 'plato' : 'platos'}
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] font-mono ${
                  isDark ? 'text-[#F6EFE4]/60' : 'text-[#3C3C3B]/70'
                }`}
              >
                Tu lista para pedirle al mozo y calculadora de cuenta estimada
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-white/10 text-[#F6EFE4]' : 'hover:bg-gray-100 text-[#3C3C3B]'
            }`}
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Optional Table Identifier Bar */}
        <div
          className={`px-4 sm:px-6 py-2 border-b flex items-center justify-between gap-3 text-xs font-mono shrink-0 ${
            isDark ? 'bg-[#181817] border-[#2A2A29]' : 'bg-[#EAE4D7]/70 border-[#B0AF9F]/20'
          }`}
        >
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#DC5D5D]">
              Nº Mesa / Ubicación:
            </span>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => onTableNumberChange?.(e.target.value)}
              placeholder="Ej: Mesa 4, Barra 2..."
              className={`px-2.5 py-1 rounded-xl text-xs font-mono border max-w-44 focus:outline-hidden focus:ring-1 focus:ring-[#DC5D5D] transition-all ${
                isDark
                  ? 'bg-[#242423] border-[#383836] text-[#F6EFE4] placeholder-[#F6EFE4]/40'
                  : 'bg-white border-[#B0AF9F]/40 text-[#3C3C3B] placeholder-[#3C3C3B]/50'
              }`}
            />
          </div>

          {orderItems.length > 0 && (
            <div className="text-right shrink-0">
              <span className="text-[11px] opacity-70">Total estimado: </span>
              <strong className="text-sm font-mono text-[#DC5D5D]">{formatPrice(total)}</strong>
            </div>
          )}
        </div>

        {/* Informative Waiter Notice */}
        <div
          className={`px-4 sm:px-6 py-2 text-[11px] font-mono border-b flex items-center gap-2 shrink-0 ${
            isDark
              ? 'bg-[#26181A] border-[#4A2027] text-rose-200/90'
              : 'bg-[#FFF5F5] border-[#DC5D5D]/20 text-[#B83E3E]'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5 text-[#DC5D5D] shrink-0" strokeWidth={1.5} />
          <span>
            <strong>Tu mozo tomará el pedido en la mesa:</strong> Esta lista te sirve para anotar tus platos, ver los precios oficiales y calcular el total o división de la cuenta.
          </span>
        </div>

        {/* Navigation Tabs (Platos vs Dividir Cuenta) */}
        {orderItems.length > 0 && (
          <div
            className={`p-2 sm:px-6 border-b flex items-center gap-2 shrink-0 ${
              isDark ? 'bg-[#20201F] border-[#30302E]' : 'bg-white/80 border-[#B0AF9F]/20'
            }`}
          >
            <button
              onClick={() => setActiveTab('items')}
              className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'items'
                  ? 'bg-[#DC5D5D] text-white shadow-xs'
                  : isDark
                  ? 'bg-[#181817] text-[#F6EFE4]/70 hover:text-white'
                  : 'bg-stone-100 text-[#3C3C3B]/70 hover:bg-stone-200'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Platos Elegidos</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
                {totalItemsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('split')}
              className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'split'
                  ? 'bg-[#DC5D5D] text-white shadow-xs'
                  : isDark
                  ? 'bg-[#181817] text-[#F6EFE4]/70 hover:text-white'
                  : 'bg-stone-100 text-[#3C3C3B]/70 hover:bg-stone-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Dividir Cuenta & Propina</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {orderItems.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#DC5D5D]/10 mx-auto flex items-center justify-center text-[#DC5D5D]">
                <UtensilsCrossed className="w-8 h-8 opacity-70" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-brand font-bold">
                  Tu mesa aún no tiene platos agregados
                </h3>
                <p
                  className={`text-xs max-w-sm mx-auto leading-relaxed ${
                    isDark ? 'text-[#F6EFE4]/60' : 'text-[#3C3C3B]/70'
                  }`}
                >
                  Explorá la carta y hacé clic en el botón <strong>«+ Mesa»</strong> en los platos que
                  quieras pedir para llevar la cuenta, personalizar notas al chef y dividir el total.
                </p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DC5D5D] text-white font-brand font-bold text-xs shadow-md hover:bg-[#c94e4e] transition-all"
              >
                Volver a la Carta y Elegir Platos
              </button>
            </div>
          ) : activeTab === 'items' ? (
            /* TAB 1: Platos de la Mesa */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#B0AF9F]/20">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#DC5D5D]">
                  Detalle de consumos ({totalItemsCount} unid.)
                </span>
                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="text-[11px] font-mono text-red-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Vaciar mesa
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-red-500 font-bold">¿Vaciar mesa?</span>
                    <button
                      onClick={() => {
                        onClearOrder();
                        setShowClearConfirm(false);
                      }}
                      className="px-2 py-0.5 rounded-md bg-red-600 text-white font-bold"
                    >
                      Sí
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-2 py-0.5 rounded-md bg-gray-500 text-white"
                    >
                      No
                    </button>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2.5 max-h-72 sm:max-h-80 overflow-y-auto pr-1">
                {orderItems.map((item, itemIdx) => {
                  const dish = getItemDish(item);
                  const dishId = item.dishId || dish.id || `order-item-${itemIdx}`;
                  const price = typeof dish?.price === 'number' ? dish.price : 0;
                  const qty =
                    typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
                  const isEditingThisNote = editingNoteDishId === dishId;

                  return (
                    <div
                      key={dishId}
                      className={`p-3 rounded-2xl border transition-all ${
                        isDark ? 'bg-[#222221] border-[#333331]' : 'bg-white border-[#B0AF9F]/30'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                        {/* Dish Thumbnail & Info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Dish Thumbnail */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-800 shrink-0 relative">
                            {dish.imageUrl ? (
                              <img
                                src={normalizeImageUrl(dish.imageUrl)}
                                alt={dish.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-900/40">
                                <UtensilsCrossed className="w-4 h-4" strokeWidth={1.5} />
                              </div>
                            )}
                          </div>

                          {/* Dish Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-brand font-bold truncate">
                              {dish.name}
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-[#DC5D5D] mt-0.5">
                              <span className="font-semibold">{formatPrice(price)} c/u</span>
                              {dish.unit && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded-md border ${
                                    isDark
                                      ? 'bg-[#1C1C1B] text-[#F6EFE4]/70 border-[#383836]'
                                      : 'bg-stone-100 text-[#3C3C3B]/70 border-stone-200'
                                  }`}
                                >
                                  {dish.unit}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stepper, Subtotal & Trash */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#B0AF9F]/15">
                          <div
                            className={`flex items-center rounded-xl border p-0.5 ${
                              isDark
                                ? 'bg-[#181817] border-[#383836]'
                                : 'bg-[#F6EFE4] border-[#B0AF9F]/30'
                            }`}
                          >
                            <button
                              onClick={() => onUpdateQuantity(dishId, -1)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/10 active:scale-95 transition-colors"
                              aria-label="Restar 1"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-mono font-bold">
                              {qty}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(dishId, 1)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/10 active:scale-95 transition-colors"
                              aria-label="Sumar 1"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right min-w-[70px] sm:w-24">
                            <span className="font-mono font-bold text-xs sm:text-sm text-[#DC5D5D]">
                              {formatPrice(price * qty)}
                            </span>
                          </div>

                          <button
                            onClick={() => onRemoveItem(dishId)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500/70 hover:text-red-600 transition-colors ml-1"
                            title="Eliminar plato de la mesa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Note / Aclaración Section */}
                      <div className="mt-2 pt-2 border-t border-dashed border-[#B0AF9F]/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                        {isEditingThisNote ? (
                          <div className="w-full flex items-center gap-2">
                            <input
                              type="text"
                              value={tempNote}
                              onChange={(e) => setTempNote(e.target.value)}
                              placeholder="Ej: sin palta, salsa aparte, celíaco..."
                              className={`flex-1 px-2.5 py-1 rounded-xl text-xs font-mono border focus:outline-hidden focus:ring-1 focus:ring-[#DC5D5D] ${
                                isDark
                                  ? 'bg-[#181817] border-[#383836] text-[#F6EFE4]'
                                  : 'bg-stone-50 border-[#B0AF9F]/30 text-[#3C3C3B]'
                              }`}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveNote(dishId)}
                              className="px-3 py-1 rounded-xl bg-[#DC5D5D] text-white text-[11px] font-mono font-bold"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditingNoteDishId(null)}
                              className="px-2 py-1 text-[11px] font-mono opacity-70 hover:opacity-100"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : item.note && item.note.trim() ? (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-500">
                              <MessageSquare className="w-3 h-3 shrink-0" />
                              <span className="italic">Nota: {item.note}</span>
                            </div>
                            <button
                              onClick={() => {
                                setTempNote(item.note || '');
                                setEditingNoteDishId(dishId);
                              }}
                              className="text-[10px] font-mono text-[#DC5D5D] hover:underline flex items-center gap-0.5"
                            >
                              <Edit3 className="w-3 h-3" /> Editar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setTempNote('');
                              setEditingNoteDishId(dishId);
                            }}
                            className={`text-[10px] font-mono hover:text-[#DC5D5D] transition-colors flex items-center gap-1 ${
                              isDark ? 'text-[#F6EFE4]/50' : 'text-[#3C3C3B]/50'
                            }`}
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>+ Agregar aclaración (ej: sin queso, alérgico)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action: Add more items from menu or continue to bill splitting */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onAddMoreItems?.();
                  }}
                  className={`w-full sm:flex-1 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isDark
                      ? 'bg-[#242423] border-[#383836] hover:bg-[#2C2C2B] text-[#F6EFE4]'
                      : 'bg-white border-[#B0AF9F]/40 hover:bg-stone-50 text-[#3C3C3B]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 text-[#DC5D5D]" />
                  <span>+ Agregar Más Platos de la Carta</span>
                </button>

                <button
                  onClick={() => setActiveTab('split')}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-[#DC5D5D] hover:bg-[#c94d4d] text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Calcular División de Cuenta</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* TAB 2: Dividir Cuenta & Propina */
            <div className="space-y-4">
              {/* Diners Split Controls */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#222221] border-[#333331]' : 'bg-white border-[#B0AF9F]/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#DC5D5D]" />
                    <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#DC5D5D]">
                      ¿Cuántos comensales dividen?
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold">
                    {dinersCount} {dinersCount === 1 ? 'persona' : 'personas'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDinersCount((c) => Math.max(1, c - 1))}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                      isDark
                        ? 'bg-[#181817] border-[#383836] hover:bg-[#252524]'
                        : 'bg-stone-100 border-[#B0AF9F]/30 hover:bg-stone-200'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="flex-1 flex items-center justify-center gap-1.5 overflow-x-auto py-1">
                    {[1, 2, 3, 4, 5, 6, 8].map((num) => (
                      <button
                        key={num}
                        onClick={() => setDinersCount(num)}
                        className={`w-8 h-8 rounded-xl text-xs font-mono font-semibold border transition-all shrink-0 ${
                          dinersCount === num
                            ? 'bg-[#DC5D5D] text-white border-[#DC5D5D] shadow-xs'
                            : isDark
                            ? 'bg-[#181817] border-[#383836] text-[#F6EFE4]/80'
                            : 'bg-stone-50 border-[#B0AF9F]/30 text-[#3C3C3B]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setDinersCount((c) => Math.min(20, c + 1))}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                      isDark
                        ? 'bg-[#181817] border-[#383836] hover:bg-[#252524]'
                        : 'bg-stone-100 border-[#B0AF9F]/30 hover:bg-stone-200'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Suggested Tip Selector */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#222221] border-[#333331]' : 'bg-white border-[#B0AF9F]/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#DC5D5D] uppercase tracking-wider">
                    <Coins className="w-4 h-4" />
                    <span>Propina Sugerida</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-500">
                    +{formatPrice(tipAmount)}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[0, 10, 15, 20].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setTipPercentage(rate);
                        setCustomTip('');
                      }}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                        customTip === '' && tipPercentage === rate
                          ? 'bg-[#DC5D5D] text-white border-[#DC5D5D] shadow-xs'
                          : isDark
                          ? 'bg-[#181817] border-[#383836] text-[#F6EFE4]/80 hover:bg-[#282827]'
                          : 'bg-stone-50 border-[#B0AF9F]/30 text-[#3C3C3B] hover:bg-stone-100'
                      }`}
                    >
                      {rate === 0 ? 'Sin propina' : `${rate}%`}
                    </button>
                  ))}
                </div>

                <p
                  className={`text-[10px] font-mono leading-tight flex items-center gap-1.5 ${
                    isDark ? 'text-[#F6EFE4]/50' : 'text-[#3C3C3B]/60'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" strokeWidth={1.5} />
                  <span>El 10% es la propina habitual recomendada para la atención y el equipo de sushimen.</span>
                </p>
              </div>

              {/* Total & Split Breakdown Card */}
              <div
                className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-md relative overflow-hidden ${
                  isDark
                    ? 'bg-gradient-to-br from-[#251010] via-[#1F1414] to-[#1C1C1B] border-[#DC5D5D]/40'
                    : 'bg-gradient-to-br from-[#FFF5F5] via-[#FCF3EA] to-[#F6EFE4] border-[#DC5D5D]/30'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={isDark ? 'text-[#F6EFE4]/70' : 'text-[#3C3C3B]/70'}>
                      Subtotal Platos ({totalItemsCount} unid.):
                    </span>
                    <span className="font-bold">{formatPrice(subtotal)}</span>
                  </div>

                  {effectiveTipRate > 0 && (
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className={isDark ? 'text-[#F6EFE4]/70' : 'text-[#3C3C3B]/70'}>
                        Propina sugerida ({effectiveTipRate}%):
                      </span>
                      <span className="font-bold text-amber-500">+{formatPrice(tipAmount)}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#DC5D5D]/20 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-mono uppercase tracking-wider font-bold">
                      Total Estimado Mesa:
                    </span>
                    <span className="text-lg sm:text-xl font-mono font-black text-[#DC5D5D]">
                      {formatPrice(total)}
                    </span>
                  </div>

                  {/* Highlight: Split Per Person */}
                  <div
                    className={`mt-3 p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      isDark
                        ? 'bg-[#180A0A] border-[#DC5D5D]/50 text-white'
                        : 'bg-white border-[#DC5D5D]/40 text-[#3C3C3B]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#DC5D5D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {dinersCount}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#DC5D5D] font-bold block">
                          Paga cada uno:
                        </span>
                        <span className="text-xs font-mono opacity-70">
                          {dinersCount} {dinersCount === 1 ? 'comensal' : 'comensales en total'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-mono font-black text-[#DC5D5D]">
                        {formatPrice(totalPerDiner)}
                      </span>
                      <span className="block text-[9px] font-mono opacity-60">c/u (con propina)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        {orderItems.length > 0 && (
          <div
            className={`px-4 sm:px-6 py-3.5 sm:py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0 ${
              isDark ? 'bg-[#242423] border-[#333331]' : 'bg-white border-[#B0AF9F]/30'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleShareWhatsApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-mono font-bold shadow-xs transition-all cursor-pointer"
                title="Compartir lista de platos elegidos y cuenta con los comensales de la mesa"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                <span>Compartir con la Mesa</span>
              </button>

              <button
                onClick={handleCopySummary}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : isDark
                    ? 'bg-[#1C1C1B] border-[#444442] hover:bg-white/10 text-[#F6EFE4]'
                    : 'bg-stone-50 border-[#B0AF9F]/40 hover:bg-stone-100 text-[#3C3C3B]'
                }`}
                title="Copiar resumen al portapapeles"
              >
                {copied ? <Check className="w-4 h-4 text-white" strokeWidth={1.5} /> : <Copy className="w-4 h-4" strokeWidth={1.5} />}
                <span>{copied ? '¡Copiado!' : 'Copiar Cuenta'}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#DC5D5D] hover:bg-[#c94d4d] text-white font-brand font-bold text-xs shadow-md transition-all"
            >
              Seguir Viendo la Carta
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
