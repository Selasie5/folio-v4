import type { Metadata } from "next";

import "./globals.css";
import BackgroundSoundController from "@/components/core/BackgroundSoundController";



export const metadata: Metadata = {
  title: "Selasie Sepenu - Software Engineer",
  description: "Personal portfolio of Selasie Sepenu, a software engineer.",
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
