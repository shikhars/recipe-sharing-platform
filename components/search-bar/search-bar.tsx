"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * SearchBar: UI for searching and filtering recipes (UI only, no real filtering yet).
 */
export function SearchBar() {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Example tags for filter UI
  const tags = ["vegan", "vegetarian", "italian", "healthy"];

  return (
    <form
      className="flex flex-col sm:flex-row gap-2 items-stretch"
      onSubmit={(e) => {
        e.preventDefault();
        // Filtering will be implemented later
      }}
      role="search"
      aria-label="Search recipes"
    >
      <input
        type="search"
        className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        placeholder="Search recipes by title, ingredient, or tag..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search recipes"
      />
      <div className="flex gap-1 items-center">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`px-2 py-1 rounded text-xs font-medium border ${
              selectedTag === tag
                ? "bg-green-500 text-white border-green-600"
                : "bg-white text-green-700 border-green-200"
            } transition-colors`}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            aria-pressed={selectedTag === tag}
          >
            #{tag}
          </button>
        ))}
      </div>
      <Button type="submit" variant="primary">
        Search
      </Button>
    </form>
  );
} 