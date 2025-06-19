# Changelog

## 2025-06-21

### Added
- Added technology icons to blog post tags using simple-icons library.
- Implemented "Showing results for X" feature with clear button below search input.
- Created IconMap utility to map tag names to technology icons.
- Added fallback icon display (Frown) when a matching icon isn't found.

### Improved
- Enhanced tag hover animation with consistent icon sizing and better transitions.
- Fixed search UI with clearer visual feedback on current search query.
- Optimized tag rendering for better performance and consistency.

## 2025-06-20

### Added
- Added smooth animation to BlogPostDisplay with Framer Motion, creating a seamless transition when blog posts change.
- Created specialized BlogPostTags component with interactive, expanding tags that reveal their full text on hover.
- Implemented animated tag overlap with single-character display that expands on hover to show full tag name.

### Changed
- Fixed markdown rendering in dark mode by updating typography classes and removing conflicting styles.
- Improved FlexSearch implementation by rebuilding the index on the client side instead of using the exported index.
- Updated BlogPostCard to use the new tag animation system for better visual feedback.

## 2025-06-19

### Changed
- Migrated build process from semantic search/embeddings to FlexSearch keyword index.
- Removed all embedding logic and dependencies from build scripts.
- Build now outputs `flexsearch.json` containing both post metadata and exported FlexSearch index for fast client-side loading.
- Updated types to remove embedding-related fields and add types for FlexSearch-based indexing.
- Updated all components to use PostForIndex instead of PostWithEmbedding.
- Improved search implementation in usePosts.tsx with more reliable state updates using Zustand callback form.
- Refactored BlogPostDisplay to use direct ReactMarkdown with proper theme support.

## 2025-06-18

### Changed
- Updated BlogPostDisplay component to use PostWithEmbedding type directly
- Simplified BlogPostDisplay by removing redundant metadata fetching
- Improved post display performance by using pre-loaded data from context

### Fixed
- Embedding generation (both build and browser) now strips all markdown and non-text characters (except basic grammar) before encoding for improved semantic accuracy.

### Changed
- Embeddings are now generated per chunk (40–80 words) instead of per entire post, improving semantic search for phrase-level queries.
- `PostWithEmbedding.embedding` type changed from `number[]` to `number[][]` to reflect chunked embeddings.
- Search now uses the highest similarity from all chunk embeddings for each post.
- Each post now includes a `content` field containing only meaningful, non-stopword tokens from the markdown body, for efficient and accurate keyword search.

### Improved
- Keyword search now uses the cleaned content field (with stopwords and markdown artifacts removed) for much higher quality results, in addition to semantic similarity.

### Added
- Implemented search-on-enter for the main search input in `App.tsx`:
  - Search now triggers only when pressing Enter in the input field.
  - The input field clears itself after searching.
- Implemented semantic search functionality:
  - Added cosine similarity search using post embeddings
  - Integrated with @xenova/transformers for real-time query embedding
  - Added similarity threshold filtering for better results
  - Added loading state for search operations

- Enhanced usePosts hook with improved state management:
  - Added filteredEntries state for search results
  - Added selectedPost state for tracking selected posts
  - Implemented basic search filtering by title, description, and tags
  - Added proper TypeScript types and error handling

- Created `HomeHeader` component with a large, centered title ("Jacob Velasquez"), tagline, prominent search bar (styled with Tailwind CSS and shadcn/ui conventions), and a placeholder area for blog posts.
- Updated `App.tsx` to render the new `HomeHeader` as the main content.
- Added a TypeScript build script (`build/index.ts`) to process blog post markdown files for semantic encoding.
- Modularized embedding logic into `build/embedder.ts` for easy swapping of embedding models.
- Build script now generates `embeddings.json` with post metadata and semantic embeddings (excluding post content).
- Improved build script to skip posts already present in `embeddings.json` unless `--rebuild-all` is passed as a CLI argument, enabling incremental or full rebuilds.
- Recreated HomeHeader with a search bar styled to match the card background, border, and padding, and ensured it aligns in width with the blog post area.
- BlogPostCard now displays tags as capitalized Badge chips (using shadcn/ui Badge) instead of a comma-separated list.
- BlogPostCard animates the description to slide in/out on hover using Framer Motion, and only renders the description when hovered for better layout control.
- BlogPostDisplay now loads post meta from embeddings.json, strips frontmatter from markdown, and uses custom heading sizes (max 2xl) for markdown rendering.
- BlogPostDisplay renders bullet points and lists with correct styling, and the separator (hr) now has increased top and bottom margin.
- Added SelectedPostContext for global post selection, allowing BlogPostCard to set the selected post via context.
