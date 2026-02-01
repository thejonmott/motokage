import React, { useState } from 'react';
import { Persona, AccessLevel, MemoryShard } from '../types';

interface MosaicViewProps {
  persona: Persona;
  setPersona: (p: Persona) => void;
  accessLevel: AccessLevel;
}

const MosaicView: React.FC<MosaicViewProps> = ({ persona, setPersona, accessLevel }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newShard, setNewShard] = useState({ title: '', content: '' });

  const addShard = () => {
    if (!newShard.title) return;
    const shard: MemoryShard = {
      id: `s_${Date.now()}`,
      category: 'echo',
      title: newShard.title,
      content: newShard.content,
      active: true,
      sensitivity: 'PUBLIC'
    };
    setPersona({ ...persona, memoryShards: [shard, ...persona.memoryShards] });
    setIsAdding(false);
    setNewShard({ title: '', content: '' });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-end px-4">
        <div className="space-y-2">
          <div className="text-purple-400 text-[10px] font-mono font-bold uppercase tracking-[0.4em]">Artifact Evidence</div>
          <h2 className="text-6xl font-bold font-heading text-white">The <span className="text-indigo-400 italic font-light">Mosaic</span></h2>
        </div>
        {accessLevel === 'CORE' && (
          <button onClick={() => setIsAdding(!isAdding)} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl">Ingest Artifact</button>
        )}
      </div>

      {isAdding && (
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 space-y-8 shadow-2xl animate-in zoom-in-95">
           <div className="space-y-6">
              <input type="text" placeholder="Artifact Title" value={newShard.title} onChange={e => setNewShard({...newShard, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500" />
              <textarea value={newShard.content} onChange={e => setNewShard({...newShard, content: e.target.value})} placeholder="Paste evidence artifacts..." className="w-full h-48 bg-slate-950 border border-slate-800 rounded-2xl p-8 text-xs font-mono text-indigo-300 outline-none resize-none" />
           </div>
           <div className="flex gap-4">
             <button onClick={addShard} className="flex-grow bg-indigo-600 text-white py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest">Confirm Ingestion</button>
             <button onClick={() => setIsAdding(false)} className="px-10 py-5 bg-slate-950 text-slate-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Cancel</button>
           </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {persona.memoryShards.map(shard => (
          <div key={shard.id} className="p-10 bg-slate-950 border border-slate-900 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group shadow-xl flex flex-col min-h-[300px]">
            <div className="flex items-center gap-3 mb-8">
               <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">{shard.category}</span>
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