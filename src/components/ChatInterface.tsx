"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isAnalyzing: boolean;
}

export default function ChatInterface({ messages, onSendMessage, isAnalyzing }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isAnalyzing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAnalyzing) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const isEmpty = messages.length === 0 && !isAnalyzing;

  return (
    <div className="card-utility" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", padding: 0, borderRadius: 0, border: "none" }}>
      {/* Header */}
      <div style={{ background: "var(--color-surface-tile-1)", padding: "0 20px", display: "flex", alignItems: "center", height: "44px", flexShrink: 0, borderBottom: "1px solid #3a3a3c" }}>
        <div style={{ width: "2px", height: "16px", background: "var(--color-primary-on-dark)", borderRadius: "1px", marginRight: "12px", flexShrink: 0 }} />
        <span className="type-caption-strong" style={{ color: "var(--color-body-muted)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
          Interrogation Room
        </span>
        <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--color-ink-muted-48)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          AI Active
        </span>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", background: "var(--color-canvas-parchment)" }}>
        {isEmpty ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--color-ink-muted-48)", gap: "12px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p className="type-caption-strong" style={{ color: "var(--color-ink-muted-48)" }}>The interrogation room is empty.</p>
            <p className="type-caption" style={{ color: "var(--color-ink-muted-48)" }}>Submit a product to begin.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="animate-fade-up" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div className={msg.role === "user" ? "bubble-user" : "bubble-ai"}>
                {msg.content}
              </div>
            </div>
          ))
        )}

        {isAnalyzing && (
          <div className="animate-fade-up" style={{ display: "flex", justifyContent: "flex-start" }}>
            <div className="bubble-ai" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="type-caption" style={{ color: "var(--color-ink-muted-48)" }}>AI is thinking</span>
              <span style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <span className="dot-pulse" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--color-ink-muted-48)", display: "inline-block" }}></span>
                <span className="dot-pulse-2" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--color-ink-muted-48)", display: "inline-block" }}></span>
                <span className="dot-pulse-3" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--color-ink-muted-48)", display: "inline-block" }}></span>
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", padding: "14px 16px", borderTop: "1px solid var(--color-hairline)", background: "var(--color-canvas)", borderRadius: "0 0 var(--radius-lg) var(--radius-lg)", flexShrink: 0 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isAnalyzing}
          placeholder={isAnalyzing ? "AI is deliberating…" : "Defend your purchase…"}
          className="input-field"
          style={{ padding: "10px 16px", fontSize: "15px" }}
        />
        <button type="submit" disabled={!input.trim() || isAnalyzing} className="btn-primary" style={{ padding: "10px 20px", fontSize: "15px", flexShrink: 0 }}>
          Send
        </button>
      </form>
    </div>
  );
}
