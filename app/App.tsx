"use client";
import createLiveChatCompletion, { LLMType } from "@/utils/liveGptClient";
import { SetStateAction, useEffect, useRef, useState } from "react";
import Markdown from "./components/Markdown";

export default function App({
  parseHTML = true,
  defaultDirection,
}: Readonly<{
  parseHTML?: boolean;
  defaultDirection?: string;
}>) {
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [apiKey, setApiKey] = useState("");
  const [maxTokens, setMaxTokens] = useState("2048");
  const [direction, setDirection] = useState(
    defaultDirection ||
      `Today is ${new Date().toDateString()}.You are a helpful assistant.`
  );
  const [question, setQuestion] = useState("Hello, I am a human.");
  const [answer, setAnswer] = useState("...");

  const [isLoading, setIsLoading] = useState(false);

  const resultRef = useRef("");

  const tailRef = useRef("");

  const storeModel = (e: { target: { value: SetStateAction<string> } }) => {
    setModel(e.target.value);
    localStorage.setItem("model", String(e.target.value));
  };

  const storeApiKey = (e: { target: { value: SetStateAction<string> } }) => {
    setApiKey(e.target.value);
    localStorage.setItem("apiKey", String(e.target.value));
  };

  const handleRoleChange = (direction: string) => {
    setDirection(direction);
  };

  const handleSubmitPromptBtnClicked = () => {
    if (question !== "" && !isLoading) {
      setIsLoading(true);
      setAnswer("");

      const source = createLiveChatCompletion(
        model as LLMType,
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
    const localModel = localStorage.getItem("model");
    if (localModel) {
      setModel(localModel);
    }
  }, []);

  useEffect(() => {
    resultRef.current = answer;
  }, [answer]);

  return (
    <main className="container h-screen max-w-lg max-h-screen px-4 mx-auto overflow-hidden xl:max-w-screen-xl">
      <div className="grid h-full gap-2 xl:grid-cols-2">
        <div className="w-full">
          <div className="flex flex-col h-full">
            <div className="flex-none">
              <div className="flex gap-1">
                <div className="basis-3/4">
                  <label>
                    <span className="inline-block px-2 py-1 my-2 text-xs font-semibold text-teal-600 uppercase bg-teal-200 rounded">
                      API_KEY
                    </span>
                    <input
                      className="w-full h-8 px-5 py-2 font-medium text-white bg-transparent border border-white rounded-lg resize-none xl:h-12 hover:shadow-sm"
                      name="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={storeApiKey}
                    />
                  </label>
                </div>
                <div className="basis-1/4">
                  <label>
                    <span className="inline-block px-2 py-1 my-2 text-xs font-semibold text-teal-600 uppercase bg-teal-200 rounded">
                      Model
                    </span>
                    <select
                      className="w-full h-8 px-5 py-2 font-medium text-white bg-transparent border border-white rounded-lg shadow-lg xl:h-12 hover:shadow-sm text-sm"
                      value={model}
                      onChange={storeModel}
                    >
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="claude-3-haiku">Claude-3 Haiku</option>
                      <option value="llama-3-70b">Llama-3 70B</option>
                      <option value="mixtral-8x7b">Mixtral-8x7B</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex-none">
              <label>
                <span className="inline-block px-2 py-1 my-2 text-xs font-semibold text-red-600 uppercase bg-red-200 rounded">
                  System
                </span>
                <input
                  className="w-full h-8 px-5 py-2 font-medium text-white bg-transparent border border-white rounded-lg shadow-lg resize-none xl:h-12 hover:shadow-sm"
                  name="system"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                />
              </label>
            </div>
            <div className="flex-none">
              <div className="flex gap-2 my-2">
                <button
                  className="h-8 w-full text-violet-100 border border-white hover:bg-slate-600 rounded-lg shadow-lg"
                  onClick={() =>
                    handleRoleChange(
                      "Translate any message you received to professional English."
                    )
                  }
                >
                  Translator
                </button>
                <button
                  className="h-8 w-full text-violet-100 border border-white hover:bg-slate-600 rounded-lg shadow-lg"
                  onClick={() =>
                    handleRoleChange(
                      "Your are a professional programmer. Answer the question with code example if necessary."
                    )
                  }
                >
                  Programmer
                </button>
                <button
                  className="h-8 w-full text-violet-100 border border-white hover:bg-slate-600 rounded-lg shadow-lg"
                  onClick={() =>
                    handleRoleChange(
                      "Transcript the message into a professional email."
                    )
                  }
                >
                  Email
                </button>
                <button
                  className="h-8 w-full text-violet-100 border border-white hover:bg-slate-600 rounded-lg shadow-lg"
                  onClick={() =>
                    handleRoleChange(
                      "Transcript the message into a tweet from top influencer."
                    )
                  }
                >
                  Tweet
                </button>
              </div>
            </div>
            <div className="pb-12 grow">
              <label>
                <span className="inline-block px-2 py-1 my-2 text-xs font-semibold text-blue-600 uppercase bg-blue-200 rounded">
                  User
                </span>
                <textarea
                  className="w-full h-full px-5 py-2 font-medium text-white bg-transparent border border-white rounded-lg shadow-lg resize-none hover:shadow-sm"
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
                    ? "h-12 w-full px-6 py-2 my-2 text-gray-100 hover:bg-gray-500 bg-gray-500 rounded-lg shadow-lg"
                    : "h-12 w-full px-6 py-2 my-2 text-violet-100 border border-white hover:bg-slate-600 rounded-lg shadow-lg"
                }
                onClick={handleSubmitPromptBtnClicked}
              >
                {isLoading ? `Loading...` : `Submit`}
              </button>
            </div>
          </div>
        </div>
        <div className="w-full pb-12 max-h-96 xl:max-h-screen xl:h-screen">
          <label>
            <span className="inline-block px-2 py-1 my-2 mr-1 text-xs font-semibold text-green-600 uppercase bg-green-200 rounded last:mr-0">
              Assistant
            </span>
            <div className="w-full h-full px-5 py-2 overflow-x-hidden overflow-y-auto font-medium text-white border border-white rounded-lg shadow-lg hover:shadow-sm">
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
