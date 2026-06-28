import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { MentorProfileEdit } from "@/components/mentor/mentor-profile-edit";

export const metadata = { title: "Edit Mentor Profile" };

export default async function MentorProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "mentor") redirect("/dashboard/mentee");

  const { data: mentor } = await supabase
    .from("mentors")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  if (!mentor) redirect("/dashboard/mentor/setup");

  const msResult = await supabase
    .from("mentor_specialties")
    .select("specialty_id")
    .eq("mentor_id", mentor.id);
  const selectedSpecialtyIds = (
    (msResult.data as Array<{ specialty_id: string }> | null) || []
  ).map((r) => r.specialty_id);

  const { data: allSpecialties } = await supabase
    .from("specialties")
    .select("id, name, slug, category")
    .eq("is_active", true)
    .order("name");

  const { data: certifications } = await supabase
    .from("certificates")
    .select("id, title, issuer, issued_at, expires_at, credential_url")
    .eq("mentor_id", mentor.id)
    .order("issued_at", { ascending: false });

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50">
        <MentorProfileEdit
          profile={profile}
          mentor={mentor}
          selectedSpecialtyIds={selectedSpecialtyIds}
          allSpecialties={(allSpecialties as Array<{ id: string; name: string; slug: string; category: string | null }>) || []}
          certifications={(certifications as Array<{ id: string; title: string; issuer: string; issued_at: string | null; expires_at: string | null; credential_url: string | null }>) || []}
        />
      </main>
    </div>
  );
}
