import React, { useState, useEffect } from 'react';
import { Persona } from '../types';

interface ShadowSyncConsoleProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
}

const toBase64 = (str: string) => {
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binString);
};

const ShadowSyncConsole: React.FC<ShadowSyncConsoleProps> = ({ persona }) => {
  const [repo, setRepo] = useState(localStorage.getItem('motokage_repo') || 'thejonmott/motokage');
  const [token, setToken] = useState(localStorage.getItem('motokage_token') || '');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', msg?: string }>({ type: 'idle' });
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');

  useEffect(() => {
    localStorage.setItem('motokage_repo', repo);
    localStorage.setItem('motokage_token', token);
  }, [repo, token]);

  const sourceFiles = [
    'App.tsx', 'types.ts', 'index.tsx', 'metadata.json', 'index.html', 'package.json', 'vite.config.ts', 'tsconfig.json', 'cloudbuild.yaml', '.dockerignore',
    'components/Header.tsx', 'components/PersonaForm.tsx', 'components/ArchitectureView.tsx',
    'components/MemoryVault.tsx', 'components/NexusView.tsx', 'components/ChatInterface.tsx',
    'components/ComparisonView.tsx', 'components/ShadowSyncConsole.tsx', 'components/StagingView.tsx',
    'components/DNAView.tsx', 'components/OriginStoryView.tsx', 'components/MosaicView.tsx',
    'components/MandatesView.tsx', 'components/DashboardView.tsx'
  ];

  const getSystemManifests = () => ({
    'Dockerfile': `FROM node:20-slim AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nRUN sed -i 's/80/8080/g' /etc/nginx/conf.d/default.conf\nCOPY --from=build /app/dist /usr/share/nginx/html\nEXPOSE 8080\nCMD ["nginx", "-g", "daemon off;"]`,
    'shadow_config.json': JSON.stringify(persona, null, 2)
  });

  const handleAtomicSync = async () => {
    if (!repo || !token) { setStatus({ type: 'error', msg: 'Missing Repo or Token' }); return; }
    setStatus({ type: 'loading' });
    setProgress(0);

    try {
      const headers = { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' };
      const manifests = getSystemManifests();
      const allFiles = [...sourceFiles, ...Object.keys(manifests)];
      
      const refRes = await fetch(`https://api.github.com/repos/${repo}/git/refs/heads/main`, { headers });
      if (!refRes.ok) throw new Error("Branch 'main' not found. Ensure repo is initialized.");
      const refData = await refRes.json();
      const latestCommitSha = refData.object.sha;

      const treeItems: any[] = [];
      for (let i = 0; i < allFiles.length; i++) {
        const path = allFiles[i];
        setCurrentFile(path);
        let content = manifests[path as keyof typeof manifests] || '';
        if (!content) {
          const res = await fetch(`/${path}`); // Ensure root relative fetch
          if (!res.ok) continue;
          content = await res.text();
        }

        const blobRes = await fetch(`https://api.github.com/repos/${repo}/git/blobs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ content: toBase64(content), encoding: 'base64' })
        });
        const blobData = await blobRes.json();
        treeItems.push({ path, mode: '100644', type: 'blob', sha: blobData.sha });
        setProgress(Math.round(((i + 1) / allFiles.length) * 80));
      }

      const treeRes = await fetch(`https://api.github.com/repos/${repo}/git/trees`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ base_tree: latestCommitSha, tree: treeItems })
      });
      const treeData = await treeRes.json();
      
      const commitRes = await fetch(`https://api.github.com/repos/${repo}/git/commits`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: `Identity Mesh Update: ${new Date().toISOString()}`, tree: treeData.sha, parents: [latestCommitSha] })
      });
      const commitData = await commitRes.json();

      await fetch(`https://api.github.com/repos/${repo}/git/refs/heads/main`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ sha: commitData.sha })
      });

      setProgress(100);
      setStatus({ type: 'success', msg: 'Core Mesh Synchronized. Remote Build Triggered.' });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl space-y-10">
      <div className="flex justify-between items-center border-b border-slate-800 pb-8">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Global Uplink v4.2</h3>
          <p className="text-[10px] text-slate-500 font-mono uppercase">Identity State Synchronizer</p>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href="https://console.cloud.google.com/run" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[9px] font-bold text-indigo-400 uppercase tracking-widest hover:border-indigo-500/50 transition-all flex items-center gap-2"
          >
            Cloud Registry
          </a>
          <div className={`w-2 h-2 rounded-full ${status.type === 'loading' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">GitHub Repository</label>
          <input type="text" value={repo} onChange={(e) => setRepo(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500 transition-all font-mono" />
        </div>
        <div className="space-y-4">
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Access Token</label>
          <input type="password" value={token} onChange={(e) => setToken(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500 transition-all font-mono" />
        </div>
      </div>

      <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
         <h4 className="text-[9px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
           Build Integrity
         </h4>
         <p className="text-[10px] text-slate-500 font-mono leading-relaxed uppercase tracking-wider">
           Uplink includes all core components. Overwrites <span className="text-white">main</span> branch and triggers <span className="text-indigo-400">Cloud Build</span>.
         </p>
      </div>

      <div className="space-y-8">
        <button onClick={handleAtomicSync} disabled={status.type === 'loading'} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-6 rounded-3xl font-bold text-[11px] uppercase tracking-[0.4em] transition-all shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          {status.type === 'loading' ? 'Encrypting & Pushing Core Mesh...' : 'Uplink Local State to Registry'}
        </button>
        {status.type === 'loading' && (
          <div className="space-y-4">
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
               <div className="h-full bg-indigo-500 transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.5)]" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-[8px] text-slate-500 font-mono text-center uppercase tracking-widest">TRANSMITTING: <span className="text-white">{currentFile}</span></p>
          </div>
        )}
        {status.msg && (
          <div className={`p-6 rounded-2xl text-[10px] font-mono text-center uppercase tracking-widest border animate-in fade-in slide-in-from-top-2 ${status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShadowSyncConsole;