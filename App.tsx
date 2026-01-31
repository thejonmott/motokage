
import React, { useState, useEffect } from 'react';
import { TabType, Persona, Message, MemoryShard, CloudSource, AccessLevel } from './types';
import Header from './components/Header';
import PersonaForm from './components/PersonaForm';
import ChatInterface from './components/ChatInterface';
import ArchitectureView from './components/ArchitectureView';
import MemoryVault from './components/MemoryVault';
import NexusView from './components/NexusView';
import StagingView from './components/StagingView';

const STORAGE_KEY = 'motokage_studio_persona';

const INITIAL_SHARDS: MemoryShard[] = [
  { 
    id: 'meta_1', 
    category: 'axiom', 
    title: 'System Architecture', 
    content: 'Motokage v7.2 is architected using a recursive alignment framework. It utilizes Gemini Code Assistant for development, Google Project Mariner for agentic sensory ingestion, and MCP (Model Context Protocol) for tool interoperability.', 
    active: true,
    sensitivity: 'PUBLIC'
  },
  { 
    id: 'mission_1', 
    category: 'axiom', 
    title: 'The North Star', 
    content: 'Lifelong Goals: 1. Provide for family. 2. Make an impact on the world. 3. Help millions of people realize, pursue, and achieve their potential and goals.', 
    active: true,
    sensitivity: 'PUBLIC'
  },
  { 
    id: 'private_1', 
    category: 'axiom', 
    title: 'Personal Vulnerability', 
    content: 'Reflective thought on scaling human potential: I often worry that technology outpaces our ability to remain human. My twin must counteract this by centering empathy.', 
    active: true,
    sensitivity: 'PRIVATE'
  }
];

const INITIAL_PERSONA: Persona = {
  name: '元影 (Motokage)',
  profession: 'AI Product Strategist',
  tone: 'Mission-Driven Visionary',
  coreValues: ['Family Provision', 'Global Impact', 'Human Potential', 'Strategic AI'],
  bio: 'Motokage is a high-fidelity digital twin of Jonathan Mott, architected to scale his strategic judgment and professional expertise.',
  knowledgeBase: '',
  ragSource: 'Vertex AI Vector Search',
  agentLogic: 'Reflective Reasoning Loop',
  memoryShards: INITIAL_SHARDS,
  voiceSignature: 'Kore',
  cloudSources: [],
  targetComplexity: 50,
  neuralCoreType: 'local',
  vectorEnabled: false,
  accessLevel: 'AMBASSADOR'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.ARCHITECTURE);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('AMBASSADOR');
  
  // SESSION ISOLATION: Separate buffers for Core and Ambassador conversations
  const [coreMessages, setCoreMessages] = useState<Message[]>([]);
  const [ambassadorMessages, setAmbassadorMessages] = useState<Message[]>([]);

  const [persona, setPersona] = useState<Persona>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed as Persona;
      } catch (e) {
        return INITIAL_PERSONA;
      }
    }
    return INITIAL_PERSONA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persona));
  }, [persona]);

  // Handle visual shifts and session purging
  const handleLevelChange = (newLevel: AccessLevel) => {
    if (newLevel === 'AMBASSADOR' && accessLevel === 'CORE') {
      // PURGE PROTOCOL: When locking the enclave, wipe the private message buffer
      // This ensures no sensitive data remains in the "cache" (local state)
      setCoreMessages([]);
      console.log("ENCLAVE PURGE: Private session data destroyed.");
    }
    setAccessLevel(newLevel);
  };

  const currentMessages = accessLevel === 'CORE' ? coreMessages : ambassadorMessages;
  const setCurrentMessages = accessLevel === 'CORE' ? setCoreMessages : setAmbassadorMessages;

  const themeStyles = accessLevel === 'CORE' 
    ? 'bg-slate-950 text-slate-100 selection:bg-purple-500/30' 
    : 'bg-slate-950 text-slate-100 selection:bg-cyan-500/30';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-700 ${themeStyles}`}>
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSimulationMode={isSimulationMode}
        setIsSimulationMode={setIsSimulationMode}
        accessLevel={accessLevel}
        setAccessLevel={handleLevelChange}
      />
      
      <main className={`flex-grow transition-all duration-700 ${isSimulationMode ? 'flex items-center justify-center p-4' : 'container mx-auto px-4 py-8 max-w-7xl'}`}>
        {/*
          CRITICAL SECURITY: We use `key={accessLevel}` on components.
          When accessLevel changes, React will UNMOUNT the old component and MOUNT a new one.
          This instantly clears all internal component state (input fields, local logs, etc).
        */}
        <div key={`${accessLevel}-${activeTab}`} className="w-full h-full">
          {activeTab === TabType.ARCHITECTURE && <ArchitectureView persona={persona} />}
          {activeTab === TabType.BUILDER && <PersonaForm persona={persona} setPersona={setPersona} onSave={() => setActiveTab(TabType.MEMORY)} />}
          {activeTab === TabType.MEMORY && <MemoryVault persona={persona} setPersona={setPersona} accessLevel={accessLevel} />}
          {activeTab === TabType.NEXUS && <NexusView persona={persona} setPersona={setPersona} />}
          {activeTab === TabType.CHAT && <ChatInterface persona={persona} setPersona={setPersona} messages={currentMessages} setMessages={setCurrentMessages} accessLevel={accessLevel} />}
          {activeTab === TabType.STAGING && <StagingView persona={persona} setPersona={setPersona} accessLevel={accessLevel} />}
        </div>
      </main>

      {!isSimulationMode && (
        <footer className="py-8 border-t border-slate-900 text-center text-slate-500 text-sm">
          <p>© 2026 Motokage Studio (元影) • {accessLevel === 'CORE' ? 'ENCRYPTED SESSION' : 'AMBASSADOR MODE'}</p>
        </footer>
      )}
    </div>
  );
};

export default App;
