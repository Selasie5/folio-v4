"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import SideQuestStory from "@/components/core/SideQuestStory";
import UnlockModal from "@/components/core/UnlockModal";
import type { SideQuestSection } from "@/content/sidequests";

// Placeholder shapes for the locked preview. Deliberately NOT the real story blurred:
// CSS blur is only visual, so real text would still be readable in the page source.
const PLACEHOLDER = [
  { type: "p", lines: [100, 96, 98, 72] },
  { type: "h", width: 46 },
  { type: "p", lines: [97, 100, 94, 99, 58] },
  { type: "p", lines: [99, 92, 81] },
  { type: "h", width: 38 },
  { type: "p", lines: [100, 95, 98, 66] },
] as const;

function LockedPreview() {
  return (
    <div aria-hidden className="pointer-events-none select-none space-y-6 blur-[6px]">
      {PLACEHOLDER.map((block, index) =>
        block.type === "h" ? (
          <div key={index} className="h-5 rounded bg-gray-300 dark:bg-neutral-700" style={{ width: `${block.width}%` }} />
        ) : (
          <div key={index} className="space-y-2.5">
            {block.lines.map((width, line) => (
              <div key={line} className="h-3 rounded bg-gray-200 dark:bg-neutral-800" style={{ width: `${width}%` }} />
            ))}
          </div>
        ),
      )}
    </div>
  );
}

interface ConfidentialStoryProps {
  slug: string;
  name: string;
  contactHref: string;
}

export default function ConfidentialStory({ slug, name, contactHref }: ConfidentialStoryProps) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  // The unlocked story lives only in memory, so leaving or reloading the page locks it again.
  const [story, setStory] = useState<{ intro: string[]; sections: SideQuestSection[] } | null>(null);
  // Each submitted code belongs to the page session it was sent in. Re-locking starts a new session,
  // so a result (or a delayed reveal) from before can never show the story without a new code.
  const session = useRef(0);

  // Browsers can keep a page in the back/forward cache and restore it as it was; re-lock on the
  // way out and again if it's restored, so Back never shows an unlocked story.
  useEffect(() => {
    const relock = () => {
      session.current += 1;
      setOpen(false);
      setStory(null);
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) relock();
    };
    window.addEventListener("pagehide", relock);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("pagehide", relock);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {story ? (
          <motion.div
            key="story"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(8px)", y: 6 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="-mt-8"
          >
            <SideQuestStory intro={story.intro} sections={story.sections} />
          </motion.div>
        ) : (
          <motion.div
            key="locked"
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(12px)" }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-xl"
            // Unambiguous marker that the page is serving the locked state (checked by seed-confidential --site).
            data-confidential-locked=""
          >
            <LockedPreview />
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/30 via-white/60 to-white/90 dark:from-[#111111]/30 dark:via-[#111111]/60 dark:to-[#111111]/90">
              <div className="flex flex-col items-center gap-3 px-6 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <LockClosedIcon aria-hidden className="h-4 w-4 text-gray-700 dark:text-neutral-200" />
                </span>
                <p className="text-sm font-medium text-black dark:text-white">This story is confidential</p>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white shadow-sm transition-opacity hover:opacity-85 dark:bg-white dark:text-black"
                >
                  Unlock
                </button>
                <a href={contactHref} className="text-xs text-gray-500 underline-offset-4 hover:underline dark:text-neutral-400">
                  Don’t have a code? Ask me
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <UnlockModal
        open={open}
        slug={slug}
        name={name}
        onClose={() => setOpen(false)}
        getSession={() => session.current}
        onUnlocked={(content, sentInSession) => {
          // Ignore results from a code sent before the page was re-locked.
          if (sentInSession !== session.current) return;
          setOpen(false);
          setStory(content);
        }}
      />
    </div>
  );
}
