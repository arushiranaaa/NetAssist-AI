import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Paperclip, Send, Loader2, FileText, CheckCircle } from 'lucide-react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeFile, setActiveFile] = useState(null); // Track the uploaded file name
  const fileInputRef = useRef(null);

  const handleSend = async () => {
    if (!message.trim() || loading) return;
    
    console.log("Sending message:", message);
    const userMsg = { role: 'user', text: message };
    setChat(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/chat', { message });
      console.log("AI Response received:", response.data);
      setChat(prev => [...prev, { role: 'ai', data: response.data }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setChat(prev => [...prev, { role: 'ai', data: { explanation: "I couldn't reach the backend. Check your main.py terminal.", severity: "CRITICAL" } }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log("Starting upload for:", file.name);
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:8000/api/rag/upload', formData);
      console.log("Upload Success:", res.data);
      setActiveFile(file.name); // This makes the file visible in UI
      
      setChat(prev => [...prev, { 
        role: 'ai', 
        data: { explanation: `Successfully indexed ${file.name}. You can now ask questions about it!`, severity: "LOW" } 
      }]);
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Indexing failed. Is Ollama running?");
    } finally {
      setUploading(false);
      event.target.value = null; 
    }
  };

  return (
    <div className="App">
      <header>
        <h1>NetAssist <span>AI</span></h1>
        <p className="subtitle">CSE Final Year Project - RAG Engine</p>
      </header>

      <div className="chat-container">
        <div className="messages-area">
          {chat.length === 0 && (
            <div className="welcome-msg">
              <FileText size={48} style={{opacity: 0.2, marginBottom: '10px'}} />
              <p>Upload a manual to begin analysis.</p>
            </div>
          )}
          {chat.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="msg-header">{msg.role === 'user' ? 'You' : 'NetAssist AI'}</div>
              <div className="msg-content">
                {msg.role === 'ai' ? (
                  <>
                    <p>{msg.data.explanation}</p>
                    <span className={`badge ${msg.data.severity}`}>STATUS: {msg.data.severity}</span>
                  </>
                ) : <p>{msg.text}</p>}
              </div>
            </div>
          ))}
          {loading && <div className="message ai thinking">Analyzing...</div>}
        </div>

        {/* FILE INDICATOR: Shows the user that the file is "attached" */}
        {activeFile && (
          <div className="file-badge">
            <CheckCircle size={14} color="#10b981" />
            <span>Active Context: <strong>{activeFile}</strong></span>
            <button onClick={() => setActiveFile(null)}>×</button>
          </div>
        )}

        <div className="input-area">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{display: 'none'}} accept=".pdf" />
          
          <button className="icon-btn" onClick={() => fileInputRef.current.click()} disabled={uploading}>
            {uploading ? <Loader2 className="spin" size={20} /> : <Paperclip size={20} />}
          </button>

          <input 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={uploading ? "Indexing PDF..." : "Ask a question..."}
            disabled={uploading}
          />
          
          <button className="send-btn" onClick={handleSend} disabled={loading || uploading}>
            {loading ? <Loader2 className="spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
