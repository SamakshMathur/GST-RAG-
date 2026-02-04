import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ConfidenceBadge from './ConfidenceBadge';
import CitationList from './CitationList';
import LetaExplainability from './LetaExplainability';
import Button from './Button';
import { FileText, AlignLeft, ShieldCheck } from 'lucide-react';

const LetaResponse = ({ data, isDark = false }) => {
  const [citationMode, setCitationMode] = useState(false);

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-sm border overflow-hidden transition-all duration-300 ${
        isDark 
          ? 'bg-[#050A10] border-white/10 shadow-none' 
          : 'bg-white shadow-sentinel-blue/5 border-gray-100'
      }`}
    >
      {/* Header Bar */}
      <div className={`px-6 py-3 border-b flex items-center justify-between ${
         isDark ? 'bg-[#081018] border-white/10' : 'bg-gray-50 border-gray-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sentinel-green">
             <ShieldCheck size={16} />
             <span className="font-mono text-xs font-bold tracking-widest uppercase">LETA_OUTPUT_V1.0</span>
          </div>
          <div className={`h-4 w-[1px] ${isDark ? 'bg-white/10' : 'bg-gray-300'}`} />
          <ConfidenceBadge score={data.confidence} />
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={() => setCitationMode(false)}
                className={`p-1.5 rounded-sm transition-colors border ${
                  !citationMode 
                    ? (isDark ? 'bg-sentinel-blue/20 border-sentinel-blue text-white' : 'bg-white shadow text-sentinel-blue border-transparent') 
                    : (isDark ? 'border-transparent text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 border-transparent')
                }`}
                title="Full Response"
            >
                <AlignLeft size={16} />
            </button>
            <button 
                onClick={() => setCitationMode(true)}
                className={`p-1.5 rounded-sm transition-colors border ${
                  citationMode 
                    ? (isDark ? 'bg-sentinel-blue/20 border-sentinel-blue text-white' : 'bg-white shadow text-sentinel-blue border-transparent') 
                    : (isDark ? 'border-transparent text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 border-transparent')
                }`}
                title="Citations Only"
            >
                <FileText size={16} />
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 md:p-8 bg-[#050A10]">
        {!citationMode ? (
          <>
            <div className={`prose prose-sm md:prose-base max-w-none font-sans leading-relaxed ${
               isDark ? 'text-gray-300 prose-invert prose-headings:font-mono prose-headings:uppercase prose-strong:text-white' : 'text-gray-700'
            }`}>
              {data.answer.split('\n').map((para, i) => (
                <p key={i} className="mb-4">{para}</p>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5">
                <LetaExplainability reasoning={data.reasoning} isDark={isDark} />
            </div>
            <div className="mt-8">
                <CitationList citations={data.citations} isDark={isDark} />
            </div>
          </>
        ) : (
           <div className="py-4">
              <h3 className={`font-bold mb-4 font-mono uppercase text-sm tracking-wider ${isDark ? 'text-white' : 'text-sentinel-blue'}`}>
                 // STATUTORY_REFERENCE_INDEX
              </h3>
               <CitationList citations={data.citations} isDark={isDark} />
               <p className={`mt-8 text-xs font-mono border-t pt-4 ${isDark ? 'text-gray-500 border-white/10' : 'text-gray-400 border-gray-100'}`}>
                 // NOTE: CITATION_RELEVANCE_SCORE &gt; 0.85
               </p>
           </div>
        )}
      </div>
      
      {/* Footer */}
      <div className={`px-6 py-2 border-t flex justify-between items-center text-[10px] font-mono uppercase tracking-widest ${
         isDark 
           ? 'bg-[#020202] border-white/10 text-gray-600' 
           : 'bg-sentinel-blue/5 border-sentinel-blue/10 text-sentinel-blue/60'
      }`}>
        <span>GENERATED_BY_SENTINEL.AI_ENGINE</span>
        <span>ID: {data && Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
      </div>
    </motion.div>
  );
};

export default LetaResponse;
