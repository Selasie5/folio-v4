export interface SideQuestSection {
  heading: string;
  paragraphs: string[];
}

export interface SideQuest {
  slug: string;
  name: string;
  /** One line shown in the home-page list and under the page title. */
  tagline: string;
  status: string;
  period?: string;
  role?: string;
  link?: { label: string; href: string };
  intro: string[];
  sections: SideQuestSection[];
}

export const sideQuests: SideQuest[] = [
  {
    slug: "voya",
    name: "Voya",
    tagline: "Group travel with a shared pot powered by stablecoins",
    status: "Waitlist open",
    role: "Builder",
    link: { label: "Visit Voya", href: "https://voya-landing-web.vercel.app/" },
    intro: [
      "Every group trip starts the same way: a group chat, a lot of excitement, and somebody quietly volunteering to be the one who keeps track of the money. Voya is my attempt to make sure nobody has to be that person again.",
    ],
    sections: [
      {
        heading: "The problem with group trips",
        paragraphs: [
          "Planning a trip with friends is mostly coordination. Where are we going, what are we doing each day, how much is this going to cost, and who has paid for what so far. The fun part, actually going, sits on top of a pile of spreadsheets, screenshots and “I’ll send it to you later” messages.",
          "The money is where it usually gets awkward. One person books the accommodation, another covers dinner, someone else pays for the tickets, and by the end of the trip nobody is quite sure who owes who.",
        ],
      },
      {
        heading: "What Voya does",
        paragraphs: [
          "Voya takes a trip from daydream to departure. It builds the itinerary, works out the budget, and makes splitting the cost painless.",
          "Instead of settling up after the fact, friends pool money into a shared pot before the trip. Everyone can see what has gone in and what has gone out, and the pot pays for the things the group agreed on.",
        ],
      },
      {
        heading: "Why stablecoins",
        paragraphs: [
          "The shared pot runs on stablecoins behind the scenes. Friends don’t need to think about that part; they just see a pot of money in a currency they understand. Stablecoins handle the rest, which matters a lot when the people in a group live in different places and use different currencies.",
          "It’s the same idea that runs through most of my fintech work: the technology should do the heavy lifting quietly, and the person using it should only see something simple.",
        ],
      },
      {
        heading: "Where it is now",
        paragraphs: [
          "Voya is in active development and the waitlist is open. If you’re the friend who always ends up planning the trip, I’m building this for you.",
        ],
      },
    ],
  },
  {
    slug: "stablecoin-rails",
    name: "Stablecoin rails for Africa",
    tagline: "Moving money across African borders, with the stablecoins hidden behind local currency",
    status: "Building",
    role: "Builder",
    intro: [
      "Sending money between African countries is still harder than it should be. I’m building payment rails that use stablecoins to move money across borders, while the people sending and receiving it only ever deal with their own local currency.",
    ],
    sections: [
      {
        heading: "Why I’m building this",
        paragraphs: [
          "Fintech is the part of engineering I care about most, and cross-border payments within Africa are one of its most stubborn problems. Money that should move like a message often moves slowly, costs too much, or doesn’t arrive the way people expect.",
          "Stablecoins are a good fit for the movement part of the problem. They are fast, they work across borders, and they don’t care which bank you use.",
        ],
      },
      {
        heading: "Hiding the stablecoins",
        paragraphs: [
          "Most people don’t want to hold crypto, learn what a wallet is, or think about which chain their money is on. They want to send money in their own currency and have it arrive in someone else’s.",
          "So the stablecoins sit underneath, as rails. On either end, the experience is local currency in and local currency out.",
        ],
      },
      {
        heading: "How it connects to my other work",
        paragraphs: [
          "This builds on things I’ve worked on before: Quotient, the limit order book and matching engine I built, and the controlled agentic spending on stablecoin rails that General Intelligence Labs built for the WeWire Hackhive 2.0.",
        ],
      },
    ],
  },
  {
    slug: "general-intelligence-labs",
    name: "General Intelligence Labs",
    tagline: "Three friends from uni building AI-native products, one venture at a time",
    status: "Active",
    period: "2024 – Present",
    role: "Co-founder, Member of Technical Staff",
    intro: [
      "General Intelligence Labs is three friends who keep building things together: Christian, Eugene and me. We take our ventures seriously and ourselves a little less so, which is how one of our long-running goals became, half-jokingly, to one day post that we’ve raised $100M to change the future of QA.",
    ],
    sections: [
      {
        heading: "How we met",
        paragraphs: [
          "I met Christian and Eugene at university, when they were both in Level 400. They are two of the smartest people I know.",
          "Eugene and I went on to spend over a year on the engineering team at Polymorph Labs together, even though we worked on different teams for most of that time.",
        ],
      },
      {
        heading: "Integrion: AI-native QA",
        paragraphs: [
          "Our first venture, in 2024, was Integrion: AI-native QA engineering for distributed systems. The goal was to build the go-to AI-powered automated QA tool for backend systems.",
          "We fell into our roles naturally, and they have mostly stuck. I owned the frontend, Eugene owned the backend, and Christian owned the AI.",
          "We got to demo Integrion in some cool places, including Google. In the end, we couldn’t keep up with the cost of AI credits, and we closed it down.",
        ],
      },
      {
        heading: "Athena, now Liuca: the AI-native accountant",
        paragraphs: [
          "After a long break, we came back with our next venture: an AI-native accountant. We built out the MVP and were getting ready to launch when a multi-million-dollar financial company released their own version.",
          "That felt surreal. They obviously had deeper pockets and more reach. Instead of giving up, we took some time, learned from what they shipped, and refined our product. It was called Athena; it’s now called Liuca, and it’s ready for use.",
        ],
      },
      {
        heading: "Agentic spending on stablecoin rails",
        paragraphs: [
          "We like being at the edge of what AI can do, and a couple of months ago we started looking at a frontier not many people were considering yet: agentic spending, where AI agents can spend money on your behalf, within limits you control.",
          "For the WeWire Hackhive 2.0, we built controlled agentic spending on stablecoin rails. We didn’t win. The feedback, more or less, was that our solution was too advanced to be a viable startup in the African market right now. We like to think we were just ahead of our time, especially since some of the biggest names in stablecoins are now working on the same idea.",
        ],
      },
      {
        heading: "Ovaal: an agentic cashier for restaurants",
        paragraphs: [
          "Our most recent venture is a partnership with Forge Studios, the engineering and design studio in Accra, Ghana. Together we’re building an agentic cashier for restaurants, integrated into Ovaal, Forge’s restaurant POS system.",
          "We recently tested V1. It went quite well, and we’re actively refining it.",
        ],
      },
    ],
  },
];

export function getSideQuest(slug: string): SideQuest | undefined {
  return sideQuests.find((quest) => quest.slug === slug);
}
