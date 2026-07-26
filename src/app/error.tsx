'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}): JSX.Element {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-[100dvh] w-full flex-col items-center justify-center px-6 text-center">
      <p className="text-eyebrow">Systems fault</p>
      <h1 className="mt-4 font-display text-5xl tracking-[0.08em] text-white sm:text-6xl">
        Drift Detected
      </h1>
      <p className="mt-5 max-w-md text-[0.9rem] leading-relaxed text-white/50">
        Something in the engine stopped responding. Restarting the scene usually
        recovers it without losing your log.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-10 rounded-full border border-[#6CF6FF]/35 px-7 py-3 font-mono text-[0.68rem] uppercase tracking-[0.28em] text-white transition-colors duration-500 hover:border-[#6CF6FF]/70"
      >
        Restart engines
      </button>
    </main>
  );
}
