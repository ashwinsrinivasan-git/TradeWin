"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { time: "09:30", price: 4200 },
    { time: "10:00", price: 4215 },
    { time: "10:30", price: 4205 },
    { time: "11:00", price: 4230 },
    { time: "11:30", price: 4250 },
    { time: "12:00", price: 4245 },
    { time: "12:30", price: 4260 },
    { time: "13:00", price: 4280 },
    { time: "13:30", price: 4275 },
    { time: "14:00", price: 4290 },
];

export function MarketOverview() {
    return (
        <GlassCard className="p-2 h-full">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-white">Market Pulse</h3>
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-500 font-mono">ES Futures</span>
                    <span className="px-1 py-0.5 text-[8px] font-bold text-black bg-neon-blue rounded">LIVE</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#444" fontSize={8} tickLine={false} axisLine={false} />
                    <YAxis stroke="#444" fontSize={8} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#050510', borderColor: '#ffffff20', color: '#fff', fontSize: 10, padding: '4px 8px' }}
                        itemStyle={{ color: '#00f3ff' }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#00f3ff" strokeWidth={1.5} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
            </ResponsiveContainer>
        </GlassCard>
    );
}
