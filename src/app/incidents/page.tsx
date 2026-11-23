import type { Metadata } from "next";
import { IncidentList } from "@/components/incidents/IncidentList";
import PageTopBar from "@/components/layout/PageTopBar";
import { incidents } from "@/content/incidents";

export const metadata: Metadata = {
  title: "Incident Notes | Selasie Sepenu",
  description: "Outages I've worked, written up as interactive timelines: what broke, how I found it, and what I'd do again.",
};

export default function IncidentsPage() {
  return (
    <main className="flex w-full flex-col items-start">
      <PageTopBar href="/" label="Back home" />
      <header className="mt-8">
        <h1 className="text-2xl leading-tight text-black dark:text-neutral-100 mono">Incident Notes</h1>
        <p className="mt-3 max-w-[52ch] text-sm leading-6 text-gray-500 dark:text-neutral-400">
          Outages I&apos;ve worked, written up as timelines: the symptom, the false leads, the evidence and the fix. Names and hosts are left out.
        </p>
      </header>
      <div className="mt-8 w-full">
        <IncidentList incidents={incidents} />
      </div>
    </main>
  );
}
