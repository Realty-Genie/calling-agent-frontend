"use client";

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await register(name, email, password);
            if (res.success) {
                router.push('/login');
            } else {
                setError(res.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Main background with CallGenie robots image */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url("/LoginSignUpPageBG.png")',
                }}
            ></div>
            
            {/* Light overlay for better contrast */}
            {/* Removed to keep original image colors */}
            
            {/* Additional tech pattern overlay */}
            {/* Removed to keep original image colors */}
            
            {/* Floating particles for tech feel */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-2 h-2 bg-indigo-400 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute top-40 right-32 w-1.5 h-1.5 bg-purple-500 rounded-full opacity-50 animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-32 left-40 w-2 h-2 bg-blue-500 rounded-full opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
                <div className="absolute bottom-20 right-20 w-1.5 h-1.5 bg-indigo-500 rounded-full opacity-60 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-60 left-1/3 w-1 h-1 bg-purple-600 rounded-full opacity-70 animate-pulse" style={{animationDelay: '1.5s'}}></div>
                <div className="absolute bottom-40 right-1/3 w-1.5 h-1.5 bg-blue-600 rounded-full opacity-55 animate-pulse" style={{animationDelay: '2.5s'}}></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-sm w-full relative z-10 px-4 ml-auto mr-70"
            >
                <div className="bg-white/95 rounded-2xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.4) 1px, transparent 0)', backgroundSize: '24px 24px'}}></div>
                    </div>
                    <div className="relative z-10">
                    {/* CallGenie Logo/Brand */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-gray-200">
                            <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Phone icon with AI circuit elements */}
                                <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.2c.27-.27.35-.67.24-1.02C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" fill="currentColor"/>
                                {/* AI circuit patterns */}
                                <circle cx="12" cy="8" r="1" fill="currentColor" opacity="0.7"/>
                                <circle cx="16" cy="6" r="0.5" fill="currentColor" opacity="0.5"/>
                                <circle cx="8" cy="10" r="0.5" fill="currentColor" opacity="0.5"/>
                                <path d="M12 7v2M11 8h2M15 5l1 1M9 11l-1-1" stroke="currentColor" strokeWidth="0.5" opacity="0.6"/>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-1">
                            CallGenie
                        </h1>
                        <p className="text-sm text-slate-600 font-medium">
                            AI-Powered Call Management
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                            Create your account to get started
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 flex items-center justify-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            data-version="v2"
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-center text-sm text-slate-600">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
