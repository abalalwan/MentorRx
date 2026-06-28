"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MentorCard } from "@/components/mentor/mentor-card";

interface FeaturedMentorsProps {
  mentors: Array<{
    mentor_id: string;
    full_name: string | null;
    avatar_url: string | null;
    headline: string | null;
    current_company: string | null;
    current_title: string | null;
    country: string | null;
    hourly_rate: number;
    currency: string;
    average_rating: number;
    total_reviews: number;
    total_sessions: number;
    is_verified: boolean;
    years_experience: number | null;
  }>;
}

export function FeaturedMentors({ mentors }: FeaturedMentorsProps) {
  if (mentors.length === 0) return null;

  return (
    <section className="py-24 bg-[var(--background)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
        >
          <div>
            <p className="text-sm font-medium text-[var(--primary)] mb-2">Featured Mentors</p>
            <h2 className="text-3xl font-bold text-[var(--foreground)]">
              Learn from the Best
            </h2>
            <p className="text-[var(--muted-foreground)] mt-2">
              Hand-picked experts across Healthcare & Pharma sectors
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/mentors">
              View All Mentors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor, index) => (
            <MentorCard key={mentor.mentor_id} mentor={mentor} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
