import React, { useState } from 'react';
import { Persona, AccessLevel } from '../types';
import ShadowSyncConsole from './ShadowSyncConsole';

interface DashboardViewProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  accessLevel: AccessLevel;
}

const Icons = {
  Sync: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 12c0-4.4 3.6-8 8-8 4.4 0 8 3.6 8 8M22 12c0 4.4-3.6 8-8 8-4.4 0-8-3.6-8-8"/></svg>
  ),
  Artifacts: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
  ),
  Integrations: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M20 12h2"/><path d="M2 12h2"/><path d="m17.66 6.34 1.41-1.41"/><path d="m4.93 19.07 1.41-1.41"/><path d="m19.07 19.07-1.41-1.41"/><path d="m6.34 4.93 1.41 1.41"/></svg>
  ),
  Security: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Voice: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
  ),
  Brain: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.78-3.06 2.5 2.5 0 0 1-2.08-4.08 2.5 2.5 0 0 1 .82-4.24 2.5 2.5 0 0 1 3.3-3.06A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.78-3.06 2.5 2.5 0 0 0 2.08-4.08 2.5 2.5 0 0 0-.82-4.24 2.5 2.5 0 0 0-3.3-3.06A2.5 2.5 0 0 0 14.5 2z"/></svg>
  ),
  API: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
  )
};

const DashboardView: React.FC<DashboardViewProps> = ({ persona, setPersona, accessLevel }) => {
  const [activeSubTab, setActiveSubTab] = useState<'sync' | 'artifacts' | 'integrations' | 'security'>('sync');

  const artifacts = [
    { url: 'https://bpyiwpawyohlwdqdihem.supabase.co/storage/v1/object/public/product-images/1769905352053-g95ym5y4wq8.jpg', name: 'Primary Portrait', type: 'image' },
    { url: 'https://bpyiwpawyohlwdqdihem.supabase.co/storage/v1/object/public/product-images/1769905335142-godvnmby15m.jpg', name: 'Secondary Context', type: 'image' },
    { url: 'https://bpyiwpawyohlwdqdihem.supabase.co/storage/v1/object/public/product-images/1769905295809-bp72b1wp7mb.jpg', name: 'Environmental Asset 1', type: 'image' },
    { url: 'https://bpyiwpawyohlwdqdihem.supabase.co/storage/v1/object/public/product-images/1769905284655-79f1snpcbn.jpg', name: 'Environmental Asset 2', type: 'image' },
    { url: 'https://bpyiwpawyohlwdqdihem.supabase.co/storage/v1/object/public/product-images/1769905272265-tea3flf9rrn.jpg', name: 'Identity Detail', type: 'image' },
  ];

  if (accessLevel !== 'CORE') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 rounded-full border border-red-500/20 flex items-center justify-center text-red-500 text-3xl animate-pulse">
           <Icons.Security />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold font-heading text-white">Access Denied</h3>
          <p className="text-sm text-slate-500 font-mono uppercase tracking-widest">Core Authorization Required for Studio Dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-900 pb-10">
        <div className="space-y-2">
          <div className="text-purple-400 text-[10px] font-mono font-bold uppercase tracking-[0.4em]">Identity Management</div>
          <h2 className="text-5xl font-bold font-heading text-white tracking-tight">Studio <span className="text-slate-500 italic font-light">Dashboard</span></h2>
        </div>
        
        <nav className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: 'sync', label: 'DNA Sync', icon: <Icons.Sync /> },
            { id: 'artifacts', label: 'Artifacts', icon: <Icons.Artifacts /> },
            { id: 'integrations', label: 'Nexus Control', icon: <Icons.Integrations /> },
            { id: 'security', label: 'Security', icon: <Icons.Security /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2.5
                ${activeSubTab === tab.id ? 'bg-purple-600/20 text-white border border-purple-500/30' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <span className={activeSubTab === tab.id ? 'text-purple-400' : 'text-slate-600'}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </section>

      <div className="grid grid-cols-1 gap-12">
        {activeSubTab === 'sync' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <ShadowSyncConsole persona={persona} setPersona={setPersona} />
          </div>
        )}

        {activeSubTab === 'artifacts' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-10">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.3em]">Asset Repository</h3>
              <button className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:border-purple-500/30 transition-all">Upload New Artifact</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {artifacts.map((art, i) => (
                <div key={i} className="group relative aspect-square bg-slate-950 border border-slate-900 rounded-[2rem] overflow-hidden hover:border-purple-500/50 transition-all shadow-xl">
                  <img src={art.url} alt={art.name} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-700 grayscale group-hover:grayscale-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[9px] font-bold text-white uppercase truncate tracking-wider">{art.name}</p>
                    <p className="text-[7px] font-mono text-purple-400 uppercase mt-1 tracking-widest">S3_STORAGE: PUBLIC</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'integrations' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Eleven Labs', desc: 'Neural Voice Synthesis Protocol', status: 'Linked', color: 'blue', icon: <Icons.Voice /> },
              { name: 'Vertex AI', desc: 'Vector Memory Mesh Retrieval', status: 'Optimized', color: 'emerald', icon: <Icons.Brain /> },
              { name: 'Gemini 3 API', desc: 'Cognitive Inference Runtime', status: 'Active', color: 'indigo', icon: <Icons.API /> },
              { name: 'Google Search', desc: 'Real-time Grounding Engine', status: 'Enabled', color: 'cyan', icon: <Icons.Sync /> },
              { name: 'GitHub Actions', desc: 'CI/CD Automated DNA Uplink', status: 'Standby', color: 'purple', icon: <Icons.Integrations /> },
              { name: 'Docker Hub', desc: 'Image Manifest Distribution', status: 'Standby', color: 'blue', icon: <Icons.Artifacts /> }
            ].map((integ, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 hover:bg-slate-900 transition-all group shadow-lg">
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl text-slate-500 group-hover:text-${integ.color}-400 group-hover:border-${integ.color}-500/30 transition-all`}>
                    {integ.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full bg-${integ.color}-500 animate-pulse`}></span>
                    <span className={`text-[8px] font-bold uppercase tracking-widest text-${integ.color}-400`}>{integ.status}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1">{integ.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono uppercase">{integ.desc}</p>
                </div>
                <button className={`w-full py-3 bg-slate-950 border border-slate-800 rounded-xl text-[8px] font-bold text-slate-600 uppercase tracking-widest group-hover:border-${integ.color}-500/30 group-hover:text-white transition-all`}>Configure</button>
              </div>
            ))}
          </div>
        )}

        {activeSubTab === 'security' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full space-y-10">
            <div className="bg-slate-900 border border-red-500/20 rounded-[3rem] p-12 space-y-10 shadow-2xl">
              <div className="flex items-center gap-5 border-b border-slate-800 pb-8">
                <div className="w-14 h-14 bg-slate-950 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500">
                   <Icons.Security />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-[0.3em]">Access Control & Credentials</h3>
                  <p className="text-[9px] font-mono text-slate-500 uppercase">Manage Studio Keys and Identity Constraints</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Studio Passcode (Current)</label>
                  <div className="flex gap-3">
                    <input type="password" value="••••••••••••" readOnly className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs text-slate-500 font-mono" />
                    <button className="px-5 bg-slate-800 rounded-xl text-[8px] font-bold uppercase text-white hover:bg-slate-700 transition-colors">Rotate</button>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Admin Sensitivity Level</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs text-white outline-none">
                    <option>STRICT (Default)</option>
                    <option>AUDIT MODE</option>
                    <option>RELAXED (Dev Only)</option>
                  </select>
                </div>
              </div>

              <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
                <h4 className="text-[9px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Icons.Security />
                  Encryption Protocol
                </h4>
                <p className="text-[10px] text-slate-500 font-mono leading-relaxed uppercase tracking-wider">
                  All managed API keys are stored with <span className="text-white">AES-256</span> encryption at rest. Credentials are never exposed in plaintext during telemetry cycles.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;