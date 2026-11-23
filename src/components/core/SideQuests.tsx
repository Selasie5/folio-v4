import Link from "next/link";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import MoreLink from "@/components/core/MoreLink";
import StatusTag from "@/components/core/StatusTag";
import type { SideQuest } from "@/content/sidequests";

/** How many side quests the home page shows before linking to /sidequests. */
export const SIDE_QUEST_PREVIEW_COUNT = 3;

export function SideQuestList({ quests }: { quests: SideQuest[] }) {
  return (
    <ul data-inspect="side-quests" className="focus-list w-full divide-y divide-dotted divide-gray-300 border-y border-dotted border-gray-300 dark:divide-neutral-700 dark:border-neutral-700">
      {quests.map((quest) => (
        <li key={quest.slug}>
          <Link href={`/sidequests/${quest.slug}`} className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6">
            <div className="min-w-0">
              <h3 className="flex items-center gap-1.5 text-sm leading-5 text-black dark:text-white">
                {quest.name}
                {quest.confidential && (
                  <LockClosedIcon aria-label="Confidential" className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-neutral-500" />
                )}
              </h3>
              <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-neutral-400">{quest.tagline}</p>
            </div>
            <div className="sm:pt-0.5 sm:text-right">
              <StatusTag status={quest.status} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Home-page section: the first few side quests, with a link to the full list. */
export default function SideQuests({ quests }: { quests: SideQuest[] }) {
  if (quests.length === 0) return null;

  return (
    <section className="mt-14 w-full sm:mt-16" aria-labelledby="sidequests-heading">
      <div className="flex items-center justify-between gap-4">
        <h2 id="sidequests-heading" className="text-lg text-black dark:text-neutral-100 mono">Side Quests</h2>
        {quests.length > SIDE_QUEST_PREVIEW_COUNT && <MoreLink href="/sidequests" label="View all" />}
      </div>
      <div className="mt-5">
        <SideQuestList quests={quests.slice(0, SIDE_QUEST_PREVIEW_COUNT)} />
      </div>
    </section>
  );
}
