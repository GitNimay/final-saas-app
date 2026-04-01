import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface ShinyButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    className?: string;
    icon?: React.ReactNode;
}

const ShinyButton = React.memo(React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
    ({ children, className, icon, ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl",
                    "bg-zinc-900/90 hover:bg-zinc-800/90 text-zinc-100",
                    "border border-zinc-800 hover:border-zinc-600 transition-all duration-300",
                    "shadow-lg shadow-black/20 backdrop-blur-md overflow-hidden",
                    className
                )}
                {...props}
            >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

                {/* Content */}
                <div className="relative z-10 flex items-center gap-2 font-medium text-sm tracking-wide">
                    {icon && <span className="text-zinc-400 group-hover:text-white transition-colors">{icon}</span>}
                    {children}
                </div>

                {/* Glossy Top Highlight */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

                {/* Bottom Shadow/Reflection */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
        );
    }
));

ShinyButton.displayName = "ShinyButton";

export default ShinyButton;
