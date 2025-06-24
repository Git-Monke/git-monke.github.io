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
  selectedTags: string[];

  fetchPosts: () => Promise<void>;
  searchPosts: (query: string) => Promise<void>;
  selectPost: (filename: string | null) => void;
  toggleTag: (tag: string) => void;
  removeTag: (tag: string) => void;
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
  selectedTags: [],

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
          new Date(b.date).getTime() - new Date(a.date).getTime()
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
    const { entries, flexIndex, selectedTags } = get();

    let filtered: PostForIndex[] = entries;

    if (query.trim() && flexIndex) {
      const result = flexIndex.search(query, { enrich: true });
      const foundFilenames: string[] = [];
      for (const fieldResult of result) {
        for (const hit of fieldResult.result) {
          const filename = typeof hit === "string" ? hit : hit.id.toString();
          if (!foundFilenames.includes(filename)) {
            foundFilenames.push(filename);
          }
        }
      }
      filtered = foundFilenames
        .map((filename) => entries.find((p) => p.filename === filename))
        .filter(Boolean) as PostForIndex[];
    }

    // Filter by selectedTags (AND logic: must contain ALL selected tags)
    // If any tags are selected, only show posts that contain ALL selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((post) =>
        selectedTags.every((tag) =>
          post.tags.map((t) => t.toLowerCase()).includes(tag)
        )
      );
    }

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

  toggleTag: (tag: string) => {
    set((state) => {
      const tagLower = tag.toLowerCase();
      const isSelected = state.selectedTags.includes(tagLower);
      const newTags = isSelected
        ? state.selectedTags.filter((t) => t !== tagLower)
        : [...state.selectedTags, tagLower];
      // After updating selectedTags, re-run filtering
      setTimeout(() => get().searchPosts(get().searchQuery), 0);
      return {
        ...state,
        selectedTags: newTags,
      };
    });
  },

  removeTag: (tag: string) => {
    set((state) => {
      const tagLower = tag.toLowerCase();
      const newTags = state.selectedTags.filter((t) => t !== tagLower);
      // After updating selectedTags, re-run filtering
      setTimeout(() => get().searchPosts(get().searchQuery), 0);
      return {
        ...state,
        selectedTags: newTags,
      };
    });
  },
}));
