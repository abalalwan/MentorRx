"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface TestimonialsProps {
  testimonials: Array<{
    id: string;
    rating: number;
    comment: string | null;
    profiles?: {
      full_name: string | null;
      avatar_url: string | null;
      country: string | null;
    } | null;
  }>;
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-[var(--primary)] mb-2">Success Stories</p>
          <h2 className="text-3xl font-bold text-[var(--foreground)]">
            Trusted by Professionals Across the Region
          </h2>
          <p className="text-[var(--muted-foreground)] mt-2">
            Real reviews from mentees who booked sessions on MentorRx
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 hover:shadow-md transition-shadow"
            >
              <Quote className="h-6 w-6 text-[var(--primary)]/30 mb-4" />

              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-sm text-[var(--foreground)] leading-relaxed mb-6">
                {`"${t.comment}"`}
              </p>

              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={t.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(t.profiles?.full_name || "Anonymous")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{t.profiles?.full_name || "Anonymous"}</p>
                  {t.profiles?.country && (
                    <p className="text-xs text-[var(--muted-foreground)]">{t.profiles.country}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
