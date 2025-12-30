"use client";

import { useEffect } from "react";
import { OrderEntry } from "@/components/terminal/OrderEntry";
import { OrderBook } from "@/components/terminal/OrderBook";
import { OrderBlotter } from "@/components/terminal/OrderBlotter";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { startMarketSimulation, stopMarketSimulation } from "@/lib/stores/marketStore";
import { motion } from "framer-motion";

export default function TradePage() {
    useEffect(() => {
        startMarketSimulation();
        return () => stopMarketSimulation();
    }, []);

    return (
        <div className="h-[calc(100vh-5rem)] grid grid-cols-12 gap-2 overflow-hidden">
            {/* Order Entry */}
            <motion.div
                className="col-span-3 h-full overflow-y-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                <OrderEntry defaultSymbol="NVDA" />
            </motion.div>

            {/* Market Overview + Order Blotter */}
            <motion.div
                className="col-span-6 h-full flex flex-col gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.05 }}
            >
                <div className="h-[35%]">
                    <MarketOverview />
                </div>
                <div className="flex-1 min-h-0">
                    <OrderBlotter />
                </div>
            </motion.div>

            {/* Order Book */}
            <motion.div
                className="col-span-3 h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
            >
                <OrderBook />
            </motion.div>
        </div>
    );
}
