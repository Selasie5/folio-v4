export interface ProfileContent {
  name: string;
  role: string;
  image: string;
  bio: string[];
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

export interface PortfolioContent {
  profile: ProfileContent;
  projects: ProjectContent[];
  experiences: ExperienceContent[];
  certifications: CertificationContent[];
  techStack: string[];
  contacts: ContactContent[];
}
