import type { Metadata } from "next";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import PillLink from "@/components/layout/PillLink";
import SectionIndicator from "@/components/layout/SectionIndicator";
import StatusTag from "@/components/core/StatusTag";
import { getSideQuest, getSideQuests } from "@/sanity/fetchSideQuests";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getSideQuests()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const quest = await getSideQuest((await params).slug);
  if (!quest) return { title: "Side quest not found | Selasie Sepenu" };
  return { title: `${quest.name} | Selasie Sepenu`, description: quest.tagline };
}

export default async function SideQuestPage({ params }: { params: Params }) {
  const quest = await getSideQuest((await params).slug);
  if (!quest) notFound();

  const meta = [quest.period, quest.role].filter(Boolean);

  return (
    <main className="flex w-full flex-col items-start">
      <SectionIndicator />
      <PillLink href="/" label="Back home" caret="left" />

      <article className="mt-8 w-full">
        <header>
          <h1 className="text-2xl leading-tight text-black dark:text-neutral-100 mono">{quest.name}</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-neutral-400">{quest.tagline}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500 dark:text-neutral-400">
            <StatusTag status={quest.status} />
            {meta.map((item) => (
              <span key={item} className="flex items-center gap-3">
                <span aria-hidden>·</span>
                {item}
              </span>
            ))}
            {quest.link && (
              <>
                <span aria-hidden>·</span>
                <a
                  href={quest.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bio-text-link transition-colors hover:text-black dark:hover:text-white"
                >
                  {quest.link.label} ↗
                </a>
              </>
            )}
          </div>
        </header>

        <div className="article-body mt-8">
          {quest.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {quest.sections.map((section) => (
            <Fragment key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </Fragment>
          ))}
        </div>
      </article>
    </main>
  );
}
