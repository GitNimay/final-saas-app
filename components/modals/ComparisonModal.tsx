
import React, { useState, useMemo } from 'react';
import { Project } from '../../types';
import { X, CheckCircle2, Circle, BarChart2, Trophy, TrendingUp, Clock, DollarSign, Target, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    projects: Project[];
}

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

const ComparisonModal: React.FC<Props> = ({ isOpen, onClose, projects }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const selectedProjects = useMemo(() => {
        return projects.filter(p => selectedIds.has(p.id));
    }, [projects, selectedIds]);

    const toggleProject = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else if (next.size < 4) { // Max 4 projects
                next.add(id);
            }
            return next;
        });
    };

    const getMetrics = (project: Project) => {
        const validation = project.data.validation;
        const deep = project.data.deepAnalysis;
        return {
            viabilityScore: validation?.viabilityScore || 0,
            tam: validation?.marketStats?.tam || 0,
            sam: validation?.marketStats?.sam || 0,
            som: validation?.marketStats?.som || 0,
            devTime: deep?.feasibility?.devTimeMonths || 0,
            difficulty: deep?.feasibility?.technicalDifficulty || 0,
            infraCost: deep?.feasibility?.infraCost || 0,
        };
    };

    const getBest = (key: keyof ReturnType<typeof getMetrics>, higherIsBetter: boolean = true) => {
        if (selectedProjects.length === 0) return null;
        let bestProject = selectedProjects[0];
        let bestValue = getMetrics(bestProject)[key];

        selectedProjects.forEach(p => {
            const value = getMetrics(p)[key];
            if (higherIsBetter ? value > bestValue : value < bestValue) {
                bestValue = value;
                bestProject = p;
            }
        });
        return bestProject.id;
    };

    const comparisonData = useMemo(() => {
        return selectedProjects.map((p, idx) => {
            const metrics = getMetrics(p);
            return {
                name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
                fullName: p.name,
                ...metrics,
                color: CHART_COLORS[idx % CHART_COLORS.length],
            };
        });
    }, [selectedProjects]);

    const radarData = useMemo(() => {
        const metrics = ['Viability', 'Market Size', 'Dev Speed', 'Cost Efficiency'];
        return metrics.map(metric => {
            const dataPoint: any = { metric };
            selectedProjects.forEach((p, idx) => {
                const m = getMetrics(p);
                switch (metric) {
                    case 'Viability':
                        dataPoint[p.name] = m.viabilityScore;
                        break;
                    case 'Market Size':
                        dataPoint[p.name] = Math.min(100, (m.tam / 100)); // Normalize
                        break;
                    case 'Dev Speed':
                        dataPoint[p.name] = Math.max(0, 100 - (m.devTime * 10)); // Lower is better, invert
                        break;
                    case 'Cost Efficiency':
                        dataPoint[p.name] = Math.max(0, 100 - (m.infraCost / 10)); // Lower is better, invert
                        break;
                }
            });
            return dataPoint;
        });
    }, [selectedProjects]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4 md:p-8 animate-fade-in">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-6xl h-[85vh] bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden isolate"
            >
                {/* Header */}
                <div className="h-[88px] shrink-0 p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-[#09090b] z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                            <BarChart2 size={20} className="text-indigo-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Compare Projects</h2>
                            <p className="text-xs text-zinc-500">Select 2-4 projects to compare side-by-side</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex overflow-hidden h-[calc(100%-88px)] bg-white dark:bg-[#09090b]">
                    {/* Project Selector Sidebar */}
                    <div className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 p-4 overflow-y-auto pointer-events-auto touch-manipulation">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Select Projects</div>
                        <div className="space-y-2">
                            {projects.map(p => {
                                const isSelected = selectedIds.has(p.id);
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => toggleProject(p.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isSelected
                                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                                            : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                                            }`}
                                    >
                                        {isSelected ? (
                                            <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
                                        ) : (
                                            <Circle size={16} className="text-zinc-400 shrink-0" />
                                        )}
                                        <div className="overflow-hidden">
                                            <div className="text-sm font-medium truncate">{p.name}</div>
                                            <div className="text-[10px] text-zinc-500 truncate">
                                                Score: {p.data.validation?.viabilityScore || 'N/A'}%
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Comparison Area */}
                    <div className="flex-1 p-6 overflow-y-auto pointer-events-auto touch-manipulation">
                        {selectedProjects.length < 2 ? (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                                <BarChart2 size={48} className="mb-4 opacity-30" />
                                <p className="text-sm">Select at least 2 projects to compare</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Comparison Table */}
                                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                                <th className="p-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Metric</th>
                                                {selectedProjects.map((p, idx) => (
                                                    <th key={p.id} className="p-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: CHART_COLORS[idx % CHART_COLORS.length] }}>
                                                        {p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { key: 'viabilityScore', label: 'Viability Score', icon: Target, format: (v: number) => `${v}%`, higher: true },
                                                { key: 'tam', label: 'TAM', icon: Users, format: (v: number) => `$${v}M`, higher: true },
                                                { key: 'sam', label: 'SAM', icon: Users, format: (v: number) => `$${v}M`, higher: true },
                                                { key: 'som', label: 'SOM', icon: Users, format: (v: number) => `$${v}M`, higher: true },
                                                { key: 'devTime', label: 'Dev Time', icon: Clock, format: (v: number) => `${v} mo`, higher: false },
                                                { key: 'difficulty', label: 'Difficulty', icon: TrendingUp, format: (v: number) => `${v}/100`, higher: false },
                                                { key: 'infraCost', label: 'Infra Cost', icon: DollarSign, format: (v: number) => `$${v}/mo`, higher: false },
                                            ].map(({ key, label, icon: Icon, format, higher }) => {
                                                const bestId = getBest(key as any, higher);
                                                return (
                                                    <tr key={key} className="border-b border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors">
                                                        <td className="p-4 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                            <Icon size={14} className="text-zinc-400" />
                                                            {label}
                                                        </td>
                                                        {selectedProjects.map((p, idx) => {
                                                            const value = getMetrics(p)[key as keyof ReturnType<typeof getMetrics>];
                                                            const isBest = p.id === bestId;
                                                            return (
                                                                <td key={p.id} className="p-4 text-center">
                                                                    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${isBest ? 'text-emerald-500' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                                                        {isBest && <Trophy size={12} className="text-amber-500" />}
                                                                        {format(value as number)}
                                                                    </span>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Charts Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Viability Bar Chart */}
                                    <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Target size={16} className="text-violet-500" />
                                            Viability Score Comparison
                                        </h3>
                                        <div className="h-[200px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={comparisonData} layout="vertical">
                                                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                                                    <YAxis dataKey="name" type="category" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                                                        labelStyle={{ color: '#fff' }}
                                                    />
                                                    <Bar dataKey="viabilityScore" radius={[0, 8, 8, 0]}>
                                                        {comparisonData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Radar Chart */}
                                    <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                                            <BarChart2 size={16} className="text-blue-500" />
                                            Multi-Factor Analysis
                                        </h3>
                                        <div className="h-[200px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart data={radarData}>
                                                    <PolarGrid stroke="#27272a" />
                                                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#71717a', fontSize: 10 }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                    {selectedProjects.map((p, idx) => (
                                                        <Radar
                                                            key={p.id}
                                                            name={p.name}
                                                            dataKey={p.name}
                                                            stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                                                            fill={CHART_COLORS[idx % CHART_COLORS.length]}
                                                            fillOpacity={0.2}
                                                            strokeWidth={2}
                                                        />
                                                    ))}
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="flex flex-wrap gap-4 justify-center">
                                    {selectedProjects.map((p, idx) => (
                                        <div key={p.id} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                                            {p.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ComparisonModal;
