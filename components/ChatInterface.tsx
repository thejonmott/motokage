import React, { useState, useRef, useEffect } from 'react';
import { Persona, Message, AccessLevel, MemoryShard } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface ChatInterfaceProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  accessLevel: AccessLevel;
}

function encode(bytes: Uint8Array) { let binary = ''; const len = bytes.byteLength; for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); } return btoa(binary); }
function decode(base64: string) { const binaryString = atob(base64); const len = binaryString.length; const bytes = new Uint8Array(len); for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); } return bytes; }
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> { const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2); const frameCount = dataInt16.length / numChannels; const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate); for (let channel = 0; channel < numChannels; channel++) { const channelData = buffer.getChannelData(channel); for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; } } return buffer; }

const WaveIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    <path d="M2 12C2 12 5 2 12 2C19 2 22 12 22 12" strokeDasharray="2 2" />
    <path d="M2 12C2 12 5 22 12 22C19 22 22 12 22 12" />
    <circle cx="12" cy="12" r="3" className="animate-pulse" />
  </svg>
);

const ChatInterface: React.FC<ChatInterfaceProps> = ({ persona, setPersona, messages, setMessages, accessLevel }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [syncFidelity, setSyncFidelity] = useState(accessLevel === 'CORE' ? 88 : 72);
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotionDraft, setPromotionDraft] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  useEffect(() => {
    return () => cleanupAudio();
  }, []);

  const cleanupAudio = () => {
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
    sourcesRef.current.forEach(source => { try { source.stop(); } catch (e) {} });
    sourcesRef.current.clear();
    if (inputCtxRef.current) { inputCtxRef.current.close().catch(() => {}); inputCtxRef.current = null; }
    if (outputCtxRef.current) { outputCtxRef.current.close().catch(() => {}); outputCtxRef.current = null; }
    setIsVoiceActive(false);
  };

  const getSystemInstruction = () => {
    const base = `You are Motokage (元影), the digital twin of Jonathan Mott.
    CORE IDENTITY: ${persona.bio}
    ENCLAVE MODE: ${accessLevel}.
    ${accessLevel === 'CORE' 
      ? "ACCESS: UNRESTRICTED. You are his private co-intelligence. Use all memory shards. Be raw, Socratic, and intimate."
      : "ACCESS: RESTRICTED. You are his public Ambassador. Only use PUBLIC memory shards. Be professional and protective."}`;
    return base;
  };

  const toggleVoice = async () => {
    if (isVoiceActive) { cleanupAudio(); return; }
    try {
      setIsVoiceActive(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputCtxRef.current = outCtx; inputCtxRef.current = inCtx;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inCtx.createMediaStreamSource(stream);
            const processor = inCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) { int16[i] = inputData[i] * 32768; }
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(processor); processor.connect(inCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'model' && last.timestamp.getTime() > Date.now() - 5000) {
                  const updated: Message = { ...last, text: (last.text || '') + text };
                  return [...prev.slice(0, -1), updated];
                }
                const newMessage: Message = { role: 'model', text, timestamp: new Date() };
                return [...prev, newMessage];
              });
            }
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const buf = await decodeAudioData(decode(audioData), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buf; source.connect(outCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buf.duration;
              sourcesRef.current.add(source);
            }
          },
          onerror: cleanupAudio, onclose: cleanupAudio
        },
        config: { 
          responseModalalities: [Modality.AUDIO], 
          outputAudioTranscription: {}, 
          systemInstruction: getSystemInstruction(),
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: persona.voiceSignature || 'Kore' } } }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) { cleanupAudio(); }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const history = messages.slice(-10).map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [...history, { role: 'user', parts: [{ text: currentInput }] }],
        config: {
          systemInstruction: getSystemInstruction(),
          tools: accessLevel === 'AMBASSADOR' ? [{ googleSearch: {} }] : [],
        }
      });

      const modelResponse: Message = { role: 'model', text: response.text || "Synchronicity error.", timestamp: new Date() };
      setMessages(prev => [...prev, modelResponse]);
      setSyncFidelity(prev => Math.min(99, prev + 1));
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const startPromotion = async (content: string) => {
    setIsPromoting(true);
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `SCRUBBING PROTOCOL: Take the following PRIVATE insight and rewrite it as a PUBLIC-SAFE strategic axiom for an Ambassador twin. Remove all PII and sensitive context while retaining the core wisdom.
      CONTENT: ${content}`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setPromotionDraft(response.text || '');
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const confirmPromotion = () => {
    const newShard: MemoryShard = {
      id: `pub_${Date.now()}`,
      category: 'echo',
      title: 'Sync Lab Insight',
      content: promotionDraft,
      active: true,
      sensitivity: 'PUBLIC',
      lastSynced: new Date()
    };
    setPersona(prev => ({ ...prev, memoryShards: [newShard, ...prev.memoryShards] }));
    setIsPromoting(false);
    setPromotionDraft('');
    alert("Promoted to Public DNA.");
  };

  const accentColor = accessLevel === 'CORE' ? 'purple' : 'indigo';

  return (
    <div className={`flex flex-col h-[80vh] max-w-7xl mx-auto bg-slate-950 rounded-[3.5rem] border overflow-hidden shadow-2xl relative transition-all duration-500 ${accessLevel === 'CORE' ? 'border-purple-500/30' : 'border-indigo-500/20'}`}>
      <div className="flex flex-grow overflow-hidden">
        <div className="w-80 bg-slate-900/50 border-r border-slate-800 p-10 flex flex-col space-y-10 hidden lg:flex shrink-0">
          <div className="space-y-6">
             <h3 className={`text-[10px] font-bold text-${accentColor}-400 uppercase tracking-[0.4em]`}>Enclave Pulse</h3>
             <div className={`p-8 bg-slate-950 border rounded-[3rem] text-center space-y-4 shadow-inner ${accessLevel === 'CORE' ? 'border-purple-500/20' : 'border-indigo-500/20'}`}>
               <div className={`text-5xl font-bold font-heading text-white`}>{syncFidelity}%</div>
               <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                 <div className={`h-full transition-all duration-1000 bg-${accentColor}-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]`} style={{ width: `${syncFidelity}%` }}></div>
               </div>
               <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Context Alignment</p>
             </div>
          </div>
          <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
             <h4 className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-3">Session Status</h4>
             <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${accessLevel === 'CORE' ? 'bg-purple-500' : 'bg-cyan-500'} animate-pulse`}></div>
                <span className="text-[10px] text-slate-400 font-mono">{accessLevel === 'CORE' ? 'EPHEMERAL CORE' : 'PERSISTENT PROXY'}</span>
             </div>
          </div>
        </div>

        <div className="flex-grow flex flex-col relative bg-slate-950/40 min-w-0">
          {isPromoting && (
            <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-12">
               <div className="max-w-xl w-full bg-slate-900 border border-indigo-500/30 rounded-[3rem] p-10 space-y-8 animate-in zoom-in-95">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Promotion Agent</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest leading-relaxed">Scrubbing private context for public ambassador distribution...</p>
                  </div>
                  <div className="p-8 bg-slate-950 border border-slate-800 rounded-2xl">
                     <textarea value={promotionDraft} onChange={e => setPromotionDraft(e.target.value)} className="w-full h-40 bg-transparent text-xs font-mono text-indigo-300 outline-none resize-none leading-relaxed" />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={confirmPromotion} className="flex-grow py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">Etch to Public DNA</button>
                    <button onClick={() => setIsPromoting(false)} className="px-8 py-4 bg-slate-800 text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest">Cancel</button>
                  </div>
               </div>
            </div>
          )}

          <div className="bg-slate-900/50 backdrop-blur-xl px-12 py-8 flex items-center justify-between border-b border-slate-800 shrink-0 z-10">
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-[1.5rem] bg-slate-950 border flex items-center justify-center text-3xl font-bold shadow-xl transition-all ${accessLevel === 'CORE' ? 'border-purple-500/30 text-purple-400' : 'border-indigo-500/20 text-indigo-400'}`}>影</div>
              <div>
                <div className="text-lg font-bold text-white tracking-[0.1em] uppercase">Sync <span className={`text-${accentColor}-500 font-light italic`}>Lab</span></div>
                <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-1">Status: {accessLevel === 'CORE' ? 'SECURE_CHANNEL' : 'PUBLIC_PROXY'}</div>
              </div>
            </div>
            <button onClick={toggleVoice} className={`px-10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all flex items-center gap-3 ${isVoiceActive ? 'bg-red-500 text-white shadow-xl' : `bg-${accentColor}-600 text-white shadow-2xl hover:bg-${accentColor}-700`}`}>
              {isVoiceActive ? 'Stop Link' : 'Voice Pulse'}
              <WaveIcon color="white" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-12 space-y-12 no-scrollbar">
            {messages.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                  <div className="text-5xl">📡</div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.5em]">{accessLevel === 'CORE' ? 'Secure Session Ready' : 'Ambassador Active'}</p>
               </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}>
                  <div className={`max-w-[80%] rounded-[2.5rem] px-10 py-8 text-[15px] leading-[1.7] border shadow-2xl relative group ${msg.role === 'user' ? (accessLevel === 'CORE' ? 'bg-purple-600 border-purple-500' : 'bg-indigo-600 border-indigo-500') : 'bg-slate-900 border-slate-800 text-slate-200'}`}>
                    {msg.text}
                    {msg.role === 'model' && accessLevel === 'CORE' && (
                      <button onClick={() => startPromotion(msg.text)} className="absolute -bottom-10 left-4 opacity-0 group-hover:opacity-100 transition-all text-[8px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5V19M5 12H19" /></svg>
                        Promote to Public
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && <div className="text-center text-[10px] font-mono text-slate-600 animate-pulse tracking-widest uppercase">Aligning Core...</div>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-12 bg-slate-950 border-t border-slate-900">
            <div className="flex gap-6 max-w-5xl mx-auto">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={accessLevel === 'CORE' ? "Sync private thoughts..." : "Public inquiry..."} className="flex-grow bg-slate-900 border border-slate-800 rounded-[2rem] px-10 py-6 text-sm text-white outline-none focus:border-indigo-500/50 shadow-inner" />
              <button disabled={isLoading || !input.trim()} className={`px-14 rounded-[2rem] font-bold text-[10px] uppercase tracking-[0.3em] shadow-2xl transition-all ${accessLevel === 'CORE' ? 'bg-purple-600' : 'bg-indigo-600'} text-white`}>
                {isLoading ? 'SYNC' : 'SEND'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;