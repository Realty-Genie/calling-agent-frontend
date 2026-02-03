import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
    const testimonials = [
        {
            name: "Sarah Chen",
            role: "Real Estate Agent",
            company: "Century 21",
            content: "CallGenie increased my lead conversion by 300%. The AI sounds so natural that clients don't even realize they're talking to a bot.",
            rating: 5
        },
        {
            name: "Marcus Johnson",
            role: "Sales Director",
            company: "InsureTech Co",
            content: "We went from 50 calls a day to 500. The AI handles initial qualification perfectly, and I only talk to hot leads now.",
            rating: 5
        },
        {
            name: "Emily Rodriguez",
            role: "Founder",
            company: "LeadGen Pro",
            content: "The meeting scheduling feature alone saved us 20 hours a week. Absolute game changer for our agency.",
            rating: 5
        }
    ];

    return (
        <section className="py-24 relative z-10 bg-[#1a1a1a]">
            <div className="max-w-7xl mx-auto px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl lg:text-5xl font-grotesk font-bold text-white mb-4 tracking-tight"
                    >
                        What Our{' '}
                        <span className="italic font-normal text-white/70">Clients Say</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 max-w-xl mx-auto leading-relaxed font-grotesk"
                    >
                        Join thousands of sales professionals who trust CallGenie.
                    </motion.p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl"
                        >
                            {/* Quote Icon */}
                            <Quote className="w-8 h-8 text-white/20 mb-4" />

                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-white/80 font-grotesk text-sm leading-relaxed mb-6">
                                "{testimonial.content}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-grotesk font-semibold text-sm">
                                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <div className="text-white font-grotesk font-medium text-sm">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-gray-400 font-grotesk text-xs">
                                        {testimonial.role}, {testimonial.company}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
