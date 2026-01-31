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
    'App.tsx', 'types.ts', 'index.tsx', 'metadata.json', 'index.html', 'package.json', 'vite.config.ts', 'tsconfig.json',
    'components/Header.tsx', 'components/PersonaForm.tsx', 'components/ArchitectureView.tsx',
    'components/MemoryVault.tsx', 'components/NexusView.tsx', 'components/ChatInterface.tsx',
    'components/ComparisonView.tsx', 'components/ShadowSyncConsole.tsx', 'components/StagingView.tsx'
  ];

  const getSystemManifests = () => ({
    'Dockerfile': `FROM node:20-slim AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nRUN sed -i 's/80/8080/g' /etc/nginx/conf.d/default.conf\nCOPY --from=build /app/dist /usr/share/nginx/html\nEXPOSE 8080\nCMD ["nginx", "-g", "daemon off;"]`,
    'cloudbuild.yaml': `steps:\n  - name: 'gcr.io/cloud-builders/docker'\n    args: ['build', '-t', 'gcr.io/$PROJECT_ID/motokage-studio', '.']\n  - name: 'gcr.io/cloud-builders/docker'\n    args: ['push', 'gcr.io/$PROJECT_ID/motokage-studio']\n  - name: 'gcloud'\n    args: ['run', 'deploy', 'motokage-studio', '--image', 'gcr.io/$PROJECT_ID/motokage-studio', '--region', 'us-central1', '--platform', 'managed', '--allow-unauthenticated', '--port', '8080']\nimages: ['gcr.io/$PROJECT_ID/motokage-studio']`,
    '.dockerignore': `node_modules\ndist\n.git\n.DS_Store`,
    'package.json': JSON.stringify({
      "name": "motokage-studio",
      "private": true,
      "version": "1.0.0",
      "type": "module",
      "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
      "dependencies": { "@google/genai": "^1.38.0", "react": "^19.0.0", "react-dom": "^19.0.0" },
      "devDependencies": { "@types/react": "^19.0.0", "@types/react-dom": "^19.0.0", "@vitejs/plugin-react": "^4.3.4", "typescript": "^5.7.3", "vite": "^6.0.7" }
    }, null, 2),
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
      if (!refRes.ok) throw new Error("Could not find 'main' branch. Ensure repo exists and is initialized.");
      const refData = await refRes.json();
      const latestCommitSha = refData.object.sha;

      const treeItems: any[] = [];
      for (let i = 0; i < allFiles.length; i++) {
        const path = allFiles[i];
        setCurrentFile(path);
        let content = manifests[path as keyof typeof manifests] || '';
        if (!content) {
          const res = await fetch(path);
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
        setProgress(Math.round(((i + 1) / allFiles.length) * 50));
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
        body: JSON.stringify({ message: `Atomic Sync: ${new Date().toISOString()}`, tree: treeData.sha, parents: [latestCommitSha] })
      });
      const commitData = await commitRes.json();

      await fetch(`https://api.github.com/repos/${repo}/git/refs/heads/main`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ sha: commitData.sha })
      });

      setProgress(100);
      setStatus({ type: 'success', msg: 'Atomic Uplink Successful. Single build triggered.' });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl space-y-8">
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Cloud Uplink v3.1</h3>
          <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">Atomic Commit Protocol (Single-Trigger)</p>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href="https://console.cloud.google.com/run" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[8px] font-bold text-indigo-400 uppercase tracking-widest hover:border-indigo-500/50 transition-all flex items-center gap-2"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
            GCP Console
          </a>
          <div className={`w-2 h-2 rounded-full ${status.type === 'loading' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
          <span className="text-[9px] font-mono text-slate-500 uppercase">Uplink_Online</span>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Repository</label>
          <input type="text" value={repo} onChange={(e) => setRepo(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs text-white outline-none focus:border-blue-500 transition-all" />
        </div>
        <div className="space-y-4">
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Access Token</label>
          <input type="password" value={token} onChange={(e) => setToken(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs text-white outline-none focus:border-blue-500 transition-all" />
        </div>
      </div>
      <div className="space-y-6">
        <button onClick={handleAtomicSync} disabled={status.type === 'loading'} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl">
          {status.type === 'loading' ? 'Executing Atomic Commit...' : 'Initialize Atomic Deploy'}
        </button>
        {status.type === 'loading' && (
          <div className="space-y-3">
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }}></div></div>
            <p className="text-[8px] text-slate-500 font-mono text-center uppercase tracking-widest">Processing: <span className="text-white">{currentFile}</span></p>
          </div>
        )}
        {status.msg && (
          <div className={`p-5 rounded-2xl text-[10px] font-mono text-center uppercase tracking-widest border ${status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShadowSyncConsole;