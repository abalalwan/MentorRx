"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Favorite = {
  favId: string;
  mentorId: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  hourly_rate: number;
  currency: string;
  average_rating: number;
  total_reviews: number;
  is_accepting_bookings: boolean;
};

export function FavoritesView({
  userId,
  favorites: initialFavorites,
}: {
  userId: string;
  favorites: Favorite[];
}) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const supabase = createClient();

  const removeFavorite = async (favId: string) => {
    await supabase.from("favorites").delete().eq("id", favId);
    setFavorites((prev) => prev.filter((f) => f.favId !== favId));
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Saved Mentors</h1>
        <p className="text-[var(--muted-foreground)]">
          {favorites.length} saved mentor{favorites.length !== 1 ? "s" : ""}
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="mb-4">You haven&apos;t saved any mentors yet.</p>
          <Button variant="premium" asChild>
            <Link href="/mentors">Explore Mentors</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {favorites.map((fav, i) => (
              <motion.div
                key={fav.favId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={fav.avatar_url || undefined} />
                          <AvatarFallback>{getInitials(fav.full_name || "?")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold line-clamp-1">{fav.full_name || "Mentor"}</p>
                          {fav.headline && (
                            <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                              {fav.headline}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFavorite(fav.favId)}
                        className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                        title="Remove from favorites"
                      >
                        <Heart className="h-5 w-5 fill-current" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-sm mb-4">
                      {fav.average_rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                          <span className="font-medium">{fav.average_rating.toFixed(1)}</span>
                          <span className="text-[var(--muted-foreground)]">({fav.total_reviews})</span>
                        </span>
                      )}
                      <span className="text-[var(--muted-foreground)]">·</span>
                      <span className="font-medium">
                        {formatCurrency(fav.hourly_rate, fav.currency)}/hr
                      </span>
                    </div>

                    <div className="mt-auto flex gap-2">
                      <Button variant="premium" size="sm" className="flex-1" asChild>
                        <Link href={`/book/${fav.mentorId}`}>
                          <BookOpen className="h-3.5 w-3.5 mr-1" />
                          Book
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/mentors/${fav.mentorId}`}>Profile</Link>
                      </Button>
                    </div>

                    {!fav.is_accepting_bookings && (
                      <Badge variant="secondary" className="mt-2 self-start text-xs">
                        Not accepting bookings
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
