/**
 * Build script entry point for encoding the meaning of blog posts.
 * This script will:
 *  - Read all markdown files in the posts directory
 *  - Extract metadata (date, title, description, tags) and content
 *  - (Future) Encode the semantic meaning of each post for search
 *
 * Run with: ts-node build/index.ts
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { type Post, type PostMeta, type PostForIndex } from "../types.ts";
import sw from "stopword";
import FlexSearch from "flexsearch";

/**
 * Directory containing markdown posts.
 */
const POSTS_DIR = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "posts",
);

/**
 * Read all markdown files in the posts directory.
 * @returns {Post[]}
 */
function readAllPosts(): Post[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  return files.map((filename) => {
    const filePath = path.join(POSTS_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    return { filename, data: data as PostMeta, content };
  });
}

function cleanContentForKeywords(markdown: string): string {
  // Remove markdown artifacts (reuse the stripMarkdown logic from embedder if possible)
  const text = markdown
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, " ")
    // Remove inline code
    .replace(/`[^`]*`/g, " ")
    // Remove images ![alt](url)
    .replace(/!\[.*?\]\(.*?\)/g, " ")
    // Remove links [text](url)
    .replace(/\[([^\]]*?)\]\(.*?\)/g, "$1")
    // Remove headings
    .replace(/^#+\s+/gm, "")
    // Remove blockquotes
    .replace(/^\s*>+\s?/gm, "")
    // Remove bold/italic/strikethrough
    .replace(/(\*\*|__|\*|_|~~)/g, "")
    // Remove horizontal rules
    .replace(/^(-\s*?){3,}$/gm, "")
    // Remove unordered list bullets
    .replace(/^\s*[-+*]\s+/gm, "")
    // Remove ordered list numbers
    .replace(/^\s*\d+\.\s+/gm, "")
    // Remove extra whitespace
    .replace(/\s{2,}/g, " ")
    // Remove any remaining non-text except basic grammar
    .replace(/[^a-zA-Z0-9.,;:!?'"\-\s]/g, "")
    .trim();

  // Tokenize and remove stopwords
  let tokens = text.toLowerCase().split(/\s+/).filter(Boolean);

  tokens = sw.removeStopwords(tokens);

  // Return as a cleaned string
  return tokens.join(" ");
}

async function main() {
  const posts = readAllPosts();
  console.log(`Found ${posts.length} post(s):`);

  const outPath = path.join(__dirname, "flexsearch.json");

  // Prepare FlexSearch index
  const index = new FlexSearch.Document({
    document: {
      id: "filename",
      index: ["title", "description", "tags", "content"],
    },
    tokenize: "tolerant",
    cache: true,
    context: true,
  });

  // Prepare metadata array
  const postsMeta: Array<PostForIndex> = [];

  for (const post of posts) {
    // Clean content for keyword search
    const cleanedContent = cleanContentForKeywords(post.content);

    // Prepare metadata object
    const meta = {
      filename: post.filename,
      ...post.data,
      content: cleanedContent,
    };

    // Add to FlexSearch index
    index.add({
      filename: post.filename,
      title: post.data.title,
      description: post.data.description,
      tags: Array.isArray(post.data.tags) ? post.data.tags.join(" ") : "",
      content: cleanedContent,
    });

    postsMeta.push(meta);
  }

  // Export FlexSearch index for fast client-side loading
  const exportedIndex = await new Promise((resolve) => {
    index.export((data: any) => resolve(data));
  });

  // Write both metadata and index to output file
  const output = {
    posts: postsMeta,
    index: exportedIndex,
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");
  console.log(
    `Wrote FlexSearch index and metadata for ${postsMeta.length} post(s) to ${outPath}`,
  );

  // --- Copy .md files from posts to public as .html files ---
  const PUBLIC_DIR = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    "..",
    "public",
  );
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  const mdFiles = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  for (const mdFile of mdFiles) {
    const srcPath = path.join(POSTS_DIR, mdFile);
    const destPath = path.join(PUBLIC_DIR, mdFile.replace(/\.md$/, ".html"));
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${mdFile} to public as ${path.basename(destPath)}`);
  }
}

main();
