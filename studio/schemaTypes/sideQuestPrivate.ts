import { defineArrayMember, defineField, defineType } from "sanity";
import { sideQuestSection } from "./sideQuest";

// The hidden part of a confidential side quest. These documents must have an ID that
// starts with "confidential." — Sanity never returns dotted IDs to public (unauthenticated)
// requests, even though the dataset is public. Only the site's server reads them, with a token.
// Create them with `node scripts/seed-confidential.mjs`; Studio can't create or duplicate them,
// because a copy would get a normal, public ID.
export const sideQuestPrivate = defineType({
  name: "sideQuestPrivate",
  title: "Confidential content",
  type: "document",
  fields: [
    defineField({
      name: "questSlug",
      title: "Side quest slug",
      type: "string",
      description: "Must match the slug of the side quest this belongs to.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "accessCode",
      title: "Access code",
      type: "string",
      description: "Share this with people who should see the full story. Changing it locks out everyone who used the old one.",
      validation: (Rule) => Rule.required().min(6),
    }),
    defineField({
      name: "intro",
      title: "Intro paragraphs",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 4 })],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({ name: "sections", title: "Sections", type: "array", of: [sideQuestSection] }),
  ],
  preview: { select: { title: "questSlug" }, prepare: ({ title }) => ({ title: `🔒 ${title}`, subtitle: "Confidential content" }) },
});
