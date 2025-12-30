"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { useMarketStore } from "@/lib/stores/marketStore";
import { Star, Plus, X, TrendingUp, TrendingDown, Search, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WatchlistItemProps {
    symbol: string;
    onRemove: (symbol: string) => void;
    onSelect: (symbol: string) => void;
    isSelected: boolean;
}

function WatchlistItem({ symbol, onRemove, onSelect, isSelected }: WatchlistItemProps) {
    const quote = useMarketStore((state) => state.quotes[symbol]);

    if (!quote) {
        return (
            <div className="p-1.5 bg-black/20 rounded border border-glass-border animate-pulse">
                <div className="h-3 bg-gray-700 rounded w-10 mb-1"></div>
                <div className="h-2 bg-gray-800 rounded w-8"></div>
            </div>
        );
    }

    const isPositive = quote.change >= 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => onSelect(symbol)}
            className={cn(
                "relative group p-1.5 rounded border cursor-pointer transition-all",
                isSelected
                    ? "bg-neon-blue/10 border-neon-blue/50"
                    : "bg-black/20 border-glass-border hover:border-gray-600"
            )}
        >
            {/* Remove button */}
            <button
                onClick={(e) => { e.stopPropagation(); onRemove(symbol); }}
                className="absolute top-0.5 right-0.5 p-0.5 rounded bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <X className="w-2.5 h-2.5" />
            </button>

            {/* Symbol & Price */}
            <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px]">{symbol}</span>
                <span className="font-mono text-white text-[10px]">
                    ${quote.last.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            </div>

            {/* Change */}
            <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center gap-0.5">
                    {isPositive ? (
                        <TrendingUp className="w-2.5 h-2.5 text-green-400" />
                    ) : (
                        <TrendingDown className="w-2.5 h-2.5 text-red-400" />
                    )}
                    <span className={cn("text-[9px] font-mono", isPositive ? "text-green-400" : "text-red-400")}>
                        {isPositive ? "+" : ""}{quote.changePercent.toFixed(2)}%
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

interface WatchlistProps {
    onSymbolSelect?: (symbol: string) => void;
}

export function Watchlist({ onSymbolSelect }: WatchlistProps) {
    const watchlist = useMarketStore((state) => state.watchlist);
    const addToWatchlist = useMarketStore((state) => state.addToWatchlist);
    const removeFromWatchlist = useMarketStore((state) => state.removeFromWatchlist);

    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newSymbol, setNewSymbol] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const handleSelect = (symbol: string) => {
        setSelectedSymbol(symbol);
        onSymbolSelect?.(symbol);
    };

    const handleAdd = () => {
        if (newSymbol.trim()) {
            addToWatchlist(newSymbol.trim().toUpperCase());
            setNewSymbol("");
            setIsAdding(false);
        }
    };

    const filteredWatchlist = watchlist.filter((symbol) =>
        symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <GlassCard className="p-2 h-full flex flex-col" variant="neon">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-neon-blue" />
                    <h3 className="text-xs font-bold text-white">Watchlist</h3>
                    <span className="text-[10px] text-gray-500 font-mono">({watchlist.length})</span>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={cn(
                        "p-1 rounded transition-all",
                        isAdding ? "bg-neon-blue/20 text-neon-blue" : "text-gray-500 hover:text-white"
                    )}
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>

            {/* Add Symbol Input */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-2">
                        <div className="flex gap-1">
                            <input
                                type="text"
                                value={newSymbol}
                                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                placeholder="Symbol..."
                                className="flex-1 bg-black/50 border border-glass-border rounded px-2 py-1 text-white font-mono text-[10px] focus:outline-none focus:border-neon-blue"
                                autoFocus
                            />
                            <button onClick={handleAdd} disabled={!newSymbol.trim()} className="px-2 py-1 bg-neon-blue/20 text-neon-blue rounded text-[10px] font-medium disabled:opacity-50">
                                Add
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search */}
            <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-black/30 border border-glass-border rounded pl-6 pr-2 py-1 text-white text-[10px] focus:outline-none focus:border-neon-blue/50"
                />
            </div>

            {/* Watchlist Grid */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-1">
                    <AnimatePresence>
                        {filteredWatchlist.map((symbol) => (
                            <WatchlistItem
                                key={symbol}
                                symbol={symbol}
                                onRemove={removeFromWatchlist}
                                onSelect={handleSelect}
                                isSelected={selectedSymbol === symbol}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {filteredWatchlist.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-20 text-gray-500">
                        <Star className="w-5 h-5 mb-1 opacity-30" />
                        <span className="text-[10px]">{searchQuery ? "No matches" : "Empty"}</span>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <AnimatePresence>
                {selectedSymbol && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="mt-2 pt-2 border-t border-glass-border">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-white text-xs">{selectedSymbol}</span>
                            <button onClick={() => setSelectedSymbol(null)} className="text-gray-500 hover:text-white">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            <button className="flex items-center justify-center gap-1 py-1 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 text-[10px] font-medium">
                                <ArrowUpCircle className="w-3 h-3" />
                                Buy
                            </button>
                            <button className="flex items-center justify-center gap-1 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px] font-medium">
                                <ArrowDownCircle className="w-3 h-3" />
                                Sell
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
}
