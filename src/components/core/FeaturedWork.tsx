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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      viewport={{ once: true }}
      className="w-full h-auto border border-gray-200 rounded-lg p-5 bg-white/80 backdrop-blur-sm cursor-pointer flex flex-col justify-center items-start gap-5 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* Header */}
      <div className="flex justify-between items-center w-full">
        <motion.div
          className="flex justify-center items-start gap-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div
            className="h-10 w-10 rounded-full bg-gray-300 bg-cover bg-center"
            style={{
              backgroundImage: logo ? `url(${logo})` : `url('/assets/project.png')`,
            }}
          />
          <div className="flex flex-col justify-center items-start">
            <h4 className="text-black text-base font-medium flex items-center">
              {title}
              <CheckBadgeIcon className="inline h-4 w-4 text-blue-500 ml-1" />
            </h4>
            {repo && (
              <span className="text-gray-500 text-sm">@{repo.split("/").pop()}</span>
            )}
          </div>
        </motion.div>

        {/* Icons */}
        <motion.div
          className="flex justify-center items-center gap-1"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {repo && (
            <motion.a
              href={repo}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
            >
              <SiGithub className="size-6 text-gray-700 hover:text-black transition-colors duration-200" />
            </motion.a>
          )}

          {live && (
            <motion.a
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-200 shadow-[2px_2px_0px_0px] shadow-gray-300 p-1 w-6 h-6 rounded-lg hover:shadow-none transition-all duration-300 flex justify-center items-center"
            >
              <span className="text-xs text-gray-600 hover:text-gray-800">↗</span>
            </motion.a>
          )}
        </motion.div>
      </div>

      {/* Body */}
      <motion.div
        className="flex flex-col justify-center items-start gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <p className="text-gray-500 text-[15px] leading-relaxed">{description}</p>

        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-full overflow-hidden rounded-lg"
        >
          <Image
            src={image}
            alt={`${title} preview`}
            width={800}
            height={400}
            className="rounded-lg w-full object-cover"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default FeaturedWork;
