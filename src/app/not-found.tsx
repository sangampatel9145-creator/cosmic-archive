import Link from 'next/link';

export default function NotFound(): JSX.Element {
  return (
    <main className="flex h-[100dvh] w-full flex-col items-center justify-center px-6 text-center">
      <p className="text-eyebrow">Transmission ended</p>
      <h1 className="mt-4 font-display text-5xl tracking-[0.08em] text-white sm:text-6xl">
        Signal Lost
      </h1>
      <p className="mt-5 max-w-md text-[0.9rem] leading-relaxed text-white/50">
        There is nothing at these coordinates. The chart may have been redrawn
        since you last flew this route.
      </p>
      <Link
        href="/"
        className="mt-10 rounded-full border border-[#6CF6FF]/35 px-7 py-3 font-mono text-[0.68rem] uppercase tracking-[0.28em] text-white transition-colors duration-500 hover:border-[#6CF6FF]/70"
      >
        Return to the archive
      </Link>
    </main>
  );
}
