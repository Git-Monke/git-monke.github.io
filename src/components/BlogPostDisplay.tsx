import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type PostWithEmbedding } from "types";

type BlogPostDisplayProps = {
  data: PostWithEmbedding;
};

export function BlogPostDisplay({ data }: BlogPostDisplayProps) {
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch(`/posts/${data.filename}`)
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
  }, [data.filename]);

  if (error) {
    return (
      <div className="text-red-500 text-center my-8">
        Error loading post: {error}
      </div>
    );
  }

  return (
    <article className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow border p-6 text-left">
      <h1 className="text-xl md:text-2xl font-extrabold text-black mb-2 text-left">
        {data.title}
      </h1>
      <div className="text-xs md:text-sm text-neutral-400 mb-6 text-left">
        {new Date(data.date).toLocaleDateString()}
      </div>
      <div className="prose prose-neutral dark:prose-invert max-w-none text-left">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-xl font-bold mt-6 mb-2" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-lg font-bold mt-4 mb-2" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-base font-semibold mt-3 mb-1" {...props} />
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
            hr: ({ node, ...props }) => (
              <hr
                className="my-8 border-t border-neutral-300 dark:border-neutral-700"
                {...props}
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
