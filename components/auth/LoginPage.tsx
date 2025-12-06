import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { ArrowRight, Loader2, Mail, Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StarBackground from '../ui/StarBackground';

const LoginPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [authSuccess, setAuthSuccess] = useState<string | null>(null);

    // Sign In Logic (Password)
    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
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
    };

    // Sign Up Logic
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
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
            // Optional: switch to sign in tab or just show success
        }
    };

    // Google Login
    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
        if (error) {
            setAuthError(error.message);
            setLoading(false);
        }
    };

    // Magic Link
    const handleMagicLink = async () => {
        if (!email) {
            setAuthError("Please enter your email for logic link");
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin },
        });
        setLoading(false);
        if (error) setAuthError(error.message);
        else setAuthSuccess("Magic link sent! Check your email.");
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden font-sans text-white selection:bg-zinc-800 selection:text-white">
            <StarBackground />

            {/* Vignette & Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black/80 to-black pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[420px] px-4"
            >
                {/* Header */}
                <div className="text-center mb-8 space-y-2">
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-bold tracking-tight text-white"
                    >
                        {activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-zinc-400 text-sm"
                    >
                        {activeTab === 'signin'
                            ? 'Enter your credentials to access your workspace.'
                            : 'Start your journey with us properly.'}
                    </motion.p>
                </div>

                {/* Card */}
                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden ring-1 ring-white/5">

                    {/* Tabs */}
                    <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-950/50 rounded-lg mb-6 border border-zinc-800/50">
                        <button
                            onClick={() => setActiveTab('signin')}
                            className={`relative py-2 text-sm font-medium rounded-md transition-all duration-300 ${activeTab === 'signin' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            {activeTab === 'signin' && (
                                <motion.div
                                    layoutId="auth-tab"
                                    className="absolute inset-0 bg-zinc-800 rounded-md shadow-sm border border-zinc-700/50"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">Sign In</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('signup')}
                            className={`relative py-2 text-sm font-medium rounded-md transition-all duration-300 ${activeTab === 'signup' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            {activeTab === 'signup' && (
                                <motion.div
                                    layoutId="auth-tab"
                                    className="absolute inset-0 bg-zinc-800 rounded-md shadow-sm border border-zinc-700/50"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">Sign Up</span>
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.form
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                            onSubmit={activeTab === 'signin' ? handleSignIn : handleSignUp}
                        >
                            <div className="space-y-4">
                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail size={16} className="text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-950/50 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-700 transition-all"
                                            placeholder="name@company.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-xs font-medium text-zinc-400">Password</label>
                                        {activeTab === 'signin' && (
                                            <button
                                                type="button"
                                                onClick={handleMagicLink}
                                                className="text-[10px] text-zinc-500 hover:text-white transition-colors"
                                            >
                                                Forgot? use magic link
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock size={16} className="text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full h-11 pl-10 pr-10 rounded-xl bg-zinc-950/50 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-700 transition-all"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Notifications */}
                            {authError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2"
                                >
                                    <AlertCircle size={14} />
                                    {authError}
                                </motion.div>
                            )}

                            {authSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs flex items-center gap-2"
                                >
                                    <CheckCircle2 size={14} />
                                    {authSuccess}
                                </motion.div>
                            )}

                            {/* Main Action Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-white/5"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : (
                                    activeTab === 'signin' ? 'Sign In' : 'Create Account'
                                )}
                            </button>
                        </motion.form>
                    </AnimatePresence>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#121214] px-2 text-zinc-500 font-medium tracking-wide">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-1 gap-3">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="h-11 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                    </div>

                </div>

                {/* Footer Links */}
                <p className="text-center mt-8 text-[10px] text-zinc-600">
                    Protected by reCAPTCHA and subject to the <span className="underline hover:text-zinc-400 cursor-pointer">Privacy Policy</span> and <span className="underline hover:text-zinc-400 cursor-pointer">Terms of Service</span>.
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;