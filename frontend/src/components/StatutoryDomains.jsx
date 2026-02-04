import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Landmark, Globe, Briefcase, ChevronRight, Lock, Activity, Binary } from 'lucide-react';

const domains = [
  {
    id: 'gst',
    title: 'GST Intelligence',
    subtext: 'Goods and Services Tax',
    desc: 'Domain-trained statutory intelligence for Indian GST, covering Acts, Rules, Notifications, Circulars, and judicial clarifications.',
    icon: FileText,
    path: '/gst',
    status: 'ACTIVE',
    color: 'text-sentinel-blue'
  },
  {
    id: 'income-tax',
    title: 'Income Tax',
    subtext: 'Direct Tax Laws',
    desc: 'Structured intelligence for interpretation and compliance under the Income-tax Act, including assessments, deductions, and procedural guidance.',
    icon: Landmark,
    path: '/income-tax',
    status: 'COMING SOON',
    color: 'text-purple-400'
  },
  {
    id: 'fema',
    title: 'FEMA Advisory',
    subtext: 'Foreign Exchange Management',
    desc: 'Specialized intelligence for cross-border transactions, remittances, and regulatory compliance under FEMA.',
    icon: Globe,
    path: '/fema',
    status: 'COMING SOON',
    color: 'text-orange-400'
  },
  {
    id: 'company-law',
    title: 'Company Law',
    subtext: 'Companies Act, 2013',
    desc: 'Compliance and interpretive intelligence for corporate governance, filings, and statutory obligations.',
    icon: Briefcase,
    path: '/company-law',
    status: 'COMING SOON',
    color: 'text-rose-400'
  }
];

const StatutoryDomains = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % domains.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 relative bg-[#020202] border-t border-white/5 overflow-hidden">
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* Header */}
        <div className="mb-16 flex items-end justify-between border-b border-white/5 pb-8">
            <div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-sans tracking-tight">
                    Statutory Intelligence <span className="text-gray-600">Modules</span>
                </h2>
                <div className="flex items-center gap-2 text-sentinel-green font-mono text-xs uppercase tracking-widest">
                    <Activity size={12} className="animate-pulse" />
                    <span>System Status: Online</span>
                </div>
            </div>
            <div className="hidden md:block text-right">
                 <p className="text-gray-500 font-mono text-sm">// SELECT ACTIVE JURISDICTION_</p>
            </div>
        </div>

        {/* Accordion Container */}
        <div className="flex flex-col lg:flex-row gap-4 h-[600px] lg:h-[500px]">
            {domains.map((domain, index) => {
                const isActive = index === activeIndex;

                return (
                    <motion.div
                        key={domain.id}
                        layout
                        onClick={() => setActiveIndex(index)}
                        className={`relative rounded-sm overflow-hidden cursor-pointer border transition-colors duration-500 ${
                            isActive 
                                ? 'flex-[4] border-sentinel-green/30 bg-[#050A10]' 
                                : 'flex-[1] border-white/10 bg-[#030609] hover:border-white/20'
                        }`}
                    >
                        {/* Background for Active Card */}
                        {isActive && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 z-0"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-sentinel-green/5 to-transparent rounded-bl-full" />
                                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sentinel-green/20 to-transparent" />
                                
                                {/* Decorate with binary data */}
                                <div className="absolute top-8 right-8 text-[10px] font-mono text-sentinel-green/20 flex flex-col items-end">
                                    <span>01011001</span>
                                    <span>10100110</span>
                                    <span>00111010</span>
                                </div>
                            </motion.div>
                        )}

                        {/* Content Wrapper */}
                        <div className="relative z-10 h-full p-6 flex flex-col">
                            
                            {/* Inactive Vertical Title */}
                            {!isActive && (
                                <div className="absolute inset-0 flex items-center justify-center lg:rotate-[-90deg]">
                                    <h3 className="text-gray-500 font-bold uppercase tracking-widest text-sm whitespace-nowrap">
                                        {domain.title}
                                    </h3>
                                </div>
                            )}

                            {/* Active Content */}
                            <AnimatePresence mode="wait">
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                        className="h-full flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-8">
                                                <div className={`p-3 rounded-full bg-white/5 ${domain.color}`}>
                                                    <domain.icon size={32} strokeWidth={1.5} />
                                                </div>
                                                <div className={`px-2 py-1 text-[10px] font-bold tracking-widest uppercase font-mono border ${
                                                    domain.status === 'ACTIVE' 
                                                        ? 'bg-sentinel-green/10 text-sentinel-green border-sentinel-green/30' 
                                                        : 'bg-white/5 text-gray-500 border-white/10'
                                                }`}>
                                                    [ {domain.status} ]
                                                </div>
                                            </div>

                                            <h3 className="text-3xl font-bold text-white mb-2 font-sans">
                                                {domain.title}
                                            </h3>
                                            <p className="text-gray-500 font-mono text-sm mb-6 uppercase tracking-wider">
                                                // {domain.subtext}
                                            </p>
                                            
                                            <div className="w-12 h-0.5 bg-gradient-to-r from-sentinel-green to-transparent mb-6" />

                                            <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                                                {domain.desc}
                                            </p>
                                        </div>

                                        <div>
                                            {domain.status === 'ACTIVE' ? (
                                                <Link 
                                                    to={domain.path}
                                                    className="inline-flex items-center gap-3 px-6 py-3 bg-sentinel-green text-black font-bold uppercase tracking-wider text-sm hover:bg-white transition-colors rounded-sm"
                                                >
                                                    Initialize Module <ChevronRight size={16} />
                                                </Link>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 text-gray-600 font-mono text-xs uppercase tracking-widest">
                                                    <Lock size={14} /> Access Restricted
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                );
            })}
        </div>

      </div>
    </section>
  );
};

export default StatutoryDomains;
