"use client";

import React, { useEffect, useState } from "react";

interface QuickStat {
  label: string;
  value: string;
}

interface AnalysisData {
  type?: string;
  regret_score: number;
  quick_stats: QuickStat[];
  purchase_summary: string;
  financial_impact_reason: string;
  behavioral_insight: string;
  recommendation_action: string;
  recommendation_alternative: string;
}

/* ─────────────────────────────────────────────
   Regret Score Gauge — SVG Half-Circle
───────────────────────────────────────────── */
const RegretScoreGauge = ({ score }: { score: number }) => {
  const [animated, setAnimated] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnimated(score), 80); return () => clearTimeout(t); }, [score]);

  const R = 64;
  const SW = 12;
  const circ = Math.PI * R;
  const offset = circ * (1 - animated / 100);

  const color = score <= 35 ? "#34c759" : score <= 68 ? "#ff9f0a" : "#ff3b30";
  const label = score <= 35 ? "Low Regret" : score <= 68 ? "Moderate Regret" : "High Regret";

  const scoreStyle: React.CSSProperties = {
    fontSize: "48px", fontWeight: 700, lineHeight: 1,
    letterSpacing: "-2px", color: "var(--color-ink)",
    fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif',
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0px", paddingTop: "8px" }}>
      {/* SVG Gauge */}
      <div style={{ position: "relative", width: "160px", height: "84px" }}>
        <svg width="160" height="84" viewBox="0 0 160 80" style={{ overflow: "visible" }}>
          {/* Subtle glow behind for high scores */}
          {score > 68 && (
            <path d="M 16 80 A 64 64 0 0 1 144 80" fill="none"
              stroke={color} strokeWidth={SW + 6} strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset}
              style={{ opacity: 0.2, filter: "blur(10px)", transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }} />
          )}
          {/* Track */}
          <path d="M 16 80 A 64 64 0 0 1 144 80" fill="none"
            stroke="var(--color-divider-soft)" strokeWidth={SW} strokeLinecap="round" />
          {/* Progress */}
          <path d="M 16 80 A 64 64 0 0 1 144 80" fill="none"
            stroke={color} strokeWidth={SW} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1), stroke 0.4s ease" }} />
        </svg>
        {/* Score number centred in arc */}
        <div style={{ position: "absolute", bottom: "0px", left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={scoreStyle}>{animated}</span>
        </div>
      </div>
      {/* Label row */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, display: "inline-block" }} />
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-ink-muted-48)", letterSpacing: "0.5px", textTransform: "uppercase" }}>{label}</span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Verdict Action Chip
───────────────────────────────────────────── */
const ActionChip = ({ action }: { action: string }) => {
  const map: Record<string, { bg: string; fg: string; icon: string }> = {
    Buy:   { bg: "rgba(52, 199, 89, 0.10)",  fg: "#1a7a34", icon: "✓" },
    Delay: { bg: "rgba(255, 159, 10, 0.10)", fg: "#9a6000", icon: "⏸" },
    Drop:  { bg: "rgba(255, 59, 48, 0.10)",  fg: "#c0392b", icon: "✕" },
  };
  const s = map[action] || map.Drop;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "6px 16px", borderRadius: "9999px",
      background: s.bg, color: s.fg,
      fontSize: "13px", fontWeight: 700, letterSpacing: "0.3px",
    }}>
      {s.icon} {action.toUpperCase()}
    </span>
  );
};

/* ─────────────────────────────────────────────
   Section label
───────────────────────────────────────────── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    margin: "0 0 8px",
    fontSize: "11px", fontWeight: 600, letterSpacing: "1.5px",
    textTransform: "uppercase", color: "var(--color-ink-muted-48)"
  }}>{children}</p>
);

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function AnalysisResult({ data, onReset }: { data: AnalysisData | null; onReset: () => void }) {
  if (!data) {
    return (
      <div style={{
        height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", gap: "16px",
        color: "var(--color-ink-muted-48)"
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 600, color: "var(--color-ink-muted-80)" }}>Verdict Pending</p>
          <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.5 }}>Submit a product to the chat to receive the AI's judgment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verdict-panel animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: 0, height: "100%", overflowY: "auto", overflowX: "hidden" }}>

      {/* ── HEADER ── */}
      <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid var(--color-divider-soft)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <SectionLabel>Oracle's Judgment</SectionLabel>
          <ActionChip action={data.recommendation_action || "Drop"} />
        </div>
        <button
          onClick={onReset}
          title="Reset and analyze a new product"
          style={{
            flexShrink: 0,
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "6px 12px",
            borderRadius: "9999px",
            background: "var(--color-canvas-parchment)",
            border: "1px solid var(--color-hairline)",
            cursor: "pointer",
            fontSize: "12px", fontWeight: 600,
            color: "var(--color-ink-muted-48)",
            letterSpacing: "0.1px",
            transition: "background 0.15s, color 0.15s, border-color 0.15s"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#fff0f0";
            e.currentTarget.style.color = "#c0392b";
            e.currentTarget.style.borderColor = "rgba(192,57,43,0.25)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "var(--color-canvas-parchment)";
            e.currentTarget.style.color = "var(--color-ink-muted-48)";
            e.currentTarget.style.borderColor = "var(--color-hairline)";
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Start Over
        </button>
      </div>

      {/* ── GAUGE BLOCK ── */}
      <div style={{ padding: "28px 28px 24px", borderBottom: "1px solid var(--color-divider-soft)", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <RegretScoreGauge score={data.regret_score || 0} />
      </div>

      {/* ── QUICK STATS ── */}
      {data.quick_stats && data.quick_stats.length > 0 && (
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-divider-soft)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <SectionLabel>Quick Numbers</SectionLabel>
          {data.quick_stats.map((stat, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "var(--color-canvas-parchment)",
              border: "1px solid transparent",
            }}>
              <span style={{
                fontSize: "13px", fontWeight: 500, letterSpacing: "-0.1px",
                color: "var(--color-ink-muted-48)"
              }}>{stat.label}</span>
              <span style={{
                fontSize: "15px", fontWeight: 700, letterSpacing: "-0.4px",
                color: "var(--color-ink)",
                fontFamily: '"SF Pro Display", system-ui, sans-serif'
              }}>{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── SUMMARY (dark tile) ── */}
      <div style={{ margin: "20px 28px", borderRadius: "16px", background: "var(--color-surface-tile-1)", padding: "24px" }}>
        <SectionLabel><span style={{ color: "rgba(255,255,255,0.35)" }}>Summary</span></SectionLabel>
        <p style={{
          margin: 0, color: "var(--color-on-dark)", fontSize: "16px",
          fontStyle: "italic", lineHeight: 1.65, letterSpacing: "-0.2px"
        }}>"{data.purchase_summary}"</p>
      </div>

      {/* ── FINANCIAL IMPACT ── */}
      <div style={{ padding: "0 28px 20px" }}>
        <SectionLabel>Financial Impact</SectionLabel>
        <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.65, letterSpacing: "-0.2px", color: "var(--color-ink)" }}>{data.financial_impact_reason}</p>
      </div>

      {/* Hairline */}
      <div style={{ margin: "0 28px", height: "1px", background: "var(--color-divider-soft)" }} />

      {/* ── BEHAVIORAL INSIGHT ── */}
      <div style={{ padding: "20px 28px" }}>
        <SectionLabel>Behavioral Insight</SectionLabel>
        <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.65, letterSpacing: "-0.2px", color: "var(--color-ink)" }}>{data.behavioral_insight}</p>
      </div>

      {/* ── SMARTER ALTERNATIVE ── */}
      <div style={{ margin: "0 28px 28px", borderRadius: "14px", border: "1px solid rgba(0,102,204,0.15)", background: "rgba(0,102,204,0.04)", padding: "20px" }}>
        <SectionLabel><span style={{ color: "var(--color-primary)" }}>Smarter Alternative</span></SectionLabel>
        <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.65, letterSpacing: "-0.2px", color: "var(--color-primary)", opacity: 0.9 }}>{data.recommendation_alternative}</p>
      </div>

      {/* ── SHARE BUTTON ── */}
      <div style={{ padding: "0 28px 32px", display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => {
            const text = `The AI just roasted my purchase idea.\n\nRegret Score: ${data.regret_score}/100\nVerdict: ${data.recommendation_action}\n\n"${data.purchase_summary}"\n\n- Will I Regret Buying This?`;
            navigator.clipboard.writeText(text);
            alert("Verdict copied to clipboard! Share it with the world.");
          }}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "10px 24px", borderRadius: "9999px",
            background: "var(--color-ink)", color: "var(--color-canvas)",
            border: "none", cursor: "pointer",
            fontSize: "14px", fontWeight: 600, letterSpacing: "0.2px",
            transition: "transform 0.15s ease, background 0.15s ease"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#000"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--color-ink)"}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          Share Verdict
        </button>
      </div>

    </div>
  );
}