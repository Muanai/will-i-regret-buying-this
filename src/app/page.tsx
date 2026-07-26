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
      <div style={{ minHeight: "100vh", background: "var(--color-surface-black)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", textAlign: "center" }}>
        <p style={{ color: "var(--color-primary-on-dark)", fontSize: "14px", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "20px" }}>Financial Intelligence</p>
        <h1 className="type-display-lg" style={{ color: "var(--color-on-dark)", maxWidth: "600px", marginBottom: "16px" }}>Will I Regret Buying This?</h1>
        <p className="type-lead" style={{ color: "var(--color-body-muted)", maxWidth: "480px", marginBottom: "40px" }}>The AI that protects your wealth from your own impulses.</p>
        <SignInButton mode="modal">
          <button className="btn-primary" style={{ fontSize: "18px", fontWeight: 300, padding: "14px 32px" }}>
            Sign In to Face Reality
          </button>
        </SignInButton>
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
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div className="card-utility" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <label className="label-field">Choose Your Oracle</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div 
                                onClick={() => setPersonality("mentor")}
                                style={{
                                    cursor: "pointer", padding: "16px", borderRadius: "var(--radius-md)",
                                    border: personality === "mentor" ? "2px solid #34c759" : "1px solid var(--color-hairline)",
                                    background: personality === "mentor" ? "rgba(52, 199, 89, 0.05)" : "transparent",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                <h4 className="type-body" style={{ fontWeight: 600, color: personality === "mentor" ? "#34c759" : "var(--color-ink)", marginBottom: "4px" }}>The Mentor</h4>
                                <p className="type-caption" style={{ color: "var(--color-ink-muted-48)" }}>Polite, educational, and guides you toward better habits.</p>
                            </div>
                            <div 
                                onClick={() => setPersonality("roaster")}
                                style={{
                                    cursor: "pointer", padding: "16px", borderRadius: "var(--radius-md)",
                                    border: personality === "roaster" ? "2px solid #ff3b30" : "1px solid var(--color-hairline)",
                                    background: personality === "roaster" ? "rgba(255, 59, 48, 0.05)" : "transparent",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                <h4 className="type-body" style={{ fontWeight: 600, color: personality === "roaster" ? "#ff3b30" : "var(--color-ink)", marginBottom: "4px" }}>The Roaster</h4>
                                <p className="type-caption" style={{ color: "var(--color-ink-muted-48)" }}>Ruthless, sarcastic, and destroys financial delusions.</p>
                            </div>
                        </div>
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
            width: analysisData ? "340px" : "0px",
            flexShrink: 0,
            overflow: "hidden",
            background: "var(--color-canvas)",
            transition: "width 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }}>
            <div style={{ width: "340px", height: "100%", overflowY: "auto", padding: "24px 20px" }}>
              <AnalysisResult data={analysisData} onReset={resetAnalysis} />
            </div>
          </div>

        </div>
      </main>
    </>
  );
}