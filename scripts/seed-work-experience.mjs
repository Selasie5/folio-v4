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

function normalizeCompany(company) {
  const name = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  return /^blackhorse(?:mobility)?(?:limited|ltd)?$/.test(name) ? "blackhorse" : name;
}

function prepareExperiences(existing = []) {
  return seed.experiences.map(({ company, role, period }) => {
    assert(company && role && period, "Every seeded position needs a company, role, and period");
    const companyEntries = existing.filter((entry) => normalizeCompany(entry.company) === normalizeCompany(company));
    const matchingRole = companyEntries.find((entry) => entry.role.trim().toLowerCase() === role.trim().toLowerCase());
    const logo = matchingRole?.logo ?? companyEntries.find((entry) => entry.logo)?.logo;
    const result = {
      ...matchingRole,
      _type: "experience",
      _key: matchingRole?._key ?? createHash("sha256").update(`${company}|${role}|${period.split(" – ")[0]}`).digest("hex").slice(0, 16),
      company,
      role,
      period,
    };
    if (logo) result.logo = logo;
    return result;
  });
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
  const plans = documents.map((document) => ({ document, experiences: prepareExperiences(document.experiences) }));
  console.log(JSON.stringify({ mode: apply ? "apply" : "preview", projectId, dataset, documents: plans.map(({ document, experiences }) => ({ id: document._id, previousPositions: document.experiences?.length ?? 0, positions: experiences.length })) }, null, 2));
  for (const { company, role, period } of seed.experiences) console.log(`${company} | ${role} | ${period}`);
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
