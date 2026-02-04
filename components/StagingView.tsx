
import React, { useState, useRef, useEffect } from 'react';
import { Persona, MemoryShard, AccessLevel } from '../types';

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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          model: 'gemini-3-pro-preview',
          systemInstruction: `Mode: ${accessLevel}. LAB_ENV. High-fidelity calibration session.`
        })
      });
      const data = await response.json();
      setTestLog(prev => [...prev, { role: 'model', text: data.text || "Empty response.", timestamp: new Date() }]);
    } catch (error: any) {
      console.error(error);
    } finally { setIsLoading(false); }
  };

  const startPromotion = async (content: string) => {
    setIsPromoting(true);
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Scrub and align this content: ${content}`,
          model: 'gemini-3-pro-preview',
          systemInstruction: "Transform PRIVATE insights into PUBLIC-SAFE axioms."
        })
      });
      const data = await response.json();
      setPromotionDraft(data.text || '');
    } catch (error: any) { console.error(error); } finally { setIsLoading(false); }
  };

  const confirmPromotion = () => {
    const newShard: MemoryShard = { id: `pub_${Date.now()}`, category: 'echo', title: 'Lab Synthesis', content: promotionDraft, active: true, sensitivity: 'PUBLIC' };
    setPersona(prev => ({ ...prev, memoryShards: [newShard, ...prev.memoryShards] }));
    setIsPromoting(false);
    setPromotionDraft('');
  };

  return (
    <div className="max-w-7xl mx-auto h-[82vh] flex flex-col lg:flex-row gap-10 animate-in fade-in duration-700 pb-12 px-4">
      <div className={`flex-grow flex flex-col bg-slate-900 border rounded-[3.5rem] overflow-hidden shadow-2xl relative transition-colors duration-500 ${accessLevel === 'CORE' ? 'border-purple-500/30' : 'border-indigo-500/20'}`}>
        <div className="px-12 py-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 backdrop-blur-md">
          <div className="flex items-center gap-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.4em]">Calibration: {accessLevel}</h3>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-12 space-y-12 no-scrollbar scroll-smooth">
          {testLog.map((entry, i) => (
            <div key={i} className={`flex flex-col ${entry.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-4`}>
              <div className={`max-w-[85%] px-10 py-7 rounded-[3rem] text-sm leading-relaxed border ${entry.role === 'user' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-200'}`}>
                {entry.text}
                {entry.role === 'model' && <button onClick={() => startPromotion(entry.text)} className="mt-6 text-[9px] font-bold uppercase text-purple-400">Promote to Mosaic</button>}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); runInterrogation(input); }} className="p-12 bg-slate-950/50 border-t border-slate-800">
           <div className="flex gap-6 max-w-4xl mx-auto">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Interrogate secure logic..." className="flex-grow bg-slate-900 border border-slate-800 rounded-2xl px-8 py-5 text-sm text-white outline-none" />
              <button disabled={isLoading} className="bg-indigo-600 text-white px-12 rounded-2xl font-bold text-[10px] uppercase">{isLoading ? 'Calibrating...' : 'Submit'}</button>
           </div>
        </form>
      </div>
      {isPromoting && (
        <div className="w-full lg:w-[450px] bg-slate-900 border border-indigo-500/30 rounded-[3.5rem] p-10 space-y-8">
           <textarea value={promotionDraft} onChange={e => setPromotionDraft(e.target.value)} className="w-full bg-transparent text-[11px] font-mono text-indigo-300 outline-none h-48" />
           <button onClick={confirmPromotion} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-[10px] uppercase">Commit</button>
        </div>
      )}
    </div>
  );
};

export default StagingView;
