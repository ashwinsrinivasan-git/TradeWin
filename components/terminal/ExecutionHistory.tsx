"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { useOMSStore, selectExecutions, type Execution } from "@/lib/stores/omsStore";
import {
    History,
    ArrowUpCircle,
    ArrowDownCircle,
    Clock,
    ChevronDown,
    ChevronUp,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

interface ExecutionRowProps {
    execution: Execution;
    isNew?: boolean;
}

function ExecutionRow({ execution, isNew }: ExecutionRowProps) {
    const isBuy = execution.side === "BUY";

    return (
        <motion.div
            initial={isNew ? { opacity: 0, x: -20, scale: 0.95 } : false}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                isNew ? "bg-neon-blue/5 border-neon-blue/30" : "bg-black/20 border-glass-border"
            )}
        >
            {/* Side indicator */}
            <div className={cn("p-1.5 rounded-lg", isBuy ? "bg-green-400/10" : "bg-red-400/10")}>
                {isBuy ? (
                    <ArrowUpCircle className="w-4 h-4 text-green-400" />
                ) : (
                    <ArrowDownCircle className="w-4 h-4 text-red-400" />
                )}
            </div>

            {/* Symbol & Details */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{execution.symbol}</span>
                    <span className={cn("text-xs font-medium", isBuy ? "text-green-400" : "text-red-400")}>
                        {execution.side}
                    </span>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {formatTime(execution.timestamp)}
                </div>
            </div>

            {/* Quantity */}
            <div className="text-right">
                <div className="font-mono text-white text-sm">{execution.quantity.toLocaleString()}</div>
                <div className="text-xs text-gray-500">shares</div>
            </div>

            {/* Price */}
            <div className="text-right min-w-[80px]">
                <div className="font-mono text-white text-sm">${execution.price.toFixed(2)}</div>
                <div className="text-xs text-gray-500">{execution.venue}</div>
            </div>

            {/* Value */}
            <div className="text-right min-w-[90px]">
                <div className="font-mono text-neon-blue text-sm">
                    ${(execution.price * execution.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500">
                    fee: ${execution.commission.toFixed(2)}
                </div>
            </div>
        </motion.div>
    );
}

export function ExecutionHistory() {
    const executions = useOMSStore(selectExecutions);
    const [filter, setFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");
    const [showAll, setShowAll] = useState(false);
    const [newExecutionIds, setNewExecutionIds] = useState<Set<string>>(new Set());

    // Track new executions for animation
    useEffect(() => {
        if (executions.length > 0) {
            const latestId = executions[executions.length - 1].executionId;
            setNewExecutionIds((prev) => new Set([...prev, latestId]));

            // Remove "new" status after animation
            setTimeout(() => {
                setNewExecutionIds((prev) => {
                    const next = new Set(prev);
                    next.delete(latestId);
                    return next;
                });
            }, 2000);
        }
    }, [executions.length]);

    const filteredExecutions = executions
        .filter((e) => filter === "ALL" || e.side === filter)
        .slice()
        .reverse();

    const displayedExecutions = showAll ? filteredExecutions : filteredExecutions.slice(0, 5);

    const totalVolume = filteredExecutions.reduce((sum, e) => sum + e.price * e.quantity, 0);
    const totalCommissions = filteredExecutions.reduce((sum, e) => sum + e.commission, 0);

    return (
        <GlassCard className="p-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-neon-purple" />
                    <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Executions
                    </h3>
                    <span className="text-xs text-gray-500 font-mono">({executions.length})</span>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-1 p-1 bg-black/30 rounded-lg">
                    {(["ALL", "BUY", "SELL"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-2 py-1 text-xs font-medium rounded transition-colors",
                                filter === f
                                    ? "bg-neon-purple/20 text-neon-purple"
                                    : "text-gray-500 hover:text-white"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-black/30 rounded-lg p-3 border border-glass-border">
                    <div className="text-xs text-gray-500 mb-1">Volume Traded</div>
                    <div className="font-mono text-white font-bold">
                        ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 border border-glass-border">
                    <div className="text-xs text-gray-500 mb-1">Commissions</div>
                    <div className="font-mono text-neon-pink font-bold">
                        ${totalCommissions.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Execution List */}
            <div className="flex-1 overflow-y-auto space-y-2">
                <AnimatePresence>
                    {displayedExecutions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                            <History className="w-8 h-8 mb-2 opacity-30" />
                            <span className="text-sm">No executions yet</span>
                        </div>
                    ) : (
                        displayedExecutions.map((execution) => (
                            <ExecutionRow
                                key={execution.executionId}
                                execution={execution}
                                isNew={newExecutionIds.has(execution.executionId)}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Show More/Less */}
            {filteredExecutions.length > 5 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="mt-3 flex items-center justify-center gap-1 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                    {showAll ? (
                        <>
                            <ChevronUp className="w-4 h-4" />
                            Show Less
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-4 h-4" />
                            Show All ({filteredExecutions.length - 5} more)
                        </>
                    )}
                </button>
            )}
        </GlassCard>
    );
}
