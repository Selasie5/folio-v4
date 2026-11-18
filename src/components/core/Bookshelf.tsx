import BookCover from "@/components/core/BookCover";
import MoreLink from "@/components/core/MoreLink";
import type { Book } from "@/content/books";

/** How many books the home page shows before linking to /books. */
export const BOOK_PREVIEW_COUNT = 3;

/** Home-page section: the first few book covers, with a link to the full shelf. */
export default function Bookshelf({ books }: { books: Book[] }) {
  if (books.length === 0) return null;

  return (
    <section className="mt-14 w-full sm:mt-16" aria-labelledby="books-heading">
      <div className="flex items-center justify-between gap-4">
        <h2 id="books-heading" className="text-lg text-black dark:text-neutral-100 mono">Bookshelf</h2>
        {books.length > BOOK_PREVIEW_COUNT && <MoreLink href="/books" label="View all" />}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-4 sm:gap-6">
        {books.slice(0, BOOK_PREVIEW_COUNT).map((book) => (
          <BookCover key={book.slug} book={book} />
        ))}
      </div>
    </section>
  );
}
