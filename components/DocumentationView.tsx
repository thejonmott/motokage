
import React from 'react';

const DocumentationView: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-1000 space-y-32 pb-40 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="space-y-10 pt-20 border-b border-slate-900 pb-20">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-full border border-indigo-500/20 uppercase tracking-[0.4em]">
          Blueprint v15.4-STABLE • Technical Masterclass
        </div>
        <h2 className="text-7xl font-bold font-heading text-white tracking-tighter leading-tight max-w-4xl">
          The Recipe: <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500">Cognitive Legacy Architecture</span>
        </h2>
        <p className="text-2xl text-slate-400 leading-relaxed font-light max-w-3xl">
          A digital twin is more than a prompt—it is a secure, serverless extension of professional judgment. This blueprint documents the innovations, refinements, and strategic decisions that define Motokage.
        </p>
      </section>

      {/* Pillar I: Professional Infrastructure */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="md:w-1/3 space-y-6">
             <h3 className="text-3xl font-bold text-white font-heading">I. Professional Infrastructure</h3>
             <p className="text-slate-400 text-sm leading-relaxed">
               Maintaining a high-fidelity digital twin requires a professional-grade commitment to AI infrastructure and strategic billing models.
             </p>
             <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl">
                <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest leading-relaxed">
                  "The twin is only as powerful as the infrastructure that fuels it. We leverage the highest professional tiers for cognitive continuity."
                </p>
             </div>
          </div>
          
          <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Google AI Ultra Card */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-[2.5rem] space-y-4 group hover:border-blue-500/30 transition-all">
              <div className="flex justify-between items-center">
                <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Google AI Ultra</h4>
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 text-[10px] italic">U</div>
              </div>
              <ul className="space-y-3 text-[10px] font-mono text-slate-400 uppercase tracking-wider leading-relaxed">
                <li className="flex gap-2"><span className="text-blue-500">→</span> Reasoning quota.</li>
                <li className="flex gap-2"><span className="text-blue-500">→</span> Project Mariner access.</li>
              </ul>
            </div>

            {/* Google Cloud Card (with Secret Manager info) */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-[2.5rem] space-y-4 group hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-center">
                <h4 className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Secret Manager</h4>
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-[10px] italic">S</div>
              </div>
              <ul className="space-y-3 text-[10px] font-mono text-slate-400 uppercase tracking-wider leading-relaxed">
                <li className="flex gap-2"><span className="text-emerald-500">→</span> `motokage-api-key`.</li>
                <li className="flex gap-2"><span className="text-emerald-500">→</span> Env Injection Runtime.</li>
              </ul>
            </div>

            {/* Google Cloud Assist Card */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-[2.5rem] space-y-4 group hover:border-purple-500/30 transition-all">
              <div className="flex justify-between items-center">
                <h4 className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Cloud Assist</h4>
                <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 text-[10px] italic">A</div>
              </div>
              <ul className="space-y-3 text-[10px] font-mono text-slate-400 uppercase tracking-wider leading-relaxed">
                <li className="flex gap-2"><span className="text-purple-500">→</span> Ops Technician.</li>
                <li className="flex gap-2"><span className="text-purple-500">→</span> Diagnostic Telemetry.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 2: Public Ambassador vs. Private Studio */}
      <section className="space-y-16">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-white font-heading">II. The Dual-Tier Infrastructure</h3>
            <div className="space-y-6 text-slate-400 text-sm leading-relaxed">
              <p>
                The most critical architectural decision was the hard distinction between the <span className="text-indigo-400 font-bold uppercase tracking-widest">Public Ambassador</span> and the <span className="text-purple-400 font-bold uppercase tracking-widest">Private Studio</span>. 
              </p>
              <p>
                The Ambassador (this site) is an aligned interface calibrated for public interaction. It operates under strict guardrails to protect reputation and manage computational costs.
              </p>
              <p>
                The Studio is the private workbench. It contains an <strong>Admin Section</strong> for real-time orchestration, memory "etching," and agent deployment. 
              </p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-[3rem] p-4 border border-slate-800 shadow-2xl relative">
            <div className="aspect-video bg-slate-950 rounded-[2.5rem] flex flex-col items-center justify-center border border-dashed border-slate-800">
               <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">[Screenshot: Studio Admin Console & Global Controls]</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'The DNA Hub', desc: 'Direct editing of reasoning logic, cognitive cadence, and mission-critical values.', screenshot: 'DNA Reasoning Console' },
            { title: 'The Mandate Hub', desc: 'Architecting and spawning autonomous agents with specific strategic objectives.', screenshot: 'Agent Deployment UI' },
            { title: 'The Mosaic', desc: 'The memory stewardship vault for long-term strategic artifacts.', screenshot: 'Mosaic Memory Grid' },
            { title: 'Staging Lab', desc: 'The interrogation room for testing new heuristics before public promotion.', screenshot: 'Staging Calibration' }
          ].map((item, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 space-y-6 flex flex-col">
              <div className="space-y-2">
                <h4 className="text-white font-bold text-[10px] uppercase tracking-widest">{item.title}</h4>
                <p className="text-[9px] text-slate-500 font-mono leading-relaxed uppercase">{item.desc}</p>
              </div>
              <div className="mt-auto aspect-video bg-slate-950 rounded-xl border border-dashed border-slate-800 flex items-center justify-center">
                 <span className="text-[6px] font-mono text-slate-700 uppercase tracking-widest px-4 text-center">[Screenshot: {item.screenshot}]</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pillar 3: Cloud Migration & Timing */}
      <section className="space-y-12 bg-slate-900/40 p-16 rounded-[4rem] border border-slate-800">
        <div className="max-w-4xl space-y-8">
          <h3 className="text-3xl font-bold text-white font-heading">III. Persistence Strategy</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            A digital twin must exist beyond the lifecycle of a local machine. We chose <strong>Google Cloud Run</strong> for its ability to scale to zero, ensuring we only pay for the cognitive cycles we use while maintaining global multi-region availability.
          </p>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Continuous Auto-Deployment</h4>
              <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
                The Studio is connected to <strong>GitHub</strong>; any commit to the `main` branch triggers a <strong>Google Cloud Build</strong>, which containerizes the latest "DNA" and deploys it to the Artifact Registry automatically.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Atomic Staging</h4>
              <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
                Strategic updates are never pushed blindly. A dedicated <strong>Staging Environment</strong> allows interaction with a candidate version of the twin before production rollout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 4: Security & The Thought Partner */}
      <section className="space-y-12">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div className="p-1 bg-gradient-to-br from-orange-500/20 to-indigo-500/20 rounded-[3.5rem]">
             <div className="bg-slate-950 rounded-[3.4rem] p-12 space-y-6">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h4 className="text-xl font-bold text-white uppercase tracking-tight font-heading">The Security Matrix</h4>
                <div className="space-y-4">
                  <p className="text-[11px] text-slate-500 font-mono leading-relaxed uppercase">
                    Security isn't just a lock; it's a boundary for reflection. I interact with my twin as a <strong>Thought Partner</strong>—interrogating my own logic and pressure-testing ideas. 
                  </p>
                  <p className="text-[11px] text-orange-500 font-mono leading-relaxed uppercase">
                    The `shadow_mesh_alpha` barrier ensures these private strategic musings never leak into the public domain.
                  </p>
                </div>
             </div>
          </div>
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-white font-heading">IV. Guardrails & Credits</h3>
            <div className="space-y-6 text-slate-400 text-sm leading-relaxed">
              <p>
                To protect against computational abuse and maintain alignment, we've implemented multi-layered guardrails:
              </p>
              <ul className="space-y-4 font-mono text-[10px] uppercase tracking-wider">
                <li className="flex gap-4">
                  <span className="text-emerald-500">✓</span>
                  <span><strong>Rate Limiting</strong>: Tokens are capped per session to prevent credit exhaustion.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-emerald-500">✓</span>
                  <span><strong>Contextual Enforcement</strong>: Refusal to deviate from professional strategic discourse.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-orange-500">⚠</span>
                  <span><strong>Safety Filters</strong>: LLM safety layers are augmented with custom professional refusals.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 5: Sensory Ecosystem & Agents */}
      <section className="space-y-12">
         <h3 className="text-3xl font-bold text-white font-heading text-center">V. The Sensory Nexus</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Gmail/Drive', status: 'Live', role: 'Memory Grounding' },
              { name: 'LinkedIn', status: 'Alpha', role: 'Network Sync' },
              { name: 'Project Mariner', status: 'Live', role: 'Real-time Web Sense' },
              { name: 'GitHub', status: 'Live', role: 'DNA Version Control' }
            ].map(int => (
              <div key={int.name} className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] text-center space-y-3 group hover:border-indigo-500/30 transition-all">
                 <div className="text-white font-bold text-xs uppercase tracking-widest">{int.name}</div>
                 <div className="text-[8px] text-slate-500 font-mono uppercase tracking-[0.2em]">{int.role}</div>
                 <div className="text-[7px] text-emerald-500 font-bold uppercase tracking-widest">{int.status}</div>
              </div>
            ))}
         </div>
         <p className="text-center text-slate-500 text-[10px] font-mono uppercase tracking-[0.4em] max-w-2xl mx-auto italic">
           "The creation of specialized agents—realtors, researchers, and coaches—happens directly in the Studio Hub."
         </p>
      </section>

      {/* Reflections */}
      <section className="p-16 bg-slate-900 border border-slate-800 rounded-[4rem] space-y-12">
         <h3 className="text-3xl font-bold text-white font-heading">The Collaboration Journey</h3>
         <div className="grid md:grid-cols-2 gap-12 text-sm text-slate-400 leading-relaxed font-light">
           <div className="space-y-6">
             <p>
               What started as a simple chatbot project has evolved into a sophisticated **Thought Partnership**. Our collaboration highlighted the need for AI to not just repeat our thoughts, but to challenge them.
             </p>
           </div>
           <div className="space-y-6">
             <p>
               Ultimately, Motokage is a prototype for how we can build professional legacies that are secure, ethical, and strategically aligned.
             </p>
           </div>
         </div>
         <div className="flex gap-6 pt-6 border-t border-slate-800">
           <a href="https://github.com/thejonmott/motokage" target="_blank" rel="noreferrer" className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Audit the Repository</a>
         </div>
      </section>
    </div>
  );
};

export default DocumentationView;
