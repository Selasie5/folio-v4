import { defineField, defineType } from "sanity";

// A book on the Bookshelf (home page covers and /books).
export const book = defineType({
  name: "book",
  title: "Book",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "author", title: "Author", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "cover",
      title: "Cover",
      type: "image",
      description: "The front cover, portrait. Around 400 × 600 px is plenty.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "year", title: "Year", type: "number", validation: (Rule) => Rule.integer().min(1450).max(2100) }),
    defineField({ name: "link", title: "Link (optional)", type: "url", description: "Where the cover links to, e.g. the publisher's page." }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Lower numbers show first; the home page shows the first 3.",
      validation: (Rule) => Rule.required().integer(),
    }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "author", media: "cover" } },
});
