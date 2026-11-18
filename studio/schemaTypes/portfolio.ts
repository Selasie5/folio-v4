import { defineArrayMember, defineField, defineType } from "sanity";

export const portfolio = defineType({
  name: "portfolio",
  title: "Portfolio",
  type: "document",
  groups: [
    { name: "profile", title: "Profile", default: true },
    { name: "organizations", title: "Organizations" },
    { name: "projects", title: "Projects" },
    { name: "experience", title: "Experience" },
    { name: "credentials", title: "Credentials" },
    { name: "contact", title: "Contact" },
  ],
  fields: [
    defineField({
      name: "organizationsHeading",
      title: "Organizations heading",
      type: "string",
      group: "organizations",
      initialValue: "Organizations I’ve worked with",
    }),
    defineField({
      name: "organizations",
      title: "Organization logos",
      description: "Add and reorder the organizations shown on the homepage. Until configured, this section uses the existing work experience logos plus Forge Studios and Blackhorse. An empty list hides the section.",
      type: "array",
      group: "organizations",
      of: [defineArrayMember({
        name: "organization",
        type: "object",
        fields: [
          defineField({ name: "name", title: "Organization name", type: "string", validation: (Rule) => Rule.required() }),
          defineField({ name: "logo", title: "Logo", type: "image", validation: (Rule) => Rule.required() }),
          defineField({ name: "url", title: "Website (optional)", type: "url", validation: (Rule) => Rule.uri({ scheme: ["http", "https"] }) }),
        ],
        preview: { select: { title: "name", subtitle: "url", media: "logo" } },
      })],
    }),
    defineField({
      name: "profile",
      title: "Profile",
      type: "object",
      group: "profile",
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({ name: "name", title: "Name", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "role", title: "Role", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "image", title: "Profile image", type: "image", options: { hotspot: true } }),
        defineField({
          name: "bio",
          title: "Biography paragraphs",
          type: "array",
          of: [defineArrayMember({ type: "text", rows: 4 })],
          validation: (Rule) => Rule.required().min(1),
        }),
        defineField({ name: "quote", title: "Quote", type: "text", rows: 3 }),
        defineField({
          name: "bioLinks",
          title: "Biography links",
          description: "Link text must match the biography exactly. Leave the brand empty for a simple underlined link.",
          type: "array",
          of: [defineArrayMember({
            name: "biographyLink",
            type: "object",
            fields: [
              defineField({ name: "label", title: "Link text", type: "string", validation: (Rule) => Rule.required() }),
              defineField({ name: "href", title: "Destination", type: "url", validation: (Rule) => Rule.required().uri({ scheme: ["https", "http", "mailto"] }) }),
              defineField({ name: "brand", title: "Brand animation", type: "string", options: { list: [
                { title: "Forge Studios", value: "forge" },
                { title: "Blackhorse", value: "blackhorse" },
                { title: "Quotient", value: "quotient" },
                { title: "Fides", value: "fides" },
                { title: "Voya", value: "voya" },
              ] } }),
            ],
            preview: { select: { title: "label", subtitle: "href" } },
          })],
        }),
        defineField({ name: "quoteSource", title: "Quote source", type: "string" }),
      ],
    }),
    defineField({
      name: "projects",
      title: "Projects",
      type: "array",
      group: "projects",
      of: [
        defineArrayMember({
          name: "project",
          title: "Project",
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "description", title: "Description", type: "text", rows: 4, validation: (Rule) => Rule.required() }),
            defineField({
              name: "category",
              title: "Category",
              type: "string",
              options: { list: ["Personal", "Founder Mode", "Professional"], layout: "radio" },
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: "repo", title: "GitHub URL", type: "url" }),
            defineField({ name: "live", title: "Live project URL", type: "url" }),
            defineField({ name: "logo", title: "Logo", type: "image", options: { hotspot: true } }),
            defineField({ name: "image", title: "Preview image", type: "image", options: { hotspot: true } }),
            defineField({ name: "featured", title: "Show in Featured Work", type: "boolean", initialValue: true }),
          ],
          preview: {
            select: { title: "title", subtitle: "category", media: "logo" },
          },
        }),
      ],
    }),
    defineField({
      name: "experiences",
      title: "Work experience",
      type: "array",
      group: "experience",
      of: [
        defineArrayMember({
          name: "experience",
          title: "Experience",
          type: "object",
          fields: [
            defineField({ name: "role", title: "Role", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "company", title: "Company", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "period", title: "Period", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "logo", title: "Company logo", type: "image", options: { hotspot: true } }),
            defineField({ name: "achievements", title: "Achievements", type: "array", of: [defineArrayMember({ type: "text", rows: 3 })] }),
            defineField({ name: "techStack", title: "Technology stack", type: "array", of: [defineArrayMember({ type: "string" })] }),
          ],
          preview: { select: { title: "role", subtitle: "company", media: "logo" } },
        }),
      ],
    }),
    defineField({
      name: "certifications",
      title: "Certifications",
      type: "array",
      group: "credentials",
      of: [
        defineArrayMember({
          name: "certification",
          title: "Certification",
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "issuer", title: "Issuer", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "issuedDate", title: "Issued date", type: "string" }),
            defineField({ name: "logo", title: "Issuer logo", type: "image", options: { hotspot: true } }),
            defineField({ name: "url", title: "Verification URL", type: "url" }),
          ],
          preview: { select: { title: "title", subtitle: "issuer", media: "logo" } },
        }),
      ],
    }),
    defineField({
      name: "techStack",
      title: "Technology stack",
      type: "array",
      group: "credentials",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "contacts",
      title: "Contact links",
      type: "array",
      group: "contact",
      of: [
        defineArrayMember({
          name: "contact",
          title: "Contact link",
          type: "object",
          fields: [
            defineField({ name: "label", title: "Internal label", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "display", title: "Displayed label", type: "string", validation: (Rule) => Rule.required() }),
            defineField({
              name: "href",
              title: "URL or email link",
              type: "url",
              validation: (Rule) => Rule.required().uri({ scheme: ["http", "https", "mailto"] }),
            }),
          ],
          preview: { select: { title: "display", subtitle: "href" } },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Portfolio content" }),
  },
});
