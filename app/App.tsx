"use client";
import createLiveChatCompletion, { LLMType } from "@/utils/liveGptClient";
import { SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import "./aether.css";
import Markdown from "./components/Markdown";

/* ---- Role presets (unchanged from original) ---- */
const ROLE_PRESETS = [
  {
    label: "Translator",
    direction: "Translate any message you received to professional English.",
  },
  {
    label: "Programmer",
    direction:
      "Your are a professional programmer. Answer the question with code example if necessary.",
  },
  {
    label: "Email",
    direction: "Transcript the message into a professional email.",
  },
  {
    label: "Tweet",
    direction: "Transcript the message into a tweet from top influencer.",
  },
];

/* ============================================================
   Decorative sub-components (AETHER-1 terminal chrome)
   ============================================================ */

function Led({
  on,
  color = "amber",
  breathe,
  fast,
}: {
  on?: boolean;
  color?: string;
  breathe?: boolean;
  fast?: boolean;
}) {
  const cls = ["led", on && "on", on && color, breathe && "breathe", fast && "fast"]
    .filter(Boolean)
    .join(" ");
  return <span className={cls} />;
}

function Indic({
  on,
  color,
  label,
  status,
}: {
  on?: boolean;
  color?: string;
  label: string;
  status?: string;
}) {
  return (
    <span className="indic">
      <Led on={on} color={color} breathe={status === "live"} fast={status === "busy"} />
      <span className={`lbl ${status || ""}`}>{label}</span>
    </span>
  );
}

/* Rotary encoder — cycles through the model list on click */
function Knob({
  models,
  index,
  onCycle,
}: {
  models: string[];
  index: number;
  onCycle: () => void;
}) {
  const n = models.length;
  const arc = 280;
  const start = -140;
  const rot = n > 1 ? start + (arc / (n - 1)) * index : 0;

  return (
    <div className="knob-unit">
      <div className="knob-dial">
        <div className="knob-ring">
          {models.map((_, i) => {
            const a = n > 1 ? start + (arc / (n - 1)) * i : 0;
            return (
              <span
                key={i}
                className={`knob-tick${i === index ? " active" : ""}`}
                style={{ transform: `translate(-50%,-50%) rotate(${a}deg)` }}
              />
            );
          })}
        </div>
        <button
          className="knob"
          style={{
            transform: `rotate(${rot}deg)`,
            "--rot": `${rot}deg`,
          } as React.CSSProperties}
          onClick={onCycle}
          aria-label="Cycle model"
        >
          <span className="pointer" />
        </button>
      </div>
      <div className="knob-screen">{models[index]}</div>
    </div>
  );
}

/* ============================================================
   Main App — all original logic preserved
   ============================================================ */

const MODEL_LABELS = ["GPT-3.5"];

export default function App({
  parseHTML = true,
  defaultDirection,
}: Readonly<{
  parseHTML?: boolean;
  defaultDirection?: string;
}>) {
  const model: LLMType = "gpt-3.5-turbo";

  const [apiKey, setApiKey] = useState("");
  const [modelIdx, setModelIdx] = useState(0);
  const [direction, setDirection] = useState(
    defaultDirection ||
      `Today is ${new Date().toDateString()}. You are a helpful assistant.`
  );
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [question, setQuestion] = useState("Hello, I am a human.");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "streaming">("idle");
  const [booting, setBooting] = useState(true);

  /* Message feed (displayed in CRT screen) */
  const [feed, setFeed] = useState<
    Array<{ who: string; text: string; role: string }>
  >([]);
  /* Currently streaming answer */
  const [streamText, setStreamText] = useState("");

  const resultRef = useRef("");
  const tailRef = useRef("");
  const feedRef = useRef<HTMLDivElement>(null);

  /* Boot flicker on mount */
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1100);
    return () => clearTimeout(t);
  }, []);

  /* Restore API key from localStorage */
  useEffect(() => {
    const localKey = localStorage.getItem("apiKey");
    if (localKey) setApiKey(localKey);
    localStorage.setItem("model", model);
  }, []);

  /* Auto-scroll feed on new content */
  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [feed, streamText]);

  const storeApiKey = (e: { target: { value: SetStateAction<string> } }) => {
    setApiKey(e.target.value);
    localStorage.setItem("apiKey", String(e.target.value));
  };

  const pickPreset = (preset: (typeof ROLE_PRESETS)[number]) => {
    if (activePreset === preset.label) {
      setActivePreset(null);
      setDirection(
        `Today is ${new Date().toDateString()}. You are a helpful assistant.`
      );
    } else {
      setActivePreset(preset.label);
      setDirection(preset.direction);
    }
  };

  const cycleModel = () => setModelIdx((i) => (i + 1) % MODEL_LABELS.length);

  /* ---- Submit: SSE streaming (original logic) ---- */
  const handleSubmit = useCallback(() => {
    if (question.trim() === "" || isLoading) {
      if (question.trim() === "") alert("Please insert a prompt!");
      return;
    }

    setIsLoading(true);
    setStatus("processing");
    setFeed((f) => [...f, { who: "USER", text: question, role: "user" }]);
    setStreamText("");
    resultRef.current = "";

    const source = createLiveChatCompletion(
      model,
      apiKey,
      2048,
      direction,
      question
    );

    source.addEventListener("message", (e: { data: string }) => {
      if (e.data !== "[DONE]") {
        const payload = JSON.parse(e.data);
        if (
          Object.prototype.hasOwnProperty.call(
            payload.choices[0].delta,
            "content"
          )
        ) {
          setStatus("streaming");
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
          setStreamText(resultRef.current);
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
          const finalText = resultRef.current;
          /* Clear stream text FIRST so it doesn't render alongside
             the finalized feed entry in the same frame */
          setStreamText("");
          setIsLoading(false);
          setStatus("idle");
          /* Finalize: push completed answer into feed */
          if (finalText) {
            setFeed((f) => [
              ...f,
              { who: "ASSISTANT", text: finalText, role: "asst" },
            ]);
          }
        }
      }
    );

    source.stream();
    setQuestion("");
  }, [question, isLoading, apiKey, direction, model]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit();
  };

  const busy = status !== "idle";
  const modeLabel = activePreset ? activePreset.toUpperCase() : "CHAT";

  return (
    <main className="room">
      <div className="chassis grain">
        {/* ---- Header ---- */}
        <div className="deck-head">
          <div className="brand">
            <div className="brand-title">
              AETHER·1<span className="reg">®</span>
            </div>
            <div className="brand-jp">ニューラル・ターミナル</div>
            <div className="brand-sub">AI Chat Composer</div>
          </div>
          <div className="statusbar">
            <span className="seg">
              <Led on color="green" breathe /> PWR
            </span>
            <span className="div" />
            <span className="seg">
              CONN <span className="val">USB-C</span>
            </span>
            <span className="div" />
            <span className="seg">
              SN <span className="val">47-Δ</span>
            </span>
            <span className="div" />
            <span className="grille" />
          </div>
        </div>
        <div className="seam" />

        <div className="console">
          {/* ========== LEFT: Control Panel ========== */}
          <div className="bay grain">
            <div className="control-stack">
              {/* API Key + System fields + Model knob */}
              <div className="headrow">
                <div className="fields">
                  <div>
                    <div className="silk">
                      <span className="tick" />
                      API Key
                    </div>
                    <div className="well key">
                      <input
                        type="password"
                        value={apiKey}
                        onChange={storeApiKey}
                        placeholder="sk-..."
                        spellCheck={false}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="silk">
                      <span className="tick" />
                      System
                    </div>
                    <div className="well sys">
                      <input
                        type="text"
                        value={direction}
                        onChange={(e) => {
                          setDirection(e.target.value);
                          setActivePreset(null);
                        }}
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </div>
                <div className="knobcol">
                  <div className="silk" style={{ margin: "0 0 4px" }}>
                    Model
                  </div>
                  <Knob
                    models={MODEL_LABELS}
                    index={modelIdx}
                    onCycle={cycleModel}
                  />
                  <div className="bracket">
                    <span>Engine</span>
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div>
                <div className="presets">
                  {ROLE_PRESETS.map((preset) => (
                    <div
                      key={preset.label}
                      className={`pcell${activePreset === preset.label ? " on" : ""}`}
                    >
                      <span className="pled" />
                      <button
                        className={`pbtn${activePreset === preset.label ? " on" : ""}`}
                        onClick={() => pickPreset(preset)}
                      >
                        {preset.label}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* User input */}
              <div>
                <div className="silk">
                  <span className="tick" />
                  User
                </div>
                <div className="well user">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Type your message…  (⌘/Ctrl + Enter to transmit)"
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                className={`submit${busy ? " busy" : ""}`}
                onClick={handleSubmit}
                disabled={isLoading}
              >
                <span className="recled" />
                <span className="slabel">
                  {status === "processing"
                    ? "Transmit…"
                    : status === "streaming"
                      ? "Receiving…"
                      : "Transmit"}
                </span>
              </button>
            </div>
          </div>

          {/* ========== RIGHT: CRT Display ========== */}
          <div className="crt-bay grain">
            <div className="crt-top">
              <div className="silk" style={{ margin: 0 }}>
                Assistant
              </div>
              <Indic
                on
                color={busy ? "amber" : "green"}
                label={
                  status === "processing"
                    ? "THINK"
                    : status === "streaming"
                      ? "STREAM"
                      : "READY"
                }
                status={busy ? "busy" : "live"}
              />
            </div>

            <div className={`crt-screen${booting ? " booting" : ""}`}>
              {booting && <span className="crt-boot" />}
              <div className="scr-status">
                <span className={`sdot${busy ? " on" : " live"}`} />
                <span className={`stxt${busy ? " hot" : ""}`}>
                  {status === "processing"
                    ? "PROCESSING"
                    : status === "streaming"
                      ? "STREAMING"
                      : "ONLINE"}
                </span>
                <span className="spacer" />
                <span className="stxt">{MODEL_LABELS[modelIdx]}</span>
                <span className={`bars${busy ? " run" : ""}`}>
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <div className="feedwrap">
                <div className="crt-feed" ref={feedRef}>
                  {feed.map((m, i) => (
                    <div
                      key={i}
                      className={`crt-line ${m.role === "user" ? "user" : ""}`}
                    >
                      <span className="who">{m.who}</span>
                      {m.role === "user" ? (
                        <span>
                          {"> "}
                          {m.text}
                        </span>
                      ) : parseHTML ? (
                        <Markdown content={m.text} />
                      ) : (
                        <span style={{ whiteSpace: "pre-wrap" }}>{m.text}</span>
                      )}
                    </div>
                  ))}
                  {status === "processing" && (
                    <div className="crt-line">
                      <span className="who">ASSISTANT</span>
                      <span style={{ opacity: 0.7 }}>thinking</span>
                      <span className="cursor" />
                    </div>
                  )}
                  {streamText && (
                    <div className="crt-line">
                      <span className="who">ASSISTANT</span>
                      {parseHTML ? (
                        <Markdown content={streamText} />
                      ) : (
                        <span style={{ whiteSpace: "pre-wrap" }}>
                          {streamText}
                        </span>
                      )}
                      <span className="cursor" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="crt-foot">
              <span className="seg">
                MODE <b>{modeLabel}</b>
              </span>
              <span className="seg">
                CH <b>01</b>
              </span>
              <span className="seg">
                38400 <b>BAUD</b>
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
