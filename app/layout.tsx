import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "@/components/TopNav";

export const metadata: Metadata = {
  title: "YouTube Agency OS — DEMO",
  description: "YouTube agency client management + AI scripting tools",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TopNav />
        <div className="mx-auto max-w-6xl px-4 pb-12">
          {children}
        </div>
      </body>
    </html>
  );
}
