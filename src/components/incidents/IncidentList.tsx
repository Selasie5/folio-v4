import Link from "next/link";
import MoreLink from "@/components/core/MoreLink";
import { formatIncidentDate, type Incident } from "@/content/incidents";

/** Incident write-ups as a list: the same dotted, focus-fading rows as Writing and Experience. */
export function IncidentList({ incidents }: { incidents: Incident[] }) {
  return (
    <ul className="focus-list w-full divide-y divide-dotted divide-gray-300 border-y border-dotted border-gray-300 dark:divide-neutral-700 dark:border-neutral-700">
      {incidents.map((incident) => (
        <li key={incident.slug}>
          <Link
            href={`/incidents/${incident.slug}`}
            className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6"
          >
            <div className="min-w-0">
              <h3 className="text-sm leading-5 text-black dark:text-white">{incident.title}</h3>
              <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-neutral-400">{incident.summary}</p>
            </div>
            <time dateTime={incident.date} className="whitespace-nowrap text-xs leading-5 text-gray-500 dark:text-neutral-400 sm:text-right">
              {formatIncidentDate(incident.date)}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Home-page section. */
export default function IncidentNotes({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) return null;

  return (
    <section className="mt-14 w-full sm:mt-16" aria-labelledby="incidents-heading">
      <div className="flex items-center justify-between gap-4">
        <h2 id="incidents-heading" className="text-lg text-black dark:text-neutral-100 mono">Incident Notes</h2>
        <MoreLink href="/incidents" label="All incidents" />
      </div>
      <div className="mt-5"><IncidentList incidents={incidents.slice(0, 3)} /></div>
    </section>
  );
}
