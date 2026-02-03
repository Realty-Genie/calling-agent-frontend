"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import CallAnalysisView from "../components/CallAnalysisView";

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) return null;

    return (
        <main className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
            <Navbar />
            <CallAnalysisView />
        </main>
    );
}
