"use client";

import { useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { Watchlist } from "@/components/dashboard/Watchlist";
import { AIInsight } from "@/components/dashboard/AIInsight";
import { NeonButton } from "@/components/ui/NeonButton";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { startMarketSimulation, stopMarketSimulation, useMarketStore, selectTotalPnL, selectTotalValue } from "@/lib/stores/marketStore";
import Link from "next/link";

export default function Home() {
  useEffect(() => {
    startMarketSimulation();
    return () => stopMarketSimulation();
  }, []);

  const totalPnL = useMarketStore(selectTotalPnL);
  const totalValue = useMarketStore(selectTotalValue);

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-2">
      {/* Header - Compact */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Command Center</h1>
          <p className="text-xs text-gray-500">
            Market <span className="text-neon-blue font-medium">Active</span>
          </p>
        </div>
        <Link href="/trade">
          <NeonButton variant="primary" className="flex items-center gap-1.5 text-xs py-1.5 px-3">
            <Plus className="w-3 h-3" />
            Order
          </NeonButton>
        </Link>
      </div>

      {/* Stats Row - Compact */}
      <motion.div
        className="grid grid-cols-3 gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <StatCard
          label="Total P&L"
          value={formatCurrency(totalPnL)}
          trend={totalPnL >= 0 ? 12.5 : -5.2}
        />
        <StatCard
          label="Portfolio"
          value={formatCurrency(totalValue)}
          trend={0}
          trendLabel="live"
        />
        <StatCard
          label="Risk"
          value="1.2%"
          trend={-0.5}
          trendLabel="limit"
        />
      </motion.div>

      {/* Main Content Grid - Compact */}
      <div className="grid grid-cols-12 gap-2 h-[calc(100vh-10rem)]">
        {/* Market Overview */}
        <motion.div
          className="col-span-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <MarketOverview />
        </motion.div>

        {/* Watchlist */}
        <motion.div
          className="col-span-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Watchlist />
        </motion.div>

        {/* AI Insight */}
        <motion.div
          className="col-span-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <AIInsight />
        </motion.div>
      </div>
    </div>
  );
}
