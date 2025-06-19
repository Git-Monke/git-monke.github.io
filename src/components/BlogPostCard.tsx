import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { type PostForIndex } from "types";

type BlogPostCardProps = {
  post: PostForIndex;
};
import { motion } from "framer-motion";
import { useEntries } from "@/contexts/usePosts";
import { useState } from "react";
import { IconMap } from "@/utils/IconMap";
import { Frown } from "lucide-react";
import React from "react";

export function BlogPostCard({ post }: BlogPostCardProps) {
  const [hovered, setHovered] = useState(false);
  const { selectPost } = useEntries();

  return (
    <Card
      className="transition-shadow duration-300 hover:shadow-2xl p-6 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => selectPost(post.filename)}
    >
      <CardHeader className="items-end text-left p-0 gap-1">
        <CardTitle className="text-xl md:text-xl font-extrabold text-black dark:text-neutral-100 tracking-tight text-left pb-0">
          {post.title}
        </CardTitle>
        <CardDescription className="flex flex-col">
          <div className="text-neutral flex gap-2 items-center flex-wrap">
            <span>{new Date(post.date).toLocaleDateString()}</span>
            <BlogPostTags tags={post.tags} />
          </div>
          <motion.div
            initial={false}
            animate={
              hovered
                ? { opacity: 1, y: 0, height: "auto", marginTop: "8px" }
                : { opacity: 0, y: -10, height: 0, marginTop: 0 }
            }
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
            className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 font-normal text-left"
          >
            {post.description}
          </motion.div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function BlogPostTags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => {
        return <StackItem key={tag} name={tag} />;
      })}
    </div>
  );
}

function StackItem({ name }: { name: string }) {
  const IconComponent =
    name.toLowerCase() in IconMap
      ? IconMap[name.toLowerCase()]
      : () => <Frown size={12} />;

  return (
    <motion.div
      whileHover="animate"
      whileTap="animate"
      initial="initial"
      className="flex items-start justify-start rounded-full text-xs p-1 -mr-2 hover:z-10 bg-primary shadow-lg"
    >
      <motion.span
        variants={{
          animate: { paddingRight: 2 },
        }}
        transition={{
          type: "spring",
        }}
        className="w-4 h-4 shrink-0 text-center flex items-center justify-center text-foreground"
      >
        <div className="w-3.5 h-3.5 flex items-center justify-center">
          <IconComponent size={14} />
        </div>
      </motion.span>
      <motion.span
        variants={{
          initial: { width: 0 },
          animate: { width: "auto" },
          exit: { width: 0 },
        }}
        className="overflow-hidden whitespace-nowrap text-foreground"
      >
        {name}
      </motion.span>
    </motion.div>
  );
}
