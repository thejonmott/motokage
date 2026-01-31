
import React, { useState, useRef, useEffect } from 'react';
import { Persona, Message, MemoryShard, AccessLevel } from '../types';
import { GoogleGenAI } from '@google/genai';

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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: query,
        config: { systemInstruction: `Mode: ${accessLevel}. You are Jonathan Mott's digital twin in a calibration lab. Respond with high fidelity.` }
      });
      setTestLog(prev => [...prev, { role: 'model', text: response.text, timestamp: new Date() }]);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const startPromotion = async (content: string) => {
    setIsPromoting(true);
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `SCRUBBING PROTOCOL: Take the following PRIVATE insight and rewrite it as a PUBLIC-SAFE strategic axiom for an Ambassador twin. 
      - Remove PII, specific family details, and confidential project names.
      - Retain the core professional wisdom and strategic logic.
      - Tone: Professional, authoritative, and mission-driven.
      
      ORIGINAL PRIVATE CONTENT: ${content}`;
      
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setPromotionDraft(response.text || '');
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const confirmPromotion = () => {
    const newShard: MemoryShard = {
      id: `pub_${Date.now()}`,
      category: 'echo',
      title: 'Strategic Synthesis',
      content: promotionDraft,
      active: true,
      sensitivity: 'PUBLIC',
      lastSynced: new Date()
    };
    setPersona(prev => ({ ...prev, memoryShards: [newShard, ...prev.memoryShards] }));
    setIsPromoting(false);
    setPromotionDraft('');
  };

  return (
    <div className="max-w-7xl mx-auto h-[82vh] flex flex-col lg:flex-row gap-10 animate-in fade-in duration-700 pb-12 px-4">
      {/* Alignment Terminal */}
      <div className={`flex-grow flex flex-col bg-slate-900 border rounded-[3.5rem] overflow-hidden shadow-2xl relative transition-colors duration-500 ${accessLevel === 'CORE' ? 'border-purple-500/30' : 'border-indigo-500/20'}`}>
        <div className="px-12 py-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 backdrop-blur-md">
          <div className="flex items-center gap-5">
            <div className={`w-3 h-3 rounded-full animate-pulse ${accessLevel === 'CORE' ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]'}`}></div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-[0.4em]">Alignment Enclave: {accessLevel}</h3>
              <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-1">Status: Ready for Calibration</p>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-12 space-y-12 no-scrollbar scroll-smooth">
          {testLog.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20 grayscale">
              <div className="w-24 h-24 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center text-4xl italic">影</div>
              <div className="max-w-xs space-y-3">
                 <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">No Active Sessions</h4>
                 <p className="text-[9px] text-slate-500 uppercase font-mono leading-relaxed">Interrogate the twin to verify value alignment and reasoning fidelity.</p>
              </div>
            </div>
          ) : (
            testLog.map((entry, i) => (
              <div key={i} className={`flex flex-col ${entry.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                <div className={`max-w-[85%] px-10 py-7 rounded-[3rem] text-sm leading-relaxed border shadow-2xl ${entry.role === 'user' ? (accessLevel === 'CORE' ? 'bg-purple-600 border-purple-500' : 'bg-indigo-600 border-indigo-500') : 'bg-slate-950 border-slate-800 text-slate-200'}`}>
                  {entry.text}
                  {entry.role === 'model' && (
                    <button 
                      onClick={() => startPromotion(entry.text)} 
                      className={`mt-6 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all hover:scale-105 ${accessLevel === 'CORE' ? 'text-purple-400 hover:text-purple-300' : 'text-indigo-400 hover:text-indigo-300'}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5V19M5 12H19" /></svg>
                      Promote to Public DNA
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
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Submit alignment query..." 
                className="flex-grow bg-slate-900 border border-slate-800 rounded-2xl px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700" 
              />
              <button disabled={isLoading || !input.trim()} className={`${accessLevel === 'CORE' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-12 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-30`}>
                Interrogate
              </button>
           </div>
        </form>
      </div>

      {/* Promotion Panel */}
      <div className="w-full lg:w-[450px] flex flex-col gap-8 shrink-0">
        {isPromoting ? (
          <div className="bg-slate-900 border border-indigo-500/30 rounded-[3.5rem] p-10 space-y-8 shadow-2xl animate-in zoom-in-95 sticky top-12">
             <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                <div>
                  <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Promotion Agent</h4>
                  <p className="text-[8px] font-mono text-slate-600 uppercase mt-1">Status: Scrubbing Protocol v2.1</p>
                </div>
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7L12 12L22 7L12 2Z" /></svg>
                </div>
             </div>
             
             <div className="space-y-4">
                <p className="text-[11px] text-slate-400 italic leading-relaxed font-mono">
                  "I've synthesized a version of your private reasoning that retains the strategic value while ensuring zero exposure of sensitive context."
                </p>
                <div className="p-8 bg-slate-950 border border-slate-800 rounded-[2.5rem] shadow-inner">
                   <textarea 
                     value={promotionDraft} 
                     onChange={(e) => setPromotionDraft(e.target.value)} 
                     className="w-full bg-transparent text-[11px] font-mono text-indigo-300 outline-none resize-none h-48 leading-relaxed no-scrollbar" 
                   />
                </div>
             </div>

             <div className="flex flex-col gap-4">
                <button 
                  onClick={confirmPromotion} 
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all"
                >
                  Etch to Public DNA
                </button>
                <button 
                  onClick={() => setIsPromoting(false)} 
                  className="w-full py-3 text-[9px] text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors"
                >
                  Discard Draft
                </button>
             </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 space-y-8 shadow-2xl">
             <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] border-b border-slate-800 pb-6">Environment Diagnostics</h4>
             <div className="space-y-8">
                <div className="flex justify-between items-center group">
                   <span className="text-[10px] text-slate-600 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Access Mode</span>
                   <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${accessLevel === 'CORE' ? 'bg-purple-500/10 text-purple-400' : 'bg-indigo-500/10 text-indigo-400'}`}>{accessLevel}</span>
                </div>
                <div className="flex justify-between items-center group">
                   <span className="text-[10px] text-slate-600 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Encryption</span>
                   <span className="text-[10px] font-bold text-green-500 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                     ACTIVE
                   </span>
                </div>
                <div className="flex justify-between items-center group">
                   <span className="text-[10px] text-slate-600 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Mesh Sync</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-tighter">Verified</span>
                </div>
             </div>
             
             <div className="p-8 bg-slate-950 border border-slate-800 rounded-[2.5rem] space-y-4">
               <h5 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Protocol Tip</h5>
               <p className="text-[10px] text-slate-600 leading-relaxed font-mono italic">
                 "Use the Interrogator to test your twin's reasoning. If it says something insightful but private, use the Promotion Agent to publicize it."
               </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StagingView;
