"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Hidden wireframe mode. The Konami code (↑ ↑ ↓ ↓ ← → ← → B A), or holding the pointer on the
 * avatar for three seconds, strips the site down to its structure: the same components and markup,
 * restyled by one CSS layer keyed on <html data-wireframe> (see globals.css). Nothing re-renders,
 * which is the point: the styling is a layer on top of the structure, not baked into it.
 */

export const TOGGLE_WIREFRAME_EVENT = "wireframe:toggle";
export const toggleWireframe = () => window.dispatchEvent(new Event(TOGGLE_WIREFRAME_EVENT));

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const HOLD_MS = 3000;
const TRIGGER = "[data-wireframe-trigger]";

function isTyping(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return !!element && (element.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName));
}

type ViewTransition = { ready: Promise<void>; finished: Promise<void>; updateCallbackDone: Promise<void> };

// The state the page should end up in. The flip always applies this, not the value it was
// started with, so a cross-fade that runs late can never put back an older state.
let wanted = false;
let fading = false;

const flip = () => {
  if (wanted) document.documentElement.dataset.wireframe = "on";
  else delete document.documentElement.dataset.wireframe;
};

/** Switches the layer, cross-fading with the View Transitions API where the browser has it. */
function applyWireframe(on: boolean, animate: boolean) {
  wanted = on;
  const doc = document as Document & { startViewTransition?: (callback: () => void) => ViewTransition };
  // No API, reduced motion, or a fade still in flight: switch at once.
  if (!animate || !doc.startViewTransition || fading) return flip();
  fading = true;
  const transition = doc.startViewTransition(flip);
  const done = () => {
    fading = false;
  };
  transition.finished.then(done, done);
  // A skipped transition rejects these; the flip above has already handled the state.
  for (const promise of [transition.ready, transition.updateCallbackDone]) promise.catch(() => {});
}

export default function WireframeMode() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [on, setOn] = useState(false);
  const onRef = useRef(false);
  onRef.current = on;

  useEffect(() => setMounted(true), []);

  const set = useCallback(
    (next: boolean) => {
      applyWireframe(next, !reduceMotion);
      setOn(next);
    },
    [reduceMotion],
  );

  // Konami code anywhere (not while typing); Esc leaves.
  useEffect(() => {
    let progress = 0;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
      if (event.key === "Escape" && onRef.current) {
        set(false);
        return;
      }
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === KONAMI[progress]) {
        progress += 1;
        if (progress === KONAMI.length) {
          progress = 0;
          set(!onRef.current);
        }
      } else {
        progress = key === KONAMI[0] ? 1 : 0;
      }
    };
    const onToggle = () => set(!onRef.current);
    window.addEventListener("keydown", onKey);
    window.addEventListener(TOGGLE_WIREFRAME_EVENT, onToggle);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(TOGGLE_WIREFRAME_EVENT, onToggle);
    };
  }, [set]);

  // Hold the pointer on the avatar for three seconds. The trigger fills a ring while charging
  // (CSS, via data-wireframe-charging), and letting go early cancels it.
  useEffect(() => {
    let timer: number | undefined;
    let charging: HTMLElement | null = null;
    const cancel = () => {
      window.clearTimeout(timer);
      if (charging) delete charging.dataset.wireframeCharging;
      charging = null;
    };
    const onEnter = (event: PointerEvent) => {
      const trigger = (event.target as Element | null)?.closest?.<HTMLElement>(TRIGGER);
      if (!trigger || trigger === charging) return;
      cancel();
      charging = trigger;
      trigger.dataset.wireframeCharging = "on";
      timer = window.setTimeout(() => {
        cancel();
        set(!onRef.current);
      }, HOLD_MS);
    };
    const onLeave = (event: PointerEvent) => {
      if (!charging) return;
      const to = event.relatedTarget as Node | null;
      if (to && charging.contains(to)) return;
      cancel();
    };
    // On touch, the "hold" is a press: lifting the finger early cancels it.
    const onUp = (event: PointerEvent) => {
      if (event.pointerType === "touch") cancel();
    };
    document.addEventListener("pointerover", onEnter);
    document.addEventListener("pointerout", onLeave);
    document.addEventListener("pointercancel", cancel);
    document.addEventListener("pointerup", onUp);
    return () => {
      cancel();
      document.removeEventListener("pointerover", onEnter);
      document.removeEventListener("pointerout", onLeave);
      document.removeEventListener("pointercancel", cancel);
      document.removeEventListener("pointerup", onUp);
    };
  }, [set]);

  // Leave the page as we found it if this unmounts.
  useEffect(() => () => applyWireframe(false, false), []);

  if (!mounted) return null;

  return createPortal(
    <>
      <p className="sr-only" aria-live="polite">
        {on ? "Wireframe mode on: the site is showing its structure without its styling. Press Escape to leave." : ""}
      </p>
      <AnimatePresence>
        {on && (
          <div className="pointer-events-none fixed inset-x-0 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-[65] flex justify-center px-4">
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
              className="pointer-events-auto flex items-center gap-3 border border-dashed border-neutral-400 bg-white py-1.5 pl-3 pr-1.5 font-mono text-[11px] text-neutral-700 dark:border-neutral-600 dark:bg-[#111111] dark:text-neutral-300"
            >
              <span>
                wireframe.mode <span className="text-neutral-400 dark:text-neutral-500">= structure − styling</span>
              </span>
              <button
                type="button"
                onClick={() => set(false)}
                className="border border-neutral-300 px-1.5 text-neutral-500 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-white dark:focus-visible:ring-neutral-500"
              >
                esc
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
}
