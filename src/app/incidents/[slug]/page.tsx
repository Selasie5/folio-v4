import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StatusTag from "@/components/core/StatusTag";
import TechStackCard from "@/components/core/TechStackCard";
import IncidentTimeline from "@/components/incidents/IncidentTimeline";
import PageTopBar from "@/components/layout/PageTopBar";
import SectionIndicator from "@/components/layout/SectionIndicator";
import { formatIncidentDate, getIncident, incidents } from "@/content/incidents";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return incidents.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const incident = getIncident((await params).slug);
  if (!incident) return { title: "Incident not found | Selasie Sepenu" };
  return { title: `${incident.title} | Incident Notes | Selasie Sepenu`, description: incident.summary };
}

export default async function IncidentPage({ params }: { params: Params }) {
  const incident = getIncident((await params).slug);
  if (!incident) notFound();

  const facts = [
    { label: "Impact", value: incident.impact },
    { label: "Root cause", value: incident.rootCause },
    { label: "Resolution", value: incident.resolution },
    { label: "Time to fix", value: incident.duration },
  ];

  return (
    <main className="flex w-full flex-col items-start">
      <SectionIndicator />
      <PageTopBar href="/incidents" label="Incident Notes" />

      <article className="mt-8 w-full">
        <header>
          <h1 className="text-2xl leading-tight text-black dark:text-neutral-100 mono">{incident.title}</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-neutral-400">{incident.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500 dark:text-neutral-400">
            <StatusTag status="Resolved" />
            <span aria-hidden>·</span>
            <time dateTime={incident.date}>{formatIncidentDate(incident.date)}</time>
            <span aria-hidden>·</span>
            <span>{incident.environment}</span>
          </div>
        </header>

        {/* The postmortem at a glance, before the story. */}
        {/* Set out as lines, in the same dotted rows as the site's lists. */}
        <dl className="mt-8 w-full divide-y divide-dotted divide-gray-300 border-y border-dotted border-gray-300 dark:divide-neutral-700 dark:border-neutral-700">
          {facts.map(({ label, value }) => (
            <div key={label} className="grid gap-1 py-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-6">
              <dt className="text-xs leading-[22px] text-gray-500 dark:text-neutral-400">{label}</dt>
              <dd className="text-sm leading-[22px] text-gray-700 dark:text-neutral-200">{value}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-12" aria-labelledby="timeline-heading">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="timeline-heading" className="text-lg text-black dark:text-neutral-100 mono">Timeline</h2>
            <span className="text-[11px] text-gray-400 dark:text-neutral-500">Times are approximate</span>
          </div>
          <div className="mt-4">
            <IncidentTimeline steps={incident.steps} />
          </div>
        </section>

        <section className="mt-14" aria-labelledby="lessons-heading">
          <h2 id="lessons-heading" className="text-lg text-black dark:text-neutral-100 mono">What I&apos;d do again</h2>
          <ol className="mt-4 space-y-3">
            {incident.lessons.map((lesson, index) => (
              <li key={lesson} className="flex gap-3 text-sm leading-6 text-gray-600 dark:text-neutral-300">
                <span aria-hidden className="w-5 shrink-0 font-mono text-xs leading-6 text-gray-400 dark:text-neutral-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{lesson}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12" aria-labelledby="incident-stack-heading">
          <h2 id="incident-stack-heading" className="text-lg text-black dark:text-neutral-100 mono">Stack involved</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {incident.stack.map((tech) => (
              <TechStackCard key={tech} title={tech} sm={false} />
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
