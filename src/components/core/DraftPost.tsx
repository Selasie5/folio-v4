import { PencilSquareIcon } from "@heroicons/react/20/solid";

/** Small label marking an unpublished post, in lists and on the post itself. */
export function DraftTag() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-gray-300 px-2 py-0.5 text-[11px] leading-4 text-gray-600 dark:border-neutral-600 dark:text-neutral-300">
      <PencilSquareIcon aria-hidden className="h-3 w-3" />
      Draft
    </span>
  );
}

// Fixed filler under the blur. The draft's real text never reaches the page
// (see draftPreview), because CSS blur is only visual and can be undone in devtools.
const PLACEHOLDER = [
  "This section is still being written. The notes, numbers and examples that belong here are being checked before they go out, so for now the rest of the article stays private.",
  "Each part walks through what was measured, why it mattered and what changed, with the details that make it useful to someone building something similar.",
  "When the article is published, this space fills in and the draft label comes off. Until then, the opening above gives a sense of where it is going.",
  "There is more to come after this, including the results and a short checklist to take away.",
];

/** Stands in for the unpublished part of a draft: blurred filler with a note on top. */
export function DraftRemainder() {
  return (
    <section className="relative mt-8" aria-label="Rest of the article">
      <p className="sr-only">The rest of this article is a draft and isn&apos;t public yet.</p>
      <div aria-hidden className="article-body pointer-events-none select-none blur-[6px]">
        <h2>Coming soon</h2>
        {PLACEHOLDER.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white dark:via-[#111111]/40 dark:to-[#111111]"
      />
      <div aria-hidden className="absolute inset-x-0 top-1/3 flex justify-center px-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-3.5 py-1.5 text-xs text-gray-600 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-300">
          <PencilSquareIcon className="h-3.5 w-3.5" />
          Still a draft. The rest of this article is on its way.
        </span>
      </div>
    </section>
  );
}
