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
  const [targetEnv, setTargetEnv] = useState<'staging' | 'main'>(localStorage.getItem('motokage_env') as any || 'staging');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', msg?: string }>({ type: 'idle' });
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');

  const projectSuffix = "419113009106.us-central1.run.app"; 
  const stagingUrl = `https://motokage-studio-staging-${projectSuffix}`;
  const prodUrl = `https://motokage-studio-${projectSuffix}`;

  useEffect(() => {
    localStorage.setItem('motokage_repo', repo);
    localStorage.setItem('motokage_token', token);
    localStorage.setItem('motokage_env', targetEnv);
  }, [repo, token, targetEnv]);

  // Comprehensive list of project files for the Atomic Sync
  const sourceFiles = [
    'App.tsx', 'types.ts', 'index.tsx', 'metadata.json', 'index.html', 'package.json', 'vite.config.ts', 'tsconfig.json', 'cloudbuild.yaml', '.dockerignore', 'Dockerfile', 'default.conf',
    'components/Header.tsx', 'components/PersonaForm.tsx', 'components/ArchitectureView.tsx',
    'components/MemoryVault.tsx', 'components/NexusView.tsx', 'components/ChatInterface.tsx',
    'components/ComparisonView.tsx', 'components/ShadowSyncConsole.tsx', 'components/StagingView.tsx',
    'components/DNAView.tsx', 'components/OriginStoryView.tsx', 'components/MosaicView.tsx',
    'components/MandatesView.tsx', 'components/DashboardView.tsx'
  ];

  const getSystemManifests = () => ({
    'shadow_config.json': JSON.stringify(persona, null, 2)
  });

  const handleAtomicSync = async () => {
    if (!repo || !token) { 
      setStatus({ type: 'error', msg: 'Missing Repo or Token' }); 
      return; 
    }
    setStatus({ type: 'loading' });
    setProgress(0);
    setCurrentFile('Initializing connection...');

    try {
      const headers = { 
        'Authorization': `token ${token}`, 
        'Accept': 'application/vnd.github.v3+json', 
        'Content-Type': 'application/json' 
      };

      const branchCheck = await fetch(`https://api.github.com/repos/${repo}/git/refs/heads/${targetEnv}`, { headers });
      
      let latestCommitSha;
      if (!branchCheck.ok) {
        setCurrentFile(`Provisioning ${targetEnv} branch...`);
        const mainRes = await fetch(`https://api.github.com/repos/${repo}/git/refs/heads/main`, { headers });
        if (!mainRes.ok) throw new Error("Main branch not found. Ensure 'main' exists.");
        const mainData = await mainRes.json();
        const mainSha = mainData.object.sha;

        const createRes = await fetch(`https://api.github.com/repos/${repo}/git/refs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ ref: `refs/heads/${targetEnv}`, sha: mainSha })
        });
        if (!createRes.ok) throw new Error(`Failed to auto-create '${targetEnv}' branch.`);
        latestCommitSha = mainSha;
      } else {
        const refData = await branchCheck.json();
        latestCommitSha = refData.object.sha;
      }

      const manifests = getSystemManifests();
      const allFiles = [...sourceFiles, ...Object.keys(manifests)];
      const treeItems: any[] = [];

      for (let i = 0; i < allFiles.length; i++) {
        const path = allFiles[i];
        setCurrentFile(path);
        let content = manifests[path as keyof typeof manifests] || '';
        
        if (!content) {
          try {
            const res = await fetch(`/${path}`); 
            if (!res.ok) {
                console.warn(`File not found locally: ${path}. Skipping.`);
                continue;
            }
            content = await res.text();
          } catch (e) {
            console.error(`Error fetching ${path}:`, e);
            continue;
          }
        }

        const blobRes = await fetch(`https://api.github.com/repos/${repo}/git/blobs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ content: toBase64(content), encoding: 'base64' })
        });
        
        if (!blobRes.ok) {
            const errorData = await blobRes.json();
            throw new Error(`GitHub Blob Error (${path}): ${errorData.message}`);
        }
        
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
        body: JSON.stringify({ 
          message: `Digital Twin Sync [${targetEnv.toUpperCase()}]: ${new Date().toISOString()}`, 
          tree: treeData.sha, 
          parents: [latestCommitSha] 
        })
      });
      const commitData = await commitRes.json();

      const patchRes = await fetch(`https://api.github.com/repos/${repo}/git/refs/heads/${targetEnv}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ sha: commitData.sha })
      });

      if (!patchRes.ok) throw new Error("Failed to update branch reference.");

      setProgress(100);
      setStatus({ type: 'success', msg: `${targetEnv.toUpperCase()} Sync Successful. Build files injected to GitHub.` });
    } catch (e: any) {
      console.error(e);
      setStatus({ type: 'error', msg: e.message });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl space-y-10">
      <div className="flex justify-between items-center border-b border-slate-800 pb-8">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Global Uplink v6.5</h3>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">GCP Project: motokage</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
             <button onClick={() => setTargetEnv('staging')} className={`px-4 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all ${targetEnv === 'staging' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-600'}`}>Staging</button>
             <button onClick={() => setTargetEnv('main')} className={`px-4 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all ${targetEnv === 'main' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-slate-600'}`}>Production</button>
          </div>
          <div className={`w-2 h-2 rounded-full ${status.type === 'loading' ? 'bg-blue-500 animate-pulse' : (targetEnv === 'main' ? 'bg-purple-500' : 'bg-amber-500')}`}></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">GitHub Repository</label>
          <input 
            type="text" 
            value={repo} 
            onChange={(e) => setRepo(e.target.value)} 
            placeholder="username/repository"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500 transition-all font-mono" 
          />
        </div>
        <div className="space-y-4">
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">GitHub Token (PAT)</label>
          <input 
            type="password" 
            value={token} 
            onChange={(e) => setToken(e.target.value)} 
            placeholder="Paste gh_token here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500 transition-all font-mono" 
          />
        </div>
      </div>
      
      {/* TRIGGER ACTION CENTER - SPECIFIC TO THE USER'S SCREENSHOT ISSUES */}
      <div className="p-8 bg-slate-950 border border-red-500/40 rounded-[2.5rem] space-y-6 shadow-[0_0_40px_rgba(239,68,68,0.15)] relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
         </div>
         
         <h4 className="text-[11px] font-bold text-red-400 uppercase tracking-[0.4em] flex items-center gap-3">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
           GCP Deployment Fix Center
         </h4>
         
         <div className="grid md:grid-cols-2 gap-10">
           <div className="space-y-4">
             <div className="space-y-1">
               <p className="text-[10px] font-bold text-white uppercase tracking-wider">Target: motokage-studio-staging</p>
               <p className="text-[9px] text-red-500 font-mono animate-pulse uppercase">Critical Action: Remove "Autodetected"</p>
             </div>
             <p className="text-[9px] text-slate-500 leading-relaxed font-mono uppercase">
                "Autodetected" triggers skip the custom build steps in cloudbuild.yaml. This causes the 404 error because the app is never properly packaged.
             </p>
             <ul className="text-[9px] text-slate-300 font-mono space-y-2 uppercase leading-relaxed">
               <li>1. Open Google Cloud Console → Cloud Build Triggers</li>
               <li>2. Edit <span className="text-white bg-slate-800 px-1 rounded">motokage-studio-staging</span></li>
               <li>3. Configuration: Switch to <span className="text-amber-400 font-bold">Cloud Build configuration file (yaml or json)</span></li>
               <li>4. Path: <span className="text-white bg-slate-800 px-1 rounded">cloudbuild.yaml</span></li>
             </ul>
           </div>
           
           <div className="space-y-4">
             <div className="space-y-1">
               <p className="text-[10px] font-bold text-white uppercase tracking-wider">Target: rmgpgab-motokage...</p>
               <p className="text-[9px] text-purple-400 font-mono uppercase">Action: Standardize Production</p>
             </div>
             <p className="text-[9px] text-slate-500 leading-relaxed font-mono uppercase">
                Rename the autogenerated trigger to keep your environment clean and ensure it follows the main branch.
             </p>
             <ul className="text-[9px] text-slate-300 font-mono space-y-2 uppercase leading-relaxed">
               <li>1. Rename to: <span className="text-white bg-slate-800 px-1 rounded">motokage-studio-main</span></li>
               <li>2. Event: Push to branch <span className="text-purple-400 font-bold">^main$</span></li>
               <li>3. Configuration: Also set to <span className="text-white bg-slate-800 px-1 rounded">cloudbuild.yaml</span></li>
             </ul>
           </div>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <button onClick={handleAtomicSync} disabled={status.type === 'loading'} className={`flex-grow py-6 rounded-3xl font-bold text-[11px] uppercase tracking-[0.4em] transition-all shadow-2xl relative overflow-hidden group border ${targetEnv === 'main' ? 'bg-purple-600 hover:bg-purple-700 border-purple-500/50' : 'bg-amber-600 hover:bg-amber-700 border-amber-500/50'}`}>
          {status.type === 'loading' ? 'Transmitting Identity Mesh...' : `Sync to GitHub ${targetEnv.toUpperCase()}`}
        </button>
      </div>

      {status.type === 'loading' && (
        <div className="space-y-4">
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
             <div className={`h-full transition-all duration-300 shadow-lg ${targetEnv === 'main' ? 'bg-purple-500' : 'bg-amber-500'}`} style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-[8px] text-slate-500 font-mono text-center uppercase tracking-widest">UPLOADING: <span className="text-white">{currentFile}</span></p>
        </div>
      )}
      
      {status.msg && (
        <div className={`p-6 rounded-2xl text-[10px] font-mono text-center uppercase tracking-widest border animate-in fade-in slide-in-from-top-2 ${status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
          {status.msg}
          {status.type === 'success' && (
            <div className="mt-4 space-y-3">
              <p className="text-[8px] text-slate-400 normal-case italic font-medium">Files transmitted. Once you have fixed the triggers in the Google Cloud Console, click "RUN" manually on the trigger to start the build.</p>
              <div className="flex justify-center gap-4">
                <a href="https://console.cloud.google.com/cloud-build/builds?project=motokage" target="_blank" rel="noreferrer" className="px-4 py-2 bg-slate-800 rounded-lg text-[8px] hover:bg-slate-700 transition-all">GCP Build Console</a>
                <a href={targetEnv === 'main' ? prodUrl : stagingUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white/10 rounded-lg text-[8px] hover:bg-white/20 transition-all">Launch Preview</a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShadowSyncConsole;