
import React, { useState, useRef } from 'react';
import { Persona, AccessLevel, MemoryShard } from '../types';
import { GoogleGenAI } from "@google/genai";

interface MosaicViewProps {
  persona: Persona;
  setPersona: (p: Persona) => void;
  accessLevel: AccessLevel;
}

const MosaicView: React.FC<MosaicViewProps> = ({ persona, setPersona, accessLevel }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newShard, setNewShard] = useState({ title: '', content: '' });
  const [artifactFile, setArtifactFile] = useState<{ data: string; mimeType: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Option 2: Recording State (Aural Shards)
  const [isRecordingEcho, setIsRecordingEcho] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setArtifactFile({ data: base64, mimeType: file.type });
        setNewShard(prev => ({ ...prev, title: `Ingested Doc: ${file.name}` }));
      };
      reader.readAsDataURL(file);
    }
  };

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

  const addShard = async () => {
    if (!newShard.title && !artifactFile) return;
    
    setIsProcessing(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      let content = newShard.content;
      let title = newShard.title;

      if (artifactFile) {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { inlineData: artifactFile },
              { text: "Provide a high-fidelity summary of this document to be used as a memory shard in a digital twin's mosaic. Return a clear title and a concise but dense summary of the core artifacts/knowledge within. Return as JSON: { title: string, summary: string }" }
            ]
          },
          config: { responseMimeType: "application/json" }
        });
        const data = JSON.parse(response.text || '{}');
        title = data.title || title;
        content = data.summary || content;
      }

      const shard: MemoryShard = {
        id: `s_${Date.now()}`,
        category: 'axiom',
        title: title || 'Unnamed Artifact',
        content: content || 'No content extracted.',
        active: true,
        sensitivity: 'PUBLIC'
      };
      
      setPersona({ ...persona, memoryShards: [shard, ...persona.memoryShards] });
      setIsAdding(false);
      setNewShard({ title: '', content: '' });
      setArtifactFile(null);
    } catch (err) {
      console.error("Artifact ingestion fail:", err);
      alert("Artifact Analysis Failed: The digital twin could not synthesize this document.");
    } finally {
      setIsProcessing(false);
    }
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
           <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Shard Metadata</label>
                  <input type="text" placeholder="Artifact Title" value={newShard.title} onChange={e => setNewShard({...newShard, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Plain Text Content</label>
                  <textarea value={newShard.content} onChange={e => { setNewShard({...newShard, content: e.target.value}); if(artifactFile) setArtifactFile(null); }} placeholder="Paste evidence artifacts..." className="w-full h-48 bg-slate-950 border border-slate-800 rounded-2xl p-8 text-xs font-mono text-indigo-300 outline-none resize-none no-scrollbar" />
                </div>
              </div>
              <div className="space-y-6 flex flex-col">
                <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Document Upload (PDF)</label>
                <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl hover:border-indigo-500/50 transition-all p-10 relative group bg-slate-950/30">
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="text-center space-y-4 pointer-events-none">
                    <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center transition-all ${artifactFile ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-600'}`}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest">{artifactFile ? 'PDF Ready for Synthesis' : 'Upload Shard PDF'}</p>
                      <p className="text-[8px] text-slate-500 font-mono mt-1">{artifactFile ? 'Content will be analyzed' : 'Drop or click to upload'}</p>
                    </div>
                  </div>
                </div>
              </div>
           </div>
           <div className="flex gap-4">
             <button 
                onClick={addShard} 
                disabled={isProcessing || (!newShard.title && !artifactFile)}
                className="flex-grow bg-indigo-600 text-white py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:scale-[1.01] transition-all disabled:opacity-50 shadow-lg"
             >
               {isProcessing ? 'Synthesizing Cognitive Artifact...' : 'Confirm Ingestion'}
             </button>
             <button onClick={() => { setIsAdding(false); setArtifactFile(null); }} className="px-10 py-5 bg-slate-950 text-slate-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Cancel</button>
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
