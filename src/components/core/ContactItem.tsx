"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
// import { ArrowUpRightIcon } from "@heroicons/react/16/outline";

interface ContactItem {
  label: string;
  href: string;
  display: string; // the pretty name, e.g. / Github
}

interface ContactLinkProps {
  item: ContactItem;
}

const ContactLink: React.FC<ContactLinkProps> = ({ item }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="w-full border-b border-gray-100 py-3 cursor-pointer select-none"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Link
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex justify-between items-center w-full"
      >
        <div className="overflow-hidden h-6 flex items-center">
          <AnimatePresence mode="wait">
            {!hovered ? (
              <motion.span
                key="label"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-base font-normal text-black uppercase tracking-wide non-mono"
              >
                {item.display}
              </motion.span>
            ) : (
              <motion.span
                key="url"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-base non-mono text-blue-950"
              >
                {item.href.replace(/^https?:\/\//, "")}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          whileHover={{ rotate: 45 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <ArrowUpRightIcon className="h-5 w-5 font-light text-black" />
        </motion.div>
      </Link>
    </motion.div>
  );
};

const ContactLinksList = () => {
  const contacts: ContactItem[] = [
    {
      label: "github",
      display: "/ Github",
      href: "https://github.com/Selasie5",
    },
    {
      label: "linkedin",
      display: "/ Linkedin",
      href: "https://linkedin.com/in/selasiekofisepenu",
    },
    {
      label: "x",
      display: "/ X (formerly Twitter)",
      href: "https://x.com/SelasieSepenu",
    },
    {
      label: "instagram",
      display: "/ Instagram",
      href: "https://instagram.com/_dr_seps",
    },
    {
      label: "book",
      display: "/ Book A Call",
      href: "https://calendly.com/yourusername",
    },
    {
      label: "mail",
      display: "/ Send Me A Mail",
      href: "mailto:selasisepenu5@gmail.com",
    },
  ];

  return (
    <div className="flex flex-col justify-center items-start gap-3 mt-5">
      {contacts.map((item) => (
        <ContactLink key={item.label} item={item} />
      ))}
    </div>
  );
};

export default ContactLinksList;
