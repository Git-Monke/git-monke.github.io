import {
  type FeatureExtractionPipeline,
  pipeline,
  env,
} from "@xenova/transformers";

env.allowLocalModels = false;
// env.useBrowserCache = false;

let embedderPromise: Promise<FeatureExtractionPipeline> | null = null;

async function getEmbedder() {
  if (!embedderPromise) {
    console.log("[Embedder] Initializing pipeline...");
    embedderPromise = pipeline("feature-extraction");
  }
  return embedderPromise;
}

// Utility to strip markdown and non-text characters except basic grammar
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

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embedder = await getEmbedder();

    // Strip markdown and non-text characters before embedding
    const cleanText = stripMarkdown(text);
    const query_prefix =
      "Represent this sentence for searching relevant passages: ";

    const output = await embedder(query_prefix + cleanText, {
      pooling: "mean",
      normalize: true,
    });

    return Array.from(output.data);
  } catch (err) {
    console.error("[Embedder] Error during embedding generation:", err);
    throw err;
  }
}
