import { GlassCard } from "@/components/ui/GlassCard";
import { Activity, ShieldAlert, BadgeCheck } from "lucide-react";

const activities = [
    { id: 1, type: "trade", message: "Bot A1 executed BUY SPY @ 4250", time: "12:01 PM", icon: BadgeCheck, color: "text-neon-blue" },
    { id: 2, type: "alert", message: "High Volatility detected in VIX", time: "11:45 AM", icon: ShieldAlert, color: "text-neon-pink" },
    { id: 3, type: "system", message: "Risk Model updated successfully", time: "11:30 AM", icon: Activity, color: "text-neon-purple" },
    { id: 4, type: "trade", message: "Bot B2 executed SELL QQQ @ 350", time: "11:15 AM", icon: BadgeCheck, color: "text-neon-blue" },
];

export function RecentActivity() {
    return (
        <GlassCard className="p-6 h-full">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-neon-purple" />
                System Activity
            </h3>

            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-glass-border">
                        <div className={`p-2 rounded-full bg-white/5 ${activity.color}`}>
                            <activity.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-200">{activity.message}</p>
                            <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
