"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Menu, X, ChevronDown, LogOut, Settings,
  User, LayoutDashboard, BookOpen, Heart, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import type { Profile } from "@/types/database";

interface HeaderProps {
  profile?: Profile | null;
  unreadCount?: number;
}

export function Header({ profile, unreadCount = 0 }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/mentors", label: "Find Mentors" },
    { href: "/specialties", label: "Specialties" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: "Pricing" },
  ];

  const dashboardHref =
    profile?.role === "mentor"
      ? "/dashboard/mentor"
      : profile?.role === "admin"
      ? "/dashboard/admin"
      : "/dashboard/mentee";

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm border-b border-[var(--border)]"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
              <span className="text-white font-bold text-sm">Rx</span>
            </div>
            <span className="font-bold text-lg text-[var(--foreground)]">
              Mentor<span className="text-[var(--primary)]">Rx</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-[var(--primary)] ${
                  pathname === link.href
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {profile ? (
              <>
                {/* Search */}
                <Link href="/mentors">
                  <Button variant="ghost" size="icon-sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </Link>

                {/* Notifications */}
                <Link href="/notifications" className="relative">
                  <Button variant="ghost" size="icon-sm">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || ""} />
                      <AvatarFallback className="text-xs">
                        {getInitials(profile.full_name || profile.email)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)] hidden sm:block" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsUserMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-xl z-20 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-[var(--border)]">
                            <p className="font-medium text-sm truncate">{profile.full_name}</p>
                            <p className="text-xs text-[var(--muted-foreground)] truncate">{profile.email}</p>
                          </div>
                          <div className="py-1">
                            <MenuLink href={dashboardHref} icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" onClick={() => setIsUserMenuOpen(false)} />
                            <MenuLink href="/profile" icon={<User className="h-4 w-4" />} label="Profile" onClick={() => setIsUserMenuOpen(false)} />
                            {profile.role === "mentee" && (
                              <MenuLink href="/dashboard/mentee/bookings" icon={<BookOpen className="h-4 w-4" />} label="My Bookings" onClick={() => setIsUserMenuOpen(false)} />
                            )}
                            {profile.role === "mentee" && (
                              <MenuLink href="/dashboard/mentee/favorites" icon={<Heart className="h-4 w-4" />} label="Favorites" onClick={() => setIsUserMenuOpen(false)} />
                            )}
                            <MenuLink href="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" onClick={() => setIsUserMenuOpen(false)} />
                          </div>
                          <div className="py-1 border-t border-[var(--border)]">
                            <button
                              onClick={handleSignOut}
                              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[var(--destructive)] hover:bg-[var(--muted)] transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button size="sm" variant="premium" asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile toggle */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[var(--border)] bg-[var(--background)]"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                >
                  {link.label}
                </Link>
              ))}
              {!profile && (
                <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border)]">
                  <Button variant="outline" asChild>
                    <Link href="/auth/login">Sign in</Link>
                  </Button>
                  <Button variant="premium" asChild>
                    <Link href="/auth/register">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--muted)] transition-colors"
    >
      <span className="text-[var(--muted-foreground)]">{icon}</span>
      {label}
    </Link>
  );
}
