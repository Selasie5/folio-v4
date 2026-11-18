import Image from "next/image";
import type { OrganizationContent } from "@/content/types";

export default function Organizations({ heading, organizations }: {
  heading: string;
  organizations: OrganizationContent[];
}) {
  const visibleOrganizations = organizations.filter(({ name, logo }) => name?.trim() && logo);
  if (!visibleOrganizations.length) return null;

  return (
    <section className="mt-14 w-full sm:mt-16" aria-labelledby="organizations-heading">
      <h2 id="organizations-heading" className="text-lg text-black dark:text-neutral-100 mono">{heading}</h2>
      <ul className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-6 sm:gap-x-10">
        {visibleOrganizations.map(({ name, logo, url }, index) => {
          const content = (
            <Image src={logo} alt={name} width={120} height={36} sizes="120px" className="h-8 w-auto max-w-[120px] object-contain grayscale opacity-60" />
          );
          const className = "flex min-h-11 items-center justify-start";
          return (
            <li key={`${name}-${index}`} className="min-w-0">
              {url && /^https?:\/\//i.test(url) ? (
                <a href={url} target="_blank" rel="noopener noreferrer" className={`${className} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500`}>
                  {content}
                </a>
              ) : <div className={className}>{content}</div>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
