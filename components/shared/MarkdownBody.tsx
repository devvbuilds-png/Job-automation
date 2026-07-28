"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="prose-sm prose max-w-none rounded-lg border border-zinc-200 bg-white px-6 py-5
      prose-headings:font-semibold prose-headings:text-zinc-800
      prose-h1:text-base prose-h2:text-sm prose-h3:text-sm
      prose-p:text-zinc-700 prose-p:leading-relaxed
      prose-li:text-zinc-700 prose-li:leading-relaxed
      prose-strong:text-zinc-900
      prose-a:text-sky-600 prose-a:no-underline hover:prose-a:underline
      prose-hr:border-zinc-200
      prose-code:text-zinc-800 prose-code:bg-zinc-100 prose-code:px-1 prose-code:rounded">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
