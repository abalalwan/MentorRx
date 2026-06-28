"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, CheckCircle2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface MentorSetupProps {
  profile: Profile;
  specialties: Array<{ id: string; name: string; slug: string; category: string | null }>;
}

type Step = "basic" | "specialties" | "availability" | "pricing" | "done";

export function MentorSetup({ profile, specialties }: MentorSetupProps) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [headline, setHeadline] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [bio, setBio] = useState(profile.bio || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url || "");
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [newLanguage, setNewLanguage] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState("300");
  const [currency, setCurrency] = useState("SAR");
  const [availability, setAvailability] = useState<Array<{ day: number; start: string; end: string }>>([
    { day: 1, start: "09:00", end: "17:00" },
  ]);

  const steps: { id: Step; label: string }[] = [
    { id: "basic", label: "Basic Info" },
    { id: "specialties", label: "Specialties" },
    { id: "availability", label: "Availability" },
    { id: "pricing", label: "Pricing" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  const toggleSpecialty = (id: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const addAvailability = () => {
    setAvailability((prev) => [...prev, { day: 1, start: "09:00", end: "17:00" }]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Update profile
      await supabase.from("profiles").update({
        bio,
        linkedin_url: linkedinUrl || null,
      }).eq("id", profile.id);

      // Create mentor record
      const { data: mentor, error: mentorError } = await supabase
        .from("mentors")
        .insert({
          profile_id: profile.id,
          headline,
          current_title: currentTitle,
          current_company: currentCompany,
          years_experience: yearsExp ? parseInt(yearsExp) : null,
          hourly_rate: parseFloat(hourlyRate),
          currency,
          languages,
        })
        .select("id")
        .single();

      if (mentorError) throw mentorError;

      // Add specialties
      if (selectedSpecialties.length > 0) {
        await supabase.from("mentor_specialties").insert(
          selectedSpecialties.map((id) => ({
            mentor_id: mentor.id,
            specialty_id: id,
          }))
        );
      }

      // Add availability
      await supabase.from("availability").insert(
        availability.map((a) => ({
          mentor_id: mentor.id,
          day_of_week: a.day,
          start_time: a.start,
          end_time: a.end,
          is_active: true,
        }))
      );

      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Profile Created!</h1>
          <p className="text-[var(--muted-foreground)] mb-8">
            Your mentor profile is ready. You can now receive bookings from students.
          </p>
          <Button variant="premium" onClick={() => router.push("/dashboard/mentor")}>
            Go to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Set Up Your Mentor Profile</h1>
        <p className="text-[var(--muted-foreground)]">Just a few steps to start receiving bookings</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center mb-10">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className={`flex items-center gap-2 ${i <= currentStepIndex ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                i < currentStepIndex
                  ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                  : i === currentStepIndex
                  ? "border-[var(--primary)]"
                  : "border-[var(--border)]"
              }`}>
                {i < currentStepIndex ? "✓" : i + 1}
              </div>
              <span className="text-xs hidden sm:block">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i < currentStepIndex ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8">
        <AnimatePresence mode="wait">
          {step === "basic" && (
            <motion.div key="basic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-bold mb-6">Basic Information</h2>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="headline">Professional Headline</Label>
                  <input
                    id="headline"
                    type="text"
                    placeholder="e.g., Senior MSL at Pfizer | 10+ Years in Medical Affairs"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="mt-1.5 flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] placeholder:text-[var(--muted-foreground)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Current Title</Label>
                    <input
                      type="text"
                      placeholder="e.g., Medical Science Liaison"
                      value={currentTitle}
                      onChange={(e) => setCurrentTitle(e.target.value)}
                      className="mt-1.5 flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] placeholder:text-[var(--muted-foreground)]"
                    />
                  </div>
                  <div>
                    <Label>Current Company</Label>
                    <input
                      type="text"
                      placeholder="e.g., Pfizer"
                      value={currentCompany}
                      onChange={(e) => setCurrentCompany(e.target.value)}
                      className="mt-1.5 flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] placeholder:text-[var(--muted-foreground)]"
                    />
                  </div>
                </div>
                <div>
                  <Label>Years of Experience</Label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    placeholder="e.g., 10"
                    value={yearsExp}
                    onChange={(e) => setYearsExp(e.target.value)}
                    className="mt-1.5 flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] placeholder:text-[var(--muted-foreground)]"
                  />
                </div>
                <div>
                  <Label>Biography</Label>
                  <textarea
                    placeholder="Tell students about your experience, achievements, and how you can help them..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={5}
                    className="mt-1.5 flex w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] placeholder:text-[var(--muted-foreground)] resize-none"
                  />
                </div>
                <div>
                  <Label>LinkedIn URL (optional)</Label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="mt-1.5 flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] placeholder:text-[var(--muted-foreground)]"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <Button variant="premium" onClick={() => setStep("specialties")}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "specialties" && (
            <motion.div key="specialties" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-bold mb-2">Your Specialties</h2>
              <p className="text-[var(--muted-foreground)] text-sm mb-6">Select the areas you can mentor in.</p>

              {Object.entries(
                specialties.reduce((acc, s) => {
                  const cat = s.category || "Other";
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(s);
                  return acc;
                }, {} as Record<string, typeof specialties>)
              ).map(([category, items]) => (
                <div key={category} className="mb-5">
                  <h3 className="text-sm font-semibold text-[var(--muted-foreground)] mb-3">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {items.map((spec) => (
                      <button
                        key={spec.id}
                        onClick={() => toggleSpecialty(spec.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          selectedSpecialties.includes(spec.id)
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "border-[var(--border)] hover:border-[var(--primary)]/50"
                        }`}
                      >
                        {spec.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <Separator className="my-6" />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep("basic")}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button variant="premium" onClick={() => setStep("availability")}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "availability" && (
            <motion.div key="availability" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-bold mb-2">Set Your Availability</h2>
              <p className="text-[var(--muted-foreground)] text-sm mb-6">When are you available for sessions?</p>

              <div className="space-y-3">
                {availability.map((slot, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[var(--muted)]/50 rounded-xl p-3">
                    <select
                      value={slot.day}
                      onChange={(e) => {
                        const updated = [...availability];
                        updated[i].day = parseInt(e.target.value);
                        setAvailability(updated);
                      }}
                      className="flex-1 h-9 rounded-lg border border-[var(--input)] bg-[var(--background)] px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    >
                      {DAY_NAMES.map((d, idx) => (
                        <option key={d} value={idx}>{d}</option>
                      ))}
                    </select>
                    <input type="time" value={slot.start}
                      onChange={(e) => { const u = [...availability]; u[i].start = e.target.value; setAvailability(u); }}
                      className="h-9 rounded-lg border border-[var(--input)] bg-[var(--background)] px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                    <span className="text-[var(--muted-foreground)] text-sm">to</span>
                    <input type="time" value={slot.end}
                      onChange={(e) => { const u = [...availability]; u[i].end = e.target.value; setAvailability(u); }}
                      className="h-9 rounded-lg border border-[var(--input)] bg-[var(--background)] px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                    <button onClick={() => setAvailability(availability.filter((_, idx) => idx !== i))}>
                      <X className="h-4 w-4 text-[var(--muted-foreground)]" />
                    </button>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" className="mt-3" onClick={addAvailability}>
                <Plus className="h-4 w-4" /> Add Slot
              </Button>

              <Separator className="my-6" />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep("specialties")}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button variant="premium" onClick={() => setStep("pricing")}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "pricing" && (
            <motion.div key="pricing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-bold mb-2">Set Your Rate</h2>
              <p className="text-[var(--muted-foreground)] text-sm mb-6">
                You can change this at any time from your dashboard.
              </p>

              <div className="flex gap-3 mb-6">
                <div className="flex-1">
                  <Label>Hourly Rate</Label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="mt-1.5 flex h-12 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  />
                </div>
                <div className="w-28">
                  <Label>Currency</Label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="mt-1.5 flex h-12 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    <option>SAR</option>
                    <option>USD</option>
                    <option>AED</option>
                    <option>EUR</option>
                    <option>GBP</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
                  {error}
                </div>
              )}

              <Separator className="my-6" />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep("availability")}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button variant="premium" loading={loading} onClick={handleSubmit}>
                  Create Profile
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
