import { create } from "zustand";
import { type PostWithEmbedding } from "types";
import { generateEmbedding } from "./embedder";

interface UsePostsStore {
  // Post data
  entries: PostWithEmbedding[];
  filteredEntries: PostWithEmbedding[];
  selectedPost: PostWithEmbedding | null;

  // UI state
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchQuery: string;

  // Actions
  fetchPosts: () => Promise<void>;
  searchPosts: (query: string) => Promise<void>;
  selectPost: (filename: string | null) => void;
}

// Utility function for cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const useEntries = create<UsePostsStore>((set, get) => ({
  // Initial state
  entries: [],
  filteredEntries: [],
  selectedPost: null,
  isLoading: false,
  isSearching: false,
  error: null,
  searchQuery: "",

  // Actions
  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/embeddings.json");
      if (!response.ok) {
        throw new Error("Failed to load posts");
      }
      const posts = await response.json();
      // Sort posts by date descending
      posts.sort(
        (a: PostWithEmbedding, b: PostWithEmbedding) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      set({
        entries: posts,
        filteredEntries: posts,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load posts",
        isLoading: false,
      });
    }
  },

  searchPosts: async (query: string) => {
    set({ searchQuery: query, isSearching: true });
    const { entries } = get();

    if (!query.trim()) {
      set({ filteredEntries: entries, isSearching: false });
      return;
    }

    // --- Hybrid semantic + keyword search ---
    // Utility to clean and tokenize text for keyword matching
    function cleanAndTokenize(text: string): string[] {
      return text
        .toLowerCase()
        .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\\/]/g, " ")
        .replace(/\s+/g, " ")
        .split(" ")
        .filter(Boolean);
    }

    // Get unique keywords from query (ignore stopwords for now)
    const queryTokens = Array.from(new Set(cleanAndTokenize(query)));

    try {
      const queryEmbedding = await generateEmbedding(query);

      const scored = entries.map((post) => {
        // 1. Semantic similarity (max across all chunk embeddings)
        let maxSimilarity = 0;
        for (const chunkEmbedding of post.embedding) {
          const sim = cosineSimilarity(queryEmbedding, chunkEmbedding);
          if (sim > maxSimilarity) maxSimilarity = sim;
        }

        // 2. Keyword matching
        // Combine title, description, tags, and cleaned content
        const textFields = [
          post.title,
          post.description,
          ...(Array.isArray(post.tags) ? post.tags : []),
          post.content, // cleaned content from build step
        ];

        const combinedText = textFields.join(" ").toLowerCase();
        const postTokens = Array.from(new Set(cleanAndTokenize(combinedText)));

        // Binary boost: 1 if any keyword matches, 0 otherwise
        const hasKeywordMatch = queryTokens.some((qt) =>
          postTokens.includes(qt),
        );
        const binaryBoost = hasKeywordMatch ? 1 : 0;

        // Proportional keyword score: fraction of unique query tokens found
        const matchedTokens = queryTokens.filter((qt) =>
          postTokens.includes(qt),
        );
        const keywordScore =
          queryTokens.length > 0
            ? matchedTokens.length / queryTokens.length
            : 0;

        // Combine scores
        // 0.7 semantic, 0.15 proportional, 0.15 binary boost
        const finalScore =
          0.7 * maxSimilarity + 0.15 * keywordScore + 0.15 * binaryBoost;

        return { post, finalScore };
      });

      // Sort by finalScore (highest first) and filter low scores
      const filtered = scored
        .sort((a, b) => b.finalScore - a.finalScore)
        .filter(({ finalScore }) => finalScore > 0.3) // Adjust threshold as needed
        .map(({ post }) => post);

      set({ filteredEntries: filtered, isSearching: false });
    } catch (error) {
      console.warn(error);
      set({
        error: error instanceof Error ? error.message : "Search failed",
        isSearching: false,
      });
    }
  },

  selectPost: (filename: string | null) => {
    if (!filename) {
      set({ selectedPost: null });
      return;
    }
    const { entries } = get();
    const post = entries.find((p) => p.filename === filename) || null;
    set({ selectedPost: post });
  },
}));
