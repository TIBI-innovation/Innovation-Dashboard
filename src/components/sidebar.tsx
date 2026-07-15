"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Lightbulb,
  Key,
  BarChart3,
  Library,
  Building2,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Invention Disclosure", href: "/disclosures", icon: Lightbulb },
  { label: "Licensing Center", href: "/licensing", icon: Key },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Intellectual Property Directory", href: "/ip-directory", icon: Library },
  { label: "Funding Sourcing", href: "/funding-sourcing", icon: Building2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
          <Image src="/logo.png" alt="Terasaki" width={32} height={32} className="h-8 w-8" />
        </div>
        <span className="font-semibold text-gray-900">Terasaki Innovation</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
            MR
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">Maddie Rogers</p>
            <p className="text-gray-500 text-xs">Innovation Team</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
