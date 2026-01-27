
import React, { useState, useRef } from 'react';
import { Persona, CloudSource } from '../types';

interface NexusViewProps {
  persona: Persona;
  setPersona: (p: Persona) => void;
}

const DriveIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 3L3 13L6 19H18L21 13L15 3H9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M6 19L15 3" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const ExportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 16V17C4 18.6569 5.34315 20 7 20H17C18.6569 20 20 18.6569 20 17V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 15V4M12 15L8 11M12 15L16 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ImportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 16V17C4 18.6569 5.34315 20 7 20H17C18.6569 20 20 18.6569 20 17V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 4V15M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NexusView: React.FC<NexusViewProps> = ({ persona, setPersona }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const importFileRef = useRef<HTMLInputElement>(null);

  const connectSource = (provider: 'drive' | 'github' | 'linkedin') => {
    setIsConnecting(true);
    setTimeout(() => {
      const isLinkedIn = provider === 'linkedin';
      const newSource: CloudSource = {
        id: `src_${Date.now()}`,
        accountEmail: isLinkedIn ? 'linkedin.com/in/jonmott' : (emailInput || 'new-account@gmail.com'),
        provider,
        status: 'connected',
        linkedFolders: isLinkedIn ? ['Career Narrative', 'Posts'] : ['Vault Root'],
        lastSynced: new Date()
      };
      
      const updatedSources = [...persona.cloudSources, newSource];
      setPersona({ ...persona, cloudSources: updatedSources });
      setIsConnecting(false);
      setEmailInput('');
    }, 1500);
  };

  const removeSource = (id: string) => {
    setPersona({
      ...persona,
      cloudSources: persona.cloudSources.filter(s => s.id !== id)
    });
  };

  const exportDNA = () => {
    const dataStr = JSON.stringify(persona, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `motokage_dna_${persona.name.replace(/\s+/g, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedPersona = JSON.parse(event.target?.result as string);
        // Simple validation check
        if (importedPersona.name && importedPersona.memoryShards) {
          if (window.confirm("This will overwrite your current digital twin's identity. Proceed with migration?")) {
            setPersona(importedPersona);
            alert("Migration Successful. Shadow Identity restored.");
          }
        } else {
          alert("Invalid DNA file. Structure verification failed.");
        }
      } catch (err) {
        alert("Corrupted DNA data. Import failed.");
      }
    };
    reader.readAsText(file);
    if (importFileRef.current) importFileRef.current.value = '';
  };

  return (
    <div className="animate-fade-in space-y-12 pb-20">
      <section className="text-center space-y-4 max-w-4xl mx-auto">
        <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-full border border-blue-500/20 uppercase tracking-[0.4em] mb-2">
          Cloud Infrastructure HUB
        </div>
        <h2 className="text-5xl font-bold font-heading text-white tracking-tight">The <span className="text-blue-500">Nexus</span> Grid</h2>
        <p className="text-slate-500 text-lg font-light leading-relaxed">
          Establishing <span className="text-white font-medium border-b border-blue-500/30">Persistent Handshakes</span> across your professional footprint.
        </p>
      </section>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="p-10 bg-slate-900 border border-slate-800 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-20"></div>
            <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.3em] border-b border-slate-800 pb-4 flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> Initialize Node
            </h3>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Target Endpoint</label>
                <input 
                  type="text" 
                  value={emailInput} 
                  onChange={(e) => setEmailInput(e.target.value)} 
                  placeholder="jon.mott@enterprise.com" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-blue-500 shadow-inner" 
                />
              </div>
              
              <div className="grid grid-cols-1 gap-3 pt-4">
                <button 
                  onClick={() => connectSource('linkedin')} 
                  className="w-full bg-[#0077b5] hover:bg-[#006699] text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all"
                >
                  <LinkedInIcon /> Connect LinkedIn
                </button>
                <button 
                  onClick={() => connectSource('drive')} 
                  className="w-full bg-white hover:bg-slate-100 text-slate-950 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all"
                >
                  <DriveIcon /> Link Google Drive
                </button>
              </div>
            </div>
          </div>

          {/* Migration Protocol Card */}
          <div className="p-10 bg-slate-900 border border-slate-800 rounded-[3.5rem] shadow-2xl space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 opacity-20"></div>
            <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.3em] border-b border-slate-800 pb-4 flex items-center gap-3">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              Migration Protocol
            </h3>
            
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest leading-relaxed">
              Transfer your twin's complete identity across browser instances or accounts.
            </p>

            <div className="grid grid-cols-1 gap-3">
               <button 
                onClick={exportDNA}
                className="w-full bg-slate-800 hover:bg-slate-750 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all border border-slate-700 hover:border-indigo-500/50"
               >
                 <ExportIcon /> Export DNA
               </button>
               <button 
                onClick={() => importFileRef.current?.click()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all"
               >
                 <ImportIcon /> Import DNA
               </button>
               <input 
                 type="file" 
                 ref={importFileRef} 
                 className="hidden" 
                 accept=".json" 
                 onChange={handleImport}
               />
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 grid md:grid-cols-2 gap-6 content-start">
          {persona.cloudSources.length === 0 ? (
            <div className="col-span-2 h-[400px] border-2 border-dashed border-slate-900 rounded-[3.5rem] flex flex-col items-center justify-center space-y-4 opacity-30 text-center">
               <div className="w-20 h-20 border border-slate-800 rounded-[2rem] flex items-center justify-center text-4xl">⚓</div>
               <div className="text-[10px] font-bold uppercase tracking-[0.5em]">No Persistent Nodes Detected</div>
            </div>
          ) : (
            persona.cloudSources.map((source) => (
              <div key={source.id} className="p-10 bg-slate-950 border border-slate-800 rounded-[3.5rem] group relative hover:border-blue-500/50 transition-all shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <button 
                    onClick={() => removeSource(source.id)} 
                    className="text-slate-800 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

                <div className="flex items-center gap-6 mb-8">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border shadow-inner ${source.provider === 'linkedin' ? 'bg-[#0077b5]/10 text-[#0077b5] border-[#0077b5]/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                    {source.provider === 'linkedin' ? <LinkedInIcon /> : <DriveIcon />}
                  </div>
                  <div className="min-w-0 flex-grow">
                    <h4 className="text-lg font-bold text-white uppercase tracking-tight truncate font-heading">{source.accountEmail}</h4>
                    <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.3em] mt-1">{source.provider} Data Mesh</p>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-[0.2em]">PERSISTED</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-700">NODE_ID: {source.id.slice(-8).toUpperCase()}</span>
                  </div>
                  
                  <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600/50 w-full animate-pulse"></div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {source.linkedFolders.map(folder => (
                      <span key={folder} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[8px] font-bold text-slate-500 uppercase tracking-widest">{folder}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NexusView;
