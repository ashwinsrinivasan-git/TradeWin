"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
    { name: "Equities", value: 45, color: "#00f3ff" },    // neon-blue
    { name: "Crypto", value: 25, color: "#bd00ff" },      // neon-purple
    { name: "Options", value: 20, color: "#ff00cc" },     // neon-pink
    { name: "Cash", value: 10, color: "#ffffff" },
];

export function AllocationChart() {
    return (
        <GlassCard className="p-6 h-[350px]">
            <h3 className="font-bold text-lg text-white mb-4">Asset Allocation</h3>
            <div className="h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} className="stroke-background stroke-2" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#050510', borderColor: '#ffffff20', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <div className="text-3xl font-bold text-white">100%</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Invested</div>
                </div>
            </div>

            <div className="flex justify-center gap-4 text-xs mt-2">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-400">{item.name}</span>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
