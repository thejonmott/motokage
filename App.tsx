
import React, { useState, useEffect } from 'react';
import { TabType, Persona, Message, AccessLevel } from './types';
import Header from './components/Header';
import DNAView from './components/DNAView';
import ChatInterface from './components/ChatInterface';
import ArchitectureView from './components/ArchitectureView';
import MosaicView from './components/MosaicView';
import MandatesView from './components/MandatesView';
import OriginStoryView from './components/OriginStoryView';
import DashboardView from './components/DashboardView';
import DocumentationView from './components/DocumentationView';

const STORAGE_KEY = 'motokage_studio_v2';

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
    { id: 'o1', year: '2020', event: 'Founded Motokage Studio', significance: 'Established the identity framework.' }
  ],
  accessLevel: 'AMBASSADOR'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.STRATEGY);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('AMBASSADOR');
  // v15.8 - Optimistic default: Assume the environment variable is present or will be provided
  const [hasKey, setHasKey] = useState<boolean>(true);
  const [persona, setPersona] = useState<Persona>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PERSONA;
  });

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Check for key availability across different contexts
    const checkKeyStatus = async () => {
      let isKeyPresent = false;
      
      // 1. Check baked-in process.env (Vite build time)
      if (typeof process !== 'undefined' && process.env?.API_KEY) {
        isKeyPresent = true;
      }
      
      // 2. Check window.aistudio picker (Live environment)
      if (!isKeyPresent && window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        try {
          isKeyPresent = await window.aistudio.hasSelectedApiKey();
        } catch (e) {
          console.warn("aistudio check failed", e);
        }
      }

      // If we're in AMBASSADOR mode, we remain optimistic to avoid blocking UI
      if (accessLevel === 'AMBASSADOR') {
        setHasKey(true);
      } else {
        setHasKey(isKeyPresent);
      }
    };
    
    checkKeyStatus();
    const interval = setInterval(checkKeyStatus, 10000);
    return () => clearInterval(interval);
  }, [accessLevel]);

  const handleOpenKeyPicker = async () => {
    try {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        setHasKey(true);
      }
    } catch (err) {
      console.error("Manual key picker failed:", err);
    }
  };

  const handleResetKey = () => {
    setHasKey(false);
    handleOpenKeyPicker();
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persona));
  }, [persona]);

  const handleLevelChange = (newLevel: AccessLevel) => {
    if (newLevel === 'AMBASSADOR') setActiveTab(TabType.STRATEGY);
    setAccessLevel(newLevel);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        accessLevel={accessLevel}
        setAccessLevel={handleLevelChange}
        hasKey={hasKey}
      />
      
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <div key={`${accessLevel}-${activeTab}`} className="animate-in fade-in duration-500">
          {activeTab === TabType.STRATEGY && <ArchitectureView persona={persona} isCloudSynced={hasKey} />}
          {activeTab === TabType.DOCUMENTATION && <DocumentationView />}
          {activeTab === TabType.ORIGIN && <OriginStoryView persona={persona} setPersona={setPersona} accessLevel={accessLevel} />}
          {activeTab === TabType.MOSAIC && <MosaicView persona={persona} setPersona={setPersona} accessLevel={accessLevel} />}
          {activeTab === TabType.DNA && <DNAView persona={persona} setPersona={setPersona} accessLevel={accessLevel} />}
          {activeTab === TabType.MANDATES && <MandatesView persona={persona} setPersona={setPersona} accessLevel={accessLevel} />}
          
          {activeTab === TabType.SELF && (
            <ChatInterface 
              persona={persona} 
              setPersona={setPersona} 
              messages={messages} 
              setMessages={setMessages} 
              accessLevel={accessLevel}
              hasKey={hasKey}
              onConnectKey={handleOpenKeyPicker}
              onResetKey={handleResetKey}
            />
          )}

          {activeTab === TabType.DASHBOARD && <DashboardView persona={persona} setPersona={setPersona} accessLevel={accessLevel} />}
        </div>
      </main>

      <footer className="py-12 border-t border-slate-900 text-center text-slate-600 text-[9px] font-mono uppercase tracking-[0.3em]">
        © 2026 Motokage • Open Architecture v15.8.2-STABLE • {accessLevel} MODE
      </footer>
    </div>
  );
};

export default App;
