import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRightIcon, LockClosedIcon } from "@heroicons/react/20/solid";
import ConfidentialStory from "@/components/core/ConfidentialStory";
import SideQuestHighlights from "@/components/core/SideQuestHighlights";
import SideQuestStory from "@/components/core/SideQuestStory";
import PillLink from "@/components/layout/PillLink";
import SectionIndicator from "@/components/layout/SectionIndicator";
import StatusTag from "@/components/core/StatusTag";
import { confidentialAccessConfigured } from "@/sanity/confidential";
import { getSideQuest, getSideQuests } from "@/sanity/fetchSideQuests";

type Params = Promise<{ slug: string }>;

const ACCESS_REQUEST_EMAIL = "selasisepenu5@gmail.com";

export async function generateStaticParams() {
  return (await getSideQuests()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const quest = await getSideQuest((await params).slug);
  if (!quest) return { title: "Side quest not found | Selasie Sepenu" };
  return {
    title: `${quest.name} | Selasie Sepenu`,
    description: quest.confidential ? quest.teaser ?? quest.tagline : quest.tagline,
    // Keep confidential pages out of search results.
    robots: quest.confidential ? { index: false, follow: false } : undefined,
  };
}

export default async function SideQuestPage({ params }: { params: Params }) {
  const { slug } = await params;
  const quest = await getSideQuest(slug);
  if (!quest) notFound();

  const meta = [quest.period, quest.role].filter(Boolean);
  const contactHref = `mailto:${ACCESS_REQUEST_EMAIL}?subject=${encodeURIComponent(`Access to ${quest.name}`)}`;

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
            {quest.confidential && (
              <span className="inline-flex items-center gap-1">
                <LockClosedIcon aria-hidden className="h-3.5 w-3.5" />
                Confidential
              </span>
            )}
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
                  className="group inline-flex items-center gap-0.5 text-gray-600 transition-colors hover:text-black dark:text-neutral-300 dark:hover:text-white"
                >
                  {quest.link.label}
                  <ChevronRightIcon aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </a>
              </>
            )}
          </div>
        </header>

        {!quest.confidential && <SideQuestHighlights highlights={quest.highlights ?? []} />}

        {!quest.confidential && <SideQuestStory intro={quest.intro} sections={quest.sections} />}

        {/* Always locked on load: unlocking lives only in that page's memory. */}
        {quest.confidential && (
          <div className="mt-8 space-y-6">
            {quest.teaser && <p className="text-[15px] leading-7 text-gray-600 dark:text-neutral-300">{quest.teaser}</p>}
            {confidentialAccessConfigured ? (
              <ConfidentialStory slug={slug} name={quest.name} contactHref={contactHref} />
            ) : (
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                <a href={contactHref} className="bio-text-link transition-colors hover:text-black dark:hover:text-white">
                  Ask me for access
                </a>{" "}
                to read the full story.
              </p>
            )}
          </div>
        )}
      </article>
    </main>
  );
}
