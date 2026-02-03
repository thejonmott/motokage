
import React, { useState, useRef } from 'react';
import { Persona, AccessLevel, MemoryShard } from '../types';

interface MosaicViewProps {
  persona: Persona;
  setPersona: (p: Persona) => void;
  accessLevel: AccessLevel;
}

const MosaicView: React.FC<MosaicViewProps> = ({ persona, setPersona, accessLevel }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newShard, setNewShard] = useState({ title: '', content: '' });
  
  // Option 2: Recording State (Aural Shards)
  const [isRecordingEcho, setIsRecordingEcho] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startEchoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = (reader.result as string).split(',')[1];
          addEchoShard(base64Audio);
        };
      };
      mediaRecorder.start();
      setIsRecordingEcho(true);
    } catch (err) {
      console.error("Mic access denied:", err);
    }
  };

  const stopEchoRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    setIsRecordingEcho(false);
  };

  const addEchoShard = (base64Audio: string) => {
    const shard: MemoryShard = {
      id: `echo_${Date.now()}`,
      category: 'echo',
      title: 'Aural Memory Capsule',
      content: 'Voice recording stored in the cloud-native mosaic. Cadence and tone preserved.',
      active: true,
      sensitivity: 'PUBLIC',
      audioData: base64Audio
    };
    setPersona({ ...persona, memoryShards: [shard, ...persona.memoryShards] });
  };

  const addShard = () => {
    if (!newShard.title) return;
    const shard: MemoryShard = {
      id: `s_${Date.now()}`,
      category: 'axiom',
      title: newShard.title,
      content: newShard.content,
      active: true,
      sensitivity: 'PUBLIC'
    };
    setPersona({ ...persona, memoryShards: [shard, ...persona.memoryShards] });
    setIsAdding(false);
    setNewShard({ title: '', content: '' });
  };

  const playEcho = (base64: string) => {
    const audio = new Audio(`data:audio/webm;base64,${base64}`);
    audio.play();
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-end px-4">
        <div className="space-y-2 text-left">
          <div className="text-purple-400 text-[10px] font-mono font-bold uppercase tracking-[0.4em]">Artifact Evidence</div>
          <h2 className="text-6xl font-bold font-heading text-white text-left">The <span className="text-indigo-400 italic font-light">Mosaic</span></h2>
        </div>
        {accessLevel === 'CORE' && (
          <div className="flex gap-4">
            <button 
              onClick={isRecordingEcho ? stopEchoRecording : startEchoRecording} 
              className={`px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 ${isRecordingEcho ? 'bg-red-600 animate-pulse text-white' : 'bg-slate-900 border border-emerald-500/30 text-emerald-400'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              {isRecordingEcho ? 'Recording...' : 'Record Echo'}
            </button>
            <button onClick={() => setIsAdding(!isAdding)} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl">Ingest Artifact</button>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 space-y-8 shadow-2xl animate-in zoom-in-95">
           <div className="space-y-6 text-left">
              <input type="text" placeholder="Artifact Title" value={newShard.title} onChange={e => setNewShard({...newShard, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500" />
              <textarea value={newShard.content} onChange={e => setNewShard({...newShard, content: e.target.value})} placeholder="Paste evidence artifacts..." className="w-full h-48 bg-slate-950 border border-slate-800 rounded-2xl p-8 text-xs font-mono text-indigo-300 outline-none resize-none no-scrollbar" />
           </div>
           <div className="flex gap-4">
             <button onClick={addShard} className="flex-grow bg-indigo-600 text-white py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest">Confirm Ingestion</button>
             <button onClick={() => setIsAdding(false)} className="px-10 py-5 bg-slate-950 text-slate-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Cancel</button>
           </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8 text-left">
        {persona.memoryShards.map(shard => (
          <div key={shard.id} className={`p-10 bg-slate-950 border rounded-[2.5rem] hover:border-indigo-500/30 transition-all group shadow-xl flex flex-col min-h-[300px] ${shard.audioData ? 'border-emerald-500/20' : 'border-slate-900'}`}>
            <div className="flex justify-between items-center mb-8">
               <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">{shard.category}</span>
               {shard.audioData && (
                 <button onClick={() => playEcho(shard.audioData!)} className="text-emerald-500 hover:scale-110 transition-transform">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                 </button>
               )}
            </div>
            <h5 className="text-white text-sm font-bold mb-4 uppercase tracking-tight">{shard.title}</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed font-mono uppercase tracking-wider line-clamp-6">{shard.content}</p>
            <div className="mt-auto pt-6 border-t border-slate-900 text-[8px] font-mono text-slate-700 uppercase">Artifact_ID: {shard.id.slice(-8)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MosaicView;
