'use client';

import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useState, type ReactNode } from 'react';

import { GlowButton } from '@/components/ui/GlowButton';
import { SECRET_COPY } from '@/constants/lore';
import {
  BLACKHOLE_COPY,
  COMMS_COPY,
  GALLERY,
  LIBRARY_COPY,
  ORIGIN_COPY,
  PROJECTS,
} from '@/constants/content';
import { useUniverseStore } from '@/lib/store';
import type { DestinationId, GalleryRecord, ProjectRecord } from '@/types';

const reveal: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(8px)' },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: 0.06 * index, duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  }),
};

function Section({
  children,
  index = 0,
}: {
  readonly children: ReactNode;
  readonly index?: number;
}): JSX.Element {
  return (
    <motion.div variants={reveal} initial="hidden" animate="visible" custom={index}>
      {children}
    </motion.div>
  );
}

function OriginContent(): JSX.Element {
  const toggleMap = useUniverseStore((state) => state.toggleMap);

  return (
    <div className="space-y-6">
      <Section>
        <p className="text-[0.92rem] leading-relaxed text-white/70">
          {ORIGIN_COPY.body}
        </p>
      </Section>
      <Section index={1}>
        <ul className="space-y-2.5">
          {ORIGIN_COPY.hints.map((hint) => (
            <li
              key={hint}
              className="flex gap-3 text-[0.8rem] leading-relaxed text-white/45"
            >
              <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#7AF5FF]" />
              {hint}
            </li>
          ))}
        </ul>
      </Section>
      <Section index={2}>
        <GlowButton onClick={() => toggleMap(true)}>Open galaxy chart</GlowButton>
      </Section>
    </div>
  );
}

function ObservatoryContent(): JSX.Element {
  const [active, setActive] = useState<ProjectRecord | null>(null);
  const [query, setQuery] = useState('');

  const matches = PROJECTS.filter((project) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return (
      project.title.toLowerCase().includes(term) ||
      project.summary.toLowerCase().includes(term) ||
      project.year.includes(term) ||
      project.stack.some((item) => item.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="sr-only">Search the project archive</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the archive"
          className="w-full rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-white placeholder:text-white/25 focus:border-[#7AF5FF]/40 focus:outline-none"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        {matches.map((project, index) => (
          <motion.button
            key={project.id}
            type="button"
            variants={reveal}
            initial="hidden"
            animate="visible"
            custom={index}
            whileHover={{ y: -4, rotateX: 3, rotateY: -3 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
            onClick={() => setActive(project)}
            className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-left transition-colors duration-500 hover:border-[#7AF5FF]/35"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-display text-base text-white">{project.title}</p>
              <span className="font-mono text-[0.58rem] tracking-[0.18em] text-white/35">
                {project.year}
              </span>
            </div>
            <p className="mt-2 text-[0.78rem] leading-relaxed text-white/50">
              {project.summary}
            </p>
          </motion.button>
        ))}
      </div>

      {matches.length === 0 && (
        <p className="py-6 text-center font-mono text-[0.66rem] uppercase tracking-[0.18em] text-white/30">
          No records match that query
        </p>
      )}

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-[#7AF5FF]/25 bg-[#6CF6FF]/[0.05] p-5">
              <p className="text-eyebrow">{active.year} · dossier</p>
              <h3 className="mt-2 font-display text-xl text-white">{active.title}</h3>
              <p className="mt-3 text-[0.85rem] leading-relaxed text-white/65">
                {active.detail}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {active.stack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-white/45"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-[#7AF5FF]"
              >
                Close dossier
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LibraryContent(): JSX.Element {
  return (
    <div className="space-y-6">
      <Section>
        <p className="text-[0.92rem] leading-relaxed text-white/70">
          {LIBRARY_COPY.body}
        </p>
      </Section>
      <Section index={1}>
        <div className="grid grid-cols-2 gap-3">
          {LIBRARY_COPY.facts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"
            >
              <p className="font-mono text-2xl text-[#7AF5FF]">{fact.value}</p>
              <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/35">
                {fact.label}
              </p>
            </div>
          ))}
        </div>
      </Section>
      <Section index={2}>
        <ul className="space-y-3">
          {LIBRARY_COPY.principles.map((principle) => (
            <li
              key={principle}
              className="border-l border-[#7AF5FF]/30 pl-4 text-[0.82rem] leading-relaxed text-white/55"
            >
              {principle}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function GalleryContent(): JSX.Element {
  const [active, setActive] = useState<GalleryRecord | null>(null);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {GALLERY.map((record, index) => (
          <motion.button
            key={record.id}
            type="button"
            variants={reveal}
            initial="hidden"
            animate="visible"
            custom={index}
            whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 1.2 : -1.2 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setActive(record)}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10"
            style={{
              background: `linear-gradient(150deg, ${record.palette[0]}, ${record.palette[1]})`,
            }}
            aria-label={`Open ${record.title}`}
          >
            <span className="absolute inset-0 opacity-40 mix-blend-overlay [background-image:radial-gradient(rgba(255,255,255,0.85)_0.6px,transparent_0.6px)] [background-size:5px_5px]" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050816]/85 to-transparent p-3 text-left">
              <span className="block font-display text-[0.82rem] text-white">
                {record.title}
              </span>
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[65] flex items-center justify-center bg-[#050816]/88 p-6 backdrop-blur-xl"
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 22 }}
              className="w-full max-w-2xl"
            >
              <div
                className="aspect-[16/10] w-full rounded-glass-lg border border-white/12"
                style={{
                  background: `linear-gradient(150deg, ${active.palette[0]}, ${active.palette[1]})`,
                }}
              />
              <p className="mt-4 font-display text-xl text-white">{active.title}</p>
              <p className="mt-1 text-[0.82rem] text-white/50">{active.caption}</p>
              <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/30">
                Click anywhere to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CommsContent(): JSX.Element {
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  return (
    <div className="space-y-6">
      <Section>
        <p className="text-[0.92rem] leading-relaxed text-white/70">{COMMS_COPY.body}</p>
      </Section>

      <Section index={1}>
        <dl className="space-y-2">
          {COMMS_COPY.channels.map((channel) => (
            <div
              key={channel.label}
              className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3"
            >
              <dt className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/35">
                {channel.label}
              </dt>
              <dd className="font-mono text-[0.74rem] text-[#7AF5FF]">
                {channel.value}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section index={2}>
        <label className="block">
          <span className="text-eyebrow">Compose transmission</span>
          <textarea
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setIsSent(false);
            }}
            rows={4}
            placeholder="Your signal…"
            className="scroll-region mt-3 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[0.85rem] leading-relaxed text-white placeholder:text-white/25 focus:border-[#7AF5FF]/40 focus:outline-none"
          />
        </label>
        <div className="mt-4 flex items-center gap-4">
          <GlowButton
            disabled={message.trim().length === 0}
            onClick={() => setIsSent(true)}
          >
            Transmit
          </GlowButton>
          <AnimatePresence>
            {isSent && (
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#FFD76A]"
              >
                Queued locally · nothing sent
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </Section>
    </div>
  );
}

function BlackHoleContent(): JSX.Element {
  return (
    <div className="space-y-6">
      <Section>
        <p className="text-[0.92rem] leading-relaxed text-white/70">
          {BLACKHOLE_COPY.body}
        </p>
      </Section>
      <Section index={1}>
        <ul className="space-y-3">
          {BLACKHOLE_COPY.fragments.map((fragment, index) => (
            <motion.li
              key={fragment}
              animate={{ x: [0, index % 2 === 0 ? 2 : -2, 0] }}
              transition={{
                duration: 5 + index,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="rounded-2xl border border-[#FFD76A]/20 bg-[#FFD76A]/[0.04] p-4 text-[0.82rem] leading-relaxed text-white/60"
            >
              {fragment}
            </motion.li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function SecretContent({
  id,
}: {
  readonly id: 'frost' | 'crystal' | 'quantum';
}): JSX.Element {
  const copy = SECRET_COPY[id];
  return (
    <div className="space-y-6">
      <Section>
        <p className="text-[0.92rem] leading-relaxed text-white/70">{copy.body}</p>
      </Section>
      <Section index={1}>
        <ul className="space-y-3">
          {copy.notes.map((note) => (
            <li
              key={note}
              className="border-l border-[#7AF5FF]/30 pl-4 text-[0.82rem] leading-relaxed text-white/55"
            >
              {note}
            </li>
          ))}
        </ul>
      </Section>
      <Section index={2}>
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#FFD76A]/70">
          Sealed record · unlocked by exploration
        </p>
      </Section>
    </div>
  );
}

const CONTENT: Readonly<Record<DestinationId, () => JSX.Element>> = {
  origin: OriginContent,
  observatory: ObservatoryContent,
  library: LibraryContent,
  gallery: GalleryContent,
  comms: CommsContent,
  blackhole: BlackHoleContent,
  frost: () => <SecretContent id="frost" />,
  crystal: () => <SecretContent id="crystal" />,
  quantum: () => <SecretContent id="quantum" />,
};

export function DestinationContent({ id }: { readonly id: DestinationId }): JSX.Element {
  const Body = CONTENT[id];
  return <Body />;
}
