"use client";

import { useState } from "react";
import Link from "next/link";
import Hero from "../components/Hero";
import Features from "../components/Features";
import TryNowModal from "../components/TryNowModal";


export default function LandingPage() {
    const [isTryNowOpen, setIsTryNowOpen] = useState(false);

    return (
        <main className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">

            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 max-w-7xl mx-auto">
                <div className="text-2xl font-bold tracking-tighter text-gray-900 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">CallGenie</span>
                </div>
                <Link href="/login">
                    <button className="bg-white text-[#0F172A] border border-gray-200 px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
                        Sign In
                    </button>
                </Link>
            </div>

            <Hero
                onTryNow={() => setIsTryNowOpen(true)}
            />

            <Features />

            <TryNowModal
                isOpen={isTryNowOpen}
                onClose={() => setIsTryNowOpen(false)}
            />
        </main>
    );
}
