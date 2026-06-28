"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MentorCard } from "@/components/mentor/mentor-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface MentorSearchProps {
  mentors: Array<{
    mentor_id: string;
    full_name: string | null;
    avatar_url: string | null;
    headline: string | null;
    current_company: string | null;
    current_title: string | null;
    country: string | null;
    hourly_rate: number;
    currency: string;
    average_rating: number;
    total_reviews: number;
    total_sessions: number;
    is_verified: boolean;
    years_experience: number | null;
    specialties?: Array<{ name: string; slug: string }>;
  }>;
  specialties: Array<{ id: string; name: string; slug: string }>;
  totalCount: number;
  currentPage: number;
  searchParams: {
    q?: string;
    specialty?: string;
    country?: string;
    sort?: string;
    min_rate?: string;
    max_rate?: string;
    min_rating?: string;
  };
}

export function MentorSearch({
  mentors,
  specialties,
  totalCount,
  currentPage,
  searchParams,
}: MentorSearchProps) {
  const [query, setQuery] = useState(searchParams.q || "");
  const [showFilters, setShowFilters] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { ...searchParams, ...updates };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: query || undefined, page: "1" });
  };

  const clearFilter = (key: string) => {
    updateParams({ [key]: undefined, page: "1" });
  };

  const activeFilters = [
    searchParams.specialty && { key: "specialty", label: specialties.find((s) => s.slug === searchParams.specialty)?.name || searchParams.specialty },
    searchParams.country && { key: "country", label: searchParams.country },
    searchParams.min_rating && { key: "min_rating", label: `${searchParams.min_rating}+ stars` },
    searchParams.min_rate && { key: "min_rate", label: `From ${searchParams.min_rate} SAR` },
    searchParams.max_rate && { key: "max_rate", label: `Up to ${searchParams.max_rate} SAR` },
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  const pageSize = 12;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Your Mentor</h1>
        <p className="text-[var(--muted-foreground)]">
          {totalCount > 0
            ? `${totalCount} mentor${totalCount === 1 ? "" : "s"} available`
            : "No mentors found"}
        </p>
      </div>

      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search by name, specialty, company..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="flex items-center gap-2">
          <Select
            value={searchParams.sort || "rating"}
            onValueChange={(v) => updateParams({ sort: v, page: "1" })}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="sessions">Most Sessions</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilters.length > 0 && (
              <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeFilters.map((filter) => (
            <Badge key={filter.key} variant="secondary" className="gap-1 pr-1">
              {filter.label}
              <button onClick={() => clearFilter(filter.key)} className="ml-1 hover:text-[var(--destructive)]">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(pathname)}
            className="text-xs h-6"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Specialty */}
          <div>
            <label className="text-sm font-medium mb-2 block">Specialty</label>
            <Select
              value={searchParams.specialty || ""}
              onValueChange={(v) => updateParams({ specialty: v || undefined, page: "1" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All specialties</SelectItem>
                {specialties.map((s) => (
                  <SelectItem key={s.id} value={s.slug}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div>
            <label className="text-sm font-medium mb-2 block">Country</label>
            <Select
              value={searchParams.country || ""}
              onValueChange={(v) => updateParams({ country: v || undefined, page: "1" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All countries</SelectItem>
                {["Saudi Arabia", "UAE", "Qatar", "Kuwait", "Bahrain", "Oman", "Egypt", "Jordan", "Lebanon", "United Kingdom", "United States"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Min Rating */}
          <div>
            <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
            <Select
              value={searchParams.min_rating || ""}
              onValueChange={(v) => updateParams({ min_rating: v || undefined, page: "1" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any rating</SelectItem>
                <SelectItem value="4.5">4.5+ stars</SelectItem>
                <SelectItem value="4">4+ stars</SelectItem>
                <SelectItem value="3.5">3.5+ stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Price */}
          <div>
            <label className="text-sm font-medium mb-2 block">Max Price (SAR/hr)</label>
            <Select
              value={searchParams.max_rate || ""}
              onValueChange={(v) => updateParams({ max_rate: v || undefined, page: "1" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any price</SelectItem>
                <SelectItem value="200">Up to 200</SelectItem>
                <SelectItem value="500">Up to 500</SelectItem>
                <SelectItem value="1000">Up to 1,000</SelectItem>
                <SelectItem value="2000">Up to 2,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--border)] p-6 space-y-4">
              <div className="flex gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <div className="text-center py-24">
          <div className="h-16 w-16 rounded-full bg-[var(--muted)] flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-[var(--muted-foreground)]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No mentors found</h3>
          <p className="text-[var(--muted-foreground)] mb-4">
            Try adjusting your search or removing filters.
          </p>
          <Button variant="outline" onClick={() => router.push(pathname)}>
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {mentors.map((mentor, index) => (
              <MentorCard key={mentor.mentor_id} mentor={mentor} index={index} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => updateParams({ page: String(currentPage - 1) })}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-[var(--muted-foreground)]">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => updateParams({ page: String(currentPage + 1) })}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
