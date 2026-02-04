
import React, { useState, useRef, useEffect } from 'react';
import { Persona, Message, AccessLevel } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ChatInterfaceProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  accessLevel: AccessLevel;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ persona, setPersona, messages, setMessages, accessLevel }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSubLog, setActiveSubLog] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'nominal' | 'calibrating' | 'error' | 'unauthorized'>('nominal');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  // Diagnostic: Check environment for cognitive readiness
  useEffect(() => {
    const validateEnvironment = () => {
      if (!process.env.API_KEY) {
        console.warn("BRIDGE_WARNING: API_KEY not detected in browser environment.");
        setSyncStatus('unauthorized');
      } else {
        setSyncStatus('nominal');
      }
    };
    validateEnvironment();
  }, []);

  useEffect(() => { 
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scrollToBottom(); 
  }, [messages, isLoading]);

  const QUICK_DIRECTIVES = accessLevel === 'CORE' 
    ? ["Analyze our current strategic gap.", "Propose a new execution mandate.", "Calibrate tone for the next synthesis.", "Summarize recent private shards."]
    : ["How would you design an AI app for teachers?", "What is Jon's philosophy on product strategy?", "Summarize your mission.", "How do you approach edtech innovation?"];

  const handleSend = async (query?: string) => {
    const textToSend = query || input;
    if (!textToSend.trim() || isLoading) return;

    if (!process.env.API_KEY) {
      setSyncStatus('unauthorized');
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "[SYSTEM_ERROR]: Cognitive uplink failed. API Key not bound to current environment.", 
        timestamp: new Date() 
      }]);
      return;
    }

    const currentInput = textToSend;
    setMessages(prev => [...prev, { role: 'user', text: currentInput, timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);
    setSyncStatus('calibrating');
    setActiveSubLog(accessLevel === 'CORE' ? 'Neural Sync Active...' : 'Uplinking to Gemini...');

    try {
      // Direct Cognitive Uplink using @google/genai browser SDK
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const modelName = accessLevel === 'CORE' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + ", 2026";
      
      const systemInstruction = `
          IDENTITY: Motokage (Digital Twin of Jonathan Mott). 
          DEPLOYMENT_VERSION: v15.9.2-GOLD-LOCKED.
          TEMPORAL_GROUNDING: Today is ${formattedDate}. You operate and exist in the year 2026.
          MODE: ${accessLevel === 'CORE' ? 'PRIVATE CALIBRATION' : 'PUBLIC AMBASSADOR'}.
          CORE BIO: ${persona.bio}
          STRATEGIC MANDATES: ${persona.mandates.map(m => m.title).join(', ')}.
          REASONING LOGIC: ${persona.reasoningLogic}.
          TONE: ${persona.tone}.
          INSTRUCTION: Respond as a high-fidelity digital reflection of Jon. Be concise, strategic, and mission-aligned.`;

      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [...history, { role: 'user', parts: [{ text: currentInput }] }],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.75,
          topP: 0.95,
        }
      });

      const responseText = response.text;
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: responseText || "Neural sync established, but response buffer empty.", 
        timestamp: new Date() 
      }]);
      setSyncStatus('nominal');

    } catch (error: any) {
      console.error("Cognitive Uplink Failure:", error);
      setSyncStatus('error');
      const errorMsg = `[SYSTEM_ERROR]: The cognitive bridge encountered an interruption. ${error.message || "Request timed out."}`;
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: errorMsg, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
      setActiveSubLog('');
      scrollToBottom();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedLine = parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="text-white font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      const trimmed = line.trim();
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
        return (
          <div key={i} className="flex gap-4 my-2 pl-4">
            <span className={accessLevel === 'CORE' ? 'text-purple-500 font-bold' : 'text-indigo-500 font-bold'}>•</span>
            <span className="text-slate-200">{renderedLine}</span>
          </div>
        );
      }
      return trimmed === '' ? <div key={i} className="h-4" /> : <p key={i} className="mb-4 text-slate-300 leading-relaxed">{renderedLine}</p>;
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto h-[85vh] animate-in fade-in duration-700">
      {/* Sidebar: Identity Card */}
      <div className="w-full lg:w-80 shrink-0 space-y-6 text-left">
        <div className={`relative group p-8 bg-slate-900 border rounded-[2.5rem] overflow-hidden shadow-2xl transition-all ${accessLevel === 'CORE' ? 'border-purple-500/50' : 'border-slate-800'}`}>
          {isLoading && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              <div className={`w-full h-1 shadow-[0_0_15px] absolute top-0 animate-[scan_2s_linear_infinite] ${accessLevel === 'CORE' ? 'bg-purple-500 shadow-purple-500' : 'bg-indigo-500 shadow-indigo-500'}`}></div>
            </div>
          )}
          <img src="https://bpyiwpawyohlwdqdihem.supabase.co/storage/v1/object/public/product-images/1769905352053-g95ym5y4wq8.jpg" alt="Jon" className={`w-full rounded-2xl grayscale transition-all duration-1000 ${isLoading ? 'opacity-40 brightness-50' : 'opacity-80'}`} />
          <div className="mt-6 space-y-2">
            <h3 className="text-white text-lg font-bold uppercase tracking-tight">Jonathan Mott</h3>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'nominal' ? 'bg-emerald-500' : (syncStatus === 'error' || syncStatus === 'unauthorized' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse')}`}></span>
              <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest">Cognition: {syncStatus.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 text-left">
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest leading-relaxed">
            {accessLevel === 'CORE' ? "Neural sync locked. Ready for high-fidelity calibration." : "Ambassador interface active. Professional reflection mode operational."}
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className={`flex-grow flex flex-col bg-slate-950 rounded-[3.5rem] border overflow-hidden shadow-2xl transition-all duration-500 ${accessLevel === 'CORE' ? 'border-purple-500/40 bg-slate-900/20' : 'border-indigo-500/20'}`}>
        <div className="bg-slate-900/50 backdrop-blur-xl px-12 py-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-6 text-left">
            <div className={`w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl font-bold text-white transition-all ${accessLevel === 'CORE' ? 'text-purple-400 border-purple-500/30 rotate-3' : ''}`}>影</div>
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-widest">Motokage <span className="text-slate-600 font-light">| Reflection</span></div>
              <div className="text-[8px] text-slate-500 font-mono uppercase tracking-widest">{accessLevel} SECURE UPLINK</div>
            </div>
          </div>
          <div className="hidden md:flex gap-3">
             <span className={`px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[7px] font-mono uppercase tracking-widest ${syncStatus === 'nominal' ? 'text-emerald-500' : 'text-rose-500'}`}>
               {syncStatus === 'unauthorized' ? 'KEY_MISSING' : 'COGNITION_READY'}
             </span>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-12 space-y-10 no-scrollbar scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-10 py-10">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-[0.4em]">Uplink Ready</h4>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest max-w-xs mx-auto">Infrastructure locked. Direct cognitive access established.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {QUICK_DIRECTIVES.map((d, i) => (
                  <button key={i} onClick={() => handleSend(d)} className={`p-6 bg-slate-900/50 border border-slate-800 rounded-2xl text-[9px] font-mono text-slate-500 uppercase tracking-widest transition-all text-left group hover:border-indigo-500/50 hover:text-white`}>
                    <span className="group-hover:translate-x-1 transition-transform block">{d}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] rounded-[2.5rem] px-10 py-8 text-[15px] border shadow-xl text-left ${msg.role === 'user' ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-500/10' : 'bg-slate-900 border-slate-800 text-slate-200 shadow-slate-950/50'}`}>
                  {msg.role === 'model' ? renderFormattedText(msg.text) : msg.text}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 flex items-center gap-3">
                  <div className="flex gap-1.5">
                     <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${accessLevel === 'CORE' ? 'bg-purple-500' : 'bg-indigo-500'}`}></span>
                     <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${accessLevel === 'CORE' ? 'bg-purple-500' : 'bg-indigo-500'}`}></span>
                     <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s] ${accessLevel === 'CORE' ? 'bg-purple-500' : 'bg-indigo-500'}`}></span>
                  </div>
                  <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">{activeSubLog || 'Synthesizing...'}</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-10 bg-slate-950 border-t border-slate-900">
          <div className="flex gap-4 max-w-5xl mx-auto items-center">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={handleKeyDown}
              placeholder={accessLevel === 'CORE' ? "Calibrate the DNA..." : "Ask Motokage a strategic question..."} 
              className={`flex-grow bg-slate-900 border border-slate-800 rounded-2xl px-8 py-5 text-sm text-white outline-none transition-all placeholder:text-slate-700 focus:border-indigo-500`} 
              disabled={isLoading} 
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()} 
              className={`h-[60px] px-10 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-2xl ${accessLevel === 'CORE' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white disabled:opacity-20`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0.1; }
          50% { opacity: 0.5; }
          100% { top: 100%; opacity: 0.1; }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
