"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useId, useRef, useState } from "react";
import { PHASES, formatOffset, type EvidenceLine, type IncidentPhase, type IncidentStep } from "@/content/incidents";

const EASE = [0.2, 0, 0, 1] as const;

function Terminal({ lines }: { lines: EvidenceLine[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-800 bg-[#0d0d0d] text-[12px] leading-5 shadow-sm">
      <div aria-hidden className="flex items-center gap-1.5 border-b border-neutral-800 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-neutral-700" />
        <span className="h-2 w-2 rounded-full bg-neutral-700" />
        <span className="h-2 w-2 rounded-full bg-neutral-700" />
      </div>
      <pre className="overflow-x-auto px-3 py-2.5 font-mono">
        {lines.map((line, index) => (
          <div key={index} className={line.kind === "hl" ? "text-white" : line.kind === "cmd" ? "text-neutral-300" : "text-neutral-500"}>
            {line.kind === "cmd" && <span aria-hidden className="select-none text-neutral-600">$ </span>}
            {line.text}
          </div>
        ))}
      </pre>
    </div>
  );
}

function Step({ step, open, onToggle, dimmed }: { step: IncidentStep; open: boolean; onToggle: () => void; dimmed: boolean }) {
  const reduceMotion = useReducedMotion();
  const evidenceId = useId();

  return (
    <li className={`relative pb-10 pl-9 transition-opacity duration-300 last:pb-0 motion-reduce:transition-none ${dimmed ? "opacity-30" : ""}`}>
      {/* The dot lights up as the reader reaches it. */}
      <motion.span
        aria-hidden
        className="absolute left-[3.5px] top-[6px] h-[9px] w-[9px] rounded-full bg-black ring-4 ring-white dark:bg-white dark:ring-[#111111]"
        initial={reduceMotion ? false : { scale: 0.4, opacity: 0.3 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -40% 0px" }}
        transition={{ duration: 0.35, ease: EASE }}
      />

      <div className="flex flex-wrap items-baseline gap-x-2 text-[11px] uppercase leading-5 tracking-wide">
        <span className="font-mono normal-case text-gray-400 dark:text-neutral-500">{formatOffset(step.at)}</span>
        <span className="text-gray-500 dark:text-neutral-400">{PHASES[step.phase].label}</span>
      </div>
      <h3 className="mt-1 text-base leading-6 text-black dark:text-neutral-100 mono">{step.title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-neutral-300">{step.body}</p>

      {step.insight && (
        <p className="mt-3 border-l-2 border-gray-300 pl-3 text-[13px] leading-[22px] text-gray-700 dark:border-neutral-600 dark:text-neutral-200">
          <span className="mr-1.5 text-[10px] uppercase tracking-wide text-gray-400 dark:text-neutral-500">Lesson</span>
          {step.insight}
        </p>
      )}

      {step.evidence && (
        <div className="mt-3">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={evidenceId}
            className="group inline-flex items-center gap-0.5 rounded text-xs text-gray-500 transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-neutral-500 dark:text-neutral-400 dark:hover:text-white"
          >
            <ChevronRightIcon aria-hidden className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-90" : ""}`} />
            {open ? "Hide evidence" : "Show evidence"}
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={evidenceId}
                key="evidence"
                initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="pt-2">
                  <Terminal lines={step.evidence} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </li>
  );
}

/**
 * The incident as a vertical timeline. The rail fills in as you scroll, the legend can
 * spotlight one phase, and every step's evidence (terminal output) folds open.
 */
export default function IncidentTimeline({ steps }: { steps: IncidentStep[] }) {
  const reduceMotion = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 65%", "end 65%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.4, restDelta: 0.001 });
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const [spotlight, setSpotlight] = useState<IncidentPhase | null>(null);

  const phases = (Object.keys(PHASES) as IncidentPhase[]).filter((phase) => steps.some((step) => step.phase === phase));
  const withEvidence = steps.flatMap((step, index) => (step.evidence ? [index] : []));
  const allOpen = withEvidence.every((index) => open.has(index));

  const toggle = (index: number) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Highlight one phase">
          {phases.map((phase) => (
            <button
              key={phase}
              type="button"
              aria-pressed={spotlight === phase}
              onClick={() => setSpotlight((current) => (current === phase ? null : phase))}
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] leading-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-neutral-500 ${
                spotlight === phase
                  ? "border-gray-400 bg-gray-100 text-black dark:border-neutral-500 dark:bg-neutral-800 dark:text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-black dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-white"
              }`}
            >
              {PHASES[phase].label}
            </button>
          ))}
        </div>
        {withEvidence.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen(allOpen ? new Set() : new Set(withEvidence))}
            className="rounded text-xs text-gray-500 underline decoration-dotted underline-offset-4 transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-neutral-500 dark:text-neutral-400 dark:hover:text-white"
          >
            {allOpen ? "Collapse all evidence" : "Expand all evidence"}
          </button>
        )}
      </div>

      <ol ref={listRef} className="relative mt-8">
        {/* The rail, and its fill tracking how far the reader has got. */}
        <span aria-hidden className="absolute bottom-2 left-2 top-2 w-px bg-gray-200 dark:bg-neutral-800" />
        <motion.span
          aria-hidden
          className="absolute bottom-2 left-2 top-2 w-px origin-top bg-gray-500 dark:bg-neutral-400"
          style={{ scaleY: reduceMotion ? 1 : smooth }}
        />
        {steps.map((step, index) => (
          <Step
            key={`${step.at}-${step.title}`}
            step={step}
            open={open.has(index)}
            onToggle={() => toggle(index)}
            dimmed={spotlight !== null && spotlight !== step.phase}
          />
        ))}
      </ol>
    </div>
  );
}
