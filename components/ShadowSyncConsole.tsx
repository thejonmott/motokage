
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
    'App.tsx', 'types.ts', 'index.tsx', 'metadata.json', 'index.html', 'package.json', 'vite.config.ts', 'tsconfig.json', '.dockerignore',
    'components/Header.tsx', 'components/PersonaForm.tsx', 'components/ArchitectureView.tsx',
    'components/MemoryVault.tsx', 'components/NexusView.tsx', 'components/ChatInterface.tsx',
    'components/ComparisonView.tsx', 'components/ShadowSyncConsole.tsx', 'components/StagingView.tsx',
    'components/DNAView.tsx', 'components/OriginStoryView.tsx', 'components/MosaicView.tsx',
    'components/MandatesView.tsx', 'components/DashboardView.tsx', 'components/DocumentationView.tsx', 'default.conf', 'Dockerfile', 'cloudbuild.yaml'
  ];

  const getSystemManifests = () => ({
    'shadow_config.json': JSON.stringify(persona, null, 2),
    'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  define: { 'process.env.API_KEY': JSON.stringify(process.env.API_KEY) },
  build: { outDir: 'dist' }
});`,
    'Dockerfile': `# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_APP_ENV
ARG API_KEY
ENV VITE_APP_ENV=$VITE_APP_ENV
ENV API_KEY=$API_KEY
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]`,
    'cloudbuild.yaml': `steps:
  - name: 'gcr.io/cloud-builders/docker'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        export IMAGE_PATH="us-central1-docker.pkg.dev/$PROJECT_ID/motokage-studio/app:$BRANCH_NAME"
        docker build -t $$IMAGE_PATH \\
          --build-arg VITE_APP_ENV=$BRANCH_NAME \\
          --build-arg API_KEY=$$API_KEY .
        docker push $$IMAGE_PATH
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        export IMAGE_PATH="us-central1-docker.pkg.dev/$PROJECT_ID/motokage-studio/app:$BRANCH_NAME"
        if [ "$BRANCH_NAME" == "staging" ]; then
          gcloud run deploy motokage-studio-staging --image $$IMAGE_PATH --region us-central1 --platform managed --allow-unauthenticated
        else
          gcloud run deploy motokage-studio --image $$IMAGE_PATH --region us-central1 --platform managed --allow-unauthenticated
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
      const uniqueFiles = Array.from(new Set([...sourceFiles, ...Object.keys(manifests)]));
      const treeItems: any[] = [];

      for (let i = 0; i < uniqueFiles.length; i++) {
        const path = uniqueFiles[i];
        setCurrentFile(path);
        
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
          } catch (e) { console.warn(`Could not fetch ${path}, using manifest fallback...`); }
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
        
        setProgress(Math.round(((i + 1) / uniqueFiles.length) * 80));
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
          message: `🚀 [IGNITION] Digital Twin Sync: v15.8.1 (Syntax Fix)`, 
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
      setStatus({ type: 'success', msg: `IGNITION SUCCESSFUL. CODE TRANSMITTED.` });
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
            Global Uplink v15.8.1 "Ignition"
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
        <div className="p-8 bg-slate-950 border border-emerald-500/30 rounded-3xl space-y-6 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
           <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              🚀 Ignition Status: READY
           </h4>
           <div className="space-y-4 text-[9px] font-mono leading-relaxed text-slate-400">
              <p>1. Transmit the latest DNA to GitHub.</p>
              <p>2. Google Cloud Build should auto-trigger.</p>
              <p>3. Vite will bake the API_KEY into the bundle.</p>
           </div>
        </div>

        <div className="p-8 bg-slate-950 border border-orange-500/30 rounded-3xl space-y-6 shadow-[0_0_30px_rgba(249,115,22,0.05)]">
           <h4 className="text-[10px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2">
              🛠 Trigger Troubleshooting
           </h4>
           <div className="space-y-4 text-[9px] font-mono leading-relaxed text-slate-400">
              <p>If push doesn't trigger build:</p>
              <p>• Check GCP &gt; Cloud Build &gt; Triggers.</p>
              <p>• Pattern: <span className="text-white">^({targetEnv})$</span></p>
              <p>• Event: <span className="text-white">Push to a branch</span></p>
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
        {status.type === 'loading' ? 'SYNCING DNA...' : `UPLINK TO ${targetEnv.toUpperCase()}`}
      </button>

      {status.msg && (
        <div className={`p-8 rounded-[2rem] text-[10px] font-mono text-center uppercase tracking-widest border animate-in fade-in slide-in-from-top-4 ${status.type === 'error' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          {status.msg}
          {status.type === 'success' && (
            <div className="mt-6 flex flex-col items-center gap-4">
              <p className="text-slate-400 normal-case italic">Code transmitted. If build doesn't start, manually trigger it in the GCP Console.</p>
              <div className="flex gap-4">
                <a href="https://console.cloud.google.com/cloud-build/builds?project=motokage" target="_blank" rel="noreferrer" className="px-6 py-3 bg-slate-800 rounded-xl text-[9px] hover:bg-slate-700 transition-all font-bold">Open GCP Console</a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShadowSyncConsole;
