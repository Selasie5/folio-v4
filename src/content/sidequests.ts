import sideQuestsData from "./sidequests.json";

// Story paragraphs can mark key phrases as ==highlighted==; they render with a highlighter effect.
export interface SideQuestSection {
  heading: string;
  paragraphs: string[];
}

export interface SideQuest {
  slug: string;
  name: string;
  /** One line shown in the home-page list and under the page title. */
  tagline: string;
  status: string;
  period?: string;
  role?: string;
  link?: { label: string; href: string };
  /** The full story is hidden behind an access code; only the teaser is public. */
  confidential?: boolean;
  teaser?: string;
  intro: string[];
  sections: SideQuestSection[];
}

// Local copies, used only if Sanity can't be reached. Kept as JSON so plain Node scripts
// (scripts/seed-content.mjs) can read the same data without a TypeScript loader.
// Confidential quests carry no story here; it lives only in Sanity's private documents.
export const sideQuests: SideQuest[] = sideQuestsData;

export function getSideQuest(slug: string): SideQuest | undefined {
  return sideQuests.find((quest) => quest.slug === slug);
}
