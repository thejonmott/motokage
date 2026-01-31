import React from 'react';
import { Persona } from '../types';

interface ArchitectureViewProps {
  persona: Persona;
  isCloudSynced?: boolean;
}

const TopologyDiagram = () => (
  <div className="relative w-full max-w-5xl mx-auto py-24 px-4 overflow-hidden">
    <div className="absolute top-1/2 left-1/4 w-1/2 h-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 blur-xl -translate-y-1/2"></div>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
      <div className="flex flex-col items-center space-y-6 group">
        <div className="w-full aspect-square md:aspect-auto md:h-32 bg-slate-900 border border-cyan-500/30 rounded-[2.5rem] flex flex-col items-center justify-center p-6 group-hover:border-cyan-400 transition-all shadow-2xl relative overflow-hidden text-center">
          <div className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Source Layer</div>
          <div className="text-[11px] text-white font-heading font-bold">GitHub Repository</div>
          <div className="text-[7px] text-slate-500 mt-2 uppercase font-mono">Identity-as-Code</div>
        </div>
        <div className="w-px h-8 bg-gradient-to-b from-cyan-500/50 to-transparent"></div>
      </div>

      <div className="flex flex-col items-center space-y-6 group">
        <div className="w-full aspect-square md:aspect-auto md:h-32 bg-slate-900 border border-blue-500/30 rounded-[2.5rem] flex flex-col items-center justify-center p-6 group-hover:border-blue-400 transition-all shadow-2xl relative overflow-hidden text-center">
          <div className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mb-1">Compute Layer</div>
          <div className="text-[11px] text-white font-heading font-bold">Google Cloud Run</div>
          <div className="text-[7px] text-slate-500 mt-2 uppercase font-mono">Serverless Inference</div>
        </div>
        <div className="w-px h-8 bg-gradient-to-b from-blue-500/50 to-transparent"></div>
      </div>

      <div className="flex flex-col items-center space-y-6 group">
        <div className="w-full aspect-square md:aspect-auto md:h-32 bg-slate-900 border border-indigo-500/30 rounded-[2.5rem] flex flex-col items-center justify-center p-6 group-hover:border-indigo-400 transition-all shadow-2xl relative overflow-hidden text-center">
          <div className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Reasoning Core</div>
          <div className="text-[11px] text-white font-heading font-bold">Gemini 3 Pro</div>
          <div className="text-[7px] text-slate-500 mt-2 uppercase font-mono">Cognitive Engine</div>
        </div>
        <div className="w-px h-8 bg-gradient-to-b from-indigo-500/50 to-transparent"></div>
      </div>

      <div className="flex flex-col items-center space-y-6 group">
        <div className="w-full aspect-square md:aspect-auto md:h-32 bg-slate-900 border border-emerald-500/30 rounded-[2.5rem] flex flex-col items-center justify-center p-6 group-hover:border-emerald-400 transition-all shadow-2xl relative overflow-hidden text-center">
          <div className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Persistence Enclave</div>
          <div className="text-[11px] text-white font-heading font-bold">Vertex AI Index</div>
          <div className="text-[7px] text-slate-500 mt-2 uppercase font-mono">Long-term Memory</div>
        </div>
        <div className="w-px h-8 bg-gradient-to-b from-emerald-500/50 to-transparent"></div>
      </div>
    </div>
    
    <div className="absolute top-1/2 left-0 w-full h-px bg-slate-800/50 -translate-y-1/2 hidden md:block"></div>
  </div>
);

const ArchitectureView: React.FC<ArchitectureViewProps> = ({ persona, isCloudSynced }) => {
  return (
    <div className="animate-in fade-in duration-1000 space-y-20 pb-20">
      <section className="text-center space-y-8 max-w-5xl mx-auto pt-12">
        <div className={`inline-flex items-center gap-3 px-5 py-2 bg-slate-900 border rounded-full shadow-2xl transition-all ${isCloudSynced ? 'border-green-500/50' : 'border-slate-800'}`}>
          <span className={`w-2 h-2 rounded-full animate-pulse ${isCloudSynced ? 'bg-green-500' : 'bg-blue-500'}`}></span>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em]">
            {isCloudSynced ? 'Cloud Identity Verified v4.2' : 'Hosted Topology v4.0'}
          </span>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-8xl font-bold font-heading text-white tracking-tighter leading-none max-w-4xl mx-auto">
            Hosted <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">Infrastructure.</span>
          </h2>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed font-mono uppercase tracking-widest text-sm">
            Transitioning Motokage from a local experiment to a persistent, global cognitive service on Google Cloud.
          </p>
        </div>
      </section>

      <TopologyDiagram />

      <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <div className="bg-slate-950/90 backdrop-blur-3xl rounded-[3.9rem] p-12 md:p-16 border border-white/5 shadow-2xl">
          <div className="space-y-12">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.5em]">The Cloud Pivot</h4>
              <p className="text-3xl font-bold text-white leading-tight font-heading">Continuous Deployment ensures your twin never stops evolving.</p>
              <p className="text-base text-slate-400 leading-relaxed font-light">
                By hosting on Google Cloud Run, we decouple your identity from any single browser. The "Self-Deploy" protocol in the Sync Console pushes your system state and code to GitHub, which triggers a GCP build.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-blue-500 pl-4">Persistence</div>
                <div className="text-4xl font-bold text-white tracking-tighter">CLOUD</div>
              </div>
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-indigo-500 pl-4">Availability</div>
                <div className="text-4xl font-bold text-indigo-400 tracking-tighter">99.9%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 p-12 rounded-[3.9rem] border border-slate-800/50 shadow-inner flex flex-col justify-center">
          <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.4em] mb-8">Cloud Provisioning Checklist</h4>
          <div className="space-y-4">
            {[
              { step: '1', text: 'Cloud Run Service deployed and reachable.' },
              { step: '2', text: 'GitHub Repository connected to Cloud Build.' },
              { step: '3', text: 'Atomic DNA handshakes (shadow_config.json) enabled.' },
              { step: '4', text: 'Identity Hydration Protocol online.' },
              { step: '5', text: 'Port 8080 properly exposed in Dockerfile.' },
              { step: '6', text: 'Gemini API Key secured in Secret Manager.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start group">
                <span className="w-6 h-6 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-indigo-500 shrink-0 group-hover:border-indigo-500 transition-all">{item.step}</span>
                <p className="text-[11px] text-slate-400 font-mono uppercase leading-relaxed tracking-wider">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-12 bg-slate-950/50 rounded-[4rem] border border-slate-900 mt-20">
         <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-6">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Target Stack Topology</h4>
               <div className="space-y-4">
                 {[
                   { label: 'Runtime Environment', val: 'Google Cloud Run' },
                   { label: 'Source Management', val: 'GitHub (Direct Sync)' },
                   { label: 'Build Pipeline', val: 'Google Cloud Build' },
                   { label: 'Identity Hydration', val: 'Remote JSON Handshake' }
                 ].map((item, i) => (
                   <div key={i} className="flex justify-between items-center py-4 border-b border-slate-800 last:border-0 group">
                     <span className="text-[10px] font-mono text-slate-500 uppercase group-hover:text-slate-300 transition-colors">{item.label}</span>
                     <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">{item.val}</span>
                   </div>
                 ))}
               </div>
            </div>
            <div className={`p-10 rounded-[3rem] border text-center transition-all ${isCloudSynced ? 'bg-green-500/5 border-green-500/20' : 'bg-indigo-500/5 border-indigo-500/10'}`}>
               <div className={`text-[8px] font-bold uppercase tracking-[0.5em] mb-4 ${isCloudSynced ? 'text-green-500' : 'text-indigo-500'}`}>Evolution Status</div>
               <div className="text-2xl font-bold text-white font-heading">
                 {isCloudSynced ? 'IDENTITY_SYNC_ESTABLISHED' : 'PROVISIONING_REQUIRED'}
               </div>
               <p className="text-[9px] text-slate-500 font-mono mt-4 uppercase leading-relaxed">
                 {isCloudSynced 
                   ? 'Remote DNA has successfully hydrated this browser session.' 
                   : 'Follow the checklist above to complete the handshake between GitHub and Google Cloud.'}
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ArchitectureView;