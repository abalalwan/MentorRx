"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Pay As You Go",
    price: null,
    description: "Book sessions with any mentor at their listed rate. No commitment required.",
    features: [
      "Book any mentor",
      "30 min to 2 hour sessions",
      "Secure payments",
      "Automatic meeting creation",
      "Session recordings (optional)",
      "Post-session review",
    ],
    cta: "Browse Mentors",
    href: "/mentors",
    variant: "outline" as const,
    badge: null,
  },
  {
    name: "Monthly Bundle",
    price: "SAR 499",
    period: "/month",
    description: "Save up to 20% on sessions with your favorite mentors. Best for consistent growth.",
    features: [
      "Everything in Pay As You Go",
      "4 sessions per month",
      "Priority booking",
      "Dedicated support",
      "Progress tracking",
      "20% savings on sessions",
    ],
    cta: "Start Bundle",
    href: "/auth/register",
    variant: "premium" as const,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations upskilling teams. Custom pricing and features.",
    features: [
      "Unlimited team seats",
      "Dedicated account manager",
      "Custom mentor matching",
      "Team analytics dashboard",
      "Invoicing & billing",
      "Priority support",
    ],
    cta: "Contact Sales",
    href: "/contact",
    variant: "outline" as const,
    badge: null,
  },
];

export function PricingSection() {
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
          <p className="text-sm font-medium text-[var(--primary)] mb-2">Pricing</p>
          <h2 className="text-3xl font-bold text-[var(--foreground)]">
            Transparent Pricing
          </h2>
          <p className="text-[var(--muted-foreground)] mt-2 max-w-xl mx-auto">
            Mentors set their own rates. You pay only for what you book.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.badge
                  ? "border-[var(--primary)] shadow-xl shadow-blue-500/10"
                  : "border-[var(--border)]"
              } bg-[var(--card)]`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="premium">{plan.badge}</Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  {plan.price ? (
                    <>
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-[var(--muted-foreground)] text-sm">{plan.period}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-[var(--muted-foreground)]">
                      Mentor&apos;s rate
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button variant={plan.variant} asChild className="w-full">
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
