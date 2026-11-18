import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

// Small "see more" link with a caret, shown beside a home-page section heading.
export default function MoreLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex shrink-0 items-center gap-0.5 text-xs text-gray-500 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-white"
    >
      {label}
      <ChevronRightIcon aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
    </Link>
  );
}
