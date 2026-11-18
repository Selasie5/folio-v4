import type { ExperienceContent, OrganizationContent } from "./types";

export const organizationsHeading = "Organizations I’ve worked with";

export function normalizeOrganizations(organizations: OrganizationContent[]): OrganizationContent[] {
  const unique = new Map<string, OrganizationContent>();
  for (const organization of organizations) {
    if (!organization.name?.trim() || !organization.logo || organization.logo === "/assets/project.png") continue;
    const normalizedName = organization.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const key = /^blackhorse(?:mobility)?(?:limited|ltd)?$/.test(normalizedName) ? "blackhorse" : normalizedName;
    const existing = unique.get(key);
    // Prefer the saved Mobility identity and logo over the generic Blackhorse seed.
    if (key === "blackhorse" && existing && /mobility/i.test(existing.name) && !/mobility/i.test(organization.name)) {
      unique.set(key, { ...organization, ...existing, url: existing.url ?? organization.url });
    } else {
      unique.set(key, { ...existing, ...organization, url: organization.url ?? existing?.url });
    }
  }
  return [...unique.values()];
}

export function organizationsFromExperiences(experiences: ExperienceContent[]): OrganizationContent[] {
  const organizations: OrganizationContent[] = [
    { name: "Forge Studios", logo: "/brands/forge.svg", url: "https://forgestudios.tech/" },
    { name: "Blackhorse", logo: "/brands/blackhorse.png", url: "https://www.black-horse.io/" },
    ...experiences.map(({ company, logo }) => ({ name: company, logo })),
  ];
  return normalizeOrganizations(organizations);
}
