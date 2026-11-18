"use client";

import { useCallback, useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { unlockSideQuest } from "@/app/sidequests/[slug]/actions";
import type { SideQuestSection } from "@/content/sidequests";

const CODE_LENGTH = 8;
const GROUP = 4;
const EMPTY = Array<string>(CODE_LENGTH).fill("");
const clean = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "");

type Phase = "entering" | "checking" | "success";

interface UnlockModalProps {
  open: boolean;
  slug: string;
  name: string;
  onClose: () => void;
  onUnlocked: (content: { intro: string[]; sections: SideQuestSection[] }) => void;
}

function LockIcon({ unlocked, reduceMotion }: { unlocked: boolean; reduceMotion: boolean | null }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      {/* The shackle lifts and swings open around its right leg. */}
      <motion.path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        style={{ transformBox: "fill-box", originX: 1, originY: 1 }}
        initial={false}
        animate={unlocked && !reduceMotion ? { y: -3, rotate: -38 } : { y: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
      />
      <rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor" fillOpacity={0.12} />
      <circle cx="12" cy="16" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 animate-spin" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity={0.2} strokeWidth={2.5} />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

export default function UnlockModal({ open, slug, name, onClose, onUnlocked }: UnlockModalProps) {
  const reduceMotion = useReducedMotion();
  const [chars, setChars] = useState<string[]>(EMPTY);
  const [phase, setPhase] = useState<Phase>("entering");
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const shake = useAnimationControls();
  const busy = phase !== "entering";

  const focusBox = (index: number) => inputs.current[Math.max(0, Math.min(CODE_LENGTH - 1, index))]?.focus();

  // Reset whenever the modal opens; focus the first box.
  useEffect(() => {
    if (!open) return;
    setChars(EMPTY);
    setPhase("entering");
    setError(null);
    const timer = setTimeout(() => focusBox(0), 60);
    return () => clearTimeout(timer);
  }, [open]);

  // Return focus to whatever opened the modal (the Unlock button) when it closes.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    return () => opener?.focus?.();
  }, [open]);

  // Escape closes (unless a check is in flight); Tab stays inside the dialog; lock page scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled])"),
      );
      // While the code is being checked everything is disabled: keep focus on the dialog itself.
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const inside = dialogRef.current.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !inside)) {
        event.preventDefault();
        first.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, busy, onClose]);

  const submit = useCallback(
    async (code: string) => {
      setPhase("checking");
      setError(null);
      const result = await unlockSideQuest(slug, code).catch(() => ({ ok: false as const, error: "Something went wrong. Try again." }));
      if (result.ok) {
        setPhase("success");
        // Let the lock swing open before the modal leaves.
        setTimeout(() => onUnlocked({ intro: result.intro, sections: result.sections }), reduceMotion ? 150 : 750);
        return;
      }
      setPhase("entering");
      setError(result.error);
      setChars(EMPTY);
      if (!reduceMotion) void shake.start({ x: [0, -10, 10, -7, 7, -3, 0], transition: { duration: 0.45 } });
      setTimeout(() => focusBox(0), 30);
    },
    [slug, onUnlocked, reduceMotion, shake],
  );

  const update = (next: string[]) => {
    setChars(next);
    if (error) setError(null);
    if (next.every(Boolean)) void submit(next.join(""));
  };

  const fillFrom = (start: number, text: string) => {
    const incoming = clean(text).split("");
    if (!incoming.length) return;
    const next = [...chars];
    incoming.slice(0, CODE_LENGTH - start).forEach((char, offset) => (next[start + offset] = char));
    update(next);
    focusBox(Math.min(start + incoming.length, CODE_LENGTH - 1));
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...chars];
      if (next[index]) next[index] = "";
      else if (index > 0) {
        next[index - 1] = "";
        focusBox(index - 1);
      }
      setChars(next);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const onPaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    fillFrom(index, event.clipboardData.getData("text"));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="unlock-modal"
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !busy && onClose()} aria-hidden />

          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="unlock-title"
            aria-describedby="unlock-description"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative w-full max-w-sm rounded-2xl border outline-none border-gray-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Close"
              className="absolute right-3 top-3 rounded-full p-1 text-gray-400 transition-colors hover:text-black disabled:opacity-40 dark:text-neutral-500 dark:hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={phase === "success" ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={{ duration: 0.45 }}
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-300 ${
                  phase === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300"
                    : "border-gray-200 bg-gray-50 text-gray-700 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-200"
                }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={phase === "checking" ? "spinner" : "lock"}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {phase === "checking" ? <Spinner /> : <LockIcon unlocked={phase === "success"} reduceMotion={reduceMotion} />}
                  </motion.span>
                </AnimatePresence>
              </motion.div>

              <h2 id="unlock-title" className="mt-4 text-base font-medium text-black dark:text-white">
                {phase === "success" ? "Unlocked" : `Unlock ${name}`}
              </h2>
              <p id="unlock-description" className="mt-1 text-xs leading-5 text-gray-500 dark:text-neutral-400">
                {phase === "checking" ? "Checking your code…" : phase === "success" ? "Opening the story…" : "Enter the 8-character access code you were given."}
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (chars.every(Boolean) && !busy) void submit(chars.join(""));
              }}
            >
              <motion.div animate={shake} className="mt-6 flex items-center justify-center gap-1.5">
                {chars.map((char, index) => (
                  <span key={index} className="flex items-center gap-1.5">
                    {index === GROUP && <span aria-hidden className="mx-0.5 h-px w-2.5 bg-gray-300 dark:bg-neutral-600" />}
                    <input
                      ref={(element) => {
                        inputs.current[index] = element;
                      }}
                      value={char}
                      disabled={busy}
                      inputMode="text"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      autoCapitalize="characters"
                      spellCheck={false}
                      maxLength={CODE_LENGTH}
                      aria-label={`Character ${index + 1} of ${CODE_LENGTH}`}
                      aria-invalid={Boolean(error)}
                      onChange={(event) => {
                        const value = event.target.value;
                        // Mobile keyboards often report Backspace as an emptied value rather than a key.
                        if (!value) {
                          const next = [...chars];
                          next[index] = "";
                          setChars(next);
                          return;
                        }
                        // Typing over a filled box replaces it; a pasted or autofilled code fills onward.
                        fillFrom(index, char && value.startsWith(char) && value.length > 1 ? value.slice(1) : value);
                      }}
                      onKeyDown={(event) => onKeyDown(index, event)}
                      onPaste={(event) => onPaste(index, event)}
                      onFocus={(event) => event.target.select()}
                      className={`h-11 w-9 rounded-lg border bg-white text-center text-base font-medium uppercase text-black outline-none transition-colors focus:border-black disabled:opacity-60 dark:bg-neutral-950 dark:text-white dark:focus:border-white ${
                        error ? "border-red-300 dark:border-red-500/50" : phase === "success" ? "border-emerald-300 dark:border-emerald-400/40" : "border-gray-200 dark:border-neutral-700"
                      }`}
                    />
                  </span>
                ))}
              </motion.div>

              <p role="alert" className="mt-3 min-h-5 text-center text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
