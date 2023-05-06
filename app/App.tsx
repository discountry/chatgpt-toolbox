"use client";
import createLiveChatCompletion from "@/utils/liveGptClient";
import { SetStateAction, useEffect, useRef, useState } from "react";
import Markdown from "./components/Markdown";

export default function App({
  parseHTML = true,
  defaultDirection,
}: {
  parseHTML?: boolean;
  defaultDirection?: string;
}) {
  const [apiKey, setApiKey] = useState("");
  const [maxTokens, setMaxTokens] = useState("2048");
  const [direction, setDirection] = useState(
    defaultDirection ? defaultDirection : "You are gpt 3.5"
  );
  const [question, setQuestion] = useState("Hello, I am a human.");
  const [answer, setAnswer] = useState("...");

  const [isLoading, setIsLoading] = useState(false);

  const resultRef = useRef("");

  const tailRef = useRef("");

  const storeApiKey = (e: { target: { value: SetStateAction<string> } }) => {
    setApiKey(e.target.value);
    localStorage.setItem("apiKey", String(e.target.value));
  };

  const handleSubmitPromptBtnClicked = () => {
    if (question !== "" && !isLoading) {
      setIsLoading(true);
      setAnswer("");

      const source = createLiveChatCompletion(
        apiKey,
        Number(maxTokens),
        direction,
        question
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

            if (text.includes("```")) {
              if (tailRef.current === "") {
                tailRef.current = "\n```";
              } else {
                tailRef.current = "";
              }
            }

            if (text === "`") {
              tailRef.current = "";
            }

            resultRef.current = resultRef.current + text;

            setAnswer(resultRef.current);
          }
        } else {
          source.close();
        }
      });

      source.addEventListener(
        "readystatechange",
        (e: { readyState: number }) => {
          if (e.readyState >= 2) {
            tailRef.current = "";
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
    // Perform localStorage action
    const localKey = localStorage.getItem("apiKey");
    if (localKey) {
      setApiKey(localKey);
    }
  }, []);

  useEffect(() => {
    resultRef.current = answer;
  }, [answer]);

  return (
    <main className="container mx-auto max-w-lg xl:max-w-screen-xl h-screen max-h-screen overflow-hidden px-4">
      <div className="flex flex-col xl:flex-row xl:flex-wrap h-full pt-6">
        {/* <div className="basis-full h-12">
          <h1 className="text-center text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
            ChatGPT Toolbox
          </h1>
        </div> */}
        <div className="basis-1/3 xl:basis-1/2 px-2">
          <div className="flex h-full flex-col">
            <div className="flex-none">
              <label>
                <span className="text-xs font-semibold inline-block py-1 px-2 my-2 uppercase rounded text-teal-600 bg-teal-200">
                  API_KEY
                </span>
                <input
                  className="resize-none h-8 md:h-12 w-full px-5 py-2 font-medium border border-b-4 border-r-4 border-black rounded-lg shadow-lg hover:shadow-sm"
                  name="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={storeApiKey}
                />
              </label>
            </div>
            <div className="flex-none">
              <label>
                <span className="text-xs font-semibold inline-block py-1 px-2 my-2 uppercase rounded text-red-600 bg-red-200">
                  System
                </span>
                <input
                  className="resize-none h-8 md:h-12 w-full px-5 py-2 font-medium border border-b-4 border-r-4 border-black rounded-lg shadow-lg hover:shadow-sm"
                  name="system"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                />
              </label>
            </div>
            <div className="grow pb-12">
              <label>
                <span className="text-xs font-semibold inline-block py-1 px-2 my-2 uppercase rounded text-blue-600 bg-blue-200">
                  User
                </span>
                <textarea
                  className="resize-none h-full w-full px-5 py-2 font-medium border border-b-4 border-r-4 border-black rounded-lg shadow-lg hover:shadow-sm"
                  name="user"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </label>
            </div>
            <div className="flex-none">
              <button
                disabled={isLoading}
                className={
                  isLoading
                    ? "h-12 w-full px-6 py-2 my-2 text-gray-700 border border-b-4 border-r-4 border-gray-500 hover:bg-gray-500 hover:text-gray-100 rounded-lg shadow-lg"
                    : "h-12 w-full px-6 py-2 my-2 text-indigo-700 border border-b-4 border-r-4 border-indigo-500 hover:bg-indigo-500 hover:text-indigo-100 rounded-lg shadow-lg"
                }
                onClick={handleSubmitPromptBtnClicked}
              >
                {isLoading ? `Loading...` : `Submit`}
              </button>
            </div>
          </div>
        </div>
        <div className="basis-full xl:basis-1/2 max-h-full xl:w-1/2 pb-12">
          <label>
            <span className="text-xs font-semibold inline-block py-1 px-2 my-2 uppercase rounded text-slate-600 bg-slate-200 last:mr-0 mr-1">
              Assistant
            </span>
            <div className="overflow-auto h-full w-full px-5 py-2 font-medium bg-slate-100 border border-b-4 border-r-4 border-black rounded-lg shadow-lg hover:shadow-sm">
              {parseHTML ? (
                <Markdown content={answer} />
              ) : (
                <div className="flex flex-col">{answer}</div>
              )}
            </div>
          </label>
        </div>
      </div>
    </main>
  );
}
