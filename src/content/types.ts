export type BiographyBrand = "forge" | "blackhorse" | "quotient" | "fides" | "voya";

export interface BiographyLink {
  label: string;
  href?: string;
  brand?: BiographyBrand;
}

export interface ProfileContent {
  name: string;
  role: string;
  image: string;
  bio: string[];
  bioLinks?: BiographyLink[];
  quote: string;
  quoteSource: string;
}

export interface ProjectContent {
  title: string;
  repo?: string;
  live?: string;
  description: string;
  image: string;
  logo?: string;
  category: "Personal" | "Founder Mode" | "Professional";
  featured: boolean;
}

export interface ExperienceContent {
  role: string;
  company: string;
  logo: string;
  period: string;
  achievements: string[];
  techStack: string[];
  /** Confidential roles arrive with every other field emptied; only the fact that a role exists is shown. */
  confidential?: boolean;
}

export interface CertificationContent {
  title: string;
  issuer: string;
  issuedDate: string;
  logo: string;
  url?: string;
}

export interface ContactContent {
  label: string;
  display: string;
  href: string;
}

export interface OrganizationContent {
  name: string;
  logo: string;
  url?: string;
}

export interface PortfolioContent {
  profile: ProfileContent;
  organizationsHeading?: string;
  organizations?: OrganizationContent[];
  projects: ProjectContent[];
  experiences: ExperienceContent[];
  certifications: CertificationContent[];
  techStack: string[];
  contacts: ContactContent[];
}
