"use client";

import { useState, useEffect } from "react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import ProfileForm from "@/components/ProfileForm";
import ProductForm from "@/components/ProductForm";
import AnalysisResult from "@/components/AnalysisResult";
import ChatInterface from "@/components/ChatInterface";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isProfileLocked, setIsProfileLocked] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [personality, setPersonality] = useState("mentor");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileFetching, setIsProfileFetching] = useState(true);

  useEffect(() => {
    if (isSignedIn && user?.id) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      fetch(`${API_URL}/api/profile/${user.id}`)
        .then(res => { if (res.ok) return res.json(); throw new Error("Not found"); })
        .then(data => { setExistingProfile(data); setIsProfileLocked(true); })
        .catch(() => {})
        .finally(() => setIsProfileFetching(false));
    } else if (isLoaded) {
      setIsProfileFetching(false);
    }
  }, [isLoaded, isSignedIn, user?.id]);

  if (!isLoaded || isProfileFetching) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-canvas-parchment)" }}>
        <p style={{ color: "var(--color-ink-muted-48)", fontSize: "14px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Loading…</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-surface-black)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        {/* Ambient background glow — breathing */}
        <div className="landing-glow" style={{ position: "absolute", top: "-20%", left: "50%", width: "800px", height: "800px", background: "radial-gradient(ellipse at center, rgba(0, 102, 204, 0.15) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
        {/* Nav */}
        <nav className="landing-nav" style={{ position: "relative", zIndex: 1, padding: "0 40px", height: "44px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ color: "var(--color-body-muted)", fontSize: "13px", letterSpacing: "-0.12px" }}>Will I Regret Buying This?</span>
          <SignInButton mode="modal">
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-primary-on-dark)", fontSize: "13px", letterSpacing: "-0.12px" }}>Sign In</button>
          </SignInButton>
        </nav>
        {/* Hero */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <p className="landing-eyebrow" style={{ color: "var(--color-primary-on-dark)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "24px", opacity: 0.9 }}>AI Financial Conscience</p>
          <h1 className="landing-headline" style={{ fontFamily: '"SF Pro Display", system-ui, -apple-system, "Inter", sans-serif', fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 600, lineHeight: 1.06, letterSpacing: "-0.01em", color: "var(--color-on-dark)", maxWidth: "800px", marginBottom: "24px" }}>
            Will I Regret<br />Buying This?
          </h1>
          <p className="landing-subline" style={{ fontFamily: '"SF Pro Display", system-ui, -apple-system, "Inter", sans-serif', fontSize: "clamp(19px, 2.5vw, 24px)", fontWeight: 300, lineHeight: 1.5, color: "var(--color-body-muted)", maxWidth: "520px", marginBottom: "48px" }}>
            The AI that interrogates your financial impulses — so your wallet doesn't have to suffer the consequences.
          </p>
          <div className="landing-cta" style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", marginBottom: "72px" }}>
            <SignInButton mode="modal">
              <button className="btn-primary" style={{ fontSize: "18px", fontWeight: 300, padding: "14px 36px" }}>
                Face the Verdict
              </button>
            </SignInButton>
          </div>
          {/* Value Props */}
          <div className="landing-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", maxWidth: "720px", width: "100%", background: "rgba(255,255,255,0.06)", borderRadius: "18px", overflow: "hidden" }}>
            {[{ icon: "◆", title: "Real-Time Scraping", desc: "Paste any product URL. We read the page so you don't have to." }, { icon: "◈", title: "Your Financial DNA", desc: "Analysis anchored to your actual income, cash, and investments." }, { icon: "◉", title: "Two Oracles", desc: "Switch between The Mentor and The Roaster — your call." }].map((item, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "20px", color: "var(--color-primary-on-dark)", opacity: 0.7 }}>{item.icon}</span>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-on-dark)", letterSpacing: "-0.12px", margin: 0 }}>{item.title}</p>
                <p style={{ fontSize: "13px", color: "var(--color-body-muted)", lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Footer */}
        <div style={{ position: "relative", zIndex: 1, padding: "20px 40px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "center" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", margin: 0 }}>Your financial data is used only for analysis. Never sold. Never stored beyond your session.</p>
        </div>
      </div>
    );
  }

  const handleProfileSubmit = async (data: any) => {
    try {
      const payload = { ...data, user_id: user.id };
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/profile`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed");
      setIsProfileLocked(true);
      setError("");
    } catch { setError("Failed to lock profile. Is the backend breathing?"); }
  };

  const runAnalysis = async (product: any, history: Message[]) => {
    setIsAnalyzing(true);
    setError("");
    try {
      const payload = { ...product, user_id: user.id, chat_history: history, personality };
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed");
      const result = await res.json();
      if (result.type === "question") {
        setChatHistory(prev => [...prev, { role: "ai", content: result.message }]);
      } else if (result.type === "verdict") {
        setAnalysisData(result);
        setChatHistory(prev => [...prev, { role: "ai", content: `Verdict delivered: ${result.purchase_summary}` }]);
      }
    } catch { setError("The AI refused to answer. Check your backend terminal."); }
    finally { setIsAnalyzing(false); }
  };

  const handleProductSubmit = (data: any) => { setProductData(data); setChatHistory([]); setAnalysisData(null); runAnalysis(data, []); };
  const handleSendMessage = (message: string) => {
    if (!productData) return;
    const newHistory: Message[] = [...chatHistory, { role: "user", content: message }];
    setChatHistory(newHistory);
    runAnalysis(productData, newHistory);
  };
  const resetAnalysis = () => { setProductData(null); setChatHistory([]); setAnalysisData(null); };

  return (
    <>
      {/* GLOBAL NAV */}
      <nav className="nav-global">
        <span className="type-nav-link" style={{ color: "var(--color-body-muted)" }}>Will I Regret Buying This?</span>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isProfileLocked && (
            <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
                className="type-nav-link" 
                style={{ background: "none", border: "none", cursor: "pointer", color: isSettingsOpen ? "var(--color-primary)" : "var(--color-body-muted)" }}
            >
                Settings
            </button>
          )}
          {user?.firstName && (
            <span className="type-nav-link" style={{ color: "var(--color-body-muted)" }}>{user.firstName}</span>
          )}
          <UserButton />
        </div>
      </nav>

      {/* MAIN CONTENT — full-height panel layout */}
      <main style={{
        height: "calc(100vh - 44px - 36px)",
        background: "var(--color-canvas-parchment)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>

        {/* TICKER STRIP */}
        <div style={{ background: "var(--color-surface-tile-1)", overflow: "hidden", height: "36px", display: "flex", alignItems: "center", borderBottom: "1px solid #3a3a3c", flexShrink: 0 }}>
          <div className="ticker-track">
            {/* Copy 1 — visible */}
            <span className="ticker-segment">
              <span style={{ color: "var(--color-primary-on-dark)" }}>◆</span> &nbsp;&nbsp;Will I Regret Buying This? &nbsp;&nbsp;&nbsp;
              <span style={{ color: "var(--color-ink-muted-48)" }}>—</span> &nbsp;&nbsp;&nbsp;Your financial conscience, engineered with precision &nbsp;&nbsp;&nbsp;
              <span style={{ color: "var(--color-primary-on-dark)" }}>◆</span> &nbsp;&nbsp;Stop impulse-buying. Start being ruthless with your money &nbsp;&nbsp;&nbsp;
              <span style={{ color: "var(--color-ink-muted-48)" }}>—</span> &nbsp;&nbsp;&nbsp;AI Purchase Copilot &nbsp;&nbsp;&nbsp;
              <span style={{ color: "var(--color-primary-on-dark)" }}>◆</span> &nbsp;&nbsp;Because "treat yourself" has a price &nbsp;&nbsp;&nbsp;
              <span style={{ color: "var(--color-ink-muted-48)" }}>—</span> &nbsp;&nbsp;&nbsp;Think twice. The AI never lies &nbsp;&nbsp;&nbsp;
              <span style={{ color: "var(--color-primary-on-dark)" }}>◆</span> &nbsp;&nbsp;Your wallet called. It wants a word &nbsp;&nbsp;&nbsp;
              <span style={{ color: "var(--color-ink-muted-48)" }}>—</span> &nbsp;&nbsp;&nbsp;
            </span>
            {/* Copy 2 — exact duplicate for seamless loop */}
            <span className="ticker-segment" aria-hidden="true">
              <span style={{ color: "var(--color-primary-on-dark)" }}>◆</span> &nbsp;&nbsp;Will I Regret Buying This? &nbsp;&nbsp;&nbsp;
              <span style={{ color: "var(--color-ink-muted-48)" }}>—</span> &nbsp;&nbsp;&nbsp;Your financial conscience, engineered with precision &nbsp;&nbsp;&nbsp;
              <span style={{ color: "var(--color-primary-on-dark)" }}>◆</span> &nbsp;&nbsp;Stop impulse-buying. Start being ruthless with your money &nbsp;&nbsp;&nbsp;
              <span style={{ color: "var(--color-ink-muted-48)" }}>—</span> &nbsp;&nbsp;&nbsp;AI Purchase Copilot &nbsp;&nbsp;&nbsp;
              <span style={{ color: "var(--color-primary-on-dark)" }}>◆</span> &nbsp;&nbsp;Because "treat yourself" has a price &nbsp;&nbsp;&nbsp;
              <span style={{ color: "var(--color-ink-muted-48)" }}>—</span> &nbsp;&nbsp;&nbsp;Think twice. The AI never lies &nbsp;&nbsp;&nbsp;
              <span style={{ color: "var(--color-primary-on-dark)" }}>◆</span> &nbsp;&nbsp;Your wallet called. It wants a word &nbsp;&nbsp;&nbsp;
              <span style={{ color: "var(--color-ink-muted-48)" }}>—</span> &nbsp;&nbsp;&nbsp;
            </span>
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div style={{ flexShrink: 0, margin: "12px 24px 0", padding: "12px 18px", background: "#fce4ec", border: "1px solid #e57373", borderRadius: "var(--radius-md)", color: "#880e4f", fontSize: "14px", fontWeight: 500 }}>
            {error}
          </div>
        )}

        {/* 3-PANEL WORKSPACE */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", gap: "1px", background: "var(--color-hairline)" }}>

          {/* LEFT SIDEBAR — Form (fixed 460px) */}
          <div style={{ width: "460px", flexShrink: 0, background: "var(--color-canvas)", overflowY: "auto", padding: "28px 32px" }}>
            {isSettingsOpen ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                  {/* Settings Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "20px", borderBottom: "1px solid var(--color-hairline)" }}>
                      <h2 className="type-display-md" style={{ margin: 0 }}>Settings</h2>
                      <button onClick={() => setIsSettingsOpen(false)} style={{ background: "rgba(0,0,0,0.06)", border: "none", cursor: "pointer", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: "var(--color-ink-muted-48)", flexShrink: 0, transition: "background 0.15s ease" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.10)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.06)")}>
                          &times;
                      </button>
                  </div>
                  {/* Oracle Selector */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <label className="label-field">AI Personality</label>
                          <span className="type-caption" style={{ color: personality === "mentor" ? "#34c759" : "#ff3b30", fontWeight: 600 }}>{personality === "mentor" ? "The Mentor" : "The Roaster"}</span>
                      </div>
                      <div style={{ display: "flex", background: "var(--color-canvas-parchment)", padding: "3px", borderRadius: "10px", gap: "3px" }}>
                          <button
                              type="button"
                              onClick={() => setPersonality("mentor")}
                              style={{ flex: 1, padding: "9px 12px", border: "none", borderRadius: "8px", cursor: "pointer",
                                       background: personality === "mentor" ? "var(--color-canvas)" : "transparent",
                                       color: personality === "mentor" ? "var(--color-ink)" : "var(--color-ink-muted-48)",
                                       boxShadow: personality === "mentor" ? "0 1px 3px rgba(0,0,0,0.1), 0 0 0 0.5px rgba(0,0,0,0.06)" : "none",
                                       fontWeight: personality === "mentor" ? 600 : 400,
                                       fontSize: "14px",
                                       letterSpacing: "-0.12px",
                                       transition: "all 0.2s ease" }}
                          >The Mentor</button>
                          <button
                              type="button"
                              onClick={() => setPersonality("roaster")}
                              style={{ flex: 1, padding: "9px 12px", border: "none", borderRadius: "8px", cursor: "pointer",
                                       background: personality === "roaster" ? "var(--color-canvas)" : "transparent",
                                       color: personality === "roaster" ? "var(--color-ink)" : "var(--color-ink-muted-48)",
                                       boxShadow: personality === "roaster" ? "0 1px 3px rgba(0,0,0,0.1), 0 0 0 0.5px rgba(0,0,0,0.06)" : "none",
                                       fontWeight: personality === "roaster" ? 600 : 400,
                                       fontSize: "14px",
                                       letterSpacing: "-0.12px",
                                       transition: "all 0.2s ease" }}
                          >The Roaster</button>
                      </div>
                      <p className="type-caption" style={{ color: "var(--color-ink-muted-48)", margin: 0 }}>
                          {personality === "mentor" ? "Polite, educational, and guides you toward better financial habits." : "Ruthless, sarcastic, and absolutely destroys financial delusions."}
                      </p>
                  </div>
                  {/* Divider */}
                  <div style={{ height: "1px", background: "var(--color-hairline)" }} />
                  {/* Profile Form */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label className="label-field">Financial Profile</label>
                      <p className="type-caption" style={{ color: "var(--color-ink-muted-48)", margin: "0 0 4px" }}>Update your profile to improve analysis accuracy.</p>
                  </div>
                  <ProfileForm onComplete={async (data) => { await handleProfileSubmit(data); setIsSettingsOpen(false); }} initialData={existingProfile} />
              </div>
            ) : !isProfileLocked ? (
              <ProfileForm onComplete={handleProfileSubmit} initialData={existingProfile} />
            ) : (
              <ProductForm onSubmitProduct={handleProductSubmit} />
            )}
          </div>

          {/* CENTER — Chat (dominant, takes all remaining space) */}
          <div style={{ flex: 1, background: "var(--color-canvas-parchment)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ChatInterface messages={chatHistory} onSendMessage={handleSendMessage} isAnalyzing={isAnalyzing} />
          </div>

          {/* RIGHT SIDEBAR — Verdict (slides in only when result exists) */}
          <div style={{
            width: analysisData ? "420px" : "0px",
            flexShrink: 0,
            overflow: "hidden",
            background: "var(--color-canvas)",
            transition: "width 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
            borderLeft: analysisData ? "1px solid var(--color-hairline)" : "none"
          }}>
            <div style={{ width: "420px", height: "100%", overflowY: "auto", padding: "24px 20px" }}>
              <AnalysisResult data={analysisData} onReset={resetAnalysis} />
            </div>
          </div>

        </div>
      </main>
    </>
  );
}