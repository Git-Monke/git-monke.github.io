import { useEntries } from "@/contexts/usePosts";
import { useEffect, useState } from "react";
import { type PostForIndex } from "types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "./ui/separator";

// YouTube embed component
function YouTubeEmbed({ url }: { url: string }) {
  // Extract the video ID from the URL
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  );
  const videoId = match ? match[1] : null;
  if (!videoId) return <a href={url}>{url}</a>;
  return (
    <div className="relative w-full pt-[56.25%] my-6">
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-md shadow-md"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}

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

    fetch(`/docs/assets/${selectedPost.filename}`)
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
    <AnimatePresence mode="wait">
      <motion.article
        key={data.filename}
        className="w-full max-w-2xl mx-auto rounded-lg shadow border p-6 text-left bg-card"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.4, 0.1, 0.2, 1] }}
      >
        <motion.h1
          className="text-xl md:text-2xl font-extrabold mb-2 text-left"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {data.title}
        </motion.h1>
        <motion.div
          className="text-xs md:text-sm text-neutral-400 mb-6 text-left"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          {new Date(data.date).toLocaleDateString()}
        </motion.div>
        <Separator></Separator>
        <motion.div
          className="prose max-w-none text-left dark:prose-invert prose-img:rounded-md prose-img:shadow-md prose-img:my-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
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
              img: ({ node, ...props }) => (
                <img
                  className="rounded-md shadow-md my-4 max-w-full mx-auto"
                  loading="lazy"
                  {...props}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.alt = `Failed to load image: ${target.alt || "unknown"}`;
                  }}
                />
              ),
              a: ({ href = "", children, ...props }) => {
                if (href.includes("youtube.com") || href.includes("youtu.be")) {
                  return <YouTubeEmbed url={href} />;
                }
                return (
                  <a
                    href={href}
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                );
              },
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
        </motion.div>
      </motion.article>
    </AnimatePresence>
  );
}
