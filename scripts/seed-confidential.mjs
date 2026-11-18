// Makes a side quest confidential: moves its story out of the public sideQuest document
// into a private "confidential.sideQuest-<slug>" document (hidden from public API reads),
// generates an access code, and marks the public document confidential with a teaser.
//
// Usage: node scripts/seed-confidential.mjs <slug> ["Public teaser text"] [--apply]
// Preview by default. Never prints the access code; read it in Studio → Confidential content.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import nextEnv from "@next/env";

const root = fileURLToPath(new URL("../", import.meta.url));
nextEnv.loadEnvConfig(root);
const args = process.argv.slice(2).filter((arg) => arg !== "--apply");
const apply = process.argv.includes("--apply");
const [slug, teaserArg] = args;
assert(slug, "Usage: node scripts/seed-confidential.mjs <slug> [\"Public teaser\"] [--apply]");

// Readable code without look-alike characters, e.g. "K7Q4-MZ2P".
function generateCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  const chars = [...bytes].map((byte) => alphabet[byte % alphabet.length]);
  return `${chars.slice(0, 4).join("")}-${chars.slice(4).join("")}`;
}

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  assert(projectId, "Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
  let token = process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_AUTH_TOKEN;
  if (!token) token = JSON.parse(readFileSync(path.join(homedir(), ".config/sanity/config.json"), "utf8")).authToken;
  assert(token, "A signed-in Sanity CLI session or write token is required");
  const client = createClient({ projectId, dataset, token, apiVersion: "2026-09-20", useCdn: false, perspective: "raw" });
  const anonymous = createClient({ projectId, dataset, apiVersion: "2026-09-20", useCdn: false });

  const quest = await client.fetch(`*[_type == "sideQuest" && slug.current == $slug && !(_id in path("drafts.**"))][0]`, { slug });
  assert(quest, `No published side quest with slug "${slug}"`);
  const privateId = `confidential.${quest._id}`;
  const existingPrivate = await client.getDocument(privateId);

  const intro = quest.intro?.length ? quest.intro : existingPrivate?.intro;
  const sections = quest.sections?.length ? quest.sections : existingPrivate?.sections ?? [];
  assert(intro?.length, "Nothing to move: the side quest has no intro and no confidential document yet");
  const teaser = teaserArg ?? quest.teaser ?? quest.tagline;

  console.log(JSON.stringify({
    mode: apply ? "apply" : "preview",
    sideQuest: quest._id,
    privateDocument: `${privateId} (${existingPrivate ? "update" : "create"})`,
    move: { introParagraphs: intro.length, sections: sections.length },
    accessCode: existingPrivate?.accessCode ? "keep existing" : "generate new",
    teaser,
  }, null, 2));
  if (!apply) return;

  const backupDir = mkdtempSync(path.join(tmpdir(), "portfolio-confidential-"));
  writeFileSync(path.join(backupDir, "before.json"), JSON.stringify({ quest, existingPrivate }, null, 2));
  console.log(`Backup (contains the story; keep it private): ${backupDir}`);

  await client
    .transaction()
    .createOrReplace({
      _id: privateId,
      _type: "sideQuestPrivate",
      questSlug: slug,
      accessCode: existingPrivate?.accessCode ?? generateCode(),
      intro,
      sections,
    })
    .patch(quest._id, (patch) => patch.ifRevisionId(quest._rev).set({ confidential: true, teaser, intro: [], sections: [] }))
    .commit({ visibility: "sync" });

  // Check: the story is in the private document, gone from the public one, and invisible without a token.
  const savedPrivate = await client.getDocument(privateId);
  assert.deepEqual(savedPrivate.intro, intro);
  assert.deepEqual(savedPrivate.sections, sections);
  const publicNow = await anonymous.fetch(`*[_id == $id][0]{confidential, teaser, intro, sections}`, { id: quest._id });
  assert.equal(publicNow.confidential, true);
  assert.equal((publicNow.intro ?? []).length + (publicNow.sections ?? []).length, 0, "Story still in the public document");
  assert.equal(await anonymous.fetch(`count(*[_type == "sideQuestPrivate"])`), 0, "Confidential documents are publicly readable");
  const leaked = await anonymous.fetch(`count(*[$paragraph in intro])`, { paragraph: intro[0] });
  assert.equal(leaked, 0, "Story text is still publicly readable somewhere");
  console.log("Verified: story moved to the private document, removed from the public one, and hidden from public reads.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
