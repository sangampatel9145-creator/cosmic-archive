'use client';

import { GlassPanel } from '@/components/ui/GlassPanel';
import { ORIGIN_COPY, PROJECTS } from '@/constants/content';
import { DESTINATIONS } from '@/constants/destinations';

/**
 * Shown when WebGL is unavailable. The archive still reads as a document, so
 * no visitor ever hits a dead end.
 */
export function WebGLFallback(): JSX.Element {
  return (
    <main className="scroll-region relative z-10 mx-auto h-full max-w-2xl px-6 py-16">
      <p className="text-eyebrow">Signal degraded</p>
      <h1 className="mt-3 font-display text-4xl text-white">Cosmic Archive</h1>
      <p className="mt-4 text-[0.92rem] leading-relaxed text-white/60">
        Your browser could not open a 3D context, so the universe is unavailable.
        Everything it contains is written out below.
      </p>

      <GlassPanel floating={false} className="mt-9 p-6">
        <p className="text-[0.9rem] leading-relaxed text-white/70">{ORIGIN_COPY.body}</p>
      </GlassPanel>

      <section className="mt-10">
        <p className="text-eyebrow">Destinations</p>
        <ul className="mt-4 space-y-3">
          {DESTINATIONS.filter((d) => !d.hidden).map((destination) => (
            <li key={destination.id} className="border-l border-white/10 pl-4">
              <p className="font-display text-lg text-white">{destination.name}</p>
              <p className="mt-1 text-[0.82rem] text-white/50">{destination.tagline}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 pb-10">
        <p className="text-eyebrow">Work</p>
        <ul className="mt-4 space-y-3">
          {PROJECTS.map((project) => (
            <li key={project.id} className="border-l border-white/10 pl-4">
              <p className="font-display text-lg text-white">{project.title}</p>
              <p className="mt-1 text-[0.82rem] text-white/50">{project.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
