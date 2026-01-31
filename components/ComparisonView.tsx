
import React from 'react';

const ComparisonView: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-700 space-y-12 max-w-5xl mx-auto">
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-5xl font-bold font-heading text-white tracking-tight">The Dilemma: Studio vs. App</h2>
        <p className="text-slate-400 text-lg leading-relaxed">
          If you want to build a digital twin, the choice between the Gemini consumer app and AI Studio 
          comes down to one thing: <span className="text-indigo-400 font-semibold italic">Control</span>.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Gemini Consumer App */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-[2rem] p-10 hover:border-blue-500/30 transition-all duration-500 group">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold font-heading">Gemini "Proper" (App)</h3>
          </div>
          
          <ul className="space-y-6 text-slate-300">
            <li className="flex items-start gap-4">
              <span className="text-green-500 text-lg">✅</span>
              <span className="text-sm leading-relaxed"><strong className="text-white">Ease of Use:</strong> Set up a "Gem" in seconds via a familiar chat interface. Best for personal productivity.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-green-500 text-lg">✅</span>
              <span className="text-sm leading-relaxed"><strong className="text-white">Ecosystem:</strong> Seamless access to your Google Docs, Gmail, and Calendar via native extensions.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-rose-500 text-lg">❌</span>
              <span className="text-sm leading-relaxed"><strong className="text-white">Rigidity:</strong> Zero control over technical parameters like temperature, top-k, or model version.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-rose-500 text-lg">❌</span>
              <span className="text-sm leading-relaxed"><strong className="text-white">Interface:</strong> Locked within Google's UI. No API access to build your own custom twin experience.</span>
            </li>
          </ul>
          
          <div className="mt-10 p-6 bg-slate-800/50 rounded-2xl text-xs italic border-l-4 border-blue-500 text-slate-400 font-mono uppercase tracking-wider">
            "Better for a quick, personal assistant that knows your schedule."
          </div>
        </div>

        {/* AI Studio */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-[2rem] p-10 hover:border-indigo-500/50 transition-all duration-500 shadow-2xl shadow-indigo-500/5 group">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold font-heading">AI Studio / API</h3>
          </div>

          <ul className="space-y-6 text-slate-300">
            <li className="flex items-start gap-4">
              <span className="text-green-500 text-lg">✅</span>
              <span className="text-sm leading-relaxed"><strong className="text-white">System Instructions:</strong> Define a deep, unbreakable identity that acts as a true persona, not just a prompt.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-green-500 text-lg">✅</span>
              <span className="text-sm leading-relaxed"><strong className="text-white">Multimodal:</strong> Use the Live API for real-time, low-latency voice conversations with your digital reflection.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-green-500 text-lg">✅</span>
              <span className="text-sm leading-relaxed"><strong className="text-white">Persistence:</strong> Build your own long-term memory via vector search or RAG, giving your twin a soul.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-green-500 text-lg">✅</span>
              <span className="text-sm leading-relaxed"><strong className="text-white">Fine-tuning:</strong> Truly tailor behavior for specialized tasks using models like Gemini 3 Pro.</span>
            </li>
          </ul>

          <div className="mt-10 p-6 bg-slate-800/50 rounded-2xl text-xs italic border-l-4 border-indigo-500 text-slate-400 font-mono uppercase tracking-wider">
            "Essential for building a specialized, custom-coded extension of yourself."
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-[2.5rem] p-10 text-center max-w-4xl mx-auto backdrop-blur-xl">
        <h4 className="text-2xl font-bold font-heading mb-4 text-white">The Verdict</h4>
        <p className="text-slate-300 text-base leading-relaxed">
          If your goal is a <span className="text-white font-bold underline decoration-indigo-500 decoration-2 underline-offset-4">true digital twin</span>—one that you can deploy to your website, speak to in real-time, or feed vast amounts of your own writing—<span className="text-indigo-400 font-bold">AI Studio is the only real choice</span>. It provides the programmatic access needed for long-term data ingestion and high-fidelity identity molding.
        </p>
      </div>
    </div>
  );
};

export default ComparisonView;
