'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef, type ReactNode } from 'react';

type GlassPanelProps = HTMLMotionProps<'div'> & {
  readonly children: ReactNode;
  readonly strong?: boolean;
  readonly floating?: boolean;
};

/** Floating glass surface used for every overlay in the experience. */
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  function GlassPanel(
    { children, strong = false, floating = true, className = '', ...rest },
    ref,
  ) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 18, filter: 'blur(12px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: 12, filter: 'blur(10px)' }}
        transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.9 }}
        className={[
          'glass-panel relative overflow-hidden',
          strong ? 'glass-panel-strong' : '',
          floating ? 'animate-drift' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        <div className="hairline absolute inset-x-6 top-0 opacity-60" />
        {children}
      </motion.div>
    );
  },
);
