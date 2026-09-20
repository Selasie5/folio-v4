"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ExperienceContent } from "@/content/types";
import TechStackCard from "./TechStackCard";
import { listVariants } from "../animations";

const Experience = ({ experiences }: { experiences: ExperienceContent[] }) => {
  return (
    <div className="flex flex-col gap-8 w-full">
      {experiences.map((experience, index) => (
        <motion.div
          key={`${experience.company}-${experience.role}`}
          initial="hidden"
          whileInView="visible"
          variants={listVariants}
          custom={index + 1}
          viewport={{ once: true }}
        >
          <ExperienceCard {...experience} />
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
}: ExperienceContent) => {
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
        {achievements.map((point) => (
          <motion.li
            key={point}
            className="flex items-start gap-3 text-gray-700 text-sm leading-relaxed"
            variants={{
              rest: { opacity: 0, y: 10 },
              hover: { opacity: 1, y: 0 },
            }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
          >
            <span className="mt-[6px] h-3 w-3 rounded-sm bg-gray-200 shadow-[2px_2px_0px_0px] shadow-gray-300 flex-shrink-0" />
            {point}
          </motion.li>
        ))}

        <motion.div
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
