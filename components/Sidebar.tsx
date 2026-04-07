"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users, UserPlus, Youtube, FileText, DollarSign, Calendar, Bot, Tv2, Settings
} from "lucide-react";

const NAV_LINKS = [
  { href: "/clients",              label: "Clients",    icon: Users },
  { href: "/leads",                label: "Leads",      icon: UserPlus },
  { href: "/youtube-intelligence", label: "YT Intel",   icon: Tv2 },
  { href: "/scripts",              label: "Scripts",    icon: FileText },
  { href: "/financials",           label: "Financials", icon: DollarSign },
  { href: "/calendar",             label: "Calendar",   icon: Calendar },
  { href: "/agent",                label: "Agent",      icon: Bot },
  { href: "/settings",             label: "Settings",   icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="glass-sidebar fixed inset-y-0 left-0 z-30 flex flex-col"
      style={{ width: "var(--sidebar-width)" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-blue-100/60">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            boxShadow: "0 2px 10px rgba(37,99,235,0.35)",
          }}
        >
          <Youtube size={14} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800 leading-none truncate">YouTube Agency OS</p>
          <p className="text-[10px] text-slate-400 leading-none mt-0.5">by FASTR AI</p>
        </div>
        <span
          className="ml-auto rounded-full text-[9px] font-bold px-1.5 py-0.5 leading-none tracking-wide flex-shrink-0"
          style={{ background: "rgba(37,99,235,0.1)", color: "#2563eb" }}
        >
          DEMO
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="heading-xs px-2 mb-3">Navigation</p>
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/clients"
              ? pathname === "/clients" || pathname.startsWith("/clients/")
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "text-blue-700"
                  : "text-slate-500 hover:text-slate-800 hover:bg-blue-50/60"
              }`}
              style={
                isActive
                  ? {
                      background: "rgba(37,99,235,0.08)",
                      border: "1px solid rgba(37,99,235,0.15)",
                      boxShadow: "0 1px 4px rgba(37,99,235,0.08)",
                    }
                  : { border: "1px solid transparent" }
              }
            >
              <Icon
                size={15}
                className={isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-blue-100/60">
        <p className="text-[10px] text-slate-400">FASTR AI © 2026</p>
      </div>
    </aside>
  );
}
