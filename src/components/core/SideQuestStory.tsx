import { Fragment } from "react";
import type { SideQuestSection } from "@/content/sidequests";

/** A side quest's story, styled like an article. Works in server and client components. */
export default function SideQuestStory({ intro, sections }: { intro: string[]; sections: SideQuestSection[] }) {
  return (
    <div className="article-body mt-8">
      {intro.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
      {sections.map((section, sectionIndex) => (
        <Fragment key={sectionIndex}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </Fragment>
      ))}
    </div>
  );
}
