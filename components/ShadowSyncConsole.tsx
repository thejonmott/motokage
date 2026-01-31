import React, { useState, useEffect } from 'react';
import { Persona } from '../types';

interface ShadowSyncConsoleProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
}

const toBase64 = (str: string) => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    console.error("Base64 Encoding Error:", e);
    return "";
  }
};

const CloudRunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" fillOpacity="0.1"/>
    <path d="M2 17L12 22L22 17M2 12L12 17L22 12" />
  </svg>
);

// MANIFEST RECOVERY: Verified deployment configs for Cloud Run
const FALLBACK_MANIFESTS: Record<string, string> = {
  'Dockerfile': `# Stage 1: Build
FROM node:20-slim AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
RUN sed -i 's/listen\\(.*\\)80;/listen 8080;/' /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]`,
  'cloudbuild.yaml': `steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/motokage-studio', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/motokage-studio']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args: ['run', 'deploy', 'motokage-studio', '--image', 'gcr.io/$PROJECT_ID/motokage-studio', '--region', 'us-central1', '--platform', 'managed', '--allow-unauthenticated']
images: ['gcr.io/$PROJECT_ID/motokage-studio']
options: { logging: CLOUD_LOGGING_ONLY }`
};

const ShadowSyncConsole: React.FC<ShadowSyncConsoleProps> = ({ persona, setPersona }) => {
  const [activeView, setActiveView] = useState<'gateways' | 'blueprint'>('gateways');
  const [repo, setRepo] = useState(localStorage.getItem('motokage_repo') || '');
  const [token, setToken] = useState(localStorage.getItem('motokage_token') || '');
  const [showHelp, setShowHelp] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', msg?: string }>({ type: 'idle' });

  useEffect(() => {
    localStorage.setItem('motokage_repo', repo);
    localStorage.setItem('motokage_token', token);
  }, [repo, token]);

  const blueprintFiles = [
    'App.tsx', 'types.ts', 'index.tsx', 'metadata.json', 'index.html',
    'components/Header.tsx', 'components/PersonaForm.tsx', 'components/ArchitectureView.tsx',
    'components/MemoryVault.tsx', 'components/NexusView.tsx', 'components/ChatInterface.tsx',
    'components/ComparisonView.tsx', 'components/ShadowSyncConsole.tsx', 'components/StagingView.tsx', 
    'Dockerfile', 'cloudbuild.yaml', 'package.json', 'vite.config.ts', 'tsconfig.json'
  ];

  const fetchFileContent = async (path: string) => {
    try {
      const res = await fetch(path);
      if (res.ok) return await res.text();
      // Use fallback if it's a critical deployment manifest
      if (FALLBACK_MANIFESTS[path]) return FALLBACK_MANIFESTS[path];
      return null;
    } catch (e) {
      if (FALLBACK_MANIFESTS[path]) return FALLBACK_MANIFESTS[path];
      return null;
    }
  };

  const pushFileToGitHub = async (filePath: string, content: string, cleanRepo: string, cleanToken: string) => {
    const url = `https://api.github.com/repos/${cleanRepo}/contents/${filePath}`;
    let sha = '';
    try {
      const getRes = await fetch(url, { headers: { 'Authorization': `token ${cleanToken}`, 'Accept': 'application/vnd.github.v3+json' } });
      if (getRes.ok) { const data = await getRes.json(); sha = data.sha; }
    } catch (e) { }

    const encodedContent = toBase64(content);
    const putRes = await fetch(url, {
      method: 'PUT',
      headers: { 'Authorization': `token ${cleanToken}`, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' },
      body: JSON.stringify({
        message: `blueprint: automated source update [${filePath}]`,
        content: encodedContent,
        sha: sha || undefined
      })
    });
    return putRes.ok;
  };

  const handleBlueprintSync = async () => {
    const cleanRepo = repo.trim().replace(/\/$/, "");
    const cleanToken = token.trim();
    if (!cleanRepo || !cleanToken) { setStatus({ type: 'error', msg: 'REPO & TOKEN REQUIRED' }); return; }
    
    setStatus({ type: 'loading' });
    setSyncProgress(0);
    
    try {
      for (let i = 0; i < blueprintFiles.length; i++) {
        const path = blueprintFiles[i];
        setCurrentFile(path);
        const content = await fetchFileContent(path);
        
        if (content) {
          const success = await pushFileToGitHub(path, content, cleanRepo, cleanToken);
          if (!success) throw new Error(`GitHub Rejected: ${path}`);
        }
        setSyncProgress(Math.round(((i + 1) / blueprintFiles.length) * 100));
      }
      
      // Sync the DNA as well
      await pushFileToGitHub('shadow_config.json', JSON.stringify(persona, null, 2), cleanRepo, cleanToken);
      setStatus({ type: 'success', msg: 'UPLINK COMPLETE: TRIGGERING CLOUD BUILD' });
    } catch (e: any) { 
      setStatus({ type: 'error', msg: `SYNC_FAILURE: ${e.message}` }); 
    } finally {
      setCurrentFile('');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] overflow-hidden shadow-2xl animate-in fade-in duration-700 relative">
      <div className="px-10 py-8 bg-slate-950/50 border-b border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-blue-400 shadow-inner">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeDasharray="4 2"/>
              <path d="M12 8V12L14 14" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-[0.2em] leading-tight font-heading">Cloud Handshake</h3>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">Direct System-to-GitHub Pipeline</p>
          </div>
        </div>
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button onClick={() => setActiveView('gateways')} className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${activeView === 'gateways' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:text-white'}`}>Nodes</button>
          <button onClick={() => setActiveView('blueprint')} className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${activeView === 'blueprint' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:text-white'}`}>Self-Deploy</button>
        </div>
      </div>

      <div className="p-10 min-h-[420px]">
        {activeView === 'gateways' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'github', name: 'Source Hub', label: 'GitHub API', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>, color: 'text-white', bg: 'bg-slate-800' },
                { id: 'gcp', name: 'Compute Node', label: 'Cloud Run', icon: <CloudRunIcon />, color: 'text-blue-400', bg: 'bg-blue-500/5' },
              ].map((ep) => (
                <div key={ep.id} className={`group p-8 ${ep.bg} border border-slate-800 rounded-[2.5rem] flex flex-col items-center text-center space-y-4`}>
                  <div className={`${ep.color}`}>{ep.icon}</div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">{ep.name}</div>
                    <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{ep.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
               <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.1em] leading-relaxed text-center">
                 MANIFEST RECOVERY ACTIVE: Synchronize now to push verified Docker & CloudBuild blueprints to your repo.
               </p>
            </div>
          </div>
        )}

        {activeView === 'blueprint' && (
          <div className="max-w-md mx-auto space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-2">
               <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">BLUEPRINT SYNCHRONIZATION</h4>
               <button onClick={() => setShowHelp(!showHelp)} className="text-[9px] text-slate-500 hover:text-white underline uppercase tracking-widest">
                 {showHelp ? "Close" : "Setup Help"}
               </button>
            </div>

            {showHelp && (
              <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-4">
                <p className="text-[9px] text-slate-400 font-mono leading-relaxed uppercase">
                  Uplink pushes your current state to GitHub. The integrated "Manifest Recovery" ensures the **Dockerfile** is included even if local access is restricted.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <input type="text" value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="GitHub Repo (username/repo)" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-800" />
              <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="GitHub Personal Access Token" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-800" />
            </div>

            <div className="space-y-6">
              <button onClick={handleBlueprintSync} disabled={status.type === 'loading'} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl">
                <CloudRunIcon /> {status.type === 'loading' ? 'Uplinking Blueprint...' : 'Synchronize Source & DNA'}
              </button>
              {status.type === 'loading' && (
                <div className="space-y-2">
                  <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${syncProgress}%` }}></div>
                  </div>
                  <p className="text-[7px] text-slate-600 font-mono text-center uppercase tracking-widest">
                    Pushing {currentFile}: {syncProgress}%
                  </p>
                </div>
              )}
            </div>

            {status.msg && (
              <div className={`p-4 rounded-xl text-center text-[9px] font-mono uppercase tracking-widest animate-in fade-in ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                {status.msg}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-10 py-5 bg-blue-600/5 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-600">
        <span className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${repo ? 'bg-blue-500' : 'bg-slate-700'}`}></span>
          NODE: {repo ? repo.toUpperCase() : 'STANDBY'}
        </span>
        <span className="uppercase tracking-[0.4em]">Recovery Protocol: v1.1.0</span>
      </div>
    </div>
  );
};

export default ShadowSyncConsole;