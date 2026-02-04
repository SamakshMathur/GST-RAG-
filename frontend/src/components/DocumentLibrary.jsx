import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Bell, Layers, BookOpen, Download, ChevronRight } from 'lucide-react';

// Mock Data for each domain
const documentsData = {
  gst: {
    circulars: [
      { id: 'c1', title: 'Circular No. 199/11/2023-GST', desc: 'Clarification regarding taxability of services provided by an office of an organisation in one State to the office of that organisation in another State.', date: 'Dec 15, 2023', size: '1.2 MB' },
      { id: 'c2', title: 'Circular No. 198/10/2023-GST', desc: 'Clarification on availability of ITC in respect of warranty replacement of parts and repair services during warranty period.', date: 'Oct 04, 2023', size: '850 KB' },
    ],
    notifications: [
      { id: 'n1', title: 'Notification No. 05/2024 - Central Tax', desc: 'Extension of due date for filing FORM GSTR-3B.', date: 'Jan 05, 2024', size: '420 KB' },
    ],
    forms: [
      { id: 'f1', title: 'FORM GSTR-1', desc: 'Details of outward supplies of goods or services.', size: '2.5 MB' },
      { id: 'f2', title: 'FORM GST REG-01', desc: 'Application for Registration under Section 19(1).', size: '1.8 MB' },
    ],
    flyers: [
      { id: 'fly1', title: 'GST Flyer: Basics of GST', desc: 'An introductory guide for new taxpayers.', size: '5.0 MB' },
    ],
  },
  'income-tax': {
    circulars: [
       { id: 'itc1', title: 'Circular No. 15 of 2023', desc: 'Condonation of delay under section 119(2)(b) of the Income-tax Act, 1961.', date: 'Nov 20, 2023', size: '900 KB' }
    ],
    notifications: [
       { id: 'itn1', title: 'Notification No. 90/2023', desc: 'Income-tax (Twenty-fifth Amendment) Rules, 2023.', date: 'Oct 15, 2023', size: '550 KB' }
    ],
    forms: [
       { id: 'itf1', title: 'ITR-1 SAHAJ', desc: 'For individuals being a resident (other than not ordinarily resident) having total income upto Rs.50 lakh.', size: '3.0 MB' }
    ],
    flyers: [
       { id: 'itfly1', title: 'Taxpayer Information Series', desc: 'Understanding your tax brackets for AY 2024-25.', size: '2.1 MB' }
    ]
  },
  fema: {
     circulars: [
        { id: 'femac1', title: 'A.P. (DIR Series) Circular No. 10', desc: 'Foreign Exchange Management (Overseas Investment) Regulations, 2022.', date: 'Jan 22, 2024', size: '1.5 MB' }
     ],
     notifications: [],
     forms: [
        { id: 'femaf1', title: 'Form FC-GPR', desc: 'Reporting of foreign investment in India.', size: '1.1 MB' }
     ],
     flyers: []
  },
  'company-law': {
      circulars: [
         { id: 'clc1', title: 'General Circular No. 09/2023', desc: 'Clarification on holding of AGM through Video Conferencing.', date: 'Sep 25, 2023', size: '600 KB' }
      ],
      notifications: [],
      forms: [
         { id: 'clf1', title: 'Form MGT-7', desc: 'Annual Return.', size: '4.5 MB' }
      ],
      flyers: []
  }
};

const categories = [
  { id: 'circulars', label: 'Circulars', icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'forms', label: 'Forms', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'flyers', label: 'Flyers & Manuals', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' }
];

const DocumentLibrary = ({ domainId }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  
  // Fallback to empty context if domain not found (though routes ensure it exists)
  const data = documentsData[domainId] || { circulars: [], notifications: [], forms: [], flyers: [] };

  return (
    <section className="bg-[#050A10] border border-white/10 mt-8 rounded-sm">
      <div className="p-4 border-b border-white/10 bg-[#081018] flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono uppercase tracking-tight">
            <BookOpen className="text-sentinel-blue" size={18} />
             DOC_LIBRARY_V1.0
          </h2>
        </div>
        <div className="text-[10px] font-mono text-gray-500">
           ID: {domainId.toUpperCase()}
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
               [{data[cat.id]?.length || 0}]
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
               
               {data[activeCategory]?.length > 0 ? (
                 <div className="divide-y divide-white/5">
                   {data[activeCategory].map((file) => (
                     <div key={file.id} className="group flex items-center justify-between p-4 hover:bg-[#081018] transition-colors cursor-pointer">
                        <div className="flex items-start gap-4">
                           <div className="mt-1 text-gray-600 group-hover:text-sentinel-blue transition-colors">
                              <FileText size={16} />
                           </div>
                           <div>
                              <h4 className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors font-mono">
                                {file.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1 font-mono">{file.desc}</p>
                           </div>
                        </div>
                        
                        <div className="items-center gap-4 hidden sm:flex">
                           <span className="text-[10px] font-mono text-gray-600">
                              {file.date || 'N/A'}
                           </span>
                           <span className="text-[10px] font-mono text-sentinel-blue border border-sentinel-blue/30 px-1 py-0.5 rounded-sm">
                              {file.size}
                           </span>
                           <button className="text-gray-500 hover:text-sentinel-green transition-colors" title="Download">
                              <Download size={16} />
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
    </section>
  );
};

export default DocumentLibrary;
