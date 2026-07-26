'use client';

import { useEffect, useRef } from 'react';

/**
 * Watches for typed words anywhere in the document without capturing input from
 * real form fields.
 */
export function useTypedCode(
  codes: readonly string[],
  onMatch: (code: string) => void,
): void {
  const buffer = useRef('');
  const handler = useRef(onMatch);
  handler.current = onMatch;

  useEffect(() => {
    const longest = codes.reduce((max, code) => Math.max(max, code.length), 0);

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
      if (event.key.length !== 1) return;

      buffer.current = (buffer.current + event.key.toLowerCase()).slice(-longest);
      const match = codes.find((code) => buffer.current.endsWith(code));
      if (match) {
        buffer.current = '';
        handler.current(match);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [codes]);
}
