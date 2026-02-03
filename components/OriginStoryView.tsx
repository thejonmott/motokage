
import React, { useState, useEffect } from 'react';
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

  // --- RESUME INGESTION ---
  const handleIngestResume = async () => {
    if (!resumeText.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this resume/experience text and extract key professional milestones.
        Format as JSON array of objects with: date (string, full Month Day, Year if available, otherwise just Year), event (string), significance (string), details (string), category (CAREER), impact (1-10).
        
        Text: ${resumeText}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                event: { type: Type.STRING },
                significance: { type: Type.STRING },
                details: { type: Type.STRING },
                category: { type: Type.STRING },
                impact: { type: Type.NUMBER }
              },
              required: ["date", "event", "significance", "category", "impact"]
            }
          }
        }
      });

      const parsedFacts = JSON.parse(response.text || '[]').map((f: any) => ({
        ...f,
        id: `res_${Math.random().toString(36).substr(2, 9)}`
      }));

      setPersona(prev => ({
        ...prev,
        originFacts: [...prev.originFacts, ...parsedFacts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      }));
      setIsIngestingResume(false);
      setResumeText('');
    } catch (e) {
      console.error("Neural Ingestion Failure:", e);
      alert("Failed to parse resume. Check API key status.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- RELATIONSHIP MANAGEMENT ---
  const handleSaveRelationship = () => {
    if (!editingRelation?.name) return;
    
    if (editingRelation.id) {
      // Update existing
      setPersona(prev => ({
        ...prev,
        relationships: prev.relationships.map(r => r.id === editingRelation.id ? (editingRelation as Relationship) : r)
      }));
    } else {
      // Add new
      const rel: Relationship = {
        ...editingRelation,
        id: `rel_${Date.now()}`,
      } as Relationship;
      setPersona(prev => ({ ...prev, relationships: [...prev.relationships, rel] }));
    }
    
    setShowRelationModal(false);
    setEditingRelation(null);
  };

  const handleRemoveRelation = (id: string) => {
    setPersona(prev => ({ ...prev, relationships: prev.relationships.filter(r => r.id !== id) }));
  };

  const updateInterests = (key: 'hobbies' | 'music', val: string) => {
    const arr = val.split(',').map(s => s.trim()).filter(s => s !== '');
    setPersona(prev => ({
      ...prev,
      interests: { ...prev.interests, [key]: arr }
    }));
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-1000 pb-32 relative">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-slate-900 pb-12">
        <div className="space-y-4 text-left">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-full border border-blue-500/20 uppercase tracking-[0.4em]">
            Memory Core & Life Chronology
          </div>
          <h2 className="text-7xl font-bold font-heading text-white tracking-tighter">
            The <span className="text-slate-500 italic font-light">Life Ledger</span>
          </h2>
          <p className="text-slate-500 text-sm font-mono uppercase tracking-widest max-w-xl">
            A chronological mapping of identity milestones, professional evolution, and relational pillars.
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
              className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-xl hover:bg-blue-500 transition-all"
            >
              Append Memory
            </button>
          </div>
        )}
      </section>

      {/* Resume Ingestion Area */}
      {isIngestingResume && (
        <div className="bg-slate-900 border border-blue-500/30 p-10 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-top-4 space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Neural Timeline Ingestion</h4>
            <span className="text-[8px] font-mono text-slate-500">PASTE RESUME OR JOB HISTORY BELOW</span>
          </div>
          <textarea 
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Mottio Studio (2020-2024)..."
            className="w-full h-48 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-xs font-mono text-blue-300 outline-none resize-none focus:border-blue-500/50"
          />
          <div className="flex gap-4">
            <button 
              onClick={handleIngestResume}
              disabled={isProcessing}
              className="flex-grow bg-blue-600 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
            >
              {isProcessing ? 'Synthesizing Career Chronology...' : 'Extract Career Milestones'}
            </button>
            <button onClick={() => setIsIngestingResume(false)} className="px-10 py-4 bg-slate-950 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest">Cancel</button>
          </div>
        </div>
      )}

      {/* Manual Fact Entry Form */}
      {isAddingFact && (
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl space-y-8 animate-in slide-in-from-top-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Full Date (M/D/Y)</label>
              <input 
                type="text" 
                placeholder="e.g. June 15, 2012" 
                value={newFact.date}
                onChange={e => setNewFact({...newFact, date: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs text-white outline-none focus:border-blue-500" 
              />
            </div>
            <div className="space-y-4">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Event Headline</label>
              <input 
                type="text" 
                placeholder="Started Vision Lab" 
                value={newFact.event}
                onChange={e => setNewFact({...newFact, event: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs text-white outline-none focus:border-blue-500" 
              />
            </div>
            <div className="space-y-4">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Category</label>
              <select 
                value={newFact.category}
                onChange={e => setNewFact({...newFact, category: e.target.value as any})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs text-white outline-none focus:border-blue-500"
              >
                <option value="CAREER">CAREER</option>
                <option value="MILESTONE">MILESTONE</option>
                <option value="PERSONAL">PERSONAL</option>
                <option value="RELATIONAL">RELATIONAL</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">The Story (Full Details)</label>
            <textarea 
              placeholder="Expand on this memory... provide the high-fidelity context." 
              value={newFact.details}
              onChange={e => {
                setNewFact({...newFact, details: e.target.value});
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              className="w-full min-h-[120px] bg-slate-950 border border-slate-800 rounded-[2rem] px-8 py-8 text-xs font-mono text-slate-400 outline-none resize-none focus:border-blue-500" 
            />
          </div>
          <div className="flex gap-4">
            <button onClick={handleAddFact} className="flex-grow bg-blue-600 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl">Etch to Timeline</button>
            <button onClick={() => setIsAddingFact(false)} className="px-10 py-4 bg-slate-950 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest">Cancel</button>
          </div>
        </div>
      )}

      {/* --- TIMELINE & SOUL MAP LAYOUT --- */}
      <div className="grid lg:grid-cols-12 gap-16">
        
        {/* Timeline Column */}
        <div className="lg:col-span-8 space-y-12">
          <div className="relative">
            <div className="absolute left-[3.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-slate-800 to-transparent hidden md:block"></div>
            
            <div className="space-y-12">
              {persona.originFacts.length === 0 ? (
                <div className="p-20 border border-dashed border-slate-800 rounded-[3rem] text-center opacity-30">
                  <p className="text-xs font-mono uppercase tracking-widest">No life milestones indexed. Start by adding an event.</p>
                </div>
              ) : (
                persona.originFacts.map((fact) => (
                  <div key={fact.id} className="flex gap-8 group animate-in slide-in-from-left-4">
                    <div className="w-24 shrink-0 text-right space-y-1 pt-2">
                      <div className="text-sm font-bold text-white font-mono break-words">{fact.date}</div>
                      <div className={`text-[7px] font-bold uppercase tracking-[0.2em] ${
                        fact.category === 'CAREER' ? 'text-emerald-500' : 
                        fact.category === 'MILESTONE' ? 'text-blue-500' : 'text-purple-500'
                      }`}>
                        {fact.category}
                      </div>
                    </div>
                    
                    <div className="hidden md:flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full bg-slate-900 border-2 transition-all group-hover:scale-125 z-10 mt-3 ${
                        fact.category === 'CAREER' ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                        fact.category === 'MILESTONE' ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 
                        'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                      }`}></div>
                    </div>

                    <div className="flex-grow bg-slate-900/30 border border-slate-900 p-8 rounded-[2.5rem] hover:border-slate-800 transition-all relative group/card">
                      {!isLocked && (
                        <div className="absolute top-4 right-6 flex gap-3 opacity-0 group-hover/card:opacity-100 transition-opacity">
                           <button 
                            onClick={() => setEditingFactId(editingFactId === fact.id ? null : fact.id)}
                            className="p-2 text-slate-500 hover:text-white transition-colors"
                           >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                           </button>
                           <button 
                            onClick={() => handleDeleteFact(fact.id)}
                            className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                           >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                           </button>
                        </div>
                      )}

                      {editingFactId === fact.id ? (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          <div className="grid grid-cols-2 gap-4">
                            <input 
                              type="text" 
                              value={fact.date} 
                              onChange={(e) => handleUpdateFact(fact.id, { date: e.target.value })}
                              className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-blue-500" 
                            />
                            <input 
                              type="text" 
                              value={fact.event} 
                              onChange={(e) => handleUpdateFact(fact.id, { event: e.target.value })}
                              className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-blue-500" 
                            />
                          </div>
                          <textarea 
                            value={fact.details}
                            onChange={(e) => {
                              handleUpdateFact(fact.id, { details: e.target.value });
                              e.target.style.height = 'auto';
                              e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-xs font-mono text-slate-400 outline-none resize-none focus:border-blue-500"
                          />
                          <button 
                            onClick={() => setEditingFactId(null)}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg text-[8px] font-bold uppercase tracking-widest"
                          >
                            Save Changes
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-4">
                             <h4 className="text-xl font-bold text-white uppercase tracking-tight font-heading">{fact.event}</h4>
                             <div className="flex items-center gap-2">
                                <span className="text-[7px] text-slate-600 font-mono uppercase tracking-widest">Impact</span>
                                <div className="flex gap-0.5">
                                   {[...Array(10)].map((_, idx) => (
                                     <div key={idx} className={`w-1 h-2 rounded-[1px] ${idx < fact.impact ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
                                   ))}
                                </div>
                             </div>
                          </div>
                          {fact.details && (
                            <p className="text-[11px] text-slate-500 leading-relaxed font-mono uppercase tracking-wider whitespace-pre-wrap">
                              {fact.details}
                            </p>
                          )}
                          <div className="mt-4 pt-4 border-t border-slate-900/50 flex gap-4">
                             <span className="text-[8px] text-slate-600 font-mono uppercase tracking-widest">Significance:</span>
                             <span className="text-[8px] text-blue-400 font-mono uppercase tracking-widest italic">{fact.significance}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* --- IDENTITY & RELATIONSHIPS COLUMN --- */}
        <div className="lg:col-span-4 space-y-12">
          
          {/* Inner Circle Section */}
          <div className="p-10 bg-slate-900/50 border border-slate-800 rounded-[3rem] space-y-8 shadow-2xl">
            <div className="flex justify-between items-center">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.3em] font-heading">Inner Circle</h4>
              <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
            </div>

            <div className="space-y-4">
              {persona.relationships.map(rel => (
                <div key={rel.id} className="p-6 bg-slate-950 border border-slate-800 rounded-2xl group relative overflow-hidden text-left hover:border-rose-500/30 transition-all cursor-pointer" onClick={() => { if(!isLocked) { setEditingRelation(rel); setShowRelationModal(true); }}}>
                  {!isLocked && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoveRelation(rel.id); }}
                      className="absolute top-2 right-2 p-2 text-slate-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-[8px] font-bold text-rose-400 uppercase tracking-widest">{rel.type}</div>
                    <div className="text-[7px] text-slate-600 font-mono uppercase">{rel.birthDate || rel.marriageDate || '---'}</div>
                  </div>
                  <div className="text-sm font-bold text-white mb-2">{rel.name}</div>
                  {rel.memories && <p className="text-[10px] text-slate-500 font-mono italic leading-relaxed line-clamp-2">{rel.memories}</p>}
                </div>
              ))}

              {!isLocked && (
                <button 
                  onClick={() => { setEditingRelation({ type: 'SPOUSE' }); setShowRelationModal(true); }}
                  className="w-full py-4 border border-dashed border-slate-800 rounded-2xl text-[9px] font-bold text-slate-600 uppercase tracking-widest hover:border-rose-500/50 hover:text-rose-400 transition-all"
                >
                  Bind Family Nexus
                </button>
              )}
            </div>
          </div>

          {/* Soul Map Section */}
          <div className="p-10 bg-slate-900/50 border border-slate-800 rounded-[3rem] space-y-8 shadow-2xl">
            <div className="flex justify-between items-center">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.3em] font-heading">Soul Map</h4>
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              </div>
            </div>

            <div className="space-y-8 text-left">
               <div className="space-y-4">
                  <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Hobbies & Passions</div>
                  <div className="flex flex-wrap gap-2">
                    {persona.interests.hobbies.map((h, i) => (
                      <span key={i} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-mono rounded-lg">{h}</span>
                    ))}
                    {!isLocked && (
                      <input 
                        placeholder="Add (comma separated)..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateInterests('hobbies', (e.target as HTMLInputElement).value + ',' + persona.interests.hobbies.join(','));
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="bg-transparent border-b border-slate-800 text-[9px] text-slate-500 outline-none w-full mt-2 py-1"
                      />
                    )}
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">The Soundscape (Music)</div>
                  <div className="flex flex-wrap gap-2">
                    {persona.interests.music.map((m, i) => (
                      <span key={i} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-mono rounded-lg">{m}</span>
                    ))}
                    {!isLocked && (
                      <input 
                        placeholder="Add bands (comma separated)..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateInterests('music', (e.target as HTMLInputElement).value + ',' + persona.interests.music.join(','));
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="bg-transparent border-b border-slate-800 text-[9px] text-slate-500 outline-none w-full mt-2 py-1"
                      />
                    )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- KINSHIP MODAL (RELATIONSHIP EDITOR) --- */}
      {showRelationModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] shadow-[0_0_100px_rgba(244,63,94,0.1)] space-y-10 animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                <div className="text-left">
                  <h3 className="text-2xl font-bold font-heading text-white tracking-tight">Kinship Nexus Calibration</h3>
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">Refining Relational Identity Bindings</p>
                </div>
                <button onClick={() => setShowRelationModal(false)} className="text-slate-500 hover:text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
             </div>

             <div className="grid md:grid-cols-2 gap-8 text-left">
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Connection Type</label>
                  <select 
                    value={editingRelation?.type}
                    onChange={e => setEditingRelation({...editingRelation, type: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs text-white outline-none focus:border-rose-500"
                  >
                    <option value="SPOUSE">SPOUSE</option>
                    <option value="CHILD">CHILD</option>
                    <option value="GRANDCHILD">GRANDCHILD</option>
                    <option value="PET">PET</option>
                    <option value="PARENT">PARENT</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Full Name / Identifier</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Jane Mott" 
                    value={editingRelation?.name || ''}
                    onChange={e => setEditingRelation({...editingRelation, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs text-white outline-none focus:border-rose-500" 
                  />
                </div>
             </div>

             <div className="grid md:grid-cols-3 gap-8 text-left">
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Birth Date</label>
                  <input 
                    type="text" 
                    placeholder="MM/DD/YYYY" 
                    value={editingRelation?.birthDate || ''}
                    onChange={e => setEditingRelation({...editingRelation, birthDate: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs text-white outline-none" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Marriage Date (If Applicable)</label>
                  <input 
                    type="text" 
                    placeholder="MM/DD/YYYY" 
                    value={editingRelation?.marriageDate || ''}
                    onChange={e => setEditingRelation({...editingRelation, marriageDate: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs text-white outline-none" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Place / Location</label>
                  <input 
                    type="text" 
                    placeholder="City, State, Country" 
                    value={editingRelation?.place || ''}
                    onChange={e => setEditingRelation({...editingRelation, place: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs text-white outline-none" 
                  />
                </div>
             </div>

             <div className="space-y-4 text-left">
               <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Specific Memories & Contextual Bonds</label>
               <textarea 
                 placeholder="Share specific memories, weddings stories, or core bonds..." 
                 value={editingRelation?.memories || ''}
                 onChange={e => setEditingRelation({...editingRelation, memories: e.target.value})}
                 rows={5}
                 className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] px-8 py-8 text-xs font-mono text-slate-400 outline-none resize-none focus:border-rose-500" 
               />
             </div>

             <div className="flex gap-4">
               <button onClick={handleSaveRelationship} className="flex-grow bg-rose-600 text-white py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-rose-500 transition-all">
                 Commit Relationship DNA
               </button>
               <button onClick={() => setShowRelationModal(false)} className="px-12 py-5 bg-slate-950 text-slate-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Cancel</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OriginStoryView;
