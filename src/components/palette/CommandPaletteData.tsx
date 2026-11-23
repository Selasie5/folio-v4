import { withSlugs } from "@/content/experience";
import { formatPostDate } from "@/content/devto";
import { getPortfolioContent } from "@/sanity/fetchPortfolio";
import { getPosts } from "@/sanity/fetchPosts";
import { getSideQuests } from "@/sanity/fetchSideQuests";
import CommandPalette from "./CommandPalette";
import type { PaletteEntry } from "./paletteStore";

const PAGES: PaletteEntry[] = [
  { id: "page-home", group: "Go to", label: "Home", href: "/" },
  { id: "page-experience", group: "Go to", label: "Work Experience", href: "/experience" },
  { id: "page-writing", group: "Go to", label: "Writing", href: "/writing" },
  { id: "page-sidequests", group: "Go to", label: "Side Quests", href: "/sidequests" },
  { id: "page-videos", group: "Go to", label: "Videos", href: "/videos" },
  { id: "page-books", group: "Go to", label: "Books", href: "/books" },
  { id: "page-music", group: "Go to", label: "Music", href: "/music" },
];

/**
 * Builds the palette's index on the server from the same cached queries the pages use, so the
 * browser receives only titles and links. Any source that fails is simply left out.
 */
export default async function CommandPaletteData() {
  const [content, posts, quests] = await Promise.all([
    getPortfolioContent(),
    getPosts().catch(() => []),
    getSideQuests().catch(() => []),
  ]);

  const roles: PaletteEntry[] = withSlugs(content.experiences ?? []).map((role) => ({
    id: `role-${role.slug}`,
    group: "Experience",
    label: role.role,
    hint: role.company,
    href: `/experience/${role.slug}`,
  }));
  const writing: PaletteEntry[] = posts.map((post) => ({
    id: `post-${post.slug}`,
    group: "Writing",
    label: post.title,
    hint: post.draft ? "Draft" : formatPostDate(post.publishedAt),
    href: `/writing/${post.slug}`,
  }));
  const sideQuests: PaletteEntry[] = quests.map((quest) => ({
    id: `quest-${quest.slug}`,
    group: "Side quests",
    label: quest.name,
    hint: quest.confidential ? "Confidential" : quest.tagline,
    href: `/sidequests/${quest.slug}`,
  }));

  const contact = (name: string) => content.contacts?.find((item) => item.label?.trim().toLowerCase() === name)?.href;
  const email = contact("mail")?.replace(/^mailto:/i, "").split("?")[0];

  return <CommandPalette entries={[...PAGES, ...roles, ...writing, ...sideQuests]} email={email} github={contact("github")} />;
}
