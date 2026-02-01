
import React, { useState } from 'react';
import { Persona, AccessLevel } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

interface MemoryVaultProps {
  persona: Persona;
  setPersona: (p: Persona) => void;
  accessLevel: AccessLevel;
}

const MosaicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
);

const MemoryVault: React.FC<MemoryVaultProps> = ({ persona, setPersona, accessLevel }) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isIngestMode, setIsIngestMode] = useState(false);
  const [ingestContent, setIngestContent] = useState('');
  
  const filteredShards = persona.memoryShards.filter(shard => accessLevel === 'CORE' || shard.sensitivity === 'PUBLIC');

  const executeSynthesis = async (content: string) => {
    if (accessLevel !== 'CORE') return;
    setIsSynthesizing(true);
    try {
      // Always initialize with API key from environment for fresh access
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `Synthesize these artifacts into the MOSAIC of Jonathan Mott.
      Focus on professional strategic artifacts and evidence.
      Content to synthesize: ${content}`;
      
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt, 
        config: { 
          responseMimeType: 'application/json',
          // Use responseSchema for robust JSON output as per best practices
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              newShards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    category: { 
                      type: Type.STRING,
                      description: 'One of: axiom, chronos, echo, logos, ethos'
                    },
                    content: { type: Type.STRING },
                    sensitivity: { 
                      type: Type.STRING,
                      description: 'Either PRIVATE or PUBLIC'
                    }
                  },
                  required: ['title', 'category', 'content', 'sensitivity']
                }
              }
            },
            required: ['newShards']
          }
        } 
      });

      // Safely access .text property with optional chaining to prevent build errors
      const jsonStr = response.text?.trim() || '{}';
      const result = JSON.parse(jsonStr);
      if (result.newShards) {
        const mapped = result.newShards.map((s: any) => ({ ...s, id: `art_${Date.now()}_${Math.random()}`, active: true }));
        setPersona({ ...persona, memoryShards: [...mapped, ...persona.memoryShards] });
      }
      setIsIngestMode(false);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsSynthesizing(false); 
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-end px-4">
        <div className="space-y-2">
          <h2 className="text-5xl font-bold font-heading text-white">The <span className="text-indigo-400 italic">Mosaic</span></h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-mono">Evidence, Artifacts, and Chronological Reflections</p>
        </div>
        {accessLevel === 'CORE' && (
          <button onClick={() => setIsIngestMode(!isIngestMode)} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl">Ingest Artifact</button>
        )}
      </div>

      {isIngestMode ? (
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 space-y-8 shadow-2xl animate-in zoom-in-95">
           <textarea value={ingestContent} onChange={e => setIngestContent(e.target.value)} placeholder="Paste evidence artifacts..." className="w-full h-64 bg-slate-950 border border-slate-800 rounded-2xl p-8 text-xs font-mono text-indigo-300 outline-none resize-none" />
           <div className="flex gap-4">
             <button onClick={() => executeSynthesis(ingestContent)} disabled={isSynthesizing} className="flex-grow bg-indigo-600 text-white py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest">{isSynthesizing ? 'Etching Mosaic...' : 'Confirm Ingestion'}</button>
             <button onClick={() => setIsIngestMode(false)} className="px-10 py-5 bg-slate-950 text-slate-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Cancel</button>
           </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {filteredShards.map(shard => (
            <div key={shard.id} className="p-10 bg-slate-950 border border-slate-900 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group shadow-xl flex flex-col min-h-[300px]">
              <div className="flex items-center gap-3 mb-8">
                 <MosaicIcon />
                 <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">{shard.category}</span>
              </div>
              <h5 className="text-white text-sm font-bold mb-4 uppercase tracking-tight">{shard.title}</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed font-mono uppercase tracking-wider line-clamp-6">{shard.content}</p>
              <div className="mt-auto pt-6 border-t border-slate-900 text-[8px] font-mono text-slate-700">ARTIFACT_ID: {shard.id.slice(-8)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoryVault;
