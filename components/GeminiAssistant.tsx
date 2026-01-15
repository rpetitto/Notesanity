import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, DriveFile } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { Sparkles, Send, X, Loader2, Bot } from 'lucide-react';

interface GeminiAssistantProps {
  currentFile: DriveFile | null;
  fileContent: string;
  isOpen: boolean;
  onClose: () => void;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ currentFile, fileContent, isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hey there! I\'m your Binder Assistant. I can help you quiz yourself on this content or explain difficult concepts. How can I help?', timestamp: new Date() }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await sendMessageToGemini(messages, fileContent, userMsg.text);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, modelMsg]);
    setLoading(false);
  };

  return (
    <div className={`
      fixed top-2 right-2 bottom-2 w-[400px] max-w-full bg-white shadow-2xl rounded-[32px] border border-slate-200 
      flex flex-col z-[100] m3-transition origin-right
      ${isOpen ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-full scale-95 opacity-0 pointer-events-none'}
    `}>
      <header className="p-6 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Sparkles className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-slate-800">Binder AI</h3>
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online</span>
            </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full m3-transition text-slate-400">
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                    <Bot className="w-4 h-4 text-slate-500" />
                </div>
              )}
              <div className={`p-4 rounded-[20px] text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start gap-3">
             <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4 text-slate-400" />
             </div>
             <div className="bg-slate-100 px-4 py-3 rounded-[20px] rounded-tl-none border border-slate-200">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
             </div>
          </div>
        )}
      </div>

      <footer className="p-6 pt-2 border-t border-slate-100">
        {currentFile && (
            <div className="mb-4 px-3 py-2 bg-slate-50 rounded-xl text-[10px] text-slate-500 border border-slate-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Context: <span className="font-bold truncate">{currentFile.name}</span>
            </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything..."
            className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 m3-transition"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default GeminiAssistant;