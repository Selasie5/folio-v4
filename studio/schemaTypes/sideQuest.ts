import { defineArrayMember, defineField, defineType } from "sanity";

// A side project or venture, shown in the home page's Side Quests list and at /sidequests/<slug>.
export const sideQuestSection = defineArrayMember({
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
});

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
      validation: (Rule) =>
        Rule.required().custom((slug) =>
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug?.current ?? "") ? true : "Use lowercase letters, numbers and single hyphens only",
        ),
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
    defineField({
      name: "confidential",
      title: "Confidential",
      type: "boolean",
      description:
        "Hide the full story behind an access code. Write the story and code in its Confidential content document, not here, because this document is public.",
      initialValue: false,
    }),
    defineField({
      name: "teaser",
      title: "Public teaser",
      type: "text",
      rows: 3,
      description: "Shown to everyone on a confidential side quest's page, above the access-code box.",
      hidden: ({ document }) => !document?.confidential,
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
      description: "Public. Leave empty for confidential side quests.",
      validation: (Rule) =>
        Rule.custom((intro, context) =>
          context.document?.confidential || (Array.isArray(intro) && intro.length > 0) ? true : "Add at least one paragraph",
        ),
    }),
    defineField({
      name: "sections",
      title: "Sections",
      description: "Public. Each section gets a heading, which also appears in the floating section indicator. Leave empty for confidential side quests.",
      type: "array",
      of: [sideQuestSection],
    }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", status: "status", confidential: "confidential" },
    prepare: ({ title, status, confidential }) => ({ title, subtitle: confidential ? `🔒 Confidential · ${status}` : status }),
  },
});
