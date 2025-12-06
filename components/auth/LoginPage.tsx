
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { ArrowRight, Loader2, Sparkles, Mail, Hexagon, AlertCircle, CheckCircle2, Lock, Key } from 'lucide-react';
import ParticleBackground from '../ui/ParticleBackground';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'password' | 'magic'>('password');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
        setAuthError(error.message);
        setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !email) return;
    
    setLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);
    if (error) {
      setAuthError(error.message);
    } else {
      setAuthSuccess('Check your email for the magic link!');
      setEmail('');
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !email || !password) return;

    setLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    setLoading(false);
    if (error) {
        setAuthError(error.message);
    }
    // Success is handled by the onAuthStateChange listener in App.tsx which redirects/updates state
  };

  const handleSignUp = async () => {
    if (!supabase || !email || !password) return;
    setLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    setLoading(false);
    if (error) {
        setAuthError(error.message);
    } else if (data.user?.identities?.length === 0) {
        setAuthError('This email is already registered. Please sign in instead.');
    } else {
        setAuthSuccess('Account created! Please check your email to confirm.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden font-sans text-white">
      {/* Background Effects */}
      <ParticleBackground />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md px-6 animate-slide-up">
        
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-10 text-center">
             <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] animate-float">
                <Hexagon size={32} className="text-white fill-white/20" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-2">
                Welcome Back
            </h1>
            <p className="text-zinc-500 text-sm font-medium">
                Your intelligent SaaS validation dashboard.
            </p>
        </div>

        {/* Card */}
        <div className="bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            
            {/* Subtle glow effect on card hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-0 group-hover:opacity-10 transition duration-1000 group-hover:duration-200"></div>

            <div className="relative z-10 space-y-6">
                
                {/* Google Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full h-12 bg-white text-black font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span>Sign in with Google</span>
                        </>
                    )}
                </button>

                {/* Auth Mode Toggle */}
                <div className="flex p-1 bg-zinc-900/50 rounded-xl border border-zinc-800 relative">
                    <button
                        type="button"
                        onClick={() => setAuthMode('password')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all z-10 ${
                            authMode === 'password'
                            ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        Password
                    </button>
                    <button
                        type="button"
                        onClick={() => setAuthMode('magic')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all z-10 ${
                            authMode === 'magic'
                            ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        Magic Link
                    </button>
                </div>

                {/* Divider removed in favor of toggle switch separation */}

                {/* Form */}
                <form onSubmit={authMode === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-4">
                    {/* Email Input */}
                    <div className="relative group/input">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail size={16} className="text-zinc-500 group-focus-within/input:text-white transition-colors" />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="info@example.com"
                            className="block w-full h-12 pl-11 pr-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-zinc-900 transition-all"
                            required
                        />
                    </div>

                    {/* Password Input (Conditional) */}
                    {authMode === 'password' && (
                        <div className="relative group/input animate-slide-up">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock size={16} className="text-zinc-500 group-focus-within/input:text-white transition-colors" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="block w-full h-12 pl-11 pr-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-zinc-900 transition-all"
                                required
                            />
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !email || (authMode === 'password' && !password)}
                        className="w-full h-12 bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-white/5"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : (
                            authMode === 'password' ? (
                                <>Sign In <Key size={16} /></>
                            ) : (
                                <>Send Magic Link <ArrowRight size={16} /></>
                            )
                        )}
                    </button>
                </form>

                {/* Sign Up Link (Password Mode Only) */}
                {authMode === 'password' && (
                     <div className="text-center text-xs text-zinc-500 animate-fade-in">
                        Don't have an account? 
                        <button 
                            type="button" 
                            onClick={handleSignUp} 
                            disabled={loading || !email || !password}
                            className="text-indigo-400 hover:text-indigo-300 font-bold ml-1.5 transition-colors disabled:opacity-50"
                        >
                            Sign Up
                        </button>
                     </div>
                )}

                {/* Messages */}
                {authError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-fade-in">
                        <AlertCircle size={14} className="shrink-0" />
                        {authError}
                    </div>
                )}
                
                {authSuccess && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs animate-fade-in">
                        <CheckCircle2 size={14} className="shrink-0" />
                        {authSuccess}
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-[10px] text-zinc-600">
            By continuing, you agree to our <span className="underline hover:text-zinc-400 cursor-pointer">Terms</span> and <span className="underline hover:text-zinc-400 cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
    