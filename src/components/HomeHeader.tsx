import { Input } from "@/components/ui/input";
import { BlogPostsArea } from "./BlogPostsArea";
import { useState } from "react";
import { useEntries } from "@/contexts/usePosts";

export function HomeHeader() {
  const [searchValue, setSearchValue] = useState("");
  const { searchPosts } = useEntries();

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      searchPosts(searchValue);
      setSearchValue(""); // Optionally clear input after search
    }
  }

  return (
    <header className="w-full flex flex-col items-center mt-16 mb-12 px-4 gap-16">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-center tracking-tight text-neutral-900 dark:text-neutral-100">
          Jacob Velasquez
        </h1>
        <p className="text-lg md:text-2xl text-center text-neutral-600 dark:text-neutral-400 font-medium">
          Building, learning, and sharing my programming journey.
        </p>
      </div>

      <div className="w-full max-w-[640px] flex flex-col gap-8">
        <Input
          type="search"
          placeholder="Search posts, technologies, or concepts..."
          className="w-full text-lg p-6 bg-card"
          aria-label="Semantic search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <BlogPostsArea />
      </div>
    </header>
  );
}
