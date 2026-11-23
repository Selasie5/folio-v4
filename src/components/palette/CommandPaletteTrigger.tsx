"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { openCommandPalette } from "./paletteStore";

/** Header button beside the theme switch. Shows the shortcut for the visitor's platform. */
export default function CommandPaletteTrigger() {
  const [shortcut, setShortcut] = useState("Ctrl K");

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) setShortcut("⌘K");
  }, []);

  return (
    <button
      type="button"
      onClick={openCommandPalette}
      aria-label="Search and commands"
      aria-keyshortcuts="Meta+K Control+K"
      title={`Search and commands (${shortcut})`}
      className="flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-gray-600 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2 active:scale-[0.96] dark:text-neutral-300 dark:hover:text-white dark:focus-visible:ring-offset-[#111111]"
    >
      <MagnifyingGlassIcon aria-hidden className="h-4 w-4" />
      <kbd className="hidden rounded border border-gray-300 px-1 font-sans text-[10px] leading-4 text-gray-500 sm:inline dark:border-neutral-700 dark:text-neutral-400">
        {shortcut}
      </kbd>
    </button>
  );
}
