
import React, { useState, useMemo } from 'react';
import { Persona, OriginFact, Relationship, AccessLevel, InterestItem } from '../types';

interface OriginStoryViewProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  accessLevel: AccessLevel;
}

type SubTab = 'timeline' | 'kinship' | 'favorites';
type InterestCategory = 'hobbies' | 'bands' | 'authors' | 'movies';

const OriginStoryView: React.FC<OriginStoryViewProps> = ({ persona, setPersona, accessLevel }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('timeline');
  const [isAddingFact, setIsAddingFact] = useState(false);
  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  const [isAddingRelation, setIsAddingRelation] = useState(false);
  const [editingRelationId, setEditingRelationId] = useState<string | null>(null);
  const [activeInterestCategory, setActiveInterestCategory] = useState<InterestCategory | null>(null);

  const [newFact, setNewFact] = useState<Partial<OriginFact>>({ month: '', day: '', year: '', event: '', significance: '', details: '', category: 'PERSONAL', impact: 5 });
  const [newRelation, setNewRelation] = useState<Partial<Relationship>>({ type: 'FRIEND', name: '', birthDate: '', marriageDate: '', memories: '', details: '' });
  const [newInterest, setNewInterest] = useState({ name: '', meta: '' });

  const isLocked = accessLevel !== 'CORE';

  // --- TIMELINE LOGIC ---
  const handleSaveFact = () => {
    if (!newFact.event || !newFact.year) return;
    
    if (editingFactId) {
      setPersona(prev => ({
        ...prev,
        originFacts: prev.originFacts.map(f => (f.id === editingFactId ? { ...f, ...newFact } as OriginFact : f))
          .sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0))
      }));
    } else {
      const fact: OriginFact = {
        id: `o_${Date.now()}`,
        ...newFact,
        date: `${newFact.year}-${newFact.month}-${newFact.day}`
      } as OriginFact;
      setPersona(prev => ({
        ...prev,
        originFacts: [...prev.originFacts, fact].sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0))
      }));
    }
    setIsAddingFact(false);
    setEditingFactId(null);
    setNewFact({ month: '', day: '', year: '', event: '', significance: '', details: '', category: 'PERSONAL', impact: 5 });
  };

  const deleteFact = (id: string) => {
    if (!window.confirm("Delete this memory node from your legacy?")) return;
    setPersona(prev => ({ ...prev, originFacts: prev.originFacts.filter(f => f.id !== id) }));
  };

  const startEditFact = (fact: OriginFact) => {
    setNewFact(fact);
    setEditingFactId(fact.id);
    setIsAddingFact(true);
  };

  // --- RELATIONSHIP LOGIC WITH TIMELINE HOOKS ---
  const handleSaveRelation = () => {
    if (!newRelation.name) return;
    
    let updatedFacts = [...persona.originFacts];
    
    // Auto-Generate Timeline Events if they don't exist yet (Basic heuristic)
    // 1. Birth Event
    if (newRelation.birthDate && !editingRelationId) {
      const parts = newRelation.birthDate.split('/'); // Assumes MM/DD/YYYY
      if (parts.length === 3) {
        updatedFacts.push({
          id: `o_birth_${Date.now()}`,
          year: parts[2],
          month: parts[0], // Simplified
          day: parts[1],
          date: newRelation.birthDate,
          event: `Birth of ${newRelation.name}`,
          category: 'PERSONAL',
          significance: `Arrival of ${(newRelation.type || 'person').toLowerCase()} in the family constellation.`,
          impact: 8
        });
      }
    }
    
    // 2. Marriage Event
    if (newRelation.marriageDate && !editingRelationId) {
       const parts = newRelation.marriageDate.split('/');
       if (parts.length === 3) {
        updatedFacts.push({
          id: `o_marriage_${Date.now()}`,
          year: parts[2],
          month: parts[0],
          day: parts[1],
          date: newRelation.marriageDate,
          event: `Union with ${newRelation.name}`,
          category: 'RELATIONAL',
          significance: `Formal union and establishment of partnership.`,
          impact: 10
        });
       }
    }

    if (editingRelationId) {
      setPersona(prev => ({
        ...prev,
        relationships: prev.relationships.map(r => (r.id === editingRelationId ? { ...r, ...newRelation } as Relationship : r))
      }));
    } else {
      const rel: Relationship = { id: `r_${Date.now()}`, ...newRelation } as Relationship;
      setPersona(prev => ({ 
        ...prev, 
        relationships: [...prev.relationships, rel],
        originFacts: updatedFacts.sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0))
      }));
    }
    setIsAddingRelation(false);
    setEditingRelationId(null);
    setNewRelation({ type: 'FRIEND', name: '', birthDate: '', marriageDate: '', memories: '', details: '' });
  };

  const startEditRelation = (rel: Relationship) => {
    setNewRelation(rel);
    setEditingRelationId(rel.id);
    setIsAddingRelation(true);
  };

  const deleteRelation = (id: string) => {
    if (!window.confirm("Sever this kinship record?")) return;
    setPersona(prev => ({ ...prev, relationships: prev.relationships.filter(r => r.id !== id) }));
  };

  // --- INTERESTS LOGIC ---
  const handleSaveInterest = () => {
    if (!activeInterestCategory || !newInterest.name) return;
    
    if (activeInterestCategory === 'hobbies') {
        setPersona(prev => ({ ...prev, interests: { ...prev.interests, hobbies: [...prev.interests.hobbies, newInterest.name] } }));
    } else {
        const item: InterestItem = { id: `i_${Date.now()}`, name: newInterest.name, meta: newInterest.meta };
        setPersona(prev => ({
            ...prev,
            interests: { ...prev.interests, [activeInterestCategory]: [...(prev.interests[activeInterestCategory] as InterestItem[]), item] }
        }));
    }
    setActiveInterestCategory(null);
    setNewInterest({ name: '', meta: '' });
  };

  const deleteInterest = (category: InterestCategory, id: string) => {
    if (!window.confirm(`Remove this interest from your DNA?`)) return;
    if (category === 'hobbies') {
        setPersona(prev => ({ ...prev, interests: { ...prev.interests, hobbies: prev.interests.hobbies.filter(h => h !== id) } }));
    } else {
        setPersona(prev => ({
            ...prev,
            interests: { ...prev.interests, [category]: (prev.interests[category] as InterestItem[]).filter(i => i.id !== id) }
        }));
    }
  };

  const timelineWithEras = useMemo(() => {
    const groups: { era: string, facts: OriginFact[] }[] = [];
    const sorted = [...persona.originFacts].sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0));
    sorted.forEach(fact => {
      const era = fact.year || 'Unknown';
      const existing = groups.find(g => g.era === era);
      if (existing) existing.facts.push(fact);
      else groups.push({ era, facts: [fact] });
    });
    return groups;
  }, [persona.originFacts]);

  return (
    <div className="space-y-16 animate-in fade-in duration-1000 pb-32 relative text-left">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-slate-900 pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20 uppercase tracking-[0.4em]">Chronology & Relational DNA</div>
          <h2 className="text-7xl font-bold font-heading text-white tracking-tighter">Life <span className="text-slate-500 italic font-light">Ledger</span></h2>
        </div>
        
        <nav className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
          {(['timeline', 'kinship', 'favorites'] as SubTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab === 'timeline' ? 'Timeline' : tab === 'kinship' ? 'Kinship' : 'Favorites'}
            </button>
          ))}
        </nav>
      </section>

      {/* --- TIMELINE VIEW --- */}
      {activeSubTab === 'timeline' && (
        <div className="relative pt-12">
          {!isLocked && (
            <div className="flex justify-end mb-12">
              <button onClick={() => { setNewFact({ month: '', day: '', year: '', event: '', significance: '', details: '', category: 'PERSONAL', impact: 5 }); setIsAddingFact(true); }} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-indigo-500">Etch New Memory</button>
            </div>
          )}

          <div className="relative ml-8 md:ml-32 border-l-2 border-slate-900 py-12 space-y-24">
            <div className="absolute top-0 bottom-0 -left-[2px] w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-emerald-500 opacity-20"></div>
            
            {timelineWithEras.map((group) => (
              <div key={group.era} className="relative">
                <div className="absolute -left-[41px] top-0 w-20 flex justify-center items-center h-10 z-10">
                   <div className="bg-slate-950 px-4 py-1 border border-slate-800 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-[0_0_15px_rgba(0,0,0,0.5)]">{group.era}</div>
                </div>

                <div className="space-y-16 pt-16">
                  {group.facts.map((fact) => (
                    <div key={fact.id} className="relative pl-12 md:pl-24 group">
                      <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-20 group-hover:scale-125 transition-transform"></div>
                      
                      <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem] hover:border-indigo-500/30 transition-all shadow-2xl relative overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{fact.month} {fact.day}</span>
                              <span className="text-[7px] text-slate-600 font-mono">/ {fact.category}</span>
                            </div>
                            <h4 className="text-3xl font-bold text-white uppercase tracking-tight font-heading">{fact.event}</h4>
                          </div>
                          {!isLocked && (
                            <div className="flex gap-4">
                              <button onClick={() => startEditFact(fact)} className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                              <button onClick={() => deleteFact(fact.id)} className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-500 hover:text-rose-500 transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed font-light mb-6 border-l-2 border-indigo-500/30 pl-6">{fact.significance}</p>
                        {fact.details && (
                          <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                             <p className="text-[11px] text-slate-500 font-mono uppercase leading-relaxed whitespace-pre-wrap">{fact.details}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- KINSHIP VIEW --- */}
      {activeSubTab === 'kinship' && (
        <div className="pt-12 space-y-12">
          {!isLocked && (
            <div className="flex justify-end">
              <button onClick={() => { setNewRelation({ type: 'FRIEND', name: '', birthDate: '', marriageDate: '', memories: '', details: '' }); setIsAddingRelation(true); }} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl">Document Relation</button>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {persona.relationships.map(rel => (
              <div key={rel.id} className="bg-slate-900/40 border border-slate-800 p-10 rounded-[2.5rem] space-y-6 hover:border-emerald-500/30 transition-all group relative min-h-[320px] flex flex-col justify-between shadow-2xl">
                <div>
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-emerald-400">
                         {rel.type === 'PET' ? '🐾' : rel.type === 'CHILD' ? '👶' : rel.type === 'SPOUSE' ? '💍' : '👤'}
                      </div>
                      <div className="text-right">
                         <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">{rel.type}</span>
                         <p className="text-xl font-bold text-white uppercase font-heading">{rel.name}</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      {rel.birthDate && (
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 uppercase">
                           <span>Birth / Emergence</span>
                           <span className="text-white">{rel.birthDate}</span>
                        </div>
                      )}
                      {rel.marriageDate && (
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 uppercase">
                           <span>Union Date</span>
                           <span className="text-white">{rel.marriageDate}</span>
                        </div>
                      )}
                      {rel.memories && (
                        <div className="pt-4 border-t border-slate-800 space-y-2">
                           <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Core Memory Capsule</span>
                           <p className="text-[10px] text-slate-400 italic leading-relaxed line-clamp-4">{rel.memories}</p>
                        </div>
                      )}
                   </div>
                </div>
                {!isLocked && (
                  <div className="flex gap-4 pt-4 border-t border-slate-800/50 mt-4">
                    <button onClick={() => startEditRelation(rel)} className="text-[8px] font-bold text-slate-600 hover:text-white uppercase tracking-widest transition-colors">Edit</button>
                    <button onClick={() => deleteRelation(rel.id)} className="text-[8px] font-bold text-slate-600 hover:text-rose-500 uppercase tracking-widest transition-colors">Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- FAVORITES VIEW --- */}
      {activeSubTab === 'favorites' && (
        <div className="pt-12 grid md:grid-cols-2 gap-12">
          {/* HOBBIES */}
          <div className="bg-slate-900/40 border border-slate-800 p-12 rounded-[3.5rem] space-y-8 shadow-2xl">
             <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-white uppercase tracking-tight font-heading">Hobbies</h4>
                {!isLocked && <button onClick={() => setActiveInterestCategory('hobbies')} className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all">+</button>}
             </div>
             <div className="flex flex-wrap gap-3">
                {persona.interests.hobbies.map(h => (
                  <div key={h} className="group px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                    {h}
                    {!isLocked && <button onClick={() => deleteInterest('hobbies', h)} className="opacity-0 group-hover:opacity-100 text-rose-500 text-sm">×</button>}
                  </div>
                ))}
                {persona.interests.hobbies.length === 0 && <p className="text-[9px] font-mono text-slate-600 uppercase">No Hobbies Recorded</p>}
             </div>
          </div>

          {/* MUSIC / BANDS */}
          <div className="bg-slate-900/40 border border-slate-800 p-12 rounded-[3.5rem] space-y-8 shadow-2xl">
             <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-white uppercase tracking-tight font-heading">Bands & Sound</h4>
                {!isLocked && <button onClick={() => setActiveInterestCategory('bands')} className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center text-purple-400 hover:bg-purple-600 hover:text-white transition-all">+</button>}
             </div>
             <div className="space-y-4">
                {persona.interests.bands.map(b => (
                  <div key={b.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-start group transition-all hover:border-purple-500/30">
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-white uppercase tracking-wider">{b.name}</div>
                      <p className="text-[9px] text-slate-500 font-mono italic">{b.meta}</p>
                    </div>
                    {!isLocked && <button onClick={() => deleteInterest('bands', b.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 text-xs">×</button>}
                  </div>
                ))}
                {persona.interests.bands.length === 0 && <p className="text-[9px] font-mono text-slate-600 uppercase">No Musical DNA Recorded</p>}
             </div>
          </div>

          {/* AUTHORS */}
          <div className="bg-slate-900/40 border border-slate-800 p-12 rounded-[3.5rem] space-y-8 shadow-2xl">
             <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-white uppercase tracking-tight font-heading">Literature</h4>
                {!isLocked && <button onClick={() => setActiveInterestCategory('authors')} className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center text-cyan-400 hover:bg-cyan-600 hover:text-white transition-all">+</button>}
             </div>
             <div className="space-y-4">
                {persona.interests.authors.map(a => (
                  <div key={a.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-start group transition-all hover:border-cyan-500/30">
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-white uppercase tracking-wider">{a.name}</div>
                      <p className="text-[9px] text-slate-500 font-mono">Works: <span className="text-slate-400">{a.meta}</span></p>
                    </div>
                    {!isLocked && <button onClick={() => deleteInterest('authors', a.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 text-xs">×</button>}
                  </div>
                ))}
                {persona.interests.authors.length === 0 && <p className="text-[9px] font-mono text-slate-600 uppercase">No Authors Recorded</p>}
             </div>
          </div>

          {/* MOVIES & TV */}
          <div className="bg-slate-900/40 border border-slate-800 p-12 rounded-[3.5rem] space-y-8 shadow-2xl">
             <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-white uppercase tracking-tight font-heading">Cinema & TV</h4>
                {!isLocked && <button onClick={() => setActiveInterestCategory('movies')} className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center text-amber-400 hover:bg-amber-600 hover:text-white transition-all">+</button>}
             </div>
             <div className="space-y-4">
                {persona.interests.movies.map(m => (
                  <div key={m.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-start group transition-all hover:border-amber-500/30">
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-white uppercase tracking-wider">{m.name}</div>
                      <p className="text-[9px] text-slate-500 font-mono leading-relaxed">Reasoning: <span className="text-slate-400">{m.meta}</span></p>
                    </div>
                    {!isLocked && <button onClick={() => deleteInterest('movies', m.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 text-xs">×</button>}
                  </div>
                ))}
                {persona.interests.movies.length === 0 && <p className="text-[9px] font-mono text-slate-600 uppercase">No Cinema Interests Recorded</p>}
             </div>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT FACT MODAL --- */}
      {isAddingFact && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] w-full max-w-2xl shadow-2xl space-y-8 relative overflow-hidden">
            <h3 className="text-2xl font-bold text-white uppercase tracking-tight font-heading">{editingFactId ? 'Calibrate Memory' : 'New Timeline Node'}</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2 text-left">
                <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Year</label>
                <input type="text" placeholder="2020" value={newFact.year} onChange={e => setNewFact({...newFact, year: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Month</label>
                <input type="text" placeholder="January" value={newFact.month} onChange={e => setNewFact({...newFact, month: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Day</label>
                <input type="text" placeholder="15" value={newFact.day} onChange={e => setNewFact({...newFact, day: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Event Title</label>
              <input type="text" placeholder="e.g. Graduation, First Job, etc." value={newFact.event} onChange={e => setNewFact({...newFact, event: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500" />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Strategic Significance</label>
              <input type="text" placeholder="Why does this memory matter?" value={newFact.significance} onChange={e => setNewFact({...newFact, significance: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500" />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Detailed Narrative (Notes)</label>
              <textarea placeholder="Write a detailed account of this node..." value={newFact.details} onChange={e => setNewFact({...newFact, details: e.target.value})} className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-[11px] font-mono text-slate-400 outline-none resize-none no-scrollbar leading-relaxed" />
            </div>
            
            <div className="flex gap-4">
              <button onClick={handleSaveFact} className="flex-grow bg-indigo-600 text-white py-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-indigo-500 shadow-xl">{editingFactId ? 'Update Ledger' : 'Confirm Entry'}</button>
              <button onClick={() => { setIsAddingFact(false); setEditingFactId(null); }} className="px-10 py-5 bg-slate-950 text-slate-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT RELATIONSHIP MODAL --- */}
      {isAddingRelation && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] w-full max-w-2xl shadow-2xl space-y-8">
            <h3 className="text-2xl font-bold text-white uppercase tracking-tight font-heading">{editingRelationId ? 'Update Kinship' : 'Document New Relationship'}</h3>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                 <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Relational Category</label>
                 <select value={newRelation.type} onChange={e => setNewRelation({...newRelation, type: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs text-white outline-none focus:border-emerald-500">
                    <option value="SPOUSE">Spouse / Partner</option>
                    <option value="CHILD">Child</option>
                    <option value="PARENT">Parent</option>
                    <option value="FRIEND">Friend</option>
                    <option value="PET">Pet</option>
                    <option value="OTHER">Other</option>
                 </select>
              </div>
              <div className="space-y-4">
                 <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Identity Name</label>
                 <input type="text" placeholder="Full Name" value={newRelation.name} onChange={e => setNewRelation({...newRelation, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs text-white outline-none focus:border-emerald-500" />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 text-left">
               <div className="space-y-4">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Date of Birth / Arrival</label>
                  <input type="text" placeholder="MM/DD/YYYY" value={newRelation.birthDate} onChange={e => setNewRelation({...newRelation, birthDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs text-white outline-none" />
               </div>
               {newRelation.type === 'SPOUSE' && (
                 <div className="space-y-4 animate-in slide-in-from-top-2">
                    <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Date of Marriage / Union</label>
                    <input type="text" placeholder="MM/DD/YYYY" value={newRelation.marriageDate} onChange={e => setNewRelation({...newRelation, marriageDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500" />
                 </div>
               )}
            </div>

            <div className="space-y-4 text-left">
               <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Favorite Shared Memories</label>
               <textarea placeholder="Tell a specific story or memory with this person/pet..." value={newRelation.memories} onChange={e => setNewRelation({...newRelation, memories: e.target.value})} className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-[11px] font-mono text-slate-400 outline-none resize-none no-scrollbar leading-relaxed" />
            </div>

            <div className="flex gap-4">
              <button onClick={handleSaveRelation} className="flex-grow bg-emerald-600 text-white py-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl transition-all hover:bg-emerald-500">Commit to Ledger</button>
              <button onClick={() => { setIsAddingRelation(false); setEditingRelationId(null); }} className="px-10 py-5 bg-slate-950 text-slate-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD INTEREST MODAL --- */}
      {activeInterestCategory && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] w-full max-w-xl shadow-2xl space-y-8 text-left">
            <h3 className="text-2xl font-bold text-white uppercase tracking-tight font-heading">
              New {activeInterestCategory === 'bands' ? 'Band' : activeInterestCategory === 'authors' ? 'Author' : activeInterestCategory === 'movies' ? 'Movie/Show' : 'Hobby'} Node
            </h3>
            
            <div className="space-y-4">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Name / Title</label>
              <input type="text" value={newInterest.name} onChange={e => setNewInterest({...newInterest, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500" placeholder="e.g. Radiohead, Christopher Nolan, etc." />
            </div>

            {activeInterestCategory !== 'hobbies' && (
              <div className="space-y-4">
                <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                  {activeInterestCategory === 'bands' ? 'Favorite Albums & Tracks' : 
                   activeInterestCategory === 'authors' ? 'Key Works / Favorite Books' : 
                   'Reasoning / Why this matters'}
                </label>
                <textarea value={newInterest.meta} onChange={e => setNewInterest({...newInterest, meta: e.target.value})} className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-[11px] font-mono text-slate-400 outline-none resize-none no-scrollbar leading-relaxed" placeholder="Detailed reflections..." />
              </div>
            )}

            <div className="flex gap-4">
              <button onClick={handleSaveInterest} className="flex-grow bg-indigo-600 text-white py-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl">Confirm DNA Entry</button>
              <button onClick={() => { setActiveInterestCategory(null); setNewInterest({ name: '', meta: '' }); }} className="px-10 py-5 bg-slate-950 text-slate-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default OriginStoryView;
