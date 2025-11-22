"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 grid grid-cols-1">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node: _node, ...props }) => (
            <div className="overflow-x-auto w-full my-2 block max-w-full pb-2">
              <table {...props} className="w-full border-collapse text-left min-w-[500px]" />
            </div>
          ),
          th: ({ node: _node, ...props }) => (
            <th {...props} className="border p-2 bg-muted/50 font-medium whitespace-nowrap" />
          ),
          td: ({ node: _node, ...props }) => <td {...props} className="border p-2 min-w-[120px]" />,
          img: ({ node: _node, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...props} alt={props.alt || "Message image"} className="max-w-full h-auto rounded-lg" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
