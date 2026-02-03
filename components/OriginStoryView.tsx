
import React, { useState, useMemo } from 'react';
import { Persona, OriginFact, OriginCategory, Relationship, AccessLevel } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface OriginStoryViewProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  accessLevel: AccessLevel;
}

const OriginStoryView: React.FC<OriginStoryViewProps> = ({ persona, setPersona, accessLevel }) => {
  const [isAddingFact, setIsAddingFact] = useState(false);
  const [isIngestingResume, setIsIngestingResume] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  
  const [showRelationModal, setShowRelationModal] = useState(false);
  const [editingRelation, setEditingRelation] = useState<Partial<Relationship> | null>(null);

  const [newFact, setNewFact] = useState<Partial<OriginFact>>({
    date: '',
    event: '',
    significance: '',
    details: '',
    category: 'PERSONAL',
    impact: 5
  });

  const isLocked = accessLevel !== 'CORE';

  // --- FACT MANAGEMENT ---
  const handleAddFact = () => {
    if (!newFact.event || !newFact.date) return;
    const fact: OriginFact = {
      id: `o_${Date.now()}`,
      date: newFact.date || '',
      event: newFact.event || '',
      significance: newFact.significance || '',
      details: newFact.details || '',
      category: (newFact.category as OriginCategory) || 'PERSONAL',
      impact: newFact.impact || 5
    };
    setPersona(prev => ({
      ...prev,
      originFacts: [...prev.originFacts, fact].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }));
    setIsAddingFact(false);
    setNewFact({ date: '', event: '', significance: '', details: '', category: 'PERSONAL', impact: 5 });
  };

  const handleUpdateFact = (id: string, updates: Partial<OriginFact>) => {
    setPersona(prev => ({
      ...prev,
      originFacts: prev.originFacts.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const handleDeleteFact = (id: string) => {
    setPersona(prev => ({
      ...prev,
      originFacts: prev.originFacts.filter(f => f.id !== id)
    }));
  };

  // --- RELATIONSHIP MANAGEMENT & AUTO-TIMELINE SYNC ---
  const handleSaveRelationship = () => {
    if (!editingRelation?.name) return;
    
    const relId = editingRelation.id || `rel_${Date.now()}`;
    const syncFactId = `sync_${relId}`;
    
    // Logic for Automatic Timeline Sync
    const date = editingRelation.marriageDate || editingRelation.birthDate || '';
    let syncFact: OriginFact | null = null;

    if (date) {
      let eventTitle = '';
      let category: OriginCategory = 'RELATIONAL';
      
      if (editingRelation.type === 'SPOUSE') {
        eventTitle = `Covenant Established: Marriage to ${editingRelation.name}`;
      } else if (editingRelation.type === 'CHILD' || editingRelation.type === 'GRANDCHILD') {
        eventTitle = `New Branch: Birth of ${editingRelation.name}`;
      } else if (editingRelation.type === 'PET') {
        eventTitle = `Companion Joined: Arrival of ${editingRelation.name}`;
      } else {
        eventTitle = `Relational Bond: ${editingRelation.name}`;
      }

      syncFact = {
        id: syncFactId,
        date,
        event: eventTitle,
        significance: `Primary Bond: ${editingRelation.type}`,
        details: editingRelation.memories || `Added via Inner Circle synchronization.`,
        category,
        impact: 9
      };
    }

    setPersona(prev => {
      // Update the relationships array
      const updatedRelationships = prev.relationships.some(r => r.id === relId)
        ? prev.relationships.map(r => r.id === relId ? (editingRelation as Relationship) : r)
        : [...prev.relationships, { ...editingRelation, id: relId } as Relationship];

      // Update the originFacts array (Timeline)
      let updatedFacts = prev.originFacts.filter(f => f.id !== syncFactId);
      if (syncFact) {
        updatedFacts = [...updatedFacts, syncFact].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }

      return { ...prev, relationships: updatedRelationships, originFacts: updatedFacts };
    });
    
    setShowRelationModal(false);
    setEditingRelation(null);
  };

  const handleRemoveRelation = (id: string) => {
    setPersona(prev => ({ 
      ...prev, 
      relationships: prev.relationships.filter(r => r.id !== id),
      originFacts: prev.originFacts.filter(f => f.id !== `sync_${id}`)
    }));
  };

  const updateInterests = (key: keyof Persona['interests'], val: string) => {
    const arr = val.split(',').map(s => s.trim()).filter(s => s !== '');
    setPersona(prev => ({
      ...prev,
      interests: { ...prev.interests, [key]: arr }
    }));
  };

  // Era Grouping for the Timeline
  const timelineWithEras = useMemo(() => {
    const groups: { era: string, facts: OriginFact[] }[] = [];
    persona.originFacts.forEach(fact => {
      const year = new Date(fact.date).getFullYear();
      const era = isNaN(year) ? 'Epoch Unknown' : `${year}`;
      const existing = groups.find(g => g.era === era);
      if (existing) existing.facts.push(fact);
      else groups.push({ era, facts: [fact] });
    });
    return groups.sort((a, b) => parseInt(a.era) - parseInt(b.era));
  }, [persona.originFacts]);

  return (
    <div className="space-y-16 animate-in fade-in duration-1000 pb-32 relative">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-slate-900 pb-12">
        <div className="space-y-4 text-left">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20 uppercase tracking-[0.4em]">
            Memory Core & Life Chronology
          </div>
          <h2 className="text-7xl font-bold font-heading text-white tracking-tighter">
            The <span className="text-slate-500 italic font-light">Life Ledger</span>
          </h2>
          <p className="text-slate-500 text-sm font-mono uppercase tracking-widest max-w-xl">
            A chronological mapping of identity milestones and synchronized relational anchors.
          </p>
        </div>
        {!isLocked && (
          <div className="flex gap-4">
            <button 
              onClick={() => setIsIngestingResume(!isIngestingResume)}
              className="px-6 py-3 bg-slate-900 border border-slate-800 text-blue-400 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:border-blue-500/50 transition-all flex items-center gap-2"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Ingest Resume
            </button>
            <button 
              onClick={() => setIsAddingFact(!isAddingFact)}
              className={`px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-xl transition-all ${isAddingFact ? 'bg-slate-800 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
            >
              {isAddingFact ? 'Cancel Append' : 'Append Memory'}
            </button>
          </div>
        )}
      </section>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-16 relative">
        
        {/* Timeline Column (Left) */}
        <div className="lg:col-span-8 space-y-16">
          <div className="relative">
            {/* The "Golden Thread" vertical line */}
            <div className="absolute left-[7.5rem] top-0 bottom-0 w-[2px] bg-gradient-to-b from-emerald-500/50 via-slate-800 to-transparent hidden md:block"></div>
            
            <div className="space-y-20">
              
              {/* --- ENHANCED APPEND MEMORY FORM --- */}
              {isAddingFact && (
                <div className="ml-[6rem] animate-in slide-in-from-top-4 duration-500 mb-20">
                  <div className="p-10 bg-slate-900 border border-emerald-500/30 rounded-[3rem] shadow-[0_0_50px_rgba(16,185,129,0.1)] space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 opacity-50"></div>
                    
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-xl font-bold text-white uppercase tracking-tight font-heading">New Chronological Node</h3>
                       <div className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">Awaiting Calibration</div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 text-left">
                      <div className="space-y-3">
                        <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Full Date</label>
                        <input 
                          type="text" 
                          placeholder="e.g. October 12, 2024" 
                          value={newFact.date}
                          onChange={e => setNewFact({...newFact, date: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Event Headline (Title)</label>
                        <input 
                          type="text" 
                          placeholder="What happened?" 
                          value={newFact.event}
                          onChange={e => setNewFact({...newFact, event: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 text-left">
                      <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Weight Score (Impact 1-10)</label>
                      <div className="flex items-center gap-4">
                        <div className="flex-grow flex gap-1 h-8 items-end">
                           {[...Array(10)].map((_, i) => (
                             <button 
                                key={i}
                                onClick={() => setNewFact({...newFact, impact: i + 1})}
                                className={`flex-grow rounded-sm transition-all duration-300 ${i < (newFact.impact || 0) ? 'bg-emerald-500' : 'bg-slate-800'} hover:scale-y-125 h-full`}
                             ></button>
                           ))}
                        </div>
                        <span className="text-xl font-bold font-mono text-white min-w-[2ch]">{newFact.impact}</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 text-left">
                      <div className="space-y-3">
                        <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Significance Anchor</label>
                        <input 
                          type="text" 
                          placeholder="Why is this meaningful?" 
                          value={newFact.significance}
                          onChange={e => setNewFact({...newFact, significance: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs text-emerald-400 font-mono italic outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Category</label>
                        <select 
                          value={newFact.category}
                          onChange={e => setNewFact({...newFact, category: e.target.value as any})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs text-white outline-none focus:border-emerald-500"
                        >
                          <option value="CAREER">CAREER</option>
                          <option value="MILESTONE">MILESTONE</option>
                          <option value="PERSONAL">PERSONAL</option>
                          <option value="RELATIONAL">RELATIONAL</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3 text-left">
                      <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">The Narrative (Description)</label>
                      <textarea 
                        placeholder="Provide the high-fidelity details... Expand the story." 
                        value={newFact.details}
                        onChange={e => setNewFact({...newFact, details: e.target.value})}
                        className="w-full min-h-[120px] bg-slate-950 border border-slate-800 rounded-[2rem] px-8 py-8 text-xs font-mono text-slate-500 outline-none resize-none focus:border-emerald-500 transition-all no-scrollbar"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={handleAddFact} 
                        className="flex-grow bg-emerald-600 text-white py-5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(16,185,129,0.2)] hover:bg-emerald-500 hover:scale-[1.01] transition-all"
                      >
                        Etch to Timeline
                      </button>
                      <button 
                        onClick={() => setIsAddingFact(false)} 
                        className="px-12 py-5 bg-slate-950 text-slate-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:text-slate-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {timelineWithEras.length === 0 ? (
                <div className="p-20 border border-dashed border-slate-800 rounded-[3rem] text-center opacity-30">
                  <p className="text-xs font-mono uppercase tracking-widest">Chronology awaiting initial calibration.</p>
                </div>
              ) : (
                timelineWithEras.map((group) => (
                  <div key={group.era} className="space-y-12">
                    {/* Year Era Marker */}
                    <div className="flex items-center gap-6 ml-[6rem] animate-in fade-in duration-700">
                       <div className="px-5 py-2 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] shadow-lg">
                          Era: {group.era}
                       </div>
                       <div className="h-px flex-grow bg-gradient-to-r from-slate-800 to-transparent"></div>
                    </div>

                    <div className="space-y-12">
                      {group.facts.map((fact) => (
                        <div key={fact.id} className="flex gap-8 group animate-in slide-in-from-left-4">
                          {/* Date Pillar */}
                          <div className="w-24 shrink-0 text-right space-y-1 pt-2">
                            <div className="text-sm font-bold text-white font-mono leading-tight">{fact.date}</div>
                            <div className={`text-[7px] font-bold uppercase tracking-[0.2em] ${
                              fact.category === 'CAREER' ? 'text-blue-400' : 
                              fact.category === 'RELATIONAL' ? 'text-emerald-400' : 'text-purple-400'
                            }`}>
                              {fact.category}
                            </div>
                          </div>
                          
                          {/* Life Node (The Circle) */}
                          <div className="hidden md:flex flex-col items-center shrink-0 w-8">
                            <div className={`w-4 h-4 rounded-full bg-slate-950 border-[3px] transition-all group-hover:scale-125 z-10 mt-3 ${
                              fact.category === 'CAREER' ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 
                              fact.category === 'RELATIONAL' ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 
                              'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                            }`}></div>
                          </div>

                          {/* Event Card */}
                          <div className={`flex-grow bg-slate-900/30 border p-8 rounded-[2.5rem] transition-all relative group/card ${
                            fact.category === 'RELATIONAL' ? 'border-emerald-500/10 hover:border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-slate-900 hover:border-slate-800'
                          }`}>
                            {!isLocked && (
                              <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover/card:opacity-100 transition-opacity z-20">
                                 <button onClick={() => setEditingFactId(editingFactId === fact.id ? null : fact.id)} className="p-2 text-slate-600 hover:text-blue-400 transition-colors bg-slate-950/50 rounded-lg border border-slate-800">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                 </button>
                                 <button onClick={() => handleDeleteFact(fact.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors bg-slate-950/50 rounded-lg border border-slate-800">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                 </button>
                              </div>
                            )}

                            {editingFactId === fact.id ? (
                              <div className="space-y-6 animate-in fade-in duration-300">
                                <input type="text" value={fact.event} onChange={(e) => handleUpdateFact(fact.id, { event: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-blue-500" />
                                <textarea value={fact.details} onChange={(e) => handleUpdateFact(fact.id, { details: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-xs font-mono text-slate-400 outline-none resize-none" />
                                <button onClick={() => setEditingFactId(null)} className="w-full py-2 bg-blue-600 text-white rounded-lg text-[8px] font-bold uppercase tracking-widest">Save Changes</button>
                              </div>
                            ) : (
                              <div className="text-left pr-20"> {/* Fixed Padding for Actions & Dots */}
                                <div className="flex justify-between items-start mb-4">
                                   <h4 className="text-xl font-bold text-white uppercase tracking-tight font-heading leading-tight">{fact.event}</h4>
                                   <div className="flex items-center gap-2 shrink-0">
                                      <div className="flex gap-0.5">
                                         {[...Array(10)].map((_, idx) => (
                                           <div key={idx} className={`w-1 h-2 rounded-[1px] ${idx < fact.impact ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`}></div>
                                         ))}
                                      </div>
                                   </div>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-mono uppercase tracking-wider whitespace-pre-wrap">{fact.details}</p>
                                <div className="mt-4 pt-4 border-t border-slate-900/50 flex gap-4">
                                   <span className="text-[8px] text-slate-600 font-mono uppercase tracking-widest">Significance:</span>
                                   <span className="text-[8px] text-emerald-400 font-mono uppercase tracking-widest italic">{fact.significance}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column (Right) */}
        <div className="lg:col-span-4 space-y-12">
          
          {/* Inner Circle Section */}
          <div className="p-10 bg-slate-900/50 border border-slate-800 rounded-[3rem] space-y-8 shadow-2xl">
            <div className="flex justify-between items-center">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.3em] font-heading">Inner Circle</h4>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
            </div>

            <div className="space-y-4">
              {persona.relationships.map(rel => (
                <div key={rel.id} className="p-6 bg-slate-950 border border-slate-800 rounded-2xl group relative overflow-hidden text-left hover:border-emerald-500/30 transition-all cursor-pointer" onClick={() => { if(!isLocked) { setEditingRelation(rel); setShowRelationModal(true); }}}>
                  {!isLocked && (
                    <button onClick={(e) => { e.stopPropagation(); handleRemoveRelation(rel.id); }} className="absolute top-2 right-2 p-2 text-slate-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">{rel.type}</div>
                    <div className="text-[7px] text-slate-600 font-mono uppercase">{rel.birthDate || rel.marriageDate || '---'}</div>
                  </div>
                  <div className="text-sm font-bold text-white mb-2">{rel.name}</div>
                  {rel.memories && <p className="text-[10px] text-slate-500 font-mono italic leading-relaxed line-clamp-2">{rel.memories}</p>}
                </div>
              ))}
              {!isLocked && (
                <button onClick={() => { setEditingRelation({ type: 'SPOUSE' }); setShowRelationModal(true); }} className="w-full py-4 border border-dashed border-slate-800 rounded-2xl text-[9px] font-bold text-slate-600 uppercase tracking-widest hover:border-emerald-500/50 hover:text-emerald-400 transition-all">
                  Bind Relationship
                </button>
              )}
            </div>
          </div>

          {/* Favorites & Interests Section */}
          <div className="p-10 bg-slate-900/50 border border-slate-800 rounded-[3rem] space-y-8 shadow-2xl relative">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.3em] font-heading text-left">Favorites & Interests</h4>
            <div className="space-y-8 text-left">
               {/* Hobbies */}
               <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.5 1.5"/><path d="M7 11c.97 0 1.75-.78 1.75-1.75S7.97 7.5 7 7.5 5.25 8.28 5.25 9.25 6.03 11 7 11z"/></svg>
                    <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Hobbies</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {persona.interests.hobbies.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-400 text-[8px] font-mono rounded-lg">{item}</span>
                    ))}
                  </div>
               </div>

               {/* Authors */}
               <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Authors & Books</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {persona.interests.authors.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-950 border border-slate-800 text-emerald-400/70 text-[8px] font-mono rounded-lg">{item}</span>
                    ))}
                  </div>
               </div>

               {/* Movies */}
               <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
                    <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Movies</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {persona.interests.movies.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-950 border border-slate-800 text-blue-400/70 text-[8px] font-mono rounded-lg">{item}</span>
                    ))}
                  </div>
               </div>

               {/* Foods */}
               <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                    <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Foods</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {persona.interests.foods.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-950 border border-slate-800 text-amber-400/70 text-[8px] font-mono rounded-lg">{item}</span>
                    ))}
                  </div>
               </div>

               {/* Core Philosophy Card */}
               <div className="pt-6 border-t border-slate-800">
                  <div className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest mb-4">Core Philosophy</div>
                  {persona.interests.philosophy.map((p, i) => (
                    <div key={i} className="text-[10px] text-slate-500 font-mono italic leading-relaxed mb-4 border-l-2 border-emerald-500/30 pl-4 py-1">"{p}"</div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- KINSHIP MODAL --- */}
      {showRelationModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] shadow-[0_0_120px_rgba(16,185,129,0.2)] space-y-10 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh] no-scrollbar">
             <div className="flex justify-between items-center border-b border-slate-800 pb-8 text-left">
                <div>
                  <h3 className="text-3xl font-bold font-heading text-white tracking-tight">Kinship Nexus Calibration</h3>
                  <p className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest mt-2 animate-pulse">Encoding Relational DNA Sequence</p>
                </div>
                <button onClick={() => setShowRelationModal(false)} className="text-slate-500 hover:text-white bg-slate-950 p-3 rounded-xl border border-slate-800 transition-all">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
             </div>

             <div className="space-y-8 text-left">
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block">Relationship Archetype</label>
                  <div className="relative group">
                    <select 
                      value={editingRelation?.type}
                      onChange={e => setEditingRelation({...editingRelation, type: e.target.value as any})}
                      className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-6 py-5 text-xs text-white outline-none focus:border-emerald-500 transition-all pr-12"
                    >
                      <option value="SPOUSE">SPOUSE</option>
                      <option value="CHILD">CHILD</option>
                      <option value="GRANDCHILD">GRANDCHILD</option>
                      <option value="PET">PET</option>
                      <option value="PARENT">PARENT</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                    <div className="absolute right-[21px] top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-emerald-500 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block">Full Identifier (Name)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Jane Mott" 
                    value={editingRelation?.name || ''}
                    onChange={e => setEditingRelation({...editingRelation, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-5 text-xs text-white outline-none focus:border-emerald-500 transition-all shadow-inner" 
                  />
                </div>

                {editingRelation?.type === 'SPOUSE' && (
                  <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                    <div className="space-y-4">
                      <label className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest block">Covenant Date (Marriage)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. June 15, 2012" 
                        value={editingRelation?.marriageDate || ''}
                        onChange={e => setEditingRelation({...editingRelation, marriageDate: e.target.value})}
                        className="w-full bg-slate-950 border border-emerald-500/20 rounded-xl px-6 py-5 text-xs text-white outline-none focus:border-emerald-500" 
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block">Union Location (Place)</label>
                      <input 
                        type="text" 
                        placeholder="City, State, Country" 
                        value={editingRelation?.place || ''}
                        onChange={e => setEditingRelation({...editingRelation, place: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-5 text-xs text-white outline-none focus:border-emerald-500" 
                      />
                    </div>
                  </div>
                )}

                {(editingRelation?.type === 'CHILD' || editingRelation?.type === 'GRANDCHILD') && (
                  <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                    <div className="space-y-4">
                      <label className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest block">Emergence Date (Birth)</label>
                      <input 
                        type="text" 
                        placeholder="MM/DD/YYYY" 
                        value={editingRelation?.birthDate || ''}
                        onChange={e => setEditingRelation({...editingRelation, birthDate: e.target.value})}
                        className="w-full bg-slate-950 border border-emerald-500/20 rounded-xl px-6 py-5 text-xs text-white outline-none focus:border-emerald-500" 
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block">Birth Location</label>
                      <input 
                        type="text" 
                        placeholder="City, State" 
                        value={editingRelation?.place || ''}
                        onChange={e => setEditingRelation({...editingRelation, place: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-5 text-xs text-white outline-none focus:border-emerald-500" 
                      />
                    </div>
                  </div>
                )}

                {editingRelation?.type === 'PET' && (
                  <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                    <div className="space-y-4">
                      <label className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest block">Arrival Date (Adoption)</label>
                      <input 
                        type="text" 
                        placeholder="MM/DD/YYYY" 
                        value={editingRelation?.birthDate || ''}
                        onChange={e => setEditingRelation({...editingRelation, birthDate: e.target.value})}
                        className="w-full bg-slate-950 border border-emerald-500/20 rounded-xl px-6 py-5 text-xs text-white outline-none focus:border-emerald-500" 
                      />
                    </div>
                  </div>
                )}

                {(editingRelation?.type === 'PARENT' || editingRelation?.type === 'OTHER') && (
                  <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                    <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block">Connection / Birth Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/DD/YYYY" 
                      value={editingRelation?.birthDate || ''}
                      onChange={e => setEditingRelation({...editingRelation, birthDate: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-5 text-xs text-white outline-none focus:border-emerald-500" 
                    />
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block">Specific Memories & Contextual Bonds</label>
                  <textarea 
                    placeholder="Share core stories that define this relational branch..." 
                    value={editingRelation?.memories || ''}
                    onChange={e => setEditingRelation({...editingRelation, memories: e.target.value})}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] px-8 py-8 text-xs font-mono text-slate-500 outline-none resize-none focus:border-emerald-500 transition-all no-scrollbar" 
                  />
                </div>
             </div>

             <div className="flex flex-col gap-4 pt-4">
               <button onClick={handleSaveRelationship} className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-bold text-[11px] uppercase tracking-[0.3em] shadow-[0_10px_40px_rgba(16,185,129,0.3)] hover:bg-emerald-500 hover:translate-y-[-2px] transition-all">
                 Commit Relationship DNA
               </button>
               <button onClick={() => setShowRelationModal(false)} className="w-full py-4 bg-slate-950 text-slate-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:text-slate-400 transition-colors">
                 Discard Calibration
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OriginStoryView;
