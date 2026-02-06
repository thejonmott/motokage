
import React, { useState, useEffect } from 'react';
import { Persona } from '../types';

interface ShadowSyncConsoleProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  syncStatus?: 'idle' | 'detected' | 'failed' | 'saving' | 'saved';
  onManualSave?: () => void;
}

const toBase64 = (str: string) => {
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binString);
};

const ShadowSyncConsole: React.FC<ShadowSyncConsoleProps> = ({ persona, syncStatus, onManualSave }) => {
  const [repo, setRepo] = useState(localStorage.getItem('motokage_repo') || 'thejonmott/motokage');
  const [token, setToken] = useState(localStorage.getItem('motokage_token') || '');
  const [targetEnv, setTargetEnv] = useState<'staging' | 'main'>(localStorage.getItem('motokage_env') as any || 'staging');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', msg?: string }>({ type: 'idle' });
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');

  useEffect(() => {
    localStorage.setItem('motokage_repo', repo);
    localStorage.setItem('motokage_token', token);
    localStorage.setItem('motokage_env', targetEnv);
  }, [repo, token, targetEnv]);

  const sourceFiles = [
    'App.tsx', 'types.ts', 'index.tsx', 'metadata.json', 'index.html', 'package.json', 'vite.config.ts', 'tsconfig.json', '.dockerignore',
    'server.py', 'requirements.txt', 'README.md',
    'components/Header.tsx', 'components/PersonaForm.tsx', 'components/ArchitectureView.tsx',
    'components/MemoryVault.tsx', 'components/NexusView.tsx', 'components/ChatInterface.tsx',
    'components/ComparisonView.tsx', 'components/ShadowSyncConsole.tsx', 'components/StagingView.tsx',
    'components/DNAView.tsx', 'components/OriginStoryView.tsx', 'components/MosaicView.tsx',
    'components/MandatesView.tsx', 'components/DashboardView.tsx', 'components/DocumentationView.tsx', 'default.conf', 'Dockerfile', 'cloudbuild.yaml'
  ];

  const getSystemManifests = () => ({
    'shadow_config.json': JSON.stringify(persona, null, 2),
    'Dockerfile': `# Stage 1: Build React Frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve via Python Proxy
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["python", "server.py"]`,
    'cloudbuild.yaml': `steps:
  # 1. Build and push the container image
  - name: 'gcr.io/cloud-builders/docker'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        export IMAGE_PATH="us-central1-docker.pkg.dev/$PROJECT_ID/motokage-studio/app:$BRANCH_NAME"
        docker build -t $$IMAGE_PATH .
        docker push $$IMAGE_PATH

  # 2. Deploy to Cloud Run: Bind Secret to API_KEY
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        export IMAGE_PATH="us-central1-docker.pkg.dev/$PROJECT_ID/motokage-studio/app:$BRANCH_NAME"
        
        if [ "$BRANCH_NAME" == "staging" ]; then
          gcloud run deploy motokage-studio-staging \\
            --image $$IMAGE_PATH \\
            --region us-central1 \\
            --platform managed \\
            --allow-unauthenticated \\
            --set-secrets="API_KEY=motokage-api-key:latest"
        else
          gcloud run deploy motokage-studio \\
            --image $$IMAGE_PATH \\
            --region us-central1 \\
            --platform managed \\
            --allow-unauthenticated \\
            --set-secrets="API_KEY=motokage-api-key:latest"
        fi

images:
  - 'us-central1-docker.pkg.dev/$PROJECT_ID/motokage-studio/app:$BRANCH_NAME'

options:
  logging: CLOUD_LOGGING_ONLY`
  });

  const handleAtomicSync = async () => {
    if (!repo || !token) { 
      setStatus({ type: 'error', msg: 'Missing Repo or Token' }); 
      return; 
    }
    setStatus({ type: 'loading' });
    setProgress(0);
    setCurrentFile('Handshaking with GitHub...');

    try {
      const headers = { 
        'Authorization': `token ${token}`, 
        'Accept': 'application/vnd.github.v3+json', 
        'Content-Type': 'application/json' 
      };

      const branchCheck = await fetch(`https://api.github.com/repos/${repo}/git/refs/heads/${targetEnv}`, { headers });
      
      let latestCommitSha;
      if (!branchCheck.ok) {
        setCurrentFile(`Provisioning branch: ${targetEnv}...`);
        const mainRes = await fetch(`https://api.github.com/repos/${repo}/git/refs/heads/main`, { headers });
        if (!mainRes.ok) throw new Error("Main branch not found. Repository must be initialized.");
        const mainData = await mainRes.json();
        latestCommitSha = mainData.object.sha;

        await fetch(`https://api.github.com/repos/${repo}/git/refs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ ref: `refs/heads/${targetEnv}`, sha: latestCommitSha })
        });
      } else {
        const refData = await branchCheck.json();
        latestCommitSha = refData.object.sha;
      }

      const manifests = getSystemManifests();
      const uniqueFiles = Array.from(new Set([...sourceFiles, ...Object.keys(manifests)]));
      const treeItems: any[] = [];

      for (let i = 0; i < uniqueFiles.length; i++) {
        const path = uniqueFiles[i];
        setCurrentFile(`Staging: ${path}`);
        
        let content = (manifests as any)[path] || '';
        
        if (!content || content === 'Full contents of the file' || content === '') {
          try {
            const res = await fetch(`/${path}`); 
            if (res.ok) {
              const fetched = await res.text();
              if (fetched && fetched.trim() !== '' && fetched !== 'Full contents of the file') {
                content = fetched;
              }
            }
          } catch (e) { console.warn(`Local fetch bypassed for ${path}`); }
        }

        if (content && content !== 'Full contents of the file') {
          const blobRes = await fetch(`https://api.github.com/repos/${repo}/git/blobs`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ content: toBase64(content), encoding: 'base64' })
          });
          const blobData = await blobRes.json();
          treeItems.push({ path, mode: '100644', type: 'blob', sha: blobData.sha });
        }
        
        setProgress(Math.round(((i + 1) / uniqueFiles.length) * 100));
      }

      setCurrentFile('Commiting System Upgrade...');
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
          message: `🚀 [SYSTEM_DEPLOY] Motokage Update: Codebase & Default DNA`, 
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

      setStatus({ type: 'success', msg: `CODE DEPLOYMENT TRIGGERED ON ${targetEnv.toUpperCase()}. CHECK GOOGLE CLOUD BUILD.` });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl space-y-12">
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-8">
        <div className="space-y-1 text-left">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Cloud Operations Console
          </h3>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Memory Persistence & Code Deployment</p>
        </div>
      </div>

      {/* ZONE 1: MEMORY CORE (GCS) */}
      <div className="p-10 bg-slate-950/50 border border-emerald-500/20 rounded-[2.5rem] relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
               <div className={`w-3 h-3 rounded-full ${syncStatus === 'saved' || syncStatus === 'detected' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`}></div>
               <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Memory Core (GCS)</h4>
            </div>
            <p className="text-[10px] text-slate-400 font-mono leading-relaxed max-w-lg">
              The "DNA" (Persona, Memories, Mandates) is stored in a private Google Cloud Storage bucket. 
              Changes are auto-saved. Use this control to force a manual synchronization.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="text-right">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sync Status</div>
                <div className="text-lg font-bold text-white uppercase tracking-tighter">{syncStatus === 'saved' ? 'NOMINAL' : syncStatus?.toUpperCase()}</div>
             </div>
             <button 
               onClick={onManualSave} 
               disabled={syncStatus === 'saving'}
               className="h-14 px-8 bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 rounded-2xl font-bold text-[9px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
             >
               {syncStatus === 'saving' ? 'Uplinking...' : 'Force Sync DNA'}
             </button>
          </div>
        </div>
      </div>

      {/* ZONE 2: SYSTEM INFRASTRUCTURE (GITHUB) */}
      <div className="space-y-8 pt-4">
        <div className="flex justify-between items-end">
          <div className="space-y-2 text-left">
            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">System Infrastructure (GitHub)</h4>
            <p className="text-[10px] text-slate-500 font-mono">Deploy code updates, architectural changes, or factory-reset defaults.</p>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
             <button onClick={() => setTargetEnv('staging')} className={`px-4 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all ${targetEnv === 'staging' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-600'}`}>Staging</button>
             <button onClick={() => setTargetEnv('main')} className={`px-4 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all ${targetEnv === 'main' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-slate-600'}`}>Production</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4 text-left">
            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">GitHub Repository</label>
            <input type="text" value={repo} onChange={(e) => setRepo(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500 transition-all font-mono" />
          </div>
          <div className="space-y-4 text-left">
            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Auth Token</label>
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Locked" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500 transition-all font-mono" />
          </div>
        </div>

        {/* Progress Bar for GitHub Ops */}
        {(status.type === 'loading' || progress > 0) && (
          <div className="p-6 bg-slate-950 border border-indigo-500/30 rounded-2xl space-y-3">
             <div className="flex justify-between items-end text-[8px] font-mono text-slate-400 uppercase tracking-widest">
               <span className="truncate max-w-[300px]">{currentFile || 'Initializing...'}</span>
               <span>{progress}%</span>
             </div>
             <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
             </div>
          </div>
        )}

        <button onClick={handleAtomicSync} disabled={status.type === 'loading'} className={`w-full py-6 rounded-[2rem] font-bold text-[10px] uppercase tracking-[0.4em] transition-all shadow-xl border group ${targetEnv === 'main' ? 'bg-purple-600 hover:bg-purple-700 border-purple-500/50 text-white' : 'bg-amber-600 hover:bg-amber-700 border-amber-500/50 text-white'}`}>
          {status.type === 'loading' ? 'DEPLOYING SYSTEM UPDATES...' : `DEPLOY SYSTEM UPDATE TO ${targetEnv.toUpperCase()}`}
        </button>

        {status.msg && (
          <div className={`p-6 rounded-2xl text-[9px] font-mono text-center uppercase tracking-widest border animate-in fade-in slide-in-from-top-2 ${status.type === 'error' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShadowSyncConsole;
