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
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAnalyzing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAnalyzing) return;
    onSendMessage(input.trim());
    setInput("");
  };

  if (messages.length === 0 && !isAnalyzing) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center text-gray-400 p-8 border border-dashed border-gray-300 rounded-xl bg-white">
        <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        <p className="text-center font-medium">The interrogation room is empty.</p>
        <p className="text-sm text-center mt-2">Submit a product on the left to begin.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gray-900 px-4 py-3 text-white flex justify-between items-center">
        <h3 className="font-bold tracking-wider uppercase text-sm flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
          AI Interrogation
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-black text-white rounded-br-none' 
                : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-bl-none'
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isAnalyzing && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-bl-none px-4 py-3 flex space-x-2 items-center h-10">
              <span className="text-xs text-gray-500 font-semibold tracking-wide">AI IS THINKING</span>
              <div className="flex space-x-1 ml-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-3 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isAnalyzing}
            placeholder={isAnalyzing ? "AI is judging..." : "Defend your purchase..."}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500 text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isAnalyzing}
            className="px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
