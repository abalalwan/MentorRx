"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, isSameDay, isToday } from "date-fns";
import {
  ChevronLeft, ChevronRight, Clock, Calendar, CreditCard,
  CheckCircle2, AlertCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const DURATIONS = [
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface BookingFlowProps {
  mentor: {
    mentor_id: string;
    full_name: string | null;
    avatar_url: string | null;
    current_title: string | null;
    current_company: string | null;
    hourly_rate: number;
    currency: string;
    average_rating: number;
  };
  specialties: Array<{ id: string; name: string }>;
  availability: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>;
  menteeId: string;
}

type Step = "date" | "time" | "details" | "payment" | "confirmation";

export function BookingFlow({ mentor, specialties, availability, menteeId }: BookingFlowProps) {
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [specialtyId, setSpecialtyId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const [weekOffset, setWeekOffset] = useState(0);
  const today = new Date();

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(addDays(today, weekOffset * 7), i)
  );

  const availableDays = availability.map((a) => a.day_of_week);

  const isDayAvailable = (date: Date) => {
    if (date < today) return false;
    return availableDays.includes(date.getDay());
  };

  const getTimeSlotsForDate = (date: Date) => {
    if (!date) return [];
    const dayAvail = availability.filter((a) => a.day_of_week === date.getDay());
    const slots: string[] = [];

    dayAvail.forEach((a) => {
      const [startH, startM] = a.start_time.split(":").map(Number);
      const [endH, endM] = a.end_time.split(":").map(Number);
      let current = startH * 60 + startM;
      const end = endH * 60 + endM;

      while (current + duration <= end) {
        const h = Math.floor(current / 60);
        const m = current % 60;
        slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
        current += 30;
      }
    });

    return slots;
  };

  const totalAmount = (mentor.hourly_rate / 60) * duration;

  const steps: { id: Step; label: string }[] = [
    { id: "date", label: "Date" },
    { id: "time", label: "Time" },
    { id: "details", label: "Details" },
    { id: "payment", label: "Payment" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  const handleCreateBooking = async () => {
    if (!selectedDate || !selectedTime) return;
    setLoading(true);
    setError(null);

    const [h, m] = selectedTime.split(":").map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(h, m, 0, 0);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        mentor_id: mentor.mentor_id,
        mentee_id: menteeId,
        specialty_id: specialtyId || null,
        session_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: duration,
        notes: notes || null,
        amount: totalAmount,
        currency: mentor.currency,
        status: "pending",
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (bookingError) {
      setError(bookingError.message);
      setLoading(false);
      return;
    }

    setBookingId(booking.id);
    // Redirect to payment
    router.push(`/checkout/${booking.id}`);
  };

  if (step === "confirmation") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </motion.div>
        <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          Your session with {mentor.full_name} has been booked. Check your email for details.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="premium" asChild>
            <a href="/dashboard/mentee/bookings">View My Bookings</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/mentors">Browse More Mentors</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress */}
      <div className="flex items-center justify-center mb-10">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className={`flex items-center gap-2 ${i <= currentStepIndex ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                i < currentStepIndex
                  ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                  : i === currentStepIndex
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-[var(--border)]"
              }`}>
                {i < currentStepIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i < currentStepIndex ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main form */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === "date" && (
              <motion.div
                key="date"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[var(--primary)]" />
                  Select a Date
                </h2>

                <div className="flex items-center justify-between mb-4">
                  <Button variant="outline" size="icon" onClick={() => setWeekOffset((p) => Math.max(0, p - 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {format(weekDays[0], "MMM d")} – {format(weekDays[6], "MMM d, yyyy")}
                  </span>
                  <Button variant="outline" size="icon" onClick={() => setWeekOffset((p) => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-6">
                  {weekDays.map((day) => {
                    const available = isDayAvailable(day);
                    const selected = selectedDate && isSameDay(day, selectedDate);
                    return (
                      <button
                        key={day.toISOString()}
                        disabled={!available}
                        onClick={() => setSelectedDate(day)}
                        className={`p-2 rounded-xl text-center transition-all ${
                          selected
                            ? "gradient-brand text-white shadow-md"
                            : available
                            ? "bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            : "opacity-30 cursor-not-allowed bg-[var(--muted)]"
                        }`}
                      >
                        <div className="text-xs font-medium">{DAY_NAMES[day.getDay()]}</div>
                        <div className="text-lg font-bold">{format(day, "d")}</div>
                        {isToday(day) && <div className="text-[9px] font-medium opacity-70">Today</div>}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="premium"
                  className="w-full"
                  disabled={!selectedDate}
                  onClick={() => setStep("time")}
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === "time" && selectedDate && (
              <motion.div
                key="time"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[var(--primary)]" />
                  Select Time
                </h2>
                <p className="text-[var(--muted-foreground)] mb-4 text-sm">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </p>

                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Session Duration</label>
                  <div className="grid grid-cols-4 gap-2">
                    {DURATIONS.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => { setDuration(d.value); setSelectedTime(null); }}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          duration === d.value
                            ? "border-[var(--primary)] bg-blue-50 dark:bg-blue-900/20 text-[var(--primary)]"
                            : "border-[var(--border)] hover:border-[var(--primary)]/50"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6 max-h-64 overflow-y-auto">
                  {getTimeSlotsForDate(selectedDate).map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedTime === slot
                          ? "border-[var(--primary)] bg-blue-50 dark:bg-blue-900/20 text-[var(--primary)]"
                          : "border-[var(--border)] hover:border-[var(--primary)]/50"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                  {getTimeSlotsForDate(selectedDate).length === 0 && (
                    <p className="col-span-full text-[var(--muted-foreground)] text-sm">
                      No available slots for this date.
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("date")}>
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    variant="premium"
                    className="flex-1"
                    disabled={!selectedTime}
                    onClick={() => setStep("details")}
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold mb-6">Session Details</h2>

                {specialties.length > 0 && (
                  <div className="mb-5">
                    <label className="text-sm font-medium mb-2 block">
                      What would you like to focus on? (optional)
                    </label>
                    <Select value={specialtyId} onValueChange={setSpecialtyId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="mb-5">
                  <label className="text-sm font-medium mb-2 block">
                    Notes for your mentor (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Share what you'd like to discuss, your goals, or any specific questions..."
                    rows={4}
                    className="flex w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("time")}>
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button variant="premium" className="flex-1" onClick={() => setStep("payment")}>
                    Continue to Payment
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[var(--primary)]" />
                  Payment
                </h2>

                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 mb-4">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 mb-6">
                  <h3 className="font-medium mb-4">Order Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Session Duration</span>
                      <span className="font-medium">{duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Date & Time</span>
                      <span className="font-medium">
                        {selectedDate && `${format(selectedDate, "MMM d")} at ${selectedTime}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Rate</span>
                      <span className="font-medium">
                        {formatCurrency(mentor.hourly_rate, mentor.currency)}/hr
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span>{formatCurrency(totalAmount, mentor.currency)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  You will be redirected to our secure payment gateway to complete your booking.
                </p>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("details")}>
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    variant="premium"
                    className="flex-1"
                    loading={loading}
                    onClick={handleCreateBooking}
                  >
                    <CreditCard className="h-4 w-4" />
                    Pay {formatCurrency(totalAmount, mentor.currency)}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={mentor.avatar_url || undefined} />
                  <AvatarFallback>{getInitials(mentor.full_name || "M")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{mentor.full_name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{mentor.current_title}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                {selectedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[var(--primary)]" />
                    <span>{format(selectedDate, "EEEE, MMMM d")}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[var(--primary)]" />
                    <span>{selectedTime} ({duration} min)</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[var(--primary)]" />
                  <span className="font-semibold">
                    {formatCurrency(totalAmount, mentor.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
