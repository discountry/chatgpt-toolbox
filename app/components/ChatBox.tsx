"use client";
import { genetrateCopyButton, getLongestArray } from "@/utils/helper";
import createLiveChatCompletion from "@/utils/liveGptClient";
import hljs from "highlight.js";
import { marked } from "marked";
import { SetStateAction, useEffect, useRef, useState } from "react";
import styles from "./ChatBox.module.css";

marked.setOptions({
  langPrefix: "hljs language-",
  highlight: function (code: any) {
    return hljs.highlightAuto(code, [
      "html",
      "javascript",
      "python",
      "rust",
      "go",
    ]).value;
  },
});

const ChatBox = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setInputValue(event.target.value);
  };

  const handleFormSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const newMessage = {
      role: "user",
      content: inputValue,
    };
    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  const getGPTReply = (question: string) => {
    if (question !== "" && !isLoading) {
      setIsLoading(true);

      const source = createLiveChatCompletion(
        localStorage.getItem("apiKey") as string,
        1024,
        "You are chatgpt3.5, a chatbot that uses OpenAI's GPT-3 API.",
        getLongestArray(messages),
        "chat"
      );

      source.addEventListener("message", (e: { data: string }) => {
        if (e.data != "[DONE]") {
          const payload = JSON.parse(e.data);
          if (
            Object.prototype.hasOwnProperty.call(
              payload.choices[0].delta,
              "content"
            )
          ) {
            const text = payload.choices[0].delta.content;

            setMessages((prevState) => {
              const updatedArray = [...prevState];
              if (updatedArray[prevState.length - 1].role === "user") {
                return [...updatedArray, { role: "assistant", content: text }];
              } else {
                updatedArray[prevState.length - 1] = {
                  role: "assistant",
                  content: updatedArray[prevState.length - 1].content + text,
                };
                return updatedArray;
              }
            });
          }
        } else {
          source.close();
        }
      });

      source.addEventListener(
        "readystatechange",
        (e: { readyState: number }) => {
          if (e.readyState >= 2) {
            setIsLoading(false);
            setTimeout(() => {
              genetrateCopyButton();
            }, 500);
          }
        }
      );

      source.stream();
    } else {
      alert("Please insert a prompt!");
    }
  };

  useEffect(() => {
    if (messages[messages.length - 1]?.role === "user") {
      getGPTReply(messages[messages.length - 1]?.content);
    }

    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return (
    <div className={styles["container"]}>
      <div className={styles["chat-box"]}>
        <div
          ref={messagesContainerRef}
          className={styles["messages-container"]}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${styles["message"]} ${
                message.role === "user" ? styles["sent"] : styles["received"]
              }`}
            >
              <div
                className={styles["message-content"]}
                dangerouslySetInnerHTML={{
                  __html: marked.parse(message.content),
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <form className={styles["input-container"]} onSubmit={handleFormSubmit}>
        <input
          className={styles["chat-input"]}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type your message here..."
        />
        <button
          disabled={isLoading}
          className={styles["submit-button"]}
          type="submit"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
