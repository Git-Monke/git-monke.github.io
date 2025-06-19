import { useEntries } from "@/contexts/usePosts";
import { useEffect, useState } from "react";
import { type PostForIndex } from "types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type BlogPostDisplayProps = {
  data: PostForIndex;
};

export function BlogPostDisplay({ data }: BlogPostDisplayProps) {
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { selectedPost } = useEntries();

  useEffect(() => {
    let isMounted = true;

    if (!selectedPost) {
      return;
    }

    fetch(`/posts/${selectedPost.filename}`)
      .then((res) => res.text())
      .then((raw) => {
        const content = raw.replace(/^---[\s\S]*?---/, "").trim();
        if (isMounted) setContent(content);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedPost]);

  if (error) {
    return (
      <div className="text-red-500 text-center my-8">
        Error loading post: {error}
      </div>
    );
  }

  return (
    <article className="w-full max-w-2xl mx-auto rounded-lg shadow border p-6 text-left">
      <h1 className="text-xl md:text-2xl font-extrabold mb-2 text-left">
        {data.title}
      </h1>
      <div className="text-xs md:text-sm text-neutral-400 mb-6 text-left">
        {new Date(data.date).toLocaleDateString()}
      </div>
      <div className="prose max-w-none text-left dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-2xl font-semibold mt-6 mb-2" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-xl font-semibold mt-4 mb-2" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-lg font-semibold mt-3 mb-1" {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h4 className="text-base font-medium mt-2 mb-1" {...props} />
            ),
            h5: ({ node, ...props }) => (
              <h5 className="text-sm font-medium mt-2 mb-1" {...props} />
            ),
            h6: ({ node, ...props }) => (
              <h6 className="text-xs font-medium mt-2 mb-1" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc ml-6 my-2" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal ml-6 my-2" {...props} />
            ),
            li: ({ node, ...props }) => <li className="my-1" {...props} />,
            hr: ({ node, ...props }) => <hr className="my-8 " {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
