
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, FileText, Loader2, RefreshCw } from 'lucide-react';
import { generatePRD } from '../../services/aiService';
import AnimatedSection from '../ui/AnimatedSection';

interface Props {
  projectIdea: string;
  existingPRD?: string;
  onUpdate: (prd: string) => void;
}

const PRDTab: React.FC<Props> = ({ projectIdea, existingPRD, onUpdate }) => {
  const [content, setContent] = useState(existingPRD || '');
  const [loading, setLoading] = useState(!existingPRD);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!content && projectIdea) {
      handleGenerate();
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const prd = await generatePRD(projectIdea);
      setContent(prd);
      onUpdate(prd);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500 animate-fade-in">
        <Loader2 size={32} className="animate-spin mb-4 text-indigo-500" />
        <p className="text-sm font-medium">Drafting Product Requirements...</p>
        <p className="text-xs opacity-50 mt-2">Analyzing features, user flows, and specifications.</p>
      </div>
    );
  }

  return (
    <AnimatedSection className="max-w-4xl mx-auto pb-10 h-[calc(100vh-140px)] flex flex-col" blur={true} delay={0.1}>
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-zinc-800 dark:text-zinc-200 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
          <FileText size={16} className="text-indigo-500 dark:text-indigo-400" /> Product Requirements Document
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-xs font-medium shadow-sm"
          >
            <RefreshCw size={14} /> Regenerate
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-600/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 transition-all text-xs font-medium shadow-sm"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy PRD'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-xl">
        <article className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-zinc-900 dark:prose-headings:text-white prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-strong:text-zinc-900 dark:prose-strong:text-white prose-ul:text-zinc-600 dark:prose-ul:text-zinc-400">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-2xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-2" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-200 mt-8 mb-4 flex items-center gap-2" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-base font-medium text-zinc-800 dark:text-zinc-200 mt-6 mb-2" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 space-y-1" {...props} />,
              li: ({ node, ...props }) => <li className="pl-1" {...props} />,
              p: ({ node, ...props }) => <p className="leading-relaxed mb-4" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </AnimatedSection>
  );
};

export default PRDTab;
