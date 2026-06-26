"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "How does MentorRx work?",
    a: "Browse our verified Healthcare & Pharma mentors, select one that matches your goals, pick a time that works for you, pay securely, and join your video session. It's that simple.",
  },
  {
    q: "How are mentors verified?",
    a: "All mentors go through an identity verification process. We verify their professional credentials, LinkedIn profile, and work history before approving their profile.",
  },
  {
    q: "What video platform is used for sessions?",
    a: "Sessions can be held via Zoom, Microsoft Teams, or Google Meet. The platform automatically creates the meeting link after payment is confirmed.",
  },
  {
    q: "Can I cancel or reschedule a booking?",
    a: "Yes. You can cancel or reschedule up to 24 hours before the session for a full refund. Cancellations within 24 hours may be subject to a fee.",
  },
  {
    q: "How do mentors get paid?",
    a: "Mentors set their own hourly rate. After a session is completed, the platform releases payment (minus platform fee) to the mentor's account within 2-3 business days.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept all major credit cards, mada, STCPAY, and other local payment methods through HyperPay. International cards via Visa and Mastercard are also supported.",
  },
  {
    q: "Is my payment secure?",
    a: "All payments are processed through PCI-DSS compliant providers. Your card details are never stored on our servers.",
  },
  {
    q: "Can I become a mentor?",
    a: "Yes! If you have 3+ years of experience in Healthcare or Pharma, you can apply to become a mentor. Registration is free. You set your own availability and hourly rate.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
          <p className="text-sm font-medium text-[var(--primary)] mb-2">FAQ</p>
          <h2 className="text-3xl font-bold text-[var(--foreground)]">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[var(--muted)]/50 transition-colors"
              >
                <span className="font-medium text-sm">{faq.q}</span>
                {openIndex === index ? (
                  <Minus className="h-4 w-4 text-[var(--primary)] shrink-0" />
                ) : (
                  <Plus className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-sm text-[var(--muted-foreground)] leading-relaxed border-t border-[var(--border)]">
                      <p className="pt-3">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
