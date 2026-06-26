import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { MentorSetup } from "@/components/mentor/mentor-setup";

export const metadata = { title: "Complete Your Mentor Profile" };

export default async function MentorSetupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "mentor") redirect("/dashboard/mentee");

  const { data: existingMentor } = await supabase
    .from("mentors")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (existingMentor) redirect("/dashboard/mentor");

  const { data: specialties } = await supabase
    .from("specialties")
    .select("id, name, slug, category")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50">
        <MentorSetup profile={profile} specialties={specialties || []} />
      </main>
    </div>
  );
}
