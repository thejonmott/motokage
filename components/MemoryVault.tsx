
import React, { useState, useRef, useEffect } from 'react';
import { Persona, MemoryShard, MemoryCategory, AccessLevel } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface MemoryVaultProps {
  persona: Persona;
  setPersona: (p: Persona) => void;
  accessLevel: AccessLevel;
}

// ... helper functions (encode, decode, decodeAudioData) remain same ...
function encode(bytes: Uint8Array) { let binary = ''; const len = bytes.byteLength; for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); } return btoa(binary); }
function decode(base64: string) { const binaryString = atob(base64); const len = binaryString.length; const bytes = new Uint8Array(len); for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); } return bytes; }
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> { const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2); const frameCount = dataInt16.length / numChannels; const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate); for (let channel = 0; channel < numChannels; channel++) { const channelData = buffer.getChannelData(channel); for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; } } return buffer; }

const AxiomIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" /></svg>);
const ChronosIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7V12L15 15" /></svg>);
const EchoIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2V15H6L11 19V5Z" /></svg>);
const EthosIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></svg>);
const LogosIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h4" /></svg>);

const MemoryVault: React.FC<MemoryVaultProps> = ({ persona, setPersona, accessLevel }) => {
  const [probeMessages, setProbeMessages] = useState<any[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [pendingFile, setPendingFile] = useState<{file: File, base64: string, type: string} | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isAuditActive, setIsAuditActive] = useState(false);
  const [isIngestMode, setIsIngestMode] = useState(false);
  const [ingestContent, setIngestContent] = useState('');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  // Filter shards based on access level
  const filteredShards = persona.memoryShards.filter(shard => 
    accessLevel === 'CORE' || shard.sensitivity === 'PUBLIC'
  );

  const categories: Record<MemoryCategory, { label: string, color: string, bg: string, icon: React.ReactNode }> = {
    axiom: { label: 'Axiom', color: accessLevel === 'CORE' ? 'text-purple-400' : 'text-indigo-400', bg: accessLevel === 'CORE' ? 'bg-purple-500/10' : 'bg-indigo-500/10', icon: <AxiomIcon /> },
    chronos: { label: 'Chronos', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: <ChronosIcon /> },
    echo: { label: 'Echo', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <EchoIcon /> },
    logos: { label: 'Logos', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <LogosIcon /> },
    ethos: { label: 'Ethos', color: 'text-rose-400', bg: 'bg-rose-500/10', icon: <EthosIcon /> }
  };

  const cleanupAudio = () => {
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
    sourcesRef.current.forEach(source => { try { source.stop(); } catch (e) {} });
    sourcesRef.current.clear();
    if (inputCtxRef.current) { inputCtxRef.current.close(); inputCtxRef.current = null; }
    if (outputCtxRef.current) { outputCtxRef.current.close(); outputCtxRef.current = null; }
    setIsVoiceActive(false);
  };

  const executeSynthesis = async (content: string) => {
    setIsSynthesizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this content to extract NEW Identity Shards. 
      SENSITIVITY: ${accessLevel === 'CORE' ? 'PRIVATE (High Confidentiality)' : 'PUBLIC (Market Ready)'}
      LOG: ${content}
      Return JSON: { "newShards": [{"title": "string", "category": "axiom|chronos|etc", "content": "string", "sensitivity": "${accessLevel === 'CORE' ? 'PRIVATE' : 'PUBLIC'}"}], "suggestedBioUpdate": "string" }`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt, config: { responseMimeType: 'application/json' } });
      const result = JSON.parse(response.text || '{}');
      if (result.newShards) {
        const mapped = result.newShards.map((s: any) => ({ ...s, id: `shard_${Date.now()}_${Math.random()}`, active: true, lastSynced: new Date() }));
        setPersona({ ...persona, memoryShards: [...mapped, ...persona.memoryShards], bio: result.suggestedBioUpdate || persona.bio });
      }
      setIngestContent(''); setIsIngestMode(false);
    } catch (e) { console.error(e); } finally { setIsSynthesizing(false); }
  };

  const handleTextSend = async () => {
    if ((!textInput.trim() && !pendingFile) || isAiThinking) return;
    const userText = textInput; const attachment = pendingFile;
    setTextInput(''); setPendingFile(null);
    setProbeMessages(prev => [...prev, { role: 'user', text: userText || `Artifact: ${attachment?.file.name}` }]);
    setIsAiThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-pro-preview', 
        contents: `SUBJECT: Jonathan Mott. ACCESS_LEVEL: ${accessLevel}. USER: ${userText}`,
        config: { systemInstruction: `You are the Socratic Interrogator. Mode: ${accessLevel}. Access to Private DNA: ${accessLevel === 'CORE'}` } 
      });
      setProbeMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (err) { console.error(err); } finally { setIsAiThinking(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-end px-4">
        <div className="space-y-1">
          <h2 className={`text-4xl font-bold font-heading mb-2 transition-colors ${accessLevel === 'CORE' ? 'text-purple-400' : 'text-indigo-500'}`}>
            {accessLevel === 'CORE' ? 'Enclave' : 'Memory'} <span className="text-white font-light italic">Vault</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest ${accessLevel === 'CORE' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
              {accessLevel === 'CORE' ? 'Full Access' : 'Public Safe'}
            </span>
          </div>
        </div>
        <button onClick={() => setIsIngestMode(!isIngestMode)} className={`px-6 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all ${accessLevel === 'CORE' ? 'border-purple-500/50 text-purple-400' : 'border-slate-800 text-slate-500'}`}>
           Refine DNA
        </button>
      </div>

      <div className={`flex flex-col bg-slate-900 border rounded-[2.5rem] shadow-2xl h-[700px] overflow-hidden relative transition-all duration-500 ${accessLevel === 'CORE' ? 'border-purple-500/30' : 'border-slate-800'}`}>
        {isAuditActive ? (
          <div className="flex flex-col h-full animate-in zoom-in-95">
             {/* Audit implementation... */}
             <div className="p-20 text-center opacity-30">DNA Audit Pipeline Initializing...</div>
          </div>
        ) : isIngestMode ? (
          <div className="flex flex-col h-full p-12 space-y-8 animate-in zoom-in-95">
             <div className="space-y-2">
                 <h3 className="text-sm font-bold text-white uppercase tracking-widest">DNA Refinement</h3>
                 <p className="text-[10px] text-slate-500 font-mono uppercase">Target Sensitivity: {accessLevel}</p>
             </div>
             <textarea 
               value={ingestContent}
               onChange={(e) => setIngestContent(e.target.value)}
               placeholder="Enter raw thoughts or artifacts for synthesis..."
               className="flex-grow bg-slate-950 border border-slate-800 rounded-3xl p-8 text-xs font-mono text-indigo-300 outline-none resize-none"
             />
             <button onClick={() => executeSynthesis(ingestContent)} disabled={isSynthesizing || !ingestContent.trim()} className={`${accessLevel === 'CORE' ? 'bg-purple-600' : 'bg-indigo-600'} text-white py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-2xl transition-all`}>
               {isSynthesizing ? 'Updating Memory Kernel...' : 'Synchronize Identity'}
             </button>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-12 space-y-12">
            <div className="relative">
              <div className={`w-28 h-28 border rounded-[2.5rem] flex items-center justify-center text-4xl shadow-2xl transition-all ${accessLevel === 'CORE' ? 'bg-purple-900/20 border-purple-500/50' : 'bg-slate-950 border-slate-800'}`}>
                {accessLevel === 'CORE' ? '🔒' : '🏛️'}
              </div>
              {accessLevel === 'CORE' && <div className="absolute -inset-8 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>}
            </div>
            <div className="max-w-sm space-y-6">
              <h4 className="text-xl font-bold uppercase tracking-widest text-white font-heading">Identity Audit Protocol</h4>
              <p className="text-xs text-slate-500 uppercase tracking-widest leading-relaxed">
                {accessLevel === 'CORE' ? 'You are in the secure Enclave. Full DNA transparency active.' : 'Public Enclave active. Access to private Axioms restricted.'}
              </p>
              <button onClick={() => setIsAuditActive(true)} className={`${accessLevel === 'CORE' ? 'bg-purple-600' : 'bg-white text-slate-950'} px-12 py-5 rounded-[2rem] font-bold uppercase text-[10px] tracking-[0.3em] transition-all`}>
                Initialize {accessLevel} Audit
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-16 border-t border-slate-900">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.4em]">Active Shards</span>
          <div className="flex-grow h-px bg-slate-900"></div>
          <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{filteredShards.length} SHARDS ETCHED</span>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredShards.map(shard => (
            <div key={shard.id} className={`p-8 bg-slate-950 border rounded-[2.5rem] hover:border-indigo-500/30 transition-all group shadow-xl relative overflow-hidden flex flex-col ${shard.sensitivity === 'PRIVATE' ? 'border-purple-900/40 bg-purple-950/5' : 'border-slate-900'}`}>
              {shard.sensitivity === 'PRIVATE' && (
                <div className="absolute top-4 right-6 text-[7px] font-bold text-purple-400 uppercase tracking-widest">PRIVATE</div>
              )}
              <div className="flex items-center gap-3 mb-6">
                <span className={`${categories[shard.category]?.color} p-2 ${categories[shard.category]?.bg} rounded-xl`}>{categories[shard.category]?.icon}</span>
                <span className={`text-[9px] font-bold uppercase tracking-[0.3em] ${categories[shard.category]?.color}`}>{shard.category}</span>
              </div>
              <h5 className="text-white text-[11px] font-bold mb-3 uppercase tracking-tight line-clamp-1">{shard.title}</h5>
              <p className="text-[10px] text-slate-500 leading-[1.8] font-mono line-clamp-4 uppercase tracking-wider flex-grow">{shard.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemoryVault;
