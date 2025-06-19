import { useEffect, useState } from "react";
import { BlogPostCard } from "./BlogPostCard";

import type { PostWithEmbedding } from "../../types";

type BlogPostsAreaProps = {
  onSelectPost?: (filename: string) => void;
  selectedFilename?: string | null;
};

export function BlogPostsArea({
  onSelectPost,
  selectedFilename,
}: BlogPostsAreaProps) {
  const [posts, setPosts] = useState<PostWithEmbedding[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/embeddings.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load embeddings.json");
        return res.json();
      })
      .then((data: PostWithEmbedding[]) => {
        data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setPosts(data);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      {posts.length === 0 && !error && (
        <div className="w-full h-40 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-400 dark:text-neutral-500 text-xl border border-dashed border-neutral-300 dark:border-neutral-700">
          No blog posts found.
        </div>
      )}
      <div className="w-full flex flex-col gap-6">
        {posts.map((post) => (
          <div
            key={post.filename}
            onClick={() => onSelectPost?.(post.filename)}
            className={`cursor-pointer rounded-lg transition ring-2 ${
              selectedFilename === post.filename
                ? "ring-primary ring-offset-2"
                : "ring-transparent"
            }`}
          >
            <BlogPostCard post={post} />
          </div>
        ))}
      </div>
    </div>
  );
}
