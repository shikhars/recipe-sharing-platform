"use client";

import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const profileSchema = z.object({
  username: z.string().min(2, "Username is required"),
  full_name: z.string().min(2, "Display name is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type DashboardView = 'dashboard' | 'edit-profile';

async function generateUniqueUsername(base: string): Promise<string> {
  let username = base;
  let suffix = 1;
  while (true) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (!data) break;
    username = `${base}${suffix}`;
    suffix++;
  }
  return username;
}

async function getDefaultProfile(user: { email?: string }): Promise<{ username: string; full_name: string }> {
  const emailPrefix = user.email?.split("@")[0] || "user";
  const username = await generateUniqueUsername(emailPrefix);
  return {
    username,
    full_name: emailPrefix,
  };
}

function ProfileForm({ onSave, initialProfile }: { onSave: () => void; initialProfile: ProfileFormData }) {
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [hasSuccess, setHasSuccess] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialProfile,
  });

  useEffect(() => {
    reset(initialProfile);
  }, [initialProfile, reset]);

  const onSubmit = async (values: ProfileFormData) => {
    setIsSaving(true);
    setHasError(null);
    setHasSuccess(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setHasError("Not authenticated");
      setIsSaving(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setIsSaving(false);
    if (error) {
      setHasError(error.message);
      return;
    }
    setHasSuccess(true);
    onSave();
  };

  return (
    <form
      className="w-full max-w-xl mx-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow p-6 mb-8"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Edit Profile</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          type="text"
          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
          {...register("username")}
          disabled={isSaving}
        />
        {errors.username && (
          <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200" htmlFor="full_name">
          Display Name
        </label>
        <input
          id="full_name"
          type="text"
          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
          {...register("full_name")}
          disabled={isSaving}
        />
        {errors.full_name && (
          <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={isSaving} className="w-full text-base py-2 rounded-lg">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={onSave} className="w-full text-base py-2 rounded-lg">
          Cancel
        </Button>
      </div>
      {hasSuccess && <p className="text-emerald-600 text-sm mt-2 text-center">Profile updated!</p>}
      {hasError && <p className="text-red-600 text-sm mt-2 text-center">{hasError}</p>}
    </form>
  );
}

function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    setHasError(null);
    const { error } = await supabase.auth.signOut();
    setIsLoading(false);
    if (error) setHasError(error.message);
    else router.replace("/");
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition w-fit text-base disabled:opacity-60"
      >
        {isLoading ? "Signing out..." : "Sign Out"}
      </button>
      {hasError && <p className="text-red-600 text-xs mt-1">{hasError}</p>}
    </div>
  );
}

/**
 * Dashboard: Shows a list of recipes uploaded by all users. Redirects to homepage if not logged in.
 */
export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({}); // user_id -> full_name
  const [hasError, setHasError] = useState<string | null>(null);
  const [dashboardView, setDashboardView] = useState<DashboardView>('dashboard');
  const [profile, setProfile] = useState<ProfileFormData | null>(null);

  useEffect(() => {
    const checkSessionAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/");
        return;
      }
      // Fetch current user's profile
      const { data: { user } } = await supabase.auth.getUser();
      let displayProfile: ProfileFormData | null = null;
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single();
        if (profileData) {
          displayProfile = profileData;
        }
      }
      setProfile(displayProfile);
      // Fetch recipes (no join)
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select('id, title, user_id, created_at')
        .order('created_at', { ascending: false });
      if (recipesError) {
        setHasError(recipesError.message);
        setIsLoading(false);
        return;
      }
      setRecipes(recipesData || []);
      // Fetch all relevant profiles
      const userIds = [...new Set((recipesData || []).map((r: any) => r.user_id))];
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        if (profilesError) {
          setHasError(profilesError.message);
          setIsLoading(false);
          return;
        }
        // Map user_id to full_name
        const profileMap: Record<string, string> = {};
        for (const p of profilesData || []) {
          profileMap[p.id] = p.full_name;
        }
        setProfiles(profileMap);
      }
      setIsLoading(false);
    };
    checkSessionAndFetch();
  }, [router, dashboardView]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400">
        Loading dashboard...
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Error loading recipes: {hasError}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-900 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Recipe Dashboard</h1>
            {profile && (
              <div className="text-lg text-slate-700 dark:text-slate-200 mb-2">
                Welcome, <span className="font-semibold">{profile.full_name}</span>!
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              className="px-4 py-2 rounded-lg"
              onClick={() => setDashboardView('edit-profile')}
            >
              Edit Profile
            </Button>
            <Link
              href="/dashboard/add"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition"
            >
              + Add Recipe
            </Link>
            <SignOutButton />
          </div>
        </div>
        {dashboardView === 'edit-profile' && profile && (
          <ProfileForm
            initialProfile={profile}
            onSave={() => setDashboardView('dashboard')}
          />
        )}
        {dashboardView === 'dashboard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recipes && recipes.length > 0 ? (
              recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow p-5 flex flex-col gap-2"
                >
                  <div className="h-32 w-full bg-slate-200 dark:bg-slate-700 rounded mb-3 flex items-center justify-center text-slate-400 text-2xl">
                    🍲
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1 truncate">{recipe.title}</h2>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Uploaded: {new Date(recipe.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    By: {profiles[recipe.user_id] || 'Unknown'}
                  </div>
                  <Link
                    href={`/recipes/${recipe.id}`}
                    className="text-emerald-700 dark:text-emerald-400 hover:underline text-sm mt-auto"
                  >
                    View Recipe
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-slate-500 dark:text-slate-400">
                No recipes found.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
} 