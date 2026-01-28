"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { motion } from 'framer-motion';
import { Phone, Zap, User, ShieldCheck, Activity, Loader2 } from 'lucide-react';
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
    }, [user]);

    if (loading && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
            <Navbar activeTab="agents" />

            <div className="max-w-7xl mx-auto px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-[#0F172A] mb-2">My Agents</h1>
                        <p className="text-gray-500 font-medium">Manage and view your assigned AI voice agents.</p>
                    </div>
                    {isRefreshing && (
                        <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium bg-indigo-50 px-4 py-2 rounded-full">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Syncing with server...
                        </div>
                    )}
                </div>

                {user?.agents?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {user.agents.map((agent) => (
                            <AgentCard key={agent._id || agent.id} agent={agent} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                            <User className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Agents Assigned</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8">
                            You don't have any AI agents assigned to your account yet. Please contact support or your administrator.
                        </p>
                    </div>
                )}

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">Secure Access</h4>
                        <p className="text-sm text-gray-500">Only you can access and trigger your assigned agents.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">Real-time Sync</h4>
                        <p className="text-sm text-gray-500">Agent configurations are synced instantly across your dashboard.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4">
                            <Zap className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">Instant Deployment</h4>
                        <p className="text-sm text-gray-500">Assigned agents are ready to make calls immediately.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
