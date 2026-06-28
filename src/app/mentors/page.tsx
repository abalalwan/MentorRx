import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MentorSearch } from "@/components/search/mentor-search";

interface SearchParams {
  q?: string;
  specialty?: string;
  country?: string;
  language?: string;
  min_rate?: string;
  max_rate?: string;
  min_rating?: string;
  sort?: string;
  page?: string;
}

export const metadata = {
  title: "Find Mentors",
  description: "Browse and search Healthcare & Pharma mentors. Filter by specialty, country, price, and more.",
};

export default async function MentorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data;
  }

  // Build query
  let query = supabase
    .from("mentor_profiles")
    .select("*")
    .eq("is_accepting_bookings", true);

  if (params.q) {
    query = query.or(
      `full_name.ilike.%${params.q}%,headline.ilike.%${params.q}%,current_company.ilike.%${params.q}%,current_title.ilike.%${params.q}%`
    );
  }

  if (params.country) {
    query = query.eq("country", params.country);
  }

  if (params.min_rate) {
    query = query.gte("hourly_rate", parseFloat(params.min_rate));
  }

  if (params.max_rate) {
    query = query.lte("hourly_rate", parseFloat(params.max_rate));
  }

  if (params.min_rating) {
    query = query.gte("average_rating", parseFloat(params.min_rating));
  }

  // Sorting
  switch (params.sort) {
    case "price_asc":
      query = query.order("hourly_rate", { ascending: true });
      break;
    case "price_desc":
      query = query.order("hourly_rate", { ascending: false });
      break;
    case "sessions":
      query = query.order("total_sessions", { ascending: false });
      break;
    case "newest":
      query = query.order("mentor_id", { ascending: false });
      break;
    default:
      query = query.order("average_rating", { ascending: false });
  }

  const page = parseInt(params.page || "1");
  const pageSize = 12;
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data: mentors, count } = await query;

  // Get specialties for filter
  const { data: specialties } = await supabase
    .from("specialties")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name");

  // Get mentor specialties for the fetched mentors (two queries to avoid FK type errors)
  const mentorIds = (mentors || []).map((m) => m.mentor_id);
  type MsRow = { mentor_id: string; specialty_id: string };
  const msResult = mentorIds.length
    ? await supabase
        .from("mentor_specialties")
        .select("mentor_id, specialty_id")
        .in("mentor_id", mentorIds)
    : { data: [] as MsRow[] };
  const msRows = (msResult.data as MsRow[] | null) || [];

  const allSpecialtyIds = [...new Set(msRows.map((r) => r.specialty_id))];
  type SpecRow = { id: string; name: string; slug: string };
  const specResult = allSpecialtyIds.length
    ? await supabase.from("specialties").select("id, name, slug").in("id", allSpecialtyIds)
    : { data: [] as SpecRow[] };
  const specMap = new Map(((specResult.data as SpecRow[] | null) || []).map((s) => [s.id, s]));

  // Attach specialties to mentors
  const mentorsWithSpecialties = (mentors || []).map((mentor) => ({
    ...mentor,
    specialties: msRows
      .filter((ms) => ms.mentor_id === mentor.mentor_id)
      .map((ms) => specMap.get(ms.specialty_id))
      .filter(Boolean) as SpecRow[],
  }));

  // Filter by specialty slug if provided
  let filteredMentors = mentorsWithSpecialties;
  if (params.specialty) {
    filteredMentors = mentorsWithSpecialties.filter((m) =>
      m.specialties.some((s) => s.slug === params.specialty)
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <main className="flex-1">
        <MentorSearch
          mentors={filteredMentors}
          specialties={specialties || []}
          totalCount={count || 0}
          currentPage={page}
          searchParams={params}
        />
      </main>
      <Footer />
    </div>
  );
}
