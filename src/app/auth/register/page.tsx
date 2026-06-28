"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

type Role = "mentee" | "mentor";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>("mentee");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") as Role | null;
  const supabase = createClient();

  React.useEffect(() => {
    if (initialRole === "mentor") setRole("mentor");
  }, [initialRole]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Update the profile role
    if (data.user) {
      await supabase
        .from("profiles")
        .update({ role, full_name: fullName })
        .eq("id", data.user.id);
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-[var(--muted-foreground)] mb-6">
            We sent a verification link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <Button variant="outline" asChild>
            <Link href="/auth/login">Go to Sign In</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
              <span className="text-white font-bold text-sm">Rx</span>
            </div>
            <span className="font-bold text-lg">
              Mentor<span className="text-[var(--primary)]">Rx</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold mb-2">Create your account</h1>
          <p className="text-[var(--muted-foreground)] mb-8">
            Join thousands of Healthcare professionals.
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {(["mentee", "mentor"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  role === r
                    ? "border-[var(--primary)] bg-blue-50 dark:bg-blue-900/20"
                    : "border-[var(--border)] hover:border-[var(--primary)]/50"
                }`}
              >
                <div className="font-medium text-sm capitalize">
                  I&apos;m a {r === "mentee" ? "Learner" : "Mentor"}
                </div>
                <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  {r === "mentee"
                    ? "I want to learn from experts"
                    : "I want to share my expertise"}
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 mb-6">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full mb-6"
            onClick={handleGoogleRegister}
            disabled={loading}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <Separator className="flex-1" />
            <span className="text-xs text-[var(--muted-foreground)]">or</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Dr. Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] placeholder:text-[var(--muted-foreground)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] placeholder:text-[var(--muted-foreground)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-10 pr-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] placeholder:text-[var(--muted-foreground)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="premium" className="w-full" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="text-xs text-center text-[var(--muted-foreground)] mt-4">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-[var(--primary)] hover:underline">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[var(--primary)] hover:underline">Privacy Policy</Link>.
          </p>

          <p className="text-sm text-center text-[var(--muted-foreground)] mt-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[var(--primary)] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center gradient-brand p-12">
        <div className="text-white text-center max-w-sm">
          <div className="text-5xl font-bold mb-4">Join MentorRx</div>
          <p className="text-blue-100 text-lg">
            {role === "mentor"
              ? "Share your expertise. Earn on your schedule. Help the next generation of Healthcare professionals."
              : "Connect with top Healthcare & Pharma mentors. Accelerate your career today."}
          </p>
        </div>
      </div>
    </div>
  );
}
