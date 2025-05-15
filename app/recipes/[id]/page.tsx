"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { CommentSection } from "@/components/comment-section";
import { CommentWithUser } from "@/types/social";
import { Toaster } from "@/components/ui/toaster";

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
  likes_count: number;
  user_has_liked: boolean;
};

export default function RecipePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [authorName, setAuthorName] = useState<string>("Unknown");
  const [userId, setUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentWithUser[]>([]);

  useEffect(() => {
    const fetchRecipeAndAuthor = async () => {
      setIsLoading(true);
      setHasError(null);
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      // Fetch recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", params.id)
        .single();
      if (recipeError) {
        setHasError(recipeError.message);
        setIsLoading(false);
        return;
      }
      setRecipe(recipeData as Recipe);
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
      // Fetch comments with user data
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select(`
          *,
          profiles!user_id (
            id,
            full_name
          )
        `)
        .eq("recipe_id", params.id)
        .order("created_at", { ascending: false });
      if (commentsError) {
        setHasError(commentsError.message);
      } else {
        // Transform the data to match CommentWithUser type
        const transformedComments = (commentsData || []).map(comment => ({
          ...comment,
          user: {
            id: comment.profiles.id,
            full_name: comment.profiles.full_name
          }
        }));
        setComments(transformedComments);
      }
      setIsLoading(false);
    };
    if (params.id) fetchRecipeAndAuthor();
  }, [params.id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) return;
    setIsDeleting(true);
    setDeleteError(null);
    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", params.id);
    setIsDeleting(false);
    if (error) {
      setDeleteError(error.message);
      return;
    }
    router.push("/dashboard");
  };

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
          <div className="text-base text-slate-800 dark:text-slate-200 whitespace-pre-line">{Array.isArray(recipe.ingredients) ? recipe.ingredients.join("\n") : recipe.ingredients || 'No ingredients listed.'}</div>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Instructions</h2>
          <div className="text-base text-slate-800 dark:text-slate-200 whitespace-pre-line">{Array.isArray(recipe.instructions) ? recipe.instructions.join("\n") : recipe.instructions || 'No instructions provided.'}</div>
        </div>
        <div className="mb-4 flex flex-wrap gap-4">
          <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full text-xs font-medium">Category: {recipe.category || 'N/A'}</span>
          <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full text-xs font-medium">Difficulty: {recipe.difficulty || 'N/A'}</span>
          <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full text-xs font-medium">Cooking Time: {recipe.cooking_time ? `${recipe.cooking_time} min` : 'N/A'}</span>
        </div>
        {isOwner && (
          <div className="flex gap-2 mt-4">
            <Link
              href={`/recipes/${recipe.id}/edit`}
              className="inline-block px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition"
            >
              Edit Recipe
            </Link>
            <Button
              type="button"
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        )}
        {deleteError && <p className="text-red-600 text-sm mt-2 text-center">{deleteError}</p>}
      </div>
      <div className="mt-8">
        <CommentSection
          recipeId={recipe.id}
          comments={comments}
          onCommentChange={() => {
            // Refetch comments when they change
            supabase
              .from("comments")
              .select(`
                *,
                profiles!user_id (
                  id,
                  full_name
                )
              `)
              .eq("recipe_id", params.id)
              .order("created_at", { ascending: false })
              .then(({ data }) => {
                if (data) {
                  const transformedComments = data.map(comment => ({
                    ...comment,
                    user: {
                      id: comment.profiles.id,
                      full_name: comment.profiles.full_name
                    }
                  }));
                  setComments(transformedComments);
                }
              });
          }}
        />
      </div>
      <Toaster />
    </main>
  );
} 