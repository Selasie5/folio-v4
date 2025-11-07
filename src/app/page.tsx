"use client"
import TechStackCard from "@/components/core/TechStackCard";
import Image from "next/image";
import Experience from "@/components/core/Experience";
import { motion } from "framer-motion";
import { listVariants } from "@/components/animations";
import FeaturedWork from "@/components/core/FeaturedWork";
import Link from "next/link";
import CertificationBadge from "@/components/core/CertificationBadge";

export default function Home() {

const techStack = [
  "TypeScript",
  "JavaScript",
  "PHP",
  "Node.js",
  "React",
  "Next.js",
  "Laravel",
  "Spring Boot",
  "PostgreSQL",
  "MongoDB",
  "MySQL",
  "AWS",
  "Strapi",
  "GitHub",
  "Docker",
  "GraphQL",
  "Framer Motion",
];


const certifications = [
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
    issuedDate: "Sept 10, 2023",
    logo: "/assets/Google_Logo_1.png",
  },
];




const featuredProjects = [
  {
    title: "Whisper Backend",
    repo: "https://github.com/selasie/whisper-backend",
    live: "https://whisperapp.io",
    description:
      "A scalable backend API for Whisper — built with Node.js, PostgreSQL, and Docker to power secure messaging and real-time communication.",
    image: "/assets/pu.jpg",
    logo: "/assets/project.png",
  },
  {
    title: "Jolt Platform",
    repo: "https://github.com/selasie/jolt",
    live: "https://jolt.dev",
    description:
      "A full-stack developer platform built on Next.js and Supabase, enabling teams to deploy internal tools lightning fast.",
    image: "/assets/pu.jpg",
    logo: "/assets/project.png",
  },
  {
    title: "Integrion",
    repo: "https://github.com/selasie/integrion",
    live: "https://integrion.ai",
    description:
      "Infra-native AI testing tool that connects directly to your repos, auto-writes tests, and suggests fixes in CI pipelines.",
    image: "/assets/pu.jpg",
    logo: "/assets/project.png",
  },
  {
    title: "The Psalmist Intl",
    repo: "https://github.com/selasie/psalmist",
    live: "https://psalmistintl.org",
    description:
      "An apostolic and prophetic community website built with Next.js and Tailwind, blending design and faith for a global audience.",
    image: "/assets/pu.jpg",
    logo: "/assets/project.png",
  },
];

  return (
  <main className="flex flex-col justify-start items-start h-screen p-20 relative max-w-7xl mx-auto">
     {/* <div
        className="pointer-events-none fixed left-0 top-0 w-full select-none"
        style={{
          height: "150px",
          background: "linear-gradient(to bottom, transparent, #f5f4f3)",
          maskImage: "linear-gradient(to top, #f5f4f3 50%, transparent)",
          WebkitBackdropFilter: "blur(4px)",
          backdropFilter: "blur(4px)",
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
      /> */}
    <section className="flex justify-between items-center gap-5 w-full px-10 py-3">
      <div className="flex justify-center items-center gap-5">
 <motion.div
 initial="hidden"
 variants={listVariants}
 whileInView="visible"
 custom={0}
 viewport={{ once: true }}
 className="h-16 w-16 rounded-lg bg-gray-300  bg-[url('/seps.jpg')] bg-cover bg-center">
    </motion.div>
    <div className="flex flex-col justify-center items-start">
 <motion.h1
  initial="hidden"
 variants={listVariants}
 whileInView="visible"
 custom={1}
 viewport={{ once: true }}
 className="text-black  text-lg mono">Selasie Sepenu</motion.h1>
  <motion.p 
   initial="hidden"
 variants={listVariants}
 whileInView="visible"
 custom={2}
 viewport={{ once: true }}
  className="text-sm font-[500] text-gray-600">Software Engineer</motion.p>
    </div>
      </div>
<div className="flex ">

</div>
  
    </section>

    <section className="flex flex-col justify-center items-start px-10 py-5">
   
<motion.p 
initial="hidden"
 variants={listVariants}
 whileInView="visible"
 custom={3}
 viewport={{ once: true }}
className="text-gray-500 font- text-[15px]">
     I love building software that feels intentional, scalable, and human-centered.
      <br/>
{" "}
<br/>
From backend systems that just work to interfaces that flow seamlessly, I care about every layer of what makes technology meaningful.
<br/>
{" "}
<br/>
  
  I’m a software engineer passionate about crafting reliable systems and shaping how technology connects people.
Over the past few years, I’ve worked across startups and engineering teams — building tools, mentoring peers, and learning from some of the best.
<br/>
{" "}
<br/>
I believe great engineering sits at the intersection of logic, creativity, and empathy.
Whether it’s designing smooth web experiences, architecting APIs, or improving performance, I enjoy solving problems that make a measurable impact.
<br/>
{" "}
<br/>
When I’m not building or debugging, I’m probably mentoring new developers, playing music, or exploring the future of AI and cybersecurity.</motion.p>
    </section>
   <section className="py-20 px-10 w-full">
     <motion.h2
     initial="hidden"
 variants={listVariants}
 whileInView="visible"
 custom={2}
 viewport={{ once: true }}
     className="text-black text-lg mono">My Work Experience</motion.h2>
      <div className="mt-5 w-full">
        <Experience />
      </div>
   </section>
   <section className="py-20 px-10">
    <div className="flex justify-between items-center w-full">
     <h2 className="text-black text-lg mono">Featured Work</h2>
<span className="text-gray-500  text-sm hover:underline">
  <Link href="/projects">View All</Link>

</span>
    </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-5 w-full">
        {featuredProjects.map((project, i) => (
          <FeaturedWork key={i} {...project} />
        ))}
      </div>
   </section>
   <section className="py-20 px-10">
     <h2 className="text-black text-lg mono">Certifications</h2>
     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-5">
        {certifications.map((cert, i) => (
          <CertificationBadge key={i} {...cert} />
        ))}
      </div>
   </section>
   <section className="py-20 px-10">
     <h2 className="text-black text-lg mono">Tech Stack</h2>
     <div className="flex justify-start flex-wrap gap-5 mt-5">
      {techStack.map((tech) => (
        <TechStackCard key={tech} title={tech} sm={false} />
      ))}
     </div>
   </section>
   <section className="py-20 px-10">
     <h2 className="text-black text-lg mono">Recognition & Community</h2>
   </section>
  </main>
  );
}
