"use client";

interface AnalysisData {
  type?: string;
  suggested_risk_tier: string;
  purchase_summary: string;
  financial_impact_reason: string;
  behavioral_insight: string;
  recommendation_action: string;
  recommendation_alternative: string;
}

export default function AnalysisResult({ data, onReset }: { data: AnalysisData | null, onReset: () => void }) {
  if (!data) {
    return (
      <div className="card-utility" style={{ height: "620px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "12px", border: "1px dashed var(--color-hairline)", background: "var(--color-canvas)" }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-ink-muted-48)" }}>
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
        <p className="type-caption-strong" style={{ color: "var(--color-ink-muted-48)" }}>The Verdict Awaits</p>
        <p className="type-caption" style={{ color: "var(--color-ink-muted-48)" }}>The AI has not yet passed judgment.</p>
      </div>
    );
  }

  const tier = data.suggested_risk_tier?.toLowerCase() || "high";
  const tierClass = `risk-${tier}`;
  const actionColor = data.recommendation_action === "Buy" ? "#1b5e20" : data.recommendation_action === "Delay" ? "#e65100" : "#880e4f";
  const actionBg = data.recommendation_action === "Buy" ? "#e8f5e9" : data.recommendation_action === "Delay" ? "#fff8e1" : "#fce4ec";

  return (
    <div className="card-utility animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "24px", height: "620px", overflowY: "auto" }}>
      {/* Risk + Action Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <span className={`risk-badge ${tierClass}`}>{data.suggested_risk_tier} Risk</span>
        <span className="risk-badge" style={{ background: actionBg, color: actionColor }}>{data.recommendation_action}</span>
      </div>

      {/* Verdict summary — dark tile */}
      <div style={{ background: "var(--color-surface-tile-1)", borderRadius: "var(--radius-md)", padding: "20px" }}>
        <p className="type-caption-strong" style={{ color: "var(--color-primary-on-dark)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>The Verdict</p>
        <p style={{ color: "var(--color-on-dark)", fontSize: "16px", lineHeight: 1.55, letterSpacing: "-0.2px", fontStyle: "italic" }}>
          "{data.purchase_summary}"
        </p>
      </div>

      {/* Financial Impact */}
      <div>
        <p className="type-caption-strong" style={{ color: "var(--color-ink-muted-48)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Financial Impact</p>
        <p style={{ fontSize: "15px", lineHeight: 1.55, color: "var(--color-ink)", letterSpacing: "-0.2px" }}>{data.financial_impact_reason}</p>
      </div>

      {/* Hairline */}
      <hr style={{ border: "none", borderTop: "1px solid var(--color-hairline)", margin: "0" }} />

      {/* Behavioral Insight */}
      <div>
        <p className="type-caption-strong" style={{ color: "var(--color-ink-muted-48)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Behavioral Insight</p>
        <p style={{ fontSize: "15px", lineHeight: 1.55, color: "var(--color-ink)", letterSpacing: "-0.2px" }}>{data.behavioral_insight}</p>
      </div>

      {/* Hairline */}
      <hr style={{ border: "none", borderTop: "1px solid var(--color-hairline)", margin: "0" }} />

      {/* Alternative */}
      <div>
        <p className="type-caption-strong" style={{ color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Pragmatic Alternative</p>
        <p style={{ fontSize: "15px", lineHeight: 1.55, color: "var(--color-ink)", letterSpacing: "-0.2px" }}>{data.recommendation_alternative}</p>
      </div>

      <button onClick={onReset} className="btn-ghost" style={{ marginTop: "auto", width: "100%", justifyContent: "center" }}>
        Analyze Another Purchase
      </button>
    </div>
  );
}