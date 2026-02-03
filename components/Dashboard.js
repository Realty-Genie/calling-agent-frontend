"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import SingleCallModal from "../components/SingleCallModal";
import { motion, AnimatePresence } from "framer-motion";
import {
    Phone,
    PhoneCall,
    Clock,
    Users,
    CheckCircle2,
    XCircle,
    ChevronRight,
    BarChart3,
    MessageSquare,
    Play,
    X
} from "lucide-react";
import api from "../lib/api";

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [leads, setLeads] = useState([]);
    const [selectedCall, setSelectedCall] = useState(null);
    const [callDetails, setCallDetails] = useState(null);
    const [loadingLeads, setLoadingLeads] = useState(true);
    const [agents, setAgents] = useState([]);

    useEffect(() => {
        if (user && user.agents) {
            setAgents(user.agents);
        }
    }, [user]);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await api.get('/leads');
            console.log(res.data)
            if (res.data.success) {
                setLeads(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch leads:", error);
        } finally {
            setLoadingLeads(false);
        }
    };

    const fetchCallDetails = async (callId) => {
        try {
            const res = await api.get(`/call/${callId}`);
            if (res.data.success) {
                setCallDetails(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch call details:", error);
        }
    };

    const handleCallClick = (lead, call) => {
        setSelectedCall({ lead, call });
        if (call?.callId) {
            fetchCallDetails(call.callId);
        }
    };

    const closeCallDetails = () => {
        setSelectedCall(null);
        setCallDetails(null);
    };

    // Calculate stats
    const totalCalls = leads.reduce((acc, lead) => acc + (lead.calls?.length || 0), 0);
    const successfulCalls = leads.reduce((acc, lead) => {
        return acc + (lead.calls?.filter(c => c.analysis?.call_successful)?.length || 0);
    }, 0);
    const totalDuration = leads.reduce((acc, lead) => {
        return acc + (lead.calls?.reduce((sum, c) => sum + (c.durationMs || 0), 0) || 0);
    }, 0);
    const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls / 1000) : 0;

    // Flatten all calls for the table
    const allCalls = leads.flatMap(lead =>
        (lead.calls || []).map(call => ({ ...call, lead }))
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (loading) return null;

    return (
        <main className="min-h-screen bg-[#F8FAFC] selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header with Make Call Button */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0F172A]">Dashboard</h1>
                        <p className="text-gray-500 mt-1">Monitor your calls and leads</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsCallModalOpen(true)}
                        className="bg-[#0F172A] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#1E293B] transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                        style={{ isolation: 'isolate' }}
                    >
                        <PhoneCall className="w-5 h-5" />
                        Make a Call
                    </motion.button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {loadingLeads ? (
                        // Skeleton cards
                        <>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                                        <div className="w-12 h-4 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                                    <div className="h-4 bg-gray-100 rounded w-24"></div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                                        <Phone className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 uppercase">Total</span>
                                </div>
                                <p className="text-3xl font-bold text-[#0F172A]">{totalCalls}</p>
                                <p className="text-sm text-gray-500 mt-1">Total Calls</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 uppercase">Success</span>
                                </div>
                                <p className="text-3xl font-bold text-[#0F172A]">{successfulCalls}</p>
                                <p className="text-sm text-gray-500 mt-1">Successful Calls</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 uppercase">Average</span>
                                </div>
                                <p className="text-3xl font-bold text-[#0F172A]">{avgDuration}s</p>
                                <p className="text-sm text-gray-500 mt-1">Avg. Duration</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-rose-600" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 uppercase">Active</span>
                                </div>
                                <p className="text-3xl font-bold text-[#0F172A]">{leads.length}</p>
                                <p className="text-sm text-gray-500 mt-1">Total Leads</p>
                            </motion.div>
                        </>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex gap-6">
                    {/* Calls Table - Full Width */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full"
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-[#0F172A]">Recent Calls</h2>
                                <p className="text-sm text-gray-500">{allCalls.length} calls found</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/80">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loadingLeads ? (
                                        // Skeleton table rows
                                        <>
                                            {[...Array(5)].map((_, i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                                            <div>
                                                                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                                                <div className="h-3 bg-gray-100 rounded w-32"></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="h-4 bg-gray-200 rounded w-4"></div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    ) : allCalls.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center">
                                                    <Phone className="w-12 h-12 text-gray-200 mb-3" />
                                                    <p className="font-medium">No calls yet</p>
                                                    <p className="text-sm">Make your first call to get started</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : allCalls.slice(0, 10).map((call, idx) => (
                                        <tr
                                            key={call.callId || idx}
                                            onClick={() => handleCallClick(call.lead, call)}
                                            className="cursor-pointer transition-colors hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                        {call.lead?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{call.lead?.name || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-500">{call.lead?.email || '-'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {call.lead?.phoneNumber || call.toNumber || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {call.durationMs ? `${Math.round(call.durationMs / 1000)}s` : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                                                    {call.status || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {call.createdAt ? new Date(call.createdAt).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <ChevronRight className="w-5 h-5 text-gray-300" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Call Details Modal */}
            <AnimatePresence>
                {selectedCall && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeCallDetails}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-xl z-50 max-h-[85vh] overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-[#0F172A]">Call Details</h3>
                                <button
                                    onClick={closeCallDetails}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                                {/* Lead Info */}
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                                        {selectedCall.lead?.name?.charAt(0) || '?'}
                                    </div>
                                    <h4 className="text-xl font-bold text-[#0F172A]">{selectedCall.lead?.name}</h4>
                                    <p className="text-gray-500">{selectedCall.lead?.phoneNumber}</p>
                                    {selectedCall.lead?.email && (
                                        <p className="text-sm text-gray-400">{selectedCall.lead?.email}</p>
                                    )}
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                                        <p className="text-xs text-gray-400 uppercase font-medium mb-1">Duration</p>
                                        <p className="text-lg font-bold text-[#0F172A]">
                                            {selectedCall.call?.durationMs ? `${Math.round(selectedCall.call.durationMs / 1000)}s` : '-'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                                        <p className="text-xs text-gray-400 uppercase font-medium mb-1">Sentiment</p>
                                        <p className="text-lg font-bold text-[#0F172A]">
                                            {selectedCall.call?.analysis?.user_sentiment || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                                        <p className="text-xs text-gray-400 uppercase font-medium mb-1">Success</p>
                                        <p className="text-lg font-bold text-[#0F172A]">
                                            {selectedCall.call?.analysis?.call_successful ? 'Yes' : 'No'}
                                        </p>
                                    </div>
                                </div>

                                {/* Summary */}
                                {selectedCall.call?.analysis?.call_summary && (
                                    <div>
                                        <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <BarChart3 className="w-4 h-4 text-indigo-500" />
                                            Call Summary
                                        </h5>
                                        <p className="text-sm text-gray-600 bg-indigo-50/50 p-4 rounded-xl leading-relaxed border border-indigo-100">
                                            {selectedCall.call.analysis.call_summary}
                                        </p>
                                    </div>
                                )}

                                {/* Transcript */}
                                {selectedCall.call?.transcript && (
                                    <div>
                                        <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-rose-500" />
                                            Transcript
                                        </h5>
                                        <div className="bg-gray-50 p-4 rounded-xl max-h-60 overflow-y-auto text-sm space-y-2 border border-gray-100">
                                            {selectedCall.call.transcript.split('\n').map((line, i) => (
                                                <p key={i} className={line.startsWith('Agent:') ? 'text-indigo-600' : 'text-gray-700'}>
                                                    {line}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Single Call Modal */}
            <SingleCallModal
                isOpen={isCallModalOpen}
                onClose={() => setIsCallModalOpen(false)}
                agents={agents}
            />
        </main>
    );
}
