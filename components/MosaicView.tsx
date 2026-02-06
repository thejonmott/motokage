
import React, { useState, useRef } from 'react';
import { Persona, AccessLevel, MemoryShard, OriginFact } from '../types';

interface MosaicViewProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  accessLevel: AccessLevel;
}

const MosaicView: React.FC<MosaicViewProps> = ({ persona, setPersona, accessLevel }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newShard, setNewShard] = useState({ title: '', description: '', relevance: '' });
  const [assetType, setAssetType] = useState<'DOCUMENT' | 'IMAGE'>('DOCUMENT');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingShardId, setProcessingShardId] = useState<string | null>(null);
  
  const [isRecordingEcho, setIsRecordingEcho] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setNewShard(prev => ({ ...prev, title: file.name }));
      
      // Auto-detect type
      if (file.type.startsWith('image/')) {
        setAssetType('IMAGE');
      } else {
        setAssetType('DOCUMENT');
      }
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
      content: 'Voice recording stored in the cloud-native mosaic.',
      active: true,
      sensitivity: 'PUBLIC',
      audioData: base64Audio
    };
    setPersona(prev => ({ ...prev, memoryShards: [shard, ...prev.memoryShards] }));
  };

  const uploadAndIngest = async () => {
    if (!newShard.title && !uploadFile && !newShard.description) return;
    setIsProcessing(true);
    
    try {
      let attachmentUrl = undefined;
      let attachmentType = undefined;
      let fileDataForSynth = null;

      // 1. Upload to GCS if file exists
      if (uploadFile) {
        const formData = new FormData();
        formData.append('file', uploadFile);
        
        const uploadRes = await fetch('/api/upload_artifact', {
          method: 'POST',
          body: formData
        });
        
        if (uploadRes.ok) {
           const data = await uploadRes.json();
           attachmentUrl = data.url;
           attachmentType = assetType === 'IMAGE' ? 'image/png' : 'application/pdf'; // Simplified logic
           
           // Read file for synthesis as base64
           const buffer = await uploadFile.arrayBuffer();
           const base64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
           fileDataForSynth = { mimeType: uploadFile.type, data: base64 };
        }
      }

      // 2. Synthesize/Summary
      // We combine description and relevance into the content block for context
      const combinedContext = `[RELEVANCE]: ${newShard.relevance}\n[DESCRIPTION]: ${newShard.description}`;

      const synthResponse = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: combinedContext,
          file: fileDataForSynth
        })
      });
      
      const synthData = await synthResponse.json();

      const shard: MemoryShard = {
        id: `s_${Date.now()}`,
        category: 'axiom',
        title: synthData.title || newShard.title || 'Unnamed Artifact',
        content: combinedContext, // Store the raw context + relevance
        active: true,
        sensitivity: 'PUBLIC',
        attachmentUrl,
        attachmentType
      };
      
      setPersona(prev => ({ ...prev, memoryShards: [shard, ...prev.memoryShards] }));
      setIsAdding(false);
      setNewShard({ title: '', description: '', relevance: '' });
      setUploadFile(null);
    } catch (err) {
      console.error("Ingestion fail:", err);
      alert("Failed to ingest artifact.");
    } finally {
      setIsProcessing(false);
    }
  };

  const deconstructToTimeline = async (shard: MemoryShard) => {
    if (!shard.attachmentUrl) return;
    setProcessingShardId(shard.id);
    
    try {
      const res = await fetch(shard.attachmentUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const analyzeRes = await fetch('/api/analyze-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             file: { mimeType: blob.type, data: base64 }
          })
        });
        
        const newFacts: OriginFact[] = await analyzeRes.json();
        
        if (Array.isArray(newFacts)) {
           const processedFacts = newFacts.map(f => ({
             ...f,
             id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
           }));
           
           setPersona(prev => ({
             ...prev,
             originFacts: [...prev.originFacts, ...processedFacts].sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0))
           }));
           alert(`Successfully extracted ${newFacts.length} timeline events.`);
        }
      };
      reader.readAsDataURL(blob);
      
    } catch (err) {
      console.error("Deconstruction failed", err);
      alert("Failed to analyze document.");
    } finally {
      setProcessingShardId(null);
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
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-fit">
                   <button onClick={() => setAssetType('DOCUMENT')} className={`px-6 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${assetType === 'DOCUMENT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>Document</button>
                   <button onClick={() => setAssetType('IMAGE')} className={`px-6 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${assetType === 'IMAGE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>Image</button>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Shard Metadata</label>
                  <input type="text" placeholder="Artifact Title" value={newShard.title} onChange={e => setNewShard({...newShard, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Description</label>
                  <textarea value={newShard.description} onChange={e => setNewShard({...newShard, description: e.target.value})} placeholder="Add context to this artifact..." className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-xs font-mono text-indigo-300 outline-none resize-none no-scrollbar" />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Strategic Relevance</label>
                  <input type="text" placeholder="Why does this matter?" value={newShard.relevance} onChange={e => setNewShard({...newShard, relevance: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs font-mono text-emerald-400 outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div className="space-y-6 flex flex-col">
                <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Native File Upload</label>
                <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl hover:border-indigo-500/50 transition-all p-10 relative group bg-slate-950/30">
                  <input type="file" onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="text-center space-y-4 pointer-events-none">
                    <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center transition-all ${uploadFile ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-600'}`}>
                      {assetType === 'IMAGE' ? (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      ) : (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest">{uploadFile ? uploadFile.name : `Select ${assetType === 'IMAGE' ? 'Visual' : 'Document'} Asset`}</p>
                      <p className="text-[8px] text-slate-500 font-mono mt-2">Will be stored in GCS: artifacts/</p>
                    </div>
                  </div>
                </div>
              </div>
           </div>
           <div className="flex gap-4">
             <button onClick={uploadAndIngest} disabled={isProcessing || (!newShard.title && !uploadFile && !newShard.description)} className="flex-grow bg-indigo-600 text-white py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:opacity-50">
               {isProcessing ? 'Persisting to Cloud...' : 'Confirm Ingestion'}
             </button>
             <button onClick={() => { setIsAdding(false); setUploadFile(null); }} className="px-10 py-5 bg-slate-950 text-slate-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Cancel</button>
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
            
            <p className="text-[11px] text-slate-500 leading-relaxed font-mono uppercase tracking-wider line-clamp-4 mb-6">{shard.content}</p>

            <div className="mt-auto space-y-4">
               {shard.attachmentUrl && (
                 <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                       <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Attached</span>
                    </div>
                    <a href={shard.attachmentUrl} target="_blank" rel="noreferrer" className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest hover:text-white">View</a>
                 </div>
               )}

               {shard.attachmentUrl && accessLevel === 'CORE' && (
                 <button 
                   onClick={() => deconstructToTimeline(shard)} 
                   disabled={processingShardId === shard.id}
                   className="w-full py-3 border border-slate-800 rounded-xl text-[8px] font-bold text-slate-500 uppercase tracking-widest hover:bg-indigo-500/10 hover:text-indigo-400 transition-all"
                 >
                   {processingShardId === shard.id ? 'Analyzing...' : 'Deconstruct to Timeline'}
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MosaicView;
