
import React, { useState, useMemo, useRef } from 'react';
import { Persona, OriginFact, OriginCategory, Relationship, AccessLevel } from '../types';

interface OriginStoryViewProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  accessLevel: AccessLevel;
}

const OriginStoryView: React.FC<OriginStoryViewProps> = ({ persona, setPersona, accessLevel }) => {
  const [isAddingFact, setIsAddingFact] = useState(false);
  const [isIngestingResume, setIsIngestingResume] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<{ data: string; mimeType: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  const [showRelationModal, setShowRelationModal] = useState(false);
  const [editingRelation, setEditingRelation] = useState<Partial<Relationship> | null>(null);
  const [editingInterestCategory, setEditingInterestCategory] = useState<keyof Persona['interests'] | null>(null);
  const [newInterestValue, setNewInterestValue] = useState('');
  const [isRecordingNarrative, setIsRecordingNarrative] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [newFact, setNewFact] = useState<Partial<OriginFact>>({ date: '', event: '', significance: '', details: '', category: 'PERSONAL', impact: 5 });
  const isLocked = accessLevel !== 'CORE';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setResumeFile({ data: base64, mimeType: file.type });
        setResumeText(`[PDF_ARTIFACT: ${file.name}]`);
      };
      reader.readAsDataURL(file);
    }
  };

  const startNarrativeRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          processSpokenNarrative(base64Audio);
        };
      };
      mediaRecorder.start();
      setIsRecordingNarrative(true);
    } catch (err) { console.error(err); }
  };

  const stopNarrativeRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    setIsRecordingNarrative(false);
  };

  const processSpokenNarrative = async (base64Audio: string) => {
    setIsExtracting(true);
    try {
      const response = await fetch('/api/extract-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio })
      });
      const data = await response.json();
      setNewFact(prev => ({ ...prev, ...data }));
    } catch (e) { console.error(e); } finally { setIsExtracting(false); }
  };

  const handleProcessResume = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: resumeText, file: resumeFile })
      });
      const data = await response.json();
      setPersona(prev => ({
        ...prev,
        bio: data.dnaUpdates?.bio || prev.bio,
        coreValues: data.dnaUpdates?.coreValues || prev.coreValues,
        originFacts: [...prev.originFacts, ...(data.newFacts || []).map((f: any) => ({ ...f, id: `res_${Date.now()}_${Math.random()}` }))].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      }));
      setIsIngestingResume(false);
    } catch (err) { console.error(err); } finally { setIsProcessing(false); }
  };

  const handleAddFact = () => {
    if (!newFact.event || !newFact.date) return;
    const fact: OriginFact = { id: `o_${Date.now()}`, date: newFact.date || '', event: newFact.event || '', significance: newFact.significance || '', details: newFact.details || '', category: (newFact.category as OriginCategory) || 'PERSONAL', impact: newFact.impact || 5 };
    setPersona(prev => ({ ...prev, originFacts: [...prev.originFacts, fact].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) }));
    setIsAddingFact(false);
    setNewFact({ date: '', event: '', significance: '', details: '', category: 'PERSONAL', impact: 5 });
  };

  const timelineWithEras = useMemo(() => {
    const groups: { era: string, facts: OriginFact[] }[] = [];
    persona.originFacts.forEach(fact => {
      const era = new Date(fact.date).getFullYear()?.toString() || 'Epoch Unknown';
      const existing = groups.find(g => g.era === era);
      if (existing) existing.facts.push(fact);
      else groups.push({ era, facts: [fact] });
    });
    return groups.sort((a, b) => parseInt(a.era) - parseInt(b.era));
  }, [persona.originFacts]);

  return (
    <div className="space-y-16 animate-in fade-in duration-1000 pb-32 relative">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-slate-900 pb-12 text-left">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20 uppercase tracking-[0.4em]">Memory Core & Life Chronology</div>
          <h2 className="text-7xl font-bold font-heading text-white tracking-tighter">The <span className="text-slate-500 italic font-light">Life Ledger</span></h2>
        </div>
        {!isLocked && (
          <div className="flex gap-4">
            <button onClick={() => setIsIngestingResume(!isIngestingResume)} className="px-6 py-3 border rounded-xl text-[9px] font-bold uppercase tracking-widest bg-slate-900 border-slate-800 text-blue-400 hover:border-blue-500/50">Ingest Resume</button>
            <button onClick={() => setIsAddingFact(!isAddingFact)} className="px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-xl bg-blue-600 text-white hover:bg-blue-500">Append Memory</button>
          </div>
        )}
      </section>

      {isIngestingResume && (
        <div className="p-10 bg-slate-900 border border-blue-500/30 rounded-[3.5rem] shadow-2xl space-y-8">
           <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste resume text..." className="w-full h-48 bg-slate-950 border border-slate-800 rounded-[2rem] px-8 py-8 text-xs font-mono text-blue-300 outline-none resize-none" />
           <input type="file" accept="application/pdf" onChange={handleFileChange} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[9px] file:font-bold file:bg-blue-600 file:text-white" />
           <button onClick={handleProcessResume} disabled={isProcessing} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.3em] disabled:opacity-50">{isProcessing ? 'Analyzing...' : 'Execute Ingestion'}</button>
        </div>
      )}

      {isAddingFact && (
        <div className="ml-[6rem] p-10 bg-slate-900 border border-emerald-500/30 rounded-[3rem] space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white uppercase tracking-tight">New Node</h3>
            <button onClick={isRecordingNarrative ? stopNarrativeRecording : startNarrativeRecording} className={`p-4 rounded-full border ${isRecordingNarrative ? 'bg-red-500 text-white' : 'bg-slate-950 text-slate-500'}`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg></button>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <input type="text" placeholder="Date" value={newFact.date} onChange={e => setNewFact({...newFact, date: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs text-white outline-none" />
            <input type="text" placeholder="Event" value={newFact.event} onChange={e => setNewFact({...newFact, event: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs text-white outline-none" />
          </div>
          <button onClick={handleAddFact} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.3em]">Etch to Timeline</button>
        </div>
      )}

      <div className="lg:col-span-8 space-y-16">
        {timelineWithEras.map(group => (
          <div key={group.era} className="space-y-12 text-left ml-[6rem]">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Era: {group.era}</div>
            {group.facts.map(fact => (
              <div key={fact.id} className="bg-slate-900/30 border border-slate-900 p-8 rounded-[2.5rem]">
                <h4 className="text-xl font-bold text-white uppercase font-heading">{fact.event}</h4>
                <p className="text-[11px] text-slate-500 font-mono mt-4">{fact.details}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OriginStoryView;
