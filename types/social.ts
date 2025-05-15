import { Database } from '@/types/supabase';

export type Comment = Database['public']['Tables']['comments']['Row'];
export type NewComment = Database['public']['Tables']['comments']['Insert'];
export type UpdateComment = Database['public']['Tables']['comments']['Update'];

export type Like = Database['public']['Tables']['likes']['Row'];
export type NewLike = Database['public']['Tables']['likes']['Insert'];

export type CommentWithUser = Comment & {
  user: {
    id: string;
    full_name: string;
  };
};

export interface Like {
  id: string;
  recipe_id: string;
  user_id: string;
  created_at: string;
}

export interface RecipeWithSocial extends Database['public']['Tables']['recipes']['Row'] {
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
  comments: CommentWithUser[];
}

export interface SocialStats {
  likesCount: number;
  commentsCount: number;
  userHasLiked: boolean;
} 