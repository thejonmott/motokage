
import React from 'react';
import { Persona, AccessLevel } from '../types';

interface DNAViewProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  accessLevel: AccessLevel;
}

const DNAView: React.FC<DNAViewProps> = ({ persona, setPersona, accessLevel }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersona(prev => ({ ...prev, [name]: value }));
  };

  const isLocked = accessLevel !== 'CORE';

  const densityStats = [
    { label: 'Timeline Nodes', count: persona.originFacts.length, color: 'indigo' },
    { label: 'Kinship Records', count: persona.relationships.length, color: 'emerald' },
    { label: 'Hobby Strands', count: persona.interests.hobbies.length, color: 'blue' },
    { label: 'Musical Archetypes', count: persona.interests.bands.length, color: 'purple' },
    { label: 'Literary Depth', count: persona.interests.authors.length, color: 'cyan' },
    { label: 'Cinematic Influence', count: persona.interests.movies.length, color: 'amber' }
  ];

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-32">
      <div className="flex justify-between items-end border-b border-slate-900 pb-8 text-left">
        <div className="space-y-2">
          <div className="text-indigo-400 text-[10px] font-mono font-bold uppercase tracking-[0.4em]">Reasoning Heuristics & Data Density</div>
          <h2 className="text-6xl font-bold font-heading text-white">The <span className="italic text-slate-500 font-light">DNA</span></h2>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 text-left">
        <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800 space-y-8 shadow-2xl">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cognitive Parameters</h4>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Presence Tone</label>
              <select name="tone" value={persona.tone} onChange={handleChange} disabled={isLocked} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500 disabled:opacity-50">
                <option>Mission-Driven Visionary</option>
                <option>Analytical Strategist</option>
                <option>Empathetic Mentor</option>
                <option>Stoic Architect</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Reasoning Heuristic</label>
              <input type="text" name="reasoningLogic" value={persona.reasoningLogic} onChange={handleChange} disabled={isLocked} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500 disabled:opacity-50" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800 space-y-8 shadow-2xl">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Instructions</h4>
          <div className="space-y-3">
            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Bio & Narrative Identity</label>
            <textarea name="bio" value={persona.bio} onChange={handleChange} disabled={isLocked} rows={8} className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] px-8 py-8 text-xs font-mono text-slate-400 outline-none focus:border-indigo-500 resize-none disabled:opacity-50" />
          </div>
        </div>
      </div>

      {/* DATA DENSITY MAP */}
      <div className="bg-slate-900/40 p-12 rounded-[4rem] border border-slate-800 space-y-10 text-left shadow-inner">
         <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.5em]">Cognitive Data Density</h4>
            <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">Visualizing the Ingested Legacy Mesh</p>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {densityStats.map(stat => (
              <div key={stat.label} className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 transition-all hover:border-indigo-500/30">
                 <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                    <span className={`text-xl font-bold text-${stat.color}-500 tracking-tighter`}>{stat.count}</span>
                 </div>
                 <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className={`h-full bg-${stat.color}-500/40 transition-all duration-1000`} style={{ width: `${Math.min(stat.count * 10, 100)}%` }}></div>
                 </div>
              </div>
            ))}
         </div>
      </div>

      <div className="bg-indigo-600/5 border border-indigo-500/20 p-12 rounded-[3.5rem] text-center space-y-6">
        <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.5em]">The Ethical Bedrock</h4>
        <div className="flex flex-wrap justify-center gap-3">
          {persona.coreValues.map((v, i) => (
            <span key={i} className="px-6 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{v}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DNAView;
