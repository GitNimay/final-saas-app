import React, { useState, useEffect, useRef } from 'react';
import ParticleBackground from '../ui/ParticleBackground';
import {
    ArrowRight, Hexagon, BarChart2, Layers, Map, Terminal,
    CheckCircle2, Play, ChevronRight, Zap, Shield, Globe,
    Layout, Menu, X
} from 'lucide-react';

interface Props {
    onLogin: () => void;
    onSignUp: () => void;
}

type Page = 'HOME' | 'PRODUCT' | 'PRICING';

// --- LIVE INTERACTIVE PREVIEWS (Replacing Static Images) ---

// 1. Validation Dashboard Replica
const ValidationVis = () => (
    <div className="w-full h-full bg-[#050505] rounded-xl border border-white/10 overflow-hidden flex flex-col shadow-2xl relative font-sans select-none">
        {/* Header Mockup */}
        <div className="h-12 border-b border-white/5 flex items-center px-4 justify-between bg-[#09090b]">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-bold">MB</div>
                <div className="h-2 w-24 bg-zinc-800 rounded-full"></div>
            </div>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-6">
            {/* Top Row Stats */}
            <div className="grid grid-cols-2 gap-4">
                {/* Viability Score */}
                <div className="bg-[#09090b] border border-white/5 p-4 rounded-xl relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Viability Score</div>
                        <div className="text-emerald-500"><Zap size={14} /></div>
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">78<span className="text-lg text-zinc-600 font-normal">/100</span></div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[78%] shadow-[0_0_10px_#10b981] animate-[growWidth_1.5s_ease-out]"></div>
                    </div>
                </div>
                {/* Market Size */}
                <div className="bg-[#09090b] border border-white/5 p-4 rounded-xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Total Market (TAM)</div>
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">$750M</div>
                    <div className="flex gap-2">
                        <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-400">SAM $75M</div>
                    </div>
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="flex-1 bg-[#09090b] border border-white/5 p-5 rounded-xl flex flex-col relative">
                <div className="flex justify-between items-center mb-6">
                    <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider flex items-center gap-2">
                        <div className="p-1 bg-yellow-500/10 rounded text-yellow-500"><BarChart2 size={12} /></div>
                        Financial Projection
                    </div>
                    <div className="flex gap-3 text-[10px]">
                        <div className="flex items-center gap-1.5 text-zinc-400"><div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div> Revenue</div>
                        <div className="flex items-center gap-1.5 text-zinc-400"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> Expenses</div>
                    </div>
                </div>

                <div className="flex-1 relative w-full h-full min-h-[150px]">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[0, 1, 2, 3, 4].map(i => <div key={i} className="w-full h-px bg-white/5"></div>)}
                    </div>
                    {/* SVG Chart */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                        {/* Revenue Area (Yellow) */}
                        <defs>
                            <linearGradient id="gradRevenue" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#facc15" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M0,150 C50,140 100,130 150,100 C200,70 250,50 300,20 L300,150 L0,150 Z"
                            fill="url(#gradRevenue)"
                            className="animate-[fadeIn_2s_ease-out]"
                        />
                        <path
                            d="M0,150 C50,140 100,130 150,100 C200,70 250,50 300,20"
                            fill="none"
                            stroke="#facc15"
                            strokeWidth="3"
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                        >
                            <animate attributeName="stroke-dasharray" from="0, 1000" to="1000, 0" dur="2s" fill="freeze" />
                        </path>

                        {/* Expenses Line (Red) */}
                        <path
                            d="M0,150 L300,120"
                            fill="none"
                            stroke="#f87171"
                            strokeWidth="2"
                            strokeDasharray="4,4"
                            className="opacity-50"
                        />
                    </svg>

                    {/* Floating Tooltip Animation */}
                    <div className="absolute top-[30%] left-[60%] bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-lg shadow-xl animate-[float_4s_ease-in-out_infinite]">
                        <div className="text-[10px] text-zinc-500 mb-0.5">Month 12</div>
                        <div className="text-sm font-bold text-white">$24.5k <span className="text-[10px] text-emerald-500 font-normal">+12%</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// 2. Blueprint System Architecture Replica
const BlueprintVis = () => (
    <div className="w-full h-full bg-[#050505] rounded-xl border border-white/10 overflow-hidden relative shadow-2xl group">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        {/* UI Overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
            <div className="px-2 py-1 rounded bg-white text-black text-[10px] font-bold">ARCH</div>
            <div className="px-2 py-1 rounded bg-zinc-900 text-zinc-500 text-[10px] font-bold border border-zinc-800">SCHEMA</div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
            {/* Nodes Container */}
            <div className="relative w-[80%] h-[60%]">
                {/* Connection Lines SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                    <defs>
                        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                            <path d="M0,0 L0,6 L6,3 z" fill="#52525b" />
                        </marker>
                    </defs>
                    {/* Lines */}
                    <path d="M80,50 L180,50" stroke="#52525b" strokeWidth="1" markerEnd="url(#arrow)" />
                    <path d="M80,150 L180,100" stroke="#52525b" strokeWidth="1" markerEnd="url(#arrow)" />
                    <path d="M300,50 L380,50" stroke="#52525b" strokeWidth="1" markerEnd="url(#arrow)" />
                    <path d="M300,100 L380,50" stroke="#52525b" strokeWidth="1" markerEnd="url(#arrow)" />

                    {/* Animated Data Packets */}
                    <circle r="3" fill="#818cf8">
                        <animateMotion dur="2s" repeatCount="indefinite" path="M80,50 L180,50" />
                    </circle>
                    <circle r="3" fill="#818cf8">
                        <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.5s" path="M80,150 L180,100" />
                    </circle>
                </svg>

                {/* Node: Client */}
                <div className="absolute top-[20px] left-0 w-20 h-14 bg-zinc-900 border border-sky-500/50 rounded-lg flex flex-col items-center justify-center shadow-[0_0_15px_-5px_rgba(14,165,233,0.3)]">
                    <Globe size={12} className="text-sky-400 mb-1" />
                    <span className="text-[8px] text-zinc-300 font-bold">Web App</span>
                </div>

                {/* Node: Mobile */}
                <div className="absolute top-[120px] left-0 w-20 h-14 bg-zinc-900 border border-sky-500/50 rounded-lg flex flex-col items-center justify-center shadow-[0_0_15px_-5px_rgba(14,165,233,0.3)]">
                    <Layout size={12} className="text-sky-400 mb-1" />
                    <span className="text-[8px] text-zinc-300 font-bold">Mobile</span>
                </div>

                {/* Node: API */}
                <div className="absolute top-[50px] left-[35%] w-24 h-16 bg-zinc-900 border border-indigo-500/50 rounded-lg flex flex-col items-center justify-center shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]">
                    <Terminal size={14} className="text-indigo-400 mb-1" />
                    <span className="text-[9px] text-zinc-300 font-bold">API Layer</span>
                </div>

                {/* Node: Database */}
                <div className="absolute top-[30px] right-0 w-20 h-14 bg-zinc-900 border border-emerald-500/50 rounded-lg flex flex-col items-center justify-center shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]">
                    <Layers size={12} className="text-emerald-400 mb-1" />
                    <span className="text-[8px] text-zinc-300 font-bold">Database</span>
                </div>
            </div>
        </div>
    </div>
);

// --- MAIN LANDING PAGE COMPONENT ---
const LandingPage: React.FC<Props> = ({ onLogin, onSignUp }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activePage, setActivePage] = useState<Page>('HOME');

    const navItems = [
        { label: 'Product', page: 'PRODUCT' as Page },
        { label: 'Pricing', page: 'PRICING' as Page },
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
            <ParticleBackground />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <Hexagon size={24} className="text-white" />
                        <span className="font-bold text-lg tracking-tight">MicroBuild</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => setActivePage(item.page)}
                                className={`text-sm font-medium transition-colors ${activePage === item.page ? 'text-white' : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={onLogin}
                            className="text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={onSignUp}
                            className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-all"
                        >
                            Get Started
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-zinc-900/95 backdrop-blur-xl border-t border-white/5">
                        <div className="px-6 py-4 flex flex-col gap-4">
                            {navItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => {
                                        setActivePage(item.page);
                                        setMobileMenuOpen(false);
                                    }}
                                    className="text-sm font-medium text-zinc-400 hover:text-white text-left"
                                >
                                    {item.label}
                                </button>
                            ))}
                            <hr className="border-white/10" />
                            <button onClick={onLogin} className="text-sm text-zinc-400 hover:text-white text-left">
                                Sign In
                            </button>
                            <button
                                onClick={onSignUp}
                                className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg text-center"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-zinc-400 font-medium">AI-Powered Validation</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                                Validate Your
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400"> SaaS Idea </span>
                                Before You Build
                            </h1>

                            <p className="text-lg text-zinc-400 max-w-xl">
                                Transform your startup concepts into validated business plans with AI-driven market analysis,
                                competitive research, and financial projections.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={onSignUp}
                                    className="group px-6 py-3 bg-white text-black font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"
                                >
                                    Start Free Analysis
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="px-6 py-3 border border-zinc-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-900 transition-all">
                                    <Play size={18} />
                                    Watch Demo
                                </button>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex items-center gap-6 pt-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                    <span className="text-sm text-zinc-400">No credit card required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className="text-blue-500" />
                                    <span className="text-sm text-zinc-400">Enterprise-grade security</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Interactive Dashboard */}
                        <div className="relative h-[500px] hidden lg:block">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-2xl blur-3xl"></div>
                            <div className="relative h-full">
                                <ValidationVis />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Validate</h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">
                            Comprehensive tools designed to help you make data-driven decisions about your next big idea.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature Cards */}
                        {[
                            { icon: BarChart2, title: 'Market Analysis', desc: 'Deep-dive into market trends, TAM/SAM/SOM calculations, and growth projections.' },
                            { icon: Map, title: 'Competitive Landscape', desc: 'Identify competitors, analyze their strategies, and find your unique positioning.' },
                            { icon: Layers, title: 'Tech Stack Blueprint', desc: 'Get AI-generated architecture recommendations tailored to your product needs.' },
                        ].map((feature, i) => (
                            <div key={i} className="p-6 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-white/10 transition-all group">
                                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-zinc-700 transition-colors">
                                    <feature.icon size={24} className="text-white" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-zinc-400 text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blueprint Showcase */}
            <section className="py-20 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="h-[400px]">
                            <BlueprintVis />
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold">
                                AI-Generated
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-500"> Architecture </span>
                                Blueprints
                            </h2>
                            <p className="text-zinc-400">
                                Get instant visual blueprints of your product's technical architecture.
                                Our AI analyzes your requirements and generates optimal system designs.
                            </p>
                            <ul className="space-y-3">
                                {['Scalable microservices architecture', 'Database schema recommendations', 'API design patterns', 'Deployment strategies'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                                        <ChevronRight size={16} className="text-indigo-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Validate Your Idea?</h2>
                    <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                        Join thousands of founders who use MicroBuild to make smarter decisions about their startups.
                    </p>
                    <button
                        onClick={onSignUp}
                        className="px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-all inline-flex items-center gap-2"
                    >
                        Get Started for Free
                        <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Hexagon size={20} className="text-zinc-600" />
                        <span className="text-sm text-zinc-600">© 2024 MicroBuild. All rights reserved.</span>
                    </div>
                    <div className="flex gap-6 text-sm text-zinc-500">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;