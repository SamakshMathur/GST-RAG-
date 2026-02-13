import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ConfidenceBadge from './ConfidenceBadge';
import CitationList from './CitationList';
import LetaExplainability from './LetaExplainability';
import Button from './Button';
import { FileText, AlignLeft, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import AdvisoryModal from './AdvisoryModal';

const LetaResponse = ({ data, isDark = false }) => {
  const [citationMode, setCitationMode] = useState(false);
  const [isAdvisoryOpen, setIsAdvisoryOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    if (!data?.answer) return;
    
    let i = 0;
    const text = data.answer;
    setDisplayedText(''); // Reset on new data
    
    const interval = setInterval(() => {
      setDisplayedText((prev) => text.substring(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
      }
    }, 10); // Standard "LLM" speed
    
    return () => clearInterval(interval);
  }, [data?.answer]);

  if (!data) return null;

  return (
    <>
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
          </div>
        </div>
  
        {/* Content Area */}
        <div className="p-6 md:p-8 bg-[#050A10]">
          {!citationMode ? (
            <>
              <div className={`prose prose-sm md:prose-base max-w-none font-sans leading-relaxed ${
                 isDark ? 'text-gray-300 prose-invert prose-headings:font-mono prose-headings:uppercase prose-strong:text-white' : 'text-gray-700'
              }`}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-6 mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-5 mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-base font-bold mt-4 mb-2" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 mb-4 space-y-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 mb-4 space-y-2" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-sentinel-blue dark:text-white" {...props} />,
                  }}
                >
                  {displayedText}
                </ReactMarkdown>
              </div>
              
              {/* ADVISORY CTA */}
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                  <button 
                    onClick={() => setIsAdvisoryOpen(true)}
                    className="group flex items-center gap-3 px-5 py-2.5 bg-sentinel-blue/10 border border-sentinel-blue/30 text-sentinel-blue hover:bg-sentinel-blue hover:text-white transition-all rounded-sm"
                  >
                     <FileText size={16} className="group-hover:scale-110 transition-transform" />
                     <span className="font-mono text-xs font-bold uppercase tracking-widest">Generate Legal Advisory</span>
                  </button>
              </div>

            </>
          ) : (
             <div className="py-4">
                {/* Citations Mode hidden */}
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

      {/* Render Modal */}
      <AdvisoryModal 
        isOpen={isAdvisoryOpen} 
        onClose={() => setIsAdvisoryOpen(false)}
        initialQuery={data.query} // We need to ensure data.query exists or is passed down!
        initialContext={data.answer} // Using answer as context for now, ideally we pass retrieved chunks
      />
    </>
  );
};

export default LetaResponse;
