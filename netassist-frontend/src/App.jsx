import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, MessageSquare, Shield, Activity, 
  Terminal, Loader2, Send, Cpu, Database, 
  AlertTriangle, CheckCircle2, ChevronRight 
} from 'lucide-react';

const App = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      explanation: 'NetAssist AI System Initialized. Gateway secure. Please upload network documentation to begin troubleshooting.', 
      severity: 'LOW',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://netassist-backend.onrender.com', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessages(prev => [...prev, {
          role: 'ai',
          explanation: `DOCUMENT INDEXED: "${file.name}" is now part of the active knowledge base.`,
          severity: 'LOW',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        alert("Upload failed. Verify backend status.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', explanation: input, time: userTime }]);
    
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch('https://netassist-backend.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentInput }),
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'ai',
        explanation: data.explanation,
        severity: data.severity,
        probable_causes: data.probable_causes,
        troubleshooting_steps: data.troubleshooting_steps,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        explanation: "CRITICAL: Connection to Groq Cloud timed out.", 
        severity: 'HIGH',
        time: userTime 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans selection:bg-teal-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-[#0f172a] border-r border-slate-800/60 flex flex-col p-6 shadow-2xl relative">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-lg shadow-teal-500/20">
            <Activity size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">NetAssist <span className="text-teal-400">AI</span></h1>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">FiberMind</span>
          </div>
        </div>

        <div className="flex-1 space-y-8">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Knowledge Ingestion</label>
            <label className="relative block group cursor-pointer">
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf" disabled={isUploading} />
              <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                isUploading ? 'border-teal-500 bg-teal-500/5' : 'border-slate-800 hover:border-teal-500 bg-slate-900/50'
              }`}>
                {isUploading ? <Loader2 className="mx-auto mb-3 text-teal-500 animate-spin" size={32} /> : <Upload className="mx-auto mb-3 text-slate-500 group-hover:text-teal-400" size={32} />}
                <p className="text-sm font-semibold text-slate-400">{isUploading ? "Indexing..." : "Import PDF"}</p>
              </div>
            </label>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Environment</label>
            <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
              <div className="flex justify-between text-xs"><span className="text-slate-500">Model</span><span className="text-teal-400 font-mono">Llama-3.3-70B</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Latency</span><span className="text-slate-300 font-mono">24ms</span></div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-[10px] font-bold text-slate-400">RAG PROTOCOL ACTIVE</span>
        </div>
      </aside>

      {/* MAIN CHAT */}
      <main className="flex-1 flex flex-col bg-[#020617] relative">
        <header className="h-16 border-b border-slate-800/40 flex items-center justify-between px-8 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Terminal size={18} className="text-teal-500" />
            <span className="text-xs font-bold tracking-widest text-slate-400">SESSION: <span className="text-white">NET_ROOT_DEBUG</span></span>
          </div>
          <Shield size={18} className="text-slate-600 hover:text-teal-400 cursor-pointer transition-colors" />
        </header>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-8 space-y-8">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-teal-600 rounded-2xl rounded-tr-none p-4 shadow-lg shadow-teal-900/20' : ''}`}>
                
                {/* AI Header Info */}
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold text-slate-500 font-mono">{msg.time}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                      msg.severity === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      msg.severity === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {msg.severity} PRIORITY
                    </span>
                  </div>
                )}

                {/* Message Content */}
                <div className={msg.role === 'ai' ? 'bg-[#0f172a] border border-slate-800 rounded-2xl rounded-tl-none p-5 shadow-2xl' : ''}>
                  <p className="text-sm leading-relaxed">{msg.explanation}</p>

                  {/* Structured Data: Probable Causes */}
                  {msg.probable_causes?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertTriangle size={12} className="text-amber-500" /> Potential Root Causes
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.probable_causes.map((cause, idx) => (
                          <span key={idx} className="text-[11px] bg-slate-800/50 border border-slate-700 px-2 py-1 rounded text-slate-300">
                            {cause}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Structured Data: Steps */}
                  {msg.troubleshooting_steps?.length > 0 && (
                    <div className="mt-5 space-y-3">
                      <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={12} /> Execution Roadmap
                      </p>
                      <div className="space-y-2">
                        {msg.troubleshooting_steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800/50 group hover:border-teal-500/30 transition-colors">
                            <span className="text-[10px] font-mono text-teal-500 mt-1">0{idx + 1}</span>
                            <p className="text-xs text-slate-300 leading-snug">{step}</p>
                            <ChevronRight size={14} className="ml-auto text-slate-700 group-hover:text-teal-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && <p className="text-[10px] text-teal-100/60 mt-1 text-right font-mono">{msg.time}</p>}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2 p-4 bg-slate-900/50 w-20 rounded-xl rounded-tl-none border border-slate-800">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            </div>
          )}
        </div>

        {/* INPUT FORM */}
        <div className="p-8">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              placeholder="Query hardware documentation..."
              className="w-full bg-[#0f172a] border border-slate-800 focus:border-teal-500/50 rounded-2xl py-5 px-7 pr-16 outline-none transition-all shadow-2xl placeholder:text-slate-600 text-sm"
            />
            <button type="submit" disabled={isTyping || !input.trim()} className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-teal-500 text-slate-900 rounded-xl hover:bg-teal-400 transition-all shadow-lg disabled:opacity-20">
              <Send size={18} strokeWidth={3} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default App;