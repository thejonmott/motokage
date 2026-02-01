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
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ persona, setPersona, messages, setMessages, accessLevel, hasKey, onConnectKey }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading, streamingText]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !hasKey) return;

    const currentInput = input;
    const userMessage: Message = { role: 'user', text: currentInput, timestamp: new Date() };
    
    // 1. Update UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingText('');

    try {
      // 2. Instantiate right before call to ensure latest API key from SelectKey dialog is used
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 3. Filter history to ensure alternating roles (U, M, U, M...)
      // The current 'messages' state contains the previous history. 
      // Gemini expects the last turn in history to be 'model'.
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: `You are Motokage: Jon's Digital Twin. 
          NOTE: You are in a BETA CALIBRATION phase. 
          IDENTITY: ${persona.bio}
          MANDATES: ${persona.mandates.map(m => m.title).join(', ')}.
          MODE: ${accessLevel}. Represent Jon's professional values and strategic foresight accurately.`,
          temperature: 0.7,
        },
        history: history,
      });

      // 4. Stream response
      const result = await chat.sendMessageStream({ message: currentInput });
      
      let fullResponse = '';
      for await (const chunk of result) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          fullResponse += chunkText;
          setStreamingText(fullResponse);
        }
      }

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: fullResponse || "...", 
        timestamp: new Date() 
      }]);
      setStreamingText('');
    } catch (error: any) {
      console.error("Chat Protocol Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `[UPLINK_FAILURE]: ${error.message || 'The cognitive relay timed out.'}`, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] max-w-2xl mx-auto text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="w-24 h-24 rounded-full bg-slate-900 border border-indigo-500/30 flex items-center justify-center text-4xl shadow-2xl shadow-indigo-500/10">
           影
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold font-heading text-white tracking-tight">Handshake Required</h2>
          <p className="text-slate-500 text-sm font-mono uppercase tracking-widest leading-relaxed">
            Motokage requires a billing-enabled Studio API Key to establish a high-fidelity cognitive uplink.
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full">
           <button 
             onClick={onConnectKey}
             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-2xl font-bold text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-indigo-600/20"
           >
             Connect Studio Key
           </button>
           <a 
             href="https://ai.google.dev/gemini-api/docs/billing" 
             target="_blank" 
             rel="noreferrer" 
             className="text-[9px] text-slate-600 uppercase tracking-widest hover:text-indigo-400 transition-colors"
           >
             Learn about Gemini Billing Requirements
           </a>
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
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
            <div className="absolute top-4 left-4 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,179,8,1)]"></span>
              <span className="text-[7px] font-mono text-white/70 uppercase tracking-widest">Active Link</span>
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-left">
              <div className="text-white text-lg font-bold font-heading tracking-tight leading-none mb-1 uppercase">Jonathan Mott</div>
              <div className="text-[8px] font-mono text-indigo-400 uppercase tracking-[0.2em] flex justify-between items-center">
                <span>Reflective Mode</span>
                <span className="text-yellow-500/50">[BETA]</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-3">
             <span>Identity_Telemetry</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed font-mono uppercase tracking-wider italic text-left">
            "I am Motokage, an architected extension of Jon's strategic judgment. Uplink established via Gemini 3 Pro."
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-grow flex flex-col bg-slate-950 rounded-[3.5rem] border overflow-hidden shadow-2xl transition-all duration-500 ${accessLevel === 'CORE' ? 'border-purple-500/30' : 'border-indigo-500/20'}`}>
        <div className="bg-slate-900/50 backdrop-blur-xl px-12 py-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl font-bold text-white shadow-xl">影</div>
            <div className="text-left">
              <div className="text-base font-bold text-white uppercase tracking-widest">Motokage: Digital Twin</div>
              <div className="text-[8px] text-slate-500 font-mono uppercase tracking-[0.3em]">Ambassador Protocol Active</div>
            </div>
          </div>
          <div className="hidden md:block">
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[7px] font-mono text-slate-500 uppercase tracking-widest">Sync_Status: NOMINAL</span>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-12 space-y-12 no-scrollbar scroll-smooth">
          {messages.length === 0 && !streamingText ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30 grayscale">
              <div className="w-20 h-20 rounded-full border border-slate-800 flex items-center justify-center text-3xl italic">影</div>
              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-[0.3em]">Awaiting Strategic Query...</p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] rounded-[2.5rem] px-10 py-8 text-[14px] leading-relaxed border shadow-2xl text-left ${msg.role === 'user' ? (accessLevel === 'CORE' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-indigo-600 border-indigo-500 text-white') : 'bg-slate-900 border-slate-800 text-slate-200'}`}>
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
                  <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Synthesizing DNA...</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Guardrail Policy Bar */}
        <div className="px-12 py-4 bg-slate-900/50 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-[7px] font-mono text-slate-600 uppercase tracking-widest gap-4">
           <div className="flex gap-4">
             <span className="flex items-center gap-1"><span className="w-1 h-1 bg-emerald-500 rounded-full"></span> NSFW Filter: ACTIVE</span>
             <span className="flex items-center gap-1"><span className="w-1 h-1 bg-emerald-500 rounded-full"></span> Professional Alignment: ENFORCED</span>
           </div>
           <div className="text-center md:text-right italic">
             Policy: 5 messages per session limit. All interactions are monitored for fidelity.
           </div>
        </div>

        <form onSubmit={handleSend} className="p-10 bg-slate-950 border-t border-slate-900">
          <div className="flex gap-4 max-w-5xl mx-auto">
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Interact with Jon's digital twin..." 
              className="flex-grow bg-slate-900 border border-slate-800 rounded-[2rem] px-8 py-5 text-sm text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700" 
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-10 rounded-[2rem] font-bold text-[10px] uppercase tracking-widest shadow-2xl transition-all disabled:opacity-50 ${accessLevel === 'CORE' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;