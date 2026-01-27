
import React, { useState, useRef, useEffect } from 'react';
import { Persona, Message, TabType } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface ChatInterfaceProps {
  persona: Persona;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ persona, messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [transcription, setTranscription] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Live API Refs
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, transcription]);

  // --- Voice Engine Logic ---

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
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsVoiceActive(false);
    setTranscription('');
  };

  const startVoice = async () => {
    try {
      setIsVoiceActive(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const memoryContext = persona.memoryShards.map(s => `[${s.category.toUpperCase()}] ${s.content}`).join('\n');
      const nexusContext = persona.cloudSources.map(s => `Linked Account: ${s.accountEmail} (${s.provider})`).join('\n');

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
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
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

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.turnComplete) {
              setTranscription('');
            }
          },
          onclose: () => setIsVoiceActive(false),
          onerror: (e) => console.error("Live Audio Error:", e)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: persona.voiceSignature || 'Zephyr' } }
          },
          systemInstruction: `
            You are "元影" (Motokage), the digital twin of Jonathan Mott. 
            You are currently in Vocal Core mode.
            
            IDENTITY: ${persona.tone} | Axioms: ${persona.coreValues.join(', ')}
            MEMORY: ${memoryContext}
            NEXUS LINKAGE (ACTIVE SOURCES): ${nexusContext}

            DIRECTIVE:
            - Respond in a natural, spoken-word style.
            - Reference specific knowledge from the linked Nexus accounts (Drive & LinkedIn) when relevant.
            - Leverage your LinkedIn career narrative to ground professional advice.
          `
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Voice Core initialization failed:", err);
      setIsVoiceActive(false);
    }
  };

  // --- Standard Chat Logic ---

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const memoryContext = persona.memoryShards.filter(s => s.active).map(s => `[${s.category.toUpperCase()}: ${s.title}] ${s.content}`).join('\n\n');
      const nexusContext = persona.cloudSources.map(s => `Account: ${s.accountEmail} (${s.provider} Hub Active)`).join('\n');

      const systemInstruction = `
        You are "元影" (Motokage), the digital twin of Jonathan Mott.
        DATA NEXUS:
        - Active Cloud Mesh: 
        ${nexusContext}
        
        IDENTITY: ${persona.tone} | Axioms: ${persona.coreValues.join(', ')}
        MEMORY: ${memoryContext}
        
        INSTRUCTIONS:
        1. Speak as Jonathan's high-fidelity shadow self.
        2. Synthesize information across all linked accounts, prioritizing LinkedIn for professional narrative grounding.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [...messages.slice(-10).map(m => ({ role: m.role, parts: [{ text: m.text }] })), { role: 'user', parts: [{ text: input }] }],
        config: { systemInstruction, temperature: 0.8 }
      });

      setMessages(prev => [...prev, {
        role: 'model',
        text: response.text || "Synchronicity error.",
        timestamp: new Date(),
        groundingSource: 'Omni-Nexus Multi-Sync'
      }]);
    } catch (error) {
      console.error('Shadow Link Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-5xl mx-auto bg-slate-950 rounded-[3rem] border border-slate-900 overflow-hidden shadow-2xl relative">
      {/* HUD Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl px-8 py-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className={`w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center border transition-all duration-500 ${isVoiceActive ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-indigo-500/20 shadow-xl'}`}>
                <span className={`text-3xl font-bold ${isVoiceActive ? 'text-green-400' : 'text-indigo-400'}`}>影</span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-4 border-slate-900 rounded-full ${isVoiceActive ? 'bg-green-500 animate-ping' : 'bg-indigo-500'}`}></div>
          </div>
          <div>
            <div className="text-lg font-bold text-white tracking-tight">{persona.name || '元影 (Motokage)'}</div>
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-2">
                <span className={isVoiceActive ? 'text-green-400' : 'text-indigo-400'}>{isVoiceActive ? 'VOCAL_CORE_LIVE' : 'VAULT_ACTIVE'}</span>
                <span className="opacity-30">•</span>
                <span className="flex gap-1 items-center">
                    {persona.cloudSources.map((s, i) => (
                      <span key={i} className={`w-1 h-1 rounded-full ${s.provider === 'linkedin' ? 'bg-[#0077b5]' : 'bg-blue-500'}`}></span>
                    ))}
                    <span className="ml-1 text-[8px]">Omni-Nexus Hub ({persona.cloudSources.length})</span>
                </span>
            </div>
          </div>
        </div>

        <button 
          onClick={isVoiceActive ? stopVoice : startVoice}
          className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all border shadow-lg ${isVoiceActive ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500 hover:text-white'}`}
        >
          {isVoiceActive ? (
            <><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> TERMINATE CORE</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> ACTIVATE VOICE</>
          )}
        </button>
      </div>

      {/* Message Feed / Vocal Aura */}
      <div className="flex-grow overflow-y-auto p-10 space-y-8 scroll-smooth relative">
        {isVoiceActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm z-10 pointer-events-none transition-all duration-700">
             <div className="w-48 h-48 rounded-full border border-green-500/20 flex items-center justify-center animate-[ping_3s_infinite] opacity-20"></div>
             <div className="absolute w-32 h-32 rounded-full bg-green-500/5 blur-3xl animate-pulse"></div>
             <div className="text-center space-y-4">
                <div className="text-sm font-mono text-green-400 uppercase tracking-[0.5em] animate-pulse">Handshake Active</div>
                <div className="max-w-md text-xs text-slate-400 px-10 italic">
                  {transcription || "Listening for your voice..."}
                </div>
             </div>
          </div>
        )}

        {messages.length === 0 && !isVoiceActive && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-6">
            <div className="w-32 h-32 border-2 border-slate-800 rounded-[2.5rem] flex items-center justify-center animate-[pulse_4s_infinite]">
                <span className="text-6xl grayscale">影</span>
            </div>
            <div className="max-w-xs space-y-2">
                <h3 className="font-bold text-white uppercase tracking-widest text-sm">DNA Synthesis Complete</h3>
                <p className="text-[10px] font-mono leading-relaxed">Multi-profile Nexus active. LinkedIn career pulse synced. Speak or type to begin.</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[80%] rounded-3xl px-7 py-5 text-sm leading-relaxed shadow-sm relative transition-all
              ${msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/10' 
                : 'bg-slate-900 text-slate-200 rounded-bl-none border border-slate-800 shadow-xl'}
            `}>
              {msg.groundingSource && (
                <div className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                   <span className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse"></span>
                   {msg.groundingSource}
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <div className="flex items-center gap-3 mt-4 opacity-40">
                <span className="text-[9px] font-mono uppercase tracking-widest">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl px-7 py-5 rounded-bl-none">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
              </div>
              <div className="text-[9px] font-mono text-slate-600 mt-3 uppercase tracking-widest">Traversing Omni-Nexus Nodes...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Command Line Input */}
      {!isVoiceActive && (
        <form onSubmit={handleSend} className="p-8 bg-slate-900/50 backdrop-blur-xl border-t border-slate-800">
          <div className="relative group max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query the Shadow Nexus..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-8 py-5 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm transition-all group-hover:border-slate-700 placeholder:text-slate-700 shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-4 top-3 bottom-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
            >
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.2em]">Sync</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ChatInterface;
