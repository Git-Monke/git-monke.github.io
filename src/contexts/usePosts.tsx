import { create } from "zustand";
import FlexSearch, { type Document } from "flexsearch";
import { type PostForIndex } from "types";

interface UsePostsStore {
  entries: PostForIndex[];
  filteredEntries: PostForIndex[];
  selectedPost: PostForIndex | null;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchQuery: string;
  flexIndex: Document | null;

  fetchPosts: () => Promise<void>;
  searchPosts: (query: string) => Promise<void>;
  selectPost: (filename: string | null) => void;
}

export const useEntries = create<UsePostsStore>((set, get) => ({
  entries: [],
  filteredEntries: [],
  selectedPost: null,
  isLoading: false,
  isSearching: false,
  error: null,
  searchQuery: "",
  flexIndex: null,

  fetchPosts: async () => {
    set((state) => ({ ...state, isLoading: true, error: null }));

    try {
      const response = await fetch("/flexsearch.json");
      if (!response.ok) {
        throw new Error("Failed to load posts");
      }
      const { posts }: { posts: PostForIndex[] } = await response.json();
      // Sort posts by date descending
      posts.sort(
        (a: PostForIndex, b: PostForIndex) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      // Rebuild FlexSearch index from posts array
      const flexIndex = new FlexSearch.Document({
        document: {
          id: "filename",
          index: ["title", "description", "tags", "content"],
        },
        tokenize: "tolerant",
        cache: true,
        context: true,
      });

      for (const post of posts) {
        flexIndex.add({
          filename: post.filename,
          title: post.title,
          description: post.description,
          tags: Array.isArray(post.tags) ? post.tags.join(" ") : "",
          content: post.content,
        });
      }

      set((state) => ({
        ...state,
        entries: posts,
        filteredEntries: posts,
        flexIndex,
        isLoading: false,
      }));
    } catch (error) {
      set((state) => ({
        ...state,
        error: error instanceof Error ? error.message : "Failed to load posts",
        isLoading: false,
      }));
    }
  },

  searchPosts: async (query: string) => {
    set((state) => ({ ...state, searchQuery: query, isSearching: true }));
    const { entries, flexIndex } = get();

    if (!query.trim() || !flexIndex) {
      set((state) => ({
        ...state,
        filteredEntries: entries,
        isSearching: false,
      }));
      return;
    }
    const result = flexIndex.search(query, { enrich: true });
    const foundFilenames: string[] = [];

    // Process the enriched search results
    for (const fieldResult of result) {
      for (const hit of fieldResult.result) {
        // Extract the id (filename) from each hit object
        const filename = typeof hit === "string" ? hit : hit.id.toString();
        if (!foundFilenames.includes(filename)) {
          foundFilenames.push(filename);
        }
      }
    }

    const filtered = foundFilenames
      .map((filename) => entries.find((p) => p.filename === filename))
      .filter(Boolean) as PostForIndex[];

    set((state) => ({
      ...state,
      filteredEntries: filtered,
      isSearching: false,
    }));
  },

  selectPost: (filename: string | null) => {
    set((state) => {
      if (!filename) {
        return { ...state, selectedPost: null };
      }
      const post = state.entries.find((p) => p.filename === filename) || null;
      return { ...state, selectedPost: post };
    });
  },
}));
