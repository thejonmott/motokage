
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

  useEffect(() => {
    localStorage.setItem('motokage_repo', repo);
    localStorage.setItem('motokage_token', token);
    localStorage.setItem('motokage_env', targetEnv);
  }, [repo, token, targetEnv]);

  const sourceFiles = [
    'App.tsx', 'types.ts', 'index.tsx', 'metadata.json', 'index.html', 'package.json', 'vite.config.ts', 'tsconfig.json', '.dockerignore',
    'server.py', 'requirements.txt',
    'components/Header.tsx', 'components/PersonaForm.tsx', 'components/ArchitectureView.tsx',
    'components/MemoryVault.tsx', 'components/NexusView.tsx', 'components/ChatInterface.tsx',
    'components/ComparisonView.tsx', 'components/ShadowSyncConsole.tsx', 'components/StagingView.tsx',
    'components/DNAView.tsx', 'components/OriginStoryView.tsx', 'components/MosaicView.tsx',
    'components/MandatesView.tsx', 'components/DashboardView.tsx', 'components/DocumentationView.tsx', 'default.conf', 'Dockerfile', 'cloudbuild.yaml'
  ];

  const getSystemManifests = () => ({
    'shadow_config.json': JSON.stringify(persona, null, 2),
    'Dockerfile': `# Stage 1: Build React
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Python Proxy Server
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["python", "server.py"]`,
    'cloudbuild.yaml': `steps:
  - name: 'gcr.io/cloud-builders/docker'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        export IMAGE_PATH="us-central1-docker.pkg.dev/$PROJECT_ID/motokage-studio/app:$BRANCH_NAME"
        docker build -t $$IMAGE_PATH .
        docker push $$IMAGE_PATH
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        export IMAGE_PATH="us-central1-docker.pkg.dev/$PROJECT_ID/motokage-studio/app:$BRANCH_NAME"
        if [ "$BRANCH_NAME" == "staging" ]; then
          gcloud run deploy motokage-studio-staging --image $$IMAGE_PATH --region us-central1 --platform managed --allow-unauthenticated --set-env-vars="API_KEY=$$API_KEY"
        else
          gcloud run deploy motokage-studio --image $$IMAGE_PATH --region us-central1 --platform managed --allow-unauthenticated --set-env-vars="API_KEY=$$API_KEY"
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
    setCurrentFile('Establishing Uplink...');

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
        if (!mainRes.ok) throw new Error("Main branch not found.");
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
        setCurrentFile(`Syncing: ${path}`);
        
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
          } catch (e) { console.warn(`Could not fetch ${path}`); }
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
          message: `🚀 [GOLD_STANDARD] Motokage Backend Proxy Deployment v15.9.0`, 
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

      setStatus({ type: 'success', msg: `UPLINK SUCCESSFUL. BACKEND MIGRATION DEPLOYED.` });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl space-y-10">
      <div className="flex justify-between items-center border-b border-slate-800 pb-8">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Global Uplink v15.9.0 "Gold Standard"
          </h3>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">GCP: motokage | us-central1</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
             <button onClick={() => setTargetEnv('staging')} className={`px-4 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all ${targetEnv === 'staging' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-600'}`}>Staging</button>
             <button onClick={() => setTargetEnv('main')} className={`px-4 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all ${targetEnv === 'main' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-slate-600'}`}>Production</button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-8 bg-slate-950 border border-emerald-500/30 rounded-3xl space-y-4">
           <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Backend Proxy Architecture</h4>
           <p className="text-[9px] text-slate-500 font-mono leading-relaxed">This deployment migrates from browser-based inference to a secure Python proxy. Your API_KEY is now managed at the infrastructure layer.</p>
        </div>
        <div className="p-8 bg-slate-950 border border-indigo-500/30 rounded-3xl space-y-4 text-left">
           <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Sync Telemetry</h4>
           <div className="space-y-2">
              <div className="flex justify-between items-end text-[8px] font-mono text-slate-600 uppercase">
                <span>{currentFile || 'Idle'}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">GitHub Repository</label>
          <input type="text" value={repo} onChange={(e) => setRepo(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-emerald-500 transition-all font-mono" />
        </div>
        <div className="space-y-4">
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Auth Token</label>
          <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Locked" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-emerald-500 transition-all font-mono" />
        </div>
      </div>

      <button onClick={handleAtomicSync} disabled={status.type === 'loading'} className={`w-full py-7 rounded-[2rem] font-bold text-[12px] uppercase tracking-[0.5em] transition-all shadow-2xl border group ${targetEnv === 'main' ? 'bg-purple-600 hover:bg-purple-700 border-purple-500/50' : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500/50'}`}>
        {status.type === 'loading' ? 'TRANSMITTING DNA...' : `UPLINK TO ${targetEnv.toUpperCase()}`}
      </button>

      {status.msg && (
        <div className={`p-8 rounded-[2rem] text-[10px] font-mono text-center uppercase tracking-widest border animate-in fade-in slide-in-from-top-4 ${status.type === 'error' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          {status.msg}
          {status.type === 'success' && (
            <p className="mt-4 text-slate-500 normal-case italic">Cloud Build will automatically set up the Python proxy environment.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ShadowSyncConsole;
