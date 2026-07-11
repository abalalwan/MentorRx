import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedMentors } from "@/components/home/featured-mentors";
import { TopSpecialties } from "@/components/home/top-specialties";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonials } from "@/components/home/testimonials";
import { PricingSection } from "@/components/home/pricing-section";
import { FaqSection } from "@/components/home/faq-section";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  let unreadCount = 0;

  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = profileData;

    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    unreadCount = count || 0;
  }

  const { data: featuredMentors } = await supabase
    .from("mentor_profiles")
    .select(`
      mentor_id, profile_id, full_name, avatar_url, country,
      headline, current_company, current_title, years_experience,
      hourly_rate, currency, is_verified, is_featured,
      total_sessions, total_reviews, average_rating
    `)
    .eq("is_featured", true)
    .eq("is_accepting_bookings", true)
    .order("average_rating", { ascending: false })
    .limit(6);

  const { data: specialties } = await supabase
    .from("specialties")
    .select("id, name, slug, icon, category")
    .eq("is_active", true)
    .order("name")
    .limit(12);

  const { data: testimonials } = await supabase
    .from("reviews")
    .select(`
      id, rating, comment,
      profiles:mentee_id(full_name, avatar_url, country)
    `)
    .eq("is_public", true)
    .gte("rating", 4)
    .not("comment", "is", null)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} unreadCount={unreadCount} />
      <main className="flex-1">
        <HeroSection />
        <FeaturedMentors mentors={featuredMentors || []} />
        <TopSpecialties specialties={specialties || []} />
        <HowItWorks />
        <Testimonials testimonials={testimonials || []} />
        <PricingSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
