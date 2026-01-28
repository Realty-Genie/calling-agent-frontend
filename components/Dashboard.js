"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import SingleCallModal from "../components/SingleCallModal";
import BatchCallModal from "../components/BatchCallModal";
import { motion, AnimatePresence } from "framer-motion";
import CallAnalysisView from "../components/CallAnalysisView";

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('make-calls');
    const [isSingleCallOpen, setIsSingleCallOpen] = useState(false);
    const [isBatchCallOpen, setIsBatchCallOpen] = useState(false);
    const [agents, setAgents] = useState([]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && (tab === 'make-calls' || tab === 'call-analysis')) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        if (user && user.agents) {
            setAgents(user.agents);
        }
    }, [user]);

    if (loading) return null;

    return (
        <main className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
            <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

            <AnimatePresence mode="wait">
                {activeTab === 'make-calls' ? (
                    <motion.div
                        key="make-calls"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Hero
                            onSingleCall={() => setIsSingleCallOpen(true)}
                            onBatchCall={() => setIsBatchCallOpen(true)}
                        />
                        <Features />
                    </motion.div>
                ) : (
                    <CallAnalysisView key="call-analysis" />
                )}
            </AnimatePresence>

            <SingleCallModal
                isOpen={isSingleCallOpen}
                onClose={() => setIsSingleCallOpen(false)}
                agents={agents}
            />

            <BatchCallModal
                isOpen={isBatchCallOpen}
                onClose={() => setIsBatchCallOpen(false)}
                agents={agents}
            />
        </main>
    );
}
