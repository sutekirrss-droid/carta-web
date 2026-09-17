import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, UtensilsCrossed } from 'lucide-react';

export interface ToastFeedback {
  id: number;
  name: string;
  count: number;
}

interface AddToCartNotificationProps {
  feedback: ToastFeedback | null;
  isDark?: boolean;
}

export const AddToCartNotification: React.FC<AddToCartNotificationProps> = ({
  feedback,
  isDark = false,
}) => {
  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          key={feedback.id}
          initial={{ opacity: 0, y: -20, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="fixed top-18 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-xl border flex items-center gap-2.5 backdrop-blur-md ${
              isDark
                ? 'bg-[#1C1C1B]/95 text-[#F6EFE4] border-[#DC5D5D]/50 shadow-black/60'
                : 'bg-white/95 text-[#3C3C3B] border-[#DC5D5D]/40 shadow-rose-900/15'
            }`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.05 }}
              className="w-6 h-6 rounded-full bg-[#DC5D5D] text-white flex items-center justify-center shrink-0 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" strokeWidth={2} />
            </motion.div>
            <div className="text-xs font-mono">
              <span className="font-bold text-[#DC5D5D] mr-1.5">+1</span>
              <span className="font-semibold">{feedback.name}</span>
              <span className="text-[10px] opacity-70 ml-1.5">a tu lista de platos</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
