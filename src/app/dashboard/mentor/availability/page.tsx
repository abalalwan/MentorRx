import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { AvailabilityEditor } from "@/components/mentor/availability-editor";

export const metadata = { title: "Manage Availability" };

export default async function AvailabilityPage() {
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
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!mentor) redirect("/dashboard/mentor/setup");

  const { data: availability } = await supabase
    .from("availability")
    .select("id, day_of_week, start_time, end_time, is_active")
    .eq("mentor_id", mentor.id)
    .order("day_of_week");

  const { data: exceptions } = await supabase
    .from("availability_exceptions")
    .select("id, exception_date, is_available, start_time, end_time, reason")
    .eq("mentor_id", mentor.id)
    .gte("exception_date", new Date().toISOString().split("T")[0])
    .order("exception_date");

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50">
        <AvailabilityEditor
          mentorId={mentor.id}
          sessionDurationOptions={[30, 60]}
          availability={
            (availability as Array<{
              id: string;
              day_of_week: number;
              start_time: string;
              end_time: string;
              is_active: boolean;
            }>) || []
          }
          exceptions={
            (exceptions as Array<{
              id: string;
              exception_date: string;
              is_available: boolean;
              start_time: string | null;
              end_time: string | null;
              reason: string | null;
            }>) || []
          }
        />
      </main>
    </div>
  );
}
