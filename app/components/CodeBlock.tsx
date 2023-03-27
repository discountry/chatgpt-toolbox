import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import hljs from "react-syntax-highlighter/dist/esm/styles/hljs/vs2015";

export default function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: any) {
  const match = /language-(\w+)/.exec(className || "");
  return (
    <>
      {!inline && match ? (
        <SyntaxHighlighter language={match![1]} style={hljs}>
          {children}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )}
    </>
  );
}
