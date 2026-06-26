"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Star, Users, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const stats = [
  { value: "500+", label: "Expert Mentors", icon: Users },
  { value: "10K+", label: "Sessions Completed", icon: BookOpen },
  { value: "4.9", label: "Average Rating", icon: Star },
];

export function HeroSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/mentors?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/mentors");
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 pt-20 pb-24">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-100/50 dark:bg-blue-900/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-indigo-100/50 dark:bg-indigo-900/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              Healthcare & Pharma Expertise On Demand
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] mb-6 leading-tight">
              Accelerate Your{" "}
              <span className="gradient-text">Healthcare Career</span>{" "}
              with Expert Mentorship
            </h1>

            <p className="text-lg sm:text-xl text-[var(--muted-foreground)] mb-10 max-w-2xl mx-auto leading-relaxed">
              Book 1-on-1 sessions with top Medical Affairs, MSL, Regulatory,
              and Commercial professionals. Get the guidance you need to advance faster.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-2 p-2 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-[var(--border)]">
                <div className="flex-1 flex items-center gap-3 px-3">
                  <Search className="h-5 w-5 text-[var(--muted-foreground)] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by specialty, name, or company..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm focus:outline-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                  />
                </div>
                <Button type="submit" variant="premium" size="lg" className="rounded-xl">
                  Search
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Popular searches */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
              <span className="text-sm text-[var(--muted-foreground)]">Popular:</span>
              {["MSL", "Medical Affairs", "Regulatory Affairs", "Market Access", "Clinical Research"].map((term) => (
                <Link
                  key={term}
                  href={`/mentors?q=${encodeURIComponent(term)}`}
                  className="text-sm px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                >
                  {term}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-3 gap-6 max-w-xl mx-auto"
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Icon className="h-4 w-4 text-[var(--primary)]" />
                    <span className="text-2xl font-bold text-[var(--foreground)]">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">{stat.label}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
