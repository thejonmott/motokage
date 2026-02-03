
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

const STORAGE_KEY = 'motokage_studio_v2_live';

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
      date: 'January 1, 2020', 
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
    music: ['Massive Attack', 'Brian Eno', 'Max Richter'],
    authors: [],
    movies: [],
    foods: [],
    philosophy: ['Stay hungry, stay foolish'],
    other: []
  },
  accessLevel: 'AMBASSADOR'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.STRATEGY);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('AMBASSADOR');
  const [hasKey, setHasKey] = useState<boolean>(false);
  
  const [persona, setPersona] = useState<Persona>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // --- DNA MIGRATION LAYER ---
        const migrated = { ...INITIAL_PERSONA, ...parsed };
        
        // Deep merge interests to prevent missing new keys
        migrated.interests = { 
          ...INITIAL_PERSONA.interests, 
          ...(parsed.interests || {}),
          authors: parsed.interests?.authors || [],
          movies: parsed.interests?.movies || [],
          foods: parsed.interests?.foods || [],
          philosophy: parsed.interests?.philosophy || []
        };
        
        migrated.originFacts = parsed.originFacts || INITIAL_PERSONA.originFacts;
        migrated.relationships = parsed.relationships || [];
        migrated.mandates = parsed.mandates || INITIAL_PERSONA.mandates;
        
        return migrated;
      } catch (e) {
        console.warn("DNA Corruption detected, reverting to template safely.");
        return INITIAL_PERSONA;
      }
    }
    return INITIAL_PERSONA;
  });

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const checkKeyStatus = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true);
      }
    };
    checkKeyStatus();
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
    handleOpenKeyPicker();
  };

  // Persist Live DNA only when it changes
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
        © 2026 Motokage • Live Identity v15.9.2-GOLD • {accessLevel} MODE
      </footer>
    </div>
  );
};

export default App;
