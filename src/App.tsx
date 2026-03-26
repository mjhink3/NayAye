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
    <div className="min-h-screen font-sans p-2 md:p-4 max-w-4xl mx-auto flex flex-col">
      {/* Header */}
      <header className="legacy-header pb-2 mb-4 text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-2">
          <img src="/logo.png" alt="NayAye Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain" />
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-navy leading-none">NayAye</h1>
            <p className="text-gold font-serif italic text-base mt-1">
              From post roads to prompt roads.
            </p>
          </div>
        </div>
        <div className="text-[10px] md:text-xs uppercase tracking-widest text-navy/60 font-semibold">
          Unofficial Office of the Digital Surveyor
        </div>
      </header>

      <main className="space-y-4 flex-grow">
        {/* Form Section */}
        <section className="bg-white/50 legacy-border p-4 md:p-6 rounded-sm shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-serif text-base mb-1 text-navy">
                What art thou trying to do?
              </label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., I wish to automate my correspondence with the local printer..."
                className="w-full h-24 p-3 bg-parchment/30 border border-navy/20 focus:border-navy focus:ring-0 rounded-none font-sans resize-none transition-colors text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70">Skill Level</label>
                <select 
                  value={skill} 
                  onChange={(e) => setSkill(e.target.value as SkillLevel)}
                  className="w-full p-1.5 bg-white border border-navy/20 rounded-none focus:border-navy text-xs"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70">Budget</label>
                <select 
                  value={budget} 
                  onChange={(e) => setBudget(e.target.value as Budget)}
                  className="w-full p-1.5 bg-white border border-navy/20 rounded-none focus:border-navy text-xs"
                >
                  <option>Free</option>
                  <option>Low</option>
                  <option>Open</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70">Privacy</label>
                <select 
                  value={privacy} 
                  onChange={(e) => setPrivacy(e.target.value as Privacy)}
                  className="w-full p-1.5 bg-white border border-navy/20 rounded-none focus:border-navy text-xs"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70">Output</label>
                <select 
                  value={output} 
                  onChange={(e) => setOutput(e.target.value as OutputType)}
                  className="w-full p-1.5 bg-white border border-navy/20 rounded-none focus:border-navy text-xs"
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

            <div className="pt-2 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-6 py-2 bg-navy text-parchment font-serif font-bold text-base hover:bg-navy/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Surveying...
                  </>
                ) : (
                  <>
                    <Scroll className="w-4 h-4" />
                    Survey Thy Route
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-sm">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Response Section */}
        <AnimatePresence>
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pb-8"
            >
              <div className="bg-white legacy-border p-6 rounded-sm relative overflow-hidden shadow-lg">
                {/* Decorative watermark */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Scroll className="w-24 h-24" />
                </div>

                <div className="space-y-6">
                  <section>
                    <h2 className="text-xl font-serif font-bold text-navy border-b border-navy/10 pb-1 mb-3 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-gold" />
                      NayAye’s Verdict
                    </h2>
                    <p className="text-base italic text-navy/90 leading-relaxed">
                      "{response.verdict}"
                    </p>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-gold mb-2">What Thou Actually Needest</h3>
                      <p className="text-sm text-navy/80">{response.actualNeed}</p>
                    </section>
                    <section>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-gold mb-2">Likely Mistake</h3>
                      <p className="text-sm text-navy/80">{response.likelyMistake}</p>
                    </section>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-parchment/20 p-4 border border-navy/5">
                    <section>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-navy mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-forest" />
                        Best Tool
                      </h3>
                      <p className="text-lg font-serif font-bold text-navy">{response.bestTool}</p>
                    </section>
                    <section>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-navy mb-2 flex items-center gap-2">
                        <Info className="w-3 h-3 text-navy/40" />
                        Second-Best Option
                      </h3>
                      <p className="text-lg font-serif font-bold text-navy/60">{response.secondBest}</p>
                    </section>
                  </div>

                  <section>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gold mb-2">Why This Route</h3>
                    <p className="text-sm text-navy/80 leading-relaxed">{response.whyRoute}</p>
                  </section>

                  {/* B.Free Map */}
                  <section className="bg-parchment/40 p-6 border border-navy/10 rounded-sm">
                    <h2 className="text-xl font-serif font-bold text-navy border-b border-navy/10 pb-1 mb-6 flex items-center gap-2">
                      <MapIcon className="w-5 h-5 text-navy" />
                      B.Free Map: The Surveyed Route
                    </h2>
                    
                    <div className="relative">
                      {/* Desktop Flow (Horizontal) */}
                      <div className="hidden md:flex items-center justify-between gap-2 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-navy/10 -translate-y-1/2 z-0" />
                        
                        {response.mapStages.map((stage, idx) => (
                          <div key={idx} className="relative z-10 flex flex-col items-center group">
                            <div className="w-28 h-16 bg-white border-2 border-navy flex items-center justify-center p-2 text-center text-[10px] font-bold text-navy shadow-[3px_3px_0px_rgba(26,43,72,0.1)] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-[4px_4px_0px_rgba(26,43,72,0.15)] transition-all">
                              {stage}
                            </div>
                            <div className="mt-1 text-[8px] font-bold text-gold uppercase tracking-tighter">
                              Stage {idx + 1}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Mobile Flow (Vertical) */}
                      <div className="md:hidden flex flex-col items-center gap-4 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-1/2 top-0 h-full w-0.5 bg-navy/10 -translate-x-1/2 z-0" />
                        
                        {response.mapStages.map((stage, idx) => (
                          <div key={idx} className="relative z-10 flex flex-col items-center w-full">
                            <div className="w-40 h-12 bg-white border-2 border-navy flex items-center justify-center p-2 text-center text-[10px] font-bold text-navy shadow-[3px_3px_0px_rgba(26,43,72,0.1)]">
                              {stage}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section className="bg-navy text-parchment p-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-1">First Action</h3>
                    <p className="text-lg font-serif italic">
                      {response.firstAction}
                    </p>
                  </section>
                </div>
              </div>
              
              <div className="text-center">
                <button 
                  onClick={() => window.print()}
                  className="text-[10px] uppercase tracking-widest text-navy/40 hover:text-navy transition-colors font-bold"
                >
                  [ Print this Survey for thy Records ]
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="legacy-footer mt-4 py-4 text-center text-[10px] md:text-xs text-navy/40 font-medium border-t border-navy/5">
        <p>© 2026 Michael J. Hinkle III. All Rights Reserved.</p>
        <p className="mt-0.5">NayAye is a personal research project—an Unofficial Office of the Digital Surveyor.</p>
        <p className="mt-2 italic">"An investment in knowledge pays the best interest." — B.F.</p>
        <div className="mt-4 flex justify-center">
          <img src="/text-logo.png" alt="NayAye Text Logo" className="max-w-[280px] md:max-w-[350px] opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700" />
        </div>
      </footer>
    </div>
  );
}
