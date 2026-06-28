"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Stethoscope, FlaskConical, BarChart3, ShieldCheck,
  Globe, Brain, FileText, Pill, Building2, Microscope,
  TrendingUp, Users
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  Clinical: <Stethoscope className="h-5 w-5" />,
  Science: <FlaskConical className="h-5 w-5" />,
  Commercial: <BarChart3 className="h-5 w-5" />,
  Regulatory: <ShieldCheck className="h-5 w-5" />,
  Technology: <Globe className="h-5 w-5" />,
  Coaching: <Brain className="h-5 w-5" />,
  Content: <FileText className="h-5 w-5" />,
  Operations: <Building2 className="h-5 w-5" />,
  Management: <Users className="h-5 w-5" />,
  default: <Microscope className="h-5 w-5" />,
};

interface TopSpecialtiesProps {
  specialties: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    category: string | null;
  }>;
}

export function TopSpecialties({ specialties }: TopSpecialtiesProps) {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium text-[var(--primary)] mb-2">Expertise Areas</p>
          <h2 className="text-3xl font-bold text-[var(--foreground)]">
            Browse by Specialty
          </h2>
          <p className="text-[var(--muted-foreground)] mt-2 max-w-xl mx-auto">
            Find mentors across every domain in Healthcare & Pharma
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {specialties.map((specialty, index) => {
            const icon = categoryIcons[specialty.category || "default"] || categoryIcons.default;
            return (
              <motion.div
                key={specialty.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                <Link
                  href={`/mentors?specialty=${specialty.slug}`}
                  className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-md transition-all text-center"
                >
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                    {icon}
                  </div>
                  <span className="text-xs font-medium text-[var(--foreground)] leading-tight">
                    {specialty.name}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
