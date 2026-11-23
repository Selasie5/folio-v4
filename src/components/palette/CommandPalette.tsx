"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowTopRightOnSquareIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { OPEN_PALETTE_EVENT, fuzzyMatch, type PaletteEntry } from "./paletteStore";

interface Command extends PaletteEntry {
  run?: () => void | "keep-open";
}

interface Ranked {
  command: Command;
  score: number;
  labelIndices: number[];
}

const GROUP_ORDER = ["Go to", "Actions", "Experience", "Writing", "Side quests"];
const MAX_PER_GROUP = 6;

function isTyping(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return !!element && (element.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName));
}

/** Same switch as ThemeToggle: transitions off for one frame, then a storage event keeps the toggle in sync. */
function switchTheme() {
  const nextDark = !document.documentElement.classList.contains("dark");
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(style);
  document.documentElement.classList.toggle("dark", nextDark);
  const value = nextDark ? "dark" : "light";
  try {
    localStorage.setItem("portfolio-theme", value);
  } catch {
    // Still switches without storage.
  }
  window.dispatchEvent(new StorageEvent("storage", { key: "portfolio-theme", newValue: value }));
  void document.documentElement.offsetHeight;
  style.remove();
}

/** Label with the fuzzy-matched characters underlined. */
function Highlighted({ text, indices }: { text: string; indices: number[] }) {
  if (indices.length === 0) return <>{text}</>;
  const marked = new Set(indices);
  return (
    <>
      {[...text].map((char, index) =>
        marked.has(index) ? (
          <span key={index} className="text-black underline decoration-current decoration-1 underline-offset-[3px] dark:text-white">
            {char}
          </span>
        ) : (
          <Fragment key={index}>{char}</Fragment>
        ),
      )}
    </>
  );
}

export default function CommandPalette({ entries, email, github }: { entries: PaletteEntry[]; email?: string; github?: string }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  const commands = useMemo<Command[]>(() => {
    const actions: Command[] = [
      { id: "action-theme", group: "Actions", label: "Switch light / dark theme", hint: "appearance", run: switchTheme },
    ];
    if (email) {
      actions.push({
        id: "action-copy-email",
        group: "Actions",
        label: "Copy email address",
        hint: email,
        run: () => {
          void navigator.clipboard?.writeText(email).then(() => setCopied(true));
          return "keep-open";
        },
      });
    }
    if (github) actions.push({ id: "action-github", group: "Actions", label: "Open GitHub profile", hint: "github", href: github, external: true });
    actions.push({ id: "action-source", group: "Actions", label: "View this site's source", hint: "github · folio-v4", href: "https://github.com/Selasie5/folio-v4", external: true });
    return [...entries, ...actions];
  }, [entries, email, github]);

  const results = useMemo(() => {
    const ranked: Ranked[] = [];
    for (const command of commands) {
      const label = fuzzyMatch(query, command.label);
      const hint = command.hint ? fuzzyMatch(query, command.hint) : null;
      const group = fuzzyMatch(query, command.group);
      const best = Math.max(label?.score ?? -1, (hint?.score ?? -1) - 1, (group?.score ?? -1) - 2);
      if (best < 0) continue;
      ranked.push({ command, score: best, labelIndices: label && label.score >= best ? label.indices : [] });
    }
    // Keep groups in a fixed order; best matches first inside each.
    const groups = GROUP_ORDER.map((name) => ({
      name,
      items: ranked
        .filter(({ command }) => command.group === name)
        .sort((a, b) => b.score - a.score)
        .slice(0, query ? MAX_PER_GROUP : name === "Go to" || name === "Actions" ? 10 : 3),
    })).filter(({ items }) => items.length > 0);
    return { groups, flat: groups.flatMap(({ items }) => items) };
  }, [commands, query]);

  const close = useCallback(() => {
    setOpen(false);
    setCopied(false);
    // Hand focus back to whatever opened the palette.
    requestAnimationFrame(() => returnFocus.current?.focus?.());
  }, []);

  const show = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setActive(0);
    setCopied(false);
    setOpen(true);
  }, []);

  // ⌘K / Ctrl+K toggle from anywhere; "/" opens when you're not typing.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) close();
        else show();
      } else if (event.key === "/" && !open && !isTyping(event.target) && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, show);
    };
  }, [open, close, show]);

  // Lock the page behind the dialog and focus the input.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);

  // Keep the highlighted option in view while arrowing through a long list.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const runCommand = (command: Command) => {
    if (command.run) {
      if (command.run() === "keep-open") return;
    } else if (command.href) {
      if (command.external) window.open(command.href, "_blank", "noopener,noreferrer");
      else router.push(command.href);
    }
    close();
  };

  const onInputKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const count = results.flat.length;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (count) setActive((index) => (index + 1) % count);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (count) setActive((index) => (index - 1 + count) % count);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(Math.max(0, count - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = results.flat[active];
      if (item) runCommand(item.command);
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (query) setQuery("");
      else close();
    } else if (event.key === "Tab") {
      // The input is the only stop; options are reached with the arrow keys.
      event.preventDefault();
    }
  };

  if (!mounted) return null;

  const optionId = (index: number) => `palette-option-${index}`;
  let flatIndex = -1;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-white/60 backdrop-blur-sm dark:bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.15 }}
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search and commands"
            className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-[#161616]"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            // Springs in, but leaves on a short tween so it is gone (and stops catching clicks) at once.
            exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.12, ease: "easeOut" } }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 38, mass: 0.7 }}
          >
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 dark:border-neutral-800">
              <MagnifyingGlassIcon aria-hidden className="h-4 w-4 shrink-0 text-gray-400 dark:text-neutral-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKey}
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-listbox"
                aria-autocomplete="list"
                aria-activedescendant={results.flat.length ? optionId(active) : undefined}
                placeholder="Search or run a command…"
                spellCheck={false}
                autoComplete="off"
                className="h-14 w-full bg-transparent text-[15px] text-black outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-neutral-500"
              />
              <kbd className="shrink-0 rounded border border-gray-200 px-1.5 font-sans text-[10px] leading-5 text-gray-400 dark:border-neutral-700 dark:text-neutral-500">esc</kbd>
            </div>

            <ul ref={listRef} id="palette-listbox" role="listbox" aria-label="Results" className="max-h-[min(60vh,420px)] overflow-y-auto overscroll-contain p-2">
              {results.groups.map((group) => (
                <li key={group.name} role="presentation" className="pb-1">
                  <p role="presentation" className="px-3 pb-1 pt-2 text-[11px] uppercase tracking-wide text-gray-400 dark:text-neutral-500">
                    {group.name}
                  </p>
                  <ul role="presentation">
                    {group.items.map(({ command, labelIndices }) => {
                      flatIndex += 1;
                      const index = flatIndex;
                      const selected = index === active;
                      const label = command.id === "action-copy-email" && copied ? "Copied to clipboard ✓" : command.label;
                      return (
                        <li
                          key={command.id}
                          id={optionId(index)}
                          data-index={index}
                          role="option"
                          aria-selected={selected}
                          onMouseMove={() => !selected && setActive(index)}
                          onClick={() => runCommand(command)}
                          className={`relative flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm ${
                            selected ? "text-black dark:text-white" : "text-gray-600 dark:text-neutral-300"
                          }`}
                        >
                          {/* One highlight that slides between options instead of blinking on and off. */}
                          {selected && (
                            <motion.span
                              layoutId="palette-highlight"
                              aria-hidden
                              className="absolute inset-0 rounded-lg bg-gray-100 dark:bg-neutral-800"
                              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 700, damping: 45 }}
                            />
                          )}
                          <span className="relative min-w-0 truncate">
                            {label === command.label ? <Highlighted text={label} indices={labelIndices} /> : label}
                          </span>
                          <span className="relative flex shrink-0 items-center gap-1.5 text-xs text-gray-400 dark:text-neutral-500">
                            {command.hint && <span className="hidden max-w-[180px] truncate sm:inline">{command.hint}</span>}
                            {command.external && <ArrowTopRightOnSquareIcon aria-hidden className="h-3.5 w-3.5" />}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
              {results.flat.length === 0 && (
                <li role="presentation" className="px-3 py-10 text-center text-sm text-gray-500 dark:text-neutral-400">
                  Nothing matches “{query}”.
                </li>
              )}
            </ul>

            <div aria-hidden className="flex items-center gap-4 border-t border-gray-100 px-4 py-2.5 text-[11px] text-gray-400 dark:border-neutral-800 dark:text-neutral-500">
              <span><kbd className="font-sans">↑↓</kbd> move</span>
              <span><kbd className="font-sans">↵</kbd> open</span>
              <span><kbd className="font-sans">esc</kbd> close</span>
              <span className="ml-auto hidden sm:inline">Fuzzy search: try “gql” or “theme”</span>
            </div>
            <p className="sr-only" aria-live="polite">
              {open ? `${results.flat.length} results` : ""}
              {copied ? ". Email copied." : ""}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
