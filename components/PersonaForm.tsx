
import React, { useState } from 'react';
import { Persona } from '../types';
import ShadowSyncConsole from './ShadowSyncConsole';

interface PersonaFormProps {
  persona: Persona;
  setPersona: (persona: Persona) => void;
  onSave: () => void;
}

const IdentityIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AxiomIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TechnicalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 9H21M9 21V9M15 21V9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

const PersonaForm: React.FC<PersonaFormProps> = ({ persona, setPersona, onSave }) => {
  const [showConsole, setShowConsole] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersona({ ...persona, [name]: value });
  };

  const handleValuesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersona({ ...persona, coreValues: e.target.value.split(',').map(v => v.trim()) });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-slate-900 pb-10 gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">DNA Architect</span>
          </div>
          <h2 className="text-5xl font-bold font-heading text-white tracking-tight">
            Shadow <span className="text-slate-500 italic font-light">Designer</span>
          </h2>
          <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">Structural Identity Mapping</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setShowConsole(!showConsole)}
            className={`px-8 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all border ${showConsole ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`}
          >
            {showConsole ? 'DEACTIVATE HUB' : 'INITIALIZE HUB'}
          </button>
          <button 
            onClick={onSave}
            className="bg-white text-slate-950 px-10 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl"
          >
            EXECUTE TEST
          </button>
        </div>
      </div>

      {showConsole && (
        <div className="animate-fade-in transform transition-all duration-500">
          <ShadowSyncConsole persona={persona} />
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Identity Grid */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-10 bg-slate-900/40 border border-slate-800 rounded-[3rem] space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors">
                <IdentityIcon />
              </div>
              <div className="space-y-4 relative z-10">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Designation</label>
                <input type="text" name="name" value={persona.name} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500 shadow-inner" />
                
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] pt-2">Cognitive Tone</label>
                <select name="tone" value={persona.tone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500 appearance-none shadow-inner">
                  <option>First Principles Analyst</option>
                  <option>Professional Strategist</option>
                  <option>Creative Synthesizer</option>
                  <option>Logical Engine (o1 Style)</option>
                </select>
              </div>
            </div>
            
            <div className="p-10 bg-slate-900/40 border border-slate-800 rounded-[3rem] space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors">
                <AxiomIcon />
              </div>
              <div className="space-y-4 relative z-10">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Decision Axioms</label>
                <input type="text" value={persona.coreValues.join(', ')} onChange={handleValuesChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500 shadow-inner" placeholder="Impact, Family, Truth" />
                
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] pt-2">Functional Mandate</label>
                <input type="text" name="profession" value={persona.profession} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500 shadow-inner" />
              </div>
            </div>
          </div>

          <div className="p-12 bg-slate-900/40 border border-slate-800 rounded-[3.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mb-6">Unified Persona Narrative</label>
            <textarea name="bio" value={persona.bio} onChange={handleChange} rows={8} className="w-full bg-slate-950/50 border border-slate-800 rounded-[2.5rem] px-8 py-8 text-sm text-slate-300 outline-none focus:border-indigo-500 resize-none leading-relaxed shadow-inner" />
          </div>
        </div>

        {/* Technical HUD */}
        <div className="lg:col-span-4 space-y-6">
           <div className="p-10 bg-slate-950 border border-slate-800 rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30"></div>
             
             <div className="flex items-center gap-3 border-b border-slate-900 pb-4">
                <span className="text-indigo-400"><TechnicalIcon /></span>
                <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.3em]">Kernel Endpoints</h4>
             </div>
             
             <div className="space-y-6">
               <div className="space-y-2">
                 <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-widest">RAG Vector Cluster</label>
                 <div className="relative">
                   <input type="text" name="ragSource" value={persona.ragSource} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-mono text-green-400 outline-none focus:border-green-500/30" />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                 </div>
               </div>
               
               <div className="space-y-2">
                 <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-widest">Logic Orchestrator</label>
                 <div className="relative">
                   <input type="text" name="agentLogic" value={persona.agentLogic} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-mono text-orange-400 outline-none focus:border-orange-500/30" />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                 </div>
               </div>

               <div className="pt-6 space-y-3">
                  {[
                    { label: 'Live Vocal', status: 'SYNCHRONIZED', color: 'text-green-500' },
                    { label: 'Search Mesh', status: 'GROUNDED', color: 'text-green-500' },
                    { label: 'Handshake', status: 'STANDBY', color: 'text-indigo-400' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[9px] font-mono border-b border-slate-900 pb-2">
                       <span className="text-slate-600 uppercase tracking-widest">{item.label}</span>
                       <span className={`font-bold ${item.color}`}>{item.status}</span>
                    </div>
                  ))}
               </div>
             </div>
           </div>

           <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
              </div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-80 mb-3">Architectural Rule</h4>
              <p className="text-xs font-medium leading-relaxed font-heading tracking-wide">
                "Accuracy is the primary currency of a Digital Twin. Your DNA defines the horizon of your twin's intelligence."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaForm;
