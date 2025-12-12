"use client";
import type { ComponentType, ReactNode } from "react";
import { useRef, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import ReactMarkdown from "react-markdown";
import CodeBlock from "./CodeBlock";
import styles from "./Markdown.module.css";

type ClipboardProps = {
  text: string;
  onCopy?: (text: string, result: boolean) => void;
  options?: {
    debug?: boolean;
    message?: string;
    format?: string;
  };
  children?: ReactNode;
};

const Clipboard = CopyToClipboard as unknown as ComponentType<ClipboardProps>;

export function PreCode(props: { children: ReactNode }) {
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
      <Clipboard
        text={ref.current ? ref.current.innerText : ""}
        onCopy={toggleCopied}
      >
        <button
          className={`${styles["copy-button"]} ${
            isCopied ? styles["blink"] : ""
          }`}
        ></button>
      </Clipboard>
      <div className="overflow-x-auto">{props.children}</div>
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
