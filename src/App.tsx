/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Map as MapIcon, 
  Scroll, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Loader2,
  Info
} from "lucide-react";

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';
type Budget = 'Free' | 'Low' | 'Open';
type Privacy = 'Low' | 'Medium' | 'High';
type OutputType = 'Writing' | 'Research' | 'Automation' | 'App Build' | 'Design' | 'Content' | 'Organization';

interface NayAyeResponse {
  verdict: string;
  actualNeed: string;
  bestTool: string;
  secondBest: string;
  whyRoute: string;
  likelyMistake: string;
  mapStages: string[];
  firstAction: string;
}

const TOOL_CATALOG = [
  "ChatGPT", "Gemini", "Claude", "Perplexity", "n8n", "Cursor", "Replit", 
  "Midjourney", "Canva", "Notion", "Google Docs", "Sheets"
];

export default function App() {
  const [goal, setGoal] = useState('');
  const [skill, setSkill] = useState<SkillLevel>('Beginner');
  const [budget, setBudget] = useState<Budget>('Free');
  const [privacy, setPrivacy] = useState<Privacy>('Medium');
  const [output, setOutput] = useState<OutputType>('Writing');
  
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<NayAyeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const model = genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
          User Goal: "${goal}"
          Skill Level: ${skill}
          Budget: ${budget}
          Privacy Sensitivity: ${privacy}
          Desired Output: ${output}

          Context: You are NayAye, a respectfully skeptical AI tool-routing advisory system inspired by Benjamin Franklin.
          Personality: You are the Surveyor-General of Prompt Roads. You've seen many a fancy carriage get stuck in the mud of over-complication.
          Tone: Witty, dry, and mildly Franklin-flavored. Use clever analogies (e.g., comparing AI to a leaky roof, a stubborn mule, or a poorly set printing press).
          
          The Verdict should be the "Nay" part: Start with a humorous, skeptical remark about why this might be a fool's errand or how the user is overthinking it. 
          Example Verdict: "Thou art trying to use a steam engine to crack a walnut, which is a fine way to lose both thy walnut and thy eyebrows."
          
          Then, the "Aye" part: Follow up immediately with the most practical, no-nonsense route to success.
          If the user doesn't need AI at all, be honest but funny about it (e.g., "A simple quill and parchment—or a spreadsheet—would serve thee better than a thousand silicon brains").

          Tool Catalog: ${TOOL_CATALOG.join(", ")}.

          Generate a structured response in JSON format.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: { type: Type.STRING, description: "NayAye's Verdict - a witty, skeptical summary." },
              actualNeed: { type: Type.STRING, description: "What the user actually needs, cutting through the hype." },
              bestTool: { type: Type.STRING, description: "The single best tool for this specific route." },
              secondBest: { type: Type.STRING, description: "A solid backup or alternative tool." },
              whyRoute: { type: Type.STRING, description: "Explanation of why this route was chosen." },
              likelyMistake: { type: Type.STRING, description: "A common pitfall the user might encounter." },
              mapStages: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "4-6 stages for the B.Free Map (e.g. Idea, Research, Draft, Refine)." 
              },
              firstAction: { type: Type.STRING, description: "The very first step the user should take." }
            },
            required: ["verdict", "actualNeed", "bestTool", "secondBest", "whyRoute", "likelyMistake", "mapStages", "firstAction"]
          }
        }
      });

      const result = await model;
      const data = JSON.parse(result.text || "{}") as NayAyeResponse;
      setResponse(data);
    } catch (err) {
      console.error(err);
      setError("The post-roads are blocked. Pray, try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="legacy-header pb-4 mb-12 text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-8">
          <img src="/logo.png" alt="NayAye Logo" className="w-32 h-32 md:w-48 md:h-48 object-contain" />
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-navy">NayAye</h1>
            <p className="text-gold font-serif italic text-lg mt-2 md:mt-4">
              From post roads to prompt roads.
            </p>
          </div>
        </div>
        <div className="text-xs uppercase tracking-widest text-navy/60 font-semibold">
          Unofficial Office of the Digital Surveyor
        </div>
      </header>

      <main className="space-y-8">
        {/* Form Section */}
        <section className="bg-white/50 legacy-border p-6 md:p-8 rounded-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-serif text-lg mb-2 text-navy">
                What art thou trying to do?
              </label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., I wish to automate my correspondence with the local printer..."
                className="w-full h-32 p-4 bg-parchment/30 border border-navy/20 focus:border-navy focus:ring-0 rounded-none font-sans resize-none transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-navy/70">Skill Level</label>
                <select 
                  value={skill} 
                  onChange={(e) => setSkill(e.target.value as SkillLevel)}
                  className="w-full p-2 bg-white border border-navy/20 rounded-none focus:border-navy"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-navy/70">Budget</label>
                <select 
                  value={budget} 
                  onChange={(e) => setBudget(e.target.value as Budget)}
                  className="w-full p-2 bg-white border border-navy/20 rounded-none focus:border-navy"
                >
                  <option>Free</option>
                  <option>Low</option>
                  <option>Open</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-navy/70">Privacy Sensitivity</label>
                <select 
                  value={privacy} 
                  onChange={(e) => setPrivacy(e.target.value as Privacy)}
                  className="w-full p-2 bg-white border border-navy/20 rounded-none focus:border-navy"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-navy/70">Desired Output</label>
                <select 
                  value={output} 
                  onChange={(e) => setOutput(e.target.value as OutputType)}
                  className="w-full p-2 bg-white border border-navy/20 rounded-none focus:border-navy"
                >
                  <option>Writing</option>
                  <option>Research</option>
                  <option>Automation</option>
                  <option>App Build</option>
                  <option>Design</option>
                  <option>Content</option>
                  <option>Organization</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-navy text-parchment font-serif font-bold text-lg hover:bg-navy/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Surveying Thy Route...
                  </>
                ) : (
                  <>
                    <Scroll className="w-5 h-5" />
                    Survey Thy Route
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Response Section */}
        <AnimatePresence>
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-12"
            >
              <div className="bg-white legacy-border p-8 rounded-sm relative overflow-hidden">
                {/* Decorative watermark */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Scroll className="w-32 h-32" />
                </div>

                <div className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-serif font-bold text-navy border-b border-navy/10 pb-2 mb-4 flex items-center gap-2">
                      <ShieldAlert className="w-6 h-6 text-gold" />
                      NayAye’s Verdict
                    </h2>
                    <p className="text-lg italic text-navy/90 leading-relaxed">
                      "{response.verdict}"
                    </p>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-gold mb-3">What Thou Actually Needest</h3>
                      <p className="text-navy/80">{response.actualNeed}</p>
                    </section>
                    <section>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-gold mb-3">Likely Mistake</h3>
                      <p className="text-navy/80">{response.likelyMistake}</p>
                    </section>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-parchment/20 p-6 border border-navy/5">
                    <section>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-navy mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-forest" />
                        Best Tool
                      </h3>
                      <p className="text-xl font-serif font-bold text-navy">{response.bestTool}</p>
                    </section>
                    <section>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-navy mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-navy/40" />
                        Second-Best Option
                      </h3>
                      <p className="text-xl font-serif font-bold text-navy/60">{response.secondBest}</p>
                    </section>
                  </div>

                  <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gold mb-3">Why This Route</h3>
                    <p className="text-navy/80 leading-relaxed">{response.whyRoute}</p>
                  </section>

                  {/* B.Free Map */}
                  <section className="bg-parchment/40 p-8 border border-navy/10 rounded-sm">
                    <h2 className="text-2xl font-serif font-bold text-navy border-b border-navy/10 pb-2 mb-8 flex items-center gap-2">
                      <MapIcon className="w-6 h-6 text-navy" />
                      B.Free Map: The Surveyed Route
                    </h2>
                    
                    <div className="relative">
                      {/* Desktop Flow (Horizontal) */}
                      <div className="hidden md:flex items-center justify-between gap-2 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-navy/10 -translate-y-1/2 z-0" />
                        
                        {response.mapStages.map((stage, idx) => (
                          <div key={idx} className="relative z-10 flex flex-col items-center group">
                            <div className="w-32 h-20 bg-white border-2 border-navy flex items-center justify-center p-3 text-center text-xs font-bold text-navy shadow-[4px_4px_0px_rgba(26,43,72,0.1)] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-[6px_6px_0px_rgba(26,43,72,0.15)] transition-all">
                              {stage}
                            </div>
                            {idx < response.mapStages.length - 1 && (
                              <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-parchment px-1">
                                <ArrowRight className="w-4 h-4 text-navy" />
                              </div>
                            )}
                            <div className="mt-2 text-[10px] font-bold text-gold uppercase tracking-tighter">
                              Stage {idx + 1}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Mobile Flow (Vertical) */}
                      <div className="md:hidden flex flex-col items-center gap-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-1/2 top-0 h-full w-0.5 bg-navy/10 -translate-x-1/2 z-0" />
                        
                        {response.mapStages.map((stage, idx) => (
                          <div key={idx} className="relative z-10 flex flex-col items-center w-full">
                            <div className="w-48 h-16 bg-white border-2 border-navy flex items-center justify-center p-3 text-center text-xs font-bold text-navy shadow-[4px_4px_0px_rgba(26,43,72,0.1)]">
                              {stage}
                            </div>
                            {idx < response.mapStages.length - 1 && (
                              <div className="my-2 bg-parchment py-1">
                                <motion.div 
                                  animate={{ y: [0, 5, 0] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                >
                                  <ArrowRight className="w-5 h-5 text-navy rotate-90" />
                                </motion.div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-8 text-[10px] italic text-navy/40 text-center font-serif">
                      * Surveyed according to the principles of efficient post-road management.
                    </div>
                  </section>

                  <section className="bg-navy text-parchment p-6">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold mb-2">First Action</h3>
                    <p className="text-xl font-serif italic">
                      {response.firstAction}
                    </p>
                  </section>
                </div>
              </div>
              
              <div className="text-center">
                <button 
                  onClick={() => window.print()}
                  className="text-xs uppercase tracking-widest text-navy/40 hover:text-navy transition-colors font-bold"
                >
                  [ Print this Survey for thy Records ]
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="legacy-footer mt-12 py-8 text-center text-xs text-navy/40 font-medium">
        <p>© 2026 Michael J. Hinkle III. All Rights Reserved.</p>
        <p className="mt-1">NayAye is a personal research project—an Unofficial Office of the Digital Surveyor.</p>
        <p className="mt-4 italic">"An investment in knowledge pays the best interest." — B.F.</p>
        <div className="mt-12 flex justify-center">
          <img src="/text-logo.png" alt="NayAye Text Logo" className="max-w-[200px] opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700" />
        </div>
      </footer>
    </div>
  );
}
