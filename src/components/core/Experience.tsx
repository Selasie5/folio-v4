import Link from "next/link";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { experienceSlug } from "@/content/experience";
import type { ExperienceContent } from "@/content/types";

interface ExperienceProps {
  experiences?: ExperienceContent[];
  /** The full list, so slugs stay the same when only a preview is shown. Defaults to `experiences`. */
  all?: ExperienceContent[];
}

export default function Experience({ experiences = [], all }: ExperienceProps) {
  const items = experiences ?? [];
  const fullList = all ?? items;

  return (
    <ul data-inspect="experience-list" className="focus-list w-full divide-y divide-dotted divide-gray-300 border-y border-dotted border-gray-300 dark:divide-neutral-700 dark:border-neutral-700">
      {items.map((experience, index) =>
        experience.confidential ? (
          <li key={`confidential-${index}`}>
            <ConfidentialRow />
          </li>
        ) : (
          <li key={`${experience.company}-${experience.role}-${index}`}>
            <Link
              href={`/experience/${experienceSlug(experience, fullList)}`}
              className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6"
            >
              <div className="min-w-0">
                <h3 className="text-sm leading-5 text-black dark:text-white">{experience.role}</h3>
                <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-neutral-400">{experience.company}</p>
              </div>
              <p className="text-xs leading-5 text-gray-500 dark:text-neutral-400 sm:text-right">{experience.period}</p>
            </Link>
          </li>
        ),
      )}
    </ul>
  );
}

/**
 * A role that exists but can't be named. The blurred text is fixed placeholder copy, never the
 * real details (those are stripped before they reach the page): CSS blur is only visual and
 * anything under it could be read from the page source.
 */
function ConfidentialRow() {
  return (
    <div data-inspect="confidential-role" className="relative py-4">
      <span className="sr-only">Confidential role</span>
      <div
        aria-hidden
        className="pointer-events-none grid select-none gap-2 blur-[5px] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6"
      >
        <div className="min-w-0">
          <p className="text-sm leading-5 text-black dark:text-white">Senior Engineering Role</p>
          <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-neutral-400">Company Name Withheld</p>
        </div>
        <p className="text-xs leading-5 text-gray-500 dark:text-neutral-400 sm:text-right">Month 20XX – Present</p>
      </div>
      <span
        aria-hidden
        className="absolute left-0 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-full border border-gray-200 bg-white/85 px-2.5 py-1 text-xs text-gray-600 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/85 dark:text-neutral-300"
      >
        <LockClosedIcon className="h-3.5 w-3.5" />
        Confidential
      </span>
    </div>
  );
}
