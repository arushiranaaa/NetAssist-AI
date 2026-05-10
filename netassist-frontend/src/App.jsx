import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Activity, ShieldCheck, Terminal, Server, Cpu } from 'lucide-react';

const BACKEND_URL = 'https://netassist-backend.onrender.com';

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'NetAssist AI Online. Gateway secure. Please upload network documentation to begin troubleshooting.' }
  ]);
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // ✅ CORRECT ENDPOINT: /api/rag/upload
      const response = await fetch(`${BACKEND_URL}/api/rag/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', text: `Successfully indexed: ${file.name}. Ready for queries.` }]);
      } else {
        alert("Upload failed. Verify backend status.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Network Error: Could not reach backend.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsThinking(true);

    try {
      // ✅ CORRECT ENDPOINT: /api/rag/chat
      const response = await fetch(`${BACKEND_URL}/api/rag/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage }),
      });

      const data = await response.json();

      if (response.ok) {
        // We assume the backend returns { "answer": "...", "explanation": "..." }
        const botResponse = data.explanation || data.answer || "No response received.";
        setMessages(prev => [...prev, { role: 'assistant', text: botResponse }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: "Error: AI engine timeout. Please try again." }]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', text: "Connection Lost. Check your Render logs." }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-gray-100 font-mono">
      {/* Sidebar - System Diagnostics */}
      <div className="w-64 bg-[#111114] border-r border-green-900/30 p-6 hidden md:flex flex-col gap-8">
        <div className="flex items-center gap-3 text-green-500">
          <Activity size={24} />
          <h1 className="font-bold tracking-widest text-lg">NETASSIST</h1>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">System Status</p>
          <div className="space-y-2">
            <StatusItem icon={<Server size={14}/>} label="Backend" value="PRODUCTION" color="text-green-400" />
            <StatusItem icon={<Cpu size={14}/>} label="Inference" value="GROQ LPU" color="text-cyan-400" />
            <StatusItem icon={<ShieldCheck size={14}/>} label="Security" value="AES-256" color="text-green-400" />
          </div>
        </div>

        <div className="mt-auto">
          <label className={`flex items-center justify-center gap-2 p-3 border border-dashed border-green-900/50 rounded cursor-pointer transition-all ${isUploading ? 'bg-green-900/20' : 'hover:bg-green-900/10'}`}>
            <Upload size={16} className={isUploading ? 'animate-bounce' : ''} />
            <span className="text-xs">{isUploading ? 'Indexing...' : 'Upload PDF'}</span>
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf" />
          </label>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Terminal Header */}
        <div className="p-4 bg-[#111114]/50 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Terminal size={14} />
            <span>PROMPT_CONSOLE_V1.0</span>
          </div>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
          </div>
        </div>

        {/* Messages Space */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-lg text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-blue-600/10 border border-blue-500/30 text-blue-100' 
                  : 'bg-[#1a1a1e] border border-white/5 text-gray-300'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="text-xs text-green-500 animate-pulse flex items-center gap-2">
              <Activity size={12} />
              Analysing network logs...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Command Input */}
        <form onSubmit={handleSendMessage} className="p-6 bg-[#0a0a0c]">
          <div className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter troubleshooting command or query..."
              className="w-full bg-[#16161a] border border-white/10 rounded-full py-4 px-6 pl-12 focus:outline-none focus:border-green-500/50 transition-all text-sm"
            />
            <Terminal className="absolute left-4 top-4 text-gray-500" size={18} />
            <button 
              type="submit" 
              className="absolute right-3 top-2 p-2 bg-green-600 hover:bg-green-500 rounded-full transition-colors text-black"
              disabled={isThinking}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusItem({ icon, label, value, color }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}
        <span>{label}</span>
      </div>
      <span className={`${color} font-bold`}>{value}</span>
    </div>
  );
}

export default App;