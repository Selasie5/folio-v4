import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

// Pill-shaped link with a caret, styled to match the floating section indicator.
export default function PillLink({ href, label, caret }: { href: string; label: string; caret: "left" | "right" }) {
  const Icon = caret === "left" ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <Link
      href={href}
      className={`group inline-flex shrink-0 items-center gap-1 rounded-full border border-gray-200 bg-white py-1 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-black dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:text-white ${
        caret === "left" ? "pl-1.5 pr-3" : "pl-3 pr-1.5"
      }`}
    >
      {caret === "right" && label}
      <Icon
        aria-hidden
        className={`h-4 w-4 transition-transform duration-150 ${caret === "left" ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`}
      />
      {caret === "left" && label}
    </Link>
  );
}
