export interface WordPressCredentials {
  id: string;
  blogName: string;
  siteUrl: string;
  username: string;
  applicationPassword: string;
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ArticleData {
  title: string;
  content: string; // Markdown content
  sources: GroundingSource[];
}

export interface MediaUploadResponse {
  id: number;
  source_url: string;
}

export interface PostCreateResponse {
  id: number;
  link: string;
}
