import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    label: string;
    value: string;
    trend: number;
    trendLabel?: string;
}

export function StatCard({ label, value, trend, trendLabel = "vs last hour" }: StatCardProps) {
    const isPositive = trend >= 0;

    return (
        <GlassCard className="p-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                {isPositive ? (
                    <ArrowUpRight className="w-8 h-8 text-neon-blue" />
                ) : (
                    <ArrowDownRight className="w-8 h-8 text-neon-pink" />
                )}
            </div>

            <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">{label}</p>
            <div className="mt-0.5 flex items-baseline gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight font-mono">{value}</h3>
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                <span
                    className={cn(
                        "flex items-center gap-0.5 font-bold",
                        isPositive ? "text-neon-blue" : "text-neon-pink"
                    )}
                >
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(trend)}%
                </span>
                <span className="text-gray-500">{trendLabel}</span>
            </div>
        </GlassCard>
    );
}
