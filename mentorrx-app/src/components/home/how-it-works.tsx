"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Calendar, CreditCard, Video } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Find Your Mentor",
    description: "Browse hundreds of verified Healthcare & Pharma experts. Filter by specialty, experience, price, and availability.",
  },
  {
    icon: Calendar,
    step: "02",
    title: "Book a Session",
    description: "Choose a date and time that works for you. Pick your session duration — 30 min to 2 hours.",
  },
  {
    icon: CreditCard,
    step: "03",
    title: "Secure Payment",
    description: "Pay safely with your preferred method. Your payment is held securely until after the session.",
  },
  {
    icon: Video,
    step: "04",
    title: "Meet & Learn",
    description: "Join your 1-on-1 video session. Get personalized guidance, career advice, and expert insights.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-[var(--background)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-[var(--primary)] mb-2">Simple Process</p>
          <h2 className="text-3xl font-bold text-[var(--foreground)]">
            How MentorRx Works
          </h2>
          <p className="text-[var(--muted-foreground)] mt-2 max-w-xl mx-auto">
            From finding your mentor to completing your session — everything is automated.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 dark:from-blue-900 dark:via-blue-600 dark:to-blue-900" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 mb-6">
                  <div className="h-20 w-20 rounded-2xl gradient-brand flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[var(--background)] border-2 border-[var(--primary)] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[var(--primary)]">{step.step}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
