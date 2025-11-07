import type { Metadata } from "next";

import "./globals.css";



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
        {children}
      </body>
    </html>
  );
}
