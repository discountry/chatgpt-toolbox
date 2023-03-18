"use client";
import createLiveChatCompletion from "@/utils/liveGptClient";
import { SetStateAction, useEffect, useState } from "react";
import styles from "./ChatBox.module.css";

const ChatBox = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        messages,
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return (
    <div className={styles["chat-box"]}>
      <div className={styles["messages-container"]}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${styles["message"]} ${
              message.role === "user" ? styles["sent"] : styles["received"]
            }`}
          >
            <p>{message.content}</p>
          </div>
        ))}
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
