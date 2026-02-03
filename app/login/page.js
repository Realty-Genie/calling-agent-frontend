"use client";

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Bot } from 'lucide-react';

export default function AuthPage() {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'login') {
                const res = await login(email, password);
                if (!res.success) {
                    setError(res.message);
                }
            } else {
                const res = await register(name, email, password);
                if (res.success) {
                    // After successful registration, switch to login mode
                    setMode('login');
                    setName('');
                    setPassword('');
                    setError('');
                } else {
                    setError(res.message);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setError('');
        setName('');
        setEmail('');
        setPassword('');
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-12 bg-white">
                {/* Logo */}
                <div className="mb-12">
                    <Image
                        src="/logo.png"
                        alt="CallGenie"
                        width={40}
                        height={40}
                        className="h-10 w-auto"
                    />
                </div>

                {/* Form Content */}
                <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-md"
                >
                    {/* Heading */}
                    <h1 className="text-4xl lg:text-5xl font-bold text-[#0F172A] mb-3 tracking-tight">
                        {mode === 'login' ? 'Log in to' : 'Sign up for'}
                        <br />
                        <span className="text-[#0F172A]">CallGenie</span>
                    </h1>
                    <p className="text-gray-500 mb-10">
                        {mode === 'login'
                            ? 'Enter your credentials to continue.'
                            : 'Create your account to get started.'}
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {mode === 'signup' && (
                                <motion.div
                                    key="name-field"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-200 text-[#0F172A] placeholder-gray-400 focus:outline-none focus:border-[#0F172A] transition-colors text-base"
                                        placeholder="Full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <input
                                type="email"
                                required
                                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-200 text-[#0F172A] placeholder-gray-400 focus:outline-none focus:border-[#0F172A] transition-colors text-base"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <input
                                type="password"
                                required
                                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-200 text-[#0F172A] placeholder-gray-400 focus:outline-none focus:border-[#0F172A] transition-colors text-base"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-[#0F172A] text-white rounded-full text-base font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                'Continue'
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 flex items-center justify-start gap-4 text-sm text-gray-500">
                        {mode === 'login' && (
                            <>
                                <button
                                    type="button"
                                    className="hover:text-gray-700 transition-colors"
                                    onClick={() => {/* TODO: Forgot password flow */ }}
                                >
                                    Forgot password?
                                </button>
                                <span className="text-gray-300">|</span>
                            </>
                        )}
                        <a
                            href="/privacy"
                            className="hover:text-gray-700 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Privacy Policy
                        </a>
                    </div>

                    {/* Toggle Mode */}
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <p className="text-gray-600">
                            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="font-semibold text-[#0F172A] hover:underline transition-all"
                            >
                                {mode === 'login' ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Feature Showcase */}
            <div className="hidden lg:flex w-1/2 bg-slate-50 items-center justify-center relative overflow-hidden p-12 border-l border-slate-100">
                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative z-10 max-w-md w-full"
                >

                    {/* Quote */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                        {/* Decorative Corner Accent */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full" />

                        <span className="absolute -top-8 -left-4 text-9xl text-gray-100 font-serif select-none pointer-events-none">
                            “
                        </span>

                        <p className="relative text-2xl font-medium text-gray-700 leading-relaxed mb-6 z-10">
                            AI agents will become our digital assistants, helping us navigate the complexities of the modern world. They will make our lives easier and more efficient.
                        </p>

                        <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                            <div className="h-px w-8 bg-gray-200" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    Jeff Bezos
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Founder of Amazon
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
