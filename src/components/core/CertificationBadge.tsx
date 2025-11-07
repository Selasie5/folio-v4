"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

interface CertificationBadgeProps {
  title: string;
  issuer: string;
  issuedDate: string;
  logo: string;
}

const CertificationBadge: React.FC<CertificationBadgeProps> = ({
  title,
  issuer,
  issuedDate,
  logo,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      viewport={{ once: true }}
      className="relative w-full  sm:w-auto border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300  rounded-xl px-5 py-4 flex flex-col justify-center items-center gap-4 cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-gray-50/10 rounded-xl pointer-events-none"></div>

      {/* Logo */}
      <div className="relative flex-shrink-0">
        <div className="h-12 w-12 bg-gray-100 rounded-full overflow-hidden flex justify-center items-center border border-gray-200">
          <Image
            src={logo}
            alt={`${issuer} logo`}
            width={40}
            height={40}
            className="object-cover w-full"
          />
        </div>
      </div>

      {/* Text Info */}
      <div className="flex flex-col justify-center items-center gap-0.5">
        <div className="flex items-center gap-1">
          <h4 className="text-gray-900 text-sm font-semibold">{title}</h4>
          <CheckBadgeIcon className="h-4 w-4 text-blue-500" />
        </div>
        <p className="text-gray-600 text-sm">{issuer}</p>
        <p className="text-gray-400 text-xs">Issued {issuedDate}</p>
      </div>
    </motion.div>
  );
};

export default CertificationBadge;
