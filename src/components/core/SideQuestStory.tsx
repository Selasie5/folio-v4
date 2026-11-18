import { Fragment } from "react";
import type { SideQuestSection } from "@/content/sidequests";

/** Renders ==marked== phrases as highlighter marks; everything else stays plain text. */
function Highlighted({ text }: { text: string }) {
  const parts = text.split(/==(.+?)==/g);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className="story-highlight">
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** A side quest's story, styled like an article. Works in server and client components. */
export default function SideQuestStory({ intro, sections }: { intro: string[]; sections: SideQuestSection[] }) {
  return (
    <div className="article-body mt-8">
      {intro.map((paragraph, index) => (
        <p key={index}>
          <Highlighted text={paragraph} />
        </p>
      ))}
      {sections.map((section, sectionIndex) => (
        <Fragment key={sectionIndex}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={index}>
              <Highlighted text={paragraph} />
            </p>
          ))}
        </Fragment>
      ))}
    </div>
  );
}
