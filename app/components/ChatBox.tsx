"use client";
import { getLongestArray } from "@/utils/helper";
import createLiveChatCompletion from "@/utils/liveGptClient";
import { SetStateAction, useEffect, useRef, useState } from "react";
import styles from "./ChatBox.module.css";
import Markdown from "./Markdown";

const ChatBox = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSystem, setShowSystem] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const toggleSystem = () => {
    setShowSystem(!showSystem);
  };

  const handleInputChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setInputValue(event.target.value);
  };

  const handleSystemPromptChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setSystemPrompt(event.target.value);
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

  const clearHistory = () => {
    setMessages([]);
  };

  const getGPTReply = (question: string) => {
    if (question !== "" && !isLoading) {
      setIsLoading(true);

      const source = createLiveChatCompletion(
        localStorage.getItem("apiKey") as string,
        1024,
        systemPrompt
          ? systemPrompt
          : "You are chatgpt3.5, a chatbot that uses OpenAI's GPT-3 API.",
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
              <Markdown content={message.content} />
            </div>
          ))}
        </div>
      </div>
      <form className={styles["input-container"]} onSubmit={handleFormSubmit}>
        <div className={styles["button-group"]}>
          <button
            type="button"
            onClick={toggleSystem}
            className={styles["setting-button"]}
          >
            Config
          </button>
          <button
            type="button"
            onClick={clearHistory}
            className={styles["clear-button"]}
          >
            Clear
          </button>
        </div>
        <input
          className={`${!showSystem ? styles["hidden"] : undefined} ${
            styles["chat-input"]
          }`}
          type="text"
          value={systemPrompt}
          onChange={handleSystemPromptChange}
          placeholder="System prompt here..."
        />
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
