// Type declarations for MarkdownRenderer dependencies
declare module 'marked' {
  export class Marked {
    constructor(...extensions: unknown[]);
    parse(src: string): string;
  }
}

declare module 'marked-highlight' {
  export function markedHighlight(options: {
    langPrefix?: string;
    highlight: (code: string, lang: string) => string;
  }): unknown;
}

declare module 'isomorphic-dompurify' {
  const DOMPurify: {
    sanitize(dirty: string, config?: Record<string, unknown>): string;
  };
  export default DOMPurify;
}
