"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const recipeSchema = z.object({
  title: z.string().min(2, "Title is required"),
  ingredients: z.string().min(2, "Ingredients are required"),
  instructions: z.string().min(2, "Instructions are required"),
  cooking_time: z.coerce.number().int().min(1, "Cooking time must be at least 1 minute"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.string().min(2, "Category is required"),
});

type RecipeForm = z.infer<typeof recipeSchema>;

export default function AddRecipePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RecipeForm>({ resolver: zodResolver(recipeSchema) });

  const onSubmit = async (data: RecipeForm) => {
    setIsLoading(true);
    setHasError(null);
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setHasError("You must be logged in to add a recipe.");
      setIsLoading(false);
      return;
    }
    // Convert ingredients and instructions to arrays
    const ingredients = data.ingredients.split('\n').map((s) => s.trim()).filter(Boolean);
    const instructions = data.instructions.split('\n').map((s) => s.trim()).filter(Boolean);
    const { error } = await supabase.from("recipes").insert([
      {
        user_id: user.id,
        title: data.title,
        ingredients,
        instructions,
        cooking_time: data.cooking_time,
        difficulty: data.difficulty,
        category: data.category,
      },
    ]);
    setIsLoading(false);
    if (error) {
      setHasError(error.message);
      return;
    }
    reset();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-100 dark:bg-slate-900 transition-colors">
      <form
        className="w-full max-w-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-8 space-y-6"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <h2 className="text-2xl font-bold mb-2 text-center text-slate-900 dark:text-white">Add a New Recipe</h2>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
            {...register("title")}
            disabled={isLoading}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200" htmlFor="ingredients">
            Ingredients (one per line)
          </label>
          <textarea
            id="ingredients"
            rows={3}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
            {...register("ingredients")}
            disabled={isLoading}
          />
          {errors.ingredients && <p className="text-red-500 text-xs mt-1">{errors.ingredients.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200" htmlFor="instructions">
            Instructions (one per line)
          </label>
          <textarea
            id="instructions"
            rows={3}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
            {...register("instructions")}
            disabled={isLoading}
          />
          {errors.instructions && <p className="text-red-500 text-xs mt-1">{errors.instructions.message}</p>}
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200" htmlFor="cooking_time">
              Cooking Time (minutes)
            </label>
            <input
              id="cooking_time"
              type="number"
              min={1}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
              {...register("cooking_time")}
              disabled={isLoading}
            />
            {errors.cooking_time && <p className="text-red-500 text-xs mt-1">{errors.cooking_time.message}</p>}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200" htmlFor="difficulty">
              Difficulty
            </label>
            <select
              id="difficulty"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
              {...register("difficulty")}
              disabled={isLoading}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            {errors.difficulty && <p className="text-red-500 text-xs mt-1">{errors.difficulty.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200" htmlFor="category">
            Category
          </label>
          <input
            id="category"
            type="text"
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
            {...register("category")}
            disabled={isLoading}
          />
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
        </div>
        <Button type="submit" variant="primary" disabled={isLoading} className="w-full text-base py-2 rounded-lg">
          {isLoading ? "Adding..." : "Add Recipe"}
        </Button>
        {hasError && <p className="text-red-500 text-sm text-center">{hasError}</p>}
      </form>
    </div>
  );
} 