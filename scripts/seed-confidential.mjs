// Makes a side quest confidential: moves its story out of the public sideQuest document
// into a private "confidential.sideQuest-<slug>" document (hidden from public API reads),
// generates an access code, and marks the public document confidential with a teaser.
//
// Usage: node scripts/seed-confidential.mjs <slug> ["Public teaser text"] [--apply] [--site=https://example.com]
// With --site, the live page is also fetched after the change to confirm the story is gone.
//
// Sanity can't lock a document against editing, so applying requires --confirm-freeze: nobody may
// edit this side quest in Studio until the script finishes. Drafts and release versions are checked
// before writing and again afterwards, so an edit made during the run is still caught.
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
const args = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const site = process.argv.find((arg) => arg.startsWith("--site="))?.slice("--site=".length).replace(/\/$/, "");
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

  // The published root document only: not a draft (drafts.*) and not a release version (versions.*).
  const published = await client.fetch(
    `*[_type == "sideQuest" && slug.current == $slug && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]`,
    { slug },
  );
  assert(published.length === 1, `Expected exactly one published side quest with slug "${slug}", found ${published.length}`);
  const [quest] = published;

  // A draft or release version that still holds the story would put it back in public when published.
  const unsafeVariants = async () =>
    (await client.fetch(`*[_id in path("drafts.**") || _id in path("versions.**")]{_id, intro, sections}`))
      .filter(({ _id }) => _id === `drafts.${quest._id}` || _id.endsWith(`.${quest._id}`))
      .filter(({ intro, sections }) => (intro?.length ?? 0) + (sections?.length ?? 0) > 0)
      .map(({ _id }) => _id);
  const unsafe = await unsafeVariants();
  assert(unsafe.length === 0, `These unpublished versions still contain the story; discard or empty them in Studio first: ${unsafe.join(", ")}`);
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
  assert(
    process.argv.includes("--confirm-freeze"),
    "Applying needs --confirm-freeze: make sure nobody edits this side quest in Studio until the script finishes.",
  );

  const backupDir = mkdtempSync(path.join(tmpdir(), "portfolio-confidential-"));
  writeFileSync(path.join(backupDir, "before.json"), JSON.stringify({ quest, existingPrivate }, null, 2));
  console.log(`Backup (contains the story; keep it private): ${backupDir}`);

  // Both writes are revision-guarded and in one transaction: if either document changed since it
  // was read (e.g. someone edited the access code), nothing is written. Re-run to re-read both.
  let transaction = client.transaction();
  transaction = existingPrivate
    ? transaction.patch(privateId, (patch) => patch.ifRevisionId(existingPrivate._rev).set({ questSlug: slug, intro, sections }))
    : transaction.create({ _id: privateId, _type: "sideQuestPrivate", questSlug: slug, accessCode: generateCode(), intro, sections });
  transaction = transaction.patch(quest._id, (patch) => patch.ifRevisionId(quest._rev).set({ confidential: true, teaser, intro: [], sections: [] }));
  await transaction.commit({ visibility: "sync" }).catch((error) => {
    if (error?.statusCode === 409) throw new Error("A document changed after it was read, so nothing was written. Run the script again.");
    throw error;
  });

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
  // Re-check unpublished versions: one created or edited during the run would republish the story.
  const unsafeAfter = await unsafeVariants();
  assert(
    unsafeAfter.length === 0,
    `An unpublished version gained story text during the run; discard or empty it in Studio before it's published: ${unsafeAfter.join(", ")}`,
  );
  console.log("Verified in Sanity: story moved to the private document, removed from the public one, and hidden from public reads.");
  if (!site) {
    console.log(
      "Not yet confirmed on the live site: a deployed site can keep serving its cached page, and Next.js may serve it once more while it regenerates. Re-run with --site=<url> (or check the page yourself) before treating it as private.",
    );
    return;
  }
  // The first request can still get the cached page while it triggers a rebuild; check a fresh one.
  const url = `${site}/sidequests/${slug}`;
  // Compare on unescaped text: decode HTML entities and JSON string escapes from the page data.
  const normalise = (text) =>
    text
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
      .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
      .replace(/\\u([0-9a-f]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/\\(["\\/])/g, "$1")
      .replace(/<!-- -->/g, "");
  // Probe every paragraph and heading. Highlight marks (==…==) split text into separate elements and
  // separate strings in the page data, so probes are cut at those boundaries and never span one.
  const fragments = [...intro, ...sections.flatMap((section) => [section.heading, ...section.paragraphs])]
    .filter(Boolean)
    .flatMap((text) => text.split("=="))
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter((part) => part.length >= 12)
    .map((part) => part.slice(0, 60));
  assert(fragments.length > 0, "No story fragments to check for; refusing to confirm privacy.");
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const response = await fetch(url, { headers: { "Cache-Control": "no-cache" }, redirect: "manual" });
    const contentType = response.headers.get("content-type") ?? "";
    const raw = await response.text();
    // Fail closed: anything other than a successful HTML page can't confirm privacy.
    const readable = response.status === 200 && contentType.includes("text/html") && raw.length > 0;
    // Search both the visible text (tags stripped) and the full page including serialized data.
    const page = normalise(raw).replace(/\s+/g, " ");
    const visible = page.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const locked = /data-confidential-locked/.test(raw);
    const leaked = fragments.filter((fragment) => page.includes(fragment) || visible.includes(fragment));
    if (readable && locked && leaked.length === 0) {
      console.log(`Confirmed on the live site: ${url} serves the locked page and none of the ${fragments.length} story fragments.`);
      return;
    }
    console.log(
      `Not confirmed yet (attempt ${attempt}): status ${response.status}, html ${contentType.includes("text/html")}, locked ${locked}, story fragments found ${leaked.length}/${fragments.length}. Waiting…`,
    );
    await new Promise((resolve) => setTimeout(resolve, 15_000));
  }
  throw new Error(`${url} isn't confirmed locked and story-free. Redeploy or revalidate the page, then check again.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
