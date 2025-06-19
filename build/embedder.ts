import { type FeatureExtractionPipeline, pipeline } from "@xenova/transformers";

// Singleton for the embedding pipeline
let embedderPromise: Promise<FeatureExtractionPipeline> | null = null;

async function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline("feature-extraction");
  }
  return embedderPromise;
}

/**
 * Utility to strip markdown and non-text characters except basic grammar.
 */
function stripMarkdown(markdown: string): string {
  return (
    markdown
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
      .trim()
  );
}

/**
 * Splits text into chunks of ~40-80 words, generates an embedding for each chunk,
 * and returns an array of embeddings (number[][]).
 */
export async function generateEmbedding(text: string): Promise<number[][]> {
  const embedder = await getEmbedder();
  // Strip markdown and non-text characters before embedding
  const cleanText = stripMarkdown(text);

  // Split into paragraphs, then merge short ones to form chunks of ~40-80 words
  const paragraphs = cleanText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentWordCount = 0;
  const minWords = 40;
  const maxWords = 80;

  for (const para of paragraphs) {
    const words = para.split(/\s+/);
    if (
      currentWordCount + words.length > maxWords &&
      currentWordCount >= minWords
    ) {
      chunks.push(currentChunk.join(" "));
      currentChunk = [];
      currentWordCount = 0;
    }
    currentChunk.push(para);
    currentWordCount += words.length;
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  // Generate embeddings for each chunk
  const embeddings: number[][] = [];
  for (const chunk of chunks) {
    if (chunk.trim().length === 0) continue;
    const output = await embedder(chunk, {
      pooling: "mean",
      normalize: true,
    });
    embeddings.push(Array.from(output.data));
  }
  return embeddings;
}
