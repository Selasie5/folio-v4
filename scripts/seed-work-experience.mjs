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
const seed = JSON.parse(readFileSync(path.join(root, "src/content/work-experience.json"), "utf8"));
const apply = process.argv.includes("--apply");
// Roles in Sanity that aren't in the seed are kept unless this flag is passed.
const removeUnmatched = process.argv.includes("--remove-unmatched");

function normalizeCompany(company) {
  const name = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  return /^blackhorse(?:mobility)?(?:limited|ltd)?$/.test(name) ? "blackhorse" : name;
}

const startOf = (period) => String(period ?? "").split(/\s+[–-]\s+/)[0].trim().toLowerCase();
const sameRole = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();
const seedKey = ({ company, role, period }) =>
  createHash("sha256").update(`${company}|${role}|${period.split(" – ")[0]}`).digest("hex").slice(0, 16);

// Finds the saved stint for a seeded one: the key the seed would have given it, otherwise the
// same company + role + start date. A same-role stint with a different start date is a different
// stint, so its details are never copied; the only fallback is a single same-role stint with no
// period saved at all. Stops rather than guessing when more than one stint could match.
function findSavedStint(seeded, existing, taken) {
  const available = existing.filter((entry) => !taken.has(entry._key));
  const key = seedKey(seeded);
  const byKey = available.find((entry) => entry._key === key);
  if (byKey) return byKey;
  const sameCompanyRole = available.filter(
    (entry) => normalizeCompany(entry.company) === normalizeCompany(seeded.company) && sameRole(entry.role, seeded.role),
  );
  const sameStart = sameCompanyRole.filter((entry) => startOf(entry.period) === startOf(seeded.period));
  const undated = sameCompanyRole.filter((entry) => !startOf(entry.period));
  // Stints with a different known start date are different stints, so they're never candidates.
  const candidates = sameStart.length ? sameStart : undated;
  if (candidates.length > 1) {
    throw new Error(
      `Ambiguous match for "${seeded.company} | ${seeded.role} | ${seeded.period}": ${candidates.length} saved stints could match. Fix the seed or Studio first.`,
    );
  }
  return candidates[0];
}

function prepareExperiences(existing = []) {
  const taken = new Set();
  const seeded = seed.experiences.map((entry) => {
    const { company, role, period } = entry;
    assert(company && role && period, "Every seeded position needs a company, role, and period");
    const saved = findSavedStint(entry, existing, taken);
    if (saved) taken.add(saved._key);
    // Logos are shared per company, independent of which stint matched.
    const companyLogo = existing.find((other) => normalizeCompany(other.company) === normalizeCompany(company) && other.logo)?.logo;
    const result = { ...saved, _type: "experience", _key: saved?._key ?? seedKey(entry), company, role, period };
    const logo = saved?.logo ?? companyLogo;
    if (logo) result.logo = logo;
    return result;
  });
  const unmatched = existing.filter((entry) => !taken.has(entry._key));
  return { experiences: removeUnmatched ? seeded : [...seeded, ...unmatched], unmatched };
}

function otherFields(document) {
  const { experiences, _rev, _updatedAt, ...rest } = document;
  return rest;
}

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  assert(projectId, "Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
  let token = process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_AUTH_TOKEN;
  if (!token) {
    const config = JSON.parse(readFileSync(path.join(homedir(), ".config/sanity/config.json"), "utf8"));
    token = config.authToken;
  }
  assert(token, "A signed-in Sanity CLI session or write token is required");
  const client = createClient({ projectId, dataset, token, apiVersion: "2026-09-20", useCdn: false, perspective: "raw" });
  const ids = ["portfolio", "drafts.portfolio"];
  const documents = await client.fetch("*[_id in $ids]", { ids });
  assert(documents.some(({ _id }) => _id === "portfolio"), "The published portfolio document was not found");
  const plans = documents.map((document) => ({ document, ...prepareExperiences(document.experiences) }));
  console.log(JSON.stringify({ mode: apply ? "apply" : "preview", projectId, dataset, removeUnmatched, documents: plans.map(({ document, experiences }) => ({ id: document._id, previousPositions: document.experiences?.length ?? 0, positions: experiences.length })) }, null, 2));
  for (const { company, role, period } of seed.experiences) console.log(`seed | ${company} | ${role} | ${period}`);
  for (const { document, unmatched } of plans) {
    for (const entry of unmatched) {
      console.log(`${document._id}: not in seed, ${removeUnmatched ? "WILL BE REMOVED" : "kept"} | ${entry.company} | ${entry.role} | ${entry.period}`);
    }
  }
  if (!apply) return;

  const backupDir = mkdtempSync(path.join(tmpdir(), "portfolio-experience-seed-"));
  writeFileSync(path.join(backupDir, "before.json"), JSON.stringify(documents, null, 2));
  console.log(`Backup: ${backupDir}`);
  let transaction = client.transaction();
  for (const { document, experiences } of plans) {
    transaction = transaction.patch(document._id, (patch) => patch.ifRevisionId(document._rev).set({ experiences }));
  }
  await transaction.commit({ visibility: "sync" });
  const updated = await client.fetch("*[_id in $ids]", { ids });
  for (const { document, experiences } of plans) {
    const current = updated.find(({ _id }) => _id === document._id);
    assert(current, `Missing document after update: ${document._id}`);
    assert.deepEqual(current.experiences, experiences, `Work experience readback differs: ${document._id}`);
    assert.deepEqual(otherFields(current), otherFields(document), `An unrelated field changed: ${document._id}`);
  }
  console.log(`Verified ${seed.experiences.length} positions in ${plans.length} document(s); unrelated fields preserved.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
