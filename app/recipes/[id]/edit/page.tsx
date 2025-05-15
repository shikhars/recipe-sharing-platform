"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/AuthContext";

const recipeSchema = z.object({
  title: z.string().min(2, "Title is required"),
  ingredients: z.string().min(2, "Ingredients are required"),
  instructions: z.string().min(2, "Instructions are required"),
  cooking_time: z.coerce.number().int().min(1, "Cooking time must be at least 1 minute"),
  difficulty: z.string().min(1, "Difficulty is required"),
  category: z.string().min(1, "Category is required"),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

type Recipe = {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  ingredients: string[] | string;
  instructions: string[] | string;
  cooking_time: number;
  category: string;
  difficulty: string;
};

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params?.id as string;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecipeFormData>({ resolver: zodResolver(recipeSchema) });

  useEffect(() => {
    const fetchRecipe = async () => {
      setIsLoading(true);
      setHasError(null);
      // Fetch recipe
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
      if (!user || recipeData.user_id !== user.id) {
        setIsOwner(false);
        setHasError("You are not authorized to edit this recipe.");
        setIsLoading(false);
        return;
      }
      setIsOwner(true);
      reset({
        title: recipeData.title || "",
        ingredients: Array.isArray(recipeData.ingredients)
          ? recipeData.ingredients.join("\n")
          : recipeData.ingredients || "",
        instructions: Array.isArray(recipeData.instructions)
          ? recipeData.instructions.join("\n")
          : recipeData.instructions || "",
        cooking_time: recipeData.cooking_time || 1,
        difficulty: recipeData.difficulty || "",
        category: recipeData.category || "",
      });
      setRecipe(recipeData);
      setIsLoading(false);
    };
    if (recipeId) fetchRecipe();
  }, [recipeId, reset]);

  const onSubmit = async (values: RecipeFormData) => {
    setIsSaving(true);
    setHasError(null);

    // Convert string to array for ingredients and instructions
    const ingredientsArray = values.ingredients
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    const instructionsArray = values.instructions
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from("recipes")
      .update({
        ...values,
        ingredients: ingredientsArray,
        instructions: instructionsArray,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recipeId);
    setIsSaving(false);
    if (error) {
      setHasError(error.message);
      return;
    }
    router.push(`/recipes/${recipeId}`);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400">Loading recipe...</div>;
  }
  if (hasError) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{hasError}</div>;
  }
  if (!isOwner) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">You are not authorized to edit this recipe.</div>;
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-900 px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow p-8">
        <Link href={`/recipes/${recipeId}`} className="text-emerald-700 dark:text-emerald-400 hover:underline text-sm mb-4 inline-block">&larr; Cancel / Back to Recipe</Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Edit Recipe</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200" htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
              {...register("title")}
              disabled={isSaving}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200" htmlFor="ingredients">Ingredients</label>
            <textarea
              id="ingredients"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
              rows={4}
              {...register("ingredients")}
              disabled={isSaving}
            />
            {errors.ingredients && <p className="text-red-500 text-xs mt-1">{errors.ingredients.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200" htmlFor="instructions">Instructions</label>
            <textarea
              id="instructions"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
              rows={5}
              {...register("instructions")}
              disabled={isSaving}
            />
            {errors.instructions && <p className="text-red-500 text-xs mt-1">{errors.instructions.message}</p>}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200" htmlFor="cooking_time">Cooking Time (min)</label>
              <input
                id="cooking_time"
                type="number"
                min={1}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
                {...register("cooking_time")}
                disabled={isSaving}
              />
              {errors.cooking_time && <p className="text-red-500 text-xs mt-1">{errors.cooking_time.message}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200" htmlFor="difficulty">Difficulty</label>
              <input
                id="difficulty"
                type="text"
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
                {...register("difficulty")}
                disabled={isSaving}
              />
              {errors.difficulty && <p className="text-red-500 text-xs mt-1">{errors.difficulty.message}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200" htmlFor="category">Category</label>
              <input
                id="category"
                type="text"
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
                {...register("category")}
                disabled={isSaving}
              />
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition text-base disabled:opacity-60"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          {hasError && <p className="text-red-600 text-sm mt-2 text-center">{hasError}</p>}
        </form>
      </div>
    </main>
  );
} 