"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Sparkles } from "lucide-react";

export function AIInsight() {
    return (
        <div className="relative group h-full">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-black/80 border border-glass-border rounded-lg p-2 h-full backdrop-blur-xl">
                <div className="flex items-center gap-1.5 mb-2">
                    <div className="p-1 bg-neon-purple/20 rounded">
                        <BrainCircuit className="w-3.5 h-3.5 text-neon-purple" />
                    </div>
                    <h3 className="text-xs font-bold text-white">AI Model</h3>
                </div>

                <div className="space-y-2">
                    <div className="flex items-start gap-1.5">
                        <Sparkles className="w-3 h-3 text-neon-blue mt-0.5 shrink-0" />
                        <p className="text-gray-400 text-[10px] leading-relaxed">
                            <span className="text-neon-blue font-bold">Signal:</span> Tech momentum shift.
                            Breakout <span className="font-mono text-neon-pink">87.4%</span> prob.
                        </p>
                    </div>

                    <div className="space-y-0.5">
                        <div className="flex justify-between text-[9px] text-gray-500">
                            <span>Confidence</span>
                            <span className="font-mono">87%</span>
                        </div>
                        <motion.div
                            className="h-1 w-full bg-gray-800 rounded-full overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <motion.div
                                className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
                                initial={{ width: 0 }}
                                animate={{ width: "87%" }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
