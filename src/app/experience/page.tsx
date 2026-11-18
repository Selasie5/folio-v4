import type { Metadata } from "next";
import Experience from "@/components/core/Experience";
import PillLink from "@/components/layout/PillLink";
import { getPortfolioContent } from "@/sanity/fetchPortfolio";

export const metadata: Metadata = {
  title: "Work Experience | Selasie Sepenu",
  description: "Where Selasie Sepenu has worked as a software engineer and design engineer.",
};

export default async function ExperiencePage() {
  const { experiences } = await getPortfolioContent();

  return (
    <main className="flex w-full flex-col items-start">
      <PillLink href="/" label="Back home" caret="left" />
      <header className="mt-8">
        <h1 className="text-2xl leading-tight text-black dark:text-neutral-100 mono">Work Experience</h1>
        <p className="mt-3 max-w-[52ch] text-sm leading-6 text-gray-500 dark:text-neutral-400">
          The teams and companies I’ve built software with, from early-stage startups to fintech.
        </p>
      </header>
      <div className="mt-8 w-full">
        <Experience experiences={experiences ?? []} />
      </div>
    </main>
  );
}
