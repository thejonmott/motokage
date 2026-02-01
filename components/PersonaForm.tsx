import React, { useState } from 'react';
import { Persona, Mandate } from '../types';

interface PersonaFormProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  onSave: () => void;
}

const DNAStrand = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4.5 16.5c3-1 6-1 9 0M4.5 7.5c3 1 6 1 9 0M7 2v20M13 2v20M19 2v20M19 7.5c-3 1-6 1-9 0M19 16.5c-3-1-6-1-9 0"/></svg>
);

const PersonaForm: React.FC<PersonaFormProps> = ({ persona, setPersona, onSave }) => {
  const [newMandate, setNewMandate] = useState({ title: '', objective: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersona(prev => ({ ...prev, [name]: value }));
  };

  const addMandate = () => {
    if (!newMandate.title) return;
    const mandate: Mandate = { 
      id: `m_${Date.now()}`, 
      title: newMandate.title,
      objective: newMandate.objective,
      status: 'active', 
      priority: 'STRATEGIC',
      agents: []
    };
    setPersona(prev => ({ ...prev, mandates: [mandate, ...(prev.mandates || [])] }));
    setNewMandate({ title: '', objective: '' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-8 border-b border-slate-900 pb-12">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <DNAStrand />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.4em]">Core Logic & Priorities</span>
          </div>
          <h2 className="text-6xl font-bold font-heading text-white tracking-tighter">The <span className="text-slate-500 italic font-light">DNA</span></h2>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Encoding Values, Reasoning, and Mandates</p>
        </div>
        <button onClick={onSave} className="bg-white text-slate-950 px-12 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-slate-200">Initialize Essence</button>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <div className="p-10 bg-slate-900/40 border border-slate-800 rounded-[3rem] space-y-8">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Logic Constraints</h4>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Cognitive Cadence</label>
                <select name="tone" value={persona.tone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-sm text-white outline-none">
                  <option>Mission-Driven Visionary</option>
                  <option>Analytical Strategist</option>
                  <option>Empathetic Mentor</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Reasoning Logic</label>
                <input type="text" name="reasoningLogic" value={persona.reasoningLogic} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-sm text-white outline-none" />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Persona Narrative (The Essence)</label>
              <textarea name="bio" value={persona.bio} onChange={handleChange} rows={6} className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] px-8 py-8 text-xs font-mono text-slate-400 outline-none resize-none" />
            </div>
          </div>

          <div className="p-10 bg-slate-950 border border-slate-900 rounded-[3.5rem] shadow-2xl space-y-8">
            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Active Mandates</h4>
            <div className="grid gap-4">
              {(persona.mandates || []).map(m => (
                <div key={m.id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-start group">
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-white uppercase tracking-wider">{m.title}</div>
                    <div className="text-[9px] text-slate-500 font-mono leading-relaxed">{m.objective}</div>
                  </div>
                  <span className="text-[7px] font-bold px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded uppercase">{m.priority}</span>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-slate-900 space-y-4">
               <input type="text" placeholder="New Mandate Title..." value={newMandate.title} onChange={e => setNewMandate({...newMandate, title: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-6 py-3 text-[10px] text-white outline-none" />
               <input type="text" placeholder="Objective..." value={newMandate.objective} onChange={e => setNewMandate({...newMandate, objective: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-6 py-3 text-[10px] text-white outline-none" />
               <button onClick={addMandate} className="w-full py-3 bg-slate-800 text-slate-400 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Add Execution Mandate</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="p-10 bg-slate-900/50 border border-slate-800 rounded-[3rem] sticky top-32 space-y-10">
             <div className="text-center space-y-2">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.5em]">Identity Radar</h4>
                <p className="text-[8px] text-slate-500 font-mono uppercase">Balance of DNA Strands</p>
             </div>
             <div className="aspect-square w-full bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)]"></div>
                <div className="w-1/2 h-1/2 border border-indigo-500/20 rounded-full animate-ping"></div>
                <div className="text-2xl font-bold text-white font-heading z-10">自己</div>
             </div>
             <div className="space-y-6 pt-6 border-t border-slate-800">
                <div className="flex justify-between items-center">
                   <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Mandate Count</span>
                   <span className="text-[10px] font-bold text-indigo-400">{(persona.mandates || []).length} Active</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Ethical Alignment</span>
                   <span className="text-[10px] font-bold text-emerald-400">OPTIMAL</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaForm;