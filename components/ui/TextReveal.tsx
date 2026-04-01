import { motion } from 'framer-motion';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { memo } from 'react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface TextRevealProps {
    text: string;
    className?: string;
    delay?: number;
    highlightWords?: string[];
}

const TextReveal = memo(function TextReveal({ text, className, delay = 0, highlightWords = [] }: TextRevealProps) {
    const words = text.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.04 * i + delay },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            } as any,
        },
        hidden: {
            opacity: 0,
            y: 20,
            filter: "blur(10px)",
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            } as any,
        },
    };

    return (
        <motion.div
            style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", justifyContent: "center" }}
            variants={container}
            initial="hidden"
            animate="visible"
            className={cn("gap-[0.2em]", className)}
        >
            {words.map((word, index) => {
                const isHighlighted = highlightWords.some(hw =>
                    word.toLowerCase().includes(hw.toLowerCase())
                );

                return (
                    <motion.span variants={child} key={index} className="relative block">
                        <span className={isHighlighted ? "text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.3)]" : ""}>
                            {word}
                        </span>
                        {/* Add space after word */}
                        <span>&nbsp;</span>
                    </motion.span>
                );
            })}
        </motion.div>
    );
});

export default memo(TextReveal);
