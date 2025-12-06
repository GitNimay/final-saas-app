import React from 'react';
import { motion, Variants } from 'framer-motion';

interface AnimatedCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    hoverScale?: number;
    hoverLift?: boolean;
    glowColor?: string;
    index?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
    children,
    className = '',
    delay = 0,
    hoverScale = 1.02,
    hoverLift = true,
    glowColor = 'rgba(99, 102, 241, 0.15)',
    index = 0,
}) => {
    const cardVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 30,
            filter: 'blur(10px)',
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            scale: 1,
            transition: {
                duration: 0.5,
                delay: delay + (index * 0.08),
                ease: [0.25, 0.4, 0.25, 1],
            },
        },
    };

    return (
        <motion.div
            className={`relative ${className}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{
                scale: hoverScale,
                y: hoverLift ? -4 : 0,
                boxShadow: `0 20px 40px -15px ${glowColor}`,
                transition: {
                    duration: 0.3,
                    ease: [0.25, 0.4, 0.25, 1],
                },
            }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Subtle gradient overlay on hover */}
            <motion.div
                className="absolute inset-0 rounded-inherit opacity-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at 50% 0%, ${glowColor}, transparent 70%)`,
                    borderRadius: 'inherit',
                }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            />
            {children}
        </motion.div>
    );
};

export default AnimatedCard;
