import type { Metadata } from "next";
import { SideQuestList } from "@/components/core/SideQuests";
import PageTopBar from "@/components/layout/PageTopBar";
import { getSideQuests } from "@/sanity/fetchSideQuests";

export const metadata: Metadata = {
  title: "Side Quests | Selasie Sepenu",
  description: "Ventures, experiments and systems Selasie Sepenu has built on the side.",
};

export default async function SideQuestsPage() {
  const quests = await getSideQuests();

  return (
    <main className="flex w-full flex-col items-start">
      <PageTopBar href="/" label="Back home" />
      <header className="mt-8">
        <h1 className="text-2xl leading-tight text-black dark:text-neutral-100 mono">Side Quests</h1>
        <p className="mt-3 max-w-[52ch] text-sm leading-6 text-gray-500 dark:text-neutral-400">
          Ventures, experiments and deep dives into how systems work, built alongside my day job.
        </p>
      </header>
      <div className="mt-8 w-full">
        <SideQuestList quests={quests} />
      </div>
    </main>
  );
}
