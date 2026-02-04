import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import LetaResponse from './LetaResponse';
import { Search, Loader2 } from 'lucide-react';

const AskLeta = ({ domain = 'gst', contextDesc = 'GST scenarios' }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleAsk = () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse(null);

    // Mock API delay
    setTimeout(() => {
      setIsLoading(false);
      setResponse({
        confidence: 0.92,
        answer: `[MOCK RESPONSE FOR ${domain.toUpperCase()}] \n\nBased on the relevant provisions of the ${domain.toUpperCase()} Act, the query regarding "${query.substring(0, 20)}..." interprets as follows... \n\n(This is a placeholder response. Real LETA backend integration would occur here.)`,
        reasoning: {
          interpretation: `Analysis of user query within ${domain.toUpperCase()} context.`,
          provisions: [`Section 123 of ${domain.toUpperCase()} Act`, "Notification 45/2024"],
          deduction: "The statutory reading suggests compliance is mandatory under given conditions.",
          limitations: "General advisory only."
        },
        citations: [
          `${domain.toUpperCase()} Act, Section 12`,
          "Relevant Notification"
        ]
      });
    }, 2000);
  };

  return (
    <section className="bg-white rounded-xl shadow-2xl shadow-sentinel-blue/10 border border-gray-100 overflow-hidden relative">
      {/* Decorative top bar */}
      <div className="h-1 bg-brand-gradient w-full" />
      
      <div className="p-8">
        <h2 className="text-2xl font-bold text-sentinel-blue mb-2 font-sans">Statutory Advisory Console</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Enter a specific {contextDesc}. LETA will analyze statutory provisions to provide a reasoned opinion.
        </p>

        <div className="relative mb-6 group">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Describe the scenario for ${domain.toUpperCase()} (e.g., specific section queries, compliance issues...)`}
            className="w-full min-h-[120px] p-4 bg-gray-50 border border-gray-200 rounded-lg text-sentinel-blue focus:ring-2 focus:ring-sentinel-green/20 focus:border-sentinel-green transition-all outline-none resize-none font-sans text-base"
          />
          <div className="absolute top-0 right-0 p-2">
             <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" title="System Ready" />
          </div>
        </div>

        <div className="flex justify-end items-center gap-4">
           {isLoading && (
             <span className="flex items-center gap-2 text-xs text-sentinel-blue/60 font-pixel animate-pulse">
               <Loader2 className="animate-spin" size={14} />
               ANALYZING STATUTES...
             </span>
           )}
           <Button 
             onClick={handleAsk} 
             disabled={isLoading || !query.trim()}
             className="min-w-[140px] flex items-center justify-center gap-2"
           >
             {isLoading ? 'Processing' : (
               <>
                 <Search size={18} />
                 Ask LETA
               </>
             )}
           </Button>
        </div>
      </div>

      {/* Response Section */}
      <div className="bg-gray-50/50 p-8 border-t border-gray-100 min-h-[200px]">
        {!response && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">Awaiting Input Query</p>
                <p className="text-xs opacity-60 mt-2 text-center max-w-sm">
                    LETA analyzes the GST Act, Rules, and Notifications up to the latest amendment.
                </p>
            </div>
        )}
        
        {response && (
            <LetaResponse data={response} />
        )}
      </div>
    </section>
  );
};

export default AskLeta;
