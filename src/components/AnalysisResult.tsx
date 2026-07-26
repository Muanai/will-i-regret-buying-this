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
      <div style={{ padding: "28px 28px 20px", borderBottom: "1px solid var(--color-divider-soft)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <SectionLabel>Oracle's Judgment</SectionLabel>
          <ActionChip action={data.recommendation_action || "Drop"} />
        </div>
        <button
          onClick={onReset}
          style={{ flexShrink: 0, width: "30px", height: "30px", borderRadius: "50%", background: "var(--color-divider-soft)", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--color-ink-muted-48)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--color-hairline)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--color-divider-soft)")}
        >&times;</button>
      </div>

      {/* ── GAUGE BLOCK ── */}
      <div style={{ padding: "28px 28px 24px", borderBottom: "1px solid var(--color-divider-soft)", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <RegretScoreGauge score={data.regret_score || 0} />
      </div>

      {/* ── QUICK STATS ── */}
      {data.quick_stats && data.quick_stats.length > 0 && (
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--color-divider-soft)" }}>
          <SectionLabel>Quick Numbers</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(data.quick_stats.length, 3)}, 1fr)`, gap: "10px" }}>
            {data.quick_stats.map((stat, i) => (
              <div key={i} style={{
                background: "var(--color-canvas-parchment)", padding: "12px 10px", borderRadius: "12px",
                display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "3px"
              }}>
                <span style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--color-ink)", fontFamily: '"SF Pro Display", system-ui, sans-serif' }}>{stat.value}</span>
                <span style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.6px", textTransform: "uppercase", color: "var(--color-ink-muted-48)" }}>{stat.label}</span>
              </div>
            ))}
          </div>
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

    </div>
  );
}