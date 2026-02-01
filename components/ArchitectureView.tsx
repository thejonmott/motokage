import React from 'react';
import { Persona } from '../types';

interface ArchitectureViewProps {
  persona: Persona;
  isCloudSynced?: boolean;
}

const TopologyDiagram = () => (
  <div className="relative w-full max-w-6xl mx-auto py-16 px-4 overflow-visible">
    <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent -translate-y-1/2 hidden md:block"></div>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
      {[
        { color: 'cyan', label: 'Identity Layer', tech: 'GitHub DNA Source', desc: 'Version-controlled personality and memory state.' },
        { color: 'blue', label: 'Inference Runtime', tech: 'Cloud Run (v3)', desc: 'Auto-scaling serverless environment for high-availability.' },
        { color: 'indigo', label: 'Cognitive Engine', tech: 'Gemini 3 Pro', desc: 'Multi-modal reasoning with a 2M token context window.' },
        { color: 'emerald', label: 'Knowledge Base', tech: 'Vertex AI Index', desc: 'Vectorized RAG for low-latency long-term memory retrieval.' }
      ].map((node, i) => (
        <div key={i} className="flex flex-col items-center space-y-6 group">
          <div className={`w-full bg-slate-950/80 backdrop-blur-xl border border-${node.color}-500/20 rounded-[2.5rem] flex flex-col items-center justify-center p-8 group-hover:border-${node.color}-400 group-hover:bg-slate-900 transition-all shadow-2xl relative overflow-hidden text-center min-h-[160px]`}>
            <div className={`absolute top-0 right-0 w-2 h-2 m-4 rounded-full bg-${node.color}-500 animate-pulse`}></div>
            <div className={`text-[8px] font-bold text-${node.color}-400 uppercase tracking-[0.3em] mb-2`}>{node.label}</div>
            <div className="text-[13px] text-white font-heading font-bold mb-2">{node.tech}</div>
            <div className="text-[9px] text-slate-500 font-mono leading-relaxed">{node.desc}</div>
          </div>
          <div className={`w-px h-12 bg-gradient-to-b from-${node.color}-500/50 to-transparent`}></div>
        </div>
      ))}
    </div>
  </div>
);

const ArchitectureView: React.FC<ArchitectureViewProps> = ({ isCloudSynced }) => {
  return (
    <div className="animate-in fade-in duration-1000 space-y-24 pb-24">
      <section className="text-center space-y-8 max-w-5xl mx-auto pt-16">
        <div className={`inline-flex items-center gap-3 px-6 py-2 bg-slate-900 border rounded-full shadow-2xl transition-all ${isCloudSynced ? 'border-green-500/50' : 'border-indigo-500/30'}`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isCloudSynced ? 'bg-green-500' : 'bg-indigo-500'}`}></span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">
            System Topology: MOTOKAGE_CORE_V7.2 <span className="text-yellow-500/80 ml-2">[BETA]</span>
          </span>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-7xl md:text-8xl font-bold font-heading text-white tracking-tighter leading-[1.1] max-w-5xl mx-auto">
            High-Fidelity, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">AI Digital Twin Architecture</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-3xl mx-auto font-light leading-relaxed font-mono uppercase tracking-widest text-xs">
            Showcasing the technical reasoning and cloud-native architecture behind a state-of-the-art digital reflection.
          </p>
        </div>
      </section>

      <TopologyDiagram />

      <div className="grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto px-4">
        <div className="bg-slate-950/90 backdrop-blur-3xl rounded-[4rem] p-16 border border-white/5 shadow-2xl">
          <div className="space-y-12">
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.5em]">The Strategic Edge</h4>
              <p className="text-4xl font-bold text-white leading-tight font-heading tracking-tight">Architected for Professional Presence.</p>
              <p className="text-base text-slate-400 leading-relaxed font-light">
                Motokage isn't just a chatbot; it's a persistent cognitive service. By leveraging Google Cloud Run and GitHub, I've created an "Identity-as-Code" framework that allows for continuous evolution and global scaling of professional judgment.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-2">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Inference Latency</div>
                <div className="text-5xl font-bold text-white tracking-tighter">&lt;800ms</div>
              </div>
              <div className="space-y-2">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Alignment State</div>
                <div className="text-5xl font-bold text-yellow-500/80 tracking-tighter uppercase italic">Beta</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 p-16 rounded-[4rem] border border-slate-800/50 shadow-inner space-y-10">
          <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.4em]">Infrastructure Telemetry</h4>
          <div className="space-y-6">
            {[
              { label: 'Uptime Protocol', val: 'Global Multi-Region' },
              { label: 'Encryption Standard', val: 'AES-256 (At Rest)' },
              { label: 'Memory Persistence', val: 'Vector Mesh v4.0' },
              { label: 'API Orchestrator', val: 'Gemini 3 Flash/Pro' },
              { label: 'Fidelity Target', val: 'BETA CALIBRATION' }
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center group">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider group-hover:text-slate-300 transition-colors">{item.label}</span>
                <span className="text-[11px] font-bold text-white uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 group-hover:border-indigo-500/50 transition-all">{item.val}</span>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-slate-800/50">
            <p className="text-[10px] text-slate-600 font-mono italic leading-relaxed text-center">
              "Building the twin is half the challenge; building the fortress that holds it is the other half."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureView;