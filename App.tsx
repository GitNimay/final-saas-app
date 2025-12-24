
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { User, Project, LoadingStep, TabView, Message, KanbanColumn, UserSettings } from './types';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { generateBlueprint, generateRoadmap, generateTechStack, generateValidation, generateConsultantReply, generateDeepAnalysis, generatePRD, enhancePrompt, generateActionPlan } from './services/aiService';
import { saveProject, getProjects, deleteProject, subscribeToProject, subscribeToMessages, getMessages, sendMessage, getUserSettings, saveUserSettings, syncUserProfile } from './services/projectService';
import ParticleBackground from './components/ui/ParticleBackground';
import { CelestialBloomShader } from './components/ui/CelestialBloomShader';
import DotMapBackground from './components/ui/DotMapBackground';
import ValidationTab from './components/tabs/ValidationTab';
import BlueprintTab from './components/tabs/BlueprintTab';
import RoadmapTab from './components/tabs/RoadmapTab';
import TechStackTab from './components/tabs/TechStackTab';
import PRDTab from './components/tabs/PRDTab';
import BuilderTab from './components/tabs/BuilderTab';
import DeepAnalysisTab from './components/tabs/DeepAnalysisTab';
import ActionPlanTab from './components/tabs/ActionPlanTab';
import UserMenu from './components/menus/UserMenu';
import SettingsModal from './components/modals/SettingsModal';
import ComparisonModal from './components/modals/ComparisonModal';
import LoginPage from './components/auth/LoginPage';
import { useNotification } from './contexts/NotificationContext';
import { Bot, ChevronRight, LayoutDashboard, Map, Trello, Layers, Settings, LogOut, Loader2, Sparkles, Send, Trash2, History, MessageSquarePlus, Mic, Plus, BarChart2, X, Paperclip, Share2, Copy, Check, Link as LinkIcon, ExternalLink, FileText, Terminal, TrendingUp, Download, PanelLeftClose, PanelLeftOpen, Hexagon, HelpCircle, Twitter, Facebook, Linkedin, Mail, Zap, CheckCircle2, MoreHorizontal, Square, StopCircle, ChevronDown, Lock, Wand2, ArrowRight, Clock, HelpCircle as HelpIcon, AlertCircle, Calendar, GitCompare } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { ReactLenis } from 'lenis/react';
import ShinyButton from './components/ui/ShinyButton';
import TextReveal from './components/ui/TextReveal';
import PageTransition from './components/ui/PageTransition';
import { AnimatePresence, motion } from 'framer-motion';
import GenerationVisuals from './components/ui/GenerationVisuals';

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
    // Router Hooks
    const navigate = useNavigate();
    const location = useLocation();

    // Notification Hook
    const { showNotification } = useNotification();

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
    const [actualProgress, setActualProgress] = useState(0); // Real progress 0-100
    const [visualProgress, setVisualProgress] = useState(0); // Smoothed progress for UI
    const [elapsedTime, setElapsedTime] = useState(0); // Elapsed time in seconds
    const hasShownWelcome = useRef(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

    // Model Dropdown State
    const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);

    // Suggestions State
    const SUGGESTION_POOL = [
        [
            { label: "Validate a niche CRM", icon: <CheckCircle2 size={14} /> },
            { label: "SaaS for Dog Walkers", icon: <Bot size={14} /> },
            { label: "Micro-SaaS Roadmap", icon: <Map size={14} /> },
        ],
        [
            { label: "AI-Powered Newsletter Tool", icon: <Sparkles size={14} /> },
            { label: "B2B Analytics Platform", icon: <BarChart2 size={14} /> },
            { label: "Developer productivity app", icon: <Terminal size={14} /> },
        ],
        [
            { label: "E-Learning for kids", icon: <Bot size={14} /> },
            { label: "Fitness Tracker SaaS", icon: <TrendingUp size={14} /> },
            { label: "Social Media Scheduler", icon: <Clock size={14} /> },
        ],
        [
            { label: "Invoice automation tool", icon: <FileText size={14} /> },
            { label: "Project Management Suite", icon: <Trello size={14} /> },
            { label: "Customer Feedback Portal", icon: <MessageSquarePlus size={14} /> },
        ],
        [
            { label: "Remote Team Collaboration", icon: <Bot size={14} /> },
            { label: "Content Generation AI", icon: <Sparkles size={14} /> },
            { label: "Email Marketing Platform", icon: <Mail size={14} /> },
        ],
    ];

    const [currentSuggestions, setCurrentSuggestions] = useState(() => {
        return SUGGESTION_POOL[Math.floor(Math.random() * SUGGESTION_POOL.length)];
    });
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshSuggestions = () => {
        if (isRefreshing) return; // Prevent multiple clicks during animation

        setIsRefreshing(true);

        // Wait for fade-out animation, then change suggestions
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * SUGGESTION_POOL.length);
            setCurrentSuggestions(SUGGESTION_POOL[randomIndex]);

            // Reset refreshing state after fade-in
            setTimeout(() => setIsRefreshing(false), 300);
        }, 200);
    };

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
                    hasShownWelcome.current = false; // Reset for next login
                } else if (_event === 'SIGNED_IN' && session?.user) {
                    initUser(session.user);
                    // Show welcome notification only once per login session
                    if (!hasShownWelcome.current) {
                        hasShownWelcome.current = true;
                        const userName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'there';
                        showNotification(`Welcome back, ${userName}! 🎉`, 'success', 5);
                    }
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

    // URL-based navigation sync - enables browser back/forward buttons
    useEffect(() => {
        const path = location.pathname;

        // If on home page, clear current project
        if (path === '/' || path === '') {
            if (currentProject) {
                setCurrentProject(null);
                setChatOpen(false);
            }
            return;
        }

        // If on project page, load the project from history
        const projectMatch = path.match(/^\/project\/(.+)$/);
        if (projectMatch && projectsHistory.length > 0) {
            const projectId = projectMatch[1];
            const project = projectsHistory.find(p => p.id === projectId);
            if (project && (!currentProject || currentProject.id !== projectId)) {
                setCurrentProject(project);
                setChatOpen(false);
            }
        }
    }, [location.pathname, projectsHistory]);

    const handleSignOut = async () => {
        if (supabase) await supabase.auth.signOut();
        setUser(null);
        setUserMenuOpen(false);
        navigate('/login');
    };

    const handleExitProject = () => {
        setCurrentProject(null);
        setChatOpen(false);
        setLoadingStep(LoadingStep.IDLE);
        navigate('/');
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
                if (!prev) return newPayload;
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

    // Elapsed Time Counter Effect
    useEffect(() => {
        if (loadingStep !== LoadingStep.IDLE && loadingStep !== LoadingStep.COMPLETE) {
            // Count up elapsed time instead of down
            const timer = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [loadingStep]);

    // Smooth Progress Effect
    useEffect(() => {
        if (loadingStep === LoadingStep.IDLE) {
            setVisualProgress(0);
            return;
        }

        // If actual progress jumps, we smoothly animate towards it
        // We also want to "fake" some progress if it's stuck waiting for the next step
        const interval = setInterval(() => {
            setVisualProgress(current => {
                const diff = actualProgress - current;

                // If we are far behind actual, catch up faster
                if (diff > 0) {
                    // Catch up logic
                    return current + Math.max(0.5, diff * 0.1);
                }

                // If we are at the actual progress, but waiting for next step,
                // slowly creep up but don't exceed next milestone too much (e.g. don't go to 40 if at 20)
                // Actually, the actualProgress is the "floor" of the current step.
                // e.g. Step 1 done = 20%. We wait for Step 2.
                // We can creep up to 35% maybe while waiting?
                // Let's just strictly follow actualProgress for now but smooth the transition.
                // Or better: Let's creep up to 'actualProgress + 15' while waiting.

                const targetShadow = actualProgress + 18; // Don't hit the next 20% mark fully
                if (current < targetShadow && loadingStep !== LoadingStep.COMPLETE) {
                    return current + 0.05; // Very slow creep
                }

                return current;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [actualProgress, loadingStep]);

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
            // Resize textarea after enhancement
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
                }
            }, 0);
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
        setActualProgress(0); // Reset progress at start
        setVisualProgress(0);
        setElapsedTime(0); // Reset elapsed time
        setLoadingStep(LoadingStep.ANALYZING);
        setChatOpen(false);
        setLoadingMessageIndex(0);

        // Show project initialization notification
        showNotification('Project initialization started...', 'info', 5);

        try {
            if (stopGeneration.current) return;
            const validation = await generateValidation(inputToUse);
            setActualProgress(20); // Step 1 complete: 20%

            if (stopGeneration.current) return;
            setLoadingStep(LoadingStep.DEEP_DIVING);
            const deepAnalysis = await generateDeepAnalysis(inputToUse);
            setActualProgress(40); // Step 2 complete: 40%

            if (stopGeneration.current) return;
            setLoadingStep(LoadingStep.BLUEPRINTING);
            const blueprint = await generateBlueprint(inputToUse);
            setActualProgress(60); // Step 3 complete: 60%

            if (stopGeneration.current) return;
            setLoadingStep(LoadingStep.ROADMAPPING);
            const roadmap = await generateRoadmap(inputToUse);
            setActualProgress(80); // Step 4 complete: 80%

            if (stopGeneration.current) return;
            setLoadingStep(LoadingStep.COMPILING);
            const [techStack, prd] = await Promise.all([
                generateTechStack(inputToUse),
                generatePRD(inputToUse)
            ]);
            setActualProgress(100); // Step 5 complete: 100%

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
            navigate(`/project/${newProject.id}`);
            await sendMessage(newProject.id, 'model', `Hello! I've analyzed "${inputToUse}". I'm ready to discuss your strategy.`);

            // Show project created notification
            showNotification(`Project "${projectName}" created successfully! 🚀`, 'success', 5);

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
        if (!text.trim() || !currentProject) return;

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
            <ReactLenis root>
                <div className="relative w-full min-h-screen overflow-x-hidden bg-white dark:bg-black flex font-sans text-zinc-900 dark:text-white selection:bg-indigo-500/30 transition-colors duration-300">
                    {/* ... existing content ... */}
                    {/* I need to make sure I am wrapping the correct outer div or replacing it to be scrollable if Lenis takes over */}
                    {/* Lenis typically works on the window/body. If overflow is hidden on h-screen, Lenis might not work if it expects body scroll. */}
                    {/* The current layout has `overflow-hidden` on the outer div and `overflow-y-auto` on `.custom-scrollbar` sidebar and maybe the main content? */}
                    {/* Looking at line 636: `flex-1 flex flex-col ...` it doesn't seem to have overflow-y-auto explicitly on the main content area itself, but maybe it relies on body? */}
                    {/* Line 123 in index.html says `overflow: hidden` on body. */}
                    {/* If body is hidden, Lenis cannot scroll the body. */}
                    {/* Detailed check: The sidebar is fixed. The main content is `flex-1`. */}
                    {/* If the main content is intended to scroll, it needs overflow-y-auto. */}
                    {/* BUT, the user wants "smooth scrolling". Usually that implies the whole page or the main container. */}
                    {/* I will assume the main content div (line 636) should be the scroll container or I should let the body scroll. */}
                    {/* Given the structure, I will wrap the *Application* return with ReactLenis, but I'll need to remove `overflow: hidden` from body if I want global scroll, OR configure Lenis for a specific wrapper. */}
                    {/* For now, let's wrap the outermost div but change `h-screen overflow-hidden` to `min-h-screen` to allow scrolling if content overflows? */}
                    {/* Actually, looking at the layout, it seems like a dashboard with fixed sidebar. Smooth scroll on the *main content area* is probably what is desired. */}
                    {/* I will wrap the Main Content Area (line 636) with a customized Lenis or just ensure it is scrollable. */}
                    {/* However, `ReactLenis root` implies it takes over the root html scroll. */}
                    {/* Let's try wrapping the whole return and see. But let's fix the imports first as per this tool call plan. */}

                    {/* Celestial Bloom Shader is now used as the main background */}


                    <div className="fixed top-6 right-6 z-50 animate-fade-in delay-100">
                        <button
                            onClick={() => window.open('https://github.com/GitNimay', '_blank')}
                            className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all text-xs font-semibold shadow-xl backdrop-blur-md"
                        >
                            <Sparkles size={14} className="text-zinc-400 group-hover:text-yellow-400 transition-colors" />
                            <span>Support</span>
                        </button>
                    </div>

                    {
                        !showHistorySidebar && (
                            <div className="fixed top-6 left-6 z-50 animate-fade-in">
                                <button
                                    onClick={() => setShowHistorySidebar(true)}
                                    className="p-3 rounded-xl bg-white/80 dark:bg-black/40 border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-600 transition-all backdrop-blur-md shadow-lg"
                                >
                                    <PanelLeftOpen size={20} />
                                </button>
                            </div>
                        )
                    }

                    {/* Mobile Sidebar Overlay */}
                    <div
                        className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300 ${showHistorySidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        onClick={() => setShowHistorySidebar(false)}
                    />

                    <div className={`fixed left-0 top-0 h-full w-72 md:w-80 bg-white/70 dark:bg-black/60 backdrop-blur-2xl border-r border-white/20 dark:border-white/5 p-4 md:p-6 flex flex-col z-40 transition-transform duration-500 shadow-[20px_0_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-none ${showHistorySidebar ? 'translate-x-0' : '-translate-x-full'}`}>

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

                        <div className="flex items-center justify-between mb-4 pl-1">
                            <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                                Project History
                            </div>
                            {projectsHistory.length >= 2 && (
                                <button
                                    onClick={() => setComparisonModalOpen(true)}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all text-[10px] font-bold"
                                    title="Compare Projects"
                                >
                                    <GitCompare size={12} />
                                    Compare
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-2" data-lenis-prevent>
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
                                                    onClick={() => { setCurrentProject(p); setChatOpen(false); navigate(`/project/${p.id}`); }}
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
                        <CelestialBloomShader />
                        <div className="flex flex-col items-center justify-center max-w-2xl w-full px-4 text-center z-10 relative">
                            <TextReveal
                                text={`Good to See You, ${userSettings.displayName.split(' ')[0]}!`}
                                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight drop-shadow-lg justify-center"
                                delay={0.2}
                            />


                            <div className="mb-4 sm:mb-6">
                                <TextReveal
                                    text="How can I help validate your idea?"
                                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-zinc-600 dark:text-zinc-300 drop-shadow-md justify-center"
                                    delay={0.8}
                                />
                            </div>

                            <p className="text-zinc-500 dark:text-zinc-400 mb-10 font-light text-sm">
                                I'm available 24/7 to generate blueprints, roadmaps & strategies.
                            </p>

                            <div className="w-full max-w-2xl relative mb-8 animate-slide-up delay-200">
                                <div className="relative flex items-start bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl dark:shadow-2xl transition-all focus-within:ring-1 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/50 group overflow-hidden min-h-[64px]">

                                    <textarea
                                        ref={textareaRef}
                                        value={ideaInput}
                                        onChange={(e) => {
                                            setIdeaInput(e.target.value);
                                            // Auto-resize textarea
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSpark();
                                            }
                                        }}
                                        placeholder="Ask anything..."
                                        className="w-full bg-transparent border-none outline-none text-base text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 py-5 pl-6 pr-32 font-medium resize-none overflow-hidden min-h-[64px] max-h-[200px]"
                                        autoFocus
                                        rows={1}
                                        style={{ height: 'auto' }}
                                    />

                                    <div className="absolute right-2 top-3 flex items-center gap-2">
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

                            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 animate-fade-in delay-300">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentSuggestions[0].label}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
                                    >
                                        {currentSuggestions.map((suggestion, i) => (
                                            <motion.div
                                                key={suggestion.label}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05, duration: 0.2 }}
                                            >
                                                <ShinyButton
                                                    onClick={() => handleSpark(suggestion.label)}
                                                    icon={suggestion.icon}
                                                    className="bg-zinc-900/50 hover:bg-zinc-800/50 backdrop-blur-md border-zinc-800"
                                                >
                                                    {suggestion.label}
                                                </ShinyButton>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Refresh Button */}
                                <button
                                    onClick={refreshSuggestions}
                                    disabled={isRefreshing}
                                    className="group relative inline-flex items-center gap-2 p-3 rounded-xl text-zinc-100 border hover:border-zinc-600 transition-all duration-300 shadow-lg shadow-black/20 overflow-hidden bg-zinc-900/50 hover:bg-zinc-800/50 backdrop-blur-md border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Refresh suggestions"
                                    tabIndex={0}
                                >
                                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"></div>
                                    <div className="relative z-10 flex items-center gap-2">
                                        <motion.span
                                            className="text-zinc-400 group-hover:text-white transition-colors"
                                            animate={{ rotate: isRefreshing ? 360 : 0 }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw" aria-hidden="true">
                                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                                                <path d="M21 3v5h-5"></path>
                                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                                                <path d="M3 21v-5h5"></path>
                                            </svg>
                                        </motion.span>
                                    </div>
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>
                            </div>

                            <div className="fixed bottom-6 text-[10px] text-zinc-400 dark:text-zinc-500 animate-fade-in delay-500">
                                Unlock new era with SaaS Validator. <span className="underline cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300">share us</span>
                            </div>

                        </div >
                    </div >

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

                    {
                        user && (
                            <SettingsModal
                                isOpen={settingsModalOpen}
                                onClose={() => setSettingsModalOpen(false)}
                                user={user}
                                settings={userSettings}
                                onUpdateSettings={handleUpdateSettings}
                            />
                        )
                    }

                    {/* Comparison Modal */}
                    <ComparisonModal
                        isOpen={comparisonModalOpen}
                        onClose={() => setComparisonModalOpen(false)}
                        projects={projectsHistory}
                    />

                </div >
            </ReactLenis >
        );
    }

    if (loadingStep !== LoadingStep.IDLE && loadingStep !== LoadingStep.COMPLETE && !currentProject) {
        return (

            <div className="flex flex-col items-center justify-center h-screen bg-black text-white relative overflow-hidden font-sans">

                {/* Dot Map Background */}
                <DotMapBackground />

                {/* Main Card */}
                <div className="relative z-10 flex flex-col items-center w-full max-w-6xl px-4">

                    {/* Content Row */}
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full">

                        {/* LEFT: Visuals Carousel */}
                        <div className="flex-shrink-0 relative z-20">
                            <GenerationVisuals
                                currentStep={Math.floor(visualProgress / 20)}
                                stepId={loadingStep}
                            />
                        </div>

                        {/* RIGHT: Progress & Message */}
                        <div className="flex flex-col items-center lg:items-start w-full max-w-[500px] relative z-20">

                            {/* Message Heading */}
                            <div className="text-center lg:text-left mb-6">
                                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
                                    {LOADING_MESSAGES[loadingMessageIndex]}
                                </h3>
                                <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                    <p className="text-[10px] text-zinc-400 font-mono tracking-[0.2em] uppercase">
                                        Orchestrating AI Agents...
                                    </p>
                                </div>
                            </div>

                            {/* Reference-style Progress Card */}
                            <div className="w-full bg-[#09090b] border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                                {/* Glossy top highlight */}
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mb-1">Your Progress</p>
                                        <h4 className="text-3xl font-bold text-white flex items-center gap-2">
                                            {Math.min(100, Math.floor(visualProgress))}%
                                            <span className="text-zinc-600 text-lg font-medium">Complete</span>
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800/50">
                                        <Clock size={12} />
                                        <span className="text-xs font-mono">{elapsedTime}s Elapsed</span>
                                    </div>
                                </div>

                                {/* Bar Container */}
                                <div className="h-5 w-full bg-zinc-900/50 rounded-full overflow-hidden border border-zinc-800/50 p-[3px]">
                                    {/* Blue bar with real progress */}
                                    <div
                                        className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-75 linear relative overflow-hidden"
                                        style={{ width: `${Math.min(100, visualProgress)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                                    </div>
                                </div>

                                {/* Step indicator */}
                                <div className="mt-5 flex items-center justify-between text-[10px] text-zinc-500 font-medium uppercase tracking-wide">
                                    <span>Step {Math.min(5, Math.floor(visualProgress / 20) + 1)} of 5</span>
                                    <span className="text-zinc-400">{loadingStep}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Controls (Cancel Button) */}
                    <div className="mt-16 flex items-center justify-center animate-fade-in relative z-30">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleStopGeneration}
                            className="group flex items-center gap-3 px-8 py-3 rounded-full bg-black/40 hover:bg-black/60 border border-zinc-800 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all duration-300 backdrop-blur-md"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-zinc-400 group-hover:text-red-400 text-sm font-medium transition-colors">Cancel Generation</span>
                        </motion.button>
                    </div>

                </div>


            </div>
        )
    }


    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white overflow-hidden font-sans selection:bg-indigo-500/30">

            {/* Mobile Sidebar Toggle Button */}
            <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white/90 dark:bg-black/90 backdrop-blur-md border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all shadow-lg"
            >
                {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-20 transition-opacity duration-300 ${!sidebarCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setSidebarCollapsed(true)}
            />

            <aside
                className={`fixed md:relative h-full bg-white dark:bg-black/95 backdrop-blur-xl border-r border-zinc-200 dark:border-white/5 flex flex-col py-6 z-30 shrink-0 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${sidebarCollapsed ? 'w-20 items-center -translate-x-full md:translate-x-0' : 'w-72 translate-x-0'
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
                        { id: 'actionPlan', label: '30-Day Plan', icon: Calendar },
                        { id: 'techstack', label: 'Tech Stack', icon: Layers },
                        { id: 'prd', label: 'PRD Docs', icon: FileText },
                        { id: 'builder', label: 'AI Builder', icon: Terminal },
                    ].map(item => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as TabView)}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative group overflow-hidden ${isActive
                                    ? 'text-zinc-900 dark:text-white bg-zinc-200 dark:bg-white/5'
                                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5'
                                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                            >
                                <item.icon size={20} className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 text-indigo-500 dark:text-indigo-400' : 'group-hover:scale-110'}`} />
                                {!sidebarCollapsed && <span className={`font-medium text-sm relative z-10 tracking-wide ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>}

                                {/* BETA/NEW Marker */}
                                {!sidebarCollapsed && (item.id === 'prd' || item.id === 'builder') && (
                                    <span className="ml-auto text-[9px] font-bold bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 dark:border-indigo-500/30">BETA</span>
                                )}
                                {!sidebarCollapsed && item.id === 'actionPlan' && (
                                    <span className="ml-auto text-[9px] font-bold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 dark:border-emerald-500/30">NEW</span>
                                )}
                            </button>
                        )
                    })}

                    <button
                        onClick={() => setChatOpen(!chatOpen)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative group overflow-hidden ${chatOpen
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
                            <h1 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 truncate max-w-[120px] sm:max-w-[200px] md:max-w-md leading-tight">{currentProject?.name}</h1>
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
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all backdrop-blur-md ${shareOpen
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

                    <div className="max-w-[1600px] mx-auto">
                        <AnimatePresence mode="wait">
                            {activeTab === 'validation' && currentProject?.data.validation && (
                                <PageTransition key="validation" variant="slideUp">
                                    <ValidationTab data={currentProject.data.validation} isDark={isDarkMode} />
                                </PageTransition>
                            )}
                            {activeTab === 'deepAnalysis' && currentProject?.data.deepAnalysis && (
                                <PageTransition key="deepAnalysis" variant="slideUp">
                                    <DeepAnalysisTab data={currentProject.data.deepAnalysis} />
                                </PageTransition>
                            )}
                            {activeTab === 'blueprint' && currentProject?.data.blueprint && (
                                <PageTransition key="blueprint" variant="slideUp">
                                    <BlueprintTab data={currentProject.data.blueprint} isDark={isDarkMode} />
                                </PageTransition>
                            )}
                            {activeTab === 'roadmap' && currentProject?.data.roadmap && (
                                <PageTransition key="roadmap" variant="slideUp">
                                    <RoadmapTab data={currentProject.data.roadmap} onUpdate={(newData) => updateProjectData('roadmap', newData)} />
                                </PageTransition>
                            )}
                            {activeTab === 'actionPlan' && currentProject && (
                                <PageTransition key="actionPlan" variant="slideUp">
                                    <ActionPlanTab projectIdea={currentProject.description} existingData={currentProject.data.actionPlan} onUpdate={(data) => updateProjectData('actionPlan', data)} />
                                </PageTransition>
                            )}
                            {activeTab === 'techstack' && currentProject?.data.techStack && (
                                <PageTransition key="techstack" variant="slideUp">
                                    <TechStackTab data={currentProject.data.techStack} />
                                </PageTransition>
                            )}
                            {activeTab === 'prd' && currentProject && (
                                <PageTransition key="prd" variant="slideUp">
                                    <PRDTab projectIdea={currentProject.description} existingPRD={currentProject.data.prd} onUpdate={(prd) => updateProjectData('prd', prd)} />
                                </PageTransition>
                            )}
                            {activeTab === 'builder' && currentProject && (
                                <PageTransition key="builder" variant="slideUp">
                                    <BuilderTab projectIdea={currentProject.description} savedData={currentProject.data.builder} onUpdate={(data) => updateProjectData('builder', data)} />
                                </PageTransition>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* --- REDESIGNED AI CONSULTANT SIDEBAR --- */}
            <div
                className={`fixed top-0 right-0 bottom-0 w-full sm:top-4 sm:right-4 sm:bottom-4 sm:w-[400px] md:w-[450px] bg-white/95 dark:bg-black/80 backdrop-blur-2xl border-0 sm:border border-zinc-200 dark:border-white/10 sm:rounded-3xl transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) z-50 flex flex-col shadow-2xl ${chatOpen ? 'translate-x-0' : 'translate-x-full'}`}
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
                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
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
