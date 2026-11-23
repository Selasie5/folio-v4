"use client";

import { AnimatePresence, motion, useReducedMotion, type Transition } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { INSPECT_NOTES, sourceUrl } from "./inspectNotes";
import { setInspectActive, toggleInspect, useInspectActive } from "./inspectStore";

const ANNOTATED = "[data-inspect]";
// The overlay's own UI: never inspected, never intercepted.
const OVERLAY_UI = "[data-inspect-ui]";
const CARD_WIDTH = 320;
const GAP = 10;

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Measured {
  border: Box;
  margin: Box;
  content: Box;
  tokens: { label: string; value: string }[];
}

function isTyping(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return !!element && (element.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName));
}

/** "rgb(23, 23, 23)" → "#171717"; keeps alpha as a percentage when it isn't opaque. */
function toHex(color: string) {
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) return color;
  const [r, g, b, a = "1"] = match[1].split(/[\s,/]+/).filter(Boolean);
  const hex = `#${[r, g, b].map((channel) => Number(channel).toString(16).padStart(2, "0")).join("")}`;
  return Number(a) < 1 ? `${hex} · ${Math.round(Number(a) * 100)}%` : hex;
}

/** Four px sides → CSS-style shorthand: "16", "16 0" or "8 0 16 0". */
function sides(top: string, right: string, bottom: string, left: string) {
  const [t, r, b, l] = [top, right, bottom, left].map((value) => String(Math.round(parseFloat(value) || 0)));
  if (t === r && r === b && b === l) return t;
  if (t === b && r === l) return `${t} ${r}`;
  return `${t} ${r} ${b} ${l}`;
}

function measure(element: HTMLElement): Measured {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  const px = (value: string) => parseFloat(value) || 0;

  const border = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
  const margin = {
    top: rect.top - px(style.marginTop),
    left: rect.left - px(style.marginLeft),
    width: rect.width + px(style.marginLeft) + px(style.marginRight),
    height: rect.height + px(style.marginTop) + px(style.marginBottom),
  };
  const insetTop = px(style.paddingTop) + px(style.borderTopWidth);
  const insetLeft = px(style.paddingLeft) + px(style.borderLeftWidth);
  const content = {
    top: rect.top + insetTop,
    left: rect.left + insetLeft,
    width: Math.max(0, rect.width - insetLeft - px(style.paddingRight) - px(style.borderRightWidth)),
    height: Math.max(0, rect.height - insetTop - px(style.paddingBottom) - px(style.borderBottomWidth)),
  };

  const family = style.fontFamily.split(",")[0].replace(/["']/g, "").trim();
  const tokens = [
    { label: "Type", value: `${family} · ${Math.round(px(style.fontSize))}/${style.lineHeight === "normal" ? "normal" : Math.round(px(style.lineHeight))} · ${style.fontWeight}` },
    { label: "Colour", value: toHex(style.color) },
    { label: "Size", value: `${Math.round(rect.width)} × ${Math.round(rect.height)}` },
    { label: "Padding", value: sides(style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft) },
    { label: "Margin", value: sides(style.marginTop, style.marginRight, style.marginBottom, style.marginLeft) },
  ];
  if (/flex|grid/.test(style.display) && style.gap !== "normal") tokens.push({ label: "Gap", value: style.gap.replace(/px/g, "") });
  if (px(style.borderTopLeftRadius) > 0) tokens.push({ label: "Radius", value: px(style.borderTopLeftRadius) >= 9999 ? "full" : style.borderRadius.replace(/px/g, "") });
  const duration = style.transitionDuration.split(",")[0].trim();
  if (duration && duration !== "0s") {
    const property = style.transitionProperty.split(",")[0].trim();
    const ms = Math.round(parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000));
    tokens.push({ label: "Motion", value: `${property} ${ms}ms ${style.transitionTimingFunction.split(",")[0].trim()}` });
  }
  return { border, margin, content, tokens };
}

/** Puts the card below the element, else above, else pinned inside the viewport. */
function placeCard(border: Box, cardHeight: number) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(CARD_WIDTH, viewportWidth - GAP * 2);
  const left = Math.min(Math.max(GAP, border.left), viewportWidth - width - GAP);
  const below = border.top + border.height + GAP;
  const above = border.top - GAP - cardHeight;
  let top = below;
  if (below + cardHeight > viewportHeight - GAP) top = above >= GAP ? above : Math.max(GAP, viewportHeight - cardHeight - GAP);
  return { top, left, width };
}

export default function InspectMode() {
  const active = useInspectActive();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [pinned, setPinned] = useState(false);
  const [measured, setMeasured] = useState<Measured | null>(null);
  const [cardHeight, setCardHeight] = useState(220);
  const cardRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(false);
  pinnedRef.current = pinned;

  useEffect(() => setMounted(true), []);

  const exit = useCallback(() => {
    setInspectActive(false);
    setTarget(null);
    setPinned(false);
  }, []);

  // `I` toggles from anywhere (except while typing); Esc unpins, then exits.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
      if (event.key === "i" || event.key === "I") {
        event.preventDefault();
        if (document.documentElement.dataset.inspecting) exit();
        else toggleInspect();
      } else if (event.key === "Escape" && document.documentElement.dataset.inspecting) {
        if (pinnedRef.current) setPinned(false);
        else exit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exit]);

  // While inspecting: hover or focus picks an element; a click pins it instead of following links.
  useEffect(() => {
    if (!active) return;
    const pick = (node: EventTarget | null) => {
      const element = node instanceof Element ? node : null;
      if (!element || element.closest(OVERLAY_UI)) return null;
      return element.closest<HTMLElement>(ANNOTATED);
    };
    const onMove = (event: PointerEvent) => {
      if (pinnedRef.current || event.pointerType === "touch") return;
      const next = pick(event.target);
      if (next) setTarget(next);
    };
    const onFocus = (event: FocusEvent) => {
      if (pinnedRef.current) return;
      const next = pick(event.target);
      if (next) setTarget(next);
    };
    const onClick = (event: MouseEvent) => {
      const element = event.target instanceof Element ? event.target : null;
      if (!element || element.closest(OVERLAY_UI)) return;
      const next = pick(element);
      // The footer toggle keeps working as a toggle.
      if (next?.dataset.inspect === "inspect-toggle" && !pinnedRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      if (next) {
        setTarget(next);
        setPinned(true);
      } else {
        setPinned(false);
      }
    };
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("focusin", onFocus, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("focusin", onFocus, true);
      document.removeEventListener("click", onClick, true);
    };
  }, [active]);

  // Keep the boxes glued to the element through scrolling, resizing and theme changes.
  useEffect(() => {
    if (!active || !target) {
      setMeasured(null);
      return;
    }
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setMeasured(target.isConnected ? measure(target) : null));
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, [active, target]);

  useLayoutEffect(() => {
    if (cardRef.current) setCardHeight(cardRef.current.offsetHeight);
  }, [measured, target]);

  if (!mounted) return null;

  const note = target ? INSPECT_NOTES[target.dataset.inspect ?? ""] : undefined;
  const card = measured ? placeCard(measured.border, cardHeight) : null;
  const fade: Transition = reduceMotion ? { duration: 0 } : { duration: 0.16, ease: [0.2, 0, 0, 1] };

  return createPortal(
    <div data-inspect-ui>
      <p className="sr-only" aria-live="polite">
        {active ? "Inspect mode on. Hover or tab to a highlighted element, click to pin it, press Escape to leave." : ""}
      </p>

      <AnimatePresence>
        {active && (
          // Centred by a static wrapper: Framer Motion owns the banner's transform for the slide.
          <div key="banner" className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={fade}
            className="pointer-events-auto flex items-center gap-3 rounded-full border border-gray-300 bg-white/90 py-1.5 pl-3 pr-1.5 text-xs text-gray-700 shadow-sm backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-300"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-black motion-reduce:animate-none dark:bg-white" />
              Inspect mode
              <span className="hidden text-gray-400 dark:text-neutral-500 sm:inline">· hover, tab or click a highlight</span>
            </span>
            <button
              type="button"
              onClick={exit}
              className="rounded-full px-2 py-0.5 text-gray-500 hover:bg-gray-100 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-neutral-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              Esc
            </button>
          </motion.div>
          </div>
        )}
      </AnimatePresence>

      {active && measured && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[55]">
          <div className="absolute bg-neutral-500/10" style={measured.margin} />
          <div className="absolute bg-neutral-500/10 ring-1 ring-black dark:ring-white" style={measured.border} />
          <div className="absolute bg-neutral-500/15" style={measured.content} />
        </div>
      )}

      <AnimatePresence>
        {active && measured && note && card && (
          <motion.div
            key="card"
            ref={cardRef}
            role="dialog"
            aria-label={`${note.name} design notes`}
            initial={{ opacity: 0, y: 4, top: card.top, left: card.left }}
            animate={{ opacity: 1, y: 0, top: card.top, left: card.left }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { opacity: fade, y: fade, top: { type: "spring", stiffness: 500, damping: 40 }, left: { type: "spring", stiffness: 500, damping: 40 } }}
            style={{ width: card.width }}
            className="fixed z-[61] rounded-xl border border-gray-200 bg-white/95 p-4 text-left shadow-lg backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="mono text-base text-black dark:text-white">
                <span className="text-gray-400 dark:text-neutral-500">&lt;</span>
                {note.name}
                <span className="text-gray-400 dark:text-neutral-500"> /&gt;</span>
              </p>
              {pinned && <span className="text-[10px] uppercase tracking-wide text-black dark:text-white">Pinned</span>}
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-600 dark:text-neutral-300">{note.note}</p>
            <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 border-t border-dotted border-gray-300 pt-3 text-[11px] leading-4 dark:border-neutral-700">
              {measured.tokens.map(({ label, value }) => (
                <div key={label} className="contents">
                  <dt className="text-gray-400 dark:text-neutral-500">{label}</dt>
                  <dd className="flex min-w-0 items-center gap-1.5 truncate font-mono text-gray-800 dark:text-neutral-200">
                    {label === "Colour" && (
                      <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-sm border border-gray-300 dark:border-neutral-600" style={{ background: value.split(" ")[0] }} />
                    )}
                    <span className="truncate">{value}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex items-center justify-between gap-3 text-[11px] leading-4">
              <a
                href={sourceUrl(note.file)}
                target="_blank"
                rel="noopener noreferrer"
                className="bio-text-link truncate text-gray-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
              >
                {note.file.replace("src/components/", "")} ↗
              </a>
              <span className="shrink-0 text-gray-400 dark:text-neutral-500">{pinned ? "Esc to unpin" : "Click to pin"}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
