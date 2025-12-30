"use client";

import { Bell, Search, User, Menu } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function Header() {
    return (
        <header className="h-16 border-b border-glass-border bg-glass backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between ml-64">
            <div className="flex items-center gap-4">
                <button className="lg:hidden text-gray-400 hover:text-white">
                    <Menu className="w-6 h-6" />
                </button>
                <div className="relative hidden md:block">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        className="bg-black/20 border border-glass-border rounded-full pl-10 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-neon-blue/50 w-64 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-400 hover:text-neon-blue transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-pink rounded-full shadow-[0_0_10px_#ff00cc]"></span>
                </button>

                <GlassCard className="flex items-center gap-3 px-3 py-1.5 border-glass-border rounded-full cursor-pointer hover:border-neon-blue/30">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium hidden sm:block">Trader Alpha</span>
                </GlassCard>
            </div>
        </header>
    );
}
