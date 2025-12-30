"use client";

import { cn } from "@/lib/utils";
import { HTMLMotionProps, motion } from "framer-motion";

interface NeonButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "danger";
}

export function NeonButton({ className, variant = "primary", children, ...props }: NeonButtonProps) {
    const variants = {
        primary: "bg-neon-blue/10 text-neon-blue border-neon-blue hover:bg-neon-blue hover:text-black hover:shadow-[0_0_20px_#00f3ff]",
        secondary: "bg-neon-purple/10 text-neon-purple border-neon-purple hover:bg-neon-purple hover:text-white hover:shadow-[0_0_20px_#bd00ff]",
        danger: "bg-neon-pink/10 text-neon-pink border-neon-pink hover:bg-neon-pink hover:text-white hover:shadow-[0_0_20px_#ff00cc]",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "px-6 py-2 rounded-lg font-bold border transition-all duration-300 uppercase tracking-widest text-sm backdrop-blur-md cursor-pointer",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
}
