
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
        initial: { opacity: 0, filter: 'blur(8px)' },
        animate: { opacity: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, filter: 'blur(4px)' },
    },
    slideUp: {
        initial: { opacity: 0, y: 30, filter: 'blur(10px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, y: -20, filter: 'blur(5px)' },
    },
    slideLeft: {
        initial: { opacity: 0, x: 40, filter: 'blur(10px)' },
        animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, x: -30, filter: 'blur(5px)' },
    },
    scale: {
        initial: { opacity: 0, scale: 0.95, filter: 'blur(8px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 0.98, filter: 'blur(4px)' },
    },
    blur: {
        initial: { opacity: 0, filter: 'blur(20px)' },
        animate: { opacity: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, filter: 'blur(10px)' },
    },
};

export default function PageTransition({
    children,
    className,
    variant = 'slideUp',
    duration = 0.5
}: PageTransitionProps) {
    return (
        <motion.div
            variants={transitions[variant]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration,
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

