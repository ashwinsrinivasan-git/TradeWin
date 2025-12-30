"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { useOMSStore, type OrderSide, type OrderType, type TimeInForce } from "@/lib/stores/omsStore";
import { useMarketStore } from "@/lib/stores/marketStore";
import { ArrowUpCircle, ArrowDownCircle, Zap, Clock, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const orderTypes: { value: OrderType; label: string; icon: React.ElementType }[] = [
    { value: "MARKET", label: "MKT", icon: Zap },
    { value: "LIMIT", label: "LMT", icon: Target },
    { value: "STOP", label: "STP", icon: TrendingUp },
    { value: "STOP_LIMIT", label: "S/L", icon: Clock },
];

const timeInForceOptions: { value: TimeInForce; label: string }[] = [
    { value: "DAY", label: "DAY" },
    { value: "GTC", label: "GTC" },
    { value: "IOC", label: "IOC" },
    { value: "FOK", label: "FOK" },
];

interface OrderEntryProps {
    defaultSymbol?: string;
}

export function OrderEntry({ defaultSymbol = "AAPL" }: OrderEntryProps) {
    const [side, setSide] = useState<OrderSide>("BUY");
    const [symbol, setSymbol] = useState(defaultSymbol);
    const [orderType, setOrderType] = useState<OrderType>("LIMIT");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");
    const [stopPrice, setStopPrice] = useState("");
    const [timeInForce, setTimeInForce] = useState<TimeInForce>("DAY");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitOrder = useOMSStore((state) => state.submitOrder);
    const quote = useMarketStore((state) => state.quotes[symbol]);

    const handleSubmit = async () => {
        if (!quantity || (orderType !== "MARKET" && !price)) return;
        setIsSubmitting(true);
        try {
            submitOrder({
                symbol, side, orderType,
                quantity: parseFloat(quantity),
                price: price ? parseFloat(price) : undefined,
                stopPrice: stopPrice ? parseFloat(stopPrice) : undefined,
                timeInForce,
            });
            setQuantity(""); setPrice(""); setStopPrice("");
        } finally {
            setTimeout(() => setIsSubmitting(false), 200);
        }
    };

    const estimatedValue = quantity && price
        ? parseFloat(quantity) * parseFloat(price)
        : quantity && quote ? parseFloat(quantity) * quote.last : 0;

    return (
        <GlassCard className="p-2 h-full" variant="neon">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Order Entry</span>
                </div>
                {quote && (
                    <div className="text-right">
                        <span className="font-mono text-white text-xs">${quote.last.toFixed(2)}</span>
                        <span className={cn("text-[9px] ml-1", quote.change >= 0 ? "text-green-400" : "text-red-400")}>
                            {quote.change >= 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Side Toggle */}
            <div className="grid grid-cols-2 gap-1 mb-2">
                <button
                    onClick={() => setSide("BUY")}
                    className={cn(
                        "flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-bold transition-all",
                        side === "BUY" ? "bg-green-500 text-white" : "bg-green-500/10 text-green-400"
                    )}
                >
                    <ArrowUpCircle className="w-3 h-3" /> BUY
                </button>
                <button
                    onClick={() => setSide("SELL")}
                    className={cn(
                        "flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-bold transition-all",
                        side === "SELL" ? "bg-red-500 text-white" : "bg-red-500/10 text-red-400"
                    )}
                >
                    <ArrowDownCircle className="w-3 h-3" /> SELL
                </button>
            </div>

            {/* Symbol */}
            <div className="mb-2">
                <label className="block text-[9px] text-gray-500 mb-0.5">SYMBOL</label>
                <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    className="w-full bg-black/50 border border-glass-border rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-neon-blue"
                />
            </div>

            {/* Order Type */}
            <div className="mb-2">
                <label className="block text-[9px] text-gray-500 mb-0.5">TYPE</label>
                <div className="grid grid-cols-4 gap-0.5">
                    {orderTypes.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            onClick={() => setOrderType(value)}
                            className={cn(
                                "flex flex-col items-center py-1 rounded text-[8px] font-medium transition-all",
                                orderType === value
                                    ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/50"
                                    : "bg-black/30 text-gray-500 border border-glass-border"
                            )}
                        >
                            <Icon className="w-2.5 h-2.5 mb-0.5" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quantity & Price */}
            <div className="grid grid-cols-2 gap-1.5 mb-2">
                <div>
                    <label className="block text-[9px] text-gray-500 mb-0.5">QTY</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full bg-black/50 border border-glass-border rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-neon-blue"
                        placeholder="0"
                    />
                </div>
                <div>
                    <label className="block text-[9px] text-gray-500 mb-0.5">{orderType === "MARKET" ? "PRICE" : "LIMIT"}</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-black/50 border border-glass-border rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-neon-blue disabled:opacity-50"
                        placeholder={quote ? quote.last.toFixed(2) : "0.00"}
                        disabled={orderType === "MARKET"}
                    />
                </div>
            </div>

            {/* Stop Price */}
            {(orderType === "STOP" || orderType === "STOP_LIMIT") && (
                <div className="mb-2">
                    <label className="block text-[9px] text-gray-500 mb-0.5">STOP</label>
                    <input
                        type="number"
                        value={stopPrice}
                        onChange={(e) => setStopPrice(e.target.value)}
                        className="w-full bg-black/50 border border-glass-border rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-neon-blue"
                        placeholder="0.00"
                    />
                </div>
            )}

            {/* Time in Force */}
            <div className="mb-2">
                <label className="block text-[9px] text-gray-500 mb-0.5">TIF</label>
                <div className="grid grid-cols-4 gap-0.5">
                    {timeInForceOptions.map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setTimeInForce(value)}
                            className={cn(
                                "py-1 rounded text-[8px] font-medium transition-all",
                                timeInForce === value
                                    ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/50"
                                    : "bg-black/30 text-gray-500 border border-glass-border"
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Estimated Value */}
            {estimatedValue > 0 && (
                <div className="mb-2 p-1.5 bg-black/30 rounded border border-glass-border">
                    <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500">Est. Value</span>
                        <span className="font-mono text-white">${estimatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            )}

            {/* Submit */}
            <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmitting || !quantity}
                className={cn(
                    "w-full py-2 rounded text-xs font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                    side === "BUY" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                )}
            >
                {isSubmitting ? "..." : `${side} ${symbol}`}
            </motion.button>
        </GlassCard>
    );
}
