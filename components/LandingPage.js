"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import TryNowModal from "../components/TryNowModal";

export default function LandingPage() {
    const [isTryNowOpen, setIsTryNowOpen] = useState(false);

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Testimonials', href: '#testimonials' },
    ];

    return (
        <main className="min-h-screen bg-[#f5f5f5] selection:bg-gray-200 selection:text-gray-900 relative z-10">
            {/* Navigation */}
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed top-0 left-0 right-0 z-50 bg-[#f5f5f5]/80 backdrop-blur-md border-b border-gray-200/50"
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="text-xl font-grotesk font-bold tracking-tight text-[#0F172A]">
                        CallGenie
                    </Link>

                    {/* Nav Links - Desktop */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                className="text-sm font-grotesk text-gray-600 hover:text-[#0F172A] transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        <Link href="/login">
                            <button className="text-sm font-grotesk font-medium text-gray-600 hover:text-[#0F172A] transition-colors">
                                Login / Sign up
                            </button>
                        </Link>
                        <button
                            onClick={() => setIsTryNowOpen(true)}
                            className="bg-[#020617] text-white px-8 py-3 rounded-full text-sm font-grotesk font-medium 
                            hover:scale-105 transition-all duration-300 relative overflow-hidden group 
                            shadow-[0_0_15px_rgba(56,189,248,0.5)] hover:shadow-[0_0_30px_rgba(56,189,248,0.7),0_0_60px_rgba(232,121,249,0.5)]
                            border border-white/10"
                        >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-yellow-500/10" />

                            <span className="relative z-10 font-semibold tracking-wide">Try Now</span>

                            {/* Spectrum Shimmer - Automatic */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 via-yellow-400/80 via-fuchsia-500/80 via-cyan-400/80 to-transparent opacity-50 skew-x-12"
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.5,
                                    ease: "easeInOut",
                                    repeatDelay: 0.5
                                }}
                            />

                            <div className="absolute inset-0 rounded-full ring-1 ring-white/10 group-hover:ring-white/30 transition-all" />
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Spacer for fixed nav */}
            <div className="h-16" />

            {/* Hero Section */}
            <Hero onTryNow={() => setIsTryNowOpen(true)} />

            {/* Features Section */}
            <div id="features">
                <Features />
            </div>

            {/* How It Works Section */}
            <div id="how-it-works">
                <HowItWorks />
            </div>

            {/* Testimonials Section */}
            <div id="testimonials">
                <Testimonials />
            </div>

            {/* CTA Section */}
            <CTASection onTryNow={() => setIsTryNowOpen(true)} />

            {/* Footer */}
            <Footer />

            {/* Try Now Modal */}
            <TryNowModal
                isOpen={isTryNowOpen}
                onClose={() => setIsTryNowOpen(false)}
            />
        </main>
    );
}
