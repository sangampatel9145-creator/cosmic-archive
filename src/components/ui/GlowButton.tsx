'use client';

import { motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';

import { audioEngine } from '@/services/audio';

interface GlowButtonProps {
  readonly children: ReactNode;
  readonly onClick?: () => void;
  readonly variant?: 'primary' | 'ghost';
  readonly ariaLabel?: string;
  readonly disabled?: boolean;
  readonly className?: string;
}

/**
 * Buttons compress on press and release with an energy ripple. No default
 * browser styling is used anywhere in the experience.
 */
export function GlowButton({
  children,
  onClick,
  variant = 'primary',
  ariaLabel,
  disabled = false,
  className = '',
}: GlowButtonProps): JSX.Element {
  const [rippleKey, setRippleKey] = useState(0);

  const handleClick = (): void => {
    if (disabled) return;
    setRippleKey((key) => key + 1);
    audioEngine.resume();
    audioEngine.play('select');
    onClick?.();
  };

  const palette =
    variant === 'primary'
      ? 'border-[#6CF6FF]/35 text-white'
      : 'border-white/12 text-white/75';

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      onHoverStart={() => {
        if (!disabled) audioEngine.play('hover');
      }}
      whileHover={disabled ? undefined : { scale: 1.035 }}
      whileTap={disabled ? undefined : { scale: 0.965 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={[
        'group relative isolate overflow-hidden rounded-full border px-7 py-3',
        'font-mono text-[0.72rem] uppercase tracking-[0.28em]',
        'backdrop-blur-md transition-colors duration-500',
        'disabled:cursor-not-allowed disabled:opacity-40',
        palette,
        className,
      ].join(' ')}
      style={{
        background:
          variant === 'primary'
            ? 'linear-gradient(120deg, rgba(109,93,246,0.28), rgba(108,246,255,0.14))'
            : 'rgba(255,255,255,0.03)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(circle at 50% 120%, rgba(108,246,255,0.5), transparent 65%)',
        }}
      />
      {rippleKey > 0 && (
        <motion.span
          key={rippleKey}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'rgba(108,246,255,0.55)' }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 34, opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
      {children}
    </motion.button>
  );
}
