import React from 'react';
import AskLetaWidget from './AskLetaWidget';
import DocumentLibrary from './DocumentLibrary';
import { FileText, TrendingUp, AlertCircle } from 'lucide-react';

const LawDashboard = ({ title, domainId, contextDesc, definition, implDate }) => {
  return (
    <div className="min-h-screen bg-sentinel-dark pb-20">
      {/* Page Header */}
      <div className="bg-gradient-to-b from-sentinel-blue/20 to-transparent pt-10 pb-24 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold font-sans tracking-tight mb-2 text-white">{title}</h1>
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-300">
             <span className="bg-sentinel-green/20 border border-sentinel-green/30 px-2 py-1 rounded font-mono text-sentinel-green text-xs">
                SECURE ACCESS
             </span>
             {implDate && (
                 <span className="flex items-center gap-1">
                    <span className="opacity-50">Effective from:</span> 
                    <span className="font-semibold text-white">{implDate}</span>
                 </span>
             )}
          </div>
          {definition && (
            <p className="max-w-3xl text-lg text-gray-300 font-light leading-relaxed border-l-4 border-sentinel-green pl-4">
              {definition}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Interface Column (2/3 width) - Now mostly Doc Library */}
        <div className="lg:col-span-2 space-y-8">
           <DocumentLibrary domainId={domainId} />
        </div>

        {/* Sidebar Info (1/3 width) - Includes Leta Trigger */}
        <div className="space-y-6">
           {/* Ask Leta Widget - Moved here */}
           <AskLetaWidget domain={domainId} contextDesc={contextDesc} />

           <div className="bg-white/5 p-6 rounded-lg shadow-lg border border-white/10 backdrop-blur-sm">
              <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-sentinel-green" />
                Latest Updates
              </h3>
              <ul className="space-y-3">
                 <li className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors border-l-2 border-transparent hover:border-sentinel-green pl-2">
                    Recent Amendments in {title}
                 </li>
                 <li className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors border-l-2 border-transparent hover:border-sentinel-green pl-2">
                    Latest Circulars & Notifications
                 </li>
                 <li className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors border-l-2 border-transparent hover:border-sentinel-green pl-2">
                    Key Judicial Pronouncements
                 </li>
              </ul>
           </div>

           <div className="bg-sentinel-blue/10 p-6 rounded-lg border border-sentinel-blue/20">
              <h3 className="font-bold text-sentinel-blue flex items-center gap-2 mb-2">
                <AlertCircle size={18} />
                Compliance Note
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                 LETA advice is generated based on statutory provisions for {title}. Always verify with official documents.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LawDashboard;
