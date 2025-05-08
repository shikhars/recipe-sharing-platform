"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (data: SignUpForm) => {
    setIsLoading(true);
    setHasError(null);
    setIsSuccess(false);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    setIsLoading(false);
    if (error) {
      setHasError(error.message);
      return;
    }
    setIsSuccess(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-100 dark:bg-slate-900 transition-colors">
      <form
        className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-8 space-y-6"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <h2 className="text-3xl font-bold mb-2 text-center text-slate-900 dark:text-white">Sign Up</h2>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
            {...register("email")}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
            {...register("password")}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>
        <Button type="submit" variant="primary" disabled={isLoading} className="w-full text-base py-2 rounded-lg">
          {isLoading ? "Signing up..." : "Sign Up"}
        </Button>
        {hasError && <p className="text-red-500 text-sm text-center">{hasError}</p>}
        {isSuccess && (
          <p className="text-emerald-600 dark:text-emerald-400 text-sm text-center">
            Check your email to confirm your account!
          </p>
        )}
        <p className="text-xs text-center mt-2 text-slate-600 dark:text-slate-300">
          Already have an account?{' '}
          <a href="/auth/sign-in" className="text-emerald-700 dark:text-emerald-400 hover:underline">Sign In</a>
        </p>
      </form>
    </div>
  );
} 