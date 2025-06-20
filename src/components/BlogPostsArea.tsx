import { BlogPostCard } from "./BlogPostCard";
import { useEntries } from "@/contexts/usePosts";

type BlogPostsAreaProps = {
  onSelectPost?: (filename: string) => void;
  selectedFilename?: string | null;
};

export function BlogPostsArea({
  onSelectPost,
  selectedFilename,
}: BlogPostsAreaProps) {
  const { filteredEntries } = useEntries();

  return (
    <div className="w-full flex flex-col items-center">
      {filteredEntries.length === 0 && (
        <div className="w-full h-40 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-400 dark:text-neutral-500 text-xl border border-dashed border-neutral-300 dark:border-neutral-700">
          No blog posts found.
        </div>
      )}
      <div className="w-full flex flex-col gap-6">
        {filteredEntries.map((post) => (
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
