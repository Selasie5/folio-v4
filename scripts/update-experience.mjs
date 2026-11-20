// Applies src/content/experience-updates.json to the portfolio in Sanity: adds or updates the listed
// roles (role, period, highlights and tech stack are replaced, the logo is kept) and replaces the
// overall tech stack. Confidential placeholders scrub the matching role. Preview by default; pass --apply to write.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import nextEnv from "@next/env";

const root = fileURLToPath(new URL("../", import.meta.url));
nextEnv.loadEnvConfig(root);
const updates = JSON.parse(readFileSync(path.join(root, "src/content/experience-updates.json"), "utf8"));
// Confidential roles appear in experience-updates.json only as { confidential, key } placeholders. The saved
// entry with that _key is overwritten with neutral placeholder text and flagged confidential, because the
// dataset is publicly readable. Their real details are never written to Sanity.
const SCRUBBED = { confidential: true, company: "Confidential", role: "Confidential role", period: "Confidential", achievements: [], techStack: [] };
const apply = process.argv.includes("--apply");

function normalizeCompany(company) {
  const name = String(company ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return /^blackhorse(?:mobility)?(?:limited|ltd)?$/.test(name) ? "blackhorse" : name;
}
const keyFor = ({ company, role, period }) =>
  createHash("sha256").update(`${company}|${role}|${period.split(" – ")[0]}`).digest("hex").slice(0, 16);

/** The saved entry an update is for: same company and role, else the only entry for that company. */
function findEntry(update, entries) {
  const sameCompany = entries.filter((entry) => normalizeCompany(entry.company) === normalizeCompany(update.company));
  const sameRole = sameCompany.filter((entry) => entry.role?.trim().toLowerCase() === update.role.trim().toLowerCase());
  if (sameRole.length > 1) throw new Error(`More than one saved "${update.company} | ${update.role}"; fix it in Studio first.`);
  if (sameRole.length === 1) return sameRole[0];
  if (sameCompany.length > 1) throw new Error(`Several saved roles at ${update.company} and none named "${update.role}"; fix it in Studio first.`);
  return sameCompany[0];
}

function plan(document) {
  const entries = [...(document.experiences ?? [])];
  const changes = [];
  for (const update of updates.experiences) {
    if (update.confidential) {
      const index = entries.findIndex(({ _key }) => _key === update.key);
      assert(index >= 0, `No saved role with _key ${update.key} to mark confidential`);
      const { logo: _logo, ...saved } = entries[index];
      entries[index] = { ...saved, ...SCRUBBED };
      changes.push(`scrub  | ${update.key} → confidential placeholder (details and logo removed)`);
      continue;
    }
    assert(update.company && update.role && update.period, "Every update needs a company, role and period");
    const fields = { company: update.company, role: update.role, period: update.period, achievements: update.achievements, techStack: update.techStack };
    const saved = findEntry(update, entries);
    if (saved) {
      entries[entries.indexOf(saved)] = { ...saved, ...fields };
      changes.push(`update | ${update.company} | ${saved.role} → ${update.role} | ${update.achievements.length} highlights, ${update.techStack.length} tech`);
    } else {
      const entry = { _type: "experience", _key: keyFor(update), ...fields };
      entries.splice(Math.min(update.insertAt ?? entries.length, entries.length), 0, entry);
      changes.push(`add    | ${update.company} | ${update.role} | ${update.period} at position ${entries.indexOf(entry) + 1}`);
    }
  }
  return { document, experiences: entries, techStack: updates.techStack, changes };
}

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  assert(projectId, "Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
  let token = process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_AUTH_TOKEN;
  if (!token) token = JSON.parse(readFileSync(path.join(homedir(), ".config/sanity/config.json"), "utf8")).authToken;
  assert(token, "A signed-in Sanity CLI session or write token is required");
  const client = createClient({ projectId, dataset, token, apiVersion: "2026-09-20", useCdn: false, perspective: "raw" });

  const ids = ["portfolio", "drafts.portfolio"];
  const documents = await client.fetch("*[_id in $ids]", { ids });
  assert(documents.some(({ _id }) => _id === "portfolio"), "The published portfolio document was not found");

  const plans = documents.map(plan);
  for (const { document, experiences, techStack, changes } of plans) {
    console.log(`\n${document._id} (${apply ? "apply" : "preview"})`);
    changes.forEach((line) => console.log(`  ${line}`));
    console.log(`  tech stack: ${document.techStack?.length ?? 0} → ${techStack.length}`);
    console.log(`  order: ${experiences.map((e) => e.company).join(" · ")}`);
  }
  if (!apply) {
    console.log("\nPreview only. Run with --apply to write.");
    return;
  }

  const backupDir = mkdtempSync(path.join(tmpdir(), "portfolio-experience-update-"));
  writeFileSync(path.join(backupDir, "before.json"), JSON.stringify(documents, null, 2));
  console.log(`\nBackup: ${backupDir}`);

  let transaction = client.transaction();
  for (const { document, experiences, techStack } of plans) {
    transaction = transaction.patch(document._id, (patch) => patch.ifRevisionId(document._rev).set({ experiences, techStack }));
  }
  await transaction.commit({ visibility: "sync" });

  const after = await client.fetch("*[_id in $ids]", { ids });
  for (const { document, experiences, techStack } of plans) {
    const current = after.find(({ _id }) => _id === document._id);
    assert(current, `Missing after update: ${document._id}`);
    assert.deepEqual(current.experiences, experiences, `Experience readback differs: ${document._id}`);
    assert.deepEqual(current.techStack, techStack, `Tech stack readback differs: ${document._id}`);
    const rest = ({ experiences: _e, techStack: _t, _rev, _updatedAt, ...others }) => others;
    assert.deepEqual(rest(current), rest(document), `An unrelated field changed: ${document._id}`);
  }
  console.log("Verified: roles and tech stack written; nothing else changed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
