// Fills in highlights (achievements) and tech stack for work experience entries in Sanity.
// Only fills entries that don't have them yet. Preview by default; pass --apply to write.
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

// Keyed by "company|role" (lower-case). Sources: LinkedIn profile and the site's earlier fallback content.
const details = {
  "blackhorse mobility limited|software engineer (frontend)": {
    achievements: [
      "Led frontend engineering for the corporate app while contributing to product thinking and UX flow design, shaping features from concept through implementation rather than working from finished specs.",
      "Owned UI design and led design engineering for the company’s new marketing website, partnering closely with the marketing team to optimize for lead generation and implement accurate analytics tracking.",
      "Led frontend engineering for the B2C consumer app, balancing feature delivery with on-call responsibility for resolving critical production issues.",
      "Drove major semantic and architectural refactors across core frontend codebases, introducing linting and code-quality checks to maintain long-term cleanliness and prevent regressions.",
      "Actively participated in QA engineering, catching issues before release and strengthening the team’s overall testing culture.",
      "Mentored an engineering intern in React fundamentals and performance optimization, building her practical understanding of the framework while ensuring quality delivery.",
    ],
    techStack: ["React"],
  },
  "polymorph labs|software engineer": {
    achievements: [
      "Architected and implemented v1 of a pricing feature (PBUs) end to end, based on domain regulatory policies and business rules, for an application in the oil and gas sector.",
      "Developed an optimized export feature for the University of Ghana’s admissions system, preventing duplicate exports and adding pagination and performance improvements for bulk data downloads.",
      "Reduced data export time by 50%, cutting the average export from 15–20 minutes to 7–10 minutes.",
      "Built a proof-of-concept walkthrough component for ECG’s internal console, reducing the instructional video needed for onboarding from 8–10 minutes to 1–2 minutes.",
      "Built a custom tooltip (walkthrough) component that a major team in the organization adapted for their own use case.",
      "Implemented UI and logic fixes for the University of Ghana Department of Computer Science website, integrating Strapi CMS in some sections for dynamic content and easier maintenance.",
      "Resolved critical bugs across the university admission management console, improving functionality and user experience while keeping the system stable.",
      "Migrated a legacy application from the deprecated Create React App to Vite.",
      "Implemented analytics features and bug fixes on the Emrys Business Suite (emrysglobal.com).",
      "Ran code review sessions with fellow engineers and helped mentor an intern in HTML, CSS and JavaScript.",
    ],
    techStack: ["TypeScript", "React", "Next.js", "Node.js", "GraphQL", "MongoDB", "RabbitMQ", "Docker", "Vitest", "Strapi", "AWS"],
  },
  "dimax digital|software engineer": {
    achievements: [
      "Led frontend engineering for a B2B platform approaching its MVP launch, owning architecture, implementation and delivery.",
      "Built and integrated the entire frontend application with backend services, enabling secure, real-time, data-driven workflows.",
      "Established a scalable UI architecture, reusable component systems and performance optimization standards to support long-term growth.",
    ],
    techStack: ["TypeScript", "React", "Next.js", "Node.js", "Laravel", "PostgreSQL", "Docker", "AWS"],
  },
  "turntabl|software engineer": {
    achievements: [
      "Served as team lead and full-stack engineer, making sure every requirement defined for the product WhisperBox was technically met.",
      "Built the entire proof-of-concept demo backend in less than 12 hours and made key integrations on the frontend.",
    ],
    techStack: ["TypeScript", "Next.js", "Node.js", "Spring Boot", "PostgreSQL", "Docker", "MongoDB"],
  },
  "leadmonger|frontend web developer": {
    achievements: [
      "Worked closely with a team of designers to develop visually appealing, highly responsive websites and web apps for clients.",
      "Delivered websites and web apps that met clients’ expectations in both visual aesthetics and functionality.",
      "Worked one on one with clients while syncing with the team to develop exceptional products.",
      "Conducted basic user experience research and implemented the feedback to improve the experience on every platform I built.",
    ],
    techStack: ["TypeScript", "React"],
  },
  "andela|frontend engineer trainee": {
    achievements: [
      "Collaborated intensively with both new and experienced developers to learn and build with React and Next.js.",
      "Worked within a community of learners and technical mentors, completing assessments and project tasks.",
    ],
    techStack: ["TypeScript", "React", "Next.js", "Node.js", "Test Driven Development"],
  },
};

const keyOf = ({ company, role }) => `${company}|${role}`.trim().toLowerCase();

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  assert(projectId, "Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
  let token = process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_AUTH_TOKEN;
  if (!token) token = JSON.parse(readFileSync(path.join(homedir(), ".config/sanity/config.json"), "utf8")).authToken;
  assert(token, "A signed-in Sanity CLI session or write token is required");
  const client = createClient({ projectId, dataset, token, apiVersion: "2026-09-20", useCdn: false, perspective: "raw" });

  const documents = await client.fetch(`*[_id in ["portfolio", "drafts.portfolio"]]`);
  assert(documents.some(({ _id }) => _id === "portfolio"), "The published portfolio document was not found");

  const plans = documents.map((document) => {
    const sets = {};
    for (const entry of document.experiences ?? []) {
      const detail = details[keyOf(entry)];
      const label = `${entry.company} | ${entry.role}`;
      if (!detail) { console.log(`${document._id}: no details for ${label}`); continue; }
      if (!entry.achievements?.length) sets[`experiences[_key=="${entry._key}"].achievements`] = detail.achievements;
      if (!entry.techStack?.length) sets[`experiences[_key=="${entry._key}"].techStack`] = detail.techStack;
      console.log(`${document._id}: ${label} → ${entry.achievements?.length ? "keep" : "fill"} highlights, ${entry.techStack?.length ? "keep" : "fill"} tech stack`);
    }
    return { document, sets };
  });
  if (!apply) return;

  const backupDir = mkdtempSync(path.join(tmpdir(), "portfolio-experience-details-"));
  writeFileSync(path.join(backupDir, "before.json"), JSON.stringify(documents, null, 2));
  console.log(`Backup: ${backupDir}`);

  let transaction = client.transaction();
  for (const { document, sets } of plans) {
    if (Object.keys(sets).length) transaction = transaction.patch(document._id, (patch) => patch.ifRevisionId(document._rev).set(sets));
  }
  await transaction.commit({ visibility: "sync" });

  const updated = await client.fetch(`*[_id in ["portfolio", "drafts.portfolio"]]`);
  for (const { document } of plans) {
    const current = updated.find(({ _id }) => _id === document._id);
    const currentEntries = current.experiences ?? [];
    const beforeEntries = document.experiences ?? [];
    assert.equal(currentEntries.length, beforeEntries.length, "Entry count changed");
    currentEntries.forEach((entry, index) => {
      const before = beforeEntries[index];
      const detail = details[keyOf(entry)];
      assert.equal(entry._key, before._key);
      assert.deepEqual(entry.achievements, before.achievements?.length ? before.achievements : detail?.achievements ?? before.achievements);
      assert.deepEqual(entry.techStack, before.techStack?.length ? before.techStack : detail?.techStack ?? before.techStack);
      const strip = ({ achievements, techStack, ...rest }) => rest;
      assert.deepEqual(strip(entry), strip(before), `Other fields changed on ${entry.company}`);
    });
    const { experiences: a, _rev: r1, _updatedAt: u1, ...restAfter } = current;
    const { experiences: b, _rev: r2, _updatedAt: u2, ...restBefore } = document;
    assert.deepEqual(restAfter, restBefore, "Unrelated document fields changed");
  }
  console.log("Verified: highlights and tech stacks filled; nothing else changed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
