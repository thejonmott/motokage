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
    'Dockerfile': `FROM node:20-slim AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nCOPY --from=build /app/dist /usr/share/nginx/html\nEXPOSE 80\nCMD ["nginx", "-g", "daemon off;"]`,
    'cloudbuild.yaml': `steps:\n  - name: 'gcr.io/cloud-builders/docker'\n    args: ['build', '-t', 'gcr.io/$PROJECT_ID/motokage-studio', '.']\n  - name: 'gcr.io/cloud-builders/docker'\n    args: ['push', 'gcr.io/$PROJECT_ID/motokage-studio']\n  - name: 'gcloud'\n    args: ['run', 'deploy', 'motokage-studio', '--image', 'gcr.io/$PROJECT_ID/motokage-studio', '--region', 'us-central1', '--platform', 'managed', '--allow-unauthenticated']\nimages: ['gcr.io/$PROJECT_ID/motokage-studio']`,
    '.dockerignore': `node_modules\ndist\n.git\n.DS_Store`,
    'package.json': JSON.stringify({
      "name": "motokage-studio",
      "private": true,
      "version": "1.0.0",
      "type": "module",
      "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
      },
      "dependencies": {
        "@google/genai": "^1.38.0",
        "react": "^19.0.0",
        "react-dom": "^19.0.0"
      },
      "devDependencies": {
        "@types/react": "^19.0.0",
        "@types/react-dom": "^19.0.0",
        "@vitejs/plugin-react": "^4.3.4",
        "typescript": "^5.7.3",
        "vite": "^6.0.7"
      }
    }, null, 2),
    'shadow_config.json': JSON.stringify(persona, null, 2)
  });

  const uploadFile = async (path: string, content: string) => {
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;
    const getRes = await fetch(url, { headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' } });
    let sha;
    if (getRes.ok) { const data = await getRes.json(); sha = data.sha; }
    const putRes = await fetch(url, {
      method: 'PUT',
      headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `sync: ${path}`, content: toBase64(content), sha })
    });
    if (!putRes.ok) throw new Error(`Failed to upload ${path}`);
  };

  const handleSync = async () => {
    if (!repo || !token) { setStatus({ type: 'error', msg: 'Missing Repo or Token' }); return; }
    setStatus({ type: 'loading' });
    setProgress(0);
    try {
      const manifests = getSystemManifests();
      const allFiles = [...sourceFiles, ...Object.keys(manifests)];
      for (let i = 0; i < allFiles.length; i++) {
        const path = allFiles[i];
        setCurrentFile(path);
        let content = '';
        if (manifests[path as keyof typeof manifests]) {
          content = manifests[path as keyof typeof manifests];
        } else {
          const res = await fetch(path);
          if (!res.ok) continue;
          content = await res.text();
        }
        await uploadFile(path, content);
        await new Promise(r => setTimeout(r, 450));
        setProgress(Math.round(((i + 1) / allFiles.length) * 100));
      }
      setStatus({ type: 'success', msg: 'Uplink Ready. Cloud Run build initiated.' });
    } catch (e: any) { setStatus({ type: 'error', msg: e.message }); }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl space-y-8">
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Cloud Uplink v2.1</h3>
          <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">Refined Build Manifest for GCP</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${status.type === 'loading' ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}></div>
          <span className="text-[9px] font-mono text-slate-500 uppercase">Uplink_Ready</span>
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
        <button onClick={handleSync} disabled={status.type === 'loading'} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl">
          {status.type === 'loading' ? 'Pushing Manifests...' : 'Sync & Build Enclave'}
        </button>
        {status.type === 'loading' && (
          <div className="space-y-3">
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }}></div></div>
            <p className="text-[8px] text-slate-500 font-mono text-center uppercase tracking-widest">Pushing: <span className="text-white">{currentFile}</span> ({progress}%)</p>
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