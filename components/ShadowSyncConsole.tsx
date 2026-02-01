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
          const res = await fetch(`/${path}`); 
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
        body: JSON.stringify({ 
          message: `Digital Twin Sync [${targetEnv.toUpperCase()}]: ${new Date().toISOString()}`, 
          tree: treeData.sha, 
          parents: [latestCommitSha] 
        })
      });
      const commitData = await commitRes.json();

      await fetch(`https://api.github.com/repos/${repo}/git/refs/heads/${targetEnv}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ sha: commitData.sha })
      });

      setProgress(100);
      setStatus({ type: 'success', msg: `${targetEnv.toUpperCase()} Sync Successful. Build Pipeline Patched.` });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl space-y-10">
      <div className="flex justify-between items-center border-b border-slate-800 pb-8">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Global Uplink v7.2</h3>
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

      <div className="p-8 bg-slate-950 border border-indigo-500/20 rounded-3xl space-y-6">
        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
           Build Logic: "Safe Shell" Protocol
        </h4>
        <div className="grid md:grid-cols-2 gap-8 text-[9px] font-mono leading-relaxed">
           <div className="space-y-3">
              <p className="text-slate-400">Conflict Resolved: <span className="text-white">Substitution Conflicts</span></p>
              <ul className="text-slate-500 space-y-1">
                <li>1. Code now handles <span className="text-white">Environment Detection</span> via shell.</li>
                <li>2. <span className="text-white">Dockerfile</span> has been injected into the file stack.</li>
                <li>3. No manual GCP Substitution variables are required.</li>
                <li>4. <span className="text-emerald-400 font-bold underline">Sync again to update the logic.</span></li>
              </ul>
           </div>
           <div className="p-4 bg-slate-900 rounded-xl border border-white/5 space-y-2">
              <p className="text-slate-400 italic">"The build script has been simplified to direct shell execution, preventing GCP's parser from tripping on variable names."</p>
              <a href="https://console.cloud.google.com/cloud-build/builds?project=motokage" target="_blank" rel="noreferrer" className="block text-center py-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30 hover:bg-indigo-600/30 transition-all">Monitor Build Progress</a>
           </div>
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
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Personal Access Token</label>
          <input 
            type="password" 
            value={token} 
            onChange={(e) => setToken(e.target.value)} 
            placeholder="Paste gh_token here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500 transition-all font-mono" 
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <button onClick={handleAtomicSync} disabled={status.type === 'loading'} className={`flex-grow py-6 rounded-3xl font-bold text-[11px] uppercase tracking-[0.4em] transition-all shadow-2xl relative overflow-hidden group border ${targetEnv === 'main' ? 'bg-purple-600 hover:bg-purple-700 border-purple-500/50' : 'bg-amber-600 hover:bg-amber-700 border-amber-500/50'}`}>
          {status.type === 'loading' ? 'Deploying Patched Logic...' : `Sync Patched Identity to ${targetEnv.toUpperCase()}`}
        </button>
      </div>

      {status.type === 'loading' && (
        <div className="space-y-4">
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
             <div className={`h-full transition-all duration-300 shadow-lg ${targetEnv === 'main' ? 'bg-purple-500' : 'bg-amber-500'}`} style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-[8px] text-slate-500 font-mono text-center uppercase tracking-widest">INJECTING: <span className="text-white">{currentFile}</span></p>
        </div>
      )}
      
      {status.msg && (
        <div className={`p-6 rounded-2xl text-[10px] font-mono text-center uppercase tracking-widest border animate-in fade-in slide-in-from-top-2 ${status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
          {status.msg}
          {status.type === 'success' && (
            <div className="mt-4 space-y-3">
              <div className="flex justify-center gap-4">
                <a href="https://console.cloud.google.com/cloud-build/builds?project=motokage" target="_blank" rel="noreferrer" className="px-4 py-2 bg-slate-800 rounded-lg text-[8px] hover:bg-slate-700 transition-all">View Patch Build</a>
                <a href={targetEnv === 'main' ? prodUrl : stagingUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white/10 rounded-lg text-[8px] hover:bg-white/20 transition-all">Preview Site</a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShadowSyncConsole;