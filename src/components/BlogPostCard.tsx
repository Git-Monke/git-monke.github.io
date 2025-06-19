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
import { Badge } from "@/components/ui/badge";
import { useEntries } from "@/contexts/usePosts";
import { useState } from "react";

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
            <div className="flex gap-1 flex-wrap">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
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
