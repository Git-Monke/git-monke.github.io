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
import { generateEmbedding } from "./embedder.ts";
import { type Post, type PostMeta, type PostWithEmbedding } from "../types.ts";
import sw from "stopword";

/**
 * Directory containing markdown posts.
 */
const POSTS_DIR = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "public",
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
  let text = markdown
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

  const outPath = path.join(__dirname, "embeddings.json");
  let existingEmbeddings: PostWithEmbedding[] = [];
  let existingFilenames = new Set<string>();

  if (fs.existsSync(outPath)) {
    try {
      const raw = fs.readFileSync(outPath, "utf8");
      existingEmbeddings = JSON.parse(raw);
      for (const entry of existingEmbeddings) {
        if (entry.filename) existingFilenames.add(entry.filename);
      }
    } catch (e) {
      console.warn(e);
      console.warn(
        "Warning: Could not parse existing embeddings.json. Rebuilding all.",
      );
      existingEmbeddings = [];
      existingFilenames = new Set();
    }
  }

  const rebuildAll = process.argv.includes("--rebuild");
  const results: PostWithEmbedding[] = rebuildAll
    ? []
    : [...existingEmbeddings];
  let skipped = 0,
    rebuilt = 0,
    newlyEncoded = 0;

  for (const post of posts) {
    const alreadyEncoded = existingFilenames.has(post.filename);
    if (alreadyEncoded && !rebuildAll) {
      skipped++;
      continue;
    }
    console.log(
      `Encoding: ${post.filename}: "${post.data.title}" [${post.data.date}]`,
    );
    const textToEmbed = [
      post.data.title,
      post.data.description,
      ...(Array.isArray(post.data.tags) ? post.data.tags : []),
      post.content,
    ].join("\n");
    const embedding = await generateEmbedding(textToEmbed);

    // Clean content for keyword search
    const cleanedContent = cleanContentForKeywords(post.content);

    results.push({
      filename: post.filename,
      ...post.data,
      embedding,
      content: cleanedContent,
    });
    if (alreadyEncoded && rebuildAll) {
      rebuilt++;
    } else {
      newlyEncoded++;
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`Wrote embeddings for ${results.length} post(s) to ${outPath}`);
  if (!rebuildAll) {
    console.log(
      `Skipped ${skipped} post(s) already present in embeddings.json.`,
    );
  } else {
    console.log(
      `Rebuilt ${rebuilt} post(s), newly encoded ${newlyEncoded} post(s).`,
    );
  }
}

main();
