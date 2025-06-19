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

export interface PostForIndex extends PostMeta {
  filename: string;
  content: string; // cleaned, meaningful content for keyword search
}

export interface FlexsearchExportedIndex {
  [key: string]: any;
}

export interface FlexsearchBuildOutput {
  posts: PostForIndex[];
  index: FlexsearchExportedIndex;
}
