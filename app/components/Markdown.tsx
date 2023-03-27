"use client";
import { useRef, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import ReactMarkdown from "react-markdown";
import CodeBlock from "./CodeBlock";
import styles from "./Markdown.module.css";

export function PreCode(props: { children: any }) {
  const ref = useRef<HTMLPreElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  const toggleCopied = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <pre ref={ref}>
      <CopyToClipboard
        text={ref.current ? ref.current.innerText : ""}
        onCopy={toggleCopied}
      >
        <button
          className={`${styles["copy-button"]} ${
            isCopied ? styles["blink"] : undefined
          }`}
        ></button>
      </CopyToClipboard>
      {props.children}
    </pre>
  );
}

export default function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        pre: PreCode,
        code: CodeBlock,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
