import "./App.css";
import { Input } from "@/components/ui/input";
import { BlogPostsArea } from "./components/BlogPostsArea";
import { BlogPostDisplay } from "./components/BlogPostDisplay";

import { useEntries } from "./contexts/usePosts";
import { useEffect, useState } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { X } from "lucide-react";

function AppContent() {
  const { selectedPost, fetchPosts, searchPosts, searchQuery } = useEntries();
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-background px-2">
      {/* Title and tagline */}
      <div className="flex flex-col gap-4 mt-16 mb-12 items-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-center tracking-tight text-neutral-900 dark:text-neutral-100">
          Jacob Velasquez
        </h1>
        <p className="text-lg md:text-2xl text-center text-neutral-600 dark:text-neutral-400 font-medium">
          Building, learning, and sharing my programming journey.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-8 w-full justify-center items-start relative">
        <div className="flex flex-col gap-8 w-full max-w-[640px]">
          <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col gap-4 w-full">
              <Input
                type="search"
                placeholder="Search posts, technologies, or concepts..."
                className="w-full text-lg p-6 bg-card"
                aria-label="Semantic search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    searchPosts(searchValue);
                    setSearchValue("");
                  }
                }}
              />
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={searchQuery ? { opacity: 1, height: "auto" } : {}}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-sm text-muted-foreground px-2"
              >
                <span>
                  Showing results for "
                  {searchQuery != "" ? searchQuery : "nothing!"}"
                </span>
                <button
                  onClick={() => searchPosts("")}
                  className="flex items-center justify-center rounded-full w-5 h-5 bg-muted hover:bg-muted-foreground/20 transition-colors"
                >
                  <X size={12} />
                </button>
              </motion.div>
            </div>

            <BlogPostsArea />
          </div>
        </div>
        {selectedPost ? (
          <div className={`w-full max-w-[640px]`} style={{ minHeight: "1px" }}>
            <BlogPostDisplay data={selectedPost} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
