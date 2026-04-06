"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Youtube } from "lucide-react";

const NAV_LINKS = [
  { href: "/clients", label: "Clients" },
  { href: "/leads", label: "Leads" },
  { href: "/youtube-intelligence", label: "YT Intel" },
  { href: "/scripts", label: "Scripts" },
  { href: "/financials", label: "Financials" },
  { href: "/calendar", label: "Calendar" },
  { href: "/agent", label: "Agent" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 glass-nav">
      <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-14">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-sm">
            <Youtube size={18} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-900 leading-none">YouTube Agency OS</p>
              <span className="rounded-full bg-accent text-white text-[10px] font-bold px-2 py-0.5 leading-none tracking-wide">DEMO</span>
            </div>
            <p className="text-xs text-slate-400 leading-none mt-0.5">YouTube client management + AI tools</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              href === "/clients"
                ? pathname === "/clients" || pathname.startsWith("/clients/")
                : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
