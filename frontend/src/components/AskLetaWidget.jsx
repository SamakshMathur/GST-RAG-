import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, FileText, ChevronRight, Terminal } from 'lucide-react';
import LetaResponse from './LetaResponse';
import NeuralLoader from './NeuralLoader';

const AskLetaWidget = ({ domain = 'gst', contextDesc = 'GST scenarios' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);

  // Real API Call to LETA Backend
  const handleAsk = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: query,
          intent: "general" // Optional, backend handles it
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      
      // Backend returns: { answer: "...", reasoning: "...", sources: [...] }
      // We map it to the frontend expected format if needed, but it looks somewhat consistent.
      // Let's ensure the mapping is robust.
      
      setResponse({
        query: query, // Pass the original query for Advisory generation
        confidence: data.confidence || 0.95, // Backend might not send confidence, default high
        answer: data.answer,
        reasoning: data.reasoning || {
          interpretation: "Detailed Analysis included in the main answer.",
          provisions: [], 
          deduction: "Please refer to the detailed response above.",
          limitations: "Always verify with official notifications."
        },
        citations: data.sources ? data.sources.map(s => `${s.source} (Page ${s.page})`) : []
      });

    } catch (error) {
      console.error("LETA API Error:", error);
      setResponse({
        confidence: 0.0,
        answer: `Error connecting to LETA Backend. \n\nDetails: ${error.message}\n\nPlease ensure the backend server is running on port 8000.`,
        reasoning: {},
        citations: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Sidebar Trigger Card - Console Module */}
      <div 
        className="group relative bg-[#050A10]/60 backdrop-blur-md rounded-sm border border-sentinel-blue/30 overflow-hidden cursor-pointer hover:border-sentinel-green/80 transition-all duration-500 hover:shadow-[0_0_30px_rgba(11,115,80,0.3)]"
        onMouseEnter={() => setIsOpen(true)}
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-sentinel-blue group-hover:bg-sentinel-green transition-colors duration-300 shadow-[0_0_10px_#003B59]" />
        <div className="p-6 relative z-10">
           <div className="flex items-center justify-between mb-4">
              <div className="p-0 text-sentinel-blue group-hover:text-sentinel-green transition-colors duration-300 drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]">
                <Terminal size={24} />
              </div>
              <ChevronRight className="text-gray-600 group-hover:text-sentinel-green group-hover:translate-x-1 transition-all" />
           </div>
           <h3 className="text-xl font-bold text-white mb-2 font-mono uppercase tracking-tight group-hover:text-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Access LETA Console</h3>
           <p className="text-xs text-gray-500 mb-0 font-mono tracking-wide">
             // INITIALIZE ADVISORY PROTOCOL FOR {domain.toUpperCase()}
           </p>
           <button className="mt-6 w-full py-3 bg-[#081018]/50 border border-white/10 text-gray-400 text-xs font-mono font-bold uppercase tracking-[0.2em] hover:text-white hover:border-sentinel-green hover:bg-sentinel-green/10 transition-colors backdrop-blur-sm">
             [ LAUNCH_TERMINAL ]
           </button>
        </div>
      </div>

      {/* Full Screen Overlay Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
             {/* Backdrop */}
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/80 pointer-events-auto"
               onClick={() => setIsOpen(false)}
             />

             {/* Slide-out Panel (3/4 Width) */}
             <motion.div
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: "spring", damping: 30, stiffness: 300 }}
               className="relative w-full lg:w-3/4 h-full bg-[#020202] border-l border-white/20 shadow-none pointer-events-auto flex flex-col"
             >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#050A10]">
                   <div className="flex items-center gap-4">
                      <div className="p-2 bg-sentinel-green/10 border border-sentinel-green/20 rounded-sm text-sentinel-green">
                        <Terminal size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white font-mono tracking-wide uppercase">LETA Advisory Console</h2>
                        <span className="text-xs font-mono text-sentinel-green uppercase tracking-wider">
                          // SECURITY_LEVEL: HIGH_CLEARANCE
                        </span>
                      </div>
                   </div>
                   <button 
                     onClick={() => setIsOpen(false)}
                     className="p-2 text-gray-500 hover:text-white border border-transparent hover:border-white/10 rounded-sm transition-colors"
                   >
                     <X size={24} />
                   </button>
                </div>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-[#020202]">
                   {/* Chat Interface */}
                   {isLoading ? (
                      <NeuralLoader />
                   ) : !response ? (
                     <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12 mt-8">
                          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 font-mono uppercase tracking-tight">
                            Awaiting Query Input
                          </h1>
                          <p className="text-gray-500 font-mono text-sm max-w-xl mx-auto border-l-2 border-sentinel-blue pl-4 text-left">
                            Subject: {domain.toUpperCase()} Statutory Framework<br/>
                            Status: Ready for analysis<br/>
                            Protocol: Enter scenario for interpretation
                          </p>
                        </div>

                        <div className="relative group max-w-3xl mx-auto">
                          <div className="absolute -top-3 left-4 px-2 bg-[#020202] text-xs font-mono text-sentinel-green border border-sentinel-green/20">
                             INPUT_TERMINAL
                          </div>
                          <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={`> Enter case facts or statutory query here...`}
                            className="w-full min-h-[200px] p-6 bg-[#050A10] border border-white/10 text-gray-300 placeholder-gray-600 focus:border-sentinel-green focus:bg-[#081018] transition-all outline-none resize-none text-base font-mono leading-relaxed shadow-none rounded-none"
                          />
                          <div className="absolute bottom-4 right-4 flex items-center gap-3">
                             <span className="text-[10px] text-gray-600 font-mono uppercase">Batch Process: Ready</span>
                             <button
                                onClick={handleAsk}
                                disabled={!query.trim()}
                                className={`flex items-center gap-2 px-6 py-2 font-mono font-bold text-xs uppercase tracking-widest border transition-all ${
                                  !query.trim()
                                    ? 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
                                    : 'bg-sentinel-green/10 border-sentinel-green text-sentinel-green hover:bg-sentinel-green hover:text-white'
                                }`}
                              >
                                  <Send size={14} />
                                  EXECUTE_ANALYSIS
                              </button>
                          </div>
                        </div>

                        <div className="max-w-3xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="p-4 bg-[#050A10] border border-white/10 hover:border-sentinel-green/50 cursor-pointer transition-colors group" onClick={() => setQuery("What is the penalty for delayed filing of GSTR-3B under Section 47?")}>
                              <div className="flex items-center gap-2 mb-2 text-gray-500 group-hover:text-sentinel-green text-xs font-mono font-bold uppercase transition-colors">
                                 <FileText size={14} /> &gt; Load_Sample_01
                              </div>
                              <p className="text-gray-400 text-sm font-mono leading-tight group-hover:text-gray-200">Penalty for delayed filing under Section 47?</p>
                           </div>
                           <div className="p-4 bg-[#050A10] border border-white/10 hover:border-sentinel-blue/50 cursor-pointer transition-colors group" onClick={() => setQuery("Explain the applicability of RCM on legal services provided by an advocate.")}>
                              <div className="flex items-center gap-2 mb-2 text-gray-500 group-hover:text-sentinel-blue text-xs font-mono font-bold uppercase transition-colors">
                                 <FileText size={14} /> &gt; Load_Sample_02
                              </div>
                              <p className="text-gray-400 text-sm font-mono leading-tight group-hover:text-gray-200">Applicability of RCM on legal services?</p>
                           </div>
                        </div>
                     </div>
                   ) : (
                     <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-300">
                        <LetaResponse data={response} isDark={true} />
                        <div className="mt-8 text-center bg-[#050A10] border border-white/10 p-4 max-w-sm mx-auto">
                           <button 
                             onClick={() => setResponse(null)}
                             className="text-gray-400 hover:text-white text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                           >
                             <Terminal size={14} /> Initialize New Query
                           </button>
                        </div>
                     </div>
                   )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AskLetaWidget;
