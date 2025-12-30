"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { useOMSStore, selectWorkingOrders, type Order } from "@/lib/stores/omsStore";
import { ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    PENDING: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    OPEN: { icon: AlertCircle, color: "text-neon-blue", bg: "bg-neon-blue/10" },
    PARTIAL: { icon: AlertCircle, color: "text-neon-purple", bg: "bg-neon-purple/10" },
    FILLED: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10" },
    CANCELLED: { icon: XCircle, color: "text-gray-400", bg: "bg-gray-400/10" },
    REJECTED: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
};

interface OrderRowProps {
    order: Order;
    onCancel: (orderId: string) => void;
}

function OrderRow({ order, onCancel }: OrderRowProps) {
    const config = statusConfig[order.status];
    const StatusIcon = config.icon;
    const canCancel = order.status === "PENDING" || order.status === "OPEN" || order.status === "PARTIAL";

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-2 p-1.5 bg-black/30 rounded border border-glass-border hover:border-neon-blue/30 transition-colors group"
        >
            {/* Side */}
            <div className={cn("p-1 rounded", order.side === "BUY" ? "bg-green-400/10" : "bg-red-400/10")}>
                {order.side === "BUY" ? (
                    <ArrowUpCircle className="w-3 h-3 text-green-400" />
                ) : (
                    <ArrowDownCircle className="w-3 h-3 text-red-400" />
                )}
            </div>

            {/* Symbol */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                    <span className="font-bold text-white text-[10px]">{order.symbol}</span>
                    <span className="text-[8px] text-gray-500">{order.orderType}</span>
                </div>
            </div>

            {/* Qty */}
            <div className="text-right">
                <div className="font-mono text-white text-[10px]">
                    {order.filledQty}/{order.quantity}
                </div>
            </div>

            {/* Price */}
            <div className="text-right min-w-[50px]">
                <div className="font-mono text-white text-[10px]">
                    {order.price ? `$${order.price.toFixed(2)}` : "MKT"}
                </div>
            </div>

            {/* Status */}
            <div className={cn("flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px]", config.bg)}>
                <StatusIcon className={cn("w-2.5 h-2.5", config.color)} />
                <span className={cn("font-medium", config.color)}>{order.status}</span>
            </div>

            {/* Cancel */}
            {canCancel && (
                <button
                    onClick={() => onCancel(order.orderId)}
                    className="p-0.5 rounded bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X className="w-2.5 h-2.5" />
                </button>
            )}
        </motion.div>
    );
}

export function OrderBlotter() {
    const workingOrders = useOMSStore(selectWorkingOrders);
    const cancelOrder = useOMSStore((state) => state.cancelOrder);
    const [filter, setFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");

    const filteredOrders = workingOrders.filter((order) => filter === "ALL" || order.side === filter);

    return (
        <GlassCard className="p-2 h-full flex flex-col" variant="neon">
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-white">Working Orders</h3>
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
                    <span className="text-[9px] text-gray-500 font-mono">({workingOrders.length})</span>
                </div>
                <div className="flex items-center gap-0.5 p-0.5 bg-black/30 rounded">
                    {(["ALL", "BUY", "SELL"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-1.5 py-0.5 text-[8px] font-medium rounded transition-colors",
                                filter === f ? "bg-neon-blue/20 text-neon-blue" : "text-gray-500 hover:text-white"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders */}
            <div className="flex-1 overflow-y-auto space-y-1">
                <AnimatePresence mode="popLayout">
                    {filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <Clock className="w-6 h-6 mb-1 opacity-30" />
                            <span className="text-[10px]">No orders</span>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <OrderRow key={order.orderId} order={order} onCancel={cancelOrder} />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </GlassCard>
    );
}
