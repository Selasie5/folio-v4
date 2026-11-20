import type { ExperienceContent } from "./types";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Sanity `_key`s of roles to show as confidential, so they stay hidden even before the
 * "Confidential" box is ticked in Studio. Keys are opaque, so this file names no company.
 */
export const CONFIDENTIAL_EXPERIENCE_KEYS = ["9a92fdd44823c824"];

/** The only shape a confidential role ever has outside Sanity: every detail emptied. */
export const redactedExperience = (): ExperienceContent => ({
  role: "",
  company: "",
  logo: "",
  period: "",
  achievements: [],
  techStack: [],
  confidential: true,
});

export const redactConfidential = (experiences: ExperienceContent[]) =>
  experiences.map((experience) => (experience.confidential ? redactedExperience() : experience));

/** URL slug for a role: the company name, plus the role when one company has several entries. */
export function experienceSlug(experience: ExperienceContent, all: ExperienceContent[]): string {
  const company = slugify(experience.company);
  const sameCompany = all.filter((entry) => slugify(entry.company) === company);
  return sameCompany.length > 1 ? `${company}-${slugify(experience.role)}` : company;
}

/** Public roles with their slugs. Confidential roles have no detail page. */
export function withSlugs(experiences: ExperienceContent[]) {
  return experiences
    .filter((experience) => !experience.confidential)
    .map((experience) => ({ ...experience, slug: experienceSlug(experience, experiences) }));
}
