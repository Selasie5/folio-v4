import type { Metadata } from "next";

import "./globals.css";
import Footer from "@/components/layout/Footer";



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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try { document.documentElement.classList.toggle('dark', localStorage.getItem('portfolio-theme') !== 'light'); } catch {}` }} />
      </head>
      <body className="mx-auto w-full max-w-[648px] px-6 py-10 antialiased sm:pt-14 sm:pb-12">
        {/* <BackgroundSoundController/> */}
        {children}
        <Footer/>
      </body>
    </html>
  );
}
