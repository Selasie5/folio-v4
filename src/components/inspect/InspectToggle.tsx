"use client";

import { toggleInspect, useInspectActive } from "./inspectStore";

/** Footer switch for Inspect mode. The `I` key does the same from anywhere on the page. */
export default function InspectToggle() {
  const active = useInspectActive();

  return (
    <button
      type="button"
      data-inspect="inspect-toggle"
      aria-pressed={active}
      onClick={toggleInspect}
      title={active ? "Leave Inspect mode (I)" : "See how this site is built (I)"}
      className="group inline-flex items-center gap-2 rounded-full px-2 py-1 text-[11px] uppercase leading-5 tracking-wide text-gray-800 transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-neutral-500 dark:text-neutral-400 dark:hover:text-white"
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full transition-colors ${active ? "bg-black dark:bg-white" : "bg-gray-400 dark:bg-neutral-600"}`}
      />
      {active ? "Inspecting" : "Inspect"}
      <kbd className="rounded border border-gray-300 px-1 font-sans text-[10px] leading-4 text-gray-500 dark:border-neutral-700 dark:text-neutral-500">
        I
      </kbd>
    </button>
  );
}
