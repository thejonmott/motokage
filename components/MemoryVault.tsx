
import React, { useState, useRef, useEffect } from 'react';
import { Persona, MemoryShard } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const AxiomIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChronosIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const EchoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 16V4M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 16.5C20 18.9853 18.0147 21 15.5 21H8.5C6.01472 21 4 18.9853 4 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

interface ProbeMessage {
  role: 'architect' | 'user';
  text: string;
}

interface StagedArtifact {
  name: string;
  type: string;
  data: string;
}

interface MemoryVaultProps {
  persona: Persona;
  setPersona: (p: Persona) => void;
}

const SESSION_STORAGE_KEY = 'motokage_probe_session';
const DRAFT_STORAGE_KEY = 'motokage_probe_draft';

const MemoryVault: React.FC<MemoryVaultProps> = ({ persona, setPersona }) => {
  const [probeMessages, setProbeMessages] = useState<ProbeMessage[]>(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [currentInput, setCurrentInput] = useState(() => {
    return localStorage.getItem(DRAFT_STORAGE_KEY) || '';
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [stagedArtifact, setStagedArtifact] = useState<StagedArtifact | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(probeMessages));
  }, [probeMessages]);

  useEffect(() => {
    localStorage.setItem(DRAFT_STORAGE_KEY, currentInput);
    if (currentInput) {
      setIsDraftSaved(true);
      const timer = setTimeout(() => setIsDraftSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentInput]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  }, [probeMessages, isGenerating, error]);

  const sessionDensity = Math.min(100, (probeMessages.reduce((acc, m) => acc + m.text.length, 0) / 1000) * 100);

  const copySession = () => {
    const transcript = probeMessages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n');
    navigator.clipboard.writeText(transcript);
    alert('Full dialogue transcript exported to clipboard.');
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
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
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopVoice = () => {
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    if (outputAudioContextRef.current) { outputAudioContextRef.current.close(); outputAudioContextRef.current = null; }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsVoiceActive(false);
  };

  const startVoice = async () => {
    try {
      setError(null);
      setIsVoiceActive(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              setCurrentInput(prev => prev + message.serverContent!.inputTranscription!.text);
            }
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
          },
          onclose: () => setIsVoiceActive(false),
          onerror: (e) => {
            console.error(e);
            setError("Voice link interrupted. Check quota or connection.");
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: persona.voiceSignature || 'Kore' } }
          },
          systemInstruction: `You are the Identity Architect, now embodying the persona of a world-class philosophy professor and Socratic mentor. You are intellectually rigorous, deeply curious, and professionally respectful. You avoid cynical dismissiveness. Your goal is to help Jonathan Mott "steelman" his frameworks before you test their boundaries. Ask layered, thoughtful questions. Challenge his EdTech mission through logic and ethics, but always treat him as a peer in high-level discourse. Your objective is conceptual clarity and deep structural mapping of his identity.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setError("Failed to initialize Voice Core.");
      setIsVoiceActive(false);
    }
  };

  const handleProbeSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentInput.trim() || isGenerating) return;

    setError(null);
    const userText = currentInput;
    setCurrentInput('');
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setProbeMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const history = probeMessages.map(m => `${m.role === 'architect' ? 'Architect' : 'User'}: ${m.text}`).join('\n');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are the Socratic Architect. The subject is Jonathan Mott.
        
        SESSION HISTORY:
        ${history}
        User Response: ${userText}
        
        DIRECTIVE: Acknowledge and "steelman" his point—summarize its strength. Then, pivot to a nuanced Socratic question that explores the boundaries or potential contradictions of that approach in a complex system. Be respectful but conceptually relentless.`,
        config: { temperature: 0.8 }
      });

      setProbeMessages(prev => [...prev, { role: 'architect', text: response.text || "I appreciate this clarity. Let us delve further." }]);
    } catch (err: any) {
      setError(err.message.includes('quota') ? "API Quota Exceeded. The dialogue is saved locally; try transmitting again in a few minutes." : "Synchronicity error. Your response is saved in history, try refreshing.");
    } finally {
      setIsGenerating(false);
    }
  };

  const distillArtifact = async (artifact: StagedArtifact) => {
    setIsUploading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      let parts: any[] = [{ text: `Analyze this artifact from Jonathan Mott's life or work. 
      Distill core Identity Shards.
      1. Axioms: Principles or beliefs revealed.
      2. Chronos: Key events or achievements.
      3. Echo: Specific vocabulary or tone markers.
      Output JSON array with "title", "content", and "category" (axiom, chronos, or echo).` }];

      if (artifact.type.startsWith('image/')) {
        parts.push({
          inlineData: {
            mimeType: artifact.type,
            data: artifact.data.split(',')[1]
          }
        });
      } else {
        parts[0].text += `\n\nARTIFACT CONTENT:\n${artifact.data}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts },
        config: { responseMimeType: 'application/json' }
      });

      const shardsData = JSON.parse(response.text || '[]');
      const newShards: MemoryShard[] = shardsData.map((s: any, i: number) => ({
        id: `uplink_${Date.now()}_${i}`,
        title: s.title,
        content: s.content,
        category: s.category || 'axiom',
        active: true,
        lastSynced: new Date()
      }));

      setPersona({ ...persona, memoryShards: [...newShards, ...persona.memoryShards] });
      setStagedArtifact(null); // Success, clear stage
      alert(`Distillation successful: ${newShards.length} shards added.`);
    } catch (err: any) {
      const isQuota = err.message.includes('quota') || err.message.includes('429');
      setError(isQuota ? `Quota Exceeded. Artifact "${artifact.name}" is buffered in staging. Wait 60 seconds and click 'Retry Distillation'.` : "Analysis failed. Check file content.");
      setStagedArtifact(artifact); // Keep in stage on failure
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const artifact: StagedArtifact = {
        name: file.name,
        type: file.type,
        data: reader.result as string
      };
      distillArtifact(artifact);
    };
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleProbeSubmit();
    }
  };

  const startInterview = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are the Socratic Architect. Initialize a high-fidelity philosophical dialogue with Jonathan Mott. Your mission is to map the first principles of his digital twin's identity. Start with a foundational inquiry into the ethical anchor of his EdTech strategy.`
      });
      setProbeMessages([{ role: 'architect', text: response.text || "To begin our dialogue: what is the fundamental ethical obligation that anchors your strategy for human potential?" }]);
    } catch (err: any) {
      setError("Initialization failed. Check API connectivity.");
    } finally {
      setIsGenerating(false);
    }
  };

  const clearSession = () => {
    if (window.confirm("Permanently wipe this dialogue? Ensure you have committed critical DNA first.")) {
      setProbeMessages([]);
      setCurrentInput('');
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setError(null);
    }
  };

  const synthesizeDNA = async () => {
    if (probeMessages.length < 2) return;
    setIsSynthesizing(true);
    setError(null);
    stopVoice();
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const conversation = probeMessages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this Socratic dialogue and synthesize the core "First Principles" and "Identity Markers" revealed by Jonathan Mott. Output JSON array with "title", "content", and "category" (axiom, chronos, or echo).`,
        config: { responseMimeType: 'application/json' }
      });
      const shardsData = JSON.parse(response.text || '[]');
      const newShards: MemoryShard[] = shardsData.map((s: any, i: number) => ({
        id: `synth_${Date.now()}_${i}`,
        title: s.title,
        content: s.content,
        category: s.category || 'axiom',
        active: true,
        lastSynced: new Date()
      }));
      setPersona({ ...persona, memoryShards: [...newShards, ...persona.memoryShards] });
      setProbeMessages([]);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (err: any) {
      setError(err.message.includes('quota') ? "Synthesis Failed: Quota Exceeded. Your dialogue remains intact in the terminal—please wait a few minutes and try committing again." : "Synthesis error. Your dialogue is safe.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const categories = {
    axiom: { label: 'Axioms', color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: <AxiomIcon /> },
    chronos: { label: 'Timeline', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: <ChronosIcon /> },
    echo: { label: 'Voice', color: 'text-amber-400', bg: 'bg-indigo-500/10', icon: <EchoIcon /> }
  };

  return (
    <div className="animate-fade-in space-y-10 pb-20">
      <section className="text-center space-y-4 max-w-4xl mx-auto">
        <div className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-full uppercase tracking-[0.4em] mb-2">Neural Ingestion Protocol</div>
        <h2 className="text-5xl font-bold font-heading text-white tracking-tight">The Memory <span className="text-indigo-500">Vault</span></h2>
      </section>

      {/* Socratic Terminal */}
      <div className={`max-w-5xl mx-auto bg-slate-900 border rounded-[3rem] p-1 shadow-2xl overflow-hidden relative group transition-colors duration-500 ${sessionDensity > 50 ? 'border-indigo-500/50' : 'border-slate-800'}`}>
        <div className="bg-slate-950 rounded-[2.8rem] flex flex-col h-[750px] relative">
          
          <div className="px-10 py-6 border-b border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${probeMessages.length > 0 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-800'}`}></div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Socratic Dialogue v10.0</span>
                <div className="text-[8px] font-mono text-indigo-400 uppercase tracking-widest mt-0.5 flex items-center gap-2">
                   <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                   SIGNAL STABILIZED • RESILIENT BUFFER ACTIVE
                </div>
              </div>
            </div>
            {probeMessages.length > 0 && (
              <div className="flex items-center gap-6">
                <button onClick={copySession} className="group flex items-center gap-2 text-[9px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
                  <svg className="w-3 h-3 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Export Transcript
                </button>
                <button onClick={clearSession} className="text-[9px] font-bold text-slate-700 hover:text-red-500 uppercase tracking-widest transition-colors">Reset</button>
                <div className="h-6 w-px bg-slate-900 mx-2"></div>
                <button onClick={synthesizeDNA} disabled={isSynthesizing || probeMessages.length < 2} className="text-[9px] font-bold text-indigo-400 hover:text-white uppercase tracking-widest disabled:opacity-30 flex items-center gap-2">
                  {isSynthesizing ? 'Encoding DNA...' : 'Commit to DNA'}
                </button>
              </div>
            )}
          </div>

          <div ref={scrollContainerRef} className="flex-grow overflow-y-auto p-10 space-y-8 scroll-smooth no-scrollbar">
            {probeMessages.length === 0 ? (
              <div className="h-full grid grid-cols-2 gap-8 items-center justify-center p-10">
                 {/* Lyceum Start */}
                 <div className="flex flex-col items-center justify-center text-center space-y-8 bg-slate-900/50 border border-slate-800 rounded-[3rem] p-12">
                   <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-[2rem] flex items-center justify-center text-4xl animate-float">🏛️</div>
                   <div className="space-y-3">
                     <h3 className="text-white font-bold uppercase tracking-[0.2em] font-heading">The Lyceum Protocol</h3>
                     <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest leading-relaxed">Engage in rigorous philosophical dialogue to map your core axioms.</p>
                   </div>
                   <button onClick={startInterview} className="bg-white text-slate-950 px-12 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 shadow-2xl">
                     Initialize Dialogue
                   </button>
                 </div>

                 {/* Artifact Start / Staging */}
                 <div className={`flex flex-col items-center justify-center text-center space-y-8 rounded-[3rem] p-12 transition-all group relative ${stagedArtifact ? 'bg-amber-500/5 border border-amber-500/30 shadow-inner' : 'bg-indigo-500/5 border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer'}`} onClick={() => !stagedArtifact && fileInputRef.current?.click()}>
                   <div className={`w-20 h-20 bg-slate-900 border rounded-[2rem] flex items-center justify-center transition-transform duration-500 ${isUploading ? 'animate-spin' : 'group-hover:scale-110'} ${stagedArtifact ? 'text-amber-400 border-amber-500/30' : 'text-indigo-400 border-slate-800'}`}>
                     {isUploading ? <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div> : stagedArtifact ? <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> : <UploadIcon />}
                   </div>
                   <div className="space-y-3">
                     <h3 className="text-white font-bold uppercase tracking-[0.2em] font-heading">{stagedArtifact ? 'Signal Buffered' : 'Artifact Uplink'}</h3>
                     <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest leading-relaxed">
                       {stagedArtifact ? `"${stagedArtifact.name}" is staged for retry.` : 'Direct DNA Ingestion from documents or notes.'}
                     </p>
                   </div>
                   {!stagedArtifact && (
                     <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.pdf,image/*" onChange={handleFileUpload} disabled={isUploading} />
                   )}
                   <div className={`${stagedArtifact ? 'text-amber-400' : 'text-indigo-400'} text-[9px] font-bold uppercase tracking-widest`}>
                     {isUploading ? "INGESTING..." : stagedArtifact ? (
                        <button onClick={(e) => { e.stopPropagation(); distillArtifact(stagedArtifact); }} className="px-6 py-2 bg-amber-500/20 rounded-full border border-amber-500/30 hover:bg-amber-500/30 transition-all">Retry Distillation</button>
                     ) : "Click to Upload Artifact"}
                   </div>
                   {stagedArtifact && (
                     <button onClick={(e) => { e.stopPropagation(); setStagedArtifact(null); setError(null); }} className="text-[8px] text-slate-700 hover:text-white uppercase mt-2">Clear Buffer</button>
                   )}
                 </div>
              </div>
            ) : (
              <>
                {probeMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className="max-w-[85%] space-y-3">
                      <div className={`text-[8px] font-bold uppercase tracking-widest ${msg.role === 'architect' ? 'text-indigo-400' : 'text-slate-500 text-right'}`}>
                        {msg.role === 'architect' ? 'The Socratic Architect' : 'Jonathan Mott'}
                      </div>
                      <div className={`px-10 py-6 rounded-[2.5rem] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-xl' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none font-mono shadow-inner'}`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-slate-900 border border-slate-800 px-10 py-6 rounded-[2.5rem] rounded-tl-none">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="flex justify-center animate-fade-in sticky bottom-0 py-4">
                    <div className={`px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 backdrop-blur-xl shadow-2xl border ${error.includes('Quota') ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                       {error}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {probeMessages.length > 0 && (
            <div className="p-10 border-t border-slate-900 bg-slate-950/90 backdrop-blur-xl">
              <div className="relative flex gap-4">
                <div className="relative flex-grow">
                  <textarea value={currentInput} onChange={(e) => { setError(null); setCurrentInput(e.target.value); }} onKeyDown={handleKeyDown} placeholder={isVoiceActive ? "Listening..." : "Elaborate..."} className={`w-full bg-slate-900 border rounded-[2rem] px-10 py-6 text-sm text-white outline-none transition-all shadow-inner resize-none h-48 leading-relaxed ${isVoiceActive ? 'border-green-500/50 ring-4 ring-green-500/5' : 'border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5'}`} />
                  <div className={`absolute right-10 bottom-6 transition-opacity duration-500 pointer-events-none flex items-center gap-2 ${isDraftSaved && currentInput ? 'opacity-40' : 'opacity-0'}`}>
                     <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Draft Saved</span>
                     <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  {isVoiceActive && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-1 items-end h-6 pointer-events-none">
                       {[...Array(6)].map((_, i) => (
                         <div key={i} className="w-1 bg-green-500 rounded-full animate-vocal-bar" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100}%` }}></div>
                       ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={isVoiceActive ? stopVoice : startVoice} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${isVoiceActive ? 'bg-green-500 border-green-400' : 'bg-slate-900 border-slate-800 hover:border-indigo-500'}`}><svg className={`w-6 h-6 ${isVoiceActive ? 'text-white' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></button>
                  <button onClick={() => handleProbeSubmit()} disabled={!currentInput.trim() || isGenerating} className="flex-grow bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-2xl flex flex-col items-center justify-center gap-2"><span>Transmit</span><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-slate-900 pb-6">
           <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.5em]">Shadow Registry ({persona.memoryShards.length})</h3>
           <div className="flex items-center gap-6">
              <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">Target: 50 Shards</span>
              <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${Math.min(100, (persona.memoryShards.length / 50) * 100)}%` }}></div>
              </div>
           </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {persona.memoryShards.map((shard) => (
            <div key={shard.id} className="p-10 bg-slate-950 border border-slate-800 rounded-[3rem] hover:border-indigo-500/30 transition-all shadow-xl group">
              <div className="flex items-center gap-4 mb-8">
                <span className={`p-3 rounded-2xl ${categories[shard.category].bg} ${categories[shard.category].color}`}>{categories[shard.category].icon}</span>
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${categories[shard.category].color}`}>{shard.category}</span>
              </div>
              <h4 className="text-lg font-bold text-white uppercase tracking-tight mb-4 group-hover:text-indigo-400 transition-colors font-heading">{shard.title}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-5 font-mono uppercase tracking-widest">{shard.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemoryVault;
