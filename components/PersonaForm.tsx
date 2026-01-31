
import React, { useState } from 'react';
import { Persona, MemoryCategory, NeuralCoreType } from '../types';

interface PersonaFormProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  onSave: () => void;
}

const IdentityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"/><path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21"/></svg>
);

const StrandIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c3-1 6-1 9 0M4.5 7.5c3 1 6 1 9 0M7 2v20M13 2v20M19 2v20M19 7.5c-3 1-6 1-9 0M19 16.5c-3-1-6-1-9 0"/></svg>
);

const CognitiveRadar: React.FC<{ persona: Persona }> = ({ persona }) => {
  return (
    <div className="relative w-full aspect-square max-w-[300px] mx-auto group">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
        <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18" stroke="#0f172a" strokeWidth="0.5" />
        <polygon 
          points="50,15 85,50 50,85 15,50" 
          className="fill-indigo-500/10 stroke-indigo-500 transition-all duration-1000"
          strokeWidth="1.5"
        />
        <circle cx="50" cy="50" r="4" className="fill-white animate-pulse" />
        <circle cx="50" cy="50" r="8" className="stroke-indigo-400/30 fill-none animate-ping" />
      </svg>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-500 uppercase tracking-widest">Axioms</div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-500 uppercase tracking-widest">History</div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-500 uppercase tracking-widest -rotate-90 origin-center">Tone</div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-500 uppercase tracking-widest rotate-90 origin-center">Mandate</div>
    </div>
  );
};

const PersonaForm: React.FC<PersonaFormProps> = ({ persona, setPersona, onSave }) => {
  const complexity = persona.targetComplexity || 50;
  const shardCount = persona.memoryShards.length;
  const neuralDensity = Math.min(100, (shardCount / complexity) * 100);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersona(prev => ({ ...prev, [name]: value }));
  };

  const handleComplexityChange = (val: number) => {
    setPersona(prev => ({ ...prev, targetComplexity: val }));
  };

  const handleCoreChange = (val: NeuralCoreType) => {
    setPersona(prev => ({ ...prev, neuralCoreType: val }));
  };

  const handleValuesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersona(prev => ({ ...prev, coreValues: e.target.value.split(',').map(v => v.trim()) }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-8 border-b border-slate-900 pb-12">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <StrandIcon />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.4em]">Genetic Architect Protocol</span>
          </div>
          <h2 className="text-6xl font-bold font-heading text-white tracking-tighter">
            DNA <span className="text-slate-500 italic font-light">Blueprint</span>
          </h2>
          <p className="text-slate-500 text-xs font-mono tracking-[0.4em] uppercase">Designing the high-fidelity shadow reflection</p>
        </div>
        <div className="flex gap-4">
           <button onClick={onSave} className="bg-white text-slate-950 px-12 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-slate-200 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]">
             Initialize Test
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-10 bg-slate-900/40 border border-slate-800 rounded-[3rem] relative overflow-hidden group hover:border-indigo-500/30 transition-all">
              <div className="absolute top-0 right-0 p-8 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors">
                <IdentityIcon />
              </div>
              <div className="space-y-6 relative z-10">
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.4em]">Designation Name</label>
                  <input type="text" name="name" value={persona.name} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.4em]">Cognitive Cadence</label>
                  <select name="tone" value={persona.tone} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500 appearance-none">
                    <option>Mission-Driven Visionary</option>
                    <option>Analytical Strategist</option>
                    <option>Empathetic Mentor</option>
                    <option>Direct Challenger</option>
                    <option>Creative Instigator</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-10 bg-slate-900/40 border border-slate-800 rounded-[3rem] relative overflow-hidden group hover:border-indigo-500/30 transition-all">
              <div className="space-y-6 relative z-10">
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.4em]">Decision Axioms</label>
                  <input type="text" value={persona.coreValues.join(', ')} onChange={handleValuesChange} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500 transition-all" placeholder="Family, Impact, AI Strategy" />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.4em]">Functional Mandate</label>
                  <input type="text" name="profession" value={persona.profession} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500 transition-all" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-12 bg-slate-900/40 border border-slate-800 rounded-[3.5rem] relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em]">Consciousness Stream</label>
              <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[8px] font-mono text-indigo-400">STATUS_ACTIVE</div>
            </div>
            <textarea 
              name="bio" 
              value={persona.bio} 
              onChange={handleChange} 
              rows={8} 
              className="w-full bg-slate-950/80 border border-slate-800 rounded-[2.5rem] px-10 py-10 text-xs font-mono text-slate-400 outline-none focus:border-indigo-500 resize-none leading-[2] shadow-inner selection:bg-indigo-500/30" 
              placeholder="The fundamental narrative of the digital twin's existence..."
            />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="p-10 bg-slate-950 border border-slate-800 rounded-[3rem] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-transparent"></div>
             <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.4em] mb-12 flex items-center gap-3">
               <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
               Identity Visualization
             </h4>
             
             <CognitiveRadar persona={persona} />
             
             <div className="mt-12 space-y-6 pt-10 border-t border-slate-900">
                <div className="space-y-3">
                  <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                    <span>Fidelity Density</span>
                    <span className="text-indigo-400">{shardCount} / {complexity}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" style={{ width: `${neuralDensity}%` }}></div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-900/50">
                   <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Neural Architecture</label>
                   <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleCoreChange('local')}
                        className={`py-2 rounded-lg text-[8px] font-bold uppercase tracking-widest border transition-all ${persona.neuralCoreType === 'local' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
                      >
                        Local Core
                      </button>
                      <button 
                        onClick={() => handleCoreChange('vector_mesh')}
                        className={`py-2 rounded-lg text-[8px] font-bold uppercase tracking-widest border transition-all ${persona.neuralCoreType === 'vector_mesh' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
                      >
                        Vector Mesh
                      </button>
                   </div>
                </div>

                <div className="space-y-3 pt-2">
                   <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Kernel Complexity</label>
                   <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: 30, label: 'Lite' },
                        { val: 50, label: 'Standard' },
                        { val: 100, label: 'Deep' }
                      ].map(tier => (
                        <button 
                          key={tier.val} 
                          onClick={() => handleComplexityChange(tier.val)}
                          className={`py-2 rounded-lg text-[8px] font-bold uppercase tracking-widest border transition-all ${complexity === tier.val ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
                        >
                          {tier.label}
                        </button>
                      ))}
                   </div>
                </div>

                <p className="text-[8px] text-slate-500 leading-relaxed font-mono uppercase tracking-widest text-center italic mt-4">
                  "Genetic entropy balanced. Kernel {complexity === 30 ? 'Lite' : complexity === 50 ? 'Standard' : 'Deep'} calibration active."
                </p>
             </div>
          </div>

          <div className="p-10 bg-slate-900/50 border border-slate-800 rounded-[3rem] space-y-8 shadow-xl">
             <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] border-b border-slate-800 pb-4">Logic Registry</h4>
             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-slate-700 uppercase tracking-[0.2em]">RAG_TARGET</label>
                  <div className="text-[10px] font-mono text-indigo-400 bg-slate-950 p-3 rounded-xl border border-slate-800 truncate">
                    {persona.neuralCoreType === 'vector_mesh' ? 'Vertex AI Search' : persona.ragSource}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-slate-700 uppercase tracking-[0.2em]">STORAGE_LAYER</label>
                  <div className="text-[10px] font-mono text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 truncate uppercase">
                    {persona.neuralCoreType === 'vector_mesh' ? 'PERSISTENT CLOUD INDEX' : 'LOCAL BROWSER STORAGE'}
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaForm;
