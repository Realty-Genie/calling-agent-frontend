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
                                Log in
                            </button>
                        </Link>
                        <Link href="/login">
                            <button className="bg-[#0F172A] text-white px-5 py-2 rounded-full text-sm font-grotesk font-medium hover:bg-gray-800 transition-all shadow-sm">
                                Sign up – it's free
                            </button>
                        </Link>
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
