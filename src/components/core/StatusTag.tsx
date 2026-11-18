// Coloured pill for a side quest's status. Unknown statuses fall back to grey.
const tones: Record<string, string> = {
  active:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  building: "bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20",
  "waitlist open":
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
};

const fallback = "bg-gray-100 text-gray-600 ring-gray-500/15 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700";

export default function StatusTag({ status }: { status: string }) {
  const key = status.trim().toLowerCase();
  const tone = Object.hasOwn(tones, key) ? tones[key] : fallback;

  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium leading-4 ring-1 ring-inset ${tone}`}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}
