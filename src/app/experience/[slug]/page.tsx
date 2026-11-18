import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TechStackCard from "@/components/core/TechStackCard";
import PillLink from "@/components/layout/PillLink";
import { withSlugs } from "@/content/experience";
import { getPortfolioContent } from "@/sanity/fetchPortfolio";

type Params = Promise<{ slug: string }>;

async function getRole(slug: string) {
  const { experiences } = await getPortfolioContent();
  return withSlugs(experiences ?? []).find((experience) => experience.slug === slug);
}

export async function generateStaticParams() {
  const { experiences } = await getPortfolioContent();
  return withSlugs(experiences ?? []).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const role = await getRole((await params).slug);
  if (!role) return { title: "Role not found | Selasie Sepenu" };
  return {
    title: `${role.role} at ${role.company} | Selasie Sepenu`,
    description: role.achievements?.[0] ?? `${role.role} at ${role.company}, ${role.period}.`,
  };
}

export default async function ExperienceDetailPage({ params }: { params: Params }) {
  const role = await getRole((await params).slug);
  if (!role) notFound();

  const achievements = role.achievements ?? [];
  const techStack = role.techStack ?? [];
  const hasLogo = role.logo && !role.logo.endsWith("/assets/project.png");

  return (
    <main className="flex w-full flex-col items-start">
      <PillLink href="/experience" label="Work Experience" caret="left" />

      <article className="mt-8 w-full">
        <header className="flex items-start gap-4">
          {hasLogo && (
            // eslint-disable-next-line @next/next/no-img-element -- small logo served from Sanity's CDN
            <img
              src={role.logo}
              alt=""
              className="mt-1 h-11 w-11 shrink-0 rounded-lg border border-gray-100 bg-white object-cover dark:border-neutral-800"
            />
          )}
          <div className="min-w-0">
            <h1 className="text-2xl leading-tight text-black dark:text-neutral-100 mono">{role.role}</h1>
            <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-neutral-300">{role.company}</p>
            <p className="text-xs leading-5 text-gray-500 dark:text-neutral-400">{role.period}</p>
          </div>
        </header>

        {achievements.length > 0 && (
          <section className="mt-10" aria-labelledby="impact-heading">
            <h2 id="impact-heading" className="text-lg text-black dark:text-neutral-100 mono">Impact</h2>
            <ul className="mt-4 space-y-3">
              {achievements.map((achievement) => (
                <li key={achievement} className="flex gap-3 text-sm leading-6 text-gray-600 dark:text-neutral-300">
                  <span aria-hidden className="mt-[0.6rem] h-1 w-1 shrink-0 rounded-full bg-gray-400 dark:bg-neutral-500" />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {techStack.length > 0 && (
          <section className="mt-10" aria-labelledby="stack-heading">
            <h2 id="stack-heading" className="text-lg text-black dark:text-neutral-100 mono">Tech stack</h2>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {techStack.map((tech) => (
                <TechStackCard key={tech} title={tech} sm={false} />
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
