import Image from "next/image";

type RecipeCardProps = {
  recipe: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    tags: string[];
    user: { username: string };
    createdAt: string;
    likes: number;
  };
};

/**
 * RecipeCard: Displays a single recipe summary.
 */
export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
        <Image
          src={recipe.imageUrl}
          alt={recipe.title}
          width={recipe.imageWidth}
          height={recipe.imageHeight}
          className="object-cover w-full h-full"
          loading="lazy"
          sizes="(max-width: 640px) 100vw, 192px"
          priority={false}
        />
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{recipe.title}</h2>
          <p className="text-gray-600 text-sm mb-2">{recipe.description}</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          <span>By {recipe.user.username}</span>
          <span>{recipe.createdAt}</span>
          <span>❤️ {recipe.likes}</span>
        </div>
      </div>
    </article>
  );
} 