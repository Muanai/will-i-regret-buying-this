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

const CountdownTimer = ({ createdAt }: { createdAt: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const targetDate = new Date(new Date(createdAt).getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60)
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  if (!timeLeft) return <span style={{ fontSize: "12px", color: "var(--color-ink-muted-48)" }}>Calculating...</span>;
  
  const isUnlocked = timeLeft.d === 0 && timeLeft.h === 0 && timeLeft.m === 0 && timeLeft.s === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
      {isUnlocked ? (
        <span style={{ color: "#34c759", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
          UNLOCKED
        </span>
      ) : (
        <>
          <span style={{ color: "#ff9f0a", fontSize: "14px", fontWeight: 700, fontFamily: '"SF Pro Display", monospace', letterSpacing: "1px", display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            {timeLeft.d}d {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
          </span>
          <span style={{ fontSize: "10px", color: "var(--color-ink-muted-48)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Cooling Period Active</span>
        </>
      )}
    </div>
  );
};

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
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWaitingRoomOpen, setIsWaitingRoomOpen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    if (!user?.id) return;
    setIsHistoryLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/history/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data);
      }
    } catch (e) { console.error(e); }
    finally { setIsHistoryLoading(false); }
  };

  const deleteHistoryRecord = async (recordId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/history/${recordId}`, { method: "DELETE" });
      if (res.ok) {
        setHistoryData(prev => prev.filter(item => item.id !== recordId));
      }
    } catch (e) { console.error(e); }
  };

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
      <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at top, #1a1a1c 0%, #000000 100%)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        {/* Background Animation: Tech Grid & Glowing Orb */}
        <div className="tech-grid" />
        <div className="tech-glow-orb" />
        <div className="tech-glow-orb" style={{ top: "40%", left: "60%", background: "radial-gradient(ellipse at center, rgba(41, 151, 255, 0.2) 0%, transparent 50%)", animationDelay: "5s", width: "40vw", height: "40vh" }} />
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
            <>
              <button 
                  onClick={() => {
                      setIsWaitingRoomOpen(true);
                      fetchHistory();
                  }}
                  className="type-nav-link" 
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-body-muted)", display: "flex", alignItems: "center", gap: "6px" }}
              >
                  Waiting Room
                  {historyData.filter(d => d.recommendation_action === 'Delay').length > 0 && (
                    <span style={{ background: "#ff9f0a", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "99px" }}>
                      {historyData.filter(d => d.recommendation_action === 'Delay').length}
                    </span>
                  )}
              </button>
              <button 
                  onClick={() => {
                      setIsHistoryOpen(true);
                      fetchHistory();
                  }}
                  className="type-nav-link" 
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-body-muted)" }}
              >
                  History
              </button>
              <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
                  className="type-nav-link" 
                  style={{ background: "none", border: "none", cursor: "pointer", color: isSettingsOpen ? "var(--color-primary)" : "var(--color-body-muted)" }}
              >
                  Settings
              </button>
            </>
          )}
          {user?.firstName && (
            <span className="type-nav-link" style={{ color: "var(--color-body-muted)" }}>{user.firstName}</span>
          )}
          <UserButton />
        </div>
      </nav>

      {/* MAIN CONTENT — full-height panel layout */}
      <main style={{
        flex: 1,
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
        <div className="layout-container">

          {/* LEFT SIDEBAR — Form (fixed 460px) */}
          <div className="sidebar-left">
            {!isProfileLocked ? (
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
          <div className={`verdict-container ${analysisData ? 'has-analysis' : 'no-analysis'}`} style={{
            width: analysisData ? "420px" : "0px",
            borderLeft: analysisData ? "1px solid var(--color-hairline)" : "none"
          }}>
            <div className="verdict-inner">
              <AnalysisResult data={analysisData} onReset={resetAnalysis} />
            </div>
          </div>

        </div>
      </main>

      {/* ── HISTORY MODAL ── */}
      {isHistoryOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setIsHistoryOpen(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        >
          <div className="animate-fade-up" style={{ width: "90%", maxWidth: "600px", maxHeight: "82vh", background: "var(--color-canvas)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 32px 64px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.08)" }}>
            {/* Modal Header */}
            <div style={{ padding: "24px 28px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--color-hairline)" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "var(--color-primary)" }}>History</p>
                <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 600, letterSpacing: "-0.5px", color: "var(--color-ink)", fontFamily: '"SF Pro Display", system-ui, sans-serif', lineHeight: 1.1 }}>Graveyard of Desires</h2>
                <p style={{ margin: "6px 0 0", fontSize: "14px", color: "var(--color-ink-muted-48)", letterSpacing: "-0.12px" }}>Every purchase you've brought to judgment.</p>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: "var(--color-canvas-parchment)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-ink-muted-48)", flexShrink: 0, fontSize: "18px", lineHeight: 1, marginLeft: "16px", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--color-hairline)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--color-canvas-parchment)")}
              >&times;</button>
            </div>
            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 28px 28px" }}>
              {isHistoryLoading ? (
                <div style={{ padding: "48px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <div className="dot-pulse" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-ink-muted-48)" }} />
                    <div className="dot-pulse-2" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-ink-muted-48)" }} />
                    <div className="dot-pulse-3" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-ink-muted-48)" }} />
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--color-ink-muted-48)", margin: 0, letterSpacing: "-0.12px" }}>Retrieving records…</p>
                </div>
              ) : historyData.length === 0 ? (
                <div style={{ padding: "48px 0", textAlign: "center" }}>
                  <p style={{ fontSize: "14px", color: "var(--color-ink-muted-48)", margin: 0 }}>Your history is clean. No desires on record.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "4px" }}>
                  {historyData.map((item) => {
                    const scoreColor = item.regret_score <= 35 ? "#34c759" : item.regret_score <= 68 ? "#ff9f0a" : "#ff3b30";
                    const actionBg = item.recommendation_action === "Buy" ? "rgba(52,199,89,0.10)" : item.recommendation_action === "Delay" ? "rgba(255,159,10,0.10)" : "rgba(255,59,48,0.10)";
                    const actionColor = item.recommendation_action === "Buy" ? "#1a7a34" : item.recommendation_action === "Delay" ? "#9a6000" : "#c0392b";
                    return (
                      <div key={item.id} style={{ padding: "16px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-hairline)", background: "var(--color-canvas)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", transition: "border-color 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-ink-muted-48)")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-hairline)")}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-ink)", letterSpacing: "-0.2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.product_name}</span>
                            <button onClick={() => deleteHistoryRecord(item.id)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-ink-muted-48)", padding: "2px", display: "flex", alignItems: "center", transition: "color 0.15s", flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.color = "#ff3b30"} onMouseLeave={e => e.currentTarget.style.color = "var(--color-ink-muted-48)"}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                          </div>
                          <span style={{ fontSize: "13px", color: "var(--color-ink-muted-48)", letterSpacing: "-0.12px" }}>Rp {new Intl.NumberFormat("id-ID").format(item.price)} · {item.category.replace("_", " ")}</span>
                          <span style={{ display: "block", fontSize: "11px", color: "var(--color-ink-muted-48)", marginTop: "2px", letterSpacing: "0" }}>{new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                          <span style={{ fontSize: "26px", fontWeight: 700, fontFamily: '"SF Pro Display", sans-serif', color: scoreColor, letterSpacing: "-1px", lineHeight: 1 }}>{item.regret_score}</span>
                          <span style={{ padding: "3px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase", background: actionBg, color: actionColor }}>{item.recommendation_action}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── WAITING ROOM MODAL ── */}
      {isWaitingRoomOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setIsWaitingRoomOpen(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        >
          <div className="animate-fade-up" style={{ width: "90%", maxWidth: "600px", maxHeight: "82vh", background: "var(--color-canvas)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 32px 64px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.08)" }}>
            {/* Modal Header */}
            <div style={{ padding: "24px 28px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--color-hairline)" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "#ff9f0a" }}>7-Day Cooling Period</p>
                <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 600, letterSpacing: "-0.5px", color: "var(--color-ink)", fontFamily: '"SF Pro Display", system-ui, sans-serif', lineHeight: 1.1 }}>The Waiting Room</h2>
                <p style={{ margin: "6px 0 0", fontSize: "14px", color: "var(--color-ink-muted-48)", letterSpacing: "-0.12px" }}>Locked until impulse becomes intention.</p>
              </div>
              <button
                onClick={() => setIsWaitingRoomOpen(false)}
                style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: "var(--color-canvas-parchment)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-ink-muted-48)", flexShrink: 0, fontSize: "18px", lineHeight: 1, marginLeft: "16px", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--color-hairline)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--color-canvas-parchment)")}
              >&times;</button>
            </div>
            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 28px 28px" }}>
              {isHistoryLoading ? (
                <div style={{ padding: "48px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <div className="dot-pulse" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ff9f0a", opacity: 0.6 }} />
                    <div className="dot-pulse-2" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ff9f0a", opacity: 0.6 }} />
                    <div className="dot-pulse-3" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ff9f0a", opacity: 0.6 }} />
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--color-ink-muted-48)", margin: 0, letterSpacing: "-0.12px" }}>Checking the waiting room…</p>
                </div>
              ) : historyData.filter(d => d.recommendation_action === 'Delay').length === 0 ? (
                <div style={{ padding: "48px 0", textAlign: "center" }}>
                  <p style={{ fontSize: "14px", color: "var(--color-ink-muted-48)", margin: 0 }}>Waiting room is empty. No active cooling periods.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "4px" }}>
                  {historyData.filter(d => d.recommendation_action === 'Delay').map((item) => (
                    <div key={item.id}
                      style={{ padding: "18px 20px", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,159,10,0.25)", background: "rgba(255,159,10,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", transition: "border-color 0.15s, background 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,159,10,0.5)"; e.currentTarget.style.background = "rgba(255,159,10,0.06)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,159,10,0.25)"; e.currentTarget.style.background = "rgba(255,159,10,0.03)"; }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-ink)", letterSpacing: "-0.2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.product_name}</span>
                          <button onClick={() => deleteHistoryRecord(item.id)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-ink-muted-48)", padding: "2px", display: "flex", alignItems: "center", transition: "color 0.15s", flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.color = "#ff3b30"} onMouseLeave={e => e.currentTarget.style.color = "var(--color-ink-muted-48)"}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                        <span style={{ fontSize: "13px", color: "var(--color-ink-muted-48)", letterSpacing: "-0.12px" }}>Rp {new Intl.NumberFormat("id-ID").format(item.price)} · {item.category.replace("_", " ")}</span>
                        <span style={{ display: "block", fontSize: "11px", color: "var(--color-ink-muted-48)", marginTop: "2px" }}>Locked: {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        <CountdownTimer createdAt={item.created_at} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS MODAL ── */}
      {isSettingsOpen && isProfileLocked && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setIsSettingsOpen(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        >
          <div className="animate-fade-up" style={{ width: "90%", maxWidth: "500px", maxHeight: "85vh", background: "var(--color-canvas)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 32px 64px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.08)" }}>
            {/* Modal Header */}
            <div style={{ padding: "24px 28px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--color-hairline)" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "var(--color-primary)" }}>Preferences</p>
                <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 600, letterSpacing: "-0.5px", color: "var(--color-ink)", fontFamily: '"SF Pro Display", system-ui, sans-serif', lineHeight: 1.1 }}>Settings</h2>
                <p style={{ margin: "6px 0 0", fontSize: "14px", color: "var(--color-ink-muted-48)", letterSpacing: "-0.12px" }}>Adjust the AI and update your financial profile.</p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: "var(--color-canvas-parchment)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-ink-muted-48)", flexShrink: 0, fontSize: "18px", lineHeight: 1, marginLeft: "16px", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--color-hairline)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--color-canvas-parchment)")}
              >&times;</button>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
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
                </div>
                <ProfileForm onComplete={async (data) => { await handleProfileSubmit(data); setIsSettingsOpen(false); }} initialData={existingProfile} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}