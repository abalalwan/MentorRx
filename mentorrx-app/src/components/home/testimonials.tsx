"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    name: "Sarah Al-Rashid",
    role: "MSL at Roche",
    rating: 5,
    text: "My mentor helped me land my first MSL role in just 3 months. The career guidance was incredibly specific and actionable. Worth every penny.",
    country: "Saudi Arabia",
  },
  {
    id: 2,
    name: "Ahmed Hassan",
    role: "Medical Affairs Manager",
    rating: 5,
    text: "I transitioned from clinical practice to pharma with my mentor's help. They knew exactly what skills I needed to develop and how to position my experience.",
    country: "Egypt",
  },
  {
    id: 3,
    name: "Fatima Al-Zaabi",
    role: "Regulatory Affairs Specialist",
    rating: 5,
    text: "The mock interviews and CV review sessions transformed my application process. Got three offers within a month of starting mentorship.",
    country: "UAE",
  },
  {
    id: 4,
    name: "Omar Khalil",
    role: "Market Access Director",
    rating: 5,
    text: "Found an incredible mentor with 20 years in Market Access. Their insights on HEOR and payer negotiations were exactly what I needed for my promotion.",
    country: "Jordan",
  },
  {
    id: 5,
    name: "Lina Nasser",
    role: "Clinical Research Associate",
    rating: 5,
    text: "The platform is seamless. Booking, payment, and the video call all worked perfectly. My mentor was exactly as described in their profile.",
    country: "Lebanon",
  },
  {
    id: 6,
    name: "Yusuf Al-Ghamdi",
    role: "Pharmacovigilance Manager",
    rating: 5,
    text: "As a mentor, the platform handles everything. I just show up and share my knowledge. The earnings are fair and payments are always on time.",
    country: "Saudi Arabia",
  },
];

export function Testimonials() {
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
            Join thousands who have accelerated their careers with MentorRx
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
                {`"${t.text}"`}
              </p>

              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs">
                    {getInitials(t.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{t.role} · {t.country}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
