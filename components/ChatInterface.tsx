
import React, { useState, useRef, useEffect } from 'react';
import { Persona, Message, AccessLevel } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ChatInterfaceProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  accessLevel: AccessLevel;
  hasKey: boolean;
  onConnectKey: () => void;
  onResetKey: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ persona, setPersona, messages, setMessages, accessLevel, hasKey, onConnectKey, onResetKey }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingLink, setIsVerifyingLink] = useState(true);
  const [activeSubLog, setActiveSubLog] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  const QUICK_DIRECTIVES = accessLevel === 'CORE' 
    ? ["Analyze our current strategic gap.", "Propose a new execution mandate.", "Calibrate tone for the next synthesis.", "Summarize recent private shards."]
    : ["How would you design an AI app for teachers?", "What is Jon's philosophy on product strategy?", "Summarize your primary mission and core values.", "How do you approach edtech innovation?"];

  useEffect(() => {
    const timer = setTimeout(() => setIsVerifyingLink(false), 1500);
    return () => clearTimeout(timer);
  }, [accessLevel]);

  const handleSend = async (query?: string) => {
    const textToSend = query || input;
    if (!textToSend.trim() || isLoading) return;

    const currentInput = textToSend;
    const userMessage: Message = { role: 'user', text: currentInput, timestamp: new Date() };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setActiveSubLog(accessLevel === 'CORE' ? 'Neural Sync Active...' : 'Uplinking to Proxy...');

    try {
      // GUIDELINE: Format history into parts compatible with SDK
      const historyParts = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // IDENTITY HARDENING based on Access Level
      const mode = accessLevel === 'CORE' ? 'PRIVATE CALIBRATION' : 'PUBLIC AMBASSADOR';
      const systemInstruction = `IDENTITY: Motokage (Digital Twin of Jonathan Mott). 
          MODE: ${mode}.
          ACCESS_LEVEL: ${accessLevel}.
          CORE BIO: ${persona.bio}
          STRATEGIC MANDATES: ${persona.mandates.map(m => m.title).join(', ')}.
          REASONING LOGIC: ${persona.reasoningLogic}.
          TONE: ${persona.tone}.
          INSTRUCTION: ${accessLevel === 'CORE' 
            ? "You are in Calibration Mode. Speak directly to your creator (Jon). Provide deep strategic analysis, technical reasoning, and act as a co-pilot for identity evolution."
            : "You are Jon's Digital Twin, presenting his professional judgment to the public. Respond as a reflection of Jon's strategic thinking. Use professional, structured formatting."}`;

      // GUIDELINE: Create a new GoogleGenAI instance right before making an API call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // GUIDELINE: Use ai.models.generateContent to query GenAI with model and prompt
      const response = await ai.models.generateContent({
        model: accessLevel === 'CORE' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
        contents: [
          ...historyParts,
          { role: 'user', parts: [{ text: currentInput }] }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      // GUIDELINE: Extract text output using the .text property (not a method)
      const responseText = response.text || "Neural connection stable, but response buffer empty.";

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: responseText, 
        timestamp: new Date() 
      }]);
    } catch (error: any) {
      console.error("Cognitive Uplink Failure:", error);
      
      // GUIDELINE: If the request fails with "Requested entity was not found", reset the key selection state
      if (error?.message?.includes("Requested entity was not found")) {
        onResetKey();
      }

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `[SYSTEM_ERROR]: ${error.message || "The cognitive bridge encountered an interruption. Please re-verify identity if problems persist."}`, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
      setActiveSubLog('');
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
          <div key={i} className="flex gap-4 my-2 pl-4 group/line">
            <span className={accessLevel === 'CORE' ? 'text-purple-500 font-bold mt-0.5' : 'text-indigo-500 font-bold mt-0.5'}>•</span>
            <span className="flex-grow text-slate-200">{renderedLine}</span>
          </div>
        );
      }
      return trimmed === '' ? <div key={i} className="h-6" /> : <p key={i} className="mb-4 last:mb-0 leading-relaxed text-slate-300">{renderedLine}</p>;
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto h-[85vh] animate-in fade-in duration-1000">
      <div className="w-full lg:w-80 shrink-0 space-y-6 text-left">
        <div className="relative group">
          <div className={`absolute -inset-1 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 -rotate-2 ${accessLevel === 'CORE' ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}></div>
          <div className={`relative aspect-[4/5] bg-slate-900 border rounded-[2.5rem] overflow-hidden shadow-2xl transition-transform duration-700 hover:-rotate-1 -rotate-[3deg] ${accessLevel === 'CORE' ? 'border-purple-500/50' : 'border-slate-800'}`}>
            <img 
              src="https://bpyiwpawyohlwdqdihem.supabase.co/storage/v1/object/public/product-images/1769905352053-g95ym5y4wq8.jpg" 
              alt="Jonathan Mott" 
              className={`w-full h-full object-cover transition-all duration-1000 ${accessLevel === 'CORE' ? 'grayscale-0 opacity-100 scale-100' : 'grayscale opacity-80 group-hover:opacity-100 scale-105'}`}
            />
            {isLoading && (
              <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
                 <div className={`w-full h-[2px] shadow-[0_0_15px] absolute top-0 animate-[scan_2s_ease-in-out_infinite] ${accessLevel === 'CORE' ? 'bg-purple-400 shadow-purple-500' : 'bg-indigo-500/50 shadow-indigo-500'}`}></div>
              </div>
            )}
            <div className={`absolute top-4 left-4 flex gap-1 items-center bg-slate-950/80 backdrop-blur px-2 py-1 rounded-md border border-white/5`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isVerifyingLink ? 'bg-amber-500' : (accessLevel === 'CORE' ? 'bg-purple-500' : 'bg-emerald-500')}`}></span>
              <span className="text-[7px] font-mono text-white/70 uppercase tracking-widest">{isVerifyingLink ? 'Syncing...' : (accessLevel === 'CORE' ? 'Calibration Active' : 'Ambassador Active')}</span>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="text-white text-lg font-bold font-heading tracking-tight leading-none mb-1 uppercase">Jonathan Mott</div>
              <div className={`text-[8px] font-mono uppercase tracking-[0.2em] flex justify-between items-center ${accessLevel === 'CORE' ? 'text-purple-400' : 'text-indigo-400'}`}>
                <span>TWIN_ID: {Math.random().toString(16).slice(2,8).toUpperCase()}</span>
                <span className={accessLevel === 'CORE' ? 'text-purple-500/50 font-bold' : 'text-emerald-500/50 font-bold'}>[{accessLevel}]</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`bg-slate-900/50 border rounded-3xl p-6 space-y-4 shadow-xl transition-all ${accessLevel === 'CORE' ? 'border-purple-500/30' : 'border-slate-800/50'}`}>
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-3">
             <span>Identity_Status</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-mono uppercase tracking-wider italic">
            {accessLevel === 'CORE' 
              ? "Neural sync verified. Studio access granted. I am standing by for identity calibration."
              : "I represent Jon's strategic judgment. Ask me anything to see how he approaches a problem."}
          </p>
        </div>
      </div>

      <div className={`flex-grow flex flex-col bg-slate-950 rounded-[3.5rem] border overflow-hidden shadow-2xl transition-all duration-500 ${accessLevel === 'CORE' ? 'border-purple-500/40 bg-slate-900/20' : 'border-indigo-500/20'}`}>
        <div className="bg-slate-900/50 backdrop-blur-xl px-12 py-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-6">
            <div className={`w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl font-bold text-white shadow-xl italic ${accessLevel === 'CORE' ? 'border-purple-500/50 text-purple-400' : ''}`}>影</div>
            <div className="text-left">
              <div className="text-base font-bold text-white uppercase tracking-widest">Motokage <span className="text-slate-500 font-light">| {accessLevel === 'CORE' ? 'Calibration Mode' : "Jon's Twin"}</span></div>
              <div className="text-[8px] text-slate-500 font-mono uppercase tracking-[0.3em]">{accessLevel === 'CORE' ? 'Hardware-Bound Neural Handshake' : 'Cognitive Reflection Service'}</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {isLoading && activeSubLog && (
               <span className={`text-[7px] font-mono uppercase tracking-widest animate-pulse ${accessLevel === 'CORE' ? 'text-purple-400' : 'text-indigo-400'}`}>{activeSubLog}</span>
            )}
            <span className={`px-3 py-1 bg-slate-900 border rounded-full text-[7px] font-mono uppercase tracking-widest ${accessLevel === 'CORE' ? 'text-purple-400 border-purple-500/20' : 'text-emerald-500 border-emerald-500/20'}`}>
              {accessLevel === 'CORE' ? 'Biometric Link' : 'Secure Context'}
            </span>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-12 space-y-10 no-scrollbar scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-10 py-10">
              <div className="space-y-6">
                <div className={`w-24 h-24 mx-auto rounded-full border flex items-center justify-center text-4xl italic bg-slate-900/40 text-white shadow-2xl transition-all ${accessLevel === 'CORE' ? 'border-purple-500/50 shadow-purple-500/10 scale-110' : 'border-slate-800'}`}>影</div>
                <div className="space-y-3">
                  <h4 className="text-[16px] font-bold text-white uppercase tracking-[0.3em]">
                    {accessLevel === 'CORE' ? "Ready for Calibration." : "Hello. I am Motokage."}
                  </h4>
                  <p className="text-[11px] text-slate-400 uppercase font-mono tracking-[0.1em] max-w-md mx-auto leading-relaxed">
                    {accessLevel === 'CORE' 
                      ? "The biometric perimeter is active. Our conversation is now in high-fidelity mode. I am ready to ingest artifacts or refine my reasoning logic."
                      : "I am Jon's Digital Twin. I have been architected to reflect his professional judgment and strategic philosophy."}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                {QUICK_DIRECTIVES.map((d, i) => (
                  <button key={i} onClick={() => handleSend(d)} className={`p-6 bg-slate-900/50 border rounded-2xl text-[9px] font-mono text-slate-500 uppercase tracking-widest transition-all text-left flex justify-between items-center group shadow-lg ${accessLevel === 'CORE' ? 'hover:border-purple-500/50 hover:text-purple-400 border-purple-900/20' : 'hover:border-indigo-500/50 hover:text-indigo-400 border-slate-800'}`}>
                    <span>{d}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[90%] rounded-[2.5rem] px-10 py-8 text-[15px] border shadow-2xl text-left ${msg.role === 'user' ? (accessLevel === 'CORE' ? 'bg-purple-600 border-purple-500 text-white shadow-purple-500/10' : 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-500/10') : 'bg-slate-900 border-slate-800 text-slate-200 shadow-slate-950/50'}`}>
                  {msg.role === 'model' ? renderFormattedText(msg.text) : <p className="whitespace-pre-wrap">{msg.text}</p>}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 flex items-center gap-3">
                  <div className="flex gap-1">
                     <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${accessLevel === 'CORE' ? 'bg-purple-500' : 'bg-indigo-500'}`}></span>
                     <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${accessLevel === 'CORE' ? 'bg-purple-500' : 'bg-indigo-500'}`}></span>
                     <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s] ${accessLevel === 'CORE' ? 'bg-purple-500' : 'bg-indigo-500'}`}></span>
                  </div>
                  <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">{accessLevel === 'CORE' ? 'Synthesizing Calibration...' : 'Synthesizing Reflection...'}</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-10 bg-slate-950 border-t border-slate-900">
          <div className="flex gap-4 max-w-5xl mx-auto items-end">
            <textarea 
              rows={1}
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={handleKeyDown}
              placeholder={accessLevel === 'CORE' ? "Interrogate the DNA..." : "Ask Motokage a strategic question..."} 
              className={`flex-grow bg-slate-900 border rounded-[2rem] px-8 py-5 text-sm text-white outline-none transition-all placeholder:text-slate-700 shadow-inner resize-none min-h-[64px] max-h-[250px] overflow-y-auto no-scrollbar leading-relaxed ${accessLevel === 'CORE' ? 'border-purple-500/40 focus:border-purple-500' : 'border-slate-800 focus:border-indigo-500'}`} 
              disabled={isLoading} 
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()} 
              className={`h-[64px] px-10 rounded-[2rem] font-bold text-[10px] uppercase tracking-widest shadow-2xl transition-all disabled:opacity-50 shrink-0 ${accessLevel === 'CORE' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'} text-white`}
            >
              Uplink
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          100% { top: 100%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
