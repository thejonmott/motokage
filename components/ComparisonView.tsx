
import React from 'react';

const ComparisonView: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-12">
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold font-heading text-white">The Dilemma: Studio vs. App</h2>
        <p className="text-slate-400 text-lg">
          If you want to build a digital twin, the choice between the Gemini consumer app and AI Studio 
          comes down to one thing: <span className="text-indigo-400 font-semibold">Control</span>.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Gemini Consumer App */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold">Gemini "Proper" (App)</h3>
          </div>
          
          <ul className="space-y-4 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-green-500">✅</span>
              <span><strong>Ease of Use:</strong> Set up a "Gem" in seconds via chat interface.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500">✅</span>
              <span><strong>Ecosystem:</strong> Direct access to your Google Docs, Gmail, and Calendar.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500">❌</span>
              <span><strong>Rigidity:</strong> You can't tweak the "temperature" or specific model versions.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500">❌</span>
              <span><strong>Interface:</strong> You are stuck inside Google's chat UI. No custom apps.</span>
            </li>
          </ul>
          
          <div className="mt-8 p-4 bg-slate-800 rounded-lg text-sm italic border-l-4 border-blue-500">
            "Better for a quick, personal assistant that knows your schedule."
          </div>
        </div>

        {/* AI Studio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-indigo-500/50 transition-colors shadow-2xl shadow-indigo-500/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold">AI Studio / API</h3>
          </div>

          <ul className="space-y-4 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-green-500">✅</span>
              <span><strong>System Instructions:</strong> Define a deep identity that acts as a true persona.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500">✅</span>
              <span><strong>Multimodal:</strong> Use the Live API for real-time voice conversations with your twin.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500">✅</span>
              <span><strong>Persistence:</strong> You can build your own database to give your twin a "memory".</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500">✅</span>
              <span><strong>Fine-tuning:</strong> Truly tailor the behavior of models like Gemini 3 Pro.</span>
            </li>
          </ul>

          <div className="mt-8 p-4 bg-slate-800 rounded-lg text-sm italic border-l-4 border-indigo-500">
            "Essential for building a specialized, custom-coded extension of yourself."
          </div>
        </div>
      </div>

      <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-8 text-center max-w-4xl mx-auto">
        <h4 className="text-xl font-bold mb-2">Verdict</h4>
        <p className="text-slate-300">
          If your goal is a <span className="text-white font-semibold">true digital twin</span>—one that you can deploy to your website, speak to in real-time, or feed vast amounts of your own writing—<span className="text-indigo-400">AI Studio is the only real choice</span>. It provides the programmatic access needed for long-term data ingestion and identity molding.
        </p>
      </div>
    </div>
  );
};

export default ComparisonView;
