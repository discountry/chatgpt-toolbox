import type { ComponentType, ReactNode } from "react";
import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import hljs from "react-syntax-highlighter/dist/esm/styles/hljs/vs2015";

type CodeBlockProps = {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
} & Record<string, unknown>;

const Highlighter = SyntaxHighlighter as unknown as ComponentType<
  {
    language?: string;
    style?: Record<string, unknown>;
    children?: ReactNode;
  }
>;

export default function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const match = /language-(\w+)/.exec(className ?? "");

  return (
    <>
      {!inline && match ? (
        <Highlighter language={match[1]} style={hljs}>
          {children}
        </Highlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )}
    </>
  );
}
