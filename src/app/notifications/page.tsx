import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { NotificationsView } from "@/components/notifications/notifications-view";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
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

  if (!profile) redirect("/auth/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, title, body, data, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  type NotifRow = {
    id: string;
    type: string;
    title: string;
    body: string;
    data: Record<string, unknown> | null;
    is_read: boolean;
    created_at: string;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50">
        <NotificationsView
          userId={user.id}
          notifications={(notifications as NotifRow[] | null) || []}
        />
      </main>
    </div>
  );
}
