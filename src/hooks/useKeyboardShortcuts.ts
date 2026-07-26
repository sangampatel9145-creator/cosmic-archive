'use client';

import { useEffect } from 'react';

export type ShortcutMap = Readonly<Record<string, () => void>>;

/** Binds single-key shortcuts, ignoring keystrokes aimed at form controls. */
export function useKeyboardShortcuts(shortcuts: ShortcutMap): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const action = shortcuts[event.key.toLowerCase()];
      if (action) {
        event.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shortcuts]);
}
