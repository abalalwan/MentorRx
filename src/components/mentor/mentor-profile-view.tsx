"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Star, MapPin, Globe, CheckCircle, Clock, Award,
  Heart, Share2, Calendar, Users, BookOpen,
  ChevronRight
} from "lucide-react";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MentorProfileViewProps {
  mentor: {
    mentor_id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    cover_image_url: string | null;
    country: string | null;
    bio: string | null;
    linkedin_url: string | null;
    languages: string[];
    headline: string | null;
    current_company: string | null;
    current_title: string | null;
    years_experience: number | null;
    hourly_rate: number;
    currency: string;
    is_verified: boolean;
    is_accepting_bookings: boolean;
    total_sessions: number;
    total_reviews: number;
    average_rating: number;
  };
  specialties: Array<{ id: string; name: string; slug: string; category: string | null }>;
  certificates: Array<{
    id: string;
    title: string;
    issuer: string;
    issued_at: string | null;
    expires_at: string | null;
    credential_url: string | null;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    profiles: { full_name: string | null; avatar_url: string | null } | null;
  }>;
  availability: Array<{
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>;
  currentUserId?: string;
  isFavorited: boolean;
}

export function MentorProfileView({
  mentor,
  specialties,
  certificates,
  reviews,
  availability,
  currentUserId,
  isFavorited: initialFavorited,
}: MentorProfileViewProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const supabase = createClient();

  const handleFavorite = async () => {
    if (!currentUserId) {
      window.location.href = "/auth/login";
      return;
    }
    setFavoriteLoading(true);

    if (isFavorited) {
      await supabase
        .from("favorites")
        .delete()
        .eq("mentee_id", currentUserId)
        .eq("mentor_id", mentor.mentor_id);
      setIsFavorited(false);
    } else {
      await supabase
        .from("favorites")
        .insert({ mentee_id: currentUserId, mentor_id: mentor.mentor_id });
      setIsFavorited(true);
    }
    setFavoriteLoading(false);
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: reviews.filter((rev) => rev.rating === r).length,
    percent: reviews.length
      ? (reviews.filter((rev) => rev.rating === r).length / reviews.length) * 100
      : 0,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cover & Profile */}
      <div className="relative mb-6">
        <div className="h-48 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600">
          {mentor.cover_image_url && (
            <Image
              src={mentor.cover_image_url}
              alt="Cover"
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 px-6">
          <Avatar className="h-24 w-24 border-4 border-[var(--background)] shadow-xl">
            <AvatarImage src={mentor.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">
              {getInitials(mentor.full_name || "M")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{mentor.full_name}</h1>
              {mentor.is_verified && (
                <CheckCircle className="h-5 w-5 text-[var(--primary)]" />
              )}
            </div>
            <p className="text-[var(--muted-foreground)]">
              {mentor.current_title}
              {mentor.current_company && ` at ${mentor.current_company}`}
            </p>
          </div>
          <div className="flex items-center gap-2 pb-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleFavorite}
              disabled={favoriteLoading}
              aria-label="Save to favorites"
            >
              <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            {mentor.linkedin_url && (
              <Button variant="outline" size="icon" asChild>
                <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <LinkedInIcon className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard
              icon={<Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
              value={mentor.average_rating > 0 ? mentor.average_rating.toFixed(1) : "New"}
              label={`${mentor.total_reviews} reviews`}
            />
            <StatCard
              icon={<BookOpen className="h-4 w-4 text-[var(--primary)]" />}
              value={String(mentor.total_sessions)}
              label="Sessions"
            />
            <StatCard
              icon={<Clock className="h-4 w-4 text-emerald-500" />}
              value={mentor.years_experience ? `${mentor.years_experience}yr` : "—"}
              label="Experience"
            />
          </div>

          <Tabs defaultValue="about">
            <TabsList className="mb-6">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="specialties">Specialties</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({mentor.total_reviews})</TabsTrigger>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              {mentor.headline && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Headline</h2>
                  <p className="text-[var(--muted-foreground)] italic">{mentor.headline}</p>
                </div>
              )}
              {mentor.bio && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-3">About</h2>
                  <p className="text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                    {mentor.bio}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {mentor.country && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-[var(--muted-foreground)]" />
                    <span>{mentor.country}</span>
                  </div>
                )}
                {mentor.languages && mentor.languages.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-[var(--muted-foreground)]" />
                    <span>{mentor.languages.join(", ")}</span>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="specialties">
              <div className="flex flex-wrap gap-3">
                {specialties.map((spec) => (
                  <Link key={spec.id} href={`/mentors?specialty=${spec.slug}`}>
                    <Badge variant="secondary" className="text-sm py-1.5 px-3 hover:bg-[var(--primary)] hover:text-white transition-colors cursor-pointer">
                      {spec.name}
                    </Badge>
                  </Link>
                ))}
                {specialties.length === 0 && (
                  <p className="text-[var(--muted-foreground)]">No specialties listed yet.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              {reviews.length > 0 ? (
                <div>
                  {/* Rating summary */}
                  <div className="flex flex-col sm:flex-row gap-8 mb-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold">{mentor.average_rating.toFixed(1)}</div>
                      <div className="flex justify-center gap-0.5 my-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(mentor.average_rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)]">{mentor.total_reviews} reviews</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {ratingDistribution.map((r) => (
                        <div key={r.rating} className="flex items-center gap-3 text-sm">
                          <span className="w-3">{r.rating}</span>
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <div className="flex-1 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 rounded-full"
                              style={{ width: `${r.percent}%` }}
                            />
                          </div>
                          <span className="w-6 text-[var(--muted-foreground)]">{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="flex gap-4">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage src={review.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(review.profiles?.full_name || "U")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{review.profiles?.full_name || "Anonymous"}</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              ))}
                            </div>
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-[var(--foreground)]">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[var(--muted-foreground)]">No reviews yet. Be the first to book a session!</p>
              )}
            </TabsContent>

            <TabsContent value="certificates">
              {certificates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {certificates.map((cert) => (
                    <Card key={cert.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                            <Award className="h-5 w-5 text-[var(--primary)]" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{cert.title}</h3>
                            <p className="text-xs text-[var(--muted-foreground)]">{cert.issuer}</p>
                            {cert.issued_at && (
                              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                {formatDate(cert.issued_at)}
                              </p>
                            )}
                            {cert.credential_url && (
                              <a
                                href={cert.credential_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[var(--primary)] hover:underline mt-1 inline-block"
                              >
                                View credential
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--muted-foreground)]">No certificates listed.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              {/* Price */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold">
                  {formatCurrency(mentor.hourly_rate, mentor.currency)}
                </span>
                <span className="text-[var(--muted-foreground)]">/hr</span>
              </div>

              {mentor.average_rating > 0 && (
                <div className="flex items-center gap-1 mb-4">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{mentor.average_rating.toFixed(1)}</span>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    ({mentor.total_reviews} reviews)
                  </span>
                </div>
              )}

              {mentor.is_accepting_bookings ? (
                <Button variant="premium" size="lg" className="w-full mb-4" asChild>
                  <Link href={`/book/${mentor.mentor_id}`}>
                    Book a Session
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="lg" className="w-full mb-4" disabled>
                  Not Accepting Bookings
                </Button>
              )}

              <Separator className="my-4" />

              {/* Availability preview */}
              {availability.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[var(--primary)]" />
                    Availability
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {availability.map((a) => (
                      <Badge key={a.id} variant="secondary" className="text-xs">
                        {DAY_NAMES[a.day_of_week]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick info */}
              <div className="space-y-3 text-sm">
                {mentor.languages && mentor.languages.length > 0 && (
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                    <Globe className="h-4 w-4 shrink-0" />
                    <span>{mentor.languages.join(", ")}</span>
                  </div>
                )}
                {mentor.country && (
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{mentor.country}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                  <Users className="h-4 w-4 shrink-0" />
                  <span>{mentor.total_sessions} sessions completed</span>
                </div>
              </div>

              <Separator className="my-4" />

              <p className="text-xs text-center text-[var(--muted-foreground)]">
                Free cancellation up to 24 hours before
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          {icon}
          <span className="text-xl font-bold">{value}</span>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      </CardContent>
    </Card>
  );
}
