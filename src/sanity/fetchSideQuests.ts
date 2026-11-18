import { getSideQuest as getLocalSideQuest, sideQuests as localSideQuests, type SideQuest } from "@/content/sidequests";
import { sanityClient } from "./client";

const sideQuestFields = `
  "slug": slug.current,
  name,
  tagline,
  status,
  period,
  role,
  "link": select(defined(link.href) => { "label": coalesce(link.label, "Visit site"), "href": link.href }, null),
  "confidential": coalesce(confidential, false),
  teaser,
  "intro": coalesce(intro, []),
  "sections": coalesce(sections[]{ heading, "paragraphs": coalesce(paragraphs, []) }, [])
`;

const sideQuestsQuery = `*[_type == "sideQuest" && defined(slug.current)] | order(order asc, name asc){${sideQuestFields}}`;
const sideQuestQuery = `*[_type == "sideQuest" && slug.current == $slug][0]{${sideQuestFields}}`;

// Fresh on every request in dev; cached for a minute in production.
const fetchOptions =
  process.env.NODE_ENV === "production" ? { next: { revalidate: 60 } } : { cache: "no-store" as const };

// GROQ returns null for missing fields; the page expects them to be absent.
function clean(quest: SideQuest): SideQuest {
  return {
    ...quest,
    period: quest.period ?? undefined,
    role: quest.role ?? undefined,
    link: quest.link ?? undefined,
    teaser: quest.teaser ?? undefined,
  };
}

// Side quests are edited in Sanity Studio. If Sanity has none or can't be reached,
// the copies in src/content/sidequests.ts are used instead.
export async function getSideQuests(): Promise<SideQuest[]> {
  if (sanityClient) {
    try {
      const quests = await sanityClient.fetch<SideQuest[]>(sideQuestsQuery, {}, fetchOptions);
      if (quests.length > 0) return quests.map(clean);
    } catch (error) {
      console.error("Unable to load side quests from Sanity; using the local copies.", error);
    }
  }
  return localSideQuests;
}

export async function getSideQuest(slug: string): Promise<SideQuest | undefined> {
  if (sanityClient) {
    try {
      const quest = await sanityClient.fetch<SideQuest | null>(sideQuestQuery, { slug }, fetchOptions);
      if (quest) return clean(quest);
    } catch (error) {
      console.error(`Unable to load side quest "${slug}" from Sanity; using the local copy.`, error);
    }
  }
  return getLocalSideQuest(slug);
}
