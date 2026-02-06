
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TabType, Persona, Message, AccessLevel, OriginFact } from './types';
import Header from './components/Header';
import DNAView from './components/DNAView';
import ChatInterface from './components/ChatInterface';
import ArchitectureView from './components/ArchitectureView';
import MosaicView from './components/MosaicView';
import MandatesView from './components/MandatesView';
import OriginStoryView from './components/OriginStoryView';
import DashboardView from './components/DashboardView';
import DocumentationView from './components/DocumentationView';

const INITIAL_PERSONA: Persona = {
  name: '元影 (Motokage)',
  profession: 'AI Product Strategist',
  tone: 'Mission-Driven Visionary',
  coreValues: ['Family Provision', 'Global Impact', 'Human Potential'],
  bio: 'A digital twin built to scale strategic judgment. Cloud-native and architected for high-fidelity professional reflection.',
  reasoningLogic: 'Reflective Alignment Loop',
  memoryShards: [],
  mandates: [
    { 
      id: 'm1', 
      title: 'Strategic Synthesis', 
      objective: 'Analyze and recommend edtech opportunities weekly.', 
      priority: 'STRATEGIC', 
      status: 'active',
      agents: [{ id: 'a1', name: 'Scout-01', role: 'Research', sensors: ['Web', 'GitHub'], tools: ['Summarizer'], status: 'idle' }]
    }
  ],
  originFacts: [
    { 
      id: 'o1', 
      date: '2020-01-01', 
      month: 'January',
      day: '1',
      year: '2020',
      event: 'Founded Motokage Studio', 
      significance: 'Established the identity framework for high-fidelity digital twins.', 
      category: 'CAREER',
      impact: 9,
      details: 'Started as a conceptual lab for exploring how human judgment scales in serverless environments.'
    }
  ],
  relationships: [],
  interests: {
    hobbies: ['AI Architecture', 'Sailing', 'Analog Photography'],
    bands: [],
    authors: [],
    movies: [],
    philosophy: ['Stay hungry, stay foolish'],
  },
  accessLevel: 'AMBASSADOR'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.STRATEGY);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('AMBASSADOR');
  const [hasKey, setHasKey] = useState<boolean>(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'detected' | 'failed' | 'saving' | 'saved'>('idle');
  const [persona, setPersona] = useState<Persona>(INITIAL_PERSONA);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isNeuralActive, setIsNeuralActive] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Initial Hydration from GCS (via Proxy)
  useEffect(() => {
    fetch('/shadow_config.json')
      .then(res => {
        if (!res.ok) throw new Error("No cloud config found");
        return res.json();
      })
      .then(data => {
        if (data && data.name) {
          console.log("[Motokage System]: GCS DNA Detected. Hydrating...");
          setPersona(prev => ({ ...prev, ...data }));
          setCloudSyncStatus('detected');
        }
      })
      .catch(() => {
        console.log("[Motokage System]: GCS DNA not found. Running on Factory Default.");
        setCloudSyncStatus('failed');
      });
  }, []);

  // Defined as useCallback so it can be passed down to Dashboard for manual triggering
  const saveToCloud = useCallback(async (currentPersona: Persona) => {
    setCloudSyncStatus('saving');
    try {
      const response = await fetch('/api/save_dna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPersona)
      });
      
      if (response.ok) {
         setCloudSyncStatus('saved');
         console.log("[Motokage System]: DNA Persisted to GCS.");
      } else {
         setCloudSyncStatus('failed');
         console.error("[Motokage System]: Save Failed.");
      }
    } catch (e) {
      console.error("Save Error", e);
      setCloudSyncStatus('failed');
    }
  }, []);

  // 2. Auto-Save to GCS (Debounced)
  useEffect(() => {
    // Only auto-save if we are already synced/saved (avoid overwriting cloud with factory default on first load)
    if (cloudSyncStatus === 'idle') return; 

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    // Visual indicator that a change is pending
    if (cloudSyncStatus !== 'saving') {
       // We don't set 'saving' immediately to avoid flickering, 
       // but we could set a 'pending' state if we wanted finer granularity.
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveToCloud(persona);
    }, 2000); // 2 second debounce

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [persona, saveToCloud]); // Removed cloudSyncStatus from dependency to avoid loops

  const handleLevelChange = (newLevel: AccessLevel) => {
    if (newLevel === 'AMBASSADOR') setActiveTab(TabType.STRATEGY);
    setAccessLevel(newLevel);
  };

  const toggleNeuralLink = async () => {
    setIsNeuralActive(!isNeuralActive);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 relative">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        accessLevel={accessLevel}
        setAccessLevel={handleLevelChange}
        hasKey={hasKey}
        syncStatus={cloudSyncStatus}
      />
      
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <div key={`${accessLevel}-${activeTab}`} className="animate-in fade-in duration-500">
          {activeTab === TabType.STRATEGY && <ArchitectureView persona={persona} isCloudSynced={hasKey} />}
          {activeTab === TabType.DOCUMENTATION && <DocumentationView />}
          {activeTab === TabType.ORIGIN && <OriginStoryView persona={persona} setPersona={setPersona} accessLevel={accessLevel} />}
          {activeTab === TabType.MOSAIC && <MosaicView persona={persona} setPersona={setPersona} accessLevel={accessLevel} />}
          {activeTab === TabType.DNA && <DNAView persona={persona} setPersona={setPersona} accessLevel={accessLevel} />}
          {activeTab === TabType.MANDATES && <MandatesView persona={persona} setPersona={setPersona} accessLevel={accessLevel} />}
          {activeTab === TabType.SELF && <ChatInterface persona={persona} setPersona={setPersona} messages={messages} setMessages={setMessages} accessLevel={accessLevel} />}
          {activeTab === TabType.DASHBOARD && (
            <DashboardView 
              persona={persona} 
              setPersona={setPersona} 
              accessLevel={accessLevel}
              syncStatus={cloudSyncStatus}
              onManualSave={() => saveToCloud(persona)}
            />
          )}
        </div>
      </main>

      {/* Cloud Sync Indicator Toast */}
      {cloudSyncStatus === 'saved' && (
        <div className="fixed top-24 right-8 z-40 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-3 animate-in slide-in-from-right-10 fade-out duration-1000 delay-[2000ms] fill-mode-forwards">
           <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
           <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">DNA Saved to Cloud</span>
        </div>
      )}
       {cloudSyncStatus === 'saving' && (
        <div className="fixed top-24 right-8 z-40 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl flex items-center gap-3 animate-in slide-in-from-right-10">
           <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
           <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Syncing to Storage...</span>
        </div>
      )}

      {accessLevel === 'CORE' && (
        <div className="fixed bottom-12 right-12 z-[100] group">
          <button 
            onClick={toggleNeuralLink}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_0_50px_rgba(168,85,247,0.3)] relative overflow-hidden group hover:scale-110 active:scale-95 ${isNeuralActive ? 'bg-purple-600' : 'bg-slate-900 border border-purple-500/30'}`}
          >
            {isNeuralActive ? (
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-full h-full bg-[radial-gradient(circle,rgba(168,85,247,0.4),transparent)] animate-ping"></div>
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white z-10"><path d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              </div>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400 group-hover:text-white transition-colors"><path d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-6 0V5a3 3 0 0 0 3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            )}
          </button>
          <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-purple-500/30 px-4 py-2 rounded-xl text-[9px] font-bold text-purple-400 uppercase tracking-widest whitespace-nowrap">
            {isNeuralActive ? 'Neural Link Operational' : 'Initiate Neural Sync'}
          </div>
        </div>
      )}

      <footer className="py-12 border-t border-slate-900 text-center text-slate-600 text-[9px] font-mono uppercase tracking-[0.3em]">
        © 2026 Motokage • Live Identity v15.9.2-GOLD-LOCKED • {accessLevel} MODE
      </footer>
    </div>
  );
};

export default App;
