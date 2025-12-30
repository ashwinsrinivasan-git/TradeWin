"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BarChart3, LineChart, BrainCircuit, Settings, LogOut, ArrowLeftRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Trade", href: "/trade", icon: ArrowLeftRight },
    { name: "Market", href: "/market", icon: BarChart3 },
    { name: "Portfolio", href: "/portfolio", icon: LineChart },
    { name: "AI", href: "/insights", icon: BrainCircuit },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className={cn(
                "h-screen border-r border-glass-border bg-glass backdrop-blur-xl flex flex-col fixed left-0 top-0 z-50 transition-all duration-200",
                expanded ? "w-40" : "w-12"
            )}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
        >
            {/* Logo */}
            <div className="p-2 border-b border-glass-border flex items-center justify-center">
                <h1 className={cn(
                    "font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent transition-all",
                    expanded ? "text-sm" : "text-xs"
                )}>
                    {expanded ? "TradeWin" : "TW"}
                </h1>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-1 space-y-0.5">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={item.name}
                            className={cn(
                                "flex items-center gap-2 px-2 py-1.5 rounded text-[10px] font-medium transition-all",
                                isActive
                                    ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
                                    : "text-gray-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className="w-4 h-4 shrink-0" />
                            {expanded && <span className="truncate">{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-1 border-t border-glass-border">
                <button
                    className="flex items-center gap-2 px-2 py-1.5 w-full rounded text-[10px] font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Logout"
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    {expanded && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
}
