import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { BookingFlow } from "@/components/booking/booking-flow";

interface Props {
  params: Promise<{ mentorId: string }>;
}

export const metadata = {
  title: "Book a Session",
};

export default async function BookSessionPage({ params }: Props) {
  const { mentorId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/book/${mentorId}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/auth/login");

  const { data: mentor } = await supabase
    .from("mentor_profiles")
    .select("*")
    .eq("mentor_id", mentorId)
    .eq("is_accepting_bookings", true)
    .single();

  if (!mentor) notFound();

  const msResult = await supabase
    .from("mentor_specialties")
    .select("specialty_id")
    .eq("mentor_id", mentorId);
  const specialtyIds = (msResult.data as Array<{ specialty_id: string }> | null || []).map((r) => r.specialty_id);

  const specialtiesResult = specialtyIds.length
    ? await supabase.from("specialties").select("id, name").in("id", specialtyIds)
    : { data: [] as Array<{ id: string; name: string }> };
  const specialties = (specialtiesResult.data as Array<{ id: string; name: string }> | null) || [];

  const { data: availability } = await supabase
    .from("availability")
    .select("*")
    .eq("mentor_id", mentorId)
    .eq("is_active", true);

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50">
        <BookingFlow
          mentor={mentor}
          specialties={specialties}
          availability={availability || []}
          menteeId={user.id}
        />
      </main>
    </div>
  );
}
