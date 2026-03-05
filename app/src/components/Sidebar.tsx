"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/accounts", label: "企業", icon: "🏢" },
  { href: "/contacts", label: "担当者", icon: "👤" },
  { href: "/opportunities", label: "商談", icon: "💼" },
  { href: "/tasks", label: "タスク", icon: "✅" },
  { href: "/activities", label: "活動", icon: "📋" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-slate-800 text-white flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-lg font-bold tracking-wide">SFA</h1>
        <p className="text-xs text-slate-400">営業支援システム</p>
      </div>
      <nav className="flex-1 py-2">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-slate-700 text-white font-medium"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
        SFA Prototype v0.1
      </div>
    </aside>
  );
}
