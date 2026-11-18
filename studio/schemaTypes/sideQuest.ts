import { defineArrayMember, defineField, defineType } from "sanity";

// A side project or venture, shown in the home page's Side Quests list and at /sidequests/<slug>.
export const sideQuest = defineType({
  name: "sideQuest",
  title: "Side Quest",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Used in the site URL: /sidequests/<slug>.",
      options: { source: "name" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Lower numbers show first on the home page.",
      validation: (Rule) => Rule.required().integer(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "One line shown in the home-page list and under the page title.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description: "Active, Building and Waitlist open get their own colour; anything else shows grey.",
      options: { list: ["Active", "Building", "Waitlist open"] },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "period", title: "Period", type: "string", description: "For example: 2024 – Present" }),
    defineField({ name: "role", title: "My role", type: "string" }),
    defineField({
      name: "link",
      title: "External link",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Label", type: "string" }),
        defineField({ name: "href", title: "URL", type: "url" }),
      ],
    }),
    defineField({
      name: "intro",
      title: "Intro paragraphs",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 4 })],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "sections",
      title: "Sections",
      description: "Each section gets a heading, which also appears in the floating section indicator.",
      type: "array",
      of: [
        defineArrayMember({
          name: "sideQuestSection",
          title: "Section",
          type: "object",
          fields: [
            defineField({ name: "heading", title: "Heading", type: "string", validation: (Rule) => Rule.required() }),
            defineField({
              name: "paragraphs",
              title: "Paragraphs",
              type: "array",
              of: [defineArrayMember({ type: "text", rows: 4 })],
              validation: (Rule) => Rule.required().min(1),
            }),
          ],
          preview: { select: { title: "heading" } },
        }),
      ],
    }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "status" } },
});
