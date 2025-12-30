"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useMarketStore, selectOrderBook, type OrderBookLevel } from "@/lib/stores/marketStore";
import { ArrowUp, ArrowDown, Zap } from "lucide-react";

// Column helper for TanStack Table (headless)
const columnHelper = createColumnHelper<OrderBookLevel>();

const formatPrice = (price: number) => price.toFixed(2);
const formatSize = (size: number) => size.toLocaleString();
const formatTotal = (total: number) => `$${(total / 1000).toFixed(1)}K`;

interface OrderBookRowProps {
    level: OrderBookLevel;
    side: "bid" | "ask";
    maxTotal: number;
    onPriceClick: (price: number, side: "bid" | "ask") => void;
}

const OrderBookRow = ({ level, side, maxTotal, onPriceClick }: OrderBookRowProps) => {
    const [flash, setFlash] = useState(false);
    const prevSize = useMemo(() => level.size, []);

    useEffect(() => {
        if (level.size !== prevSize) {
            setFlash(true);
            const timer = setTimeout(() => setFlash(false), 300);
            return () => clearTimeout(timer);
        }
    }, [level.size, prevSize]);

    const depthPercent = Math.min(100, (level.total / maxTotal) * 100);
    const isBid = side === "bid";
    const colorClass = isBid ? "text-neon-blue" : "text-neon-pink";
    const bgClass = isBid ? "bg-neon-blue/10" : "bg-neon-pink/10";

    return (
        <motion.div
            className={`grid grid-cols-3 relative group cursor-pointer hover:bg-white/10 transition-colors ${flash ? (isBid ? "bg-neon-blue/20" : "bg-neon-pink/20") : ""}`}
            onClick={() => onPriceClick(level.price, side)}
            layout
        >
            {/* Depth visualization bar */}
            <motion.div
                className={`absolute ${isBid ? "left-0" : "right-0"} top-0 bottom-0 ${bgClass}`}
                initial={{ width: 0 }}
                animate={{ width: `${depthPercent}%` }}
                transition={{ duration: 0.3 }}
            />

            {/* Price */}
            <span className={`${colorClass} z-10 font-bold px-3 py-1.5`}>
                {formatPrice(level.price)}
            </span>

            {/* Size */}
            <span className="text-right text-gray-300 z-10 px-3 py-1.5">
                {formatSize(level.size)}
            </span>

            {/* Cumulative Total */}
            <span className="text-right text-gray-500 z-10 px-3 py-1.5">
                {formatTotal(level.price * level.total)}
            </span>
        </motion.div>
    );
};

interface SpreadDisplayProps {
    bid: number;
    ask: number;
    symbol: string;
}

const SpreadDisplay = ({ bid, ask, symbol }: SpreadDisplayProps) => {
    const spread = ask - bid;
    const spreadBps = ((spread / bid) * 10000).toFixed(1);
    const mid = (bid + ask) / 2;

    return (
        <div className="py-3 px-4 bg-black/40 border-y border-glass-border">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-neon-purple" />
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Spread</span>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold text-white font-mono">
                        ${mid.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                        ${spread.toFixed(2)} ({spreadBps} bps)
                    </div>
                </div>
            </div>
        </div>
    );
};

interface OrderBookProps {
    symbol?: string;
}

export function OrderBook({ symbol = "NVDA" }: OrderBookProps) {
    const orderBook = useMarketStore((state) => selectOrderBook(symbol)(state));
    const [selectedPrice, setSelectedPrice] = useState<number | null>(null);

    // Generate mock order book if not in store
    const { asks, bids } = useMemo(() => {
        if (orderBook) {
            return { asks: orderBook.asks, bids: orderBook.bids };
        }

        // Fallback mock data
        const midPrice = 485.00;
        const mockAsks: OrderBookLevel[] = [];
        const mockBids: OrderBookLevel[] = [];
        let askTotal = 0;
        let bidTotal = 0;

        for (let i = 0; i < 10; i++) {
            const askSize = Math.floor(Math.random() * 800) + 100;
            const bidSize = Math.floor(Math.random() * 800) + 100;
            askTotal += askSize;
            bidTotal += bidSize;

            mockAsks.push({
                price: +(midPrice + 0.05 + i * 0.10).toFixed(2),
                size: askSize,
                total: askTotal,
            });
            mockBids.push({
                price: +(midPrice - 0.05 - i * 0.10).toFixed(2),
                size: bidSize,
                total: bidTotal,
            });
        }

        return { asks: mockAsks.reverse(), bids: mockBids };
    }, [orderBook]);

    // Calculate max totals for depth visualization
    const maxAskTotal = useMemo(() => Math.max(...asks.map((a) => a.total)), [asks]);
    const maxBidTotal = useMemo(() => Math.max(...bids.map((b) => b.total)), [bids]);

    const handlePriceClick = useCallback((price: number, side: "bid" | "ask") => {
        setSelectedPrice(price);
        // In a real app, this would populate the order entry form
        console.log(`Selected ${side} @ ${price}`);
    }, []);

    // Simulate live updates
    useEffect(() => {
        const interval = setInterval(() => {
            // The actual updates come from the Zustand store
            // This is just to trigger re-renders for demo
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const topBid = bids[0]?.price || 0;
    const topAsk = asks[asks.length - 1]?.price || 0;

    return (
        <GlassCard className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-glass-border flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-white text-sm">Order Book</h3>
                    <span className="text-xs text-gray-500">{symbol} • TanStack Headless</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-xs text-neon-blue flex items-center gap-1">
                        <ArrowUp className="w-3 h-3" />
                        {bids.reduce((sum, b) => sum + b.size, 0).toLocaleString()}
                    </span>
                    <span className="text-gray-500">/</span>
                    <span className="text-xs text-neon-pink flex items-center gap-1">
                        {asks.reduce((sum, a) => sum + a.size, 0).toLocaleString()}
                        <ArrowDown className="w-3 h-3" />
                    </span>
                </div>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-3 px-3 py-2 text-[10px] text-gray-500 uppercase tracking-wider border-b border-glass-border bg-black/20">
                <span>Price</span>
                <span className="text-right">Size</span>
                <span className="text-right">Total</span>
            </div>

            {/* Asks (Sell Orders) - Reversed for visual */}
            <div className="flex-1 overflow-hidden flex flex-col justify-end">
                <div className="font-mono text-xs">
                    <AnimatePresence mode="popLayout">
                        {asks.slice(-8).map((ask) => (
                            <OrderBookRow
                                key={ask.price}
                                level={ask}
                                side="ask"
                                maxTotal={maxAskTotal}
                                onPriceClick={handlePriceClick}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Spread */}
            <SpreadDisplay bid={topBid} ask={topAsk} symbol={symbol} />

            {/* Bids (Buy Orders) */}
            <div className="flex-1 overflow-hidden">
                <div className="font-mono text-xs">
                    <AnimatePresence mode="popLayout">
                        {bids.slice(0, 8).map((bid) => (
                            <OrderBookRow
                                key={bid.price}
                                level={bid}
                                side="bid"
                                maxTotal={maxBidTotal}
                                onPriceClick={handlePriceClick}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer with aggregation info */}
            <div className="p-2 border-t border-glass-border bg-black/20 text-center">
                <span className="text-[10px] text-gray-500">
                    Click price to populate order • Aggregation: 0.10
                </span>
            </div>
        </GlassCard>
    );
}
