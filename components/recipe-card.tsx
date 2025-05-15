"use client";

import Link from "next/link";
import { LikeButton } from "@/components/ui/like-button";
import { useAuth } from "@/hooks/use-auth";

interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    created_at: string;
    user_id: string;
    likes_count: number;
    user_has_liked: boolean;
  };
  authorName: string;
}

export function RecipeCard({ recipe, authorName }: RecipeCardProps) {
  const { user } = useAuth();

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 p-5 flex flex-col gap-2">
      <div className="h-32 w-full bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-lg mb-3 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl">
        🍲
      </div>
      <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-1 truncate">
        {recipe.title}
      </h2>
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
        Uploaded: {new Date(recipe.created_at).toLocaleDateString()}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
        By: {authorName}
      </div>
      <div className="flex items-center justify-between mt-auto">
        <Link
          href={`/recipes/${recipe.id}`}
          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline text-sm font-medium"
        >
          View Recipe
        </Link>
        {user && (
          <LikeButton
            recipeId={recipe.id}
            userId={user.id}
            initialLikes={recipe.likes_count}
            initialLiked={recipe.user_has_liked}
          />
        )}
      </div>
    </div>
  );
} 