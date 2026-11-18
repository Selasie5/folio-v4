import type { ExperienceContent } from "@/content/types";

export default function Experience({ experiences = [] }: { experiences?: ExperienceContent[] }) {
  return (
    <ul className="w-full divide-y divide-gray-100 border-y border-gray-100 dark:divide-neutral-800 dark:border-neutral-800">
      {(experiences ?? []).map(({ role, company, period }, index) => (
        <li key={`${company}-${role}-${index}`} className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6">
          <div className="min-w-0">
            <h3 className="text-sm leading-5 text-black dark:text-white">{role}</h3>
            <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-neutral-400">{company}</p>
          </div>
          <p className="text-xs leading-5 text-gray-500 dark:text-neutral-400 sm:text-right">{period}</p>
        </li>
      ))}
    </ul>
  );
}
