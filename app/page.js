"use client";

import { Suspense } from "react";
import { useAuth } from "../context/AuthContext";
import Dashboard from "../components/Dashboard";
import LandingPage from "../components/LandingPage";

function HomeContent() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Dashboard />;
  }

  return <LandingPage />;
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
