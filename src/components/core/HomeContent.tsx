"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import type { PortfolioContent } from "@/content/types";
import { listVariants } from "@/components/animations";
import CertificationBadge from "@/components/core/CertificationBadge";
import ContactLinksList from "@/components/core/ContactItem";
import Experience from "@/components/core/Experience";
import FeaturedWork from "@/components/core/FeaturedWork";
import TechStackCard from "@/components/core/TechStackCard";

interface HomeContentProps {
  content: PortfolioContent;
}

export default function HomeContent({ content }: HomeContentProps) {
  const { profile, experiences, projects, certifications, techStack, contacts } = content;
  const featuredProjects = projects.filter((project) => project.featured);

  return (
    <main className="flex flex-col justify-start items-start">
      <section className="flex justify-between items-center gap-5 w-full px-10 py-3">
        <div className="flex justify-center items-center gap-5">
          <motion.div
            initial="hidden"
            variants={listVariants}
            whileInView="visible"
            custom={0}
            viewport={{ once: true }}
            className="h-16 w-16 rounded-lg bg-gray-300 bg-cover bg-top"
            style={{ backgroundImage: `url(${profile.image})` }}
          />
          <div className="flex flex-col justify-center items-start">
            <motion.h1 initial="hidden" variants={listVariants} whileInView="visible" custom={1} viewport={{ once: true }} className="text-black text-lg mono">
              {profile.name}
              <CheckBadgeIcon className="inline h-4 w-4 text-green-500 ml-1" />
            </motion.h1>
            <motion.p initial="hidden" variants={listVariants} whileInView="visible" custom={2} viewport={{ once: true }} className="text-sm font-[500] text-gray-600">
              {profile.role}
            </motion.p>
          </div>
        </div>
      </section>

      <section className="flex flex-col justify-center items-start px-10 py-5">
        <motion.div initial="hidden" variants={listVariants} whileInView="visible" custom={3} viewport={{ once: true }} className="space-y-5 text-gray-500 text-[15px]">
          {profile.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </motion.div>
        <motion.p initial="hidden" variants={listVariants} whileInView="visible" custom={3} viewport={{ once: true }} className="mt-5 text-gray-500 text-[15px] mono">
          {profile.quote}
          <br />
          <span className="italic">- {profile.quoteSource}</span>
        </motion.p>
      </section>

      <section className="py-20 px-10 w-full">
        <motion.h2 initial="hidden" variants={listVariants} whileInView="visible" custom={2} viewport={{ once: true }} className="text-black text-lg mono">
          My Work Experience
        </motion.h2>
        <div className="mt-5 w-full"><Experience experiences={experiences} /></div>
      </section>

      <section className="py-20 px-10">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-black text-lg mono">Featured Work</h2>
          <span className="text-gray-500 text-sm hover:underline"><Link href="/projects">View All</Link></span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-5 w-full">
          {featuredProjects.map((project) => <FeaturedWork key={project.title} {...project} />)}
        </div>
      </section>

      <section className="py-20 px-10 w-full">
        <h2 className="text-black text-lg mono">Certifications</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-5 w-full">
          {certifications.map((certification) => <CertificationBadge key={certification.title} {...certification} />)}
        </div>
      </section>

      <section className="py-20 px-10">
        <h2 className="text-black text-lg mono">Tech Stack</h2>
        <div className="flex justify-start flex-wrap gap-5 mt-5">
          {techStack.map((tech) => <TechStackCard key={tech} title={tech} sm={false} />)}
        </div>
      </section>

      <section className="py-20 px-10 w-full">
        <h2 className="text-black text-lg mono">Let&apos;s Connect</h2>
        <ContactLinksList contacts={contacts} />
      </section>
    </main>
  );
}
