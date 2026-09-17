import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OrderItem } from '../types';
import { formatPrice } from '../lib/formatters';
import { Calculator, ChevronRight, ClipboardList } from 'lucide-react';

interface FloatingOrderBarProps {
  orderItems: OrderItem[];
  tableNumber?: string;
  isDark?: boolean;
  onOpenOrder: () => void;
}

export const FloatingOrderBar: React.FC<FloatingOrderBarProps> = ({
  orderItems,
  tableNumber,
  isDark = false,
  onOpenOrder,
}) => {
  const totalCount = orderItems.reduce((acc, i) => acc + (i.quantity || 0), 0);
  const totalPrice = orderItems.reduce((acc, i) => {
    const unitPrice = i.dish?.price ?? (i as any).item?.price ?? 0;
    const qty = typeof i.quantity === 'number' && i.quantity > 0 ? i.quantity : 1;
    return acc + unitPrice * qty;
  }, 0);

  return (
    <AnimatePresence>
      {totalCount > 0 && (
        <motion.div
          initial={{ y: 90, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 90, opacity: 0, scale: 0.96 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
          className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-[420px] z-40"
        >
          <div
            onClick={onOpenOrder}
            className={`cursor-pointer rounded-2xl p-3 shadow-2xl border flex items-center justify-between gap-3 transition-all hover:scale-[1.02] active:scale-[0.99] backdrop-blur-md ${
              isDark
                ? 'bg-[#1C1C1B]/95 border-[#DC5D5D]/50 text-[#F6EFE4] shadow-black/80'
                : 'bg-white/95 border-[#DC5D5D]/40 text-[#3C3C3B] shadow-rose-950/20'
            }`}
          >
            {/* Left: Counter & Status */}
            <div className="flex items-center gap-2.5">
              <motion.div
                key={totalCount}
                initial={{ scale: 0.7, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#DC5D5D] to-[#943535] text-white flex items-center justify-center font-brand font-black text-sm shadow-md shrink-0 relative overflow-hidden"
              >
                <span className="relative z-10">{totalCount}</span>
                {/* Shimmer sweep animation */}
                <motion.div
                  className="absolute inset-0 bg-white/25 -skew-x-12"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    ease: 'easeInOut',
                    repeatDelay: 1.5,
                  }}
                />
              </motion.div>

              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#DC5D5D]">
                    {tableNumber ? `Mesa ${tableNumber.toUpperCase()} • ` : ''}Mis Platos Elegidos
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-mono font-black tracking-tight text-[#DC5D5D]">
                    {formatPrice(totalPrice)}
                  </span>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-white/60' : 'text-[#3C3C3B]/60'}`}>
                    estimado
                  </span>
                </div>
              </div>
            </div>

            {/* Right: CTA button */}
            <div className="flex items-center gap-1.5 bg-[#DC5D5D] hover:bg-[#c94d4d] text-white px-3 py-2 rounded-xl text-xs font-mono font-bold shadow-xs transition-colors shrink-0">
              <ClipboardList className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Ver Lista</span>
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
