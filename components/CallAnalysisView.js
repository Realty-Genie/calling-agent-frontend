import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Clock, BarChart3, ChevronRight, User, Calendar, MessageSquare } from 'lucide-react';
import api from '../lib/api';

const CallAnalysisView = () => {
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedCall, setSelectedCall] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await api.get('/leads');
            if (res.data.success) {
                setLeads(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch leads:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCallDetails = async (callId) => {
        try {
            const res = await api.get(`/call/${callId}`);
            if (res.data.success) {
                setSelectedCall(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch call details:", error);
        }
    };

    const handleLeadClick = (lead) => {
        setSelectedLead(lead);
        if (lead.calls && lead.calls.length > 0) {
            fetchCallDetails(lead.calls[0].callId);
        } else {
            setSelectedCall(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-8 py-12 flex gap-8 h-[800px]">
            {/* Sidebar: Leads List */}
            <div className="w-1/3 bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-[#0F172A]">Recent Leads</h2>
                    <p className="text-sm text-gray-500">{leads.length} leads found</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <p className="text-center text-gray-400 py-8">Loading leads...</p>
                    ) : leads.map((lead) => (
                        <motion.div
                            key={lead._id}
                            onClick={() => handleLeadClick(lead)}
                            whileHover={{ scale: 1.02 }}
                            className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedLead?._id === lead._id
                                ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-lg'
                                : 'bg-white hover:bg-gray-50 border-gray-100'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold">{lead.name}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${selectedLead?._id === lead._id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {new Date(lead.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className={`text-sm mb-2 ${selectedLead?._id === lead._id ? 'text-gray-300' : 'text-gray-500'}`}>
                                {lead.email}
                            </p>
                            <div className="flex items-center gap-2 text-xs opacity-80">
                                <Phone className="w-3 h-3" />
                                {lead.phoneNumber}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Main Content: Call Analysis */}
            <div className="flex-1 bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col relative">
                {selectedCall ? (
                    <div className="flex-1 overflow-y-auto">
                        {/* Header */}
                        <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-[#0F172A] mb-2">{selectedLead?.name}</h1>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {selectedCall.to_number}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {Math.round(selectedCall.duration_ms / 1000)}s</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedCall.call_status === 'ended' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {selectedCall.call_status}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="mb-3">
                                        <p className="text-sm text-gray-400">Agent Number</p>
                                        <p className="text-xs font-mono text-gray-500">{selectedCall.from_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Call ID</p>
                                        <p className="text-xs font-mono text-gray-500">{selectedCall.call_id}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Sentiment</p>
                                    <p className="text-lg font-bold text-[#0F172A]">
                                        {selectedCall.call_analysis?.user_sentiment || 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Success</p>
                                    <p className="text-lg font-bold text-[#0F172A]">
                                        {selectedCall.call_analysis?.call_successful ? 'Yes' : 'No'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Content */}
                        <div className="p-8 space-y-8">
                            {/* Summary */}
                            <section>
                                <h3 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                                    Call Summary
                                </h3>
                                <div className="bg-indigo-50/50 p-6 rounded-2xl text-gray-700 leading-relaxed border border-indigo-100">
                                    {selectedCall.call_analysis?.call_summary || "No summary available."}
                                </div>
                            </section>

                            {/* Custom Data */}
                            {selectedCall.call_analysis?.custom_analysis_data && (
                                <section>
                                    <h3 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-emerald-500" />
                                        Extracted Data
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(selectedCall.call_analysis.custom_analysis_data).map(([key, value]) => (
                                            <div key={key} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">{key.replace(/_/g, ' ')}</p>
                                                <p className="text-sm font-medium text-gray-900">{String(value)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Transcript */}
                            <section>
                                <h3 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-rose-500" />
                                    Transcript
                                </h3>
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 max-h-96 overflow-y-auto">
                                    {selectedCall.transcript ? (
                                        selectedCall.transcript.split('\n').map((line, i) => (
                                            <p key={i} className={`text-sm ${line.startsWith('Agent:') ? 'text-indigo-600' : 'text-gray-700'}`}>
                                                <span className="font-bold">{line.split(':')[0]}:</span> {line.split(':').slice(1).join(':')}
                                            </p>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 italic">Transcript not available.</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <BarChart3 className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-lg font-medium">Select a lead to view analysis</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CallAnalysisView;
