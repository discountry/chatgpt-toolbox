"use client";
import { SetStateAction, useEffect, useState } from "react";

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [maxTokens, setMaxTokens] = useState("4096");
  const [direction, setDirection] = useState("Your are gpt 3.5");
  const [question, setQuestion] = useState("Hello, I am a human.");
  const [answer, setAnswer] = useState("Loading...");

  const storeApiKey = (e: { target: { value: SetStateAction<string> } }) => {
    setApiKey(e.target.value);
    localStorage.setItem("apiKey", String(e.target.value));
  };

  const getAnswer = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ apiKey, maxTokens, direction, question }),
    });
    const data = await res.json();

    setAnswer(data);
  };

  useEffect(() => {
    // Perform localStorage action
    const localKey = localStorage.getItem("apiKey");
    if (localKey) {
      setApiKey(localKey);
    }
  }, []);

  return (
    <main className="container mx-auto max-w-lg px-4 py-24">
      <div className="flex flex-col">
        <div className="basis-full">
          <h1 className="text-center text-3xl font-bold">ChatGPT Toolbox</h1>
        </div>
        <div className="flex flex-row">
          <div className="basis-3/4">
            <label>
              <span className="text-xs font-semibold inline-block py-1 px-2 my-2 uppercase rounded text-teal-600 bg-teal-200 uppercase last:mr-0 mr-1">
                API_KEY
              </span>
              <input
                className="resize-none h-8 w-full px-5 py-2 font-medium border border-b-4 border-r-4 border-black rounded-lg shadow-lg hover:shadow-sm"
                name="apiKey"
                type="password"
                value={apiKey}
                onChange={storeApiKey}
              />
            </label>
          </div>
          <div className="basis-1/4 pl-2">
            <label>
              <span className="text-xs font-semibold inline-block py-1 px-2 my-2 uppercase rounded text-yellow-600 bg-yellow-200 uppercase last:mr-0 mr-1">
                max_tokens
              </span>
              <input
                className="resize-none h-8 w-full px-5 py-2 font-medium border border-b-4 border-r-4 border-black rounded-lg shadow-lg hover:shadow-sm"
                name="maxTokens"
                type="text"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="basis-full">
          <label>
            <span className="text-xs font-semibold inline-block py-1 px-2 my-2 uppercase rounded text-red-600 bg-red-200 uppercase last:mr-0 mr-1">
              System
            </span>
            <textarea
              className="resize-none h-12 w-full px-5 py-2 font-medium border border-b-4 border-r-4 border-black rounded-lg shadow-lg hover:shadow-sm"
              name="system"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            />
          </label>
        </div>
        <div className="basis-full">
          <label>
            <span className="text-xs font-semibold inline-block py-1 px-2 my-2 uppercase rounded text-blue-600 bg-blue-200 uppercase last:mr-0 mr-1">
              User
            </span>
            <textarea
              className="resize-none h-56 w-full px-5 py-2 font-medium border border-b-4 border-r-4 border-black rounded-lg shadow-lg hover:shadow-sm"
              name="user"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </label>
        </div>
        <div className="basis-full">
          <button
            className="w-full px-6 py-2 my-2 text-indigo-700 border-2 border-indigo-500 hover:bg-indigo-500 hover:text-indigo-100"
            onClick={getAnswer}
          >
            Submit
          </button>
        </div>
        <div className="basis-full">
          <label>
            <span className="text-xs font-semibold inline-block py-1 px-2 my-2 uppercase rounded text-slate-600 bg-slate-200 uppercase last:mr-0 mr-1">
              Assistant
            </span>
            <textarea
              readOnly
              className="resize-none h-56 w-full px-5 py-2 font-medium border border-b-4 border-r-4 border-black rounded-lg shadow-lg hover:shadow-sm"
              name="assistant"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </label>
        </div>
      </div>
    </main>
  );
}
