"use client";

import { motion } from "framer-motion";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import type { PortfolioContent } from "@/content/types";
import { listVariants } from "@/components/animations";
import SideQuests from "@/components/core/SideQuests";
import type { SideQuest } from "@/content/sidequests";
import Experience from "@/components/core/Experience";
import ThemeToggle from "@/components/core/ThemeToggle";
import Biography from "@/components/core/Biography";
import Writing from "@/components/core/Writing";
import MoreLink from "@/components/core/MoreLink";
import VideoLibrary from "@/components/core/VideoLibrary";
import Bookshelf from "@/components/core/Bookshelf";
import Listening from "@/components/core/Listening";
import type { LikedSong, NowPlaying } from "@/lib/spotify";
import type { Book } from "@/content/books";
import type { Video } from "@/content/videos";
import type { Post } from "@/content/devto";

// How many roles the home page shows before linking to /experience.
const EXPERIENCE_PREVIEW_COUNT = 3;

interface HomeContentProps {
  content: PortfolioContent;
  posts?: Post[];
  sideQuests?: SideQuest[];
  videos?: Video[];
  books?: Book[];
  listening?: { nowPlaying: NowPlaying | null; liked: LikedSong[]; playedLabel?: string };
}

export default function HomeContent({ content, posts = [], sideQuests = [], videos = [], books = [], listening }: HomeContentProps) {
  const {
    profile,
    experiences = [],
    contacts = [],
  } = content || {};

  // Let's Connect is a single line: GitHub and email only, taken from the contact links in Sanity.
  const githubHref = (contacts ?? []).find((contact) => contact.label?.trim().toLowerCase() === "github")?.href;
  const mailHref = (contacts ?? []).find((contact) => contact.label?.trim().toLowerCase() === "mail")?.href;
  const safeBio = profile?.bio ?? [];

  return (
    <main className="flex w-full flex-col items-start">
      <section className="flex w-full items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <motion.div
            initial="hidden"
            variants={listVariants}
            whileInView="visible"
            custom={0}
            viewport={{ once: true }}
            className="h-16 w-16 shrink-0 rounded-lg bg-gray-300 dark:bg-neutral-800 bg-cover bg-top"
            style={{ backgroundImage: `url(${profile?.image || "/seps-anime.png"})` }}
          />
          <div className="flex min-w-0 flex-col justify-center items-start">
            <motion.h1 initial="hidden" variants={listVariants} whileInView="visible" custom={1} viewport={{ once: true }} className="text-black dark:text-neutral-100 text-lg mono">
              {profile?.name}
              <CheckBadgeIcon className="inline h-4 w-4 text-green-500 ml-1" />
            </motion.h1>
            <motion.p initial="hidden" variants={listVariants} whileInView="visible" custom={2} viewport={{ once: true }} className="mt-1 text-xs leading-5 font-[500] text-gray-600 dark:text-white">
              {profile?.role}
            </motion.p>
          </div>
        </div>
        <ThemeToggle />
      </section>

      <section className="mt-12 flex w-full flex-col items-start sm:mt-16">
        <motion.div initial="hidden" variants={listVariants} whileInView="visible" custom={3} viewport={{ once: true }} className="space-y-4 text-sm leading-6 text-gray-500 dark:text-white">
          <Biography paragraphs={safeBio} links={profile?.bioLinks} />
        </motion.div>
        {profile?.quote && (
          <motion.p initial="hidden" variants={listVariants} whileInView="visible" custom={3} viewport={{ once: true }} className="mt-6 text-[13px] leading-[22px] text-gray-500 dark:text-white mono">
            {profile.quote}
            {profile?.quoteSource && (
              <>
                <br />
                <span className="italic dark:text-neutral-400">- {profile.quoteSource}</span>
              </>
            )}
          </motion.p>
        )}
      </section>

      {(experiences ?? []).length > 0 && (
        <section className="mt-14 w-full sm:mt-16" aria-labelledby="experience-heading">
          <div className="flex items-center justify-between gap-4">
            <h2 id="experience-heading" className="text-lg text-black dark:text-neutral-100 mono">Work Experience</h2>
            {(experiences ?? []).length > EXPERIENCE_PREVIEW_COUNT && <MoreLink href="/experience" label="View all" />}
          </div>
          <div className="mt-5"><Experience experiences={(experiences ?? []).slice(0, EXPERIENCE_PREVIEW_COUNT)} all={experiences ?? []} /></div>
        </section>
      )}

      <Writing posts={posts} />

      <SideQuests quests={sideQuests} />

      <VideoLibrary videos={videos} />

      <Bookshelf books={books} />

      {listening && <Listening nowPlaying={listening.nowPlaying} liked={listening.liked} playedLabel={listening.playedLabel} />}

      {(githubHref || mailHref) && (
        <section className="mt-14 w-full sm:mt-16" aria-labelledby="connect-heading">
          <h2 id="connect-heading" className="text-lg text-black dark:text-neutral-100 mono">Let&apos;s Connect</h2>
          <p className="mt-4 text-sm leading-6 text-gray-500 dark:text-neutral-300">
            {githubHref && (
              <>
                Connect with me on{" "}
                <a href={githubHref} target="_blank" rel="noopener noreferrer" className="bio-text-link text-black transition-colors hover:text-gray-600 dark:text-white dark:hover:text-neutral-300">
                  GitHub
                </a>
              </>
            )}
            {githubHref && mailHref && " or "}
            {mailHref && (
              <>
                {githubHref ? "shoot me a " : "Shoot me a "}
                <a href={mailHref} className="bio-text-link text-black transition-colors hover:text-gray-600 dark:text-white dark:hover:text-neutral-300">
                  mail
                </a>
              </>
            )}
            .
          </p>
        </section>
      )}
    </main>
  );
}
