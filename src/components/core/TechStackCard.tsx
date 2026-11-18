"use client";

import React from "react";
import { motion, useAnimation } from "framer-motion";
import { IconType } from "react-icons";
import {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiNodedotjs,
  SiPhp,
  SiNextdotjs,
  SiLaravel,
  SiPostgresql,
  SiMongodb,
  SiAwsamplify,
  SiDocker,
  SiGraphql,
  SiFramer,
  SiSpringboot,
  SiMysql,
  SiStrapi,
  SiGithub 
} from "react-icons/si";

interface TechStackCardProps {
  title: string;
  sm: boolean;  
}

// Map of tech name → icon
const techIcons: Record<string, IconType> = {
  React: SiReact,
  TypeScript: SiTypescript,
  JavaScript: SiJavascript,
  Nodejs: SiNodedotjs,
  "Node.js": SiNodedotjs,
  PHP: SiPhp,
  "Next.js": SiNextdotjs,
  Laravel: SiLaravel,
  PostgreSQL: SiPostgresql,
  MongoDB: SiMongodb,
  AWS: SiAwsamplify,
  Docker: SiDocker,
  GraphQL: SiGraphql,
  "Spring Boot": SiSpringboot,
  "Framer Motion": SiFramer,
  "MySQL": SiMysql,
  Strapi: SiStrapi,
  GitHub: SiGithub,
};

const TechStackCard: React.FC<TechStackCardProps> = ({ title, sm }) => {
  const Icon = techIcons[title] || null;
  const controls = useAnimation();

  return (
    <motion.div
      className={`relative bg-gray-100 dark:bg-neutral-800 group text-black dark:text-neutral-100 border dark:border-neutral-700 rounded-lg shadow-[2px_2px_0px_0px] shadow-gray-200 dark:shadow-neutral-700 hover:shadow-none transition-shadow duration-300 cursor-pointer flex items-center gap-2 overflow-hidden ${sm ? "text-[11px] py-1.5 px-2" : "text-xs px-3 py-2"}`}
      whileHover={{ scale: 1.03 }}
      onHoverStart={() => {
        controls.start({ x: 0, opacity: 1 });
      }}
      onHoverEnd={() => {
        controls.start({ x: -20, opacity: 0 });
      }}
    >
      {Icon && (
        <motion.span
          initial={{ x: -20, opacity: 0 }}
          animate={controls}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-lg text-gray-600 dark:text-neutral-400 hidden group-hover:inline-block"
        >
          <Icon />
        </motion.span>
      )}
      <span>{title}</span>
    </motion.div>
  );
};

export default TechStackCard;
