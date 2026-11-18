"use client";

import { motion } from "framer-motion";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import type { PortfolioContent } from "@/content/types";
import { listVariants } from "@/components/animations";
import SideQuests from "@/components/core/SideQuests";
import type { SideQuest } from "@/content/sidequests";
import ContactLinksList from "@/components/core/ContactItem";
import Experience from "@/components/core/Experience";
import TechStackCard from "@/components/core/TechStackCard";
import ThemeToggle from "@/components/core/ThemeToggle";
import Biography from "@/components/core/Biography";
import Writing from "@/components/core/Writing";
import MoreLink from "@/components/core/MoreLink";
import type { Post } from "@/content/devto";

// How many roles the home page shows before linking to /experience.
const EXPERIENCE_PREVIEW_COUNT = 4;

interface HomeContentProps {
  content: PortfolioContent;
  posts?: Post[];
  sideQuests?: SideQuest[];
}

export default function HomeContent({ content, posts = [], sideQuests = [] }: HomeContentProps) {
  const {
    profile,
    experiences = [],
    techStack = [],
    contacts = [],
  } = content || {};

  const safeTechStack = techStack ?? [];
  const safeContacts = contacts ?? [];
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

      {safeTechStack.length > 0 && (
        <section className="mt-14 w-full sm:mt-16">
          <h2 className="text-black dark:text-neutral-100 text-lg mono">Tech Stack</h2>
          <div className="mt-5 flex flex-wrap justify-start gap-2.5">
            {safeTechStack.map((tech) => <TechStackCard key={tech} title={tech} sm={false} />)}
          </div>
        </section>
      )}

      {safeContacts.length > 0 && (
        <section className="mt-14 w-full sm:mt-16">
          <h2 className="text-black dark:text-neutral-100 text-lg mono">Let&apos;s Connect</h2>
          <ContactLinksList contacts={safeContacts} />
        </section>
      )}
    </main>
  );
}
