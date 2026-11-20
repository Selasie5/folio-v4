import { fallbackPortfolioContent } from "@/content/fallback";
import type { PortfolioContent } from "@/content/types";
import { biographyLinks, resolveBiography } from "@/content/biography";
import { organizationsHeading, organizationsFromExperiences, normalizeOrganizations } from "@/content/organizations";
import { sanityClient } from "./client";
import { isSanityConfigured } from "./env";
import { portfolioQuery } from "./queries";
import { CONFIDENTIAL_EXPERIENCE_KEYS, redactConfidential } from "@/content/experience";

export async function getPortfolioContent(): Promise<PortfolioContent> {
  if (!isSanityConfigured || !sanityClient) {
    return fallbackPortfolioContent;
  }

  try {
    const content = await sanityClient.fetch<Partial<PortfolioContent> | null>(
      portfolioQuery,
      { confidentialExperienceKeys: CONFIDENTIAL_EXPERIENCE_KEYS },
      process.env.NODE_ENV === "production" ? { next: { revalidate: 60 } } : { cache: "no-store" },
    );

    if (!content) {
      return fallbackPortfolioContent;
    }

    // Redact again here as a second guard in case the query is ever edited.
    const experiences = redactConfidential(content.experiences?.length ? content.experiences : fallbackPortfolioContent.experiences);

    return {
      organizationsHeading: content.organizationsHeading ?? organizationsHeading,
      organizations: normalizeOrganizations(content.organizations ?? organizationsFromExperiences(experiences)),
      profile: {
        name: content.profile?.name ?? fallbackPortfolioContent.profile.name,
        role: content.profile?.role ?? fallbackPortfolioContent.profile.role,
        image: content.profile?.image ?? fallbackPortfolioContent.profile.image,
        bio: resolveBiography(content.profile?.bio),
        bioLinks: content.profile?.bioLinks ?? biographyLinks,
        quote: content.profile?.quote ?? fallbackPortfolioContent.profile.quote,
        quoteSource: content.profile?.quoteSource ?? fallbackPortfolioContent.profile.quoteSource,
      },
      projects: content.projects?.length ? content.projects : fallbackPortfolioContent.projects,
      experiences,
      certifications: content.certifications?.length ? content.certifications : fallbackPortfolioContent.certifications,
      techStack: content.techStack?.length ? content.techStack : fallbackPortfolioContent.techStack,
      contacts: content.contacts?.length ? content.contacts : fallbackPortfolioContent.contacts,
    };
  } catch (error) {
    console.error("Unable to load Sanity content; using the local fallback.", error);
    return fallbackPortfolioContent;
  }
}
