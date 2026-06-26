"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

interface MentorProfileEditProps {
  profile: Profile;
  mentor: {
    id: string;
    profile_id: string;
    headline: string | null;
    current_title: string | null;
    current_company: string | null;
    years_experience: number | null;
    hourly_rate: number;
    currency: string;
    is_accepting_bookings: boolean;
    languages: string[] | null;
  };
  selectedSpecialtyIds: string[];
  allSpecialties: Array<{ id: string; name: string; slug: string; category: string | null }>;
  certifications: Array<{
    id: string;
    title: string;
    issuer: string;
    issued_at: string | null;
    expires_at: string | null;
    credential_url: string | null;
  }>;
}

export function MentorProfileEdit({
  profile,
  mentor,
  selectedSpecialtyIds,
  allSpecialties,
  certifications: initialCerts,
}: MentorProfileEditProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile fields
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url || "");

  // Mentor fields
  const [headline, setHeadline] = useState(mentor.headline || "");
  const [currentTitle, setCurrentTitle] = useState(mentor.current_title || "");
  const [currentCompany, setCurrentCompany] = useState(mentor.current_company || "");
  const [yearsExp, setYearsExp] = useState(String(mentor.years_experience || ""));
  const [hourlyRate, setHourlyRate] = useState(String(mentor.hourly_rate));
  const [currency, setCurrency] = useState(mentor.currency);
  const [isAccepting, setIsAccepting] = useState(mentor.is_accepting_bookings);
  const [languages, setLanguages] = useState<string[]>(mentor.languages || ["English"]);
  const [newLanguage, setNewLanguage] = useState("");
  const [specialties, setSpecialties] = useState<string[]>(selectedSpecialtyIds);

  // Certifications
  const [certs, setCerts] = useState(initialCerts);
  const [newCert, setNewCert] = useState({
    title: "",
    issuer: "",
    issued_at: "",
    expires_at: "",
    credential_url: "",
  });
  const [addingCert, setAddingCert] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        bio,
        linkedin_url: linkedinUrl || null,
      })
      .eq("id", profile.id);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    // Update mentor
    const { error: mentorError } = await supabase
      .from("mentors")
      .update({
        headline: headline || null,
        current_title: currentTitle || null,
        current_company: currentCompany || null,
        years_experience: yearsExp ? parseInt(yearsExp) : null,
        hourly_rate: parseFloat(hourlyRate),
        currency,
        is_accepting_bookings: isAccepting,
        languages,
      })
      .eq("id", mentor.id);

    if (mentorError) {
      setError(mentorError.message);
      setLoading(false);
      return;
    }

    // Sync specialties — delete all then re-insert
    await supabase.from("mentor_specialties").delete().eq("mentor_id", mentor.id);
    if (specialties.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("mentor_specialties") as any).insert(
        specialties.map((sid) => ({ mentor_id: mentor.id, specialty_id: sid }))
      );
    }

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  };

  const addCert = async () => {
    if (!newCert.title || !newCert.issuer) return;
    setAddingCert(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("certificates") as any)
      .insert({
        mentor_id: mentor.id,
        title: newCert.title,
        issuer: newCert.issuer,
        issued_at: newCert.issued_at || null,
        expires_at: newCert.expires_at || null,
        credential_url: newCert.credential_url || null,
      })
      .select("id, title, issuer, issued_at, expires_at, credential_url")
      .single();

    if (!error && data) {
      setCerts((prev) => [data, ...prev]);
      setNewCert({ title: "", issuer: "", issued_at: "", expires_at: "", credential_url: "" });
    }
    setAddingCert(false);
  };

  const removeCert = async (certId: string) => {
    await supabase.from("certificates").delete().eq("id", certId);
    setCerts((prev) => prev.filter((c) => c.id !== certId));
  };

  const inputClass =
    "flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] placeholder:text-[var(--muted-foreground)]";
  const textareaClass =
    "flex w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] placeholder:text-[var(--muted-foreground)] resize-none";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="text-[var(--muted-foreground)]">Keep your profile up to date to attract more mentees.</p>
        </div>
        <Button variant="premium" onClick={handleSave} loading={loading} className="gap-2">
          {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 mb-6">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Personal Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  placeholder="Dr. Jane Smith"
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={textareaClass}
                  rows={4}
                  placeholder="Tell mentees about your background, expertise, and what you can offer..."
                />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className={inputClass}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Professional Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Headline</Label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className={inputClass}
                  placeholder="Senior Cardiologist | 15+ years experience"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Title</Label>
                  <input
                    type="text"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    className={inputClass}
                    placeholder="Consultant Cardiologist"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Company / Hospital</Label>
                  <input
                    type="text"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    className={inputClass}
                    placeholder="King Faisal Specialist Hospital"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <input
                  type="number"
                  value={yearsExp}
                  onChange={(e) => setYearsExp(e.target.value)}
                  className={inputClass}
                  min={0}
                  max={60}
                  placeholder="15"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Specialties */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle>Specialties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allSpecialties.map((spec) => (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() =>
                      setSpecialties((prev) =>
                        prev.includes(spec.id)
                          ? prev.filter((id) => id !== spec.id)
                          : [...prev, spec.id]
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      specialties.includes(spec.id)
                        ? "border-[var(--primary)] bg-blue-50 dark:bg-blue-900/20 text-[var(--primary)]"
                        : "border-[var(--border)] hover:border-[var(--primary)]/50 text-[var(--foreground)]"
                    }`}
                  >
                    {spec.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-3">
                {specialties.length} selected
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Languages */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="gap-1 pr-1">
                    {lang}
                    <button
                      type="button"
                      onClick={() => setLanguages((prev) => prev.filter((l) => l !== lang))}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className={inputClass}
                  placeholder="Add language..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newLanguage.trim()) {
                      e.preventDefault();
                      setLanguages((prev) => [...new Set([...prev, newLanguage.trim()])]);
                      setNewLanguage("");
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newLanguage.trim()) {
                      setLanguages((prev) => [...new Set([...prev, newLanguage.trim()])]);
                      setNewLanguage("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pricing */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hourly Rate</Label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className={inputClass}
                    min={0}
                    step={50}
                    placeholder="300"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className={inputClass}
                  >
                    <option value="SAR">SAR — Saudi Riyal</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="AED">AED — UAE Dirham</option>
                    <option value="KWD">KWD — Kuwaiti Dinar</option>
                    <option value="QAR">QAR — Qatari Riyal</option>
                    <option value="BHD">BHD — Bahraini Dinar</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)]">
                <input
                  id="accepting"
                  type="checkbox"
                  checked={isAccepting}
                  onChange={(e) => setIsAccepting(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]"
                />
                <label htmlFor="accepting" className="flex-1 cursor-pointer">
                  <p className="text-sm font-medium">Accept new bookings</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Toggle off to pause your availability without deleting your profile.
                  </p>
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Certifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader>
              <CardTitle>Certifications & Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {certs.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg border border-[var(--border)]"
                >
                  <div>
                    <p className="text-sm font-medium">{cert.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {cert.issuer}{cert.issued_at ? ` · ${cert.issued_at}` : ""}
                      {cert.expires_at ? ` — ${cert.expires_at}` : ""}
                    </p>
                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--primary)] hover:underline"
                      >
                        View credential
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCert(cert.id)}
                    className="text-red-500 hover:text-red-700 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Add new cert */}
              <div className="border border-dashed border-[var(--border)] rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-[var(--muted-foreground)]">Add Certification</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newCert.title}
                    onChange={(e) => setNewCert((p) => ({ ...p, title: e.target.value }))}
                    className={inputClass}
                    placeholder="Certification title"
                  />
                  <input
                    type="text"
                    value={newCert.issuer}
                    onChange={(e) => setNewCert((p) => ({ ...p, issuer: e.target.value }))}
                    className={inputClass}
                    placeholder="Issuing organization"
                  />
                  <input
                    type="date"
                    value={newCert.issued_at}
                    onChange={(e) => setNewCert((p) => ({ ...p, issued_at: e.target.value }))}
                    className={inputClass}
                  />
                  <input
                    type="date"
                    value={newCert.expires_at}
                    onChange={(e) => setNewCert((p) => ({ ...p, expires_at: e.target.value }))}
                    className={inputClass}
                    placeholder="Expiry (optional)"
                  />
                </div>
                <input
                  type="url"
                  value={newCert.credential_url}
                  onChange={(e) => setNewCert((p) => ({ ...p, credential_url: e.target.value }))}
                  className={inputClass}
                  placeholder="Credential URL (optional)"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={addingCert}
                  onClick={addCert}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Certification
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex justify-end pb-8">
          <Button variant="premium" onClick={handleSave} loading={loading} size="lg" className="gap-2">
            {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? "All Changes Saved!" : "Save All Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
