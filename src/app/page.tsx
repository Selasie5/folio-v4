import TechStackCard from "@/components/core/TechStackCard";
import Image from "next/image";

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
 <div className="h-16 w-16 rounded-lg bg-gray-300  bg-[url('/seps.jpg')] bg-cover bg-center">
    </div>
    <div className="flex flex-col justify-center items-start">
 <h1 className="text-black  text-lg mono">Selasie Sepenu</h1>
  <p className="text-sm font-[500] text-gray-600">Software Engineer</p>
    </div>
      </div>
<div className="flex ">

</div>
  
    </section>

    <section className="flex flex-col justify-center items-start px-10 py-5">
   
<p className="text-gray-500 font- text-[15px]">
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
When I’m not building or debugging, I’m probably mentoring new developers, playing music, or exploring the future of AI and cybersecurity.</p>
    </section>
   <section className="py-20 px-10">
     <h2 className="text-black text-lg mono">Experience</h2>
   </section>
   <section className="py-20 px-10">
     <h2 className="text-black text-lg mono">Featured Work</h2>
   </section>
   <section className="py-20 px-10">
     <h2 className="text-black text-lg mono">Certifications</h2>
   </section>
   <section className="py-20 px-10">
     <h2 className="text-black text-lg mono">Tech Stack</h2>
     <div className="flex justify-start flex-wrap gap-5 mt-5">
      {techStack.map((tech) => (
        <TechStackCard key={tech} title={tech} />
      ))}
     </div>
   </section>
   <section className="py-20 px-10">
     <h2 className="text-black text-lg mono">Recognition & Community</h2>
   </section>
  </main>
  );
}
