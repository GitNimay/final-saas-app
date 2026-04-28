
import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

type TransitionVariant = 'fade' | 'slideUp' | 'slideLeft' | 'scale' | 'blur';

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
    variant?: TransitionVariant;
    duration?: number;
}

const transitions: Record<TransitionVariant, Variants> = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
    slideUp: {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
    },
    slideLeft: {
        initial: { opacity: 0, x: 24 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -16 },
    },
    scale: {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.99 },
    },
    blur: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
};

export default function PageTransition({
    children,
    className,
    variant = 'slideUp',
    duration = 0.28
}: PageTransitionProps) {
    return (
        <motion.div
            variants={transitions[variant]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
                duration,
                ease: [0.16, 1, 0.3, 1],
            }}
            className={className}
            style={{ willChange: 'transform, opacity' }}
        >
            {children}
        </motion.div>
    );
}

