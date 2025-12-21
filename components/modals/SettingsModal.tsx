
import React, { useState, useEffect } from 'react';
import { User, UserSettings } from '../../types';
import {
    X, User as UserIcon, Bell, Shield, Smartphone, Mail,
    MapPin, Clock, Briefcase, Camera, Monitor, Moon, Sun,
    Bot, BrainCircuit, Sparkles, Coffee, Glasses, Save
} from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    settings: UserSettings;
    onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

type SettingsTab = 'account' | 'agent' | 'preferences';

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, user, settings, onUpdateSettings }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('account');
    const [localName, setLocalName] = useState(settings.displayName);
    const [localJob, setLocalJob] = useState(settings.jobTitle);

    // Sync local state when settings change prop
    useEffect(() => {
        setLocalName(settings.displayName);
        setLocalJob(settings.jobTitle);
    }, [settings]);

    if (!isOpen) return null;

    const handleSave = () => {
        // Save all local state changes
        onUpdateSettings({
            displayName: localName,
            jobTitle: localJob
        });
        // Optionally close or show toast, but we'll keep it open as per standard UX
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4 md:p-8 animate-fade-in">
            <div className="w-full max-w-5xl h-[85vh] bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col md:flex-row">

                {/* Sidebar */}
                <aside className="w-full md:w-64 bg-zinc-50 dark:bg-zinc-950/50 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col shrink-0 overflow-y-auto" data-lenis-prevent>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                        <div className="w-6 h-6 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                            <div className="w-3 h-3 bg-white dark:bg-black rounded-sm"></div>
                        </div>
                        Settings
                    </h2>

                    <nav className="space-y-1 flex-1">
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'account'
                                ? 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                                }`}
                        >
                            <UserIcon size={16} /> Account
                        </button>
                        <button
                            onClick={() => setActiveTab('preferences')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'preferences'
                                ? 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                                }`}
                        >
                            <Bell size={16} /> Preferences
                        </button>
                        <button
                            onClick={() => setActiveTab('agent')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'agent'
                                ? 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                                }`}
                        >
                            <Bot size={16} /> Agent Persona
                        </button>
                    </nav>

                    <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
                        <button onClick={onClose} className="flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors text-sm font-medium">
                            <X size={16} /> Close Settings
                        </button>
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-1 flex flex-col bg-white dark:bg-[#09090b] min-h-0 overflow-hidden">
                    {/* Header */}
                    <div className="shrink-0 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-8 py-6 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                                {activeTab === 'account' && 'Account Settings'}
                                {activeTab === 'preferences' && 'App Preferences'}
                                {activeTab === 'agent' && 'Agent Personalization'}
                            </h1>
                            <p className="text-sm text-zinc-500">Manage your workspace preferences.</p>
                        </div>

                        {/* Global Save Button for All Tabs */}
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg"
                        >
                            <Save size={14} /> Save Changes
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 max-w-3xl" data-lenis-prevent>

                        {/* ACCOUNT TAB */}
                        {activeTab === 'account' && (
                            <div className="space-y-8 animate-fade-in">

                                {/* Profile Header */}
                                <section className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-2xl border-4 border-white dark:border-[#09090b]">
                                            {localName.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{localName}</h3>
                                        <p className="text-zinc-500 text-sm">{localJob}</p>
                                    </div>
                                </section>

                                {/* Form Fields */}
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Display Name</label>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus-within:border-indigo-500 transition-colors">
                                            <UserIcon size={16} className="text-zinc-500" />
                                            <input
                                                value={localName}
                                                onChange={(e) => setLocalName(e.target.value)}
                                                className="bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-200 w-full font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Job Title</label>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus-within:border-indigo-500 transition-colors">
                                            <Briefcase size={16} className="text-zinc-500" />
                                            <input
                                                value={localJob}
                                                onChange={(e) => setLocalJob(e.target.value)}
                                                className="bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-200 w-full font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-100 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-not-allowed opacity-70">
                                            <Mail size={16} className="text-zinc-600" />
                                            <input
                                                value={user.email}
                                                readOnly
                                                className="bg-transparent border-none outline-none text-sm text-zinc-500 w-full font-medium cursor-not-allowed"
                                            />
                                            <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-500">Verified</span>
                                        </div>
                                    </div>
                                </section>

                                {/* Location & Timezone */}
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-200 dark:border-zinc-800/50">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">City</label>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                                            <MapPin size={16} className="text-zinc-500" />
                                            <input defaultValue="New York" className="bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-200 w-full font-medium" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Timezone</label>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                                            <Clock size={16} className="text-zinc-500" />
                                            <select className="bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-200 w-full font-medium appearance-none">
                                                <option>UTC/GMT -4 hours</option>
                                                <option>UTC/GMT +1 hours</option>
                                                <option>UTC/GMT +8 hours</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* AGENT TAB */}
                        {activeTab === 'agent' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 p-4 rounded-xl flex gap-3">
                                    <BrainCircuit className="text-indigo-500 dark:text-indigo-400 shrink-0" size={20} />
                                    <div>
                                        <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Static Behavior</h4>
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                            Changing these settings will visually update your preferences but the underlying AI behavior is currently fixed for demo purposes.
                                        </p>
                                    </div>
                                </div>

                                <section>
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-4">Select Agent Persona</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { id: 'nerdy', label: 'Nerdy Engineer', desc: 'Highly technical, detailed specs.', icon: Glasses },
                                            { id: 'expert', label: 'Senior Architect', desc: 'Strategic, scalable patterns.', icon: Shield },
                                            { id: 'friendly', label: 'Friendly Co-founder', desc: 'Encouraging, simpler terms.', icon: Coffee },
                                            { id: 'noob', label: 'ELI5 Mode', desc: 'Explain like I am 5.', icon: Sparkles },
                                        ].map((p) => {
                                            const isActive = settings.agentPersona === p.id;
                                            const Icon = p.icon;
                                            return (
                                                <button
                                                    key={p.id}
                                                    onClick={() => onUpdateSettings({ agentPersona: p.id as any })}
                                                    className={`relative p-4 rounded-xl border text-left transition-all duration-200 ${isActive
                                                        ? 'bg-zinc-800 text-white border-zinc-800 dark:bg-zinc-800 dark:border-white dark:ring-1 dark:ring-white'
                                                        : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900/40 dark:border-zinc-800 dark:hover:bg-zinc-800'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className={`p-2 rounded-lg ${isActive ? 'bg-white text-black' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                                                            <Icon size={18} />
                                                        </div>
                                                        {isActive && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                                                    </div>
                                                    <h3 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-zinc-900 dark:text-zinc-300'}`}>{p.label}</h3>
                                                    <p className={`text-xs mt-1 ${isActive ? 'text-zinc-400' : 'text-zinc-500'}`}>{p.desc}</p>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </section>

                                <section className="pt-6 border-t border-zinc-200 dark:border-zinc-800/50">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-6">Response Style</label>
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-300 mb-2">
                                                <span>Creativity Level</span>
                                                <span className="font-mono text-xs bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-400">High</span>
                                            </div>
                                            <input type="range" className="w-full accent-black dark:accent-white" disabled value={80} />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-300 mb-2">
                                                <span>Technical Verbosity</span>
                                                <span className="font-mono text-xs bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-400">Max</span>
                                            </div>
                                            <input type="range" className="w-full accent-black dark:accent-white" disabled value={95} />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* PREFERENCES TAB */}
                        {activeTab === 'preferences' && (
                            <div className="space-y-8 animate-fade-in">

                                <section>
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Appearance</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <button
                                            onClick={() => onUpdateSettings({ theme: 'light' })}
                                            className={`group relative p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${settings.theme === 'light'
                                                ? 'bg-zinc-100 border-zinc-400 shadow-md ring-1 ring-zinc-400'
                                                : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                                }`}
                                        >
                                            <div className={`p-3 rounded-full ${settings.theme === 'light' ? 'bg-white text-orange-500 shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                                <Sun size={24} />
                                            </div>
                                            <span className={`text-sm font-medium ${settings.theme === 'light' ? 'text-zinc-900' : 'text-zinc-500 dark:text-zinc-400'}`}>Light Mode</span>
                                        </button>

                                        <button
                                            onClick={() => onUpdateSettings({ theme: 'dark' })}
                                            className={`group relative p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${settings.theme === 'dark'
                                                ? 'bg-zinc-800 border-zinc-600 ring-1 ring-zinc-500 shadow-md'
                                                : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                                }`}
                                        >
                                            <div className={`p-3 rounded-full ${settings.theme === 'dark' ? 'bg-black text-indigo-400 shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                                <Moon size={24} />
                                            </div>
                                            <span className={`text-sm font-medium ${settings.theme === 'dark' ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>Dark Mode</span>
                                        </button>

                                        <button
                                            onClick={() => onUpdateSettings({ theme: 'system' })}
                                            className={`group relative p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${settings.theme === 'system'
                                                ? 'bg-zinc-200 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-600 ring-1 ring-zinc-400 dark:ring-zinc-500 shadow-md'
                                                : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                                }`}
                                        >
                                            <div className={`p-3 rounded-full ${settings.theme === 'system' ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                                <Monitor size={24} />
                                            </div>
                                            <span className={`text-sm font-medium ${settings.theme === 'system' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>System</span>
                                        </button>
                                    </div>
                                </section>

                                <section className="pt-6 border-t border-zinc-200 dark:border-zinc-800/50">
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Notifications</h3>
                                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400">
                                                <Bell size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-zinc-900 dark:text-white">Push Notifications</div>
                                                <div className="text-xs text-zinc-500">Receive updates about your projects.</div>
                                            </div>
                                        </div>
                                        <div
                                            onClick={() => onUpdateSettings({ notifications: !settings.notifications })}
                                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.notifications ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    </div>
                                </section>

                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
};

export default SettingsModal;
