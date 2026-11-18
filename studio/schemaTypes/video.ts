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
        Rule.required().custom(async (id, context) => {
          if (!/^[A-Za-z0-9_-]{11}$/.test(id ?? "")) return "Use the 11-character YouTube video ID";
          // One entry per video: reject an ID another video document already uses.
          const self = String(context.document?._id ?? "").replace(/^drafts\./, "");
          const others = await context
            .getClient({ apiVersion: "2026-09-20" })
            .fetch(`count(*[_type == "video" && youtubeId == $id && !(_id in [$self, "drafts." + $self])])`, { id, self });
          return others > 0 ? "This video is already in the library" : true;
        }),
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
    defineField({
      name: "durationSeconds",
      title: "Duration (seconds)",
      type: "number",
      validation: (Rule) => Rule.integer().positive(),
    }),
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
