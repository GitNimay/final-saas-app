
import React, { useState, useEffect } from 'react';
import { generateBuilderPrompt, ModelConfig } from '../../services/aiService';
import { ArrowRight, Check, Code, Database, Globe, Layout, Lock, Server, Terminal, Copy, Loader2, Sparkles, ChevronLeft, Layers, Play, Settings } from 'lucide-react';

interface Props {
  projectIdea: string;
  savedData?: { prompt: string; answers: Record<string, string> };
  onUpdate: (data: { prompt: string; answers: Record<string, string> }) => void;
  selectedModel: ModelConfig;
}

const QUESTIONS = [
  {
    id: 'frontend',
    question: "Which frontend framework do you prefer?",
    icon: Layout,
    multi: false,
    options: [
      { label: 'React (Vite)', desc: 'Fast, standard SPA.', icon: '⚛️' },
      { label: 'Next.js', desc: 'Fullstack, SEO ready.', icon: '▲' },
      { label: 'Vue.js', desc: 'Approachable & versatile.', icon: '💚' },
      { label: 'Svelte', desc: 'Cybernetically enhanced.', icon: '🧡' },
    ]
  },
  {
    id: 'styling',
    question: "Preferred styling solution?",
    icon: Sparkles,
    multi: false,
    options: [
      { label: 'Tailwind CSS', desc: 'Utility-first speed.', icon: '🎨' },
      { label: 'CSS Modules', desc: 'Scoped classic CSS.', icon: '📦' },
      { label: 'Styled Components', desc: 'CSS-in-JS.', icon: '💅' },
      { label: 'Shadcn UI', desc: 'Copy-paste components.', icon: '🧱' },
    ]
  },
  {
    id: 'backend',
    question: "What's your backend strategy?",
    icon: Server,
    multi: false,
    options: [
      { label: 'Node.js (Express)', desc: 'Classic, flexible.', icon: '🟢' },
      { label: 'Python (FastAPI)', desc: 'Great for AI/Data.', icon: '🐍' },
      { label: 'Serverless (Next API)', desc: 'Low ops, scalable.', icon: '☁️' },
      { label: 'Go (Gin)', desc: 'High performance.', icon: '🐹' },
    ]
  },
  {
    id: 'database',
    question: "Choose your database engine",
    icon: Database,
    multi: false,
    options: [
      { label: 'PostgreSQL', desc: 'Relational standard.', icon: '🐘' },
      { label: 'MongoDB', desc: 'Flexible JSON docs.', icon: '🍃' },
      { label: 'MySQL', desc: 'Tried and true.', icon: '🐬' },
      { label: 'SQLite', desc: 'Simple, local/edge.', icon: '🪶' },
    ]
  },
  {
    id: 'auth',
    question: "How will users authenticate?",
    icon: Lock,
    multi: false,
    options: [
      { label: 'Supabase Auth', desc: 'Integrated & easy.', icon: '⚡' },
      { label: 'NextAuth.js', desc: 'Flexible for Next.js.', icon: '🛡️' },
      { label: 'Clerk', desc: 'Drop-in complete UI.', icon: '👤' },
      { label: 'Firebase Auth', desc: 'Google ecosystem.', icon: '🔥' },
    ]
  },
  {
    id: 'testing',
    question: "Testing Frameworks (Select all that apply)",
    icon: Play,
    multi: true,
    options: [
      { label: 'Jest', desc: 'Unit testing standard.', icon: '🃏' },
      { label: 'Cypress', desc: 'E2E testing.', icon: '🌲' },
      { label: 'Playwright', desc: 'Modern E2E.', icon: '🎭' },
      { label: 'Vitest', desc: 'Fast unit tests.', icon: '⚡' },
    ]
  },
  {
    id: 'state',
    question: "State Management",
    icon: Layers,
    multi: false,
    options: [
      { label: 'React Context', desc: 'Built-in simple state.', icon: '⚛️' },
      { label: 'Zustand', desc: 'Minimalist store.', icon: '🐻' },
      { label: 'Redux Toolkit', desc: 'Enterprise standard.', icon: '🟣' },
      { label: 'Recoil', desc: 'Atomic state.', icon: '🌀' },
    ]
  },
  {
    id: 'deployment',
    question: "Where will this live?",
    icon: Globe,
    multi: false,
    options: [
      { label: 'Vercel', desc: 'Best for Next/React.', icon: '▲' },
      { label: 'AWS', desc: 'Enterprise standard.', icon: '🟧' },
      { label: 'Docker/Self', desc: 'Total control.', icon: '🐳' },
      { label: 'Netlify', desc: 'Fast edge deploy.', icon: '💠' },
    ]
  },
  {
    id: 'cicd',
    question: "CI/CD Pipeline",
    icon: Settings,
    multi: false,
    options: [
      { label: 'GitHub Actions', desc: 'Integrated with repo.', icon: '🐙' },
      { label: 'GitLab CI', desc: 'Robust DevOps.', icon: '🦊' },
      { label: 'CircleCI', desc: 'Specialized CI.', icon: '⭕' },
      { label: 'None', desc: 'Manual deploy.', icon: '🚫' },
    ]
  }
];

const BuilderTab: React.FC<Props> = ({ projectIdea, savedData, onUpdate, selectedModel }) => {
  // Initialize step based on how many answers we already have
  const initialAnswers = savedData?.answers || {};
  const initialStep = Object.keys(initialAnswers).length > 0 
    ? Math.min(Object.keys(initialAnswers).length, QUESTIONS.length) 
    : 0;

  const [step, setStep] = useState(savedData?.prompt ? QUESTIONS.length : initialStep);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(initialAnswers);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState(savedData?.prompt || '');
  const [copied, setCopied] = useState(false);

  // Sync current selection when step changes or answers load
  const [currentSelection, setCurrentSelection] = useState<string | string[]>(
    answers[QUESTIONS[step]?.id] || (QUESTIONS[step]?.multi ? [] : '')
  );

  // Reset selection on step change
  useEffect(() => {
      if (step < QUESTIONS.length) {
          const qId = QUESTIONS[step].id;
          const existing = answers[qId];
          // Ensure arrays for multi-select
          if (QUESTIONS[step].multi) {
              if (existing) {
                  setCurrentSelection(Array.isArray(existing) ? existing : existing.split(','));
              } else {
                  setCurrentSelection([]);
              }
          } else {
              setCurrentSelection(existing || '');
          }
      }
  }, [step, answers]);

  const saveProgress = (newAnswers: Record<string, string | string[]>, currentPrompt: string = '') => {
      // Convert arrays to strings for storage if needed, but we keep flexible
      // We need to cast our rich structure to the simpler one expected by parent
      const storageAnswers: Record<string, string> = {};
      Object.entries(newAnswers).forEach(([k, v]) => {
          storageAnswers[k] = Array.isArray(v) ? v.join(',') : v;
      });
      
      onUpdate({ prompt: currentPrompt, answers: storageAnswers });
  };

  const handleOptionToggle = (optionLabel: string, isMulti: boolean) => {
    let newSelection: string | string[];

    if (isMulti) {
      const current = Array.isArray(currentSelection) ? currentSelection : [];
      if (current.includes(optionLabel)) {
        newSelection = current.filter(item => item !== optionLabel);
      } else {
        newSelection = [...current, optionLabel];
      }
    } else {
      newSelection = optionLabel;
    }
    
    setCurrentSelection(newSelection);
  };

  const handleNext = () => {
    const q = QUESTIONS[step];
    
    // Save answer
    const newAnswers = { ...answers, [q.id]: currentSelection };
    setAnswers(newAnswers);
    
    // Save to DB immediately
    saveProgress(newAnswers, prompt);

    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      // Finished all questions
      generatePrompt(newAnswers);
    }
  };

  const generatePrompt = async (finalAnswers: Record<string, string | string[]>) => {
      setStep(QUESTIONS.length); // Show loading/result view
      setLoading(true);
      try {
          // Map IDs back to readable keys for the AI prompt
          const readableAnswers: Record<string, string> = {};
          
          Object.entries(finalAnswers).forEach(([key, value]) => {
             const question = QUESTIONS.find(q => q.id === key);
             const label = question ? question.question : key;
             readableAnswers[label] = Array.isArray(value) ? value.join(', ') : value;
          });

          const result = await generateBuilderPrompt(projectIdea, readableAnswers, selectedModel);
          setPrompt(result);
          
          // Save Final Result to DB
          saveProgress(finalAnswers, result);

      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
      setStep(0);
      setAnswers({});
      setPrompt('');
      setCurrentSelection(QUESTIONS[0].multi ? [] : '');
      // Clear data in DB
      saveProgress({}, '');
  };

  // --- RENDER RESULT ---
  if (step === QUESTIONS.length) {
      return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-fade-in pb-10">
            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                    <div className="relative w-20 h-20 mb-6">
                        <div className="absolute inset-0 border-4 border-zinc-200 dark:border-zinc-800 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        <Code className="absolute inset-0 m-auto text-zinc-400 dark:text-zinc-600" size={24} />
                    </div>
                    <h3 className="text-xl font-medium text-zinc-900 dark:text-white mb-2">Generating Builder Prompt...</h3>
                    <p className="text-sm opacity-60">Crafting instructions for Cursor/Windsurf.</p>
                </div>
            ) : (
                <>
                   <div className="flex items-center justify-between mb-6 shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Terminal size={20} className="text-emerald-500" /> Builder Prompt Ready
                            </h2>
                            <p className="text-xs text-zinc-500 mt-1">Copy this into Cursor Composer or Windsurf Cascade to build your app.</p>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={reset}
                                className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                            >
                                Retake Quiz
                            </button>
                            <button 
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all text-xs font-bold"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied' : 'Copy Prompt'}
                            </button>
                        </div>
                   </div>

                   <div className="flex-1 relative bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xl dark:shadow-2xl flex flex-col">
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
                       <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                           <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed selection:bg-emerald-500/30">
                               {prompt}
                           </pre>
                       </div>
                   </div>
                </>
            )}
        </div>
      );
  }

  // --- RENDER QUIZ ---
  const currentQ = QUESTIONS[step];
  const Icon = currentQ.icon;
  const isMulti = currentQ.multi;
  const isSelected = (label: string) => {
      if (isMulti && Array.isArray(currentSelection)) {
          return currentSelection.includes(label);
      }
      return currentSelection === label;
  };
  const canContinue = isMulti 
    ? (Array.isArray(currentSelection) && currentSelection.length > 0)
    : !!currentSelection;

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] animate-fade-in max-w-2xl mx-auto w-full px-4">
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-900 rounded-full mb-12 relative overflow-hidden">
            <div 
                className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-500 ease-out"
                style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
            ></div>
        </div>

        {/* Question Card */}
        <div className="w-full">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-6 shadow-xl shadow-indigo-500/10">
                    <Icon size={24} className="text-indigo-500 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">{currentQ.question}</h2>
                {isMulti && <p className="text-indigo-500 dark:text-indigo-400 text-xs font-medium uppercase tracking-wider">Select Multiple</p>}
                <p className="text-zinc-500 text-sm mt-2">Step {step + 1} of {QUESTIONS.length}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {currentQ.options.map((opt, idx) => {
                    const active = isSelected(opt.label);
                    return (
                        <button
                            key={idx}
                            onClick={() => handleOptionToggle(opt.label, isMulti)}
                            className={`
                                group relative p-4 rounded-xl border text-left transition-all duration-200 shadow-sm
                                ${active 
                                    ? 'bg-indigo-50 dark:bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                                    : 'bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                }
                            `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-2xl mb-2 block">{opt.icon}</span>
                                {active && (
                                    <div className="bg-indigo-500 rounded-full p-0.5">
                                        <Check size={12} className="text-white" />
                                    </div>
                                )}
                            </div>
                            <div className={`font-semibold text-sm transition-colors ${active ? 'text-indigo-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white'}`}>{opt.label}</div>
                            <div className="text-xs text-zinc-500 mt-1">{opt.desc}</div>
                        </button>
                    )
                })}
            </div>

            <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-800/50 pt-6">
                <button 
                    onClick={() => {
                        if (step > 0) {
                            setStep(s => s - 1);
                        }
                    }}
                    disabled={step === 0}
                    className="flex items-center gap-2 text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white disabled:opacity-0 transition-colors text-sm font-medium"
                >
                    <ChevronLeft size={16} /> Back
                </button>
                
                <button 
                    onClick={handleNext}
                    disabled={!canContinue}
                    className={`
                        flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg
                        ${canContinue 
                            ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200' 
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed shadow-none'
                        }
                    `}
                >
                    {step === QUESTIONS.length - 1 ? 'Generate Prompt' : 'Next Question'}
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>

    </div>
  );
};

export default BuilderTab;
