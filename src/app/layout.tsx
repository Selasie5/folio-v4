import type { Metadata } from "next";

import "./globals.css";
import BackgroundSoundController from "@/components/core/BackgroundSoundController";



export const metadata: Metadata = {
  title: "Selasie Sepenu | Software Engineer",
  description: " Selasie is a software engineer passionate about crafting reliable systems and shaping how technology connects people.Over the past few years, I’ve worked across startups and engineering teams — building tools, mentoring peers, and learning from some of the best.",
  icons: [
    { rel: "icon", url: "/assets/project.png", type: "image/png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        {/* <BackgroundSoundController/> */}
        {children}
      </body>
    </html>
  );
}
