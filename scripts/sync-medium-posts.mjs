// Copies articles from the Medium RSS feed into Sanity as `post` documents (source: "medium").
// Medium's feed only includes the most recent ~10 stories.
// Preview by default; pass --apply to write. Re-running refreshes existing posts.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import nextEnv from "@next/env";
import { addGuardedWrites, explainWriteError, fetchTargets } from "./lib/guarded-write.mjs";

const MEDIUM_USERNAME = "selasisepenu5";
const WORDS_PER_MINUTE = 238;
const root = fileURLToPath(new URL("../", import.meta.url));
nextEnv.loadEnvConfig(root);
const apply = process.argv.includes("--apply");

const unwrap = (value) => value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
function tag(xml, name) {
  const start = xml.indexOf(`<${name}`);
  if (start < 0) return "";
  const open = xml.indexOf(">", start) + 1;
  return unwrap(xml.slice(open, xml.indexOf(`</${name}>`, open)));
}
const decode = (text) =>
  text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;/g, " ");
const plain = (html) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

function toDocument(item) {
  const url = tag(item, "link").split("?")[0];
  const id = tag(item, "guid").split("/").pop();
  // The GUID is the post's identity; without it two items could share an ID and overwrite each other.
  if (!/^[a-z0-9]+$/i.test(id ?? "")) throw new Error(`Medium item "${decode(tag(item, "title"))}" has no usable GUID; refusing to import it.`);
  const slug = url.split("/").pop();
  let body = tag(item, "content:encoded");

  // Medium appends a tracking pixel to every feed item.
  body = body.replace(/<img[^>]+src="https:\/\/medium\.com\/_\/stat[^"]*"[^>]*>/g, "");

  // An uncaptioned figure at the very top is the story's cover image.
  // A captioned one stays in the body, so its caption isn't lost.
  let coverImage;
  const lead = body.match(/^\s*<figure>\s*<img[^>]+src="([^"]+)"[^>]*\/?>\s*<\/figure>/);
  if (lead) {
    coverImage = lead[1];
    body = body.slice(lead[0].length);
  }

  // Medium uses h3 for section titles and h4 for sub-titles; match the site's h2/h3 article styles.
  // Order matters: move h3 up first, then h4 into the freed h3 level.
  body = body.replace(/<(\/?)h3(?=[\s>])/g, "<$1h2").replace(/<(\/?)h4(?=[\s>])/g, "<$1h3");

  const firstParagraph = plain((body.match(/<p>([\s\S]*?)<\/p>/) || [])[1] ?? "");
  const description = firstParagraph.length > 200 ? `${firstParagraph.slice(0, 197).replace(/\s+\S*$/, "")}…` : firstParagraph;
  const words = plain(body).split(" ").filter(Boolean).length;
  const tags = [...item.matchAll(/<category>([\s\S]*?)<\/category>/g)].map((match) => unwrap(match[1]));

  const document = {
    _id: `post-medium-${id}`,
    _type: "post",
    source: "medium",
    title: decode(tag(item, "title")),
    slug: { _type: "slug", current: slug },
    publishedAt: new Date(tag(item, "pubDate")).toISOString(),
    description,
    tags,
    readingTimeMinutes: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)),
    url,
    bodyHtml: body.trim(),
  };
  if (coverImage) document.coverImage = coverImage;
  return document;
}

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  assert(projectId, "Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
  let token = process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_AUTH_TOKEN;
  if (!token) token = JSON.parse(readFileSync(path.join(homedir(), ".config/sanity/config.json"), "utf8")).authToken;
  assert(token, "A signed-in Sanity CLI session or write token is required");
  const client = createClient({ projectId, dataset, token, apiVersion: "2026-09-20", useCdn: false, perspective: "raw" });

  const response = await fetch(`https://medium.com/feed/@${MEDIUM_USERNAME}`, { headers: { "User-Agent": "Mozilla/5.0 (portfolio feed reader)" } });
  assert(response.ok, `Medium feed returned ${response.status}`);
  const feed = await response.text();
  const documents = feed.split("<item>").slice(1).map(toDocument);
  for (const document of documents) assert(document.bodyHtml && document.slug.current, `Incomplete feed item: ${document.title}`);

  const existing = await client.fetch(`*[_type == "post"]{_id, "slug": slug.current}`);
  for (const document of documents) {
    // Compare canonical IDs, so a post's own draft (drafts.<id>) or release version isn't a clash.
    const canonical = (id) => id.replace(/^drafts\./, "").replace(/^versions\.[^.]+\./, "");
    const clash = existing.find(({ slug, _id }) => slug === document.slug.current && canonical(_id) !== document._id);
    assert(!clash, `Slug ${document.slug.current} is already used by ${clash?._id}`);
  }

  console.log(JSON.stringify({ mode: apply ? "apply" : "preview", mediumStories: documents.length }, null, 2));
  for (const { _id, title, publishedAt, readingTimeMinutes, coverImage } of documents) {
    console.log(`${existing.some((post) => post._id === _id) ? "update" : "create"} | ${publishedAt.slice(0, 10)} | ${readingTimeMinutes} min | ${coverImage ? "cover" : "no cover"} | ${title}`);
  }
  if (!apply) return;

  const backupDir = mkdtempSync(path.join(tmpdir(), "portfolio-medium-sync-"));
  // Back up exactly the documents this sync can overwrite (by ID, not by the editable source field),
  // and write only if they haven't changed since.
  const targets = await fetchTargets(client, documents);
  writeFileSync(path.join(backupDir, "before.json"), JSON.stringify([...targets.values()], null, 2));
  console.log(`Backup: ${backupDir}`);

  await addGuardedWrites(client.transaction(), documents, targets)
    .commit({ visibility: "sync" })
    .catch((error) => {
      throw explainWriteError(error);
    });

  const saved = await client.fetch(`*[_id in $ids]{_id, "slug": slug.current, bodyHtml}`, { ids: documents.map(({ _id }) => _id) });
  for (const document of documents) {
    const current = saved.find(({ _id }) => _id === document._id);
    assert(current && current.slug === document.slug.current && current.bodyHtml === document.bodyHtml, `Readback differs: ${document._id}`);
  }
  console.log(`Verified ${saved.length} Medium posts in Sanity.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
