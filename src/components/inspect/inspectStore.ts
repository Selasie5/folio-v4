import { useSyncExternalStore } from "react";

// Whether Inspect mode is on, shared by the footer toggle, the keyboard shortcut and the overlay.
// Mirrored onto <html data-inspecting> so CSS can outline the annotated elements.
let active = false;
const listeners = new Set<() => void>();

export function setInspectActive(next: boolean) {
  if (next === active) return;
  active = next;
  if (next) document.documentElement.dataset.inspecting = "on";
  else delete document.documentElement.dataset.inspecting;
  listeners.forEach((listener) => listener());
}

export const toggleInspect = () => setInspectActive(!active);

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const useInspectActive = () =>
  useSyncExternalStore(
    subscribe,
    () => active,
    () => false,
  );
