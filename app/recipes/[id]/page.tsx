"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";

export default function RecipeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params?.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<any>(null);
  const [authorName, setAuthorName] = useState<string>("Unknown");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipeAndAuthor = async () => {
      setIsLoading(true);
      setHasError(null);
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      // Fetch recipe (no join)
      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", recipeId)
        .single();
      if (recipeError) {
        setHasError(recipeError.message);
        setIsLoading(false);
        return;
      }
      setRecipe(recipeData);
      // Fetch author profile
      if (recipeData?.user_id) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", recipeData.user_id)
          .single();
        if (!profileError && profileData?.full_name) {
          setAuthorName(profileData.full_name);
        }
      }
      setIsLoading(false);
    };
    if (recipeId) fetchRecipeAndAuthor();
  }, [recipeId]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400">Loading recipe...</div>;
  }
  if (hasError) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{hasError}</div>;
  }
  if (!recipe) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400">Recipe not found.</div>;
  }

  const isOwner = userId && recipe.user_id === userId;

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-900 px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow p-8">
        <Link href="/dashboard" className="text-emerald-700 dark:text-emerald-400 hover:underline text-sm mb-4 inline-block">&larr; Back to Dashboard</Link>
        <div className="h-40 w-full bg-slate-200 dark:bg-slate-700 rounded mb-6 flex items-center justify-center text-slate-400 text-4xl">
          🍲
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{recipe.title}</h1>
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">By: {authorName}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">Uploaded: {new Date(recipe.created_at).toLocaleDateString()}</div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Ingredients</h2>
          <div className="text-base text-slate-800 dark:text-slate-200 whitespace-pre-line">{recipe.ingredients || 'No ingredients listed.'}</div>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Instructions</h2>
          <div className="text-base text-slate-800 dark:text-slate-200 whitespace-pre-line">{recipe.instructions || 'No instructions provided.'}</div>
        </div>
        <div className="mb-4 flex flex-wrap gap-4">
          <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full text-xs font-medium">Category: {recipe.category || 'N/A'}</span>
          <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full text-xs font-medium">Difficulty: {recipe.difficulty || 'N/A'}</span>
          <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full text-xs font-medium">Cooking Time: {recipe.cooking_time ? `${recipe.cooking_time} min` : 'N/A'}</span>
        </div>
        {isOwner && (
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition"
          >
            Edit Recipe
          </Link>
        )}
      </div>
    </main>
  );
} 