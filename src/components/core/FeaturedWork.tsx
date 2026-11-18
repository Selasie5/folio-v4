"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckBadgeIcon } from "@heroicons/react/16/solid";
import { SiGithub } from "react-icons/si";
import Link from "next/link";
import Image from "next/image";

interface FeaturedWorkProps {
  title: string;
  repo?: string;
  live?: string;
  description: string;
  image: string;
  logo?: string; // optional small logo for top-left circle
}

const FeaturedWork: React.FC<FeaturedWorkProps> = ({
  title,
  repo,
  live,
  description,
  image,
  logo,
}) => {
  const handleCardClick = () => {
    const target = live || repo;
    if (target) {
      window.open(target, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      viewport={{ once: true }}
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleCardClick();
      }}
      className="group w-full aspect-square border border-gray-200 dark:border-neutral-700 rounded-xl p-4 sm:p-5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm cursor-pointer flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/30"
    >
      {/* Header */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="h-8 w-8 rounded-full bg-gray-200 dark:bg-neutral-700 bg-cover bg-center shrink-0 border border-gray-200 dark:border-neutral-700"
            style={{
              backgroundImage: logo ? `url(${logo})` : `url('/assets/project.png')`,
            }}
          />
          <div className="flex flex-col min-w-0">
            <h4 className="text-black dark:text-neutral-100 text-sm font-medium flex items-center gap-1 truncate">
              <span className="truncate">{title}</span>
              <CheckBadgeIcon className="inline h-3.5 w-3.5 text-blue-500 shrink-0" />
            </h4>
            {repo && (
              <span className="text-gray-400 dark:text-neutral-400 text-xs truncate">
                @{repo.split("/").filter(Boolean).pop()}
              </span>
            )}
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {repo && (
            <motion.a
              href={repo}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              aria-label="GitHub Repository"
              className="text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white p-1 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <SiGithub className="h-4 w-4" />
            </motion.a>
          )}

          {live && (
            <motion.a
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Live Demo"
              className="bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 p-1 w-6 h-6 rounded flex items-center justify-center transition-colors shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-xs font-semibold leading-none">↗</span>
            </motion.a>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-500 dark:text-white text-xs sm:text-[13px] leading-relaxed line-clamp-2 shrink-0">
        {description}
      </p>

      {/* Preview Image - Full view without cropping */}
      <div className="relative w-full flex-1 min-h-0 rounded-lg overflow-hidden bg-gray-50/80 dark:bg-neutral-950/80 border border-gray-100 dark:border-neutral-800 flex items-center justify-center p-2">
        <Image
          src={image}
          alt={`${title} preview`}
          fill
          className="object-contain rounded transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 639px) calc(100vw - 80px), 260px"
        />
      </div>
    </motion.div>
  );
};

export default FeaturedWork;
