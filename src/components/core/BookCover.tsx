import type { Book } from "@/content/books";

/** A book's cover with its title and author underneath. Links out if the book has a link. */
export default function BookCover({ book }: { book: Book }) {
  const cover = (
    <div className="relative overflow-hidden rounded-[3px] bg-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_20px_-6px_rgba(0,0,0,0.25)] ring-1 ring-black/5 transition-transform duration-300 ease-out group-hover:-translate-y-1 dark:bg-neutral-800 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_10px_24px_-8px_rgba(0,0,0,0.8)] dark:ring-white/10">
      {/* eslint-disable-next-line @next/next/no-img-element -- covers come from Sanity's image CDN or /public */}
      <img src={book.cover} alt={`Cover of ${book.title}`} loading="lazy" className="block aspect-[7/10] h-full w-full object-cover" />
      {/* A soft highlight down the spine edge, so it reads as a physical book. */}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-[6%] bg-gradient-to-r from-black/15 via-white/10 to-transparent" />
    </div>
  );

  const caption = (
    <div className="mt-3 min-w-0">
      <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-black dark:text-white">{book.title}</h3>
      <p className="mt-0.5 line-clamp-1 text-xs leading-5 text-gray-500 dark:text-neutral-400">{book.author}</p>
    </div>
  );

  return book.link ? (
    <a href={book.link} target="_blank" rel="noopener noreferrer" className="group block">
      {cover}
      {caption}
    </a>
  ) : (
    <div className="group">
      {cover}
      {caption}
    </div>
  );
}
