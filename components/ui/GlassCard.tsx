import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "neon";
}

export function GlassCard({ className, variant = "default", children, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "rounded-xl border border-glass-border bg-glass backdrop-blur-xl transition-all duration-300",
                variant === "neon" && "shadow-[0_0_20px_rgba(0,243,255,0.1)] border-neon-blue/30",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
