"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { motion } from 'framer-motion';
import { Phone, Zap, User, ShieldCheck, Activity, Loader2, Bot } from 'lucide-react';
import AgentCard from '../../components/AgentCard';

export default function AgentsPage() {
    const { user, refreshUser, loading } = useAuth();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const syncUser = async () => {
            if (user) {
                setIsRefreshing(true);
                await refreshUser();
                setIsRefreshing(false);
            }
        };
        syncUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAFC] selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0F172A]">My Agents</h1>
                        <p className="text-gray-500 mt-1">Manage and view your assigned AI voice agents</p>
                    </div>
                    {isRefreshing && (
                        <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Syncing...
                        </div>
                    )}
                </div>

                {/* Agent Cards */}
                {isRefreshing ? (
                    // Skeleton loading
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                                <div className="flex items-start justify-between mb-5">
                                    <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
                                    <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
                                <div className="space-y-3">
                                    <div className="h-10 bg-gray-100 rounded-xl"></div>
                                    <div className="h-4 bg-gray-100 rounded w-24"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : user?.agents?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {user.agents.map((agent, idx) => (
                            <AgentCard key={agent._id || agent.id} agent={agent} />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm mb-12"
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Bot className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-[#0F172A] mb-2">No Agents Assigned</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            You don't have any AI agents assigned to your account yet. Please contact support or your administrator.
                        </p>
                    </motion.div>
                )}

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                    >
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                            <ShieldCheck className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h4 className="font-bold text-[#0F172A] mb-1">Secure Access</h4>
                        <p className="text-sm text-gray-500">Only you can access and trigger your assigned agents.</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                    >
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                            <Activity className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h4 className="font-bold text-[#0F172A] mb-1">Real-time Sync</h4>
                        <p className="text-sm text-gray-500">Agent configurations are synced instantly across your dashboard.</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                    >
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-amber-600" />
                        </div>
                        <h4 className="font-bold text-[#0F172A] mb-1">Instant Deployment</h4>
                        <p className="text-sm text-gray-500">Assigned agents are ready to make calls immediately.</p>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
