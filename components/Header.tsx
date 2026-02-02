
import React, { useState, useEffect } from 'react';
import { TabType, AccessLevel } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  accessLevel: AccessLevel;
  setAccessLevel: (level: AccessLevel) => void;
  hasKey: boolean;
}

const Icons = {
  Architecture: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/><path d="M10 6.5h4"/><path d="M10 17.5h4"/><path d="M6.5 10v4"/><path d="M17.5 10v4"/></svg>
  ),
  Documentation: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
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
  ),
  Biometric: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
  )
};

const TabConfig = {
  [TabType.STRATEGY]: { label: 'Architecture', icon: <Icons.Architecture /> },
  [TabType.DOCUMENTATION]: { label: 'The Recipe', icon: <Icons.Documentation /> },
  [TabType.ORIGIN]: { label: 'Origin Story', icon: <Icons.Origin /> },
  [TabType.MOSAIC]: { label: 'Mosaic', icon: <Icons.Mosaic /> },
  [TabType.DNA]: { label: 'DNA', icon: <Icons.DNA /> },
  [TabType.MANDATES]: { label: 'Mandates', icon: <Icons.Mandates /> },
  [TabType.SELF]: { label: "Chat with Twin", icon: <Icons.Self /> },
  [TabType.DASHBOARD]: { label: 'Dashboard', icon: <Icons.Dashboard /> },
};

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, accessLevel, setAccessLevel, hasKey }) => {
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hwStatus, setHwStatus] = useState<'IDLE' | 'DETECTED' | 'UNAVAILABLE'>('IDLE');
  
  useEffect(() => {
    // Check for WebAuthn capability (Biometric detection)
    if (window.PublicKeyCredential) {
      setHwStatus('DETECTED');
    } else {
      setHwStatus('UNAVAILABLE');
    }
  }, []);

  const handleBiometricHandshake = async () => {
    setIsVerifying(true);
    try {
      // Simulation of a realistic hardware biometric prompt duration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAccessLevel('CORE');
      setShowAuthOverlay(false);
    } catch (err) {
      console.error("Biometric Handshake Failed:", err);
      alert("IDENTITY REJECTED: Hardware verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  const publicTabs = [TabType.STRATEGY, TabType.DOCUMENTATION, TabType.SELF];
  const coreTabs = [TabType.DNA, TabType.MANDATES, TabType.MOSAIC, TabType.ORIGIN, TabType.DASHBOARD];
  const currentTabs = accessLevel === 'CORE' ? [...publicTabs, ...coreTabs] : publicTabs;

  return (
    <header className={`sticky top-0 z-50 border-b px-8 py-4 transition-all duration-500 ${accessLevel === 'CORE' ? 'bg-slate-900 border-purple-500/20' : 'bg-slate-950/80 backdrop-blur-xl border-slate-900'}`}>
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 shrink-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg transition-all ${accessLevel === 'CORE' ? 'bg-purple-600 shadow-purple-500/20 rotate-3' : 'bg-indigo-600 shadow-indigo-500/20'}`}>影</div>
          <div className="text-left">
            <div className="flex items-center gap-3">
              <div className="font-heading font-bold text-lg text-white tracking-tight">
                {accessLevel === 'CORE' ? (
                  <span>Motokage <span className="text-purple-400 italic font-light">Studio</span></span>
                ) : (
                  <span>MOTOKAGE <span className="text-slate-500 font-light mx-1">|</span> <span className="text-indigo-400">Digital Twin</span></span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className={`w-1 h-1 rounded-full animate-pulse ${hasKey ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                <span className="text-[7px] font-mono text-slate-500 tracking-widest uppercase">Uplink: {hasKey ? 'NOMINAL' : 'OFFLINE'}</span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
                 <span className={`w-1 h-1 rounded-full ${hwStatus === 'DETECTED' ? 'bg-cyan-500' : 'bg-slate-700'}`}></span>
                 <span className="text-[7px] font-mono text-slate-600 tracking-widest uppercase">HW_BRIDGE: {hwStatus}</span>
              </div>
            </div>
          </div>
        </div>

        <nav className={`flex items-center gap-1 bg-slate-900/50 p-1 rounded-2xl border border-slate-800 transition-all ${accessLevel === 'CORE' ? 'flex-wrap justify-center max-w-2xl' : 'flex-nowrap'}`}>
          {currentTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2.5
                ${activeTab === tab ? (accessLevel === 'CORE' ? 'bg-purple-600/20 text-white border border-purple-500/30' : 'bg-slate-800 text-white shadow-lg') : 'text-slate-500 hover:text-slate-300'}`}
            >
              <span className={`${activeTab === tab ? (accessLevel === 'CORE' ? 'text-purple-400' : 'text-indigo-400') : 'text-slate-500'}`}>
                {TabConfig[tab].icon}
              </span>
              <span className="hidden md:inline text-[8px] whitespace-nowrap">{TabConfig[tab].label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={() => accessLevel === 'CORE' ? setAccessLevel('AMBASSADOR') : setShowAuthOverlay(true)}
          className={`px-6 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all shrink-0 flex items-center gap-3
            ${accessLevel === 'CORE' ? 'border-purple-500 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20' : 'border-slate-800 text-slate-500 bg-slate-900 hover:border-indigo-500/50 hover:text-slate-300'}`}
        >
          {accessLevel === 'CORE' ? (
            <>
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
               Lock Studio
            </>
          ) : (
            <>
              <Icons.Biometric />
              Studio Handshake
            </>
          )}
        </button>
      </div>

      {showAuthOverlay && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl z-[100] flex items-center justify-center animate-in fade-in duration-500 p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] shadow-[0_0_100px_rgba(79,70,229,0.1)] text-center space-y-10 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-1000 ${isVerifying ? 'bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 bg-[length:200%_100%] animate-[gradient_2s_linear_infinite]' : 'bg-slate-800'}`}></div>
            
            <div className="space-y-4">
              <div className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center transition-all duration-700 ${isVerifying ? 'bg-indigo-600 animate-pulse scale-110 shadow-[0_0_40px_rgba(79,70,229,0.4)]' : 'bg-slate-950 border border-slate-800 text-slate-500'}`}>
                {isVerifying ? (
                  <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : <Icons.Biometric />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-[0.2em] font-heading">Biometric Perimeter</h3>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-2">Hardware-Backed Identity Handshake Required</p>
              </div>
            </div>

            <div className="space-y-4">
               <button 
                 onClick={handleBiometricHandshake}
                 disabled={isVerifying}
                 className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-4 group"
               >
                 {isVerifying ? 'SENSING HARDWARE...' : 'Initiate Neural Sync'}
                 {!isVerifying && <span className="group-hover:translate-x-1 transition-transform">→</span>}
               </button>
               <button 
                 onClick={() => setShowAuthOverlay(false)}
                 disabled={isVerifying}
                 className="w-full bg-transparent text-slate-700 hover:text-slate-500 py-3 text-[8px] font-bold uppercase tracking-widest transition-all"
               >
                 Cancel Authentication
               </button>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <div className="flex justify-center gap-6 opacity-30">
                 <div className="text-[7px] font-mono text-slate-400 uppercase">WEBAUTHN_L2</div>
                 <div className="text-[7px] font-mono text-slate-400 uppercase">FIDO2_SYNC</div>
                 <div className="text-[7px] font-mono text-slate-400 uppercase">GCP_IAP</div>
              </div>
              <p className="text-[8px] text-slate-600 font-mono uppercase leading-relaxed mt-4">
                Uplinking to secure hardware bridge...
              </p>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </header>
  );
};

export default Header;
