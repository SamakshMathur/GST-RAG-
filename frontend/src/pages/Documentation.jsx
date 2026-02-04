import React from 'react';
import { FileText, Code, Book } from 'lucide-react';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-sentinel-dark py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
           <h1 className="text-3xl font-bold text-white mb-4">Documentation Hub</h1>
           <p className="text-gray-400">Comprehensive guides and API references for Sentinel.AI integration.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Card 1 */}
           <div className="bg-white/5 p-8 rounded-xl shadow-lg border border-white/10 hover:border-sentinel-green/30 hover:bg-white/10 transition-all backdrop-blur-sm group">
              <div className="w-12 h-12 bg-white/5 text-gray-300 rounded-lg flex items-center justify-center mb-6 group-hover:text-white group-hover:bg-white/10 transition-colors">
                <Book size={24} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white group-hover:text-sentinel-green transition-colors">User Guides</h3>
              <p className="text-gray-500 text-sm mb-4 group-hover:text-gray-400 transition-colors">
                Step-by-step tutorials on using the LETA interface, interpreting confidence scores, and managing citations.
              </p>
              <a href="#" className="text-sentinel-green font-medium text-sm hover:underline">View Guides &rarr;</a>
           </div>

           {/* Card 2 */}
           <div className="bg-white/5 p-8 rounded-xl shadow-lg border border-white/10 hover:border-sentinel-green/30 hover:bg-white/10 transition-all backdrop-blur-sm group">
              <div className="w-12 h-12 bg-white/5 text-gray-300 rounded-lg flex items-center justify-center mb-6 group-hover:text-white group-hover:bg-white/10 transition-colors">
                <Code size={24} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white group-hover:text-sentinel-green transition-colors">API Reference</h3>
              <p className="text-gray-500 text-sm mb-4 group-hover:text-gray-400 transition-colors">
                Technical documentation for accessing the Sentinel.AI knowledge graph programmatically.
              </p>
              <a href="#" className="text-sentinel-green font-medium text-sm hover:underline">Read API Docs &rarr;</a>
           </div>

           {/* Card 3 */}
           <div className="bg-white/5 p-8 rounded-xl shadow-lg border border-white/10 hover:border-sentinel-green/30 hover:bg-white/10 transition-all backdrop-blur-sm group">
              <div className="w-12 h-12 bg-white/5 text-gray-300 rounded-lg flex items-center justify-center mb-6 group-hover:text-white group-hover:bg-white/10 transition-colors">
                <FileText size={24} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white group-hover:text-sentinel-green transition-colors">Legal Disclaimers</h3>
              <p className="text-gray-500 text-sm mb-4 group-hover:text-gray-400 transition-colors">
                Terms of use, privacy policy, and liability limitations for AI-generated advisory.
              </p>
              <a href="#" className="text-sentinel-green font-medium text-sm hover:underline">Read Policy &rarr;</a>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
