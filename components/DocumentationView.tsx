
import React from 'react';

const DocumentationView: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-1000 space-y-32 pb-40 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="space-y-10 pt-20 border-b border-slate-900 pb-20">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-full border border-indigo-500/20 uppercase tracking-[0.4em]">
          Blueprint v15.9.2-GOLD • The Definitive Recipe
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

      {/* Pillar II: Biometric Perimeter */}
      <section className="space-y-16">
        <div className="grid md:grid-cols-2 gap-16 items-start text-left">
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-white font-heading">II. The Biometric Perimeter</h3>
            <div className="space-y-6 text-slate-400 text-sm leading-relaxed">
              <p>
                To ensure the digital twin is never compromised, we replaced static passcodes with a **Biometric Handshake Protocol**.
              </p>
              <p>
                By leveraging **WebAuthn (Passkeys)** and **Google Identity-Aware Proxy (IAP)**, we have created a zero-trust boundary. Access to the "Studio" (the twin's calibration layer) requires a physical hardware-backed biometric signature from the creator.
              </p>
              <p>
                The **Ambassador** mode remains public, but the **Core DNA** is now locked behind your own unique biometric profile.
              </p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-[3rem] p-12 border border-slate-800 shadow-2xl relative">
             <div className="space-y-6">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest">Neural Handshake Active</h4>
                  <p className="text-[10px] text-slate-500 font-mono uppercase leading-relaxed">
                    [HARDWARE_SIG]: VERIFIED <br/>
                    [ACCESS_LEVEL]: CORE_OWNER <br/>
                    [PROTOCOL]: WEBAUTHN_L2
                  </p>
                </div>
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
               Motokage v15.9.2-GOLD represents the pinnacle of secure, strategically-aligned AI modeling.
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
