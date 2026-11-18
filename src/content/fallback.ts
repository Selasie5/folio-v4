import type { PortfolioContent } from "./types";
import { organizationsHeading, organizationsFromExperiences } from "./organizations";
import { biography, biographyLinks } from "./biography";

const basePortfolioContent: PortfolioContent = {
  profile: {
    name: "Selasie Sepenu",
    role: "Software Engineer",
    image: "/seps-anime.png",
    bio: biography,
    bioLinks: biographyLinks,
    quote:
      "Seest thou a man diligent in his business? he shall stand before kings; he shall not stand before mean men",
    quoteSource: "Proverbs 22:29",
  },
  projects: [
    {
      title: "Explainable AI",
      repo: "https://github.com/Selasie5/explainable-backend",
      live: "https://explainable-backend.onrender.com/docs",
      description:
        "API and CLI tool for generating interpretable model explanations (SHAP, LIME, Integrated Gradients) for tabular, text, and image data. Built with FastAPI, supports Docker deployment, outputs visual and narrative reports, and is easily extensible for custom models.",
      image: "/assets/pu.jpg",
      logo: "/assets/project.png",
      category: "Personal",
      featured: true,
    },
    {
      title: "WhisperBox Engine",
      repo: "https://github.com/Selasie5/whisper-box-demo-backend",
      live: "https://whisper-box-demo-backend.onrender.com",
      description:
        "This backend provides a suggestion system for Turntabl, supporting anonymous suggestions, department management, and role-based access for super admins, department heads, and department admins. Built with TypeScript, Express, and MongoDB.",
      image: "/assets/pu.jpg",
      logo: "/assets/project.png",
      category: "Professional",
      featured: true,
    },
    {
      title: "Thanos DNS",
      repo: "https://github.com/Selasie5/dns-server",
      live: "https://github.com/Selasie5/dns-server",
      description:
        "Thanos is a high-performance, configurable DNS server that resolves domain names to IP addresses, supports caching for faster lookups, and allows custom domain routing and record management for local or enterprise networks.",
      image: "/assets/pu.jpg",
      logo: "/assets/project.png",
      category: "Personal",
      featured: true,
    },
    {
      title: "Adorned By Sophia (E-commerce Platform)",
      repo: "https://github.com/Selasie5/circuit-breaker",
      live: "https://github.com/Selasie5/circuit-breaker",
      description: "An online store for a leading and upcoming global fashion brand to help",
      image: "/assets/pu.jpg",
      logo: "/assets/project.png",
      category: "Founder Mode",
      featured: true,
    },
  ],
  certifications: [
    {
      title: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services (AWS)",
      issuedDate: "Oct 18, 2023",
      logo: "/assets/aws.jpeg",
    },
    {
      title: "React Learning Program",
      issuer: "Andela",
      issuedDate: "Sept 10, 2023",
      logo: "/assets/andela_logo.jpeg",
    },
    {
      title: "Grow With Google Scholarship",
      issuer: "Google",
      issuedDate: "Aug 05, 2024",
      logo: "/assets/Google_Logo_1.png",
    },
  ],
  techStack: [
    "TypeScript", "JavaScript", "PHP", "Node.js", "React", "Next.js",
    "Laravel", "Spring Boot", "PostgreSQL", "MongoDB", "MySQL", "AWS",
    "Strapi", "GitHub", "Docker", "GraphQL", "Framer Motion",
  ],
  // Mirrors the experiences in Sanity (synced 2026-11-18); used only if Sanity can't be reached.
  experiences: [
    {
      role: "Software Engineer (Frontend)",
      company: "BlackHorse Mobility Limited",
      logo: "/brands/blackhorse.png",
      period: "Nov 2025 – Present",
      achievements: [
        "Led frontend engineering for the corporate app while contributing to product thinking and UX flow design, shaping features from concept through implementation rather than working from finished specs.",
        "Owned UI design and led design engineering for the company’s new marketing website, partnering closely with the marketing team to optimize for lead generation and implement accurate analytics tracking.",
        "Led frontend engineering for the B2C consumer app, balancing feature delivery with on-call responsibility for resolving critical production issues.",
        "Drove major semantic and architectural refactors across core frontend codebases, introducing linting and code-quality checks to maintain long-term cleanliness and prevent regressions.",
        "Actively participated in QA engineering, catching issues before release and strengthening the team’s overall testing culture.",
        "Mentored an engineering intern in React fundamentals and performance optimization, building her practical understanding of the framework while ensuring quality delivery.",
      ],
      techStack: ["React"],
    },
    {
      role: "Software Engineer",
      company: "Polymorph Labs",
      logo: "/assets/polymorph_labs_logo.jpeg",
      period: "Mar 2025 – Jul 2026",
      achievements: [
        "Architected and implemented v1 of a pricing feature (PBUs) end to end, based on domain regulatory policies and business rules, for an application in the oil and gas sector.",
        "Developed an optimized export feature for the University of Ghana’s admissions system, preventing duplicate exports and adding pagination and performance improvements for bulk data downloads.",
        "Reduced data export time by 50%, cutting the average export from 15–20 minutes to 7–10 minutes.",
        "Built a proof-of-concept walkthrough component for ECG’s internal console, reducing the instructional video needed for onboarding from 8–10 minutes to 1–2 minutes.",
        "Built a custom tooltip (walkthrough) component that a major team in the organization adapted for their own use case.",
        "Implemented UI and logic fixes for the University of Ghana Department of Computer Science website, integrating Strapi CMS in some sections for dynamic content and easier maintenance.",
        "Resolved critical bugs across the university admission management console, improving functionality and user experience while keeping the system stable.",
        "Migrated a legacy application from the deprecated Create React App to Vite.",
        "Implemented analytics features and bug fixes on the Emrys Business Suite (emrysglobal.com).",
        "Ran code review sessions with fellow engineers and helped mentor an intern in HTML, CSS and JavaScript.",
      ],
      techStack: ["TypeScript", "React", "Next.js", "Node.js", "GraphQL", "MongoDB", "RabbitMQ", "Docker", "Vitest", "Strapi", "AWS"],
    },
    {
      role: "Software Engineer",
      company: "Dimax Digital",
      logo: "/assets/dimax_digital_logo.jpeg",
      period: "Nov 2025 – Jun 2026",
      achievements: [
        "Led frontend engineering for a B2B platform approaching its MVP launch, owning architecture, implementation and delivery.",
        "Built and integrated the entire frontend application with backend services, enabling secure, real-time, data-driven workflows.",
        "Established a scalable UI architecture, reusable component systems and performance optimization standards to support long-term growth.",
      ],
      techStack: ["TypeScript", "React", "Next.js", "Node.js", "Laravel", "PostgreSQL", "Docker", "AWS"],
    },
    {
      role: "Software Engineer",
      company: "turntabl",
      logo: "/assets/turntabl_logo.jpeg",
      period: "Jun 2025 – Sep 2025",
      achievements: [
        "Served as team lead and full-stack engineer, making sure every requirement defined for the product WhisperBox was technically met.",
        "Built the entire proof-of-concept demo backend in less than 12 hours and made key integrations on the frontend.",
      ],
      techStack: ["TypeScript", "Next.js", "Node.js", "Spring Boot", "PostgreSQL", "Docker", "MongoDB"],
    },
    {
      role: "Software Engineering Fellow",
      company: "Headstarter AI",
      logo: "/assets/theheadstarter_logo.jpeg",
      period: "Jul 2024 – Sep 2024",
      achievements: [
        "Built 5+ AI apps and APIs using NextJS, Open AI, Pinecone, and Stripe API with 98% accuracy as seen by 1k users.",
        "Developed projects from design to deployment leading 4+ engineering fellows using MVC design patterns",
        "Coached by Amazon, Bloomberg, and Capital One engineers on Agile, CI/CD, Git, and microservice patterns",
      ],
      techStack: ["Next.js", "Node.js", "Express", "Typescript", "Open AI", "Stripe", "Pinecone", "Material UI"],
    },
    {
      role: "Frontend Web Developer",
      company: "LeadMonger",
      logo: "/assets/lm_logo.jpeg",
      period: "Apr 2023 – May 2024",
      achievements: [
        "Worked closely with a team of designers to develop visually appealing, highly responsive websites and web apps for clients.",
        "Delivered websites and web apps that met clients’ expectations in both visual aesthetics and functionality.",
        "Worked one on one with clients while syncing with the team to develop exceptional products.",
        "Conducted basic user experience research and implemented the feedback to improve the experience on every platform I built.",
      ],
      techStack: ["TypeScript", "React"],
    },
    {
      role: "Frontend Engineer Trainee",
      company: "Andela",
      logo: "/assets/andela_logo.jpeg",
      period: "Aug 2023 – Sep 2023",
      achievements: [
        "Collaborated intensively with both new and experienced developers to learn and build with React and Next.js.",
        "Worked within a community of learners and technical mentors, completing assessments and project tasks.",
      ],
      techStack: ["TypeScript", "React", "Next.js", "Node.js", "Test Driven Development"],
    },
  ],
  contacts: [
    { label: "github", display: "/ Github", href: "https://github.com/Selasie5" },
    { label: "linkedin", display: "/ Linkedin", href: "https://linkedin.com/in/selasiekofisepenu" },
    { label: "x", display: "/ X (formerly Twitter)", href: "https://x.com/SelasieSepenu" },
    { label: "instagram", display: "/ Instagram", href: "https://instagram.com/_dr_seps" },
    { label: "book", display: "/ Book A Call", href: "https://calendly.com/yourusername" },
    { label: "mail", display: "/ Send Me A Mail", href: "mailto:selasisepenu5@gmail.com" },
  ],
};

export const fallbackPortfolioContent: PortfolioContent = {
  ...basePortfolioContent,
  organizationsHeading,
  organizations: organizationsFromExperiences(basePortfolioContent.experiences),
};
