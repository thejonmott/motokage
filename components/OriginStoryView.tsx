import React, { useState } from 'react';
import { Persona, OriginFact, AccessLevel } from '../types';

interface OriginStoryViewProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  accessLevel: AccessLevel;
}

const OriginStoryView: React.FC<OriginStoryViewProps> = ({ persona, setPersona, accessLevel }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newFact, setNewFact] = useState({ year: '', event: '', significance: '' });

  const addFact = () => {
    if (!newFact.event) return;
    const fact: OriginFact = { id: `o_${Date.now()}`, ...newFact };
    setPersona(prev => ({ ...prev, originFacts: [...prev.originFacts, fact].sort((a,b) => parseInt(a.year) - parseInt(b.year)) }));
    setIsAdding(false);
    setNewFact({ year: '', event: '', significance: '' });
  };

  return (
    <div className="space-y-16 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="text-blue-400 text-[10px] font-mono font-bold uppercase tracking-[0.4em]">Historical Bedrock</div>
          <h2 className="text-6xl font-bold font-heading text-white tracking-tight">Origin <span className="italic text-slate-500 font-light text-5xl">Story</span></h2>
        </div>
        {accessLevel === 'CORE' && (
          <button onClick={() => setIsAdding(!isAdding)} className="px-6 py-3 bg-slate-900 border border-slate-800 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:border-blue-500/50 transition-all">Add Timeline Fact</button>
        )}
      </div>

      {isAdding && (
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl space-y-6 animate-in slide-in-from-top-4">
           <div className="grid md:grid-cols-3 gap-6">
              <input type="text" placeholder="Year" value={newFact.year} onChange={e => setNewFact({...newFact, year: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-sm text-white outline-none focus:border-blue-500" />
              <input type="text" placeholder="Event" value={newFact.event} onChange={e => setNewFact({...newFact, event: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-sm text-white outline-none focus:border-blue-500" />
              <input type="text" placeholder="Significance" value={newFact.significance} onChange={e => setNewFact({...newFact, significance: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-sm text-white outline-none focus:border-blue-500" />
           </div>
           <div className="flex gap-4">
              <button onClick={addFact} className="flex-grow bg-blue-600 text-white py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest">Etch to Timeline</button>
              <button onClick={() => setIsAdding(false)} className="px-8 py-3 bg-slate-950 text-slate-600 rounded-xl text-[9px] font-bold uppercase tracking-widest">Cancel</button>
           </div>
        </div>
      )}

      <div className="relative space-y-12">
        <div className="absolute left-[3.25rem] top-0 bottom-0 w-px bg-slate-900 hidden md:block"></div>
        {persona.originFacts.map((fact, i) => (
          <div key={fact.id} className="flex gap-8 group">
             <div className="w-24 shrink-0 text-right space-y-1 pt-1">
                <div className="text-sm font-bold text-white font-mono">{fact.year}</div>
                <div className="text-[7px] text-slate-600 uppercase tracking-widest font-mono">Epoch</div>
             </div>
             <div className="hidden md:flex w-2 h-2 rounded-full bg-slate-800 border-2 border-slate-950 outline outline-1 outline-slate-800 z-10 mt-2 group-hover:bg-blue-500 group-hover:outline-blue-500 transition-all"></div>
             <div className="flex-grow bg-slate-900/30 border border-slate-900 p-8 rounded-[2rem] hover:border-slate-800 transition-all">
                <h4 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">{fact.event}</h4>
                <p className="text-[10px] text-slate-500 font-mono leading-relaxed uppercase tracking-wider">{fact.significance}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="p-12 border border-slate-900 rounded-[3rem] text-center space-y-4">
         <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.5em]">The Bedrock Promise</h4>
         <p className="text-[10px] text-slate-600 italic font-mono max-w-lg mx-auto leading-relaxed">
           "Every fact listed here is an immutable anchor for the digital twin's identity. These are the non-negotiables of the Origin Story."
         </p>
      </div>
    </div>
  );
};

export default OriginStoryView;