import { defineField, defineType } from "sanity";

// A YouTube video in the Video Library (home page cards and /videos).
export const video = defineType({
  name: "video",
  title: "Video",
  type: "document",
  fields: [
    defineField({
      name: "youtubeId",
      title: "YouTube video ID",
      type: "string",
      description: "The part after youtu.be/ or watch?v=, e.g. OP6JHa21We8",
      validation: (Rule) =>
        Rule.required().custom((id) => (/^[A-Za-z0-9_-]{11}$/.test(id ?? "") ? true : "Use the 11-character YouTube video ID")),
    }),
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "channel", title: "Channel", type: "string" }),
    defineField({
      name: "description",
      title: "Short description",
      type: "text",
      rows: 3,
      description: "One or two sentences shown on the card.",
    }),
    defineField({ name: "durationSeconds", title: "Duration (seconds)", type: "number" }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Lower numbers show first; the home page shows the first 2.",
      validation: (Rule) => Rule.required().integer(),
    }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "channel" } },
});
