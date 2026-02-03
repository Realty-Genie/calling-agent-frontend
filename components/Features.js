import { motion } from 'framer-motion';
import { Clock, MessageSquare, BarChart3, Zap, Shield, Users } from 'lucide-react';

const Features = () => {
    const features = [
        {
            icon: <Clock className="w-6 h-6" />,
            title: "Instant Engagement",
            description: "Call leads within seconds of submission. Strike while the iron is hot and increase conversion rates."
        },
        {
            icon: <MessageSquare className="w-6 h-6" />,
            title: "Human-like Conversations",
            description: "Our AI handles interruptions, complex queries, and natural dialogue just like a top-tier sales agent."
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: "Seamless Integration",
            description: "Push qualified leads, call transcripts, and appointment details directly to your CRM."
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Lightning Fast",
            description: "Automate your outreach at scale with AI that never sleeps and never misses a follow-up."
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Enterprise Security",
            description: "SOC2 compliant with end-to-end encryption. Your data stays safe and private."
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Smart Lead Scoring",
            description: "AI-powered qualification that prioritizes your hottest leads automatically."
        }
    ];

    return (
        <section className="py-24 relative z-10">
            <div className="max-w-7xl mx-auto px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl lg:text-5xl font-grotesk font-bold text-[#0F172A] mb-4 tracking-tight"
                    >
                        Why Choose{' '}
                        <span className="italic font-normal text-[#0F172A]/70">CallGenie?</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-500 max-w-2xl mx-auto leading-relaxed font-grotesk"
                    >
                        We bridge the gap between lead generation and closed deals. The speed and intelligence needed to scale your outreach.
                    </motion.p>
                </div>

                {/* Features Grid - Bento Style */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -4, scale: 1.02 }}
                            className={`group relative p-8 rounded-3xl transition-all duration-300 cursor-pointer ${index === 0
                                ? 'bg-[#1a1a1a] text-white'
                                : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg'
                                }`}
                        >
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${index === 0
                                ? 'bg-white/10'
                                : 'bg-gray-100 group-hover:bg-gray-200'
                                } transition-colors`}>
                                <div className={index === 0 ? 'text-white' : 'text-gray-700'}>
                                    {feature.icon}
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className={`text-lg font-grotesk font-semibold mb-3 ${index === 0 ? 'text-white' : 'text-[#0F172A]'
                                }`}>
                                {feature.title}
                            </h3>
                            <p className={`text-sm leading-relaxed font-grotesk ${index === 0 ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                {feature.description}
                            </p>

                            {/* Subtle Arrow Indicator */}
                            <div className={`absolute bottom-6 right-6 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${index === 0 ? 'bg-white/10' : 'bg-gray-100'
                                }`}>
                                <svg
                                    className={`w-4 h-4 ${index === 0 ? 'text-white' : 'text-gray-600'}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Features;
