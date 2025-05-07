import { RecipeFeed } from "@/components/recipe-feed/recipe-feed";
import { SearchBar } from "@/components/search-bar/search-bar";
import { Button } from "@/components/ui/button";

/**
 * Homepage: Renders the main landing page with hero, search, and recipe feed.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center px-4 py-8">
      <section className="w-full max-w-2xl text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          🍳 Recipe Sharing Platform
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Discover, share, and explore delicious recipes from food lovers around the world.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button as="a" href="/auth/sign-up" variant="primary">
            Sign Up
          </Button>
          <Button as="a" href="/auth/sign-in" variant="outline">
            Log In
          </Button>
        </div>
      </section>
      <section className="w-full max-w-2xl mb-6">
        <SearchBar />
      </section>
      <section className="w-full max-w-2xl">
        <RecipeFeed />
      </section>
    </main>
  );
}
