// Copies the Bookshelf from src/content/books.json into Sanity as `book` documents, uploading each
// cover from public/ as an image asset. Books that already exist are left alone, so Studio edits win.
// Preview by default; pass --apply to write.
import assert from "node:assert/strict";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import nextEnv from "@next/env";

const root = fileURLToPath(new URL("../", import.meta.url));
nextEnv.loadEnvConfig(root);
const apply = process.argv.includes("--apply");
const books = JSON.parse(readFileSync(path.join(root, "src/content/books.json"), "utf8"));

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  assert(projectId, "Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
  let token = process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_AUTH_TOKEN;
  if (!token) token = JSON.parse(readFileSync(path.join(homedir(), ".config/sanity/config.json"), "utf8")).authToken;
  assert(token, "A signed-in Sanity CLI session or write token is required");
  const client = createClient({ projectId, dataset, token, apiVersion: "2026-09-20", useCdn: false, perspective: "raw" });

  assert.equal(new Set(books.map(({ slug }) => slug)).size, books.length, "Duplicate books in books.json");
  for (const book of books) assert(existsSync(path.join(root, "public", book.cover)), `Missing cover file public${book.cover}`);

  const existing = await client.fetch(`*[_type == "book" && !(_id in path("drafts.**"))]{ _id, title }`);
  const existingIds = new Set(existing.map(({ _id }) => _id));
  // A book added in Studio has a random ID: recognise it by title instead of duplicating it.
  const existingTitles = new Map(existing.map(({ _id, title }) => [String(title).trim().toLowerCase(), _id]));
  const toCreate = books
    .map((book, index) => ({ book, id: `book-${book.slug}`, order: (index + 1) * 10 }))
    .filter(({ book, id }) => {
      const owner = existingTitles.get(book.title.trim().toLowerCase());
      const keep = existingIds.has(id) || (owner && owner !== id);
      console.log(`${keep ? `exists${owner && owner !== id ? ` as ${owner}` : ""}, keep` : "create"} | ${book.title}`);
      return !keep;
    });
  if (!apply || toCreate.length === 0) return;

  let transaction = client.transaction();
  for (const { book, id, order } of toCreate) {
    const asset = await client.assets.upload("image", createReadStream(path.join(root, "public", book.cover)), {
      filename: path.basename(book.cover),
      title: `${book.title} cover`,
    });
    const document = {
      _id: id,
      _type: "book",
      title: book.title,
      author: book.author,
      cover: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
      order,
    };
    if (book.year) document.year = book.year;
    if (book.link) document.link = book.link;
    transaction = transaction.createIfNotExists(document);
    console.log(`uploaded cover for ${book.title}`);
  }
  await transaction.commit({ visibility: "sync" });

  const saved = await client.fetch(`*[_type == "book" && _id in $ids]{ _id, title, "cover": cover.asset->url }`, { ids: toCreate.map(({ id }) => id) });
  assert.equal(saved.length, toCreate.length, "Not every book was saved");
  for (const book of saved) assert(book.cover, `No cover saved for ${book.title}`);
  console.log(`Verified ${saved.length} books with covers in Sanity.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
