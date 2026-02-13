import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Bell, Layers, BookOpen, Download, ChevronRight, HelpCircle } from 'lucide-react';
import DocPreviewSidebar from './DocPreviewSidebar';

const categories = [
  { id: 'circulars', label: 'Circulars', icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'forms', label: 'Forms', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'flyers', label: 'Flyers', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' }
];

const VITE_API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const API_BASE = VITE_API_BASE.includes('api_proxy') ? `${VITE_API_BASE}/api/documents` : `${VITE_API_BASE}/api/documents`;

const FAQSection = () => {
    // Hardcoded FAQs for now as requested
    const faqs = [
        { q: "What is the time limit for claiming ITC?", a: "As per Section 16(4) of the CGST Act, ITC can be claimed up to the 30th of November following the end of the financial year or the date of filing the relevant annual return, whichever is earlier." },
        { q: "Is GST registration mandatory for inter-state supply?", a: "Yes, under Section 24 of the CGST Act, persons making any inter-state taxable supply are required to be compulsorily registered regardless of turnover threshold." },
        { q: "Can I revise my GST Return?", a: "There is no provision for revising a filed GST return. However, any errors or omissions can be rectified in the subsequent month's return, subject to the time limit specified in the Act." }
    ];

    return (
        <div className="mt-8 border-t border-white/10 pt-6 px-4 pb-4">
             <h3 className="text-white font-mono text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <HelpCircle size={14} className="text-sentinel-blue" />
                Frequently Asked Questions
             </h3>
             <div className="grid gap-4">
                {faqs.map((item, i) => (
                    <div key={i} className="bg-[#0A1420] border border-white/5 p-4 rounded-sm hover:border-white/20 transition-colors">
                        <h4 className="text-sentinel-blue font-mono text-xs font-bold mb-2 uppercase">Q: {item.q}</h4>
                        <p className="text-gray-400 text-xs leading-relaxed font-mono">{item.a}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


const DocumentLibrary = ({ domainId }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [counts, setCounts] = useState({});
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    // Fetch counts
    fetch(`${API_BASE}/categories`)
        .then(res => res.json())
        .then(data => setCounts(data))
        .catch(err => console.error("Failed to fetch counts:", err));
  }, []);

  useEffect(() => {
    if (activeCategory) {
        setLoading(true);
        fetch(`${API_BASE}/list/${activeCategory}`)
            .then(res => res.json())
            .then(data => {
                setFiles(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch files:", err);
                setLoading(false);
            });
    }
  }, [activeCategory]);

  const handleDownload = (doc) => {
     window.open(`${API_BASE}/view?category=${doc.id.split('_')[0]}&filename=${encodeURIComponent(doc.filename)}`, '_blank');
  };

  return (
    <>
    <section className="bg-[#050A10] border border-white/10 mt-8 rounded-sm">
      <div className="p-4 border-b border-white/10 bg-[#081018] flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono uppercase tracking-tight">
            <BookOpen className="text-sentinel-blue" size={18} />
             DOC_LIBRARY_V1.0
          </h2>
        </div>
        <div className="text-[10px] font-mono text-gray-500">
           ID: GST_DATABASE_ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-white/10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`flex flex-col items-center justify-center p-6 border-r border-white/10 last:border-r-0 transition-all duration-200 ${
              activeCategory === cat.id 
                ? 'bg-sentinel-blue/10 text-white shadow-[inset_0_0_10px_rgba(0,59,89,0.3)]' 
                : 'bg-transparent text-gray-500 hover:bg-[#0A1420] hover:text-gray-300'
            }`}
          >
            <cat.icon size={20} className={`mb-3 ${activeCategory === cat.id ? 'text-sentinel-blue' : 'text-gray-600'}`} />
            <span className={`font-mono text-xs uppercase tracking-wider`}>
              {cat.label}
            </span>
            <span className="text-[10px] mt-1 text-gray-600 font-mono">
               [{counts[cat.id] || 0}]
            </span>
          </button>
        ))}
      </div>

      {/* Expandable Content Area */}
      <AnimatePresence>
        {activeCategory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/10 bg-[#020202]"
          >
            <div className="p-0">
               <div className="px-4 py-2 bg-sentinel-blue/5 border-b border-white/10 text-[10px] font-mono text-sentinel-blue uppercase tracking-widest">
                 // LISTING CONTENTS FOR: {categories.find(c => c.id === activeCategory).label}
               </div>
               
               {loading ? (
                   <div className="p-8 text-center text-xs font-mono text-sentinel-blue animate-pulse">
                       // LOADING_DATA...
                   </div>
               ) : files.length > 0 ? (
                 <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                   {files.map((file) => (
                     <div key={file.id} onClick={() => setSelectedDoc(file)} className="group flex items-center justify-between p-4 hover:bg-[#081018] transition-colors cursor-pointer">
                        <div className="flex items-start gap-4">
                           <div className="mt-1 text-gray-600 group-hover:text-sentinel-blue transition-colors">
                              <FileText size={16} />
                           </div>
                           <div>
                              <h4 className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors font-mono break-all pr-4">
                                {file.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1 font-mono">Size: {file.size}</p>
                           </div>
                        </div>
                        
                        <div className="items-center gap-4 hidden sm:flex">
                           <button className="text-gray-500 hover:text-sentinel-green transition-colors" title="Download">
                              <ChevronRight size={16} />
                           </button>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-8 text-gray-600 italic font-mono text-xs">
                   // NO_DATA_FOUND
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* FAQ Section */}
      <FAQSection />
    </section>

    {/* Sidebar Portal */}
    <DocPreviewSidebar 
        isOpen={!!selectedDoc} 
        document={selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
        onDownload={handleDownload}
    />
    </>
  );
};

export default DocumentLibrary;
