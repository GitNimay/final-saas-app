
import React, { useState, useEffect } from 'react';
import { ValidationData } from '../../types';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, Cell, Legend
} from 'recharts';
import {
    TrendingUp, Zap, Target, Globe, Activity, Users, DollarSign,
    Sparkles, ChevronRight, ArrowUp, ArrowDown, Eye, RefreshCw, Calendar,
    ExternalLink, Crown, AlertTriangle, CheckCircle, XCircle, Shield,
    Lightbulb, TrendingDown
} from 'lucide-react';

interface Props {
    data: ValidationData;
    isDark?: boolean;
}

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/95 backdrop-blur-xl border border-zinc-800 rounded-xl px-4 py-3 shadow-2xl">
                <p className="text-xs text-zinc-500 mb-1">{label}</p>
                <p className="text-lg font-bold text-white">
                    ${(payload[0].value / 1000000).toFixed(2)}M
                </p>
            </div>
        );
    }
    return null;
};

const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/95 backdrop-blur-xl border border-zinc-800 rounded-xl px-4 py-3 shadow-2xl">
                <p className="text-xs text-zinc-500 mb-2">{label}</p>
                {payload.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                        <span className="text-xs text-zinc-400">{p.name}:</span>
                        <span className="text-sm font-medium text-white">${(p.value / 1000000).toFixed(2)}M</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const ValidationTab: React.FC<Props> = ({ data, isDark = true }) => {
    const [mounted, setMounted] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<'Days' | 'Weeks' | 'Months'>('Months');

    useEffect(() => {
        setMounted(true);
    }, []);

    // Safe data access & Fallbacks
    const score = data.viabilityScore || 0;
    const revenueData = data.revenueData || [];
    const competitors = data.competitors || [];
    const market = data.marketStats || { tam: 0, sam: 0, som: 0 };
    const swot = data.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
    const radarData = data.radarData || [];

    // Calculate metrics
    const startRev = revenueData[0]?.revenue || 0;
    const endRev = revenueData[revenueData.length - 1]?.revenue || 0;
    const growth = startRev > 0 ? ((endRev - startRev) / startRev * 100).toFixed(0) : 0;
    const captureRate = market.tam > 0 ? ((market.som / market.tam) * 100).toFixed(1) : 0;

    // Calculate break-even year
    const breakEvenYear = revenueData.find(d => d.revenue > d.expenses);

    // Calculate total expenses and revenue
    const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
    const totalExpenses = revenueData.reduce((sum, d) => sum + d.expenses, 0);
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1) : 0;

    // Risk assessment based on score and SWOT
    const riskScore = Math.max(0, 100 - score - (swot.threats.length * 5) + (swot.strengths.length * 3));
    const riskLevel = riskScore >= 70 ? 'Low' : riskScore >= 40 ? 'Medium' : 'High';
    const riskColor = riskScore >= 70 ? '#10B981' : riskScore >= 40 ? '#F59E0B' : '#EF4444';

    // Generate sparkline data
    const sparklineData = revenueData.map((d, i) => ({ value: d.revenue, idx: i }));

    // Generate competitor URL from name if not provided
    const getCompetitorUrl = (competitor: { name: string; url?: string }) => {
        if (competitor.url) return competitor.url;
        const searchQuery = encodeURIComponent(competitor.name);
        return `https://www.google.com/search?q=${searchQuery}`;
    };

    if (!mounted) return <div className="w-full h-full bg-background"></div>;

    return (
        <div className="w-full max-w-[1800px] mx-auto pb-20 font-sans text-foreground px-0 sm:px-2 lg:px-4">

            {/* ========== HEADER ========== */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 border-b border-zinc-900 pb-6">
                <div className="flex items-center gap-4 mb-4 lg:mb-0">
                    <div className="w-12 h-12 bg-white/5 border border-zinc-800 rounded-xl flex items-center justify-center">
                            <span className="font-bold text-xl text-foreground">{data.projectTitle?.charAt(0) || 'V'}</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-[0.15em] font-medium">Live Analysis</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
                            {data.projectTitle}
                        </h1>
                    </div>
                </div>
            </div>

            {/* ========== MAIN GRID ========== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">

                {/* ===== VIABILITY SCORE CARD ===== */}
                <div className="col-span-1 sm:col-span-1 lg:col-span-3 bg-black border border-zinc-900 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium">Viability</span>
                            <Zap size={14} className="text-zinc-700" />
                        </div>

                        <div className="flex items-baseline gap-0.5 mb-3">
                            <span className="text-5xl font-semibold tracking-tighter text-white tabular-nums">{score}</span>
                            <span className="text-xl text-zinc-700">%</span>
                        </div>

                        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mb-3">
                            <div
                                className="h-full bg-white/80 rounded-full transition-all duration-1000"
                                style={{ width: `${score}%` }}
                            ></div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                            {score >= 70 ? <ArrowUp size={10} className="text-emerald-500" /> : <ArrowDown size={10} className="text-zinc-500" />}
                            <span>{score >= 70 ? 'High' : score >= 50 ? 'Medium' : 'Low'} confidence</span>
                        </div>
                    </div>
                </div>

                {/* ===== REVENUE PROJECTION CARD ===== */}
                <div className="col-span-1 sm:col-span-1 lg:col-span-3 bg-black border border-zinc-900 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium">Projected ARR</span>
                            <DollarSign size={14} className="text-zinc-700" />
                        </div>

                        <div className="flex items-baseline gap-0.5 mb-1">
                            <span className="text-4xl font-semibold tracking-tighter text-white tabular-nums">
                                ${(endRev / 1000000).toFixed(1)}
                            </span>
                            <span className="text-lg text-zinc-700">M</span>
                        </div>

                        <div className="text-xs text-zinc-600 mb-3">Year 5</div>

                        <div className="h-10 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sparklineData}>
                                    <defs>
                                        <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#fff" stopOpacity={0.15} />
                                            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="value" stroke="#fff" strokeWidth={1.5} fill="url(#sparkGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ===== GROWTH RATE CARD ===== */}
                <div className="col-span-1 sm:col-span-1 lg:col-span-3 bg-black border border-zinc-900 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium">CAGR Growth</span>
                            <TrendingUp size={14} className="text-zinc-700" />
                        </div>

                        <div className="flex items-baseline gap-0.5 mb-3">
                            <span className="text-lg text-emerald-500">+</span>
                            <span className="text-5xl font-semibold tracking-tighter text-white tabular-nums">{growth}</span>
                            <span className="text-xl text-zinc-700">%</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${Math.min(Number(growth), 100)}%` }}></div>
                            </div>
                            <span className="text-[9px] text-emerald-500/80 font-mono uppercase">High</span>
                        </div>
                    </div>
                </div>

                {/* ===== RISK ASSESSMENT CARD (NEW) ===== */}
                <div className="col-span-1 sm:col-span-1 lg:col-span-3 bg-black border border-zinc-900 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium">Risk Level</span>
                            <Shield size={14} className="text-zinc-700" />
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                            {/* Risk Gauge */}
                            <div className="relative w-16 h-16">
                                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                                    <circle cx="32" cy="32" r="28" fill="none" stroke="#18181b" strokeWidth="6" />
                                    <circle
                                        cx="32" cy="32" r="28" fill="none"
                                        stroke={riskColor}
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        strokeDasharray={`${riskScore * 1.76} 176`}
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-semibold text-white">{Math.round(riskScore)}</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-semibold text-white">{riskLevel}</div>
                                <div className="text-[10px] text-zinc-600">Risk Assessment</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                            <AlertTriangle size={10} style={{ color: riskColor }} />
                            <span>{swot.threats.length} threats identified</span>
                        </div>
                    </div>
                </div>

                {/* ===== MAIN STATISTICS CHART ===== */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-8 bg-black border border-zinc-900 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-medium text-white">Financial Projection</h3>
                                <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                        Revenue
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full border border-dashed border-zinc-500"></div>
                                        Expenses
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-0.5 p-0.5 bg-zinc-950 rounded-lg border border-zinc-900">
                                {(['Days', 'Weeks', 'Months'] as const).map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setSelectedPeriod(period)}
                                        className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${selectedPeriod === period ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                                            }`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#fff" stopOpacity={0.15} />
                                            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 10 }} tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="revenue" stroke="#fff" strokeWidth={2} fill="url(#revenueGradient)" dot={false} activeDot={{ r: 4, fill: '#fff', stroke: '#000', strokeWidth: 2 }} />
                                    <Area type="monotone" dataKey="expenses" stroke="#52525b" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ===== RADAR CHART (NEW) ===== */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-black border border-zinc-900 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-white">Multi-Factor Analysis</h3>
                            <Activity size={14} className="text-zinc-600" />
                        </div>

                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#27272a" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 9 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Score"
                                        dataKey="A"
                                        stroke="#fff"
                                        fill="#fff"
                                        fillOpacity={0.15}
                                        strokeWidth={2}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ===== REVENUE VS EXPENSES BAR CHART (NEW) ===== */}
                <div className="col-span-1 sm:col-span-1 lg:col-span-4 bg-black border border-zinc-900 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-white">Revenue vs Expenses</h3>
                            <DollarSign size={14} className="text-zinc-600" />
                        </div>

                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 9 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 9 }} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                                    <Tooltip content={<BarTooltip />} />
                                    <Bar dataKey="revenue" fill="#fff" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expenses" fill="#52525b" fillOpacity={0.5} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Break-even indicator */}
                        {breakEvenYear && (
                            <div className="mt-3 flex items-center gap-2 text-[10px] text-emerald-500">
                                <CheckCircle size={12} />
                                <span>Break-even: {breakEvenYear.year}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== PROFIT METRICS (NEW) ===== */}
                <div className="col-span-1 sm:col-span-1 lg:col-span-4 bg-black border border-zinc-900 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-white">Profit Metrics</h3>
                            <TrendingUp size={14} className="text-zinc-600" />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[10px] uppercase tracking-wider text-zinc-600">Total Revenue</span>
                                    <span className="text-sm font-medium text-white">${(totalRevenue / 1000000).toFixed(1)}M</span>
                                </div>
                                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-white/60 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[10px] uppercase tracking-wider text-zinc-600">Total Expenses</span>
                                    <span className="text-sm font-medium text-white">${(totalExpenses / 1000000).toFixed(1)}M</span>
                                </div>
                                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-zinc-600/60 rounded-full" style={{ width: `${(totalExpenses / totalRevenue) * 100}%` }}></div>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-zinc-900">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] uppercase tracking-wider text-zinc-600">Profit Margin</span>
                                    <span className={`text-lg font-semibold ${Number(profitMargin) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {profitMargin}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== SWOT GRID (NEW) ===== */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-6 bg-black border border-zinc-900 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-white">SWOT Analysis</h3>
                            <Target size={14} className="text-zinc-600" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {/* Strengths */}
                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle size={12} className="text-emerald-500" />
                                    <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-medium">Strengths</span>
                                </div>
                                <ul className="space-y-1.5">
                                    {swot.strengths.slice(0, 2).map((s, i) => (
                                        <li key={i} className="text-[11px] text-zinc-400 leading-relaxed flex items-start gap-1.5">
                                            <span className="text-emerald-500 mt-1">•</span>
                                            {s.slice(0, 50)}...
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Weaknesses */}
                            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <XCircle size={12} className="text-red-500" />
                                    <span className="text-[10px] uppercase tracking-wider text-red-500 font-medium">Weaknesses</span>
                                </div>
                                <ul className="space-y-1.5">
                                    {swot.weaknesses.slice(0, 2).map((w, i) => (
                                        <li key={i} className="text-[11px] text-zinc-400 leading-relaxed flex items-start gap-1.5">
                                            <span className="text-red-500 mt-1">•</span>
                                            {w.slice(0, 50)}...
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Opportunities */}
                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb size={12} className="text-blue-500" />
                                    <span className="text-[10px] uppercase tracking-wider text-blue-500 font-medium">Opportunities</span>
                                </div>
                                <ul className="space-y-1.5">
                                    {swot.opportunities.slice(0, 2).map((o, i) => (
                                        <li key={i} className="text-[11px] text-zinc-400 leading-relaxed flex items-start gap-1.5">
                                            <span className="text-blue-500 mt-1">•</span>
                                            {o.slice(0, 50)}...
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Threats */}
                            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle size={12} className="text-yellow-500" />
                                    <span className="text-[10px] uppercase tracking-wider text-yellow-500 font-medium">Threats</span>
                                </div>
                                <ul className="space-y-1.5">
                                    {swot.threats.slice(0, 2).map((t, i) => (
                                        <li key={i} className="text-[11px] text-zinc-400 leading-relaxed flex items-start gap-1.5">
                                            <span className="text-yellow-500 mt-1">•</span>
                                            {t.slice(0, 50)}...
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== COMPETITORS CARD ===== */}
                <div className="col-span-1 sm:col-span-1 lg:col-span-3 bg-black border border-zinc-900 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-white">Competitors</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-semibold text-white">{competitors.length}</span>
                                <Crown size={12} className="text-zinc-600" />
                            </div>
                        </div>

                        <div className="flex items-center mb-4">
                            <div className="flex -space-x-2">
                                {competitors.slice(0, 4).map((c, i) => (
                                    <a
                                        key={i}
                                        href={getCompetitorUrl(c)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-medium text-white hover:bg-zinc-800 hover:scale-110 hover:z-10 transition-all cursor-pointer"
                                        style={{ zIndex: 4 - i }}
                                        title={`Visit ${c.name}`}
                                    >
                                        {c.name.charAt(0)}
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            {competitors.slice(0, 2).map((c, i) => (
                                <a
                                    key={i}
                                    href={getCompetitorUrl(c)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-900 hover:border-zinc-700 transition-all group/item cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-medium text-white">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium text-white flex items-center gap-1">
                                                {c.name}
                                                <ExternalLink size={8} className="text-zinc-600" />
                                            </div>
                                            <div className="text-[9px] text-zinc-600">{c.price}</div>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ===== MARKET SIZE CARD ===== */}
                <div className="col-span-1 sm:col-span-1 lg:col-span-3 bg-black border border-zinc-900 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-white">Market Size</h3>
                            <Users size={14} className="text-zinc-600" />
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] uppercase tracking-wider text-zinc-600">TAM</span>
                                    <span className="text-xs font-medium text-white">${market.tam}M</span>
                                </div>
                                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-white/40 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] uppercase tracking-wider text-zinc-600">SAM</span>
                                    <span className="text-xs font-medium text-white">${market.sam}M</span>
                                </div>
                                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-white/30 rounded-full" style={{ width: `${(market.sam / market.tam) * 100}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] uppercase tracking-wider text-zinc-600">SOM</span>
                                    <span className="text-xs font-medium text-white">${market.som}M</span>
                                </div>
                                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-white/20 rounded-full" style={{ width: `${(market.som / market.tam) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-zinc-900">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] uppercase tracking-wider text-zinc-600">Capture Rate</span>
                                <span className="text-sm font-medium text-white">{captureRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== SUMMARY BANNER ===== */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-12 bg-black border border-zinc-900 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                                <Sparkles size={18} className="text-zinc-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-medium text-white mb-0.5">AI Analysis Complete</h3>
                                <p className="text-xs text-zinc-600 max-w-xl">{data.summary?.slice(0, 120)}...</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-4 text-center">
                                <div>
                                    <div className="text-xl font-semibold text-white">{score}%</div>
                                    <div className="text-[9px] text-zinc-600 uppercase">Viability</div>
                                </div>
                                <div className="w-px h-8 bg-zinc-800"></div>
                                <div>
                                    <div className="text-xl font-semibold text-emerald-500">+{growth}%</div>
                                    <div className="text-[9px] text-zinc-600 uppercase">Growth</div>
                                </div>
                                <div className="w-px h-8 bg-zinc-800"></div>
                                <div>
                                    <div className="text-xl font-semibold" style={{ color: riskColor }}>{riskLevel}</div>
                                    <div className="text-[9px] text-zinc-600 uppercase">Risk</div>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-medium rounded-lg transition-all flex items-center gap-2">
                                <Eye size={14} />
                                Full Report
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ValidationTab;
