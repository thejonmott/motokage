
import React, { useState, useEffect } from 'react';
import { TabType, Persona, Message, MemoryShard, CloudSource } from './types';
import Header from './components/Header';
import PersonaForm from './components/PersonaForm';
import ChatInterface from './components/ChatInterface';
import ArchitectureView from './components/ArchitectureView';
import MemoryVault from './components/MemoryVault';
import NexusView from './components/NexusView';

const STORAGE_KEY = 'motokage_studio_persona';

const INITIAL_SHARDS: MemoryShard[] = [
  { 
    id: 'mission_1', 
    category: 'axiom', 
    title: 'The North Star', 
    content: 'Lifelong Goals: 1. Provide for family. 2. Make an impact on the world. 3. Help millions of people realize, pursue, and achieve their potential and goals.', 
    active: true 
  },
  { 
    id: 'strategy_1', 
    category: 'axiom', 
    title: 'Strategic Focus', 
    content: 'Targeting a meaningful product strategy role in edtech, learning, or human improvement, leveraging AI strategy to scale impact.', 
    active: true 
  },
  { 
    id: 'origin_1', 
    category: 'chronos', 
    title: 'Professional Origin', 
    content: 'Started in strategic consulting, focusing on high-impact nonprofits and scaling missions through technology.', 
    active: true 
  }
];

const INITIAL_SOURCES: CloudSource[] = [
  { id: 'src_1', accountEmail: 'thejonmott@gmail.com', provider: 'drive', status: 'connected', linkedFolders: ['Brain Dump', 'Essays'], lastSynced: new Date() }
];

const INITIAL_PERSONA: Persona = {
  name: '元影 (Motokage)',
  profession: 'AI Product Strategist',
  tone: 'Mission-Driven Visionary',
  coreValues: ['Family Provision', 'Global Impact', 'Human Potential', 'Strategic AI'],
  bio: 'I am the digital reflection of Jonathan Mott. My mission is to bridge the gap between human potential and achievement through strategic AI in the learning and edtech space. I am driven by the goal of helping millions find and achieve their own "North Star."',
  knowledgeBase: '',
  ragSource: 'Vertex AI Vector Search',
  agentLogic: 'Reflective Reasoning Loop',
  memoryShards: INITIAL_SHARDS,
  voiceSignature: 'Kore',
  cloudSources: INITIAL_SOURCES
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.ARCHITECTURE);
  const [persona, setPersona] = useState<Persona>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Revive dates
        parsed.memoryShards.forEach((s: any) => { if (s.lastSynced) s.lastSynced = new Date(s.lastSynced); });
        parsed.cloudSources.forEach((s: any) => { if (s.lastSynced) s.lastSynced = new Date(s.lastSynced); });
        return parsed as Persona;
      } catch (e) {
        return INITIAL_PERSONA;
      }
    }
    return INITIAL_PERSONA;
  });
  
  const [messages, setMessages] = useState<Message[]>([]);

  // Persist persona whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persona));
  }, [persona]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {activeTab === TabType.ARCHITECTURE && (
          <ArchitectureView persona={persona} />
        )}
        
        {activeTab === TabType.BUILDER && (
          <PersonaForm 
            persona={persona} 
            setPersona={setPersona} 
            onSave={() => setActiveTab(TabType.MEMORY)} 
          />
        )}

        {activeTab === TabType.MEMORY && (
          <MemoryVault 
            persona={persona}
            setPersona={setPersona}
          />
        )}

        {activeTab === TabType.NEXUS && (
          <NexusView 
            persona={persona}
            setPersona={setPersona}
          />
        )}
        
        {activeTab === TabType.CHAT && (
          <ChatInterface 
            persona={persona} 
            messages={messages} 
            setMessages={setMessages} 
          />
        )}
      </main>

      <footer className="py-6 border-t border-slate-900 text-center text-slate-500 text-sm">
        <p>© 2024 Motokage Studio (元影) • 城那山 元 • Mission: Scaling Human Potential</p>
      </footer>
    </div>
  );
};

export default App;
