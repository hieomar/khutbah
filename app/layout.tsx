import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Khutbah | Islamic Media Platform for Malawi",
  description:
    "Discover Islamic preachings (Maulaliki), Friday khutbahs, and teachings from across Malawi. An accessible digital home for Islamic knowledge in audio and video.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#DADAD4] text-[#171717] font-sans selection:bg-[#FF713F]/20 selection:text-[#171717]">
        {children}
      </body>
    </html>
  );
}
