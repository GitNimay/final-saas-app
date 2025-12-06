
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BrainCircuit, PenTool, Layout, FileCode, CheckCircle2 } from 'lucide-react';

interface GenerationVisualsProps {
    currentStep: number;
    stepId: string;
}

const VISUALS = [
    {
        id: 'validation',
        icon: Search,
        title: 'Market Validation',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        features: ['Competitor Scan', 'Trend Analysis', 'Viability Score']
    },
    {
        id: 'deep-analysis',
        icon: (props: any) => (
            <div className="relative">
                <BrainCircuit size={48} className="text-violet-500 relative z-10" />
                <div className="absolute inset-0 blur-lg bg-violet-500/50 animate-pulse"></div>
            </div>
        ),
        title: 'Deep Analysis',
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/20',
        features: ['User Personas', 'Pain Points', 'Revenue Models']
    },
    {
        id: 'blueprint',
        icon: PenTool,
        title: 'Architecture Blueprint',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        features: ['System Design', 'Database Schema', 'API Strategies']
    },
    {
        id: 'roadmap',
        icon: Layout,
        title: 'Strategic Roadmap',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        features: ['MVP Timeline', 'Milestones', 'Resource Plan']
    },
    {
        id: 'compile',
        icon: FileCode,
        title: 'Final Compilation',
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
        border: 'border-pink-500/20',
        features: ['Tech Stack', 'PRD', 'Exporting Report']
    }
];

const GenerationVisuals: React.FC<GenerationVisualsProps> = ({ currentStep }) => {
    // Safety check
    const index = Math.min(Math.max(0, currentStep), VISUALS.length - 1);
    const visual = VISUALS[index];

    return (
        <div className="w-[320px] h-[380px] sm:w-[400px] sm:h-[420px] relative [perspective:1000px] flex items-center justify-center mx-auto">
            <AnimatePresence mode="wait">
                <motion.div
                    key={visual.id}
                    initial={{ opacity: 0, rotateY: 90, scale: 0.9 }}
                    animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                    exit={{ opacity: 0, rotateY: -90, scale: 0.9 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                    className={`w-full h-full rounded-2xl border ${visual.border} ${visual.bg} backdrop-blur-xl relative overflow-hidden flex flex-col shadow-2xl`}
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>

                    {/* Glowing Orbs (Sided) */}
                    <div className={`absolute -top-10 -left-10 w-32 h-32 ${visual.bg.replace('/10', '/30')} rounded-full blur-[60px] animate-pulse`}></div>
                    <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${visual.bg.replace('/10', '/30')} rounded-full blur-[60px] animate-pulse delay-700`}></div>

                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">

                        {/* ICON */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className={`w-20 h-20 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center mb-6 shadow-inner`}
                        >
                            {/* Render icon based on type */}
                            {visual.id === 'deep-analysis' ? (
                                visual.icon({})
                            ) : (
                                // For Lucide icons, we render them as components
                                React.createElement(visual.icon as any, { size: 40, className: visual.color })
                            )}
                        </motion.div>

                        {/* Title */}
                        <motion.h3
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl font-bold text-white mb-2"
                        >
                            {visual.title}
                        </motion.h3>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "40%" }}
                            className={`h-1 ${visual.bg.replace('/10', '')} rounded-full mb-6`}
                        />

                        {/* Features List */}
                        <div className="space-y-3 w-full max-w-[200px] flex flex-col items-center">
                            {visual.features.map((feature, i) => (
                                <motion.div
                                    key={feature}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 + (i * 0.15) }}
                                    className="flex items-center gap-3 text-sm text-zinc-300 w-full"
                                >
                                    <CheckCircle2 size={14} className={`shrink-0 ${visual.color}`} />
                                    <span className="text-left">{feature}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Scanning Bar animation */}
                    <motion.div
                        initial={{ top: "0%" }}
                        animate={{ top: "100%" }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className={`absolute left-0 right-0 h-[2px] ${visual.bg.replace('/10', '')} shadow-[0_0_20px_2px_currentColor] z-20 opacity-50`}
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default GenerationVisuals;
