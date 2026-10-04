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
      <body className="min-h-full flex flex-col bg-canvas text-[#171717] font-sans selection:bg-accent-orange/20 selection:text-[#171717]">
        {children}
      </body>
    </html>
  );
}
