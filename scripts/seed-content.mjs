// Copies content that the site still defines in code into Sanity, so Studio is the single source:
//   - side quests  → one `sideQuest` document each (from src/content/sidequests.ts)
//   - tech stack   → portfolio.techStack      (only if empty in Sanity)
//   - contacts     → portfolio.contacts       (only if empty in Sanity)
// Side quests are created if missing and left alone if they already exist, so Studio edits win.
// With --update, existing side quests also get their story (intro, sections), tagline, role, period
// and link refreshed from src/content/sidequests.json. Name, status, order and confidential settings
// are never touched, and confidential quests never get story text written into their public document.
// Preview by default; pass --apply to write.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import nextEnv from "@next/env";

const root = fileURLToPath(new URL("../", import.meta.url));
nextEnv.loadEnvConfig(root);
const apply = process.argv.includes("--apply");
const update = process.argv.includes("--update");
// JSON with sorted keys, so Sanity returning fields in another order is not a change.
const stableJson = (value) =>
  JSON.stringify(value, (_key, inner) =>
    inner && typeof inner === "object" && !Array.isArray(inner)
      ? Object.fromEntries(Object.keys(inner).sort().map((key) => [key, inner[key]]))
      : inner,
  );
const CONTENT_FIELDS = ["tagline", "role", "period", "link", "highlights", "intro", "sections"];
// Plain JSON so this runs on any supported Node version (no TypeScript loader needed).
const sideQuests = JSON.parse(readFileSync(path.join(root, "src/content/sidequests.json"), "utf8"));

// Mirrors src/content/fallback.ts.
const techStack = [
  "TypeScript", "JavaScript", "PHP", "Node.js", "React", "Next.js",
  "Laravel", "Spring Boot", "PostgreSQL", "MongoDB", "MySQL", "AWS",
  "Strapi", "GitHub", "Docker", "GraphQL", "Framer Motion",
];
const contacts = [
  { label: "github", display: "/ Github", href: "https://github.com/Selasie5" },
  { label: "linkedin", display: "/ Linkedin", href: "https://linkedin.com/in/selasiekofisepenu" },
  { label: "x", display: "/ X (formerly Twitter)", href: "https://x.com/SelasieSepenu" },
  { label: "instagram", display: "/ Instagram", href: "https://instagram.com/_dr_seps" },
  { label: "book", display: "/ Book A Call", href: "https://calendly.com/yourusername" },
  { label: "mail", display: "/ Send Me A Mail", href: "mailto:selasisepenu5@gmail.com" },
].map((contact) => ({ _key: contact.label, _type: "contact", ...contact }));

const toDocument = (quest, index) => {
  const document = {
    _id: `sideQuest-${quest.slug}`,
    _type: "sideQuest",
    name: quest.name,
    slug: { _type: "slug", current: quest.slug },
    order: (index + 1) * 10,
    tagline: quest.tagline,
    status: quest.status,
    intro: quest.intro,
    sections: quest.sections.map((section, sectionIndex) => ({
      _key: `section-${sectionIndex + 1}`,
      _type: "sideQuestSection",
      heading: section.heading,
      paragraphs: section.paragraphs,
    })),
  };
  if (quest.confidential) {
    // The public document of a confidential quest must never carry its story.
    assert(!quest.intro.length && !quest.sections.length, `Confidential side quest "${quest.slug}" has story text in the public data`);
    document.confidential = true;
    if (quest.teaser) document.teaser = quest.teaser;
  }
  if (quest.highlights?.length && !quest.confidential) {
    document.highlights = quest.highlights.map((highlight, index) => ({
      _key: `highlight-${index + 1}`,
      _type: "highlight",
      value: highlight.value,
      label: highlight.label,
    }));
  }
  if (quest.period) document.period = quest.period;
  if (quest.role) document.role = quest.role;
  if (quest.link) document.link = { label: quest.link.label, href: quest.link.href };
  return document;
};

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  assert(projectId, "Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
  let token = process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_AUTH_TOKEN;
  if (!token) token = JSON.parse(readFileSync(path.join(homedir(), ".config/sanity/config.json"), "utf8")).authToken;
  assert(token, "A signed-in Sanity CLI session or write token is required");
  const client = createClient({ projectId, dataset, token, apiVersion: "2026-09-20", useCdn: false, perspective: "raw" });

  const questDocs = sideQuests.map(toDocument);
  const existing = await client.fetch(`*[_type == "sideQuest" && !(_id in path("drafts.**"))]{..., "slug": slug.current}`);
  const existingQuests = existing.map(({ _id }) => _id);
  // A quest created in Studio has a random ID; don't add a second document with the same slug.
  const toCreate = questDocs.filter((quest) => {
    const sameSlug = existing.find(({ slug, _id }) => slug === quest.slug.current && _id !== quest._id);
    if (sameSlug) console.log(`side quest | skip, slug already used by ${sameSlug._id} | ${quest.name}`);
    return !sameSlug;
  });
  const portfolios = await client.fetch(`*[_id in ["portfolio", "drafts.portfolio"]]`);
  assert(portfolios.some(({ _id }) => _id === "portfolio"), "The published portfolio document was not found");

  // --update: refresh content fields on quests that already exist, only where they differ.
  const toUpdate = [];
  for (const quest of toCreate) {
    const current = existing.find(({ _id }) => _id === quest._id);
    if (!current) {
      console.log(`side quest | create | ${quest.name}`);
      continue;
    }
    if (!update) {
      console.log(`side quest | exists, keep | ${quest.name}`);
      continue;
    }
    const fields = CONTENT_FIELDS.filter((field) => quest[field] !== undefined)
      .filter((field) => !(current.confidential && field === "highlights"))
      .filter((field) => !(current.confidential && (field === "intro" || field === "sections")))
      .filter((field) => stableJson(current[field] ?? null) !== stableJson(quest[field]));
    console.log(`side quest | ${fields.length ? "update " + fields.join(", ") : "up to date"} | ${quest.name}`);
    if (fields.length) toUpdate.push({ current, sets: Object.fromEntries(fields.map((field) => [field, quest[field]])) });
  }
  const portfolioSets = portfolios.map((document) => {
    const sets = {};
    if (!document.techStack?.length) sets.techStack = techStack;
    if (!document.contacts?.length) sets.contacts = contacts;
    console.log(`${document._id} | tech stack: ${sets.techStack ? "fill" : "keep"} | contacts: ${sets.contacts ? "fill" : "keep"}`);
    return { document, sets };
  });
  if (!apply) return;

  const backupDir = mkdtempSync(path.join(tmpdir(), "portfolio-content-seed-"));
  writeFileSync(path.join(backupDir, "before.json"), JSON.stringify({ portfolios, existingQuests, sideQuests: existing }, null, 2));
  console.log(`Backup: ${backupDir}`);

  let transaction = client.transaction();
  for (const quest of toCreate) transaction = transaction.createIfNotExists(quest);
  // Guarded by the revision read above, so a Studio edit made in between rejects the whole write.
  for (const { current, sets } of toUpdate) transaction = transaction.patch(current._id, (patch) => patch.ifRevisionId(current._rev).set(sets));
  for (const { document, sets } of portfolioSets) {
    if (Object.keys(sets).length) transaction = transaction.patch(document._id, (patch) => patch.ifRevisionId(document._rev).set(sets));
  }
  await transaction.commit({ visibility: "sync" });

  const savedQuests = await client.fetch(`*[_type == "sideQuest"]`);
  for (const quest of toCreate) {
    const saved = savedQuests.find(({ _id }) => _id === quest._id);
    assert(saved, `Missing ${quest._id}`);
    // Newly created quests must match the seed exactly; existing ones were left alone on purpose.
    if (!existingQuests.includes(quest._id)) {
      const { _rev, _createdAt, _updatedAt, ...fields } = saved;
      assert.deepEqual(fields, quest, `Saved fields differ for ${quest._id}`);
    }
  }
  for (const { current, sets } of toUpdate) {
    const saved = savedQuests.find(({ _id }) => _id === current._id);
    for (const [field, value] of Object.entries(sets)) assert.deepEqual(saved[field], value, `${field} not saved on ${current._id}`);
    const untouched = ({ _rev, _updatedAt, ...rest }) => Object.fromEntries(Object.entries(rest).filter(([key]) => !(key in sets) && key !== "slug"));
    assert.deepEqual(untouched(saved), untouched(current), `Other fields changed on ${current._id}`);
  }
  const updated = await client.fetch(`*[_id in ["portfolio", "drafts.portfolio"]]`);
  for (const { document, sets } of portfolioSets) {
    const current = updated.find(({ _id }) => _id === document._id);
    if (sets.techStack) assert.deepEqual(current.techStack, techStack);
    if (sets.contacts) assert.deepEqual(current.contacts, contacts);
    const strip = ({ _rev, _updatedAt, techStack: t, contacts: c, ...rest }) => rest;
    assert.deepEqual(strip(current), strip(document), `Unrelated fields changed in ${document._id}`);
  }
  console.log(`Verified ${savedQuests.length} side quests and portfolio fields; nothing else changed.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
