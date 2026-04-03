import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import TribalBackground from "@/components/ui/TribalBackground";
import MouseTrail from "@/components/ui/MouseTrail";
import CursorSpotlight from "@/components/ui/CursorSpotlight";
import FloatingChatbot from "@/components/chatbot/FloatingChatbot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InterviAI",
  description: "AI powered interview training platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">

        {/* Cursor spotlight */}
        <CursorSpotlight />

        {/* Background visuals */}
        <TribalBackground />

        {/* Cursor particles */}
        <MouseTrail />

        {/* AI assistant */}
        <FloatingChatbot />

        {/* Page content */}
        <main className="relative z-10">
          {children}
        </main>

      </body>
    </html>
  );
}