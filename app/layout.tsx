import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Tracker",
  description: "APM / Product role finder and tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full bg-zinc-50 text-zinc-900 antialiased">
        <div className="flex h-full flex-col">
          <Nav />
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </body>
    </html>
  );
}
