import { defineArrayMember, defineField, defineType } from "sanity";

// One document per dev.to article. Created and refreshed by `npm run cms:sync-posts`;
// re-running the sync overwrites these fields with what is on dev.to.
export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Used in the site URL: /writing/<slug>.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "publishedAt", title: "Published at", type: "datetime", validation: (Rule) => Rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "tags", title: "Tags", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "coverImage", title: "Cover image URL", type: "url" }),
    defineField({ name: "readingTimeMinutes", title: "Reading time (minutes)", type: "number" }),
    defineField({ name: "url", title: "dev.to URL", type: "url", validation: (Rule) => Rule.required() }),
    defineField({ name: "devtoId", title: "dev.to ID", type: "number", readOnly: true }),
    defineField({ name: "bodyHtml", title: "Body (HTML from dev.to)", type: "text", rows: 12, readOnly: true }),
  ],
  orderings: [{ title: "Newest first", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "publishedAt" } },
});
