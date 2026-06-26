"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Trash2, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type AvailabilitySlot = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

type AvailabilityException = {
  id: string;
  exception_date: string;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};

interface AvailabilityEditorProps {
  mentorId: string;
  sessionDurationOptions: number[];
  availability: AvailabilitySlot[];
  exceptions: AvailabilityException[];
}

export function AvailabilityEditor({
  mentorId,
  sessionDurationOptions: initialDurations,
  availability: initialSlots,
  exceptions: initialExceptions,
}: AvailabilityEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  const [slots, setSlots] = useState<AvailabilitySlot[]>(initialSlots);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>(initialExceptions);
  const [durations, setDurations] = useState<number[]>(initialDurations);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // New exception form
  const [newExc, setNewExc] = useState({
    exception_date: "",
    is_available: false,
    start_time: "",
    end_time: "",
    reason: "",
  });

  const addSlot = (day: number) => {
    setSlots((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, day_of_week: day, start_time: "09:00", end_time: "17:00", is_active: true },
    ]);
  };

  const removeSlot = (id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSlot = (id: string, field: keyof AvailabilitySlot, value: string | boolean) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const toggleDuration = (d: number) => {
    setDurations((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b)
    );
  };

  const handleSave = async () => {
    setSaving(true);

    // Delete existing slots and re-insert
    await supabase.from("availability").delete().eq("mentor_id", mentorId);

    const slotsToInsert = slots.map((s) => ({
      mentor_id: mentorId,
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
      is_active: s.is_active,
    }));

    if (slotsToInsert.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("availability") as any).insert(slotsToInsert);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  const addException = async () => {
    if (!newExc.exception_date) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("availability_exceptions") as any)
      .insert({
        mentor_id: mentorId,
        exception_date: newExc.exception_date,
        is_available: newExc.is_available,
        start_time: newExc.is_available && newExc.start_time ? newExc.start_time : null,
        end_time: newExc.is_available && newExc.end_time ? newExc.end_time : null,
        reason: newExc.reason || null,
      })
      .select("id, exception_date, is_available, start_time, end_time, reason")
      .single();

    if (!error && data) {
      setExceptions((prev) => [...prev, data]);
      setNewExc({ exception_date: "", is_available: false, start_time: "", end_time: "", reason: "" });
    }
  };

  const removeException = async (id: string) => {
    await supabase.from("availability_exceptions").delete().eq("id", id);
    setExceptions((prev) => prev.filter((e) => e.id !== id));
  };

  const inputClass =
    "flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Availability</h1>
          <p className="text-[var(--muted-foreground)]">Set when mentees can book sessions with you.</p>
        </div>
        <Button variant="premium" onClick={handleSave} loading={saving} className="gap-2">
          {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Session Durations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Session Durations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 flex-wrap">
                {[15, 30, 45, 60, 90, 120].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDuration(d)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      durations.includes(d)
                        ? "border-[var(--primary)] bg-blue-50 dark:bg-blue-900/20 text-[var(--primary)]"
                        : "border-[var(--border)] hover:border-[var(--primary)]/50"
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-2">
                Mentees can only book the durations you enable.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Schedule */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {DAY_NAMES.map((dayName, dayIndex) => {
                const daySlots = slots.filter((s) => s.day_of_week === dayIndex);
                return (
                  <div key={dayIndex} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium w-24">{dayName}</span>
                      <button
                        type="button"
                        onClick={() => addSlot(dayIndex)}
                        className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add slot
                      </button>
                    </div>
                    {daySlots.length === 0 ? (
                      <p className="text-xs text-[var(--muted-foreground)] pl-24">No slots — unavailable</p>
                    ) : (
                      daySlots.map((slot) => (
                        <div key={slot.id} className="flex items-center gap-2 pl-24">
                          <input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) => updateSlot(slot.id, "start_time", e.target.value)}
                            className={`${inputClass} w-32`}
                          />
                          <span className="text-[var(--muted-foreground)] text-sm">—</span>
                          <input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) => updateSlot(slot.id, "end_time", e.target.value)}
                            className={`${inputClass} w-32`}
                          />
                          <input
                            type="checkbox"
                            checked={slot.is_active}
                            onChange={(e) => updateSlot(slot.id, "is_active", e.target.checked)}
                            className="h-4 w-4"
                            title="Active"
                          />
                          <button
                            type="button"
                            onClick={() => removeSlot(slot.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Exceptions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle>Date Exceptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                Override your schedule for specific dates (e.g., holidays, special hours).
              </p>

              {exceptions.map((exc) => (
                <div
                  key={exc.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg border border-[var(--border)]"
                >
                  <div>
                    <p className="text-sm font-medium">{exc.exception_date}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {exc.is_available
                        ? `Available ${exc.start_time || ""}${exc.end_time ? ` — ${exc.end_time}` : ""}`
                        : "Unavailable"}
                      {exc.reason ? ` · ${exc.reason}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeException(exc.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Add exception form */}
              <div className="border border-dashed border-[var(--border)] rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-[var(--muted-foreground)]">Add Date Exception</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={newExc.exception_date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setNewExc((p) => ({ ...p, exception_date: e.target.value }))}
                    className={inputClass}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="exc-available"
                      checked={newExc.is_available}
                      onChange={(e) => setNewExc((p) => ({ ...p, is_available: e.target.checked }))}
                      className="h-4 w-4"
                    />
                    <label htmlFor="exc-available" className="text-sm">Available on this date</label>
                  </div>
                </div>
                {newExc.is_available && (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="time"
                      value={newExc.start_time}
                      onChange={(e) => setNewExc((p) => ({ ...p, start_time: e.target.value }))}
                      className={inputClass}
                      placeholder="Start time"
                    />
                    <input
                      type="time"
                      value={newExc.end_time}
                      onChange={(e) => setNewExc((p) => ({ ...p, end_time: e.target.value }))}
                      className={inputClass}
                      placeholder="End time"
                    />
                  </div>
                )}
                <input
                  type="text"
                  value={newExc.reason}
                  onChange={(e) => setNewExc((p) => ({ ...p, reason: e.target.value }))}
                  className={inputClass}
                  placeholder="Reason (optional)"
                />
                <Button type="button" variant="outline" size="sm" onClick={addException} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Exception
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
