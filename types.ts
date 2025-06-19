export interface PostMeta {
  date: string;
  title: string;
  description: string;
  tags: string[];
  [key: string]: unknown;
}

export interface Post {
  filename: string;
  data: PostMeta;
  content: string;
}

export interface PostWithEmbedding extends PostMeta {
  filename: string;
  embedding: number[][];
  content: string; // cleaned, meaningful content for keyword search
}
