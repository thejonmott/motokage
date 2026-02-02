
import React, { useState, useRef, useEffect } from 'react';
import { Persona, MemoryShard, AccessLevel } from '../types';
// Fix: Import GoogleGenAI from the official SDK
import { GoogleGenAI } from "@google/genai";

interface StagingViewProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  accessLevel: AccessLevel;
}

const StagingView: React.FC<StagingViewProps> = ({ persona, setPersona, accessLevel }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testLog, setTestLog] = useState<any[]>([]);
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotionDraft, setPromotionDraft] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);

  const runInterrogation = async (query: string) => {
    if (!query.trim() || isLoading) return;
    setIsLoading(true); setInput('');
    setTestLog(prev => [...prev, { role: 'user', text: query, timestamp: new Date() }]);
    try {
      // Fix: Create a new GoogleGenAI instance right before the call to ensures it always uses the most up-to-date API key.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // High-fidelity strategic reasoning
        contents: { parts: [{ text: query }] },
        config: { 
          systemInstruction: `Mode: ${accessLevel}. LAB_ENV. High-fidelity calibration session.` 
        }
      });
      // Fix: The text property directly returns the string output.
      const text = response.text;
      setTestLog(prev => [...prev, { role: 'model', text: text || "Neural connection stable, but response buffer empty.", timestamp: new Date() }]);
    } catch (error: any) {
      console.error(error);
      // Fix: If the request fails with "Requested entity was not found.", trigger the key selection dialog again.
      if (error.message?.includes("Requested entity was not found.")) {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
           window.aistudio.openSelectKey();
        }
      }
    } finally { setIsLoading(false); }
  };

  const startPromotion = async (content: string) => {
    setIsPromoting(true);
    setIsLoading(true);
    try {
      // Fix: Create a new GoogleGenAI instance right before the call to ensures it always uses the most up-to-date API key.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ text: `Scrub this content for PII and professional alignment: ${content}` }] },
        config: { 
          systemInstruction: "Transform this PRIVATE insight into a PUBLIC-SAFE strategic axiom. Remove PII while preserving strategic depth." 
        }
      });
      // Fix: The text property directly returns the string output.
      const text = response.text;
      setPromotionDraft(text || '');
    } catch (error: any) {
      console.error(error);
      // Fix: If the request fails with "Requested entity was not found.", trigger the key selection dialog again.
      if (error.message?.includes("Requested entity was not found.")) {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
           window.aistudio.openSelectKey();
        }
      }
    } finally { setIsLoading(false); }
  };

  const confirmPromotion = () => {
    const newShard: MemoryShard = {
      id: `pub_${Date.now()}`,
      category: 'echo',
      title: 'Lab Synthesis',
      content: promotionDraft,
      active: true,
      sensitivity: 'PUBLIC'
    };
    setPersona(prev => ({ ...prev, memoryShards: [newShard, ...prev.memoryShards] }));
    setIsPromoting(false);
    setPromotionDraft('');
  };

  return (
    <div className="max-w-7xl mx-auto h-[82vh] flex flex-col lg:flex-row gap-10 animate-in fade-in duration-700 pb-12 px-4">
      <div className={`flex-grow flex flex-col bg-slate-900 border rounded-[3.5rem] overflow-hidden shadow-2xl relative transition-colors duration-500 ${accessLevel === 'CORE' ? 'border-purple-500/30' : 'border-indigo-500/20'}`}>
        <div className="px-12 py-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 backdrop-blur-md">
          <div className="flex items-center gap-5">
            <div className={`w-3 h-3 rounded-full animate-pulse ${accessLevel === 'CORE' ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]'}`}></div>
            <div className="text-left">
              <h3 className="text-xs font-bold text-white uppercase tracking-[0.4em]">Secure Calibration: {accessLevel}</h3>
              <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-1">Status: Backend Proxy Nominal</p>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-12 space-y-12 no-scrollbar scroll-smooth">
          {testLog.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20 grayscale">
              <div className="w-24 h-24 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center text-4xl italic">影</div>
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Studio Interrogation Room</h4>
            </div>
          ) : (
            testLog.map((entry, i) => (
              <div key={i} className={`flex flex-col ${entry.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                <div className={`max-w-[85%] px-10 py-7 rounded-[3rem] text-sm leading-relaxed border shadow-2xl text-left ${entry.role === 'user' ? (accessLevel === 'CORE' ? 'bg-purple-600 border-purple-500' : 'bg-indigo-600 border-indigo-500') : 'bg-slate-950 border-slate-800 text-slate-200'}`}>
                  {entry.text}
                  {entry.role === 'model' && (
                    <button onClick={() => startPromotion(entry.text)} className={`mt-6 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all hover:scale-105 ${accessLevel === 'CORE' ? 'text-purple-400 hover:text-purple-300' : 'text-indigo-400 hover:text-indigo-300'}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5V19M5 12H19" /></svg>
                      Promote via Backend
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); runInterrogation(input); }} className="p-12 bg-slate-950/50 backdrop-blur-md border-t border-slate-800">
           <div className="flex gap-6 max-w-4xl mx-auto">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Interrogate secure logic..." className="flex-grow bg-slate-900 border border-slate-800 rounded-2xl px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all" />
              <button disabled={isLoading || !input.trim()} className={`${accessLevel === 'CORE' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-12 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all`}>
                {isLoading ? 'Calibrating...' : 'Submit'}
              </button>
           </div>
        </form>
      </div>
      <div className="w-full lg:w-[450px] shrink-0">
        {isPromoting ? (
          <div className="bg-slate-900 border border-indigo-500/30 rounded-[3.5rem] p-10 space-y-8 shadow-2xl animate-in zoom-in-95 sticky top-12">
             <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                <div className="text-left">
                  <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Synthesis Engine</h4>
                </div>
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7L12 12L22 7L12 2Z" /></svg>
                </div>
             </div>
             <div className="p-8 bg-slate-950 border border-slate-800 rounded-[2.5rem] shadow-inner">
                <textarea value={promotionDraft} onChange={(e) => setPromotionDraft(e.target.value)} className="w-full bg-transparent text-[11px] font-mono text-indigo-300 outline-none resize-none h-48 leading-relaxed no-scrollbar" />
             </div>
             <button onClick={confirmPromotion} className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all">
               Commit to Mosaic
             </button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 space-y-8 shadow-2xl">
             <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] border-b border-slate-800 pb-6 text-left">Lab Diagnostics</h4>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] text-slate-600 uppercase tracking-widest">Proxy Uplink</span>
                   <span className="text-[10px] font-bold text-emerald-500 font-mono">NOMINAL</span>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StagingView;
