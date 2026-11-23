/**
 * Design notes shown by Inspect mode. An element opts in with `data-inspect="<id>"`; the id picks
 * its note here. Notes describe decisions that are really in the code, so keep them in step with it.
 */
export interface InspectNote {
  /** Component name, as it would read in the source. */
  name: string;
  /** Path from the repository root, linked to GitHub. */
  file: string;
  /** Why it looks and behaves the way it does. */
  note: string;
}

const REPOSITORY = "https://github.com/Selasie5/folio-v4/blob/develop";

export const sourceUrl = (file: string) => `${REPOSITORY}/${file}`;

export const INSPECT_NOTES: Record<string, InspectNote> = {
  "profile-header": {
    name: "ProfileHeader",
    file: "src/components/core/HomeContent.tsx",
    note: "Avatar, name and role stagger in 200 ms apart with one shared variant, and only on the first view, so the page settles instead of replaying motion every time you scroll back.",
  },
  biography: {
    name: "Biography",
    file: "src/components/core/Biography.tsx",
    note: "Company names are brand links. On hover or focus, an icon slot grows from 0 to 1.2em while the badge slides in, in that brand's colour, tuned separately for light and dark. Touch screens have no hover, so they always show the badge.",
  },
  "theme-toggle": {
    name: "ThemeToggle",
    file: "src/components/core/ThemeToggle.tsx",
    note: "A real switch (role=\"switch\", aria-checked). For one frame it turns every transition off, so the colours flip at once instead of each element fading on its own schedule. A tiny script in <head> applies the saved theme before first paint, so there is no flash.",
  },
  "experience-list": {
    name: "Experience",
    file: "src/components/core/Experience.tsx",
    note: "Hovering or tabbing to one row fades and softly blurs the others (opacity 0.3, blur 1.5px, 250 ms), so the eye lands on one line. The styles target each row's child, because Framer Motion writes inline opacity on the <li>. Motion is off with reduced motion.",
  },
  "confidential-role": {
    name: "ConfidentialRow",
    file: "src/components/core/Experience.tsx",
    note: "The blurred text is fixed filler, not the real role. CSS blur is only visual, so the details are stripped in the Sanity query and again on the server before anything reaches the page. Screen readers hear \"Confidential role\".",
  },
  "writing-list": {
    name: "PostList",
    file: "src/components/core/Writing.tsx",
    note: "The same list primitive as Experience: dotted dividers, a two-column grid from 640 px, and the focus fade. Drafts get a Draft tag and a blurred preview made of filler, so unpublished text never ships.",
  },
  "side-quests": {
    name: "SideQuestList",
    file: "src/components/core/SideQuests.tsx",
    note: "Reuses the list primitive. Confidential quests unlock with an access code that is checked on the server and rate-limited, so the story is never in the page until it is earned.",
  },
  "now-playing": {
    name: "NowPlayingLine",
    file: "src/components/core/Listening.tsx",
    note: "Three bars scale from the bottom with offset delays, so they never move in sync, and stop under reduced motion. The \"x ago\" label is worked out on the server, so server and browser render the same text.",
  },
  "inspect-toggle": {
    name: "InspectToggle",
    file: "src/components/inspect/InspectToggle.tsx",
    note: "You're using it. Every highlighted element reads its type, colour, spacing and motion live from the browser's computed styles, so what you see here is what actually shipped.",
  },
};
