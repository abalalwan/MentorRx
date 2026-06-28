"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, getInitials } from "@/lib/utils";

interface MentorCardProps {
  mentor: {
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
    specialties?: Array<{ name: string; slug: string }>;
  };
  index?: number;
}

export function MentorCard({ mentor, index = 0 }: MentorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/mentors/${mentor.mentor_id}`}>
        <div className="group relative bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          {/* Top gradient accent */}
          <div className="h-1 w-full gradient-brand" />

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={mentor.avatar_url || undefined} alt={mentor.full_name || ""} />
                  <AvatarFallback className="text-base">
                    {getInitials(mentor.full_name || "M")}
                  </AvatarFallback>
                </Avatar>
                {mentor.is_verified && (
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-white dark:bg-slate-800 p-0.5">
                    <CheckCircle className="h-4 w-4 text-[var(--primary)]" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                  {mentor.full_name}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] truncate">
                  {mentor.current_title}
                  {mentor.current_company && ` at ${mentor.current_company}`}
                </p>
                {mentor.country && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-[var(--muted-foreground)]" />
                    <span className="text-xs text-[var(--muted-foreground)]">{mentor.country}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Headline */}
            {mentor.headline && (
              <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-4">
                {mentor.headline}
              </p>
            )}

            {/* Specialties */}
            {mentor.specialties && mentor.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {mentor.specialties.slice(0, 3).map((spec) => (
                  <Badge key={spec.slug} variant="secondary" className="text-xs">
                    {spec.name}
                  </Badge>
                ))}
                {mentor.specialties.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{mentor.specialties.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Stats row */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-3">
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-semibold">
                    {mentor.average_rating > 0 ? mentor.average_rating.toFixed(1) : "New"}
                  </span>
                  {mentor.total_reviews > 0 && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      ({mentor.total_reviews})
                    </span>
                  )}
                </div>

                {/* Sessions */}
                {mentor.total_sessions > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {mentor.total_sessions} sessions
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="text-right">
                <span className="text-lg font-bold text-[var(--foreground)]">
                  {formatCurrency(mentor.hourly_rate, mentor.currency)}
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">/hr</span>
              </div>
            </div>
          </div>

          {/* Hover CTA */}
          <div className="px-6 pb-5 opacity-0 group-hover:opacity-100 transition-opacity -mt-2">
            <Button variant="premium" size="sm" className="w-full">
              Book Session
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
