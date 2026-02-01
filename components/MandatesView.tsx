import React, { useState } from 'react';
import { Persona, Mandate, Agent, AccessLevel } from '../types';

interface MandatesViewProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  accessLevel: AccessLevel;
}

const MandatesView: React.FC<MandatesViewProps> = ({ persona, setPersona, accessLevel }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newMandate, setNewMandate] = useState({ title: '', objective: '' });

  const addMandate = () => {
    if (!newMandate.title) return;
    const mandate: Mandate = {
      id: `m_${Date.now()}`,
      ...newMandate,
      priority: 'STRATEGIC',
      status: 'active',
      agents: []
    };
    setPersona(prev => ({ ...prev, mandates: [mandate, ...prev.mandates] }));
    setIsAdding(false);
    setNewMandate({ title: '', objective: '' });
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-end px-4">
        <div className="space-y-2">
          <div className="text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-[0.4em]">Tactical Execution</div>
          <h2 className="text-6xl font-bold font-heading text-white">Mandates <span className="italic text-slate-500 font-light">& Agents</span></h2>
        </div>
        {accessLevel === 'CORE' && (
          <button onClick={() => setIsAdding(!isAdding)} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-emerald-500 transition-all">New Mandate</button>
        )}
      </div>

      {isAdding && (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] shadow-2xl space-y-8 animate-in zoom-in-95">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Mandate Title</label>
              <input type="text" value={newMandate.title} onChange={e => setNewMandate({...newMandate, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-emerald-500" placeholder="e.g. Job Search Catalyst" />
            </div>
            <div className="space-y-4">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Objective Specification</label>
              <input type="text" value={newMandate.objective} onChange={e => setNewMandate({...newMandate, objective: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-emerald-500" placeholder="e.g. Find 3 roles matching edtech & impact goals." />
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={addMandate} className="flex-grow bg-emerald-600 text-white py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Initialize Mandate</button>
            <button onClick={() => setIsAdding(false)} className="px-10 py-5 bg-slate-950 text-slate-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {persona.mandates.map(m => (
          <div key={m.id} className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-8 group hover:border-emerald-500/30 transition-all">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[8px] font-mono text-emerald-500 uppercase tracking-widest">{m.priority}</span>
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{m.title}</h3>
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            
            <p className="text-[11px] text-slate-500 font-mono uppercase leading-relaxed tracking-wider border-l-2 border-slate-800 pl-4">{m.objective}</p>
            
            <div className="space-y-4">
               <h4 className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Active Agents</h4>
               <div className="grid gap-3">
                  {m.agents.length === 0 ? (
                    <div className="text-[9px] font-mono text-slate-700 italic">No agents deployed.</div>
                  ) : (
                    m.agents.map(a => (
                      <div key={a.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">🤖</div>
                           <div>
                              <div className="text-[10px] font-bold text-white">{a.name}</div>
                              <div className="text-[7px] text-slate-500 uppercase font-mono">{a.role}</div>
                           </div>
                        </div>
                        <div className="flex gap-1">
                           {a.sensors.map(s => <span key={s} className="text-[6px] px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-500 rounded uppercase">{s}</span>)}
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>

            {accessLevel === 'CORE' && (
              <button className="w-full py-4 border border-dashed border-slate-800 rounded-2xl text-[8px] font-bold text-slate-600 uppercase tracking-widest hover:border-emerald-500/50 hover:text-emerald-400 transition-all">Spawn Agent</button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] p-12 text-center space-y-8">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em]">The Agentic Loop</h4>
        <div className="flex flex-wrap justify-center items-center gap-6">
           {['Sensors', 'Data', 'Thinking', 'Reasoning', 'Prioritization', 'Planning', 'Tools', 'Actions'].map((step, i) => (
             <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-2">
                   <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center text-xs bg-slate-950">{(i+1).toString().padStart(2, '0')}</div>
                   <span className="text-[7px] font-mono text-slate-600 uppercase tracking-widest">{step}</span>
                </div>
                {i < 7 && <div className="text-slate-800">→</div>}
             </React.Fragment>
           ))}
        </div>
      </div>
    </div>
  );
};

export default MandatesView;