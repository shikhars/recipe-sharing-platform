import { supabase } from './supabase-client';
import { Like, Comment, NewLike, NewComment, CommentWithUser, RecipeWithSocial } from '@/types/social';

export async function toggleLike(recipeId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if like exists
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // Like
      const newLike: NewLike = {
        recipe_id: recipeId,
        user_id: userId,
      };

      const { error } = await supabase
        .from('likes')
        .insert(newLike);

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function addComment(
  recipeId: string,
  userId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("comments").insert({
      recipe_id: recipeId,
      user_id: userId,
      content,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getRecipeWithSocial(recipeId: string, userId: string): Promise<RecipeWithSocial | null> {
  try {
    // Get recipe with likes and comments count
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select(`
        *,
        likes:likes(count),
        comments:comments(count)
      `)
      .eq('id', recipeId)
      .single();

    if (recipeError) throw recipeError;

    // Check if user has liked
    const { data: userLike } = await supabase
      .from('likes')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    // Get comments with user info
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles(full_name, username)
      `)
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false });

    if (commentsError) throw commentsError;

    return {
      ...recipe,
      likes_count: recipe.likes?.[0]?.count || 0,
      comments_count: recipe.comments?.[0]?.count || 0,
      user_has_liked: !!userLike,
      comments: comments as CommentWithUser[],
    };
  } catch (error) {
    console.error('Error fetching recipe with social data:', error);
    return null;
  }
}

export async function deleteComment(
  commentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateComment(
  commentId: string,
  userId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("comments")
      .update({ content })
      .eq("id", commentId)
      .eq("user_id", userId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
} 