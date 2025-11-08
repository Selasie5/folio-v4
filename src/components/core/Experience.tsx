"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import TechStackCard from "./TechStackCard";
import { listVariants } from "../animations";

interface ExperienceItem {
  role: string;
  company: string;
  logo: string;
  period: string;
  achievements: string[];
  techStack: string[];
}

const experiences: ExperienceItem[] = [
  {
    role: "Software Engineer",
    company: "Dimax Digital",
    logo: "/assets/dimax_digital_logo.jpeg",
    period: "Jan '25 – Present",
    achievements: [
      "Developed the landing page for the product",
      "Currently leading on the frontend with React but writing Laravel on the backend for a flagship product"
    ],
    techStack: [
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Laravel",
      "PostgreSQL",
      "Docker",
      "AWS",
    ],
  },
  {
    role: "Software Engineer",
    company: "Polymorph Labs",
    logo: "/assets/polymorph_labs_logo.jpeg",
    period: "Mar '25 – Present",
    achievements: [
      "Implemented UI and logic fixes for the University of Ghana’s Department of Computer Science website, integrating Strapi CMS at some sections for dynamic content management and improved site maintainability",
      "Resolved critical bug fixes across the university admission management console, improving functionality and user experience while maintaining system stability.",
      "Developed an optimized export feature for the university’s admissions system, preventing duplicate exports and implementing pagination and performance enhancements for bulk data downloads.",
      "Reduced data export time by 50%, cutting average export duration from 15–20 minutes to 7–10 minutes, significantly improving system efficiency and user experience.",
      " Built a proof-of-concept walkthrough component for ECG’s internal console, streamlining user onboarding and reducing instructional video length from 8–10 minutes to just 1–2 minutes.",
      "Assisting in mentoring an intern in mastering HTML, CSS, and JavaScript, fostering team growth and knowledge sharing within the engineering department."
    ],
    techStack: [
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "GraphQL",
      "MongoDB",
      "RabbitMQ",
      "Docker",
      "Vitest",
      "Strapi",
      "AWS",
    ],
  },
  {
    role: "Software Engineer",
    company: "Turntabl",
    logo: "/assets/turntabl_logo.jpeg",
    period: "Jun '25– Sept '25",
    achievements: [
      "Serves as the team lead and fullstack engineer ensuring that all requirement defined for the product WhisperBox were technically met",
      "Built the entire POC demo backend in less than 12 hours and made key integrations on the frontend ",
    ],
    techStack: [
      "TypeScript",
      "Next.js",
      "Node.js",
      "Spring Boot",
      "PostgreSQL",
      "Docker",
      "MongoDB",
    ],
  },
  {
    role: "Software Engineer Fellow",
    company: "Headstarter AI",
    logo: "/assets/theheadstarter_logo.jpeg",
    period: "Jun '24– Sept '24",
    achievements: [
      "Built 5+ AI apps and APIs using NextJS, Open AI, Pinecone, and Stripe API with 98% accuracy as seen by 1k users.",
      "Developed projects from design to deployment leading 4+ engineering fellows using MVC design patterns",
      "Coached by Amazon, Bloomberg, and Capital One engineers on Agile, CI/CD, Git, and microservice patterns"
    ],
    techStack: [
      "TypeScript",
      "Next.js",
      "RAG",
      "Pinecone",
      "Stripe",
      "Open AI",
    ],
  },
  {
    role: "Lead Product Engineer",
    company: "Afrovivo",
    logo: "/assets/vivo_logo.jpeg",
    period: "Apr '24 – Sept '24",
    achievements: [
      "Plan and strategize with the engineering and design team to help achieve set goals in time.",
      "Reviewed initial backend infrastructure and planned redesign to suit product requirements while enhancing optimization and efficiency.",
      "Perform intuitive code reviews and provide constructive feeback to team members to ensure best practices are followed.",
      "Built first version of authentication and transaction labelling service",
      "Built, deployed and documented an API that automates MailChimp audience subscription on our waitlist site.",
      "Planned, strategized and analyze with other stakeholders and team to ensure the right system design and technologies were being used in building the backend infrastructure",
      "Performed major product design changes that are instrumental in successfully delivering a product consumers love"
    ],
    techStack: [
      "TypeScript",
      "React",
      "Node.js",
      "Next.js",
      "Python",
      "PostgreSQL",
      "Docker",
    ],
  },
  {
    role: "Frontend Engineer",
    company: "Leadmonger",
    logo: "/assets/lm_logo.jpeg",
    period: "Apr '23 – Sept '24",
    achievements: [
      "Worked extensively and closely with a team of designers to develop visually appealing and highly responsive websites and web apps for clients.",
      "Develop websites and web apps that meet the expectations of clients in both visuals aesthetics and functionality.",
      "Had one-on-one interaction with clients while syncing with the team to develop exceptional products.",
      "Conducted basic user experience research, considered feedback, and implemented it to enhance user experience on all platforms I built..",
    ],
    techStack: [
      "TypeScript",
      "React",
    ],
  },
  {
    role: "Frontend Engineer Trainee",
    company: "Andela",
    logo: "/assets/andela_logo.jpeg",
    period: "Aug '23 – Sept '23",
    achievements: [
     "I was engaged in intense and extensive collaboration with both new and experienced devs to learn and work with the REACT JS library and Next JS framework. I interacted with a community of learners and technical mentors, completed assessments, and various tasks."
    ],
    techStack: [
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Test Driven Development"
    ],
  },
  
];

const Experience = () => {
  return (
    <div className="flex flex-col gap-8 w-full">
      {experiences.map((exp, idx) => (
        <motion.div
        key={idx}
          initial="hidden"
          whileInView="visible"
          variants={listVariants}
          custom={idx+1}
          viewport={{ once: true }}
        >
          <ExperienceCard key={idx} {...exp} />
        </motion.div>
      ))}
    </div>
  );
};

const ExperienceCard = ({
  role,
  company,
  logo,
  period,
  achievements,
  techStack,
}: ExperienceItem) => {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={{
        rest: { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0)" },
        hover: { scale: 1.01, boxShadow: "0px 2px 8px rgba(0,0,0,0.1)" },
      }}
      transition={{ duration: 0.3, type: "spring" }}
      className="w-full border border-gray-100 rounded-lg p-5 bg-white/80 backdrop-blur-sm cursor-pointer"
    >
      <div className="w-full flex justify-between items-center">
        <div className="flex justify-start items-center gap-3">
          <Image
            src={logo}
            alt={`${company} Logo`}
            width={50}
            height={50}
            className="rounded-lg bg-gray-200 object-cover h-12 w-12"
          />
          <div className="flex flex-col justify-center items-start">
            <h3 className="text-black text-base md:text-lg font-medium">{role}</h3>
            <p className="text-gray-600 text-[15px]">{company}</p>
          </div>
        </div>
        <p className="text-gray-500 text-xs md:text-sm">{period}</p>
      </div>

     
      <motion.ul
        initial={{ opacity: 0, y: 10, height: 0 }}
        variants={{
          rest: { opacity: 0, y: 10, height: 0 },
          hover: { opacity: 1, y: 0, height: "auto" },
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="mt-4 pl-2 flex flex-col gap-3 overflow-hidden"
      >
        {achievements.map((point, i) => (
          <motion.li
            key={i}
            className="flex items-start gap-3 text-gray-700 text-sm leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            variants={{
              rest: { opacity: 0, y: 10 },
              hover: { opacity: 1, y: 0 },
            }}
            transition={{
              delay: 0.1 * i,
              type: "spring",
              stiffness: 120,
              damping: 15,
            }}
          >
            <span className="mt-[6px] h-3 w-3 rounded-sm bg-gray-200 shadow-[2px_2px_0px_0px] shadow-gray-300 flex-shrink-0"></span>
            {point}
          </motion.li>
        ))}

      
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          variants={{
            rest: { opacity: 0, y: 10 },
            hover: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap gap-3 mt-4"
        >
          {techStack.map((tech) => (
            <TechStackCard key={tech} title={tech} sm />
          ))}
        </motion.div>
      </motion.ul>
    </motion.div>
  );
};

export default Experience;
