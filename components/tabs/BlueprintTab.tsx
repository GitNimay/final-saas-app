
import React, { useMemo, useState, useRef, useEffect } from 'react';
import ReactFlow, { Background, Controls, Handle, Position, NodeProps, ReactFlowProvider, MarkerType, Edge, Node, useNodesState, useEdgesState } from 'reactflow';
import { BlueprintData } from '../../types';
import { Database, Globe, Server, Cpu, Activity, FileImage, Loader2, Mail, Info, Share2, MoreHorizontal, Layers, Zap, Code, Shield, User, ArrowRight, Network, GitBranch, Box, Signal, Wifi } from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';

interface Props {
    data: BlueprintData;
    isDark?: boolean;
}

// ------------------------------------------------------------------
// HELPER: COLOR & ICON ENGINE
// ------------------------------------------------------------------
const getNodeConfig = (type: string, label: string) => {
    const l = label.toLowerCase();
    const t = type.toLowerCase();

    // Database / Storage
    if (t.includes('db') || l.includes('data') || l.includes('sql') || l.includes('store') || l.includes('redis')) {
        return {
            color: 'rose',
            hex: '#f43f5e',
            bg: 'bg-rose-500',
            border: 'border-rose-500',
            text: 'text-rose-100',
            badgeBg: 'bg-rose-500/10',
            badgeText: 'text-rose-600 dark:text-rose-400',
            Icon: Database
        };
    }

    // Logic / API / Server
    if (l.includes('api') || l.includes('server') || l.includes('lambda') || l.includes('function') || l.includes('logic')) {
        return {
            color: 'amber',
            hex: '#f59e0b',
            bg: 'bg-amber-500',
            border: 'border-amber-500',
            text: 'text-amber-100',
            badgeBg: 'bg-amber-500/10',
            badgeText: 'text-amber-600 dark:text-amber-400',
            Icon: Zap
        };
    }

    // Frontend / Client
    if (l.includes('client') || l.includes('web') || l.includes('app') || l.includes('ui') || l.includes('react')) {
        return {
            color: 'sky',
            hex: '#0ea5e9',
            bg: 'bg-sky-500',
            border: 'border-sky-500',
            text: 'text-white',
            badgeBg: 'bg-sky-500/10',
            badgeText: 'text-sky-600 dark:text-sky-400',
            Icon: Globe
        };
    }

    // Security / Gateway
    if (l.includes('auth') || l.includes('guard') || l.includes('gateway') || l.includes('proxy')) {
        return {
            color: 'violet',
            hex: '#8b5cf6',
            bg: 'bg-violet-500',
            border: 'border-violet-500',
            text: 'text-white',
            badgeBg: 'bg-violet-500/10',
            badgeText: 'text-violet-600 dark:text-violet-400',
            Icon: Shield
        };
    }

    // Default / Process
    return {
        color: 'zinc',
        hex: '#71717a',
        bg: 'bg-zinc-600',
        border: 'border-zinc-600',
        text: 'text-zinc-100',
        badgeBg: 'bg-zinc-100 dark:bg-zinc-800',
        badgeText: 'text-zinc-500 dark:text-zinc-400',
        Icon: Code
    };
};

// ------------------------------------------------------------------
// NODE: TECH BLOCK (System Arch) - Left -> Right
// ------------------------------------------------------------------
const TechBlockNode = ({ data, selected }: NodeProps) => {
    const config = getNodeConfig(data.iconType || '', data.label || '');
    const Icon = config.Icon;
    // Simulated Status Dot
    const [active, setActive] = useState(true);
    useEffect(() => {
        const interval = setInterval(() => setActive(prev => !prev), 2000 + Math.random() * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`
      relative min-w-[200px] bg-white dark:bg-[#09090b] rounded-lg border transition-all duration-300 shadow-xl group
      ${selected ? `border-${config.color}-500 ring-1 ring-${config.color}-500` : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'}
    `}>
            <Handle type="target" position={Position.Left} className={`!w-2 !h-2 !-left-1 !rounded-sm !border-2 !border-white dark:!border-[#09090b] transition-colors ${selected ? config.bg : '!bg-zinc-400 dark:!bg-zinc-600'}`} />

            {/* Header */}
            <div className={`px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/50 rounded-t-lg flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${config.badgeBg}`}>
                        <Icon size={12} className={config.badgeText} />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{data.iconType || 'Service'}</span>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-zinc-300 dark:bg-zinc-700'} transition-colors`}></div>
            </div>

            {/* Body */}
            <div className="p-3">
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2 leading-tight flex items-center justify-between">
                    {data.label}
                    {selected && <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">12ms</div>}
                </div>

                {/* Attributes */}
                {data.attributes && data.attributes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {data.attributes.slice(0, 3).map((attr: string, i: number) => (
                            <span key={i} className="text-[9px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 flex items-center gap-1">
                                {attr}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Right} className={`!w-2 !h-2 !-right-1 !rounded-sm !border-2 !border-white dark:!border-[#09090b] transition-colors ${selected ? config.bg : '!bg-zinc-400 dark:!bg-zinc-600'}`} />
        </div>
    );
};

// ------------------------------------------------------------------
// NODE: FLOW BADGE (User Flow) - Top -> Bottom - DARK MODE
// ------------------------------------------------------------------
const FlowBadgeNode = ({ data, selected }: NodeProps) => {
    const config = getNodeConfig(data.iconType || '', data.label || '');
    const Icon = config.Icon;

    return (
        <div className={`
       relative min-w-[180px] bg-white dark:bg-[#09090b] rounded-xl border-2 transition-all duration-300 shadow-xl group
       ${selected ? `border-${config.color}-500 shadow-[0_0_15px_-5px_${config.hex}50]` : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'}
    `}>
            <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-zinc-400 !opacity-0 group-hover:!opacity-100 transition-opacity" />

            <div className="absolute -top-3 left-3">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md shadow-lg border border-black/10 dark:border-black/50 ${config.bg} text-white`}>
                    <Icon size={10} strokeWidth={3} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">{data.iconType || 'Step'}</span>
                </div>
            </div>

            <div className="pt-6 pb-4 px-4">
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 text-center leading-snug">{data.label}</div>
                {data.attributes && data.attributes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-col gap-1.5">
                        {data.attributes.slice(0, 2).map((attr: string, i: number) => (
                            <div key={i} className="text-[10px] text-zinc-500 font-medium text-center bg-zinc-50 dark:bg-zinc-900/50 py-1 rounded border border-zinc-200 dark:border-zinc-800/50">
                                {attr}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-zinc-400 !opacity-0 group-hover:!opacity-100 transition-opacity" />
        </div>
    );
};

// ------------------------------------------------------------------
// NODE: DATABASE SCHEMA - Cluster
// ------------------------------------------------------------------
const SchemaNode = ({ data, selected }: NodeProps) => {
    return (
        <div className={`
      min-w-[160px] bg-white dark:bg-[#09090b] rounded-md border overflow-hidden shadow-xl
      ${selected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-zinc-200 dark:border-zinc-800'}
    `}>
            <Handle type="target" position={Position.Top} className="!w-full !h-full !opacity-0 !rounded-none !bg-transparent" />
            <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-indigo-500 !opacity-0" />

            <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-indigo-900 dark:to-indigo-800 px-3 py-1.5 flex items-center justify-between border-b border-indigo-500/50 dark:border-indigo-700/50">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Database size={10} /> {data.label}
                </span>
                <span className="text-[8px] text-indigo-100 dark:text-indigo-300 font-mono">TABLE</span>
            </div>

            <div className="p-2 space-y-1 bg-zinc-50 dark:bg-zinc-900/50">
                {data.attributes && data.attributes.map((attr: string, i: number) => (
                    <div key={i} className="flex justify-between items-center text-[10px] text-zinc-600 dark:text-zinc-400 font-mono px-1 py-0.5 rounded hover:bg-zinc-200 dark:hover:bg-white/5 transition-colors">
                        <span className="text-zinc-900 dark:text-zinc-300">{attr.split(':')[0]}</span>
                        <span className="text-zinc-400 dark:text-zinc-600">{attr.split(':')[1] || 'text'}</span>
                    </div>
                ))}
                {(!data.attributes || data.attributes.length === 0) && (
                    <div className="text-[9px] text-zinc-400 dark:text-zinc-600 italic px-1">id: uuid</div>
                )}
            </div>
        </div>
    );
};

// ------------------------------------------------------------------
// INTERACTIVE FLOW COMPONENT (for draggable nodes)
// ------------------------------------------------------------------
interface InteractiveFlowProps {
    initialNodes: Node[];
    initialEdges: Edge[];
    nodeTypes: any;
    isDark: boolean;
}

const InteractiveFlow: React.FC<InteractiveFlowProps> = ({ initialNodes, initialEdges, nodeTypes, isDark }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Update nodes when initialNodes change (e.g., when switching diagrams)
    useEffect(() => {
        setNodes(initialNodes);
    }, [initialNodes, setNodes]);

    // Update edges when initialEdges change
    useEffect(() => {
        setEdges(initialEdges);
    }, [initialEdges, setEdges]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            nodesDraggable={true}
            fitView
            minZoom={0.2}
            maxZoom={2}
            className="bg-transparent"
            defaultEdgeOptions={{ type: 'smoothstep' }}
        >
            <Controls className="!bg-white dark:!bg-zinc-950 !border-zinc-200 dark:!border-zinc-800 !fill-zinc-500 dark:!fill-zinc-400 !m-4 !shadow-none" />
            <Background color={isDark ? "#52525b" : "#cbd5e1"} gap={20} size={1} style={{ opacity: 0.2 }} />
        </ReactFlow>
    );
};

// ------------------------------------------------------------------
// MAIN TAB COMPONENT
// ------------------------------------------------------------------
const BlueprintTab: React.FC<Props> = ({ data, isDark = true }) => {
    const [activeDiagramIndex, setActiveDiagramIndex] = useState(0);
    const flowRef = useRef<HTMLDivElement>(null);

    // Real-time Traffic Simulation State
    const [trafficData, setTrafficData] = useState<{ time: number, val: number }[]>([]);
    const [systemLoad, setSystemLoad] = useState(34);
    const [activeConnections, setActiveConnections] = useState(1280);

    useEffect(() => {
        // Fill initial data
        const initial = Array.from({ length: 20 }, (_, i) => ({ time: i, val: 30 + Math.random() * 20 }));
        setTrafficData(initial);

        const interval = setInterval(() => {
            setTrafficData(prev => {
                const next = [...prev.slice(1), { time: Date.now(), val: 30 + Math.random() * 40 }];
                return next;
            });
            setSystemLoad(prev => {
                const delta = Math.floor(Math.random() * 10) - 5;
                return Math.min(98, Math.max(12, prev + delta));
            });
            setActiveConnections(prev => prev + Math.floor(Math.random() * 50) - 20);
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    const diagrams = data.diagrams || [];
    const currentDiagram = diagrams[activeDiagramIndex] || { id: 'default', nodes: [], edges: [], title: 'No Data', type: 'system', description: '' };

    const nodeTypes = useMemo(() => ({
        systemNode: TechBlockNode,
        flowNode: FlowBadgeNode,
        databaseNode: SchemaNode
    }), []);

    const nodesWithTypes = useMemo(() => {
        return currentDiagram.nodes.map(node => ({
            ...node,
            type: currentDiagram.type === 'database' ? 'databaseNode'
                : currentDiagram.type === 'flow' ? 'flowNode'
                    : 'systemNode'
        }));
    }, [currentDiagram]);

    const styledEdges = useMemo(() => {
        return currentDiagram.edges.map((edge: Edge) => ({
            ...edge,
            type: 'smoothstep',
            animated: true,
            style: {
                stroke: isDark ? '#52525b' : '#a1a1aa',
                strokeWidth: 1.5,
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#52525b' : '#a1a1aa' },
            labelStyle: { fill: isDark ? '#a1a1aa' : '#71717a', fontWeight: 500, fontSize: 10 },
            labelBgStyle: { fill: isDark ? '#09090b' : '#ffffff', fillOpacity: 0.8 }
        }))
    }, [currentDiagram, isDark]);

    // Stats Engine
    const stats = useMemo(() => {
        const totalNodes = currentDiagram.nodes.length;
        const totalEdges = currentDiagram.edges.length;

        // Composition
        const distribution: Record<string, number> = {};
        currentDiagram.nodes.forEach((n: any) => {
            const config = getNodeConfig(n.data.iconType, n.data.label);
            let group = 'System';
            if (config.color === 'rose') group = 'Data';
            if (config.color === 'amber') group = 'Logic';
            if (config.color === 'sky') group = 'Client';
            distribution[group] = (distribution[group] || 0) + 1;
        });

        const pieData = Object.entries(distribution).map(([name, value]) => ({
            name, value,
            color: name === 'Data' ? '#f43f5e' : name === 'Logic' ? '#f59e0b' : name === 'Client' ? '#0ea5e9' : (isDark ? '#71717a' : '#94a3b8')
        }));

        // Topology
        const nodeConnections: Record<string, number> = {};
        currentDiagram.edges.forEach(e => {
            nodeConnections[e.source] = (nodeConnections[e.source] || 0) + 1;
            nodeConnections[e.target] = (nodeConnections[e.target] || 0) + 1;
        });

        const hubs = currentDiagram.nodes
            .map(n => ({
                id: n.id,
                label: n.data.label,
                type: n.data.iconType,
                connections: nodeConnections[n.id] || 0
            }))
            .sort((a, b) => b.connections - a.connections)
            .slice(0, 3);

        return { totalNodes, totalEdges, pieData, hubs };
    }, [currentDiagram, isDark]);

    const downloadDiagram = async (format: 'png' | 'svg') => {
        if (!flowRef.current) return;
        const el = flowRef.current.querySelector('.react-flow') as HTMLElement;
        if (!el) return;
        try {
            const filter = (node: HTMLElement) => !['react-flow__controls', 'react-flow__attribution'].some(c => node.classList?.contains(c));
            const options = { backgroundColor: isDark ? '#050505' : '#ffffff', filter, skipFonts: true };
            const dataUrl = format === 'png' ? await toPng(el, options) : await toSvg(el, options);
            const a = document.createElement('a');
            a.setAttribute('download', `${currentDiagram.title.replace(/\s+/g, '-').toLowerCase()}.${format}`);
            a.setAttribute('href', dataUrl);
            a.click();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] w-full gap-0 animate-fade-in border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xl bg-white dark:bg-[#050505]">

            {/* --- CANVAS --- */}
            <div className="flex-1 relative flex flex-col" ref={flowRef}>

                <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <div className="flex p-1 rounded-lg border shadow-xl bg-white/80 dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
                        {diagrams.map((diag: any, idx: number) => {
                            const isActive = activeDiagramIndex === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setActiveDiagramIndex(idx)}
                                    className={`
                        relative px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all
                        ${isActive
                                            ? 'bg-zinc-100 text-black shadow dark:bg-zinc-100'
                                            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                        }
                        `}
                                >
                                    {diag.type === 'database' ? 'Schema' : diag.type === 'flow' ? 'Flow' : 'Arch'}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button onClick={() => downloadDiagram('png')} className="p-2 rounded-lg border transition-colors bg-white/80 dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white">
                        <FileImage size={14} />
                    </button>
                </div>

                <div className="flex-1 relative">
                    {/* Custom Grid for "Blueprint" feel */}
                    <div className="absolute inset-0 pointer-events-none opacity-20"
                        style={{
                            backgroundImage: `linear-gradient(${isDark ? '#3f3f46' : '#cbd5e1'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#3f3f46' : '#cbd5e1'} 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}>
                    </div>

                    <ReactFlowProvider key={currentDiagram.id}>
                        <InteractiveFlow
                            initialNodes={nodesWithTypes}
                            initialEdges={styledEdges}
                            nodeTypes={nodeTypes}
                            isDark={isDark}
                        />
                    </ReactFlowProvider>
                </div>
            </div>

            {/* --- SIDEBAR --- */}
            <div className="w-[300px] border-l flex flex-col shrink-0 bg-white dark:bg-[#09090b] border-zinc-200 dark:border-zinc-800">

                <div className="p-4 border-b flex justify-between items-center border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">System Inspector</span>
                    <Activity size={12} className="text-emerald-500 animate-pulse" />
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">

                    {/* 1. Description */}
                    <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Box size={14} className="text-zinc-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-800 dark:text-zinc-200">{currentDiagram.title}</h3>
                        </div>
                        <p className="text-xs leading-relaxed font-light text-zinc-500 dark:text-zinc-400">
                            {currentDiagram.description || "Interactive architecture visualization."}
                        </p>
                    </div>

                    {/* 2. Live Network Status (New) */}
                    <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/50">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live Traffic</h4>
                            <Wifi size={12} className="text-indigo-500 dark:text-indigo-400" />
                        </div>

                        {/* Sparkline Chart */}
                        <div className="h-[60px] w-full mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trafficData}>
                                    <defs>
                                        <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="val" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorTraffic)" isAnimationActive={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded border border-zinc-200 dark:border-zinc-800">
                                <div className="text-[9px] text-zinc-500 mb-1">Load</div>
                                <div className="text-lg font-mono text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                    {systemLoad}%
                                    <div className={`w-1.5 h-1.5 rounded-full ${systemLoad > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                                </div>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded border border-zinc-200 dark:border-zinc-800">
                                <div className="text-[9px] text-zinc-500 mb-1">Active Conn.</div>
                                <div className="text-lg font-mono text-zinc-800 dark:text-zinc-200">{activeConnections}</div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Network Topology */}
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Topology</h4>
                            <Network size={12} className="text-zinc-600 dark:text-zinc-400" />
                        </div>

                        {/* Top Hubs */}
                        <div>
                            <h5 className="text-[9px] text-zinc-500 dark:text-zinc-600 uppercase font-bold mb-2">Key Nodes</h5>
                            <div className="space-y-2">
                                {stats.hubs.map((node, i) => {
                                    const config = getNodeConfig(node.type, node.label);
                                    return (
                                        <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-default group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className={`w-1.5 h-1.5 rounded-full ${config.bg}`}></div>
                                                <span className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate max-w-[100px] group-hover:text-black dark:group-hover:text-zinc-200">{node.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Signal size={8} className="text-zinc-400 dark:text-zinc-600" />
                                                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">{node.connections} links</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 4. Composition */}
                    <div className="p-5 pt-0">
                        <div className="h-[100px] w-full relative opacity-80 hover:opacity-100 transition-opacity">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={30}
                                        outerRadius={45}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                    <button onClick={() => downloadDiagram('png')} className="w-full py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all shadow-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:bg-black dark:hover:bg-white hover:scale-[1.02] active:scale-95 shadow-black/5 dark:shadow-white/5">
                        Export Diagram
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlueprintTab;
