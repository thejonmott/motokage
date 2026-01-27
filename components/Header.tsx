
import React from 'react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const NavIcons = {
  [TabType.ARCHITECTURE]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 21H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 21V7L12 3L19 7V21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="8" y="7" width="2" height="2" rx="0.5" fill="currentColor" fillOpacity="0.2"/>
      <rect x="14" y="7" width="2" height="2" rx="0.5" fill="currentColor" fillOpacity="0.2"/>
    </svg>
  ),
  [TabType.BUILDER]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L12 22M2 12L22 12" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
      <path d="M12 4C12 4 19 8 19 12C19 16 12 20 12 20C12 20 5 16 5 12C5 8 12 4 12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  ),
  [TabType.MEMORY]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  ),
  [TabType.NEXUS]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4.93 4.93L8.46 8.46M15.54 15.54L19.07 19.07" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  [TabType.CHAT]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 9H16M8 13H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M21 12C21 16.9706 16.9706 21 12 21C10.2443 21 8.61483 20.496 7.23438 19.6267L3 21L4.37333 16.7656C3.50401 15.3852 3 13.7557 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: TabType.ARCHITECTURE, label: 'Strategy' },
    { id: TabType.BUILDER, label: 'DNA' },
    { id: TabType.MEMORY, label: 'Memory' },
    { id: TabType.NEXUS, label: 'Nexus' },
    { id: TabType.CHAT, label: 'Chat' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <span className="text-xl font-bold text-white relative z-10 font-heading">影</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold font-heading tracking-tight text-white leading-tight">
              Motokage <span className="text-indigo-400 font-light italic">Studio</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[8px] text-slate-500 font-mono tracking-widest uppercase">Vault Synced</span>
            </div>
          </div>
        </div>

        <nav className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-900 overflow-x-auto no-scrollbar max-w-full shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-5 py-2.5 rounded-xl transition-all flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-slate-800' 
                  : 'text-slate-600 hover:text-slate-300'}
              `}
            >
              <span className={activeTab === tab.id ? 'text-indigo-400' : 'text-slate-700'}>
                {NavIcons[tab.id]}
              </span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
