import booksData from "./books.json";

/** A book on the Bookshelf. `cover` is an image URL (Sanity CDN, or /books/… for local copies). */
export interface Book {
  slug: string;
  title: string;
  author: string;
  cover: string;
  year?: number;
  link?: string;
}

// Local copies, used only if Sanity can't be reached. Covers live in public/books/.
// Kept as JSON so scripts/seed-books.mjs can read them.
export const books: Book[] = booksData;
