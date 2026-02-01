import React, { useState } from 'react';
import { TabType, AccessLevel } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  accessLevel: AccessLevel;
  setAccessLevel: (level: AccessLevel) => void;
}

const Icons = {
  Architecture: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/><path d="M10 6.5h4"/><path d="M10 17.5h4"/><path d="M6.5 10v4"/><path d="M17.5 10v4"/></svg>
  ),
  Origin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M2 12h20"/><path d="M12 2a10 10 0 1 0 10 10"/><path d="m16 16-4-4"/></svg>
  ),
  Mosaic: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
  ),
  DNA: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 8 8 8"/><path d="m16 8-8 8"/><path d="M9 12h6"/><path d="M12 9v6"/><circle cx="12" cy="12" r="10"/></svg>
  ),
  Mandates: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2-1 9h2l-1-9z"/><path d="M12 22v-9"/><path d="m20 7-9 5 9 5"/><path d="m4 7 9 5-9 5"/></svg>
  ),
  Self: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>
  ),
  Dashboard: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
  )
};

const TabConfig = {
  [TabType.STRATEGY]: { label: 'Architecture', icon: <Icons.Architecture /> },
  [TabType.ORIGIN]: { label: 'Origin Story', icon: <Icons.Origin /> },
  [TabType.MOSAIC]: { label: 'Mosaic', icon: <Icons.Mosaic /> },
  [TabType.DNA]: { label: 'DNA', icon: <Icons.DNA /> },
  [TabType.MANDATES]: { label: 'Mandates', icon: <Icons.Mandates /> },
  [TabType.SELF]: { label: 'The Self (BETA)', icon: <Icons.Self /> },
  [TabType.DASHBOARD]: { label: 'Studio Dashboard', icon: <Icons.Dashboard /> },
};

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, accessLevel, setAccessLevel }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [pass, setPass] = useState('');
  
  // Robust detection of environment variables.
  // We use a safe fallback mechanism to prevent runtime TypeError during boot.
  const getAppEnv = (): string => {
    try {
      const meta = import.meta as any;
      if (typeof meta !== 'undefined' && meta.env && meta.env.VITE_APP_ENV) {
        return meta.env.VITE_APP_ENV;
      }
    } catch (e) {
      // Return 'production' if import.meta.env is inaccessible
    }
    return 'production';
  };

  const appEnv = getAppEnv();
  const publicTabs = [TabType.STRATEGY, TabType.ORIGIN, TabType.MOSAIC, TabType.SELF];
  const coreTabs = [TabType.DNA, TabType.MANDATES, TabType.DASHBOARD];

  const currentTabs = accessLevel === 'CORE' ? [...publicTabs, ...coreTabs] : publicTabs;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === 'shadow_mesh_alpha') {
      setAccessLevel('CORE');
      setShowLogin(false);
      setPass('');
    } else {
      alert('INVALID ACCESS KEY');
    }
  };

  return (
    <header className={`sticky top-0 z-50 border-b px-8 py-4 transition-all duration-500 ${accessLevel === 'CORE' ? 'bg-slate-900 border-purple-500/20' : 'bg-slate-950/80 backdrop-blur-xl border-slate-900'}`}>
      <div className="container mx-auto flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg transition-all ${accessLevel === 'CORE' ? 'bg-purple-600 shadow-purple-500/20 rotate-3' : 'bg-indigo-600 shadow-indigo-500/20'}`}>影</div>
          <div>
            <div className="flex items-center gap-3">
              <div className="font-heading font-bold text-lg text-white tracking-tight">
                {accessLevel === 'CORE' ? (
                  <span>Motokage <span className="text-purple-400 italic font-light">Studio</span></span>
                ) : (
                  <span>MOTOKAGE <span className="text-slate-500 font-light mx-1">|</span> <span className="text-indigo-400">Jon Mott's Digital Twin <span className="text-[10px] text-slate-500 align-top ml-1">BETA</span></span></span>
                )}
              </div>
              {appEnv === 'staging' && (
                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[8px] font-bold uppercase tracking-widest rounded">Calibration</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-1 h-1 rounded-full animate-pulse ${accessLevel === 'CORE' ? 'bg-purple-500' : 'bg-indigo-500'}`}></span>
              <span className="text-[7px] font-mono text-slate-500 tracking-widest uppercase">{accessLevel} SYSTEM ACTIVE • {appEnv.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
          {currentTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2.5
                ${activeTab === tab ? (accessLevel === 'CORE' ? 'bg-purple-600/20 text-white shadow-lg border border-purple-500/30' : 'bg-slate-800 text-white shadow-lg') : 'text-slate-500 hover:text-slate-300'}`}
            >
              <span className={`${activeTab === tab ? (accessLevel === 'CORE' ? 'text-purple-400' : 'text-indigo-400') : 'text-slate-500'}`}>
                {TabConfig[tab].icon}
              </span>
              <span className="hidden md:inline">{TabConfig[tab].label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={() => accessLevel === 'CORE' ? setAccessLevel('AMBASSADOR') : setShowLogin(true)}
          className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all
            ${accessLevel === 'CORE' ? 'border-purple-500 text-purple-400 bg-purple-500/10' : 'border-slate-800 text-slate-500 bg-slate-900'}`}
        >
          {accessLevel === 'CORE' ? 'Exit Studio' : 'Studio Login'}
        </button>
      </div>

      {showLogin && (
        <div className="absolute top-24 right-8 w-72 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl z-[100] animate-in slide-in-from-top-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Identity Handshake</div>
            <input 
              type="password" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
              autoFocus
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
              placeholder="ENTER PASSCODE"
            />
            <button type="submit" className="w-full bg-indigo-600 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500 transition-colors">Verify</button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;