/**
 * Lightweight SSE (Server-Sent Events) client that supports POST requests
 * with custom headers and JSON payloads.
 *
 * Drop-in replacement for the removed `sse.js` dependency.
 * Uses the Fetch API + ReadableStream instead of XMLHttpRequest.
 */

type SSEEvent = { data: string };
type ReadyStateEvent = { readyState: number };

type SSEEventMap = {
  message: SSEEvent;
  readystatechange: ReadyStateEvent;
  error: Event;
};

type SSEListener<K extends keyof SSEEventMap> = (event: SSEEventMap[K]) => void;

export interface SSEOptions {
  headers?: Record<string, string>;
  method?: string;
  payload?: string;
}

/** ReadyState constants matching XMLHttpRequest semantics. */
const CONNECTING = 0;
const OPEN = 1;
const CLOSED = 2;

export class SSE {
  private url: string;
  private options: SSEOptions;
  private listeners: { [K in keyof SSEEventMap]?: SSEListener<K>[] } = {};
  private controller: AbortController | null = null;
  private _readyState: number = CONNECTING;

  constructor(url: string, options: SSEOptions = {}) {
    this.url = url;
    this.options = options;
  }

  addEventListener<K extends keyof SSEEventMap>(
    type: K,
    listener: SSEListener<K>,
  ): void {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    (this.listeners[type] as SSEListener<K>[]).push(listener);
  }

  private emit<K extends keyof SSEEventMap>(
    type: K,
    event: SSEEventMap[K],
  ): void {
    const handlers = this.listeners[type] as SSEListener<K>[] | undefined;
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  }

  private setReadyState(state: number): void {
    if (this._readyState === state) return;
    this._readyState = state;
    this.emit("readystatechange", { readyState: state });
  }

  /** Start the SSE stream. */
  async stream(): Promise<void> {
    this.controller = new AbortController();
    this.setReadyState(CONNECTING);

    try {
      const response = await fetch(this.url, {
        method: this.options.method || "GET",
        headers: this.options.headers,
        body: this.options.payload,
        signal: this.controller.signal,
      });

      if (!response.ok) {
        // Surface HTTP errors as an SSE message so callers can handle them
        // uniformly — the original sse.js behaved the same way.
        const errorBody = await response.text();
        this.emit("message", { data: errorBody });
        this.setReadyState(CLOSED);
        return;
      }

      this.setReadyState(OPEN);

      const reader = response.body?.getReader();
      if (!reader) {
        this.setReadyState(CLOSED);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE protocol: events are separated by double newlines.
        // Each line can be "data: ...", "event: ...", "id: ...", or "retry: ...".
        // We only need "data:" lines for LLM streaming.
        const lines = buffer.split("\n");
        // Keep the last (possibly incomplete) line in the buffer.
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === "") continue;

          if (trimmed.startsWith("data:")) {
            const data = trimmed.slice(5).trim();
            this.emit("message", { data });
          }
          // Ignore other SSE fields (event:, id:, retry:) — not used by LLM APIs.
        }
      }

      // Flush any remaining buffered data
      if (buffer.trim().startsWith("data:")) {
        const data = buffer.trim().slice(5).trim();
        this.emit("message", { data });
      }

      // Signal end-of-stream for consumers that check for [DONE]
      this.emit("message", { data: "[DONE]" });
    } catch (err: unknown) {
      // AbortError is expected when close() is called; don't treat it as a failure.
      if (err instanceof DOMException && err.name === "AbortError") {
        // Intentionally closed — no action needed.
      } else {
        this.emit("error", new Event("error"));
      }
    } finally {
      this.setReadyState(CLOSED);
    }
  }

  /** Abort the in-flight request and close the stream. */
  close(): void {
    this.controller?.abort();
    this.setReadyState(CLOSED);
  }
}
