import { motion } from 'framer-motion';
import { Phone, Zap, ArrowRight, Activity, ShieldCheck, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

const Hero = ({ onSingleCall, onBatchCall, onTryNow }) => {
    const { user } = useAuth();

    return (
        <section className="max-w-7xl mx-auto px-8 py-12 lg:py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-24 relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex-1 space-y-10"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 text-xs font-semibold tracking-wide uppercase">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Enterprise Grade Voice AI
                </div>

                <h1 className="text-5xl lg:text-7xl font-bold text-[#0F172A] leading-[1.05] tracking-tight">
                    The Future of <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">Voice Automation</span>
                </h1>

                <p className="text-gray-500 text-lg leading-relaxed max-w-lg font-medium">
                    Deploy intelligent voice agents that negotiate, qualify, and close deals with human-level nuance.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                    {user ? (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onSingleCall}
                                className="bg-[#0F172A] text-white px-8 py-4 rounded-2xl text-sm font-semibold hover:bg-gray-900 transition-all shadow-xl hover:shadow-2xl flex items-center gap-3 group"
                            >
                                <Phone className="w-4 h-4" />
                                Make a Call
                                <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onBatchCall}
                                className="bg-white text-[#0F172A] border border-gray-200 px-8 py-4 rounded-2xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm hover:shadow-md flex items-center gap-3"
                            >
                                <Zap className="w-4 h-4" />
                                Batch Call
                            </motion.button>
                        </>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onTryNow}
                            className="bg-[#0F172A] text-white px-8 py-4 rounded-2xl text-sm font-semibold hover:bg-gray-900 transition-all shadow-xl hover:shadow-2xl flex items-center gap-3 group"
                        >
                            <Zap className="w-4 h-4" />
                            Try Now
                            <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    )}
                </div>

                <div className="flex items-center gap-8 pt-8 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">SOC2 Compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">99.9% Uptime</span>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-1 relative w-full flex items-center justify-center"
            >
                <div className="relative w-full max-w-lg">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur opacity-20"></div>
                    <img
                        src="/heroImage.png"
                        alt="Dashboard Preview"
                        className="relative rounded-2xl shadow-2xl border border-gray-200 w-full"
                    />
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
