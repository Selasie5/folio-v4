import type { BiographyLink } from "./types";

export const biography = [
  "I’m a software engineer and design engineer with a deep passion for fintech. I build reliable systems and interfaces that feel like people actually made them.",
  "I’m the co-founder and CTO of Forge Studios, a software engineering and design studio in Accra, and a software engineer at Blackhorse. Through Forge’s EIT Fellowship, I mentor young engineers in TypeScript and the React ecosystem.",
  "Fintech led me to build Quotient, a limit order book and matching engine. Now I’m building stablecoin rails that move money across African borders, with the stablecoins hidden behind local currency.",
  "In my free time, I maintain Fides, open-source loan management infrastructure for microfinance and community lenders, and write technical articles. I’m also building Voya, a group travel app where friends pool money into a shared pot and stablecoins handle the rest.",
  "Away from one keyboard, I’m at another: I love music and play the piano. In 2027 I’m starting padel from zero. If you want to learn with me, hit me up.",
];

export const biographyLinks: BiographyLink[] = [
  { label: "Forge Studios", href: "https://forgestudios.tech/", brand: "forge" },
  { label: "Blackhorse", href: "https://www.black-horse.io/", brand: "blackhorse" },
  { label: "Quotient", href: "https://github.com/Selasie5/quotient", brand: "quotient" },
  { label: "Fides", href: "https://github.com/Selasie5/fides", brand: "fides" },
  { label: "Voya", href: "https://voya-landing-web.vercel.app/", brand: "voya" },
  { label: "technical articles", href: "https://dev.to/selasie5/what-is-agentic-ui-and-why-it-changes-everything-about-frontend-engineering-m95" },
  { label: "EIT Fellowship", href: "https://forgestudios.tech/eit-fellowship" },
  { label: "hit me up", href: "mailto:selasisepenu5@gmail.com" },
];

// Replace only the original seeded intro; subsequent edits in Sanity take precedence.
export function resolveBiography(paragraphs?: string[]): string[] {
  const seededIntro = [
    "I love building software that feels intentional, scalable, and human-centered.",
    "From backend systems that just work to interfaces that flow seamlessly, I care about every layer of what makes technology meaningful.",
    "I'm a software engineer passionate about crafting reliable systems and shaping how technology connects people. Over the past few years, I've worked across startups and engineering teams — building tools, mentoring peers, and learning from some of the best.",
    "I believe great engineering sits at the intersection of logic, creativity, and empathy. Whether it's designing smooth web experiences, architecting APIs, or improving performance, I enjoy solving problems that make a measurable impact.",
    "When I'm not building or debugging, I'm probably mentoring new developers, playing music, or talking to my favorite person 😊.",
  ];
  const isSeededIntro = paragraphs?.length === seededIntro.length
    && paragraphs.every((paragraph, index) => paragraph === seededIntro[index]);
  return !paragraphs?.length || isSeededIntro ? biography : paragraphs;
}
