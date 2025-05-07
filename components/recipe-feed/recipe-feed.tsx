import { RecipeCard } from "@/components/recipe-card/recipe-card";

const mockRecipes = [
  {
    id: "1",
    title: "Classic Margherita Pizza",
    description: "A simple and delicious Italian pizza with fresh basil.",
    imageUrl: "/images/margherita.webp",
    imageWidth: 640,
    imageHeight: 426,
    tags: ["italian", "vegetarian"],
    user: { username: "chefanna" },
    createdAt: "2024-06-30",
    likes: 12,
  },
  {
    id: "2",
    title: "Vegan Buddha Bowl",
    description: "A nourishing bowl packed with veggies and grains.",
    imageUrl: "/images/buddha-bowl.webp",
    imageWidth: 640,
    imageHeight: 426,
    tags: ["vegan", "healthy"],
    user: { username: "plantpower" },
    createdAt: "2024-06-28",
    likes: 8,
  },
  // ...add more mock recipes as needed
];

/**
 * RecipeFeed: Displays a list of recipe cards.
 */
export function RecipeFeed() {
  // Pagination and filtering will be added later.
  return (
    <ul className="flex flex-col gap-6">
      {mockRecipes.map((recipe) => (
        <li key={recipe.id}>
          <RecipeCard recipe={recipe} />
        </li>
      ))}
    </ul>
  );
} 