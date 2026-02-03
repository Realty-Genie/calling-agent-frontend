import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

const CTASection = ({ onTryNow }) => {
    return (
        <section className="py-24 relative z-10">
            <div className="max-w-4xl mx-auto px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative bg-[#0F172A] rounded-[2.5rem] p-12 lg:p-16 text-center overflow-hidden"
                >
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-transparent" />

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

                    {/* Content */}
                    <div className="relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-xs font-grotesk font-medium mb-6"
                        >
                            <Zap className="w-3 h-3" />
                            Start in under 2 minutes
                        </motion.div>

                        <h2 className="text-3xl lg:text-5xl font-grotesk font-bold text-white mb-4 tracking-tight">
                            Ready to Scale Your{' '}
                            <span className="italic font-normal text-white/70">Outreach?</span>
                        </h2>

                        <p className="text-gray-400 font-grotesk max-w-lg mx-auto mb-8 leading-relaxed">
                            Join thousands of sales teams already using CallGenie to automate their lead qualification and close more deals.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onTryNow}
                                className="bg-white text-[#0F172A] px-8 py-4 rounded-full text-sm font-grotesk font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl flex items-center gap-3 group"
                            >
                                Get Started Free
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </motion.button>

                            <Link href="https://cal.com/realtygenie/30min?overlayCalendar=true" target="_blank" rel="noopener noreferrer">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full text-sm font-grotesk font-semibold hover:bg-white/20 transition-all flex items-center gap-3"
                                >
                                    Talk to Sales
                                </motion.button>
                            </Link>
                        </div>

                        <p className="text-gray-500 text-xs font-grotesk mt-6">
                            No credit card required • Free trial included
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CTASection;
