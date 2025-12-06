
import React, { useState, useEffect } from 'react';
import { ValidationData } from '../../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, LineChart, Line 
} from 'recharts';
import { 
  TrendingUp, Zap, Shield, Crown, Target, Globe, AlertTriangle, Check, 
  ArrowUpRight, Activity, Users, DollarSign, PieChart as PieIcon, MoveRight
} from 'lucide-react';

interface Props {
  data: ValidationData;
  isDark?: boolean;
}

const ValidationTab: React.FC<Props> = ({ data, isDark = true }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe data access & Fallbacks
  const score = data.viabilityScore || 0;
  const revenueData = data.revenueData || [];
  const competitors = data.competitors || [];
  const market = data.marketStats || { tam: 0, sam: 0, som: 0 };
  const swot = data.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };

  // Calculate Growth & Totals
  const startRev = revenueData[0]?.revenue || 0;
  const endRev = revenueData[revenueData.length - 1]?.revenue || 0;
  const growth = startRev > 0 ? ((endRev - startRev) / startRev * 100).toFixed(0) : 0;
  
  // Market Capture Rate
  const captureRate = market.tam > 0 ? ((market.som / market.tam) * 100).toFixed(1) : 0;

  if (!mounted) return <div className="w-full h-full bg-transparent"></div>;

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-20 font-sans text-white animate-fade-in px-4">
      
      {/* HEADER VISUAL (Minimal) */}
      <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                {data.projectTitle.charAt(0)}
             </div>
             <div>
                 <h1 className="text-3xl font-bold tracking-tighter text-white leading-none">
                    {data.projectTitle}
                 </h1>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Validation Active</span>
                 </div>
             </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 border border-white/10 px-4 py-2 rounded-full">
              <Globe size={14} /> Global Analysis
          </div>
      </div>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 lg:gap-6 auto-rows-[minmax(180px,auto)]">

        {/* 1. VIABILITY SCORE (Yellow Block) */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4 row-span-2 bg-[#fef08a] text-black rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group transition-transform hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(254,240,138,0.3)]">
            <div>
                <div className="flex items-start gap-1">
                    <span className="text-2xl font-medium opacity-60">^</span>
                    <span className="text-9xl font-bold tracking-tighter leading-[0.8]">{score}</span>
                    <span className="text-4xl font-medium opacity-60 self-end mb-4">%</span>
                </div>
                <h3 className="text-xl font-medium mt-4 max-w-[200px] leading-tight">
                    Viability Confidence Score provided by AI
                </h3>
            </div>

            <div className="self-center my-4 relative">
                 <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-40 rounded-full animate-pulse"></div>
                 <Zap size={120} strokeWidth={0.5} className="relative z-10 text-black/80" />
            </div>

            <div className="flex justify-between items-center border-t border-black/10 pt-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">AI</div>
                    <span className="text-xs font-bold uppercase tracking-widest">LifeCare Model</span>
                </div>
                <span className="text-xs font-bold underline cursor-pointer">View Details</span>
            </div>
        </div>

        {/* 2. REVENUE (Orange Block) */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4 row-span-2 bg-[#ff5528] text-white rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group transition-transform hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(255,85,40,0.3)]">
             <div>
                <div className="text-8xl font-bold tracking-tighter leading-none mb-2">
                    ${(endRev / 1000000).toFixed(1)}<span className="text-4xl opacity-60">M</span>
                </div>
                <h3 className="text-xl font-medium opacity-90">
                    Projected Annual Recurring Revenue (Year 5)
                </h3>
             </div>

             <div className="space-y-6">
                 <div>
                     <div className="text-xs uppercase font-bold tracking-widest opacity-70 mb-1">Growth Rate</div>
                     <div className="text-2xl font-bold flex items-center gap-2">
                         {growth}% <ArrowUpRight className="text-white" />
                     </div>
                 </div>
                 
                 <div className="w-full bg-black/20 h-px"></div>

                 <div className="flex justify-between items-end">
                     <div className="text-xs font-bold uppercase tracking-widest opacity-80">United States</div>
                     <Globe size={24} strokeWidth={1.5} className="opacity-80" />
                 </div>
             </div>
        </div>

        {/* 3. COMPETITORS (Dark Block) */}
        <div className="col-span-1 md:col-span-3 lg:col-span-2 bg-[#18181b] border border-white/10 rounded-[2.5rem] p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex justify-between items-start">
                <div className="text-6xl font-bold text-white tracking-tighter">{competitors.length}</div>
                <Crown size={24} className="text-zinc-500" />
            </div>
            
            <div>
                <h3 className="text-sm font-bold text-zinc-400 leading-tight mb-4">
                    Major Competitors Identified
                </h3>
                <div className="flex -space-x-2">
                    {competitors.slice(0, 3).map((c, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-[#18181b] flex items-center justify-center text-[10px] font-bold text-zinc-400">
                            {c.name.charAt(0)}
                        </div>
                    ))}
                    {competitors.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-[#18181b] flex items-center justify-center text-[10px] font-bold text-zinc-400">
                            +{competitors.length - 3}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="mt-4 text-[10px] text-zinc-500 font-mono">
                ...
            </div>
        </div>

        {/* 4. MARKET STATS (Dark Block) */}
        <div className="col-span-1 md:col-span-3 lg:col-span-2 bg-[#18181b] border border-white/10 rounded-[2.5rem] p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex justify-between items-start">
                <div className="text-6xl font-bold text-white tracking-tighter">{market.tam}</div>
                <Users size={24} className="text-zinc-500" />
            </div>
            
            <div>
                <h3 className="text-sm font-bold text-zinc-400 leading-tight mb-2">
                    Total Addressable Market (Millions)
                </h3>
                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mb-2">
                    <div className="bg-zinc-500 h-full w-[30%]"></div>
                </div>
            </div>

            <div className="mt-4 text-[10px] text-zinc-500 font-mono">
                ...
            </div>
        </div>

        {/* 5. MARKET CAPTURE (Purple Block) */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4 bg-[#9f97f7] text-black rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden">
             <div className="flex justify-between items-start">
                 <div className="text-7xl font-bold tracking-tighter">{captureRate}<span className="text-4xl opacity-60">/100</span></div>
                 <div className="flex -space-x-1">
                     <div className="w-6 h-6 rounded-full border border-black bg-transparent"></div>
                     <div className="w-6 h-6 rounded-full border border-black bg-black"></div>
                 </div>
             </div>

             <div className="flex items-end justify-between">
                 <div>
                     <h3 className="text-xl font-medium leading-tight mb-1">Market Capture</h3>
                     <div className="text-xs font-bold uppercase tracking-widest opacity-60">Potential (SOM/TAM)</div>
                 </div>
                 <div className="text-2xl font-bold">2%</div>
             </div>
             
             {/* Decorative chemical/lab icon representation */}
             <div className="absolute bottom-4 right-4 opacity-20">
                 <Activity size={64} strokeWidth={1} />
             </div>
        </div>

        {/* 6. GROWTH (Olive Block) */}
        <div className="col-span-1 md:col-span-3 lg:col-span-3 bg-[#7d8205] text-white rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden">
             <div>
                 <div className="text-xs text-[#dbeafe] uppercase font-bold tracking-widest mb-4">User Growth</div>
                 <div className="text-7xl font-bold tracking-tighter flex items-start">
                     <span className="text-4xl mt-1 mr-1">^</span>35%
                 </div>
             </div>
             
             <div className="flex justify-between items-end border-t border-white/20 pt-4 mt-4">
                 <span className="text-[10px] uppercase tracking-widest opacity-70">Metric</span>
                 <span className="text-[10px] uppercase tracking-widest opacity-70">(Monthly)</span>
             </div>
        </div>

        {/* 7. CHART (Light Block) */}
        <div className="col-span-1 md:col-span-6 lg:col-span-5 bg-[#e4e4e7] text-black rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden">
             <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-2">
                     <h3 className="text-lg font-medium">Data Analytics</h3>
                     <div className="h-px w-8 bg-black/20"></div>
                 </div>
                 
                 <div className="flex items-center gap-2">
                     <Globe size={16} />
                     <MoveRight size={16} className="-rotate-45" />
                 </div>
             </div>

             <div className="absolute top-16 right-10 bg-[#ff7b58] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg z-10 animate-bounce">
                 ^ 42.85%
             </div>

             <div className="flex-1 w-full min-h-[140px] relative">
                 <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={revenueData.slice(0, 7)}>
                         <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#000000" 
                            strokeWidth={2} 
                            dot={{r: 0}} 
                            activeDot={{r: 4}}
                         />
                         <Line 
                            type="monotone" 
                            dataKey="expenses" 
                            stroke="#000000" 
                            strokeWidth={1} 
                            strokeOpacity={0.2}
                            dot={false} 
                         />
                     </LineChart>
                 </ResponsiveContainer>
             </div>

             <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest opacity-40 mt-4 px-2">
                 <span>Mon</span>
                 <span>Tue</span>
                 <span>Wed</span>
                 <span>Thu</span>
                 <span>Fri</span>
                 <span>Sat</span>
                 <span>Sun</span>
             </div>
        </div>

        {/* 8. SUMMARY (White Block) */}
        <div className="col-span-1 md:col-span-6 lg:col-span-4 bg-white text-black rounded-[2.5rem] p-8 flex flex-col justify-between relative">
             <div className="absolute top-8 right-8">
                 <Target size={24} className="opacity-20 spin-slow" />
             </div>
             
             <div>
                 <h3 className="text-3xl font-medium leading-tight mb-2">
                     The Premium <br/> <span className="opacity-40">Software Solution</span>
                 </h3>
                 <div className="h-0.5 w-12 bg-black mb-6"></div>
             </div>

             <div className="space-y-3">
                 {swot.strengths.slice(0, 2).map((s, i) => (
                     <div key={i} className="text-sm font-medium leading-snug opacity-80 border-l-2 border-black pl-3">
                         {s}
                     </div>
                 ))}
             </div>

             <div className="flex justify-between items-end mt-6 pt-4 border-t border-black/10">
                 <div className="text-[10px] uppercase font-bold tracking-widest opacity-50">SaaS Blueprint</div>
                 <div className="text-[10px] uppercase font-bold tracking-widest">(Global)</div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default ValidationTab;
