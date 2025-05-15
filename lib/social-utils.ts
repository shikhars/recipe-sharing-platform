import { supabase } from './supabase-client';

type Comment = {
  id: string;
  user_id: string;
  recipe_id: string;
  content: string;
  created_at: string;
};

type NewComment = {
  user_id: string;
  recipe_id: string;
  content: string;
};

type CommentWithUser = Comment & {
  user: {
    full_name: string;
  };
};

type RecipeWithSocial = {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  ingredients: string[] | string;
  category: string;
  difficulty: string;
  likes_count: number;
  user_has_liked: boolean;
  comments: CommentWithUser[];
};

export async function toggleLike(recipeId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: existingLike, error: fetchError } = await supabase
      .from('likes')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingLike) {
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) throw deleteError;
      return { success: true };
    } else {
      const { error: insertError } = await supabase
        .from('likes')
        .insert({ recipe_id: recipeId, user_id: userId });

      if (insertError) throw insertError;
      return { success: true };
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function addComment(comment: NewComment): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("comments").insert({
      recipe_id: comment.recipe_id,
      user_id: comment.user_id,
      content: comment.content,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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

export async function deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
  } catch (error) {
    console.error('Error updating comment:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 