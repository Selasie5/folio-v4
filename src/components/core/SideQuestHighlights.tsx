import type { SideQuestHighlight } from "@/content/sidequests";

/** Key facts about a side quest, shown as a row of cards above its story. */
export default function SideQuestHighlights({ highlights }: { highlights: SideQuestHighlight[] }) {
  if (highlights.length === 0) return null;

  const columns = highlights.length >= 4 ? "sm:grid-cols-4" : highlights.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <dl aria-label="Highlights" className={`mt-8 grid grid-cols-2 gap-2.5 ${columns}`}>
      {highlights.map((highlight, index) => (
        <div
          key={index}
          className="flex flex-col gap-1 rounded-xl border border-dotted border-gray-300 bg-gray-50/60 px-3.5 py-3 dark:border-neutral-700 dark:bg-neutral-900/40"
        >
          {/* The label is the term and the value its description; the value is shown first visually. */}
          <dt className="text-xs leading-5 text-gray-500 dark:text-neutral-400">{highlight.label}</dt>
          <dd className="order-first text-lg font-medium leading-tight tracking-tight text-black dark:text-white">
            {highlight.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
