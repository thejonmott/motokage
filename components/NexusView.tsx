
import React, { useState, useEffect } from 'react';
// Fixed error: Module '"../types"' has no exported member 'CloudSource'.
import { Persona } from '../types';
import ShadowSyncConsole from './ShadowSyncConsole';

interface NexusViewProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
}

const MarinerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" />
    <path d="M2 17L12 22L22 17" />
    <path d="M2 12L12 17L22 12" />
    <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

interface MarinerCapture {
  timestamp: string;
  title: string;
  domain: string;
  priority: boolean;
  status: 'accepted' | 'discarded';
}

const DecisionLog = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const decisions = [
    { 
      date: 'CURRENT', 
      title: 'Real-time Alignment', 
      desc: 'I added a reasoning layer to see exactly how Motokage thinks.', 
      status: 'ACTIVE',
      detail: 'I built the Staging Lab so I can interrogate the twin and correct its thinking in real-time. This ensures that the AI’s strategic output is always aligned with my current professional standards.'
    },
    { 
      date: 'PHASE 2', 
      title: 'Google Project Mariner', 
      desc: 'I implemented the Mariner protocol to filter high-value research.', 
      status: 'PHASED',
      detail: 'I integrated Project Mariner to act as an agentic browser sensor, distinguishing between ambient noise and high-value research artifacts for the twin to ingest.'
    },
    { 
      date: 'PHASE 1', 
      title: 'Identity Foundation', 
      desc: 'I architected the initial Core Memory Vault.', 
      status: 'COMPLETE',
      detail: 'I spent the first phase defining the core values and professional narrative that drive the entire system. This is the bedrock of the high-fidelity reflection.'
    }
  ];

  return (
    <div className="p-10 bg-slate-900 border border-slate-800 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden h-full">
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.3em] font-heading">Strategy Log</h3>
        <span className="text-[8px] font-mono text-indigo-400 uppercase tracking-widest animate-pulse">Live Evolution</span>
      </div>
      <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
        {decisions.map((d, i) => (
          <div 
            key={i} 
            onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
            className={`group p-5 bg-slate-950/50 border transition-all cursor-pointer rounded-2xl ${expandedIndex === i ? 'border-indigo-500/50 bg-slate-950 shadow-xl' : 'border-slate-800 hover:border-indigo-500/30'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[8px] font-mono text-slate-600 tracking-tighter">{d.date}</span>
              <span className={`text-[7px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${expandedIndex === i ? 'bg-indigo-500 text-white' : 'text-indigo-500 bg-indigo-500/10'}`}>
                {d.status}
              </span>
            </div>
            <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors ${expandedIndex === i ? 'text-indigo-400' : 'text-slate-300'}`}>
              {d.title}
            </h4>
            <p className="text-[9px] text-slate-500 font-mono leading-relaxed uppercase">{d.desc}</p>
            
            {expandedIndex === i && (
              <div className="mt-4 pt-4 border-t border-slate-900 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-4 bg-slate-900 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed normal-case">
                    <span className="text-indigo-500 font-bold uppercase mr-2">[STRATEGY]:</span>
                    {d.detail}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const NexusView: React.FC<NexusViewProps> = ({ persona, setPersona }) => {
  const [marinerCaptures, setMarinerCaptures] = useState<MarinerCapture[]>([]);
  const [whitelist, setWhitelist] = useState(['notebooklm.google.com', 'github.com', 'mott.io', 'docs.google.com']);
  const [strictAttention, setStrictAttention] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const handleCapture = (e: any) => {
      const data = e.detail || {};
      const domain = data.domain || 'unknown.site';
      const isPriority = whitelist.some(d => domain.includes(d));
      
      const captureStatus: 'accepted' | 'discarded' = isPriority ? 'accepted' : 'discarded';

      if (strictAttention && !isPriority) {
        setMarinerCaptures(prev => [{
          timestamp: new Date().toLocaleTimeString(),
          title: data.title || 'Noise Filtered',
          domain,
          priority: false,
          status: 'discarded' as const
        }, ...prev].slice(0, 5));
        return;
      }

      setMarinerCaptures(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        title: data.title || 'Context Capture',
        domain,
        priority: isPriority,
        status: captureStatus
      }, ...prev].slice(0, 5));
    };

    window.addEventListener('motokage_mariner_capture', handleCapture);
    return () => window.removeEventListener('motokage_mariner_capture', handleCapture);
  }, [whitelist, strictAttention]);

  const runSimulation = (target: 'mariner' | 'noise') => {
    setIsSimulating(true);
    const mockData = target === 'mariner' 
      ? { title: 'Strategic Roadmap Artifact', domain: 'notebooklm.google.com', content: 'Deep dive into edtech scaling via AI.', priority: true }
      : { title: 'Shopping Cart: Standing Desk', domain: 'amazon.com', content: 'Price check on ergonomic furniture.', priority: false };

    window.dispatchEvent(new CustomEvent('motokage_mariner_capture', { detail: mockData }));
    
    setTimeout(() => setIsSimulating(false), 1000);
  };

  return (
    <div className="animate-in fade-in duration-1000 space-y-12 pb-24 max-w-7xl mx-auto px-4 md:px-8">
      <section className="text-center space-y-4 max-w-4xl mx-auto pt-8">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-cyan-500/10 text-cyan-400 text-[9px] font-bold rounded-full border border-cyan-500/20 uppercase tracking-[0.4em] mb-2">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
          Perception & Intelligence Nexus
        </div>
        <h2 className="text-7xl font-bold font-heading text-white tracking-tight">The <span className="text-blue-400">Nexus</span></h2>
        <p className="text-slate-500 text-lg font-light leading-relaxed font-mono uppercase tracking-widest text-xs">
          Agentic Filtering & Sensory Simulation Hub
        </p>
      </section>

      <div className="grid lg:grid-cols-3 gap-8 items-stretch">
        <div className="lg:col-span-1">
           <DecisionLog />
        </div>
        
        <div className="lg:col-span-2 p-10 bg-slate-900 border border-slate-800 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center border bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
                <MarinerIcon />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white uppercase tracking-tight font-heading">Project Mariner Bridge</h4>
                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Status: {strictAttention ? 'AGENTIC_SENSING_ACTIVE' : 'OPEN_SENSORY_FLOW'}</p>
              </div>
            </div>
            <button 
              onClick={() => setStrictAttention(!strictAttention)}
              className={`px-4 py-2 rounded-xl text-[8px] font-bold uppercase tracking-widest border transition-all ${strictAttention ? 'bg-cyan-500 text-slate-950 border-transparent shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
            >
              {strictAttention ? 'Mariner: STRICT' : 'Mariner: PASSIVE'}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-12 flex-grow">
            <div className="space-y-8">
              <div className="space-y-4">
                <h5 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">Agentic Simulation</h5>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => runSimulation('mariner')}
                    disabled={isSimulating}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between group hover:border-cyan-500/50 transition-all text-left"
                  >
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-white uppercase tracking-widest">Mariner Sensory Pulse</div>
                      <div className="text-[8px] text-slate-500 font-mono">Whitelisted Source Detected</div>
                    </div>
                    <span className="text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">⚡ CAPTURE</span>
                  </button>
                  <button 
                    onClick={() => runSimulation('noise')}
                    disabled={isSimulating}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between group hover:border-red-500/50 transition-all text-left"
                  >
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-white uppercase tracking-widest">Ambient Noise Pulse</div>
                      <div className="text-[8px] text-slate-500 font-mono">Discarded: Irrelevant Domain</div>
                    </div>
                    <span className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">⚡ IGNORE</span>
                  </button>
                </div>
              </div>

              <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-3">
                <h6 className="text-[8px] font-bold text-white uppercase tracking-widest">Attention Whitelist</h6>
                <div className="flex flex-wrap gap-2">
                  {whitelist.map(d => (
                    <span key={d} className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[8px] font-mono rounded-lg">{d}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 flex flex-col h-full">
              <h5 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">Sensory Processing Log</h5>
              <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-6 flex-grow font-mono text-[9px] space-y-3 shadow-inner overflow-y-auto no-scrollbar max-h-[280px]">
                {marinerCaptures.length === 0 ? (
                  <div className="text-slate-800 flex flex-col items-center justify-center h-full gap-4 opacity-50">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping"></div>
                    <span className="uppercase tracking-[0.4em]">Sensing Mariner Stream...</span>
                  </div>
                ) : (
                  marinerCaptures.map((cap, i) => (
                    <div key={i} className={`p-4 rounded-xl border animate-in slide-in-from-right-2 ${cap.status === 'accepted' ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-red-500/5 border-red-500/20 opacity-40 grayscale'}`}>
                      <div className="flex justify-between mb-1">
                        <span className={cap.status === 'accepted' ? 'text-cyan-400 font-bold' : 'text-red-400'}>
                          [{cap.timestamp}] {cap.status === 'accepted' ? 'INGESTED' : 'FILTERED'}
                        </span>
                        <span className="text-[8px] text-slate-600 uppercase tracking-tighter">{cap.domain}</span>
                      </div>
                      <span className={`uppercase tracking-widest truncate block ${cap.status === 'accepted' ? 'text-white' : 'text-slate-600 line-through'}`}>
                        {cap.title}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8">
        <ShadowSyncConsole persona={persona} setPersona={setPersona} />
      </div>
    </div>
  );
};

export default NexusView;
