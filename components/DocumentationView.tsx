
import React from 'react';

const DocumentationView: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-1000 space-y-32 pb-40 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="space-y-10 pt-20 border-b border-slate-900 pb-20">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-full border border-indigo-500/20 uppercase tracking-[0.4em]">
          Blueprint v15.9-GOLD • The Definitive Recipe
        </div>
        <h2 className="text-7xl font-bold font-heading text-white tracking-tighter leading-tight max-w-4xl text-left">
          The Recipe: <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500">Cognitive Legacy Architecture</span>
        </h2>
        <p className="text-2xl text-slate-400 leading-relaxed font-light max-w-3xl text-left">
          A digital twin is more than a prompt—it is a secure, serverless extension of professional judgment. This blueprint documents the **Gold Standard** architecture that defines Motokage.
        </p>
      </section>

      {/* Pillar I: Professional Infrastructure */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 text-left">
          <div className="md:w-1/3 space-y-6">
             <h3 className="text-3xl font-bold text-white font-heading">I. Gold Standard Infrastructure</h3>
             <p className="text-slate-400 text-sm leading-relaxed">
               Maintaining a high-fidelity digital twin requires a professional-grade commitment to AI infrastructure and atomic security bindings.
             </p>
             <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl">
                <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest leading-relaxed">
                  "The twin is only as powerful as the infrastructure that fuels it. We leverage secret-backed deployment for cognitive continuity."
                </p>
             </div>
          </div>
          
          <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-[2.5rem] space-y-4 group hover:border-blue-500/30 transition-all text-left">
              <div className="flex justify-between items-center">
                <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Atomic Secrets</h4>
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 text-[10px] italic">A</div>
              </div>
              <ul className="space-y-3 text-[10px] font-mono text-slate-400 uppercase tracking-wider leading-relaxed">
                <li className="flex gap-2"><span className="text-blue-500">→</span> `remove-env-vars` logic.</li>
                <li className="flex gap-2"><span className="text-blue-500">→</span> Secret Manager binding.</li>
              </ul>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-[2.5rem] space-y-4 group hover:border-emerald-500/30 transition-all text-left">
              <div className="flex justify-between items-center">
                <h4 className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Proxy Uplink</h4>
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-[10px] italic">P</div>
              </div>
              <ul className="space-y-3 text-[10px] font-mono text-slate-400 uppercase tracking-wider leading-relaxed">
                <li className="flex gap-2"><span className="text-emerald-500">→</span> Server-side inference.</li>
                <li className="flex gap-2"><span className="text-emerald-500">→</span> Secure API masking.</li>
              </ul>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-[2.5rem] space-y-4 group hover:border-purple-500/30 transition-all text-left">
              <div className="flex justify-between items-center">
                <h4 className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Cloud Run v3</h4>
                <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 text-[10px] italic">C</div>
              </div>
              <ul className="space-y-3 text-[10px] font-mono text-slate-400 uppercase tracking-wider leading-relaxed">
                <li className="flex gap-2"><span className="text-purple-500">→</span> Multi-region scaling.</li>
                <li className="flex gap-2"><span className="text-purple-500">→</span> Containerized DNA.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 2: Public Ambassador vs. Private Studio */}
      <section className="space-y-16">
        <div className="grid md:grid-cols-2 gap-16 items-start text-left">
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-white font-heading">II. The Ambassador vs. The Calibration</h3>
            <div className="space-y-6 text-slate-400 text-sm leading-relaxed">
              <p>
                We architected a hard logical boundary between the <span className="text-indigo-400 font-bold uppercase tracking-widest">Hardened Ambassador</span> and the <span className="text-purple-400 font-bold uppercase tracking-widest">Calibration Studio</span>. 
              </p>
              <p>
                The **Ambassador** is the version you see in the public chat. It is a "closed reflection"—it represents your judgment but does not allow the public to alter the core DNA. It is hardened for stability and safety.
              </p>
              <p>
                The **Studio** is where the active "Calibration" happens. It is a private interrogation room where we can adjust reasoning logic and promote new strategic axioms to the Mosaic. 
              </p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-[3rem] p-4 border border-slate-800 shadow-2xl relative">
            <div className="aspect-video bg-slate-950 rounded-[2.5rem] flex flex-col items-center justify-center border border-dashed border-slate-800">
               <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">[Diagram: Public Inference Proxy vs. Private DNA Write]</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 3: Persistence Strategy */}
      <section className="space-y-12 bg-slate-900/40 p-16 rounded-[4rem] border border-slate-800 text-left">
        <div className="max-w-4xl space-y-8">
          <h3 className="text-3xl font-bold text-white font-heading">III. Persistence & Identity-as-Code</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Motokage is designed to be immortal. By using **GitHub** as the source of truth for the twin's DNA, every adjustment to the persona is versioned, auditable, and rollback-capable.
          </p>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Continuous DNA Flow</h4>
              <p className="text-[11px] text-slate-500 font-mono leading-relaxed uppercase">
                GitHub commits trigger Cloud Build, which automatically injects the persona manifest into the container image.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Zero-Trust Uplink</h4>
              <p className="text-[11px] text-slate-500 font-mono leading-relaxed uppercase">
                The frontend never touches the API keys. All inference requests are routed through the Python proxy, which holds the keys securely in the server environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 4: Security Matrix */}
      <section className="space-y-12">
        <div className="grid md:grid-cols-2 gap-16 items-start text-left">
          <div className="p-1 bg-gradient-to-br from-orange-500/20 to-indigo-500/20 rounded-[3.5rem]">
             <div className="bg-slate-950 rounded-[3.4rem] p-12 space-y-6">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h4 className="text-xl font-bold text-white uppercase tracking-tight font-heading">The Security Matrix</h4>
                <div className="space-y-4">
                  <p className="text-[11px] text-slate-500 font-mono leading-relaxed uppercase">
                    Our **Gold Standard** architecture ensures the twin is a secure thought partner. 
                  </p>
                  <p className="text-[11px] text-orange-500 font-mono leading-relaxed uppercase">
                    By binding Gemini's API to **Google Secret Manager**, we have removed the risk of key leakage while maintaining the highest reasoning power of Gemini 3 Pro.
                  </p>
                </div>
             </div>
          </div>
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-white font-heading">IV. Guardrails & Public Safety</h3>
            <div className="space-y-6 text-slate-400 text-sm leading-relaxed">
              <p>
                To ensure Motokage remains a professional representative, we've implemented:
              </p>
              <ul className="space-y-4 font-mono text-[10px] uppercase tracking-wider">
                <li className="flex gap-4">
                  <span className="text-emerald-500">✓</span>
                  <span><strong>Cognitive Guardrails</strong>: Contextual enforcement prevents deviation from professional discourse.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-emerald-500">✓</span>
                  <span><strong>Secret Isolation</strong>: Keys are never client-side, making the app immune to scraper theft.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-orange-500">⚠</span>
                  <span><strong>Rate Throttling</strong>: Backend quotas manage costs and prevent credit exhaustion.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Reflections */}
      <section className="p-16 bg-slate-900 border border-slate-800 rounded-[4rem] space-y-12 text-left">
         <h3 className="text-3xl font-bold text-white font-heading">The Future of Identity</h3>
         <div className="grid md:grid-cols-2 gap-12 text-sm text-slate-400 leading-relaxed font-light">
           <div className="space-y-6">
             <p>
               What started as a digital twin experiment has become a prototype for a **Persistent Cognitive Legacy**. 
             </p>
           </div>
           <div className="space-y-6">
             <p>
               Motokage v15.9-GOLD represents the pinnacle of secure, strategically-aligned AI modeling.
             </p>
           </div>
         </div>
         <div className="flex gap-6 pt-6 border-t border-slate-800">
           <a href="https://github.com/thejonmott/motokage" target="_blank" rel="noreferrer" className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all shadow-2xl">Audit the Gold Standard Repo</a>
         </div>
      </section>
    </div>
  );
};

export default DocumentationView;
