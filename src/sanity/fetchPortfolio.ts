import { fallbackPortfolioContent } from "@/content/fallback";
import type { PortfolioContent } from "@/content/types";
import { sanityClient } from "./client";
import { isSanityConfigured } from "./env";
import { portfolioQuery } from "./queries";

export async function getPortfolioContent(): Promise<PortfolioContent> {
  if (!isSanityConfigured || !sanityClient) {
    return fallbackPortfolioContent;
  }

  try {
    const content = await sanityClient.fetch<PortfolioContent | null>(
      portfolioQuery,
      {},
      { next: { revalidate: 60 } },
    );

    return content ?? fallbackPortfolioContent;
  } catch (error) {
    console.error("Unable to load Sanity content; using the local fallback.", error);
    return fallbackPortfolioContent;
  }
}
