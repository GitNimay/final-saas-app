import React from 'react';
import { motion, useInView, Variants } from 'framer-motion';

interface AnimatedSectionProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    duration?: number;
    blur?: boolean;
    staggerChildren?: boolean;
    staggerDelay?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
    children,
    className = '',
    delay = 0,
    direction = 'up',
    duration = 0.6,
    blur = true,
    staggerChildren = false,
    staggerDelay = 0.1,
}) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    const getDirectionOffset = () => {
        switch (direction) {
            case 'up': return { y: 40 };
            case 'down': return { y: -40 };
            case 'left': return { x: 40 };
            case 'right': return { x: -40 };
            default: return {};
        }
    };

    const containerVariants: Variants = {
        hidden: {
            opacity: 0,
            ...getDirectionOffset(),
            filter: blur ? 'blur(10px)' : 'blur(0px)',
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            filter: 'blur(0px)',
            transition: {
                duration,
                delay,
                ease: [0.25, 0.4, 0.25, 1],
                staggerChildren: staggerChildren ? staggerDelay : 0,
            },
        },
    };

    const childVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 20,
            filter: blur ? 'blur(8px)' : 'blur(0px)',
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
                duration: duration * 0.8,
                ease: [0.25, 0.4, 0.25, 1],
            },
        },
    };

    if (staggerChildren) {
        return (
            <motion.div
                ref={ref}
                className={className}
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
            >
                {React.Children.map(children, (child) => (
                    <motion.div variants={childVariants}>
                        {child}
                    </motion.div>
                ))}
            </motion.div>
        );
    }

    return (
        <motion.div
            ref={ref}
            className={className}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedSection;
