"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type UserRow = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
};

const ROLE_COLORS: Record<string, string> = {
  mentee: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  mentor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const FILTERS = ["all", "mentee", "mentor", "admin"];

export function AdminUsersView({ users: initial }: { users: UserRow[] }) {
  const [users, setUsers] = useState(initial);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const supabase = createClient();

  const filtered = users.filter((u) => {
    const matchesFilter = filter === "all" || u.role === filter;
    const matchesSearch =
      !search ||
      (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleActive = async (userId: string, active: boolean) => {
    await supabase.from("profiles").update({ is_active: active }).eq("id", userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: active } : u))
    );
  };

  const counts = {
    mentee: users.filter((u) => u.role === "mentee").length,
    mentor: users.filter((u) => u.role === "mentor").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-[var(--muted-foreground)]">
            {users.length} users · {counts.mentee} mentees · {counts.mentor} mentors · {counts.admin} admins
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-[var(--primary)] text-white"
                  : "border border-[var(--border)] hover:border-[var(--primary)]/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.01 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={u.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(u.full_name || u.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{u.full_name || "—"}</p>
                        <p className="text-xs text-[var(--muted-foreground)] truncate">{u.email}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">Joined {formatDate(u.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[u.role] || ""}`}
                      >
                        {u.role}
                      </span>
                      <Button
                        variant={u.is_active ? "outline" : "premium"}
                        size="sm"
                        onClick={() => toggleActive(u.id, !u.is_active)}
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
