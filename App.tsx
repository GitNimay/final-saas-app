
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Project, LoadingStep, TabView, Message, KanbanColumn, UserSettings } from './types';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { generateBlueprint, generateRoadmap, generateTechStack, generateValidation, generateConsultantReply, generateDeepAnalysis, generatePRD, enhancePrompt } from './services/aiService';
import { saveProject, getProjects, deleteProject, subscribeToProject, subscribeToMessages, getMessages, sendMessage, getUserSettings, saveUserSettings, syncUserProfile } from './services/projectService';
import ParticleBackground from './components/ui/ParticleBackground';
import PaperBackground from './components/ui/PaperBackground';
import { WebGLShader } from './components/ui/WebGLShader';
import ValidationTab from './components/tabs/ValidationTab';
import BlueprintTab from './components/tabs/BlueprintTab';
import RoadmapTab from './components/tabs/RoadmapTab';
import TechStackTab from './components/tabs/TechStackTab';
import PRDTab from './components/tabs/PRDTab';
import BuilderTab from './components/tabs/BuilderTab';
import DeepAnalysisTab from './components/tabs/DeepAnalysisTab';
import UserMenu from './components/menus/UserMenu';
import SettingsModal from './components/modals/SettingsModal';
import LoginPage from './components/auth/LoginPage'; 
import { Bot, ChevronRight, LayoutDashboard, Map, Trello, Layers, Settings, LogOut, Loader2, Sparkles, Send, Trash2, History, MessageSquarePlus, Mic, Plus, BarChart2, X, Paperclip, Share2, Copy, Check, Link as LinkIcon, ExternalLink, FileText, Terminal, TrendingUp, Download, PanelLeftClose, PanelLeftOpen, Hexagon, HelpCircle, Twitter, Facebook, Linkedin, Mail, Zap, CheckCircle2, MoreHorizontal, Square, StopCircle, ChevronDown, Lock, Wand2, ArrowRight, Clock, HelpCircle as HelpIcon, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';

const LOADING_MESSAGES = [
    "Orchestrating AI agents...",
    "Analyzing market trends...",
    "Drafting technical architecture...",
    "Calculating cloud infrastructure costs...",
    "Identifying competitive gaps...",
    "Writing Product Requirements Document...",
    "Finalizing strategic roadmap..."
];

const SUGGESTED_QUESTIONS = [
    "What are the main technical risks for this architecture?",
    "Suggest a go-to-market strategy for the first 3 months.",
    "How can I differentiate from the top competitors?"
];

const AVAILABLE_MODELS = [
    { id: 'gemini-flash', name: 'Gemini 2.5 Flash', active: true },
    { id: 'gemini-pro', name: 'Gemini 2.5 Pro', active: false },
    { id: 'gpt-4o', name: 'GPT-4o', active: false },
    { id: 'claude-3-5', name: 'Claude 3.5 Sonnet', active: false },
];

const App = () => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true); 
  
  const [ideaInput, setIdeaInput] = useState('');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectsHistory, setProjectsHistory] = useState<Project[]>([]);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>(LoadingStep.IDLE);
  const [activeTab, setActiveTab] = useState<TabView>('validation');
  const [showHistorySidebar, setShowHistorySidebar] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Header State
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Realtime Chat State
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Loading State
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const stopGeneration = useRef(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Settings State
  const [userSettings, setUserSettings] = useState<UserSettings>({
      displayName: 'Guest',
      jobTitle: 'Product Manager',
      theme: 'dark',
      agentPersona: 'friendly',
      notifications: true
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Model Dropdown State
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);

  // Derived Theme State for passing to components that need JS-level theme awareness (e.g. Charts)
  const isDarkMode = userSettings.theme === 'dark' || (userSettings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Initialize User & Settings
  useEffect(() => {
    const initUser = async (sessionUser: any) => {
        if (!sessionUser) {
            if (!isSupabaseConfigured) {
                const guestUser = { id: 'guest', email: 'guest@example.com' };
                setUser(guestUser);
                loadHistory(guestUser.id);
            } else {
                setUser(null);
            }
            setAuthLoading(false);
            return;
        }

        const currentUser = { 
            id: sessionUser.id, 
            email: sessionUser.email || 'user@example.com' 
        };
        setUser(currentUser);
        
        await syncUserProfile(currentUser);
        loadHistory(currentUser.id);
        
        const savedSettings = await getUserSettings(currentUser.id);
        if (savedSettings) {
            setUserSettings(savedSettings);
        } else {
            // Derive display name from email if no metadata
            let derivedName = currentUser.email.split('@')[0];
            // Capitalize first letter
            derivedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
            
            const metaName = sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name;

            const initialSettings = {
                ...userSettings,
                displayName: metaName || derivedName
            };
            setUserSettings(initialSettings);
        }
        setAuthLoading(false);
    };

    if (supabase) {
        supabase.auth.getSession().then(({ data: { session } }) => {
            initUser(session?.user);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (_event === 'SIGNED_OUT') {
                setUser(null);
                setProjectsHistory([]);
                setCurrentProject(null);
            } else if (session?.user) {
                initUser(session.user);
            }
        });

        return () => subscription.unsubscribe();
    } else {
        initUser(null);
    }
  }, []);

  useEffect(() => {
      const root = window.document.documentElement;
      // Force remove both to reset
      root.classList.remove('dark', 'light');
      
      const isDark = userSettings.theme === 'dark' || (userSettings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
          root.classList.add('dark');
      } else {
          root.classList.add('light'); // Optional but explicit
      }
  }, [userSettings.theme]);

  const handleSignOut = async () => {
      if (supabase) await supabase.auth.signOut();
      setUser(null);
      setUserMenuOpen(false);
  };

  const handleExitProject = () => {
      setCurrentProject(null);
      setChatOpen(false);
  };

  const handleUpdateSettings = async (newSettings: Partial<UserSettings>) => {
      const updated = { ...userSettings, ...newSettings };
      setUserSettings(updated);
      if (user) {
          await saveUserSettings(user.id, updated);
      }
  };

  useEffect(() => {
    if (!currentProject) return;
    setChatOpen(false);
    setShareOpen(false);
    getMessages(currentProject.id).then(setChatMessages);

    const projSub = subscribeToProject(currentProject.id, (newPayload) => {
        setCurrentProject(prev => {
            if(!prev) return newPayload;
            if (new Date(newPayload.created_at) > new Date(prev.created_at)) {
                return newPayload;
            }
            return newPayload;
        });
    });

    const msgSub = subscribeToMessages(currentProject.id, (newMsg) => {
        setChatMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
        });
    });

    return () => {
        projSub?.unsubscribe();
        msgSub?.unsubscribe();
    };
  }, [currentProject?.id]);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatOpen, chatLoading]);

  useEffect(() => {
      if (loadingStep === LoadingStep.IDLE || loadingStep === LoadingStep.COMPLETE) return;
      const interval = setInterval(() => {
          setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
      return () => clearInterval(interval);
  }, [loadingStep]);

  // Countdown Timer Effect
  useEffect(() => {
    if (loadingStep !== LoadingStep.IDLE && loadingStep !== LoadingStep.COMPLETE) {
        setTimeLeft(45);
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }
  }, [loadingStep]);

  const loadHistory = async (userId: string) => {
    const projs = await getProjects(userId);
    setProjectsHistory(projs);
  };

  const handleStopGeneration = () => {
      stopGeneration.current = true;
      setLoadingStep(LoadingStep.IDLE);
      setIdeaInput('');
  };

  const handleEnhance = async () => {
      if (!ideaInput.trim()) return;
      setIsEnhancing(true);
      try {
          const enhanced = await enhancePrompt(ideaInput);
          setIdeaInput(enhanced);
      } catch (e) {
          console.error("Enhance failed", e);
      } finally {
          setIsEnhancing(false);
      }
  };

  const groupedProjects = useMemo(() => {
    const groups: Record<string, Project[]> = {
        'Today': [],
        'Yesterday': [],
        'Previous 7 Days': [],
        'Older': []
    };

    projectsHistory.forEach(p => {
        const date = new Date(p.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) groups['Today'].push(p);
        else if (diffDays === 1) groups['Yesterday'].push(p);
        else if (diffDays <= 7) groups['Previous 7 Days'].push(p);
        else groups['Older'].push(p);
    });
    return groups;
  }, [projectsHistory]);

  const handleSpark = async (overrideInput?: string) => {
    const inputToUse = overrideInput || ideaInput;
    if (!inputToUse.trim()) return;

    if (overrideInput) setIdeaInput(overrideInput);
    
    stopGeneration.current = false;
    setLoadingStep(LoadingStep.ANALYZING);
    setChatOpen(false);
    setLoadingMessageIndex(0);
    
    try {
        if (stopGeneration.current) return;
        const validation = await generateValidation(inputToUse);
        
        if (stopGeneration.current) return;
        setLoadingStep(LoadingStep.DEEP_DIVING);
        const deepAnalysis = await generateDeepAnalysis(inputToUse);
        
        if (stopGeneration.current) return;
        setLoadingStep(LoadingStep.BLUEPRINTING);
        const blueprint = await generateBlueprint(inputToUse);
        
        if (stopGeneration.current) return;
        setLoadingStep(LoadingStep.ROADMAPPING);
        const roadmap = await generateRoadmap(inputToUse);
        
        if (stopGeneration.current) return;
        setLoadingStep(LoadingStep.COMPILING);
        const [techStack, prd] = await Promise.all([
            generateTechStack(inputToUse),
            generatePRD(inputToUse)
        ]);

        if (stopGeneration.current) return;

        const projectName = validation.projectTitle || (inputToUse.length > 30 ? inputToUse.substring(0, 30) + '...' : inputToUse);

        const newProject: Project = {
            id: crypto.randomUUID(),
            name: projectName,
            description: inputToUse,
            created_at: new Date().toISOString(),
            data: { validation, deepAnalysis, blueprint, roadmap, techStack, prd }
        };

        if (user) {
            await saveProject(newProject, user.id);
            await loadHistory(user.id);
        }
        
        setCurrentProject(newProject);
        setChatOpen(false);
        setLoadingStep(LoadingStep.COMPLETE);
        await sendMessage(newProject.id, 'model', `Hello! I've analyzed "${inputToUse}". I'm ready to discuss your strategy.`);

    } catch (error) {
        console.error(error);
        if (!stopGeneration.current) {
            setLoadingStep(LoadingStep.ERROR);
            alert('AI Generation failed. Please try again (check API Key).');
        }
    }
  };

  const handleChatSend = async (overrideText?: string) => {
    const text = overrideText || chatInput;
    if(!text.trim() || !currentProject) return;
    
    setChatInput('');
    setChatLoading(true);

    try {
        await sendMessage(currentProject.id, 'user', text);
        const formattedHistory = chatMessages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
        }));
        const context = `
            Project Name: ${currentProject.name}
            Description: ${currentProject.description}
            Validation Summary: ${currentProject.data.validation?.summary || 'N/A'}
            Viability Score: ${currentProject.data.validation?.viabilityScore || 'N/A'}
            Key Market Stats: TAM ${currentProject.data.validation?.marketStats?.tam}M
            Tech Stack: ${currentProject.data.techStack?.technologies.map(t => t.name).join(', ') || 'N/A'}
        `;
        const reply = await generateConsultantReply(context, formattedHistory, text);
        await sendMessage(currentProject.id, 'model', reply);

    } catch (e) {
        console.error(e);
        await sendMessage(currentProject.id, 'model', 'Sorry, I had trouble connecting to the consultant AI.');
    } finally {
        setChatLoading(false);
    }
  };

  const updateProjectData = async (key: keyof Project['data'], value: any) => {
      if (!currentProject || !user) return;
      const updatedProject = { ...currentProject, data: { ...currentProject.data, [key]: value } };
      setCurrentProject(updatedProject);
      await saveProject(updatedProject, user.id);
  };

  const promptDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setProjectToDelete(id);
      setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
      if (projectToDelete && user) {
          await deleteProject(projectToDelete, user.id);
          if (currentProject?.id === projectToDelete) setCurrentProject(null);
          await loadHistory(user.id);
      }
      setDeleteModalOpen(false);
      setProjectToDelete(null);
  };

  const handleDownloadPDF = () => {
      if (!currentProject) return;
      const doc = new jsPDF();
      let y = 20;
      const margin = 20;
      const lineHeight = 7;
      const pageHeight = doc.internal.pageSize.height;

      const addText = (text: string, fontSize = 12, isBold = false) => {
          doc.setFontSize(fontSize);
          doc.setFont("helvetica", isBold ? "bold" : "normal");
          const splitText = doc.splitTextToSize(text, 170);
          if (y + splitText.length * lineHeight > pageHeight - margin) {
              doc.addPage(); y = margin;
          }
          doc.text(splitText, margin, y);
          y += splitText.length * lineHeight + 2;
      };

      addText(`Project Report: ${currentProject.name}`, 22, true);
      y += 10;
      addText(currentProject.description, 12, false);
      y += 15;

      if (currentProject.data.validation) {
          addText("1. Validation & Market Analysis", 16, true);
          y += 5;
          addText(`Viability Score: ${currentProject.data.validation.viabilityScore}/100`, 12, true);
          addText(`Summary: ${currentProject.data.validation.summary}`);
      }

      doc.save(`${currentProject.name.replace(/\s+/g, '_')}_Report.pdf`);
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-black text-white">
              <Loader2 className="animate-spin text-white" size={32} />
          </div>
      );
  }

  if (!user && isSupabaseConfigured) {
      return <LoginPage />;
  }

  if (!currentProject && loadingStep === LoadingStep.IDLE) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-white dark:bg-black flex font-sans text-zinc-900 dark:text-white selection:bg-indigo-500/30 transition-colors duration-300">
        <div className="hidden dark:block">
            <PaperBackground />
        </div>
        
        <div className="fixed top-6 right-6 z-50 animate-fade-in delay-100">
             <button 
                onClick={() => window.open('https://github.com/GitNimay', '_blank')}
                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all text-xs font-semibold shadow-xl backdrop-blur-md"
             >
                <Sparkles size={14} className="text-zinc-400 group-hover:text-yellow-400 transition-colors" />
                <span>Support</span>
             </button>
        </div>

        {!showHistorySidebar && (
            <div className="fixed top-6 left-6 z-50 animate-fade-in">
                <button 
                    onClick={() => setShowHistorySidebar(true)}
                    className="p-3 rounded-xl bg-white/80 dark:bg-black/40 border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-600 transition-all backdrop-blur-md shadow-lg"
                >
                    <PanelLeftOpen size={20} />
                </button>
            </div>
        )}

        <div className={`fixed left-0 top-0 h-full w-80 bg-zinc-50/90 dark:bg-black/20 backdrop-blur-md border-r border-zinc-200 dark:border-white/5 p-6 flex flex-col z-40 transition-transform duration-500 ${showHistorySidebar ? 'translate-x-0' : '-translate-x-full'}`}>
             
             <div className="mb-6 pl-1 mt-2 flex items-center justify-between">
                <h2 className="text-zinc-900 dark:text-zinc-100 font-bold text-lg flex items-center gap-2 shadow-black drop-shadow-sm">
                    <Hexagon size={24} className="text-black dark:text-white fill-black/10 dark:fill-white/10" />
                    SaaS Val.
                </h2>
                <button onClick={() => setShowHistorySidebar(false)} className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                    <PanelLeftClose size={18} />
                </button>
             </div>

             <div className="mb-6 relative z-50">
                <button 
                    onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20 transition-all shadow-sm backdrop-blur-md"
                >
                    <div className="flex items-center gap-2">
                        <Zap size={14} className="text-yellow-500 fill-yellow-500/20" />
                        <span>{selectedModel.name}</span>
                    </div>
                    <ChevronDown size={14} className={`text-zinc-500 transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {modelDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in p-1 z-50">
                        {AVAILABLE_MODELS.map((model) => (
                            <div 
                                key={model.id}
                                className={`
                                    px-2 py-2 rounded-lg mb-1 flex items-center justify-between cursor-pointer transition-colors group
                                    ${model.active 
                                        ? 'bg-indigo-500/10' 
                                        : 'hover:bg-zinc-100 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
                                    }
                                `}
                                onClick={() => {
                                    if (model.active) {
                                        setSelectedModel(model);
                                        setModelDropdownOpen(false);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold ${model.active ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200'}`}>
                                        {model.name}
                                    </span>
                                </div>
                                
                                {model.active ? (
                                    <Check size={12} className="text-indigo-400" />
                                ) : (
                                    <div className="group/tooltip relative">
                                        <HelpCircle size={12} className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400" />
                                        <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 dark:text-zinc-400 rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50">
                                            We are working on this model implementation. Check back later.
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
             </div>

             <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 pl-1">
                Project History
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-2">
                {(Object.entries(groupedProjects) as [string, Project[]][]).map(([group, projs]) => (
                    projs.length > 0 && (
                        <div key={group} className="mb-6">
                            <h3 className="text-[10px] text-zinc-500 font-bold px-2 mb-2 sticky top-0 bg-zinc-50/95 dark:bg-black/60 backdrop-blur py-1 z-10 rounded-lg">{group}</h3>
                            <div className="space-y-1">
                                {projs.map((p, i) => (
                                    <div 
                                        key={p.id} 
                                        className="group relative flex flex-col p-3 rounded-xl hover:bg-zinc-200/50 dark:hover:bg-white/5 border border-transparent hover:border-zinc-300 dark:hover:border-white/10 transition-all cursor-pointer animate-slide-in"
                                        style={{ animationDelay: `${i * 30}ms` }}
                                        onClick={() => { setCurrentProject(p); setChatOpen(false); }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-zinc-600 dark:text-zinc-400 text-sm font-medium truncate max-w-[180px] group-hover:text-black dark:group-hover:text-white transition-colors">
                                                {p.name}
                                            </span>
                                            
                                            <button 
                                                onClick={(e) => promptDelete(e, p.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 dark:hover:text-red-400 text-zinc-400 dark:text-zinc-600 transition-all"
                                                title="Delete Project"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}
                
                {projectsHistory.length === 0 && (
                    <div className="text-zinc-500 dark:text-zinc-600 text-xs italic pl-3 mt-4">No recent history found.</div>
                )}
             </div>

             <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-white/5 animate-fade-in delay-200 relative">
                <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-200 dark:hover:bg-white/5 border border-transparent hover:border-zinc-300 dark:hover:border-white/10 transition-all cursor-pointer group bg-white dark:bg-zinc-900/30 shadow-sm dark:shadow-none"
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-lg ring-2 ring-white dark:ring-black">
                        {userSettings.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden text-left">
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-300 truncate group-hover:text-black dark:group-hover:text-white transition-colors">
                            {userSettings.displayName}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Pro Account
                        </div>
                    </div>
                    <Settings size={14} className="text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                </button>
                
                {user && (
                    <UserMenu 
                        user={user}
                        settings={userSettings}
                        isOpen={userMenuOpen}
                        onClose={() => setUserMenuOpen(false)}
                        onOpenSettings={() => setSettingsModalOpen(true)}
                        onUpdateSettings={handleUpdateSettings}
                        onSignOut={handleSignOut}
                    />
                )}
             </div>
        </div>
        
        <div className={`flex-1 flex flex-col items-center justify-center p-4 z-10 relative transition-all duration-500 ${showHistorySidebar ? 'md:pl-80' : 'pl-0'}`}>
            
            <div className="flex flex-col items-center justify-center max-w-2xl w-full px-4 text-center z-10 relative">
    
                <div className="w-16 h-16 bg-white dark:bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-zinc-200 dark:border-white/10 shadow-2xl animate-float">
                    <Hexagon size={32} className="text-black dark:text-white fill-black/5 dark:fill-white/20" />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight drop-shadow-lg">
                    Good to See You, {userSettings.displayName.split(' ')[0]}!
                </h1>
                <h2 className="text-2xl md:text-3xl font-light text-zinc-600 dark:text-zinc-300 mb-6 drop-shadow-md">
                    How can I help validate your idea?
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 mb-10 font-light text-sm">
                    I'm available 24/7 to generate blueprints, roadmaps & strategies.
                </p>

                <div className="w-full max-w-2xl relative mb-8 animate-slide-up delay-200">
                    <div className="relative flex items-center bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl dark:shadow-2xl transition-all focus-within:ring-1 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/50 group overflow-hidden">
                        
                        <input 
                            type="text" 
                            value={ideaInput}
                            onChange={(e) => setIdeaInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSpark()}
                            placeholder="Ask anything..."
                            className="w-full bg-transparent border-none outline-none text-base text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 h-16 pl-6 pr-32 font-medium"
                            autoFocus
                        />
                        
                        <div className="absolute right-2 flex items-center gap-2">
                            <button
                                onClick={handleEnhance}
                                disabled={isEnhancing || !ideaInput.trim()}
                                className="group/enhance flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Enhance prompt with AI"
                            >
                                {isEnhancing ? (
                                    <Loader2 size={12} className="animate-spin text-indigo-500 dark:text-indigo-400" />
                                ) : (
                                    <Wand2 size={12} className="text-indigo-500 dark:text-indigo-400 group-hover/enhance:text-indigo-600 dark:group-hover/enhance:text-indigo-300 transition-colors" />
                                )}
                                <span className="hidden sm:inline">Enhance</span>
                            </button>

                            {ideaInput.trim() && (
                                <button 
                                    onClick={() => handleSpark()}
                                    className="p-2 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg"
                                >
                                    <Send size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in delay-300">
                    {[
                        { label: "Validate a niche CRM", icon: <CheckCircle2 size={14}/> },
                        { label: "SaaS for Dog Walkers", icon: <Bot size={14}/> },
                        { label: "Micro-SaaS Roadmap", icon: <Map size={14}/> },
                    ].map((suggestion, i) => (
                        <button
                            key={i}
                            onClick={() => handleSpark(suggestion.label)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-md border border-zinc-200 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white text-xs font-medium transition-all shadow-sm"
                        >
                            {suggestion.icon}
                            {suggestion.label}
                        </button>
                    ))}
                </div>

                <div className="fixed bottom-6 text-[10px] text-zinc-400 dark:text-zinc-500 animate-fade-in delay-500">
                    Unlock new era with SaaS Validator. <span className="underline cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300">share us</span>
                </div>

            </div>
        </div>

        {deleteModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Delete Project?</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Are you sure you want to delete the project? This action cannot be undone.</p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setDeleteModalOpen(false)}
                            className="flex-1 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            No
                        </button>
                        <button 
                            onClick={confirmDelete}
                            className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        {user && (
            <SettingsModal 
                isOpen={settingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
                user={user}
                settings={userSettings}
                onUpdateSettings={handleUpdateSettings}
            />
        )}

      </div>
    );
  }

  if (loadingStep !== LoadingStep.IDLE && loadingStep !== LoadingStep.COMPLETE && !currentProject) {
      return (
          <div className="flex flex-col items-center justify-center h-screen bg-black text-zinc-900 dark:text-white relative overflow-hidden font-sans">
              
              {/* WebGL Animated Background */}
              <WebGLShader />

              <div className="relative z-10 animate-slide-up flex flex-col items-center">
                  <div className="w-[400px] h-[400px] bg-white/10 backdrop-blur-md dark:bg-black/40 rounded-[2.5rem] border border-white/20 dark:border-white/10 flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-2xl ring-1 ring-white/10">
                      
                      {/* Neon Glow behind spinner */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none"></div>

                      <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
                          
                          <div className="relative w-20 h-20 mb-8">
                             {/* Dark center, neon rim */}
                             <div className="absolute inset-0 border-4 border-white/10 dark:border-white/5 rounded-full"></div>
                             <div className="absolute inset-0 border-4 border-t-indigo-500 border-r-indigo-500/30 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_10px_#818cf8]"></div>
                             </div>
                          </div>

                          <h3 className="text-xl font-bold text-white mb-3 text-center animate-fade-in key={loadingMessageIndex}">
                              {LOADING_MESSAGES[loadingMessageIndex]}
                          </h3>
                          
                          <div className="px-4 py-1.5 bg-white/10 dark:bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                              <p className="text-[10px] text-zinc-300 font-mono tracking-widest uppercase">Orchestrating AI Agents...</p>
                          </div>

                          <div className="w-48 h-1 bg-white/10 dark:bg-zinc-800 rounded-full overflow-hidden mt-8">
                              <div className="h-full bg-indigo-500 w-1/3 animate-[shimmer_1.5s_infinite] rounded-full shadow-[0_0_10px_#6366f1]"></div>
                          </div>
                      </div>

                  </div>

                  <div className="mt-8 flex items-center gap-4">
                      {/* Estimated Time Box */}
                      <div className="h-[58px] px-5 bg-white/10 backdrop-blur-md dark:bg-black/40 border border-white/10 rounded-xl flex flex-col justify-center items-end min-w-[100px] shadow-lg">
                           <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider block text-right">Est. Time</span>
                           <span className="text-sm font-bold text-white font-mono block">~{timeLeft}s</span>
                      </div>

                      {/* Stop Button */}
                      <button 
                        onClick={handleStopGeneration}
                        className="group flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md dark:bg-black/40 border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 rounded-xl transition-all duration-300 shadow-lg min-w-[180px]"
                      >
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-red-500/20 group-hover:border-red-500/30 transition-colors">
                              <div className="w-2.5 h-2.5 bg-zinc-400 rounded-sm group-hover:bg-red-500 transition-colors"></div>
                          </div>
                          <div className="text-left">
                              <span className="block text-xs font-bold text-zinc-300 group-hover:text-red-400">Stop Generation</span>
                              <span className="block text-[9px] text-zinc-500 font-mono uppercase tracking-wider group-hover:text-red-400/60">Cancel Process</span>
                          </div>
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white overflow-hidden font-sans selection:bg-indigo-500/30">
      
      <aside 
        className={`bg-white dark:bg-black/95 backdrop-blur-xl border-r border-zinc-200 dark:border-white/5 flex flex-col py-6 z-20 shrink-0 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
            sidebarCollapsed ? 'w-20 items-center' : 'w-72'
        }`}
      >
        <div className={`px-6 mb-10 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 dark:from-white dark:to-zinc-400 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)]">
                    <Hexagon size={20} className="text-white dark:text-black fill-white dark:fill-black" />
                </div>
                {!sidebarCollapsed && <span className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">SaaS Val.</span>}
            </div>
            {!sidebarCollapsed && (
                <button onClick={() => setSidebarCollapsed(true)} className="p-2 rounded-lg text-zinc-500 dark:text-zinc-600 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all">
                    <PanelLeftClose size={18} />
                </button>
            )}
        </div>
        
        {sidebarCollapsed && (
            <button onClick={() => setSidebarCollapsed(false)} className="mb-8 p-2 rounded-lg text-zinc-500 dark:text-zinc-600 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all">
                <PanelLeftOpen size={20} />
            </button>
        )}

        <nav className="flex-1 space-y-1.5 px-3">
            {[
                { id: 'validation', label: 'Validation', icon: LayoutDashboard },
                { id: 'deepAnalysis', label: 'Deep Insights', icon: TrendingUp },
                { id: 'blueprint', label: 'Blueprint', icon: Map },
                { id: 'roadmap', label: 'Roadmap', icon: Trello },
                { id: 'techstack', label: 'Tech Stack', icon: Layers },
                { id: 'prd', label: 'PRD Docs', icon: FileText },
                { id: 'builder', label: 'AI Builder', icon: Terminal },
            ].map(item => {
                const isActive = activeTab === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as TabView)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                            isActive 
                            ? 'text-zinc-900 dark:text-white bg-zinc-200 dark:bg-white/5' 
                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5'
                        } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    >
                        <item.icon size={20} className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 text-indigo-500 dark:text-indigo-400' : 'group-hover:scale-110'}`} />
                        {!sidebarCollapsed && <span className={`font-medium text-sm relative z-10 tracking-wide ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>}
                        
                        {/* BETA Marker */}
                        {!sidebarCollapsed && (item.id === 'prd' || item.id === 'builder') && (
                            <span className="ml-auto text-[9px] font-bold bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 dark:border-indigo-500/30">BETA</span>
                        )}
                    </button>
                )
            })}

            <button
                onClick={() => setChatOpen(!chatOpen)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                    chatOpen 
                    ? 'text-zinc-900 dark:text-white bg-zinc-200 dark:bg-white/5' 
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
                <Bot size={20} className={`relative z-10 transition-transform duration-300 ${chatOpen ? 'scale-110 text-indigo-500 dark:text-indigo-400' : 'group-hover:scale-110'}`} />
                {!sidebarCollapsed && <span className={`font-medium text-sm relative z-10 tracking-wide ${chatOpen ? 'font-semibold' : ''}`}>AI Consultant</span>}
            </button>
        </nav>

        <div className="px-3 pt-4 mt-auto">
             <div className="my-4 border-t border-zinc-200 dark:border-white/5 mx-2"></div>
             <button 
                onClick={handleExitProject} 
                title="Exit Project"
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 hover:border-red-100 dark:hover:border-red-500/10 border border-transparent transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
             >
                <LogOut size={20} className="rotate-180" />
                {!sidebarCollapsed && <span className="font-medium text-sm">Exit Project</span>}
             </button>
        </div>
      </aside>

      <div className={`flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-black transition-all duration-500 ease-in-out ${chatOpen ? 'mr-0 lg:mr-[400px]' : ''}`}>
        
        <header className="h-20 border-b border-zinc-200 dark:border-white/5 bg-white/60 dark:bg-black/60 backdrop-blur-xl flex items-center justify-between px-8 z-10 shrink-0 sticky top-0 transition-all">
            <div className="flex items-center gap-4 animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-700 dark:text-white font-bold text-sm shadow-inner">
                    {getInitials(currentProject?.name || 'Pro Ject')}
                </div>
                <div className="flex flex-col justify-center">
                    <h1 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-md leading-tight">{currentProject?.name}</h1>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs text-zinc-500 font-medium">Active Session</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 relative animate-fade-in delay-100">
                <button onClick={handleDownloadPDF} className="p-2.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all">
                    <Download size={18} />
                </button>
                <div className="h-6 w-px bg-zinc-200 dark:bg-white/10"></div>
                
                {/* Updated Share Button */}
                <button 
                    onClick={() => setShareOpen(!shareOpen)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all backdrop-blur-md ${
                        shareOpen 
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' 
                        : 'bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20'
                    }`}
                >
                    <Share2 size={16} />
                    <span className="hidden sm:block">Share</span>
                </button>

                {shareOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShareOpen(false)}></div>
                        <div className="absolute top-full right-0 mt-4 w-80 glass rounded-xl z-20 overflow-hidden animate-slide-up origin-top-right p-1 shadow-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900">
                            <div className="p-4">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-4">Share Project</p>
                                <div className="grid grid-cols-4 gap-3 mb-4">
                                    <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out ${currentProject?.name}&url=${window.location.href}`, '_blank')} className="aspect-square rounded-xl bg-zinc-100 dark:bg-zinc-800/50 hover:bg-[#1DA1F2] text-zinc-400 hover:text-white transition-all flex items-center justify-center group border border-zinc-200 dark:border-zinc-800 hover:border-transparent">
                                        <Twitter size={20} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`, '_blank')} className="aspect-square rounded-xl bg-zinc-100 dark:bg-zinc-800/50 hover:bg-[#0077b5] text-zinc-400 hover:text-white transition-all flex items-center justify-center group border border-zinc-200 dark:border-zinc-800 hover:border-transparent">
                                        <Linkedin size={20} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')} className="aspect-square rounded-xl bg-zinc-100 dark:bg-zinc-800/50 hover:bg-[#4267B2] text-zinc-400 hover:text-white transition-all flex items-center justify-center group border border-zinc-200 dark:border-zinc-800 hover:border-transparent">
                                        <Facebook size={20} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button onClick={() => window.open(`mailto:?subject=${currentProject?.name}&body=Check out this project: ${window.location.href}`, '_blank')} className="aspect-square rounded-xl bg-zinc-100 dark:bg-zinc-800/50 hover:bg-emerald-500 text-zinc-400 hover:text-white transition-all flex items-center justify-center group border border-zinc-200 dark:border-zinc-800 hover:border-transparent">
                                        <Mail size={20} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                                <div className="bg-zinc-50 dark:bg-zinc-900/80 rounded-lg p-2 flex items-center gap-2 border border-zinc-200 dark:border-zinc-800/50">
                                    <LinkIcon size={14} className="text-zinc-500 shrink-0" />
                                    <input type="text" readOnly value={window.location.href} className="bg-transparent text-xs text-zinc-600 dark:text-zinc-400 w-full outline-none" />
                                    <button onClick={copyLink} className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors">{copied ? <Check size={14} /> : <Copy size={14} />}</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative p-6 lg:p-10 scroll-smooth bg-white dark:bg-black">
            <div className="hidden dark:block"><ParticleBackground /></div> 
            
            <div className="max-w-[1600px] mx-auto animate-slide-up">
                {activeTab === 'validation' && currentProject?.data.validation && <ValidationTab data={currentProject.data.validation} isDark={isDarkMode} />}
                {activeTab === 'deepAnalysis' && currentProject?.data.deepAnalysis && <DeepAnalysisTab data={currentProject.data.deepAnalysis} />}
                {activeTab === 'blueprint' && currentProject?.data.blueprint && <BlueprintTab data={currentProject.data.blueprint} isDark={isDarkMode} />}
                {activeTab === 'roadmap' && currentProject?.data.roadmap && <RoadmapTab data={currentProject.data.roadmap} onUpdate={(newData) => updateProjectData('roadmap', newData)} />}
                {activeTab === 'techstack' && currentProject?.data.techStack && <TechStackTab data={currentProject.data.techStack} />}
                {activeTab === 'prd' && currentProject && <PRDTab projectIdea={currentProject.description} existingPRD={currentProject.data.prd} onUpdate={(prd) => updateProjectData('prd', prd)} />}
                {activeTab === 'builder' && currentProject && <BuilderTab projectIdea={currentProject.description} savedData={currentProject.data.builder} onUpdate={(data) => updateProjectData('builder', data)} />}
            </div>
        </div>
      </div>
      
      {/* --- REDESIGNED AI CONSULTANT SIDEBAR --- */}
      <div 
        className={`fixed top-4 right-4 bottom-4 w-[450px] bg-white/95 dark:bg-black/80 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 rounded-3xl transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) z-50 flex flex-col shadow-2xl ${chatOpen ? 'translate-x-0' : 'translate-x-[120%]'}`}
      >
          {/* Header */}
          <div className="relative z-10 px-6 py-5 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white dark:bg-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-black">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                 </div>
                 <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-base tracking-tight">AI Architect</h3>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">Online • Strategy Mode</p>
                 </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="p-2 text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors">
                  <X size={18} />
              </button>
          </div>
          
          {/* Chat Area */}
          <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth bg-zinc-50/50 dark:bg-transparent">
              {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                      <div className="w-16 h-16 rounded-full bg-white dark:bg-white/5 flex items-center justify-center mb-6 ring-1 ring-zinc-200 dark:ring-white/10 shadow-[0_0_30px_-5px_rgba(0,0,0,0.05)] dark:shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)]">
                          <Sparkles size={24} className="text-indigo-500 dark:text-indigo-400" />
                      </div>
                      <h4 className="text-zinc-900 dark:text-white font-bold text-lg mb-2">Strategy Session</h4>
                      <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                          I have analyzed your project context. Ready to advise on go-to-market, tech stack, and risk mitigation.
                      </p>
                      
                      <div className="w-full space-y-2.5">
                          {SUGGESTED_QUESTIONS.map((q, i) => (
                             <button 
                                key={i}
                                onClick={() => { setChatInput(q); handleChatSend(q); }}
                                className="w-full text-left p-3.5 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 hover:shadow-md transition-all duration-300 group flex items-center justify-between"
                             >
                                <span className="text-xs text-zinc-600 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white font-medium">{q}</span>
                                <ArrowRight size={12} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                             </button>
                          ))}
                      </div>
                  </div>
              ) : (
                chatMessages.map((msg, idx) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`} style={{ animationDelay: `${idx * 50}ms` }}>
                        {msg.role === 'model' && (
                             <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mr-3 mt-1 shadow-lg shadow-indigo-500/20">
                                 <Bot size={12} className="text-white" />
                             </div>
                        )}
                        <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-black font-medium rounded-tr-none' 
                            : 'bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-zinc-200 rounded-tl-none backdrop-blur-md'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))
              )}
              {chatLoading && (
                 <div className="flex justify-start animate-fade-in">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mr-3 mt-1">
                         <Loader2 size={12} className="text-white animate-spin" />
                    </div>
                    <div className="bg-white dark:bg-zinc-800/50 px-3 py-2 rounded-2xl rounded-tl-none flex gap-1 items-center border border-zinc-200 dark:border-white/5">
                        <span className="w-1 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce"></span>
                        <span className="w-1 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce delay-200"></span>
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="relative z-10 p-4 bg-white/50 dark:bg-black/20 backdrop-blur-md border-t border-zinc-100 dark:border-white/5">
              <div className="relative bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 rounded-full p-1 flex items-center shadow-lg transition-all focus-within:ring-1 focus-within:ring-indigo-500/50 focus-within:bg-white dark:focus-within:bg-black focus-within:border-indigo-500/50">
                  <input 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                      placeholder="Ask follow-up question..."
                      className="w-full bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 px-4 py-2.5"
                  />
                  <button 
                    onClick={() => handleChatSend()}
                    disabled={!chatInput.trim() || chatLoading}
                    className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105 active:scale-95"
                  >
                    <ArrowRight size={16} />
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default App;
