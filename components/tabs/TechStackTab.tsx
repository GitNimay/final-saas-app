
import React from 'react';
import { TechStackData } from '../../types';
import { ExternalLink, Layers, ArrowUpRight, Code, Database, Server, Globe } from 'lucide-react';
import AnimatedSection from '../ui/AnimatedSection';
import { motion } from 'framer-motion';

interface Props {
  data: TechStackData;
}

const DEFAULT_COLORS: Record<string, string> = {
  react: '#61DAFB', vue: '#4FC08D', nextjs: '#000000', flutter: '#02569B', figma: '#F24E1E',
  python: '#3776AB', node: '#339933', nodejs: '#339933', postgresql: '#4169E1', postgres: '#4169E1',
  supabase: '#3ECF8E', typescript: '#3178C6', javascript: '#F7DF1E', html: '#E34F26', css: '#1572B6',
  aws: '#FF9900', firebase: '#FFCA28', mongodb: '#47A248', docker: '#2496ED', kubernetes: '#326CE5',
  graphql: '#E10098', tailwindcss: '#06B6D4', stripe: '#008CDD', vercel: '#000000', clerk: '#6C47FF',
  shadcn: '#000000', trpc: '#398CCB', prisma: '#1B222D', openai: '#10A37F'
};

const BrandIcons: Record<string, React.ReactNode> = {
  react: <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M12 0c-1.87 0-3.64.38-5.26 1.05l.39.75c1.47-.6 3.09-.94 4.87-.94 6.63 0 12 2.69 12 6s-5.37 6-12 6c-1.78 0-3.4-.34-4.87-.94l-.39.75C8.36 13.62 10.13 14 12 14c7.31 0 13.33-2.92 13.96-6.65.03-.23.04-.46.04-.69 0-3.31-5.37-6-12-6zm-7.66 4.93C1.86 6.8 0 9.24 0 12c0 2.76 1.86 5.2 4.34 7.07l.39-.75C2.56 16.65 1.03 14.47 1.03 12c0-2.47 1.53-4.65 3.7-6.32l-.39-.75zM12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6.26.78c-.42 2.1-.2 4.18.52 5.96l.78-.3c-.62-1.57-.8-3.4-.44-5.24l-.86-.42zm12.52 0l-.86.42c.36 1.84.18 3.67-.44 5.24l.78.3c.72-1.78.94-3.86.52-5.96z" /></svg>,
  nextjs: <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 22.4c-5.74 0-10.4-4.66-10.4-10.4 0-2.34.78-4.5 2.1-6.24l13.13 13.13c-1.44.97-3.14 1.51-4.83 1.51zM18.6 16.9L7.54 5.84c1.33-.76 2.87-1.19 4.46-1.19 5.74 0 10.4 4.66 10.4 10.4 0 2.05-.73 3.94-1.95 5.46z" /><path d="M9.5 8.5L13.2 14.2 14.8 14.2 9.5 6.2z" /></svg>,
  // ... other icons would be here
};

const GenericIcon = ({ name, color }: { name: string, color: string }) => {
  const n = name.toLowerCase();
  if (n.includes('db') || n.includes('sql') || n.includes('mongo')) return <Database size={32} color={color} />;
  if (n.includes('node') || n.includes('server')) return <Server size={32} color={color} />;
  if (n.includes('cloud') || n.includes('aws')) return <Globe size={32} color={color} />;
  return <Code size={32} color={color} />;
};

const getIcon = (iconName: string, color: string) => {
  const key = iconName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const style = { color: color };
  if (BrandIcons[key]) return <div style={style}>{BrandIcons[key]}</div>;
  if (key.includes('react')) return <div style={style}>{BrandIcons['react']}</div>;
  if (key.includes('next')) return <div style={style}>{BrandIcons['nextjs']}</div>;
  return <GenericIcon name={key} color={color} />;
};

const TechStackTab: React.FC<Props> = ({ data }) => {
  return (
    <AnimatedSection className="flex flex-col gap-8 pb-10 max-w-7xl mx-auto" blur={true} delay={0.1}>
      <div>
        <h2 className="text-zinc-800 dark:text-zinc-200 font-bold text-sm uppercase tracking-wider mb-8 flex items-center gap-2">
          <Layers size={16} className="text-blue-500 dark:text-blue-400" /> Recommended Tech Stack
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {data.technologies.map((tech, idx) => {
            const fallbackColor = DEFAULT_COLORS[tech.name.toLowerCase().replace(/[^a-z0-9]/g, '')] || '#000000';
            let finalColor = tech.color && tech.color.startsWith('#') ? tech.color : fallbackColor;

            // In dark mode, ensure black icons (Next.js, Vercel) are white
            // In light mode, they stay black
            const isDarkIcon = finalColor.toLowerCase() === '#000000' || finalColor.toLowerCase() === '#1b222d';

            // We use CSS class based coloring for dynamic theme support on svg fill
            const iconColorClass = isDarkIcon ? 'text-black dark:text-white' : '';

            // Explicit style for colors that are NOT black/white neutral
            const iconStyle = !isDarkIcon ? { color: finalColor } : {};

            return (
              <a
                key={idx}
                href={tech.docs}
                target="_blank"
                rel="noreferrer"
                className="group relative flex flex-col items-center justify-center p-8 bg-white dark:bg-[#09090b]/50 backdrop-blur-md rounded-3xl border border-zinc-200 dark:border-white/5 transition-all duration-500 hover:-translate-y-2 animate-slide-up shadow-sm dark:shadow-none"
                style={{ animationDelay: `${idx * 50}ms` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${finalColor}40`;
                  e.currentTarget.style.boxShadow = `0 15px 40px -10px ${finalColor}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = ''; // clear inline style to revert to class
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {/* Ambient Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none rounded-3xl"
                  style={{ background: `radial-gradient(circle at center, ${finalColor}, transparent 80%)` }}>
                </div>

                <div className={`relative z-10 mb-6 transform group-hover:scale-110 transition-transform duration-500 drop-shadow-xl ${iconColorClass}`} style={iconStyle}>
                  {getIcon(tech.icon || tech.name, isDarkIcon ? 'currentColor' : finalColor)}
                </div>

                <div className="relative z-10 text-center">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-1.5 tracking-tight group-hover:text-black dark:group-hover:text-white transition-colors">{tech.name}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">{tech.category}</p>
                </div>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <ArrowUpRight size={14} className="text-zinc-400 hover:text-black dark:hover:text-white" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
};

export default TechStackTab;
