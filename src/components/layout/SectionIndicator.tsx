"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Headings that mark a section in an article body.
const HEADING_SELECTOR = ".article-body h2";
// A section becomes "current" once its heading passes this fraction of the viewport height.
const ACTIVE_LINE = 0.3;

const RING_SIZE = 20;
const RING_STROKE = 2.25;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;

// Soft, slightly damped spring: follows the scroll closely without jitter or overshoot.
const RING_SPRING = { stiffness: 140, damping: 28, mass: 0.4, restDelta: 0.001 };
// Width of the label when the section changes. Animating width (not a layout transform) keeps the
// ring exactly beside the text: transform-based layout animations drift inside a fixed element
// while the page scrolls, which left the ring sitting on top of longer titles.
const WIDTH_SPRING = { type: "spring", stiffness: 420, damping: 38, mass: 0.8 } as const;

// Before the first section (or on pages with no sections) the pill shows the page title,
// and appears once that title has scrolled out of view.
const PAGE_TITLE_SELECTOR = "main h1";

function readActiveTitle(): string | null {
  const headings = Array.from(document.querySelectorAll<HTMLElement>(HEADING_SELECTOR)).filter(
    (heading) => heading.offsetParent !== null && heading.textContent?.trim(),
  );

  // Short final sections can't scroll up to the active line, so the bottom of the page
  // always belongs to the last section (once the reader has reached the first one).
  const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
  const line = window.innerHeight * ACTIVE_LINE;
  let section: string | null = null;

  for (const heading of headings) {
    if (heading.getBoundingClientRect().top > line) break;
    section = heading.textContent!.trim();
  }
  if (section) return atBottom ? headings[headings.length - 1].textContent!.trim() : section;

  const pageTitle = document.querySelector<HTMLElement>(PAGE_TITLE_SELECTOR);
  const titleText = pageTitle?.textContent?.trim();
  const titleScrolledAway = pageTitle ? pageTitle.getBoundingClientRect().bottom < 0 : window.scrollY > 80;
  return titleScrolledAway ? titleText || document.title : null;
}

export default function SectionIndicator() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [title, setTitle] = useState<string | null>(null);
  const [labelWidth, setLabelWidth] = useState<number | null>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  // When the pill first appears, size the label instantly; only animate later section changes.
  // Decided in the same layout effect that measures, so the resize render sees the right value.
  const previousTitle = useRef<string | null>(null);
  const instantResize = useRef(true);
  const animateWidth = !instantResize.current && !reduceMotion;

  // Measure the new title's natural width before paint; the label animates to it
  // (capped by its max-width, where the text truncates with an ellipsis).
  useLayoutEffect(() => {
    instantResize.current = !previousTitle.current;
    previousTitle.current = title;
    const measure = () => {
      if (measureRef.current) setLabelWidth(Math.ceil(measureRef.current.getBoundingClientRect().width));
    };
    measure();
    // Re-measure once web fonts have loaded, since they change the text width.
    document.fonts?.ready.then(measure).catch(() => {});
  }, [title]);

  // The ring shows progress through the whole page, driven straight from scroll position
  // so it never waits on a React render.
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, RING_SPRING);
  const ringProgress = reduceMotion ? scrollYProgress : smoothProgress;

  useEffect(() => {
    // setState bails out when the title is unchanged, so scrolling within a section doesn't re-render.
    const update = () => setTitle(readActiveTitle());

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    // Content can shift after load (images, fonts), which moves the headings.
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      resizeObserver.disconnect();
    };
  }, [pathname]);

  return (
    <div
      aria-hidden
      data-section-indicator
      className="pointer-events-none fixed inset-x-0 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4"
    >
      <AnimatePresence>
        {title && (
          <motion.div
            key="section-indicator"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.94, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.94, filter: "blur(4px)" }}
            transition={reduceMotion ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 32 }}
            className="max-w-full"
          >
            <div className="relative flex max-w-full items-center overflow-hidden rounded-full border border-gray-200 bg-white/85 py-1.5 pl-1.5 pr-2 shadow-lg shadow-black/5 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/85 dark:shadow-black/40">
              <span
                className="h-6 w-6 shrink-0 rounded-full"
                style={{ background: "radial-gradient(circle at 32% 28%, #e0e7ff 0%, #a5b4fc 35%, #475569 100%)" }}
              />
              {/* Invisible copy of the title, used only to measure its natural width. */}
              <span ref={measureRef} className="invisible absolute left-0 top-0 whitespace-nowrap text-sm font-medium">
                {title}
              </span>
              <motion.span
                initial={false}
                animate={{ width: labelWidth ?? "auto" }}
                transition={animateWidth ? WIDTH_SPRING : { duration: 0 }}
                className="relative ml-3 block h-5 min-w-0 max-w-[min(26rem,calc(100vw-8rem))] shrink overflow-hidden"
              >
                <AnimatePresence initial={false}>
                  <motion.span
                    key={title}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(3px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(3px)" }}
                    transition={reduceMotion ? { duration: 0.12 } : { type: "spring", stiffness: 420, damping: 36 }}
                    className="absolute inset-0 block truncate whitespace-nowrap text-sm font-medium leading-5 text-black dark:text-white"
                  >
                    {title}
                  </motion.span>
                </AnimatePresence>
              </motion.span>
              <svg
                width={RING_SIZE}
                height={RING_SIZE}
                viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                className="ml-3 shrink-0 -rotate-90"
              >
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth={RING_STROKE}
                  className="stroke-gray-200 dark:stroke-neutral-700"
                />
                <motion.circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth={RING_STROKE}
                  strokeLinecap="round"
                  style={{ pathLength: ringProgress }}
                  className="stroke-black dark:stroke-white"
                />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
