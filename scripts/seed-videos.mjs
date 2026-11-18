// Copies the Video Library from src/content/videos.json into Sanity as `video` documents.
// Videos that already exist are left alone, so Studio edits win. Preview by default; pass --apply to write.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import nextEnv from "@next/env";

const root = fileURLToPath(new URL("../", import.meta.url));
nextEnv.loadEnvConfig(root);
const apply = process.argv.includes("--apply");
const videos = JSON.parse(readFileSync(path.join(root, "src/content/videos.json"), "utf8"));

const toDocument = (video, index) => {
  assert(/^[A-Za-z0-9_-]{11}$/.test(video.youtubeId), `Bad YouTube ID: ${video.youtubeId}`);
  const document = {
    _id: `video-${video.youtubeId}`,
    _type: "video",
    youtubeId: video.youtubeId,
    title: video.title,
    order: (index + 1) * 10,
  };
  if (video.channel) document.channel = video.channel;
  if (video.description) document.description = video.description;
  if (video.durationSeconds) document.durationSeconds = video.durationSeconds;
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

  const documents = videos.map(toDocument);
  assert.equal(new Set(documents.map(({ _id }) => _id)).size, documents.length, "Duplicate videos in videos.json");
  const saved0 = await client.fetch(`*[_type == "video" && !(_id in path("drafts.**"))]{ _id, youtubeId }`);
  const existing = new Set(saved0.map(({ _id }) => _id));
  // A video added in Studio has a random ID: recognise it by its YouTube ID instead of duplicating it.
  const byYoutubeId = new Map(saved0.map(({ _id, youtubeId }) => [youtubeId, _id]));
  const toCreate = documents.filter((document) => {
    const owner = byYoutubeId.get(document.youtubeId);
    if (owner && owner !== document._id) {
      console.log(`exists as ${owner}, keep | ${document.title}`);
      return false;
    }
    console.log(`${existing.has(document._id) ? "exists, keep" : "create"} | ${document.title}`);
    return true;
  });
  if (!apply) return;

  let transaction = client.transaction();
  for (const document of toCreate) transaction = transaction.createIfNotExists(document);
  await transaction.commit({ visibility: "sync" });

  const saved = await client.fetch(`*[_type == "video" && _id in $ids]`, { ids: toCreate.map(({ _id }) => _id) });
  assert.equal(saved.length, toCreate.length, "Not every video was saved");
  for (const document of toCreate) {
    if (existing.has(document._id)) continue;
    const { _rev, _createdAt, _updatedAt, ...fields } = saved.find(({ _id }) => _id === document._id);
    assert.deepEqual(fields, document, `Saved fields differ for ${document._id}`);
  }
  console.log(`Verified ${saved.length} videos in Sanity.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
