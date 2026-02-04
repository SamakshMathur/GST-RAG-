import React from 'react';
import AskLeta from '../components/AskLeta';
import { FileText, TrendingUp, AlertCircle, Shield } from 'lucide-react';

const GST = () => {
  return (
    <div className="min-h-screen bg-sentinel-dark pb-20 pt-20">
      {/* Page Header - Console Style */}
      <div className="px-4 sm:px-6 lg:px-8 mb-8 border-b border-white/10 pb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
                 <Shield className="text-sentinel-blue" size={24} />
                 <h1 className="text-2xl font-bold font-sans tracking-tight text-white uppercase">GST Intelligence Hub</h1>
            </div>
            <p className="text-gray-400 font-mono text-xs">
              // SYSTEM_STATUS: ONLINE
            </p>
          </div>
          <div className="flex items-center gap-4">
              <span className="text-sentinel-green text-xs font-mono bg-sentinel-green/10 border border-sentinel-green/20 px-2 py-1">
                 SECURE_CONNECTION_ESTABLISHED
              </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Interface Column (2/3 width) */}
        <div className="lg:col-span-2">
           <AskLeta />
        </div>

        {/* Sidebar Info (1/3 width) */}
        <div className="space-y-6">
           {/* Recent Amendments Panel */}
           <div className="bg-[#050A10] border border-white/10 p-0 rounded-sm">
              <div className="bg-[#081018] px-4 py-3 border-b border-white/10 flex items-center justify-between">
                 <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2 uppercase">
                   <TrendingUp size={16} className="text-sentinel-blue" />
                   Recent_Updates
                 </h3>
                 <div className="w-2 h-2 bg-sentinel-green rounded-full animate-pulse" />
              </div>
              <ul className="divide-y divide-white/5">
                 <li className="p-4 hover:bg-white/5 cursor-pointer transition-colors group">
                    <span className="text-[10px] text-sentinel-blue font-mono block mb-1">2 HOURS AGO</span>
                    <p className="text-sm text-gray-400 group-hover:text-white transition-colors">Notification 56/2023: Time limit extension for FY 2018-19</p>
                 </li>
                 <li className="p-4 hover:bg-white/5 cursor-pointer transition-colors group">
                    <span className="text-[10px] text-sentinel-blue font-mono block mb-1">YESTERDAY</span>
                    <p className="text-sm text-gray-400 group-hover:text-white transition-colors">Circular 199: Clarification on ITC regarding warranty replacements</p>
                 </li>
                 <li className="p-4 hover:bg-white/5 cursor-pointer transition-colors group">
                    <span className="text-[10px] text-sentinel-blue font-mono block mb-1">2 DAYS AGO</span>
                    <p className="text-sm text-gray-400 group-hover:text-white transition-colors">Rule 88D: Mechanism for dealing with difference in ITC</p>
                 </li>
              </ul>
           </div>

           {/* Compliance Note Panel */}
           <div className="bg-[#050A10] border border-sentinel-blue/30 p-4 rounded-sm">
              <h3 className="font-bold text-sentinel-blue flex items-center gap-2 mb-3 text-xs font-mono uppercase">
                <AlertCircle size={16} />
                Compliance_Advisory
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-mono">
                 LETA output is generated based on statutory provisions (CGST Act, 2017). 
                 <br/><br/>
                 <span className="text-sentinel-blue">&gt;&gt; Always verify citations with official gazette notifications before filing.</span>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GST;
