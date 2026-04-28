
import React from 'react';
import { DeepAnalysisData } from '../../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, Users, CheckCircle2, XCircle, Swords, AlertTriangle, 
  DollarSign, Zap, Cloud, Code2, Clock, ShieldCheck 
} from 'lucide-react';

interface Props {
  data: DeepAnalysisData;
}

const PIE_COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

const formatCompactCurrency = (value: number) => {
  if (value >= 1000) return `$${Math.round(value / 1000)}k`;
  return `$${value}`;
};

const DeepAnalysisTab: React.FC<Props> = ({ data }) => {
  const marketTrendData = data.marketDemand.trendData || [];
  const projectedMrrData = data.monetization.projectedMRR || [];
  const hasMarketTrendData = marketTrendData.length > 0;
  const hasProjectedMrrData = projectedMrrData.length > 0;
  const cardClass = "min-w-0 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xl dark:shadow-none";
  const chartShellClass = "h-[220px] sm:h-[260px] w-full min-w-0";

  const EmptyChartState = ({ label }: { label: string }) => (
    <div className="flex h-full min-h-[180px] w-full items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 text-center dark:border-zinc-800 dark:bg-zinc-950/40">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">No chart data available</p>
        <p className="mt-2 text-xs text-zinc-400">{label}</p>
      </div>
    </div>
  );
  
  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-20 animate-fade-in max-w-full mx-auto px-0 sm:px-2">
      
      {/* ----------------------------------------------------
          SECTION 1: MARKET DEMAND (Real-time Trends)
      ---------------------------------------------------- */}
      <section>
          <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-violet-500" size={20} />
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide leading-tight">Real-time Market Pulse</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Trend Chart */}
              <div className={`${cardClass} lg:col-span-2 p-4 sm:p-6 flex flex-col`}>
                   <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-4">Search Interest (Last 12 Months)</h3>
                   <div className={chartShellClass}>
                      {hasMarketTrendData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={marketTrendData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.22}/>
                                        <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" vertical={false} />
                                <XAxis dataKey="month" stroke="currentColor" className="text-zinc-400 dark:text-zinc-500" fontSize={10} tickLine={false} axisLine={false} dy={10} interval="preserveStartEnd" />
                                <YAxis stroke="currentColor" className="text-zinc-400 dark:text-zinc-500" fontSize={10} tickLine={false} axisLine={false} width={36} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--tooltip-bg)', borderColor: 'var(--tooltip-border)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                />
                                <Area type="monotone" dataKey="interest" stroke="var(--foreground)" strokeWidth={3} fillOpacity={1} fill="url(#colorInterest)" />
                            </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <EmptyChartState label="Search interest will appear here when trend data is generated." />
                      )}
                   </div>
              </div>

              {/* Audience Segments */}
              <div className={`${cardClass} p-4 sm:p-6 flex flex-col`}>
                   <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-4">Target Segments</h3>
                   <div className="space-y-3 sm:space-y-4 overflow-y-auto custom-scrollbar sm:pr-2">
                       {data.marketDemand.audienceSegments.map((seg, idx) => (
                           <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/30 transition-colors">
                               <div className="flex justify-between items-center mb-2">
                                   <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{seg.segment}</span>
                                   <span className="text-[10px] bg-violet-500/10 text-violet-600 dark:text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/20">{seg.size}</span>
                               </div>
                               <p className="text-xs text-zinc-500 leading-snug">{seg.painPoint}</p>
                           </div>
                       ))}
                   </div>
              </div>
          </div>
      </section>

      {/* ----------------------------------------------------
          SECTION 2: COMPETITOR FEATURE MATRIX
      ---------------------------------------------------- */}
      <section>
          <div className="flex items-center gap-2 mb-4">
              <Swords className="text-pink-500" size={20} />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">Competitor Feature Gap</h2>
          </div>
          
          <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg dark:shadow-none bg-white dark:bg-transparent">
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
                              <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest w-1/4">Feature</th>
                              <th className="p-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-center w-1/4 bg-emerald-500/5 border-l border-zinc-200 dark:border-zinc-800">Us (Proposed)</th>
                              <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-center w-1/4 border-l border-zinc-200 dark:border-zinc-800">{data.competitorAnalysis.competitorNames.A}</th>
                              <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-center w-1/4 border-l border-zinc-200 dark:border-zinc-800">{data.competitorAnalysis.competitorNames.B}</th>
                          </tr>
                      </thead>
                      <tbody>
                          {data.competitorAnalysis.featureMatrix.map((row, idx) => (
                              <tr key={idx} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors bg-white dark:bg-transparent">
                                  <td className="p-4 text-sm text-zinc-700 dark:text-zinc-300 font-medium">{row.feature}</td>
                                  <td className="p-4 text-center bg-emerald-500/5 border-l border-zinc-200 dark:border-zinc-800">
                                      {row.us ? <CheckCircle2 size={18} className="text-emerald-500 mx-auto" /> : <XCircle size={18} className="text-zinc-300 dark:text-zinc-700 mx-auto" />}
                                  </td>
                                  <td className="p-4 text-center border-l border-zinc-200 dark:border-zinc-800">
                                      {row.competitorA ? <CheckCircle2 size={18} className="text-zinc-400 dark:text-zinc-500 mx-auto" /> : <XCircle size={18} className="text-zinc-300 dark:text-zinc-800 mx-auto" />}
                                  </td>
                                  <td className="p-4 text-center border-l border-zinc-200 dark:border-zinc-800">
                                      {row.competitorB ? <CheckCircle2 size={18} className="text-zinc-400 dark:text-zinc-500 mx-auto" /> : <XCircle size={18} className="text-zinc-300 dark:text-zinc-800 mx-auto" />}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </section>

      {/* ----------------------------------------------------
          SECTION 3: FEASIBILITY & COST
      ---------------------------------------------------- */}
      <section>
          <div className="flex items-center gap-2 mb-4">
              <Code2 className="text-amber-500" size={20} />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">Technical Feasibility & Cost</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              
              {/* Cost Breakdown Pie */}
              <div className={`${cardClass} p-4 sm:p-6`}>
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Monthly Infrastructure</h3>
                      <div className="text-xl font-bold text-zinc-900 dark:text-white">${data.feasibility.infraCost}<span className="text-xs text-zinc-500 font-normal">/mo</span></div>
                  </div>
                  <div className="h-[200px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={data.feasibility.costBreakdown}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="cost"
                              >
                                  {data.feasibility.costBreakdown.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                                  ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', borderColor: 'var(--tooltip-border)', fontSize: '12px', borderRadius: '6px' }} />
                          </PieChart>
                      </ResponsiveContainer>
                      {/* Center Label */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Cloud size={24} className="text-zinc-400 dark:text-zinc-600" />
                      </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                      {data.feasibility.costBreakdown.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[10px] text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                              {item.item}
                          </div>
                      ))}
                  </div>
              </div>

              {/* Dev Timeline & Difficulty */}
              <div className={`${cardClass} p-4 sm:p-6 flex flex-col justify-between`}>
                  <div>
                      <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-6">Development Estimates</h3>
                      
                      <div className="mb-6">
                          <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-300 mb-2">
                              <span className="flex items-center gap-2"><Clock size={14}/> Time to MVP</span>
                              <span className="font-bold text-zinc-900 dark:text-white">{data.feasibility.devTimeMonths} Months</span>
                          </div>
                          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(data.feasibility.devTimeMonths / 12) * 100}%` }}></div>
                          </div>
                      </div>

                      <div>
                          <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-300 mb-2">
                              <span className="flex items-center gap-2"><Zap size={14}/> Technical Complexity</span>
                              <span className="font-bold text-zinc-900 dark:text-white">{data.feasibility.technicalDifficulty}/100</span>
                          </div>
                          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                    data.feasibility.technicalDifficulty > 70 ? 'bg-red-500' : 
                                    data.feasibility.technicalDifficulty > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`} 
                                style={{ width: `${data.feasibility.technicalDifficulty}%` }}
                              ></div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Key Risks</h4>
                      <div className="space-y-2">
                          {data.feasibility.risks.slice(0, 2).map((risk, idx) => (
                              <div key={idx} className="flex gap-2 items-start">
                                  <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                  <div>
                                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">{risk.risk}</p>
                                      <p className="text-[10px] text-zinc-500">{risk.mitigation}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Stack Visual (Small) */}
              <div className="hidden xl:flex p-6 rounded-2xl flex-col items-center justify-center text-center bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xl dark:shadow-none">
                  <div className="w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 shadow-inner">
                       <ShieldCheck size={32} className="text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Feasibility Status</h3>
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                      Viable for MVP
                  </div>
                  <p className="text-xs text-zinc-500 mt-4 max-w-[200px]">
                      The proposed stack fits within budget and timeline constraints.
                  </p>
              </div>

          </div>
      </section>

      {/* ----------------------------------------------------
          SECTION 4: MONETIZATION
      ---------------------------------------------------- */}
      <section>
          <div className="flex items-center gap-2 mb-4">
              <DollarSign className="text-emerald-500" size={20} />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">Monetization Strategy</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {data.monetization.tiers.map((tier, idx) => (
                  <div 
                    key={idx} 
                    className={`
                        relative p-6 rounded-xl border flex flex-col transition-all duration-300 hover:-translate-y-1
                        ${tier.highlight 
                            ? 'bg-zinc-900 border-emerald-500 shadow-xl shadow-emerald-500/10 text-white' 
                            : 'bg-white dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }
                    `}
                  >
                      {tier.highlight && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-full">
                              Recommended
                          </div>
                      )}
                      <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${tier.highlight ? 'text-zinc-300' : 'text-zinc-500'}`}>{tier.name}</h3>
                      <div className={`text-3xl font-bold mb-6 ${tier.highlight ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>{tier.price}<span className="text-sm font-normal text-zinc-500">/mo</span></div>
                      
                      <ul className="space-y-3 mb-6 flex-1">
                          {tier.features.map((feat, fIdx) => (
                              <li key={fIdx} className={`flex items-start gap-2 text-xs ${tier.highlight ? 'text-zinc-300' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                  <CheckCircle2 size={14} className={tier.highlight ? 'text-emerald-500' : 'text-zinc-400'} />
                                  {feat}
                              </li>
                          ))}
                      </ul>

                      <button className={`w-full py-2 rounded-lg text-xs font-bold uppercase transition-colors ${tier.highlight ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>
                          Choose {tier.name}
                      </button>
                  </div>
              ))}
          </div>

          {/* Projected MRR Chart */}
          <div className={`${cardClass} p-4 sm:p-6`}>
               <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-4">Projected MRR Growth (6 Months)</h3>
               <div className={chartShellClass}>
                {hasProjectedMrrData ? (
                     <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={projectedMrrData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" vertical={false} />
                             <XAxis dataKey="month" stroke="currentColor" className="text-zinc-400 dark:text-zinc-500" fontSize={10} tickLine={false} axisLine={false} dy={10} interval="preserveStartEnd" />
                             <YAxis stroke="currentColor" className="text-zinc-400 dark:text-zinc-500" fontSize={10} tickLine={false} axisLine={false} width={38} tickFormatter={(val) => formatCompactCurrency(Number(val))} />
                             <Tooltip 
                                 cursor={{fill: 'var(--tooltip-cursor)'}}
                                 contentStyle={{ backgroundColor: 'var(--tooltip-bg)', borderColor: 'var(--tooltip-border)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                             />
                             <Bar dataKey="amount" fill="var(--foreground)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                         </BarChart>
                     </ResponsiveContainer>
                ) : (
                  <EmptyChartState label="Projected MRR will appear here when monetization data is generated." />
                )}
               </div>
          </div>
      </section>

    </div>
  );
};

export default DeepAnalysisTab;
