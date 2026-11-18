import type { ExperienceContent } from "./types";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** URL slug for a role: the company name, plus the role when one company has several entries. */
export function experienceSlug(experience: ExperienceContent, all: ExperienceContent[]): string {
  const company = slugify(experience.company);
  const sameCompany = all.filter((entry) => slugify(entry.company) === company);
  return sameCompany.length > 1 ? `${company}-${slugify(experience.role)}` : company;
}

export function withSlugs(experiences: ExperienceContent[]) {
  return experiences.map((experience) => ({ ...experience, slug: experienceSlug(experience, experiences) }));
}
