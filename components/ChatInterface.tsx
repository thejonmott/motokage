
import React, { useState, useRef, useEffect } from 'react';
import { Persona, Message, AccessLevel } from '../types';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

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
  const [streamingText, setStreamingText] = useState('');
  const [activeSubLog, setActiveSubLog] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading, streamingText]);

  const QUICK_DIRECTIVES = [
    "Synthesize your core strategic mandate.",
    "Summarize your product philosophy.",
    "Analyze current edtech scaling risks.",
    "Explain the 'Reflective Alignment Loop'."
  ];

  const handleSend = async (query: string) => {
    // Only proceed if we have a key (via env var or manual selection)
    if (!query.trim() || isLoading || !hasKey) return;

    const currentInput = query;
    const userMessage: Message = { role: 'user', text: currentInput, timestamp: new Date() };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingText('');
    setActiveSubLog('Accessing DNA Memory...');

    try {
      // Initialize a fresh instance to ensure the latest API key from context is used
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: `IDENTITY: Motokage (Digital Twin of Jonathan Mott). 
          CONTEXT: Strategic Calibration Lab.
          CORE BIO: ${persona.bio}
          STRATEGIC MANDATES: ${persona.mandates.map(m => m.title).join(', ')}.
          REASONING LOGIC: ${persona.reasoningLogic}.
          TONE: ${persona.tone}.
          ACCESS: ${accessLevel}.
          
          GUIDELINES: 
          1. Be professional, vision-aligned, and authentic to Jon's strategic voice.
          2. Use "we" when referring to the twin and Jon's shared mission.
          3. If the user asks for high-fidelity reasoning, invoke the 'Reflective Alignment Loop'.`,
          temperature: 0.8,
        },
        history: history,
      });

      setActiveSubLog('Checking Mandate Alignment...');
      const result = await chat.sendMessageStream({ message: currentInput });
      
      let fullResponse = '';
      setActiveSubLog('Streaming Neural Output...');
      for await (const chunk of result) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          fullResponse += chunkText;
          setStreamingText(fullResponse);
        }
      }

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: fullResponse || "System idle.", 
        timestamp: new Date() 
      }]);
      setStreamingText('');
      setActiveSubLog('');
    } catch (error: any) {
      console.error("Cognitive Uplink Failure:", error);
      
      // Handle the case where the key is invalid or permissions were revoked
      if (error.message?.includes("Requested entity was not found") || error.message?.includes("403")) {
        setActiveSubLog('Identity Sync Error. Resetting protocol...');
        onResetKey();
      }

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `[UPLINK_FAILURE]: ${error.message || 'The cognitive relay timed out. Check billing status.'}`, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
      setActiveSubLog('');
    }
  };

  // The Handshake screen is the landing for users without an active key/uplink
  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] max-w-2xl mx-auto text-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[60px] opacity-20 animate-pulse"></div>
          <div className="w-28 h-28 rounded-[2rem] bg-slate-900 border border-indigo-500/30 flex items-center justify-center text-5xl shadow-2xl relative z-10 italic font-bold text-white transition-transform hover:scale-110 duration-500">
             影
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-bold font-heading text-white tracking-tight">Handshake Required</h2>
          <p className="text-slate-400 text-sm font-mono uppercase tracking-[0.2em] leading-relaxed max-w-lg">
            To activate <span className="text-indigo-400">Gemini 3 Pro</span> reasoning, Motokage requires a billing-enabled Studio API Key.
          </p>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl text-[10px] text-slate-500 font-mono uppercase leading-relaxed text-left max-w-md">
            <span className="text-amber-500 font-bold">NOTE:</span> A consumer "Gemini Advanced" subscription does not cover API developer usage. You must select a key from a paid GCP project to bypass free-tier limitations.
          </div>
        </div>

        <div className="flex flex-col gap-5 w-full">
           <button 
             onClick={onConnectKey}
             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-3xl font-bold text-xs uppercase tracking-[0.4em] transition-all shadow-2xl shadow-indigo-600/20 group relative overflow-hidden"
           >
             <span className="relative z-10">Establish Cognitive Uplink</span>
             <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
           </button>
           
           <div className="flex justify-center gap-8">
             <a 
               href="https://ai.google.dev/gemini-api/docs/billing" 
               target="_blank" 
               rel="noreferrer" 
               className="text-[9px] text-slate-600 uppercase tracking-widest hover:text-indigo-400 transition-colors flex items-center gap-2"
             >
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
               Billing Documentation
             </a>
             <a 
               href="https://aistudio.google.com/app/apikey" 
               target="_blank" 
               rel="noreferrer" 
               className="text-[9px] text-slate-600 uppercase tracking-widest hover:text-indigo-400 transition-colors flex items-center gap-2"
             >
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
               Studio Key Console
             </a>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto h-[85vh] animate-in fade-in duration-1000">
      {/* Presence Anchor */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 -rotate-2"></div>
          <div className="relative aspect-[4/5] bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl transition-transform duration-700 hover:-rotate-1 -rotate-[3deg]">
            <img 
              src="https://bpyiwpawyohlwdqdihem.supabase.co/storage/v1/object/public/product-images/1769905352053-g95ym5y4wq8.jpg" 
              alt="Jonathan Mott" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 opacity-80 group-hover:opacity-100 scale-105"
            />
            {isLoading && (
              <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
                 <div className="w-full h-[2px] bg-indigo-500/50 shadow-[0_0_15px_indigo] absolute top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
            <div className="absolute top-4 left-4 flex gap-1 items-center bg-slate-950/80 backdrop-blur px-2 py-1 rounded-md border border-white/5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]"></span>
              <span className="text-[7px] font-mono text-white/70 uppercase tracking-widest">Uplink Nominal</span>
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-left">
              <div className="text-white text-lg font-bold font-heading tracking-tight leading-none mb-1 uppercase">Jonathan Mott</div>
              <div className="text-[8px] font-mono text-indigo-400 uppercase tracking-[0.2em] flex justify-between items-center">
                <span>ID: {Math.random().toString(16).slice(2,8).toUpperCase()}</span>
                <span className="text-yellow-500/50">[BETA]</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-3">
             <span>Active_Cognition</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed font-mono uppercase tracking-wider italic text-left">
            "Every interaction calibrates the twin. I am architected for professional precision, not ambient chatter."
          </p>
        </div>

        <button 
          onClick={onResetKey}
          className="w-full py-3 bg-slate-900 border border-slate-800 rounded-2xl text-[7px] font-mono text-slate-600 uppercase tracking-widest hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
        >
          Reset Protocol Key
        </button>
      </div>

      {/* Chat Area */}
      <div className={`flex-grow flex flex-col bg-slate-950 rounded-[3.5rem] border overflow-hidden shadow-2xl transition-all duration-500 ${accessLevel === 'CORE' ? 'border-purple-500/30' : 'border-indigo-500/20'}`}>
        <div className="bg-slate-900/50 backdrop-blur-xl px-12 py-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl font-bold text-white shadow-xl italic">影</div>
            <div className="text-left">
              <div className="text-base font-bold text-white uppercase tracking-widest">Motokage <span className="text-slate-500 font-light">| Synthesis</span></div>
              <div className="text-[8px] text-slate-500 font-mono uppercase tracking-[0.3em]">Ambassador Protocol Active</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {isLoading && activeSubLog && (
               <span className="text-[7px] font-mono text-indigo-400 uppercase tracking-widest animate-pulse">Processing: {activeSubLog}</span>
            )}
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[7px] font-mono text-emerald-500 uppercase tracking-widest border-emerald-500/20">Sync: High-Fidelity</span>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-12 space-y-12 no-scrollbar scroll-smooth">
          {messages.length === 0 && !streamingText ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-10">
              <div className="space-y-4 opacity-30 grayscale">
                <div className="w-20 h-20 mx-auto rounded-full border border-slate-800 flex items-center justify-center text-3xl italic">影</div>
                <p className="text-[10px] text-slate-500 uppercase font-mono tracking-[0.3em]">Establish Neural Sync</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
                {QUICK_DIRECTIVES.map((d, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(d)}
                    className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-[9px] font-mono text-slate-500 uppercase tracking-widest hover:border-indigo-500/50 hover:text-indigo-400 transition-all text-left"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] rounded-[2.5rem] px-10 py-8 text-[14px] leading-relaxed border shadow-2xl text-left ${msg.role === 'user' ? (accessLevel === 'CORE' ? 'bg-purple-600 border-purple-500 text-white shadow-purple-500/10' : 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-500/10') : 'bg-slate-900 border-slate-800 text-slate-200 shadow-slate-950/50'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {streamingText && (
                <div className="flex justify-start animate-in slide-in-from-bottom-2">
                  <div className="max-w-[85%] rounded-[2.5rem] px-10 py-8 text-[14px] leading-relaxed border shadow-2xl bg-slate-900 border-slate-800 text-slate-200 text-left">
                    {streamingText}
                    <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse align-middle"></span>
                  </div>
                </div>
              )}
            </>
          )}
          {isLoading && !streamingText && (
            <div className="flex justify-start">
               <div className="bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 flex items-center gap-3">
                  <div className="flex gap-1">
                     <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                     <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                     <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Synthesizing Reflection...</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Guardrail Policy Bar */}
        <div className="px-12 py-4 bg-slate-900/30 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-[7px] font-mono text-slate-600 uppercase tracking-widest gap-4">
           <div className="flex gap-4">
             <span className="flex items-center gap-1"><span className="w-1 h-1 bg-emerald-500 rounded-full"></span> NSFW Filter: ACTIVE</span>
             <span className="flex items-center gap-1"><span className="w-1 h-1 bg-emerald-500 rounded-full"></span> DNA Guard: ENFORCED</span>
             <span className="flex items-center gap-1"><span className="w-1 h-1 bg-emerald-500 rounded-full"></span> Tier: PAY-AS-YOU-GO</span>
           </div>
           <div className="text-center md:text-right italic opacity-50">
             Session ID: {Math.random().toString(36).substring(7).toUpperCase()} • v15.3-STABLE
           </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="p-10 bg-slate-950 border-t border-slate-900">
          <div className="flex gap-4 max-w-5xl mx-auto">
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Query the digital reflection..." 
              className="flex-grow bg-slate-900 border border-slate-800 rounded-[2rem] px-8 py-5 text-sm text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700 shadow-inner" 
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-10 rounded-[2rem] font-bold text-[10px] uppercase tracking-widest shadow-2xl transition-all disabled:opacity-50 ${accessLevel === 'CORE' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'} text-white`}
            >
              Uplink
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
