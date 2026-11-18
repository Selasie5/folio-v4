// Copies every published dev.to article into Sanity as a `post` document.
// Preview by default; pass --apply to write. Re-running refreshes existing posts.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import { createClient } from "@sanity/client";
import nextEnv from "@next/env";
import { addGuardedWrites, explainWriteError, fetchTargets } from "./lib/guarded-write.mjs";

const DEVTO_USERNAME = "selasie5";
const root = fileURLToPath(new URL("../", import.meta.url));
nextEnv.loadEnvConfig(root);
const apply = process.argv.includes("--apply");

async function devto(pathname) {
  const response = await fetch(`https://dev.to/api${pathname}`, { headers: { Accept: "application/vnd.forem.api-v1+json" } });
  assert(response.ok, `dev.to ${pathname} returned ${response.status}`);
  return response.json();
}

async function loadArticles() {
  // /articles/latest is not cached like /articles, so brand-new posts show up immediately.
  const list = await devto(`/articles/latest?username=${DEVTO_USERNAME}&per_page=1000`);
  const articles = [];
  for (const { slug } of list) {
    articles.push(await devto(`/articles/${DEVTO_USERNAME}/${slug}`));
    await sleep(300);
  }
  return articles;
}

function toDocument(article) {
  const tags = Array.isArray(article.tag_list)
    ? article.tag_list
    : String(article.tag_list ?? "").split(",").map((tag) => tag.trim()).filter(Boolean);
  const document = {
    _id: `post-devto-${article.id}`,
    _type: "post",
    source: "devto",
    title: article.title,
    slug: { _type: "slug", current: article.slug },
    publishedAt: article.published_at,
    description: article.description ?? "",
    tags,
    readingTimeMinutes: article.reading_time_minutes,
    url: article.url,
    devtoId: article.id,
    bodyHtml: article.body_html,
  };
  if (article.cover_image) document.coverImage = article.cover_image;
  return document;
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

  const documents = (await loadArticles()).map(toDocument);
  for (const document of documents) assert(document.bodyHtml, `No body returned for ${document.slug.current}`);
  const existing = await client.fetch(`*[_type == "post"]{_id, "slug": slug.current}`);
  const existingIds = new Set(existing.map(({ _id }) => _id));
  for (const document of documents) {
    const clash = existing.find(({ slug, _id }) => slug === document.slug.current && _id !== document._id);
    assert(!clash, `Slug ${document.slug.current} is already used by ${clash?._id}`);
  }

  console.log(JSON.stringify({ mode: apply ? "apply" : "preview", projectId, dataset, devtoArticles: documents.length, existingPosts: existing.length }, null, 2));
  for (const { _id, title, publishedAt } of documents) {
    console.log(`${existingIds.has(_id) ? "update" : "create"} | ${publishedAt.slice(0, 10)} | ${title}`);
  }
  if (!apply) return;

  const backupDir = mkdtempSync(path.join(tmpdir(), "portfolio-posts-sync-"));
  // Back up exactly the documents this sync can overwrite, and write only if they haven't changed since.
  const targets = await fetchTargets(client, documents);
  writeFileSync(path.join(backupDir, "before.json"), JSON.stringify([...targets.values()], null, 2));
  console.log(`Backup: ${backupDir}`);

  await addGuardedWrites(client.transaction(), documents, targets)
    .commit({ visibility: "sync" })
    .catch((error) => {
      throw explainWriteError(error);
    });

  const ids = documents.map(({ _id }) => _id);
  const saved = await client.fetch(`*[_id in $ids]{ _id, "slug": slug.current, bodyHtml }`, { ids });
  assert.equal(saved.length, documents.length, "Not every post was saved");
  for (const document of documents) {
    const current = saved.find(({ _id }) => _id === document._id);
    assert(current && current.slug === document.slug.current && current.bodyHtml === document.bodyHtml, `Readback differs: ${document._id}`);
  }
  console.log(`Verified ${saved.length} posts in Sanity.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
