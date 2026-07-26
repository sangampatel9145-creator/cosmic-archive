'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useEffect } from 'react';

import { TIMING } from '@/constants/theme';
import { useUniverseStore } from '@/lib/store';

/** Discoveries are announced quietly and dismiss themselves. */
export function DiscoveryToast(): JSX.Element {
  const toast = useUniverseStore((state) => state.toast);
  const dismissToast = useUniverseStore((state) => state.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(dismissToast, TIMING.toastMs);
    return () => window.clearTimeout(timer);
  }, [toast, dismissToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel pointer-events-auto flex max-w-xs items-start gap-3 p-4"
        >
          <Sparkles size={15} className="mt-0.5 shrink-0 text-[#FFD76A]" />
          <div>
            <p className="text-eyebrow text-[#FFD76A]/75">Discovery logged</p>
            <p className="mt-1.5 font-display text-sm text-white">{toast.title}</p>
            <p className="mt-1 text-[0.76rem] leading-relaxed text-white/45">
              {toast.description}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
