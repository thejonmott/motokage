
import React from 'react';
import { Persona } from '../types';

interface ArchitectureViewProps {
  persona: Persona;
}

const FamilyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform duration-500">
    <path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="7" y="14" width="2" height="2" rx="0.5" fill="currentColor" fillOpacity="0.2"/>
    <rect x="15" y="14" width="2" height="2" rx="0.5" fill="currentColor" fillOpacity="0.2"/>
  </svg>
);

const ImpactIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform duration-500">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2"/>
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 2V5M12 19V22M2 12H5M19 12H22M4.93 4.93L7.05 7.05M16.95 16.95L19.07 19.07" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>
);

const PotentialIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform duration-500">
    <path d="M12 4L12 20M12 4L7 9M12 4L17 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 20H20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="12" cy="14" r="3" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.1"/>
  </svg>
);

const ArchitectureView: React.FC<ArchitectureViewProps> = ({ persona }) => {
  const missionGoals = [
    { title: 'Family Provision', desc: 'Sustaining the inner sanctum through strategic stability.', icon: <FamilyIcon />, color: 'text-blue-400', border: 'border-blue-500/30' },
    { title: 'Global Impact', desc: 'Architecting systems that leave a permanent human fingerprint.', icon: <ImpactIcon />, color: 'text-indigo-400', border: 'border-indigo-500/30' },
    { title: 'Mass Potential', desc: 'Unlocking cognitive achievement for millions at scale.', icon: <PotentialIcon />, color: 'text-purple-400', border: 'border-purple-500/30' }
  ];

  // Twinning Metrics
  const shardCount = persona.memoryShards.length;
  const nexusCount = persona.cloudSources.length;
  const neuralDensity = Math.min(100, Math.round((shardCount / 50) * 100));
  const syncReady = shardCount >= 50 && nexusCount >= 3;

  return (
    <div className="animate-fade-in space-y-20 pb-20">
      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-full mb-2">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Operational Strategy v6.8</span>
        </div>
        <h2 className="text-7xl font-bold font-heading text-white tracking-tighter leading-[1.1]">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">North Star</span> <br/>
          <span className="italic font-light">Architecture</span>
        </h2>
      </section>

      {/* Twinning Readiness Dashboard */}
      <div className="max-w-6xl mx-auto p-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 rounded-[3rem]">
        <div className="bg-slate-950/90 backdrop-blur-xl rounded-[2.9rem] p-10 md:p-14 grid lg:grid-cols-3 gap-12 border border-white/5">
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Shadow Kernel Status</h4>
            <div className="flex items-center gap-4">
              <div className="text-6xl font-bold text-white font-heading">{neuralDensity}%</div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Neural Density</div>
                <div className="text-[9px] text-slate-500 font-mono italic">{shardCount} / 50 Shards Etched</div>
              </div>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${neuralDensity}%` }}></div>
            </div>
          </div>

          <div className="space-y-6 border-l border-slate-800/50 pl-12 lg:border-x lg:px-12 border-slate-800/50">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Nexus Conductivity</h4>
            <div className="flex items-center gap-4">
              <div className="text-6xl font-bold text-white font-heading">{nexusCount}</div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Active Nodes</div>
                <div className="text-[9px] text-slate-500 font-mono italic">{nexusCount} / 3 Connections</div>
              </div>
            </div>
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`h-1.5 flex-grow rounded-full ${i < nexusCount ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-900'}`}></div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Immediate Next Step</h4>
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                {neuralDensity < 100 ? 'Harden the Kernel' : nexusCount < 3 ? 'Sync Professional Mesh' : 'Begin Deep Handshake'}
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-mono uppercase tracking-widest">
                {neuralDensity < 100 
                  ? `Provide ${50 - shardCount} more Memory Shards via the Vocal Probe to reach High Fidelity.` 
                  : nexusCount < 3 
                  ? 'Connect LinkedIn or Drive in the Nexus to grounding your professional persona.' 
                  : 'System ready. Enter Chat mode for live autonomous deployment.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lifelong Goals */}
      <div className="grid md:grid-cols-3 gap-8 px-4">
        {missionGoals.map((goal, i) => (
          <div key={i} className={`relative p-10 bg-slate-950 border ${goal.border} rounded-[3rem] shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <div className="text-8xl font-black font-heading text-white select-none">{i + 1}</div>
            </div>
            <div className={`mb-8 ${goal.color}`}>{goal.icon}</div>
            <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-4 font-heading">{goal.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-mono">{goal.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArchitectureView;
