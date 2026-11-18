import type { CSSProperties } from "react";
import type { BiographyLink } from "@/content/types";

function InlineLink({ label, href, brand }: BiographyLink) {
  if (!href || !/^(https?:\/\/|mailto:)/i.test(href)) {
    return <span className="underline decoration-current/40 underline-offset-4">{label}</span>;
  }

  return (
    <a
      href={href}
      className={brand ? `bio-brand-link bio-brand-${brand}` : "bio-text-link"}
    >
      {brand && (
        <span className="bio-brand-icon-slot" aria-hidden="true">
          <span
            className="bio-brand-icon"
            style={{ "--brand-icon": `url('/brands/${brand === "blackhorse" ? "blackhorse.png" : `${brand}.svg`}')` } as CSSProperties}
          />
        </span>
      )}
      <span className="relative">{label}</span>
    </a>
  );
}

export default function Biography({ paragraphs, links = [] }: { paragraphs: string[]; links?: BiographyLink[] }) {
  const linksByLabel = new Map(links.filter((link) => link.label.trim()).map((link) => [link.label, link]));
  const labels = [...linksByLabel.keys()].sort((a, b) => b.length - a.length);
  const pattern = labels.length
    ? new RegExp(`\\b(${labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "g")
    : null;

  return paragraphs.map((paragraph, index) => (
    <p key={`${index}-${paragraph}`}>
      {pattern ? paragraph.split(pattern).map((part, partIndex) => {
        const link = linksByLabel.get(part);
        return link ? <InlineLink key={partIndex} {...link} /> : part;
      }) : paragraph}
    </p>
  ));
}
