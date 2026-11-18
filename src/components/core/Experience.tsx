import Link from "next/link";
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
    <ul className="focus-list w-full divide-y divide-dotted divide-gray-300 border-y border-dotted border-gray-300 dark:divide-neutral-700 dark:border-neutral-700">
      {items.map((experience, index) => (
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
      ))}
    </ul>
  );
}
