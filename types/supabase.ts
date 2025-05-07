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