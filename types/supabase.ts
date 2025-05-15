export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
};

export type Recipe = {
  id: string;
  user_id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  cooking_time: number;
  difficulty: string;
  category: string;
  created_at: string;
  updated_at: string;
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      likes: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          title: string
          ingredients: string[]
          instructions: string
          user_id: string
          created_at: string
          category: string
          difficulty: string
        }
        Insert: {
          id?: string
          title: string
          ingredients: string[]
          instructions: string
          user_id: string
          created_at?: string
          category: string
          difficulty: string
        }
        Update: {
          id?: string
          title?: string
          ingredients?: string[]
          instructions?: string
          user_id?: string
          created_at?: string
          category?: string
          difficulty?: string
        }
      }
    }
  }
} 