"use client";

import { PositionsTable } from "@/components/portfolio/PositionsTable";
import { AllocationChart } from "@/components/portfolio/AllocationChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { motion } from "framer-motion";

export default function PortfolioPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Portfolio Overview</h1>
                    <p className="text-gray-400">Manage your assets and analyze performance.</p>
                </div>
            </div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <StatCard label="Net Liquidation" value="$2,845,200" trend={8.4} />
                <StatCard label="Day P&L" value="+$124,500" trend={4.2} />
                <StatCard label="Sharpe Ratio" value="2.1" trend={0.1} trendLabel="Risk Adjusted" />
                <StatCard label="Beta" value="1.2" trend={-0.05} trendLabel="vs SPY" />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <PositionsTable />
                </motion.div>

                <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <AllocationChart />

                    {/* Risk Analysis Card Placeholder */}
                    <div className="p-6 border border-glass-border rounded-xl bg-glass backdrop-blur-xl">
                        <h3 className="font-bold text-white mb-4">Risk Metics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Value at Risk (VaR)</span>
                                <span className="text-neon-pink font-mono">$45,000</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Max Drawdown</span>
                                <span className="text-white font-mono">-12.5%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Correlation (SPX)</span>
                                <span className="text-neon-blue font-mono">0.85</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
