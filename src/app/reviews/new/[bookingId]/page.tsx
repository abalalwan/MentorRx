"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { formatDate, getInitials } from "@/lib/utils";

export default function NewReviewPage() {
  return (
    <Suspense>
      <NewReviewContent />
    </Suspense>
  );
}

interface BookingForReview {
  id: string;
  mentor_id: string;
  session_date: string;
  duration_minutes: number;
  status: string;
  mentor_name: string | null;
  mentor_avatar: string | null;
  mentor_headline: string | null;
}

function NewReviewContent() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<BookingForReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    async function fetchBooking() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/login");
        return;
      }

      const { data: bookingData } = await supabase
        .from("bookings")
        .select("id, mentor_id, session_date, duration_minutes, status")
        .eq("id", bookingId)
        .eq("mentee_id", user.id)
        .single();

      if (!bookingData || bookingData.status !== "completed") {
        router.replace("/dashboard/mentee/bookings");
        return;
      }

      // Check if review already exists
      const { data: existing } = await supabase
        .from("reviews")
        .select("id")
        .eq("booking_id", bookingId)
        .single();

      if (existing) {
        setAlreadyReviewed(true);
        setLoading(false);
        return;
      }

      // Fetch mentor details
      const { data: mentorData } = await supabase
        .from("mentors")
        .select("id, profile_id, headline")
        .eq("id", (bookingData as { mentor_id: string }).mentor_id)
        .single();

      let mentorName = null;
      let mentorAvatar = null;
      if (mentorData) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", (mentorData as { profile_id: string }).profile_id)
          .single();
        mentorName = (profileData as { full_name: string | null } | null)?.full_name || null;
        mentorAvatar = (profileData as { avatar_url: string | null } | null)?.avatar_url || null;
      }

      setBooking({
        id: bookingData.id,
        mentor_id: bookingData.mentor_id,
        session_date: bookingData.session_date,
        duration_minutes: bookingData.duration_minutes,
        status: bookingData.status,
        mentor_name: mentorName,
        mentor_avatar: mentorAvatar,
        mentor_headline: (mentorData as { headline: string | null } | null)?.headline || null,
      });
      setLoading(false);
    }

    fetchBooking();
  }, [bookingId, router]);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    if (!booking) return;

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: reviewError } = await (supabase.from("reviews") as any).insert({
      booking_id: bookingId,
      mentor_id: booking.mentor_id,
      mentee_id: user.id,
      rating,
      comment: comment.trim() || null,
      is_public: isPublic,
    });

    if (reviewError) {
      setError(reviewError.message);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (alreadyReviewed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Already Reviewed</h2>
            <p className="text-[var(--muted-foreground)] mb-6">You have already submitted a review for this session.</p>
            <Button variant="outline" onClick={() => router.push("/dashboard/mentee/bookings")}>
              Back to Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
              <p className="text-[var(--muted-foreground)] mb-6">
                Your review helps others find great mentors.
              </p>
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${i < rating ? "text-yellow-400 fill-current" : "text-slate-300"}`}
                  />
                ))}
              </div>
              <Button variant="premium" onClick={() => router.push("/dashboard/mentee/bookings")}>
                Back to Bookings
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold mb-2">Leave a Review</h1>
            <p className="text-[var(--muted-foreground)] mb-6">
              Share your experience from your session on{" "}
              {booking ? formatDate(booking.session_date) : ""}
            </p>

            {/* Mentor info */}
            {booking && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 mb-6">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={booking.mentor_avatar || undefined} />
                  <AvatarFallback>{getInitials(booking.mentor_name || "?")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{booking.mentor_name}</p>
                  {booking.mentor_headline && (
                    <p className="text-xs text-[var(--muted-foreground)]">{booking.mentor_headline}</p>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 mb-4">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Star rating */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Rating *</p>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => {
                  const val = i + 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(val)}
                      onMouseEnter={() => setHoveredRating(val)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          val <= (hoveredRating || rating)
                            ? "text-yellow-400 fill-current"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              {rating > 0 && (
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="text-sm font-medium block mb-2">
                Comment <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] placeholder:text-[var(--muted-foreground)] resize-none"
                rows={4}
                placeholder="Share what you learned, how the mentor helped, what could be improved..."
                maxLength={1000}
              />
              <p className="text-xs text-[var(--muted-foreground)] mt-1 text-right">{comment.length}/1000</p>
            </div>

            {/* Public toggle */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] mb-6">
              <input
                id="is-public"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="is-public" className="cursor-pointer">
                <p className="text-sm font-medium">Make this review public</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Public reviews appear on the mentor&apos;s profile.
                </p>
              </label>
            </div>

            <div className="space-y-3">
              <Button
                variant="premium"
                className="w-full"
                loading={submitting}
                onClick={handleSubmit}
                disabled={rating === 0}
              >
                Submit Review
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/dashboard/mentee/bookings")}
              >
                Skip
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
