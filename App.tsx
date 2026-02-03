
import React, { useState, useEffect, useRef } from 'react';
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
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

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

// --- AUDIO UTILITIES ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.STRATEGY);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('AMBASSADOR');
  const [hasKey, setHasKey] = useState<boolean>(false);
  
  const [persona, setPersona] = useState<Persona>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_PERSONA, ...parsed };
      } catch (e) {
        return INITIAL_PERSONA;
      }
    }
    return INITIAL_PERSONA;
  });

  const [messages, setMessages] = useState<Message[]>([]);

  // Neural Link (Option 1) states
  const [isNeuralActive, setIsNeuralActive] = useState(false);
  const neuralSessionRef = useRef<any>(null);
  const neuralSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const neuralAudioCtxRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);

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
      console.error(err);
    }
  };

  const handleResetKey = () => {
    handleOpenKeyPicker();
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persona));
  }, [persona]);

  const handleLevelChange = (newLevel: AccessLevel) => {
    if (newLevel === 'AMBASSADOR') setActiveTab(TabType.STRATEGY);
    setAccessLevel(newLevel);
  };

  // Option 1: Neural Link Toggle
  const toggleNeuralLink = async () => {
    if (isNeuralActive) {
      if (neuralSessionRef.current) neuralSessionRef.current.close();
      setIsNeuralActive(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      neuralAudioCtxRef.current = { input: inputCtx, output: outputCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const audioBuffer = await decodeAudioData(decode(msg.serverContent.modelTurn.parts[0].inlineData.data), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.start();
              neuralSourcesRef.current.add(source);
            }
            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                if (fc.name === 'update_life_ledger') {
                  const args = fc.args as any;
                  const fact: OriginFact = {
                    id: `live_${Date.now()}`,
                    date: args.date,
                    event: args.event,
                    details: args.details || '',
                    impact: args.impact || 5,
                    category: 'MILESTONE',
                    significance: 'Neural Sync Calibration'
                  };
                  setPersona(prev => ({ 
                    ...prev, 
                    originFacts: [...prev.originFacts, fact].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  }));
                  sessionPromise.then(s => s.sendToolResponse({ 
                    functionResponses: { id: fc.id, name: fc.name, response: { result: "Memory etched to Life Ledger." } } 
                  }));
                }
              }
            }
          },
          onclose: () => setIsNeuralActive(false),
          onerror: (e) => console.error(e)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{
            functionDeclarations: [{
              name: 'update_life_ledger',
              parameters: {
                type: 'OBJECT',
                properties: {
                  date: { type: 'STRING' },
                  event: { type: 'STRING' },
                  details: { type: 'STRING' },
                  impact: { type: 'NUMBER' }
                },
                required: ['date', 'event']
              }
            }]
          }],
          systemInstruction: `You are Motokage's Neural Link. You listen and help the user maintain their digital identity. If the user shares a significant story or memory, use the 'update_life_ledger' tool to etch it permanently into the Life Ledger.`
        }
      });

      neuralSessionRef.current = await sessionPromise;
      setIsNeuralActive(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 relative">
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
          {activeTab === TabType.SELF && <ChatInterface persona={persona} setPersona={setPersona} messages={messages} setMessages={setMessages} accessLevel={accessLevel} hasKey={hasKey} onConnectKey={handleOpenKeyPicker} onResetKey={handleResetKey} />}
          {activeTab === TabType.DASHBOARD && <DashboardView persona={persona} setPersona={setPersona} accessLevel={accessLevel} />}
        </div>
      </main>

      {/* Floating Neural Link Orb */}
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
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400 group-hover:text-white transition-colors"><path d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            )}
          </button>
          <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-purple-500/30 px-4 py-2 rounded-xl text-[9px] font-bold text-purple-400 uppercase tracking-widest whitespace-nowrap">
            {isNeuralActive ? 'Neural Link Operational' : 'Initiate Neural Sync'}
          </div>
        </div>
      )}

      <footer className="py-12 border-t border-slate-900 text-center text-slate-600 text-[9px] font-mono uppercase tracking-[0.3em]">
        © 2026 Motokage • Live Identity v15.9.2-GOLD • {accessLevel} MODE
      </footer>
    </div>
  );
};

export default App;
