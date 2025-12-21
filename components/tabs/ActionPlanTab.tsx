
import React, { useState, useEffect } from 'react';
import { ActionPlanData, ActionPlanTask } from '../../types';
import { generateActionPlan } from '../../services/aiService';
import {
    Calendar, Clock, CheckCircle2, Circle, ChevronDown, ChevronRight,
    RefreshCw, Loader2, Target, Code2, Megaphone, Palette, TestTube, Rocket,
    Zap, Timer, Sparkles, BarChart3, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    projectIdea: string;
    existingData?: ActionPlanData;
    onUpdate: (data: ActionPlanData) => void;
}

const PHASE_CONFIG = [
    { id: 'research', accent: 'violet', icon: Target, gradient: 'from-violet-500/20 to-fuchsia-500/20', text: 'text-violet-500' },
    { id: 'development', accent: 'blue', icon: Code2, gradient: 'from-blue-500/20 to-cyan-500/20', text: 'text-blue-500' },
    { id: 'testing', accent: 'amber', icon: TestTube, gradient: 'from-amber-500/20 to-orange-500/20', text: 'text-amber-500' },
    { id: 'launch', accent: 'emerald', icon: Rocket, gradient: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-500' },
];

const CATEGORY_STYLES: Record<string, { icon: React.FC<any>, color: string, bg: string }> = {
    'Research': { icon: Target, color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20' },
    'Development': { icon: Code2, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
    'Marketing': { icon: Megaphone, color: 'text-pink-400', bg: 'bg-pink-400/10 border-pink-400/20' },
    'Design': { icon: Palette, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
    'Testing': { icon: TestTube, color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20' },
    'Launch': { icon: Rocket, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
};

const ActionPlanTab: React.FC<Props> = ({ projectIdea, existingData, onUpdate }) => {
    const [data, setData] = useState<ActionPlanData | null>(existingData || null);
    const [loading, setLoading] = useState(!existingData);
    const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
    const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!existingData && projectIdea) {
            handleGenerate();
        } else if (existingData && existingData.phases.length > 0) {
            setExpandedPhases(new Set([existingData.phases[0].id]));
        }
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const result = await generateActionPlan(projectIdea);
            setData(result);
            onUpdate(result);
            if (result.phases.length > 0) setExpandedPhases(new Set([result.phases[0].id]));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const togglePhase = (phaseId: string) => {
        setExpandedPhases(prev => {
            const next = new Set(prev);
            next.has(phaseId) ? next.delete(phaseId) : next.add(phaseId);
            return next;
        });
    };

    const toggleTask = (taskKey: string) => {
        setCompletedTasks(prev => {
            const next = new Set(prev);
            next.has(taskKey) ? next.delete(taskKey) : next.add(taskKey);
            return next;
        });
    };

    const getCompletedCount = () => completedTasks.size;
    const getTotalTasks = () => data?.totalTasks || 0;
    const getProgress = () => getTotalTasks() > 0 ? (getCompletedCount() / getTotalTasks()) * 100 : 0;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] w-full bg-zinc-50 dark:bg-black/20 backdrop-blur-sm rounded-3xl animate-fade-in border border-zinc-200 dark:border-white/5">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
                    <Loader2 size={40} className="relative z-10 animate-spin text-zinc-900 dark:text-white" />
                </div>
                <h3 className="text-xl font-medium text-zinc-900 dark:text-white mb-2">Architecting Your Success</h3>
                <p className="text-zinc-500 dark:text-zinc-400">Drafting a high-impact 30-day roadmap...</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="relative min-h-screen bg-transparent w-full pb-20">
            {/* Full Width Transparent Glass Header */}
            <div className={`sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-white/10 bg-white/20 dark:bg-black/40 backdrop-blur-2xl transition-all duration-300 ${scrolled ? 'shadow-md shadow-black/5' : ''}`}>
                <div className="px-6 py-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-emerald-500/10 border border-violet-500/20 shadow-sm">
                                <Sparkles size={18} className="text-violet-500" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight uppercase">30-Day Action Roadmap</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                        {Math.round(getProgress())}% complete
                                    </span>
                                    <span className="text-zinc-300 dark:text-zinc-800">•</span>
                                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-500">
                                        {getCompletedCount()} of {getTotalTasks()} milestones
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/5 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
                                <Timer size={14} className="text-zinc-500" />
                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{data.estimatedTotalHours}h</span>
                            </div>
                            <button
                                onClick={handleGenerate}
                                className="p-2 rounded-xl border border-zinc-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/5 transition-all active:scale-95"
                                title="Regenerate Plan"
                            >
                                <RefreshCw size={16} className="text-zinc-500" />
                            </button>
                        </div>
                    </div>

                    <div className="w-full flex items-center gap-4 px-1">
                        <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-300/30 dark:border-white/5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${getProgress()}%` }}
                                transition={{ duration: 0.8, ease: "circOut" }}
                            />
                        </div>
                        <span className="text-xs font-black text-zinc-900 dark:text-white tabular-nums min-w-[32px]">
                            {Math.round(getProgress())}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 pt-8">

                {/* Intro & Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
                >
                    {data.phases.map((phase, idx) => {
                        const style = PHASE_CONFIG[idx % PHASE_CONFIG.length];
                        const Icon = style.icon;
                        const completed = phase.tasks.filter(t => completedTasks.has(`${phase.id}-${t.day}-${t.title}`)).length;
                        const total = phase.tasks.length;
                        const pct = (completed / total) * 100;
                        const isActive = pct < 100 && pct > 0;

                        return (
                            <div
                                key={phase.id}
                                onClick={() => togglePhase(phase.id)}
                                className={`
                                    relative overflow-hidden group p-5 rounded-2xl border transition-all duration-300 cursor-pointer
                                    ${isActive
                                        ? 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-300 dark:border-white/10 shadow-lg'
                                        : 'bg-white dark:bg-black/40 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-zinc-700'
                                    }
                                `}
                            >
                                {/* Subtle Gradient BG */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon size={18} className={`${style.text}`} />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-0.5">Phase {idx + 1}</div>
                                            <div className="text-xs font-mono text-zinc-500">Days {phase.startDay}-{phase.endDay}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-zinc-900 dark:text-white text-sm mb-3">{phase.name}</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    className={`h-full bg-gradient-to-r ${style.gradient.replace('/20', '')}`}
                                                />
                                            </div>
                                            <span className="text-xs font-mono text-zinc-500">{completed}/{total}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>

                {/* Timeline Feed */}
                <div className="relative space-y-12 pl-4 md:pl-0">
                    {/* Vertical Line for Desktop */}
                    <div className="hidden md:block absolute left-[21px] top-6 bottom-0 w-px bg-gradient-to-b from-zinc-200 via-zinc-200 to-transparent dark:from-zinc-800 dark:via-zinc-800" />

                    {data.phases.map((phase, idx) => {
                        const style = PHASE_CONFIG[idx % PHASE_CONFIG.length];
                        const Icon = style.icon;
                        const isExpanded = expandedPhases.has(phase.id);

                        return (
                            <motion.div
                                key={phase.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative md:pl-16"
                            >
                                {/* Timeline Node (Desktop) */}
                                <div className={`hidden md:flex absolute left-0 top-0 w-11 h-11 items-center justify-center rounded-full border-4 border-white dark:border-black bg-zinc-100 dark:bg-zinc-900 z-10 ${style.text}`}>
                                    <Icon size={18} />
                                </div>

                                {/* Phase Card */}
                                <div
                                    className={`
                                        rounded-3xl border transition-all duration-300 overflow-hidden
                                        ${isExpanded
                                            ? 'bg-white dark:bg-black/40 border-zinc-200 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5'
                                            : 'bg-zinc-50/50 dark:bg-white/5 border-transparent hover:bg-white dark:hover:bg-white/10'
                                        }
                                    `}
                                >
                                    <div
                                        onClick={() => togglePhase(phase.id)}
                                        className="p-6 cursor-pointer flex items-center justify-between group"
                                    >
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{phase.name}</h3>
                                                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-white/10 text-zinc-500">
                                                    Days {phase.startDay}-{phase.endDay}
                                                </span>
                                            </div>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">{phase.description}</p>
                                        </div>
                                        <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-zinc-100 dark:bg-white/10' : 'group-hover:bg-zinc-100 dark:group-hover:bg-white/10'}`}>
                                            <ChevronDown size={20} className="text-zinc-400" />
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {phase.tasks.map((task, tIdx) => {
                                                        const taskKey = `${phase.id}-${task.day}-${task.title}`;
                                                        const isCompleted = completedTasks.has(taskKey);
                                                        const catStyle = CATEGORY_STYLES[task.category] || CATEGORY_STYLES['Development'];
                                                        const CatIcon = catStyle.icon;

                                                        return (
                                                            <div
                                                                key={tIdx}
                                                                onClick={() => toggleTask(taskKey)}
                                                                className={`
                                                                    group relative flex flex-col justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-200
                                                                    ${isCompleted
                                                                        ? 'bg-zinc-50/50 dark:bg-black/20 border-zinc-200/50 dark:border-white/5 grayscale opacity-70'
                                                                        : 'bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-black/50 hover:-translate-y-1'
                                                                    }
                                                                `}
                                                            >
                                                                <div>
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${catStyle.bg} ${catStyle.color}`}>
                                                                            <CatIcon size={10} />
                                                                            {task.category}
                                                                        </div>
                                                                        <span className="text-[10px] font-mono text-zinc-400">DAY {task.day}</span>
                                                                    </div>

                                                                    <h4 className={`text-sm font-bold mb-2 ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-900 dark:text-white'}`}>
                                                                        {task.title}
                                                                    </h4>
                                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                                                                        {task.description}
                                                                    </p>
                                                                </div>

                                                                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                                                                        <Timer size={12} />
                                                                        {task.estimatedTime}
                                                                    </div>
                                                                    <div className={`
                                                                        w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                                                                        ${isCompleted
                                                                            ? 'bg-emerald-500 text-white scale-100'
                                                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 group-hover:bg-zinc-900 dark:group-hover:bg-white dark:group-hover:text-black'
                                                                        }
                                                                    `}>
                                                                        <CheckCircle2 size={14} className={isCompleted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ActionPlanTab;
