
import React, { useState } from 'react';
import { TabType, AccessLevel } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isSimulationMode: boolean;
  setIsSimulationMode: (val: boolean) => void;
  accessLevel: AccessLevel;
  setAccessLevel: (level: AccessLevel) => void;
}

const NavIcons = {
  [TabType.ARCHITECTURE]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21H21M5 21V7L12 3L19 7V21M9 21V12H15V21" /></svg>
  ),
  [TabType.BUILDER]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L12 22M2 12L22 12" strokeDasharray="2 2"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>
  ),
  [TabType.MEMORY]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7V12L15 15"/></svg>
  ),
  [TabType.NEXUS]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 2V7M12 17V22M2 12H7M17 12H22"/></svg>
  ),
  [TabType.CHAT]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12C21 16.9706 16.9706 21 12 21C10.2443 21 8.61483 20.496 7.23438 19.6267L3 21L4.37333 16.7656C3.50401 15.3852 3 13.7557 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/></svg>
  ),
  [TabType.STAGING]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 20L4 12L10 4M14 4L20 12L14 20M8 12H16" strokeDasharray="3 3"/></svg>
  )
};

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isSimulationMode, setIsSimulationMode, accessLevel, setAccessLevel }) => {
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  const [dnaKey, setDnaKey] = useState('');

  const tabs = [
    { id: TabType.ARCHITECTURE, label: 'Strategy' },
    { id: TabType.BUILDER, label: 'DNA' },
    { id: TabType.MEMORY, label: 'Memory' },
    { id: TabType.NEXUS, label: 'Nexus' },
    { id: TabType.CHAT, label: 'Sync Lab' },
    { id: TabType.STAGING, label: 'Staging' },
  ];

  const handleLevelToggle = () => {
    if (accessLevel === 'AMBASSADOR') {
      setShowKeyPrompt(true);
    } else {
      setAccessLevel('AMBASSADOR');
    }
  };

  const unlockCore = (e: React.FormEvent) => {
    e.preventDefault();
    if (dnaKey === 'shadow_mesh_alpha') { // Demo key
      setAccessLevel('CORE');
      setShowKeyPrompt(false);
      setDnaKey('');
    } else {
      alert('INVALID DNA KEY');
    }
  };

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4 transition-all duration-500 ${accessLevel === 'CORE' ? 'bg-purple-950/20 border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.1)]' : 'bg-slate-950/80 border-slate-900'}`}>
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 border rounded-xl flex items-center justify-center shadow-2xl relative group overflow-hidden transition-all ${accessLevel === 'CORE' ? 'bg-purple-900/40 border-purple-500/50 rotate-12' : 'bg-slate-900 border-slate-800'}`}>
            <span className={`text-xl font-bold font-heading ${accessLevel === 'CORE' ? 'text-purple-400' : 'text-white'}`}>影</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold font-heading tracking-tight text-white leading-tight">
              Motokage <span className={`${accessLevel === 'CORE' ? 'text-purple-400' : 'text-indigo-400'} font-light italic`}>Studio</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${accessLevel === 'CORE' ? 'bg-purple-500' : 'bg-indigo-500'}`}></span>
              <span className="text-[8px] text-slate-500 font-mono tracking-widest uppercase">
                {accessLevel === 'CORE' ? 'ENCLAVE CORE_V7_SYNC' : 'IDENTITY MESH ONLINE'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex bg-slate-950 p-1 rounded-2xl border border-slate-900 shadow-inner overflow-x-auto no-scrollbar max-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-xl border border-slate-800' 
                  : 'text-slate-600 hover:text-slate-300'}`}
            >
              <span className={activeTab === tab.id ? (accessLevel === 'CORE' ? 'text-purple-400' : 'text-indigo-400') : 'text-slate-700'}>
                {NavIcons[tab.id]}
              </span>
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 bg-slate-950/50 p-1 rounded-xl border border-slate-900">
           {/* Access Level Toggle */}
           <button 
             onClick={handleLevelToggle}
             className={`px-3 py-2 rounded-lg text-[8px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 ${accessLevel === 'CORE' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
           >
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
             {accessLevel}
           </button>

           <button 
             onClick={() => setIsSimulationMode(!isSimulationMode)}
             className={`p-2.5 rounded-lg border bg-slate-900 border-slate-800 text-slate-600 hover:text-white transition-all`}
           >
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
           </button>
        </div>
      </div>

      {showKeyPrompt && (
        <div className="absolute top-20 right-6 w-80 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl animate-in slide-in-from-top-4">
           <form onSubmit={unlockCore} className="space-y-4">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Enter DNA Key</h4>
              <input 
                type="password" 
                value={dnaKey}
                onChange={(e) => setDnaKey(e.target.value)}
                autoFocus
                placeholder="Identity Passcode..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500 transition-all"
              />
              <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-xl">Unlock Enclave</button>
              <button type="button" onClick={() => setShowKeyPrompt(false)} className="w-full text-[8px] text-slate-600 uppercase tracking-widest">Cancel</button>
           </form>
        </div>
      )}
    </header>
  );
};

export default Header;
