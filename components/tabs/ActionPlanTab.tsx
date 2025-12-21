
import React, { useState, useEffect } from 'react';
import { ActionPlanData, ActionPlanPhase, ActionPlanTask } from '../../types';
import { generateActionPlan } from '../../services/aiService';
import {
    Calendar, Clock, CheckCircle2, Circle, ChevronDown, ChevronRight,
    RefreshCw, Loader2, Target, Code2, Megaphone, Palette, TestTube, Rocket,
    TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    projectIdea: string;
    existingData?: ActionPlanData;
    onUpdate: (data: ActionPlanData) => void;
}

const PHASE_COLORS = [
    { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-500', icon: Target },
    { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', icon: Code2 },
    { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500', icon: TestTube },
    { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', icon: Rocket },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'Research': <Target size={12} />,
    'Development': <Code2 size={12} />,
    'Marketing': <Megaphone size={12} />,
    'Design': <Palette size={12} />,
    'Testing': <TestTube size={12} />,
    'Launch': <Rocket size={12} />,
};

const CATEGORY_COLORS: Record<string, string> = {
    'Research': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    'Development': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Marketing': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'Design': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Testing': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Launch': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const ActionPlanTab: React.FC<Props> = ({ projectIdea, existingData, onUpdate }) => {
    const [data, setData] = useState<ActionPlanData | null>(existingData || null);
    const [loading, setLoading] = useState(!existingData);
    const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
    const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!existingData && projectIdea) {
            handleGenerate();
        } else if (existingData) {
            // Expand first phase by default
            if (existingData.phases.length > 0) {
                setExpandedPhases(new Set([existingData.phases[0].id]));
            }
        }
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const result = await generateActionPlan(projectIdea);
            setData(result);
            onUpdate(result);
            // Expand first phase by default
            if (result.phases.length > 0) {
                setExpandedPhases(new Set([result.phases[0].id]));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const togglePhase = (phaseId: string) => {
        setExpandedPhases(prev => {
            const next = new Set(prev);
            if (next.has(phaseId)) {
                next.delete(phaseId);
            } else {
                next.add(phaseId);
            }
            return next;
        });
    };

    const toggleTask = (taskKey: string) => {
        setCompletedTasks(prev => {
            const next = new Set(prev);
            if (next.has(taskKey)) {
                next.delete(taskKey);
            } else {
                next.add(taskKey);
            }
            return next;
        });
    };

    const getCompletedCount = () => completedTasks.size;
    const getTotalTasks = () => data?.totalTasks || 0;
    const getProgress = () => getTotalTasks() > 0 ? (getCompletedCount() / getTotalTasks()) * 100 : 0;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500 animate-fade-in">
                <Loader2 size={32} className="animate-spin mb-4 text-violet-500" />
                <p className="text-sm font-medium">Generating Your 30-Day Action Plan...</p>
                <p className="text-xs opacity-50 mt-2">Creating daily tasks tailored to your idea.</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500">
                <p className="text-sm">No action plan available.</p>
                <button onClick={handleGenerate} className="mt-4 px-4 py-2 bg-violet-500 text-white rounded-lg text-sm font-medium hover:bg-violet-600 transition-colors">
                    Generate Plan
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 px-4 animate-fade-in">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
                            <Calendar size={20} className="text-violet-500" />
                        </div>
                        30-Day Action Plan
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1">Your roadmap from idea to first customers</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <TrendingUp size={16} className="text-emerald-500" />
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {getCompletedCount()}/{getTotalTasks()} tasks
                        </span>
                    </div>
                    <button
                        onClick={handleGenerate}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-violet-500 hover:border-violet-500/30 transition-all"
                    >
                        <RefreshCw size={14} />
                        Regenerate
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8 p-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Overall Progress</span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{Math.round(getProgress())}%</span>
                </div>
                <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgress()}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>
                <div className="flex justify-between mt-3 text-[10px] text-zinc-500">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                </div>
            </div>

            {/* Time Estimate Card */}
            <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.phases.map((phase, idx) => {
                    const color = PHASE_COLORS[idx % PHASE_COLORS.length];
                    const Icon = color.icon;
                    return (
                        <div
                            key={phase.id}
                            className={`p-4 rounded-xl border ${color.bg} ${color.border} transition-all hover:scale-[1.02]`}
                        >
                            <Icon size={16} className={color.text} />
                            <div className="mt-2 text-xs font-medium text-zinc-500">Days {phase.startDay}-{phase.endDay}</div>
                            <div className="text-sm font-bold text-zinc-900 dark:text-white truncate">{phase.name}</div>
                        </div>
                    );
                })}
            </div>

            {/* Phases */}
            <div className="space-y-4">
                {data.phases.map((phase, phaseIdx) => {
                    const color = PHASE_COLORS[phaseIdx % PHASE_COLORS.length];
                    const Icon = color.icon;
                    const isExpanded = expandedPhases.has(phase.id);
                    const phaseCompletedCount = phase.tasks.filter(t => completedTasks.has(`${phase.id}-${t.day}-${t.title}`)).length;

                    return (
                        <div
                            key={phase.id}
                            className={`bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all ${isExpanded ? 'ring-1 ring-violet-500/20' : ''}`}
                        >
                            {/* Phase Header */}
                            <button
                                onClick={() => togglePhase(phase.id)}
                                className="w-full p-5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${color.bg} ${color.border}`}>
                                        <Icon size={20} className={color.text} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs text-zinc-500 font-medium">Days {phase.startDay}-{phase.endDay}</div>
                                        <div className="text-base font-bold text-zinc-900 dark:text-white">{phase.name}</div>
                                        <div className="text-xs text-zinc-500 mt-0.5">{phase.description}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-xs text-zinc-500">{phaseCompletedCount}/{phase.tasks.length} tasks</div>
                                    </div>
                                    {isExpanded ? <ChevronDown size={20} className="text-zinc-400" /> : <ChevronRight size={20} className="text-zinc-400" />}
                                </div>
                            </button>

                            {/* Tasks */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="border-t border-zinc-200 dark:border-zinc-800"
                                    >
                                        <div className="p-4 space-y-2">
                                            {phase.tasks.map((task, taskIdx) => {
                                                const taskKey = `${phase.id}-${task.day}-${task.title}`;
                                                const isCompleted = completedTasks.has(taskKey);
                                                const categoryColor = CATEGORY_COLORS[task.category] || CATEGORY_COLORS['Development'];

                                                return (
                                                    <motion.div
                                                        key={taskIdx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: taskIdx * 0.05 }}
                                                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${isCompleted
                                                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                                                : 'bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                                            }`}
                                                    >
                                                        <button
                                                            onClick={() => toggleTask(taskKey)}
                                                            className="mt-0.5 shrink-0"
                                                        >
                                                            {isCompleted ? (
                                                                <CheckCircle2 size={20} className="text-emerald-500" />
                                                            ) : (
                                                                <Circle size={20} className="text-zinc-400 hover:text-violet-500 transition-colors" />
                                                            )}
                                                        </button>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                <span className="text-xs font-bold text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                                                                    Day {task.day}
                                                                </span>
                                                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded border flex items-center gap-1 ${categoryColor}`}>
                                                                    {CATEGORY_ICONS[task.category]}
                                                                    {task.category}
                                                                </span>
                                                            </div>
                                                            <h4 className={`text-sm font-semibold mb-1 ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-900 dark:text-white'}`}>
                                                                {task.title}
                                                            </h4>
                                                            <p className="text-xs text-zinc-500 leading-relaxed">{task.description}</p>
                                                        </div>

                                                        <div className="shrink-0 flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                                                            <Clock size={12} />
                                                            {task.estimatedTime}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Footer Stats */}
            <div className="mt-8 p-6 bg-gradient-to-r from-violet-500/5 to-emerald-500/5 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Estimated Total Time</div>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">{data.estimatedTotalHours} hours</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Tasks</div>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">{data.totalTasks}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionPlanTab;
