"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface MentorSearchParams {
  search?: string;
  specialty?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  country?: string;
  isVerified?: boolean;
  page?: number;
  pageSize?: number;
}

interface MentorResult {
  mentor_id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  current_title: string | null;
  current_company: string | null;
  country: string | null;
  hourly_rate: number;
  currency: string;
  average_rating: number;
  total_reviews: number;
  total_sessions: number;
  is_verified: boolean;
  is_accepting_bookings: boolean;
  years_experience: number | null;
}

export function useMentors(params: MentorSearchParams = {}) {
  const [mentors, setMentors] = useState<MentorResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("mentor_profiles")
      .select("*", { count: "exact" })
      .eq("is_accepting_bookings", true);

    if (params.isVerified !== undefined) {
      query = query.eq("is_verified", params.isVerified);
    }
    if (params.minRate !== undefined) {
      query = query.gte("hourly_rate", params.minRate);
    }
    if (params.maxRate !== undefined) {
      query = query.lte("hourly_rate", params.maxRate);
    }
    if (params.minRating !== undefined) {
      query = query.gte("average_rating", params.minRating);
    }
    if (params.country) {
      query = query.eq("country", params.country);
    }
    if (params.search) {
      query = query.or(
        `full_name.ilike.%${params.search}%,headline.ilike.%${params.search}%,current_title.ilike.%${params.search}%`
      );
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query
      .order("average_rating", { ascending: false })
      .order("total_sessions", { ascending: false })
      .range(from, to);

    const { data, count, error: queryError } = await query;

    if (queryError) {
      setError(queryError.message);
    } else {
      setMentors((data as MentorResult[]) || []);
      setTotal(count || 0);
    }
    setLoading(false);
  }, [
    supabase,
    params.search,
    params.specialty,
    params.minRate,
    params.maxRate,
    params.minRating,
    params.country,
    params.isVerified,
    page,
    pageSize,
  ]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  return { mentors, total, loading, error, refetch: fetchMentors };
}

export function useMentorProfile(mentorId: string | null | undefined) {
  const [mentor, setMentor] = useState<MentorResult | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!mentorId) {
      setLoading(false);
      return;
    }

    supabase
      .from("mentor_profiles")
      .select("*")
      .eq("mentor_id", mentorId)
      .single()
      .then(({ data }) => {
        setMentor(data as MentorResult | null);
        setLoading(false);
      });
  }, [mentorId, supabase]);

  return { mentor, loading };
}
