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
  
  // Workflow states
  const [productData, setProductData] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isSignedIn && user?.id) {
      fetch(`http://localhost:8000/api/profile/${user.id}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Not found");
        })
        .then(data => {
          setExistingProfile(data);
          // Auto-lock if data exists, or let them see the form pre-filled?
          // Let's keep it unlocked but pre-filled so they can update their savings.
        })
        .catch(() => {
          // No profile yet, totally fine.
        });
    }
  }, [isSignedIn, user?.id]);

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium tracking-widest uppercase">Loading Identity...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans px-4 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Will I Regret Buying This?</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md">The AI that protects your wealth from your own impulses. Identify yourself to face the oracle.</p>
        <SignInButton mode="modal">
          <button className="px-8 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg uppercase tracking-wider">
            Sign In to Face Reality
          </button>
        </SignInButton>
      </div>
    );
  }

  const handleProfileSubmit = async (data: any) => {
    try {
      const payload = { ...data, user_id: user.id };
      const res = await fetch("http://localhost:8000/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to lock profile");
      setIsProfileLocked(true);
      setError("");
    } catch (err) {
      setError("Failed to lock profile. Is the backend breathing?");
    }
  };

  const runAnalysis = async (product: any, history: Message[]) => {
    setIsAnalyzing(true);
    setError("");
    try {
      const payload = { 
        ...product, 
        user_id: user.id,
        chat_history: history 
      };
      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to analyze purchase");
      
      const result = await res.json();
      
      if (result.type === "question") {
        setChatHistory(prev => [...prev, { role: "ai", content: result.message }]);
      } else if (result.type === "verdict") {
        setAnalysisData(result);
        setChatHistory(prev => [...prev, { role: "ai", content: `[VONIS]: ${result.purchase_summary}` }]);
      }
    } catch (err) {
      setError("The AI refused to answer. Check your backend terminal.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProductSubmit = (data: any) => {
    setProductData(data);
    setChatHistory([]);
    setAnalysisData(null);
    runAnalysis(data, []);
  };

  const handleSendMessage = (message: string) => {
    if (!productData) return;
    const newHistory: Message[] = [...chatHistory, { role: "user", content: message }];
    setChatHistory(newHistory);
    runAnalysis(productData, newHistory);
  };

  const resetAnalysis = () => {
    setProductData(null);
    setChatHistory([]);
    setAnalysisData(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Will I Regret Buying This?</h1>
            <p className="mt-2 text-lg text-gray-600">The AI that protects your wealth from your own impulses.</p>
          </div>
          <div className="p-1 bg-white border border-gray-200 rounded-full shadow-sm">
            <UserButton />
          </div>
        </div>
        
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md font-medium text-center max-w-3xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6 items-start w-full">
          {/* Left Column: Form (Profile or Product) */}
          <div className="col-span-1">
            {!isProfileLocked ? (
              <ProfileForm onComplete={handleProfileSubmit} initialData={existingProfile} />
            ) : (
              <ProductForm onSubmitProduct={handleProductSubmit} />
            )}
          </div>

          {/* Middle Column: Chat Interface */}
          <div className="col-span-1">
             <ChatInterface 
                messages={chatHistory} 
                onSendMessage={handleSendMessage}
                isAnalyzing={isAnalyzing}
             />
          </div>

          {/* Right Column: Verdict Dashboard */}
          <div className="col-span-1">
            {analysisData ? (
              <AnalysisResult data={analysisData} onReset={resetAnalysis} />
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center text-gray-400 p-8 border border-dashed border-gray-300 rounded-xl bg-white">
                <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
                <p className="text-center font-medium">The Verdict Awaits</p>
                <p className="text-sm text-center mt-2">The AI has not yet passed judgment on your purchase.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}