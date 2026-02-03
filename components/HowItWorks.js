import { motion } from 'framer-motion';
import { Upload, Phone, Calendar, TrendingUp } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        {
            number: "01",
            icon: <Upload className="w-6 h-6" />,
            title: "Upload Your Leads",
            description: "Import your lead list via CSV or connect your CRM. We handle the rest."
        },
        {
            number: "02",
            icon: <Phone className="w-6 h-6" />,
            title: "AI Makes The Call",
            description: "Our AI agent calls leads with natural, human-like conversations."
        },
        {
            number: "03",
            icon: <Calendar className="w-6 h-6" />,
            title: "Schedule Meetings",
            description: "Qualified leads get automatically booked into your calendar."
        },
        {
            number: "04",
            icon: <TrendingUp className="w-6 h-6" />,
            title: "Close More Deals",
            description: "Review transcripts, insights, and focus on closing warm leads."
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
                        How It{' '}
                        <span className="italic font-normal text-[#0F172A]/70">Works</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-500 max-w-xl mx-auto leading-relaxed font-grotesk"
                    >
                        Four simple steps to automate your entire lead qualification process.
                    </motion.p>
                </div>

                {/* Steps Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            className="relative"
                        >
                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gray-200 -translate-x-4" />
                            )}

                            {/* Step Number */}
                            <div className="text-6xl font-grotesk font-bold text-gray-800 mb-4">
                                {step.number}
                            </div>

                            {/* Icon */}
                            <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mb-4 text-white">
                                {step.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-grotesk font-semibold text-[#0F172A] mb-2">
                                {step.title}
                            </h3>
                            <p className="text-sm text-gray-500 font-grotesk leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
