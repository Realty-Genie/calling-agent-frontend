import { motion } from 'framer-motion';
import { Phone, Zap, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Hero = ({ onSingleCall, onBatchCall }) => {
    const { user } = useAuth();
    const router = useRouter();
    const features = [
        { text: 'Human-like AI Calling' },
        { text: 'Schedule Calls, Get Results' },
        { text: 'Automatic meeting scheduling' },
        { text: 'No coding required' },
    ];

    return (
        <section className="max-w-7xl mx-auto px-8 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10">
            {/* Left Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex-1 space-y-8"
            >
                <div className="space-y-2">
                    <h1 className="text-5xl lg:text-6xl xl:text-7xl font-grotesk font-bold text-[#0F172A] leading-[1.1] tracking-tight">
                        Smart Calls{' '}
                        <span className="block italic font-normal text-[#0F172A]/80">
                            AI Driven
                        </span>
                        <span className="block">Calling Agent</span>
                    </h1>
                </div>

                <p className="text-gray-600 text-base lg:text-lg leading-relaxed max-w-md font-grotesk">
                    Automate Leads with Human-Like AI. Schedule Calls, Get Results—AI Remembers, Understands, and Delivers.
                </p>

                {/* Feature checkmarks - 2x2 grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 max-w-md">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                            <span className="text-sm font-grotesk text-gray-700">{feature.text}</span>
                        </div>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4 pt-4">
                    {user ? (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onSingleCall}
                                className="bg-[#0F172A] text-white px-8 py-4 rounded-full text-sm font-grotesk font-semibold hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl flex items-center gap-3 group"
                            >
                                <Phone className="w-4 h-4" />
                                Make a Call
                                <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onBatchCall}
                                className="bg-white text-[#0F172A] border border-gray-300 px-8 py-4 rounded-full text-sm font-grotesk font-semibold hover:bg-gray-50 transition-all shadow-sm hover:shadow-md flex items-center gap-3"
                            >
                                <Zap className="w-4 h-4" />
                                Batch Call
                            </motion.button>
                        </>
                    ) : (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push('/login')}
                                className="bg-[#0F172A] text-white px-8 py-4 rounded-full text-sm font-grotesk font-semibold hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl flex items-center gap-3 group"
                            >
                                Get started
                                <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                            <Link href="https://cal.com/realtygenie/30min?overlayCalendar=true" target="_blank" rel="noopener noreferrer">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-white text-[#0F172A] border border-gray-300 px-8 py-4 rounded-full text-sm font-grotesk font-semibold hover:bg-gray-50 transition-all shadow-sm hover:shadow-md flex items-center gap-3"
                                >
                                    Book a demo
                                </motion.button>
                            </Link>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Right Side - Hero Image */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-1 relative w-full flex items-center justify-center"
            >
                <div className="relative w-full max-w-lg">
                    <Image
                        src="/heroImage.jpg"
                        alt="Smart AI Visual"
                        width={500}
                        height={600}
                        className="relative w-full h-auto object-contain"
                        priority
                    />
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
