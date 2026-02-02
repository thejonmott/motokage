
import React from 'react';

const DocumentationView: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-1000 space-y-24 pb-40 max-w-5xl mx-auto text-left">
      {/* Header Metadata */}
      <section className="pt-20 border-b border-slate-900 pb-16 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4 text-left">
            <h1 className="text-6xl font-bold font-heading text-white tracking-tighter">
              The <span className="text-indigo-400 italic font-light">Recipe</span>
            </h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
              Cognitive Legacy Specification • v15.9.2-HARDENED
            </p>
          </div>
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2 text-left min-w-[300px] shadow-2xl">
            <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest">
              <span>Blueprint ID</span>
              <span className="text-white">MOTOKAGE_REF_ARCH_A</span>
            </div>
            <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest">
              <span>Architecture</span>
              <span className="text-indigo-400">Serverless Proxy</span>
            </div>
            <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest">
              <span>Identity ID</span>
              <span className="text-white italic">元影</span>
            </div>
          </div>
        </div>
      </section>

      {/* 01. Executive Summary */}
      <section className="space-y-6">
        <h3 className="text-2xl font-bold font-heading text-white flex items-center gap-4">
          <span className="text-slate-700 font-light">01.</span> Executive Summary
        </h3>
        <p className="text-lg text-slate-400 leading-relaxed font-light">
          The Motokage framework is a production-grade architecture designed to scale human judgment via a "Digital Twin" cognitive service. This implementation utilizes a **Hardened Reference Architecture** that separates the user interface from the reasoning engine. By implementing a serverless proxy layer, the system ensures that identity-shaping instructions and API credentials remain isolated from the client-side environment.
        </p>
      </section>

      {/* 02. Architecture Stack */}
      <section className="space-y-8">
        <h3 className="text-2xl font-bold font-heading text-white flex items-center gap-4">
          <span className="text-slate-700 font-light">02.</span> Enterprise Architecture Stack
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Reasoning Engine', val: 'Gemini 3 Pro (Inference) & Flash (Synthesis)', color: 'blue' },
            { label: 'Secret Management', val: 'Google Secret Manager (In-Flight Resolution)', color: 'purple' },
            { label: 'Secure Proxy', val: 'Python 3.11 / Flask (Instruction Hardening)', color: 'indigo' },
            { label: 'Container Runtime', val: 'Google Cloud Run (Serverless Auto-scaling)', color: 'cyan' },
            { label: 'State Management', val: 'GitHub (Identity-as-Code)', color: 'emerald' },
          ].map((item, i) => (
            <div key={i} className="p-6 bg-slate-900/40 border border-slate-800 rounded-[2rem] space-y-3 transition-all hover:bg-slate-900 hover:border-slate-700">
              <div className={`text-[8px] font-bold uppercase tracking-widest text-${item.color}-400`}>{item.label}</div>
              <div className="text-[11px] text-white font-mono leading-relaxed uppercase tracking-wider">{item.val}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 03. Implementation Lifecycle */}
      <section className="space-y-12">
        <h3 className="text-2xl font-bold font-heading text-white flex items-center gap-4">
          <span className="text-slate-700 font-light">03.</span> Sequential Implementation Lifecycle
        </h3>

        <div className="space-y-16">
          {/* Phase I */}
          <div className="relative pl-12 border-l border-slate-800 space-y-6">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-950 border-2 border-slate-700"></div>
            <h4 className="text-lg font-bold text-white uppercase tracking-tight font-heading">Phase I: Environment Provisioning</h4>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { t: 'Project Initialization', d: 'Establish dedicated project within GCP resource hierarchy.' },
                { t: 'Service Enablement', d: 'Enable Cloud Run, Cloud Build, and Vertex AI APIs.' },
                { t: 'Registry Config', d: 'Provision Artifact Registry for container manifest storage.' },
              ].map((p, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{p.t}</div>
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider leading-relaxed">{p.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Phase II */}
          <div className="relative pl-12 border-l border-slate-800 space-y-8">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-950 border-2 border-slate-700"></div>
            <h4 className="text-lg font-bold text-white uppercase tracking-tight font-heading">Phase II: Atomic Secret Binding</h4>
            <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
              <p className="text-[11px] text-slate-400 font-mono uppercase tracking-widest leading-relaxed">To maintain a zero-trust posture, credentials must be resolved at runtime rather than stored in application source code.</p>
              <div className="grid md:grid-cols-3 gap-8 text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] leading-relaxed">
                <div className="space-y-3">
                  <div className="text-white font-bold border-b border-slate-800 pb-2">01. Secret Definition</div>
                  <p>Define <span className="text-indigo-400">motokage-api-key</span> within Secret Manager.</p>
                </div>
                <div className="space-y-3">
                  <div className="text-white font-bold border-b border-slate-800 pb-2">02. Access Policy</div>
                  <p>Grant Secret Accessor permissions to the Service Identity.</p>
                </div>
                <div className="space-y-3">
                  <div className="text-white font-bold border-b border-slate-800 pb-2">03. Mapping</div>
                  <p>Bind secret to environment via the Cloud Run deployment manifest.</p>
                </div>
              </div>
            </div>

            {/* Biometric Perimeter Callout */}
            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[4rem] p-16 space-y-8 shadow-[0_0_60px_rgba(79,70,229,0.1)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="w-24 h-24 bg-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/30">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div className="text-left space-y-4">
                  <h5 className="text-3xl font-bold text-white uppercase tracking-tight font-heading leading-none">The Biometric Perimeter</h5>
                  <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-[0.4em]">FIDO2/WebAuthn Identity Handshake</p>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-2xl font-light">
                    To ensure the digital twin is never compromised, static passcodes are superseded by a **Hardware-Backed Identity Protocol**. Utilizing **WebAuthn (Passkeys)** standards, access to the calibration layer requires a cryptographic signature verified via local biometric hardware. 
                  </p>
                </div>
              </div>
              <div className="pt-8 border-t border-indigo-500/20 flex flex-wrap gap-8 items-center justify-between">
                <div className="space-y-1.5 font-mono text-[9px] text-indigo-400 uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span> Identity Verified</div>
                  <div className="text-slate-500">[AUTH_TYPE]: <span className="text-white">FIDO2_SYNC</span></div>
                  <div className="text-slate-500">[AUTH_LEVEL]: <span className="text-white">ROOT_CALIBRATOR</span></div>
                  <div className="text-slate-500">[PLATFORM]: <span className="text-white">GCP_IAP_HARDENED</span></div>
                </div>
                <div className="px-6 py-2 bg-indigo-500 text-white rounded-xl text-[8px] font-bold uppercase tracking-widest shadow-2xl">Z-TRUST_BOUNDARY_ACTIVE</div>
              </div>
            </div>
          </div>

          {/* Phase III */}
          <div className="relative pl-12 border-l border-slate-800 space-y-8">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-950 border-2 border-slate-700"></div>
            <h4 className="text-lg font-bold text-white uppercase tracking-tight font-heading">Phase III: Logic Hardening (Secure Proxy)</h4>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">The server-side proxy acts as the mandatory cognitive gatekeeper, preventing prompt injection and personality tampering.</p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { t: 'System Injection', d: 'Identity DNA (Bio, Heuristics) is injected server-side beyond client reach.' },
                { t: 'History Buffering', d: 'Managed conversation history ensures context remains within architectural limits.' },
                { t: 'Endpoint Masking', d: 'Direct API endpoints are obfuscated; the client only resolves the /api gateway.' },
              ].map((p, i) => (
                <div key={i} className="p-8 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] space-y-4 hover:bg-slate-900 transition-all">
                  <div className="text-[9px] font-bold text-white uppercase tracking-[0.3em]">{p.t}</div>
                  <p className="text-[10px] text-slate-500 leading-relaxed uppercase font-mono tracking-wider">{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 04. Customization & Identity */}
      <section className="space-y-12">
        <h3 className="text-2xl font-bold font-heading text-white flex items-center gap-4">
          <span className="text-slate-700 font-light">04.</span> Identity Hotspots & Customization
        </h3>
        <p className="text-lg text-slate-400 leading-relaxed font-light">
          When forking this project, you must re-calibrate the identity hooks to reflect your own persona. Replace all references to **Motokage** with your chosen brand name.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-10 bg-slate-900/50 border border-indigo-500/20 rounded-[3rem] space-y-6">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.4em] border-b border-slate-800 pb-4">Variable Definitions</h4>
            <div className="space-y-4">
               <div className="space-y-1">
                 <div className="text-[11px] font-bold text-indigo-400 font-mono">App.tsx → INITIAL_PERSONA</div>
                 <p className="text-[10px] text-slate-500 leading-relaxed">Modify the name, profession, and bio. This is the seed for the initial local storage state.</p>
               </div>
               <div className="space-y-1">
                 <div className="text-[11px] font-bold text-indigo-400 font-mono">Header.tsx → Brand Header</div>
                 <p className="text-[10px] text-slate-500 leading-relaxed">Update the text strings for "MOTOKAGE" and replace the default Kanji `影` with your logo or identifier.</p>
               </div>
               <div className="space-y-1">
                 <div className="text-[11px] font-bold text-indigo-400 font-mono">metadata.json → Manifest</div>
                 <p className="text-[10px] text-slate-500 leading-relaxed">Update the meta name and description for browser tab persistence.</p>
               </div>
            </div>
          </div>
          <div className="p-10 bg-slate-900/50 border border-indigo-500/20 rounded-[3rem] space-y-6">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.4em] border-b border-slate-800 pb-4">Cognitive Grounding</h4>
            <div className="space-y-4">
               <div className="space-y-1">
                 <div className="text-[11px] font-bold text-indigo-400 font-mono">ChatInterface.tsx → instruction</div>
                 <p className="text-[10px] text-slate-500 leading-relaxed">Update the `IDENTITY` and `DEPLOYMENT_VERSION` strings within the system message template.</p>
               </div>
               <div className="space-y-1">
                 <div className="text-[11px] font-bold text-indigo-400 font-mono">types.ts → Persona Interface</div>
                 <p className="text-[10px] text-slate-500 leading-relaxed">If you need to add specific DNA strands (e.g., "socialHandles"), extend the TypeScript interfaces here.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05. Operational Logic */}
      <section className="space-y-12 bg-slate-900/40 p-16 rounded-[4rem] border border-slate-800 shadow-2xl">
        <h3 className="text-2xl font-bold font-heading text-white flex items-center gap-4">
          <span className="text-slate-700 font-light">05.</span> Operational Logic: Ambassador vs. Studio
        </h3>
        <div className="grid md:grid-cols-2 gap-16">
          <div className="space-y-6 text-left">
            <h4 className="text-base font-bold text-indigo-400 uppercase tracking-[0.3em] font-heading">The Ambassador (Public Mode)</h4>
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
                 <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> Interface: Hardened / Reflective
               </div>
               <p className="text-sm text-slate-400 leading-relaxed">A public-facing mirror of professional judgment. It is programmed to resist prompt manipulation and maintains a strictly ambassadorial tone.</p>
            </div>
          </div>
          <div className="space-y-6 text-left">
            <h4 className="text-base font-bold text-purple-400 uppercase tracking-[0.3em] font-heading">The Studio (Private Mode)</h4>
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
                 <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> Interface: Calibration / Evaluative
               </div>
               <p className="text-sm text-slate-400 leading-relaxed">Requires Hardware Identity Handshake. Enables real-time heuristic calibration, artifact ingestion, and long-term memory maintenance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 06. Maintenance Cycle */}
      <section className="space-y-10">
        <h3 className="text-2xl font-bold font-heading text-white flex items-center gap-4">
          <span className="text-slate-700 font-light">06.</span> Deployment Maintenance Lifecycle
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
           {[
             { t: 'Identity-as-Code', d: 'Maintain personality heuristics within version-controlled DNA manifests.' },
             { t: 'Insight Promotion', d: 'Migrate high-value calibration insights from private sessions to public shards.' },
             { t: 'Latency Monitoring', d: 'Utilize infrastructure metrics to maintain a target response latency of <800ms.' }
           ].map((m, i) => (
             <div key={i} className="space-y-3">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l-2 border-indigo-500 pl-4">{m.t}</div>
               <p className="text-[10px] text-slate-600 font-mono leading-relaxed uppercase tracking-wider pl-4">{m.d}</p>
             </div>
           ))}
        </div>
      </section>

      <footer className="pt-24 border-t border-slate-900 text-center pb-12">
         <div className="inline-flex items-center gap-6 px-10 py-4 bg-slate-900 border border-slate-800 rounded-2xl mb-8">
           <div className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.4em]">End of Recipe</div>
           <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
           <div className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.4em]">Ref: MOTOKAGE_REF_ARCH</div>
         </div>
         <p className="text-[8px] text-slate-700 font-mono uppercase tracking-widest leading-relaxed max-w-lg mx-auto italic">
           This document serves as the formal technical specification for the Motokage Digital Twin deployment and security model.
         </p>
      </footer>
    </div>
  );
};

export default DocumentationView;