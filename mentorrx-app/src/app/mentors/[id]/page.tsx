import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MentorProfileView } from "@/components/mentor/mentor-profile-view";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: mentor } = await supabase
    .from("mentor_profiles")
    .select("full_name, headline, current_title, current_company")
    .eq("mentor_id", id)
    .single();

  if (!mentor) return { title: "Mentor Not Found" };

  return {
    title: `${mentor.full_name} — ${mentor.current_title || "Healthcare Mentor"}`,
    description: mentor.headline || `Book a session with ${mentor.full_name}`,
  };
}

export default async function MentorProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data;
  }

  // Get mentor profile
  const { data: mentor } = await supabase
    .from("mentor_profiles")
    .select("*")
    .eq("mentor_id", id)
    .single();

  if (!mentor) notFound();

  // Get specialties (two queries to avoid unresolved FK type errors)
  const msResult = await supabase
    .from("mentor_specialties")
    .select("specialty_id")
    .eq("mentor_id", id);
  const specIds = (msResult.data as Array<{ specialty_id: string }> | null || []).map((r) => r.specialty_id);
  const specResult = specIds.length
    ? await supabase.from("specialties").select("id, name, slug, category").in("id", specIds)
    : { data: [] as Array<{ id: string; name: string; slug: string; category: string | null }> };
  const mentorSpecialties = (specResult.data as Array<{ id: string; name: string; slug: string; category: string | null }> | null) || [];

  // Get certificates
  const { data: certificates } = await supabase
    .from("certificates")
    .select("*")
    .eq("mentor_id", id)
    .order("issued_at", { ascending: false });

  // Get reviews (public only)
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      id, rating, comment, created_at,
      profiles:mentee_id(full_name, avatar_url)
    `)
    .eq("mentor_id", id)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(10);

  // Get availability
  const { data: availability } = await supabase
    .from("availability")
    .select("*")
    .eq("mentor_id", id)
    .eq("is_active", true)
    .order("day_of_week");

  // Check if current user has favorited this mentor
  let isFavorited = false;
  if (user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("id")
      .eq("mentee_id", user.id)
      .eq("mentor_id", id)
      .single();
    isFavorited = !!fav;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <main className="flex-1">
        <MentorProfileView
          mentor={mentor}
          specialties={mentorSpecialties}
          certificates={(certificates || []) as Array<{ id: string; title: string; issuer: string; issued_at: string | null; expires_at: string | null; credential_url: string | null }>}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          reviews={(reviews || []) as any}
          availability={availability || []}
          currentUserId={user?.id}
          isFavorited={isFavorited}
        />
      </main>
      <Footer />
    </div>
  );
}
