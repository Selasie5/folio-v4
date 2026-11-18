import type { Metadata } from "next";
import BookCover from "@/components/core/BookCover";
import PageTopBar from "@/components/layout/PageTopBar";
import { getBooks } from "@/sanity/fetchBooks";

export const metadata: Metadata = {
  title: "Bookshelf | Selasie Sepenu",
  description: "Books on engineering, building companies and money that Selasie Sepenu recommends.",
};

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <main className="flex w-full flex-col items-start">
      <PageTopBar href="/" label="Back home" />
      <header className="mt-8">
        <h1 className="text-2xl leading-tight text-black dark:text-neutral-100 mono">Bookshelf</h1>
        <p className="mt-3 max-w-[52ch] text-sm leading-6 text-gray-500 dark:text-neutral-400">
          Books on engineering, building companies and money that shaped how I work.
        </p>
      </header>
      <div className="mt-8 grid w-full grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 sm:gap-x-6">
        {books.map((book) => (
          <BookCover key={book.slug} book={book} />
        ))}
      </div>
    </main>
  );
}
