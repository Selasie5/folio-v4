"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const syncTheme = () => setDark(document.documentElement.classList.contains("dark"));
    syncTheme();
    const syncStorage = (event: StorageEvent) => {
      if (event.key !== "portfolio-theme" && event.key !== null) return;
      document.documentElement.classList.toggle("dark", event.newValue !== "light");
      syncTheme();
    };
    window.addEventListener("storage", syncStorage);
    return () => window.removeEventListener("storage", syncStorage);
  }, []);

  const toggleTheme = () => {
    const nextDark = !document.documentElement.classList.contains("dark");
    const style = document.createElement("style");
    style.textContent = "*,*::before,*::after{transition:none!important}";
    document.head.appendChild(style);
    document.documentElement.classList.toggle("dark", nextDark);
    setDark(nextDark);
    try {
      localStorage.setItem("portfolio-theme", nextDark ? "dark" : "light");
    } catch {
      // The switch still works when browser storage is unavailable.
    }
    void document.documentElement.offsetHeight;
    style.remove();
  };

  return (
    <button
      type="button"
      role="switch"
      data-inspect="theme-toggle"
      aria-label="Dark mode"
      aria-checked={dark}
      onClick={toggleTheme}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-gray-600 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.96] dark:text-neutral-300 dark:hover:text-white dark:focus-visible:ring-offset-[#111111]"
    >
      <SunIcon className="hidden h-4 w-4 dark:block" aria-hidden="true" />
      <MoonIcon className="h-4 w-4 dark:hidden" aria-hidden="true" />
    </button>
  );
}
