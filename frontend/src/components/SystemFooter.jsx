import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Twitter, Linkedin, Activity, Shield, Cpu, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const logMessages = [
  "Initializing handshake protocol...",
  "Syncing statutory databases [GST, FEMA, IT]...",
  "Node_Alpha: Latency verified at 12ms.",
  "Re-indexing vector embeddings...",
  "Optimizing query resolution path...",
  "Secure connection established: 256-bit AES.",
  "System Status: OPTIMAL.",
  "Waiting for user input...",
  "Deconstructing latest Notification 12/2024...",
  "Telemetry signal: STRONG."
];

const SystemFooter = () => {
  const [currentLog, setCurrentLog] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLog((prev) => (prev + 1) % logMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-[#020202] border-t border-white/5 pt-16 pb-8 text-white relative overflow-hidden">
        {/* Decorative Top Grid */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sentinel-green/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                
                {/* Brand Column */}
                <div className="col-span-1 md:col-span-1">
                    <Link to="/" className="flex items-center gap-2 mb-6 group">
                        <div className="w-8 h-8 bg-sentinel-green/10 border border-sentinel-green/30 rounded flex items-center justify-center group-hover:bg-sentinel-green/20 transition-colors">
                            <Shield size={16} className="text-sentinel-green" />
                        </div>
                        <span className="text-xl font-bold tracking-tight font-sans">SENTINEL.AI</span>
                    </Link>
                    <p className="text-gray-500 text-sm leading-relaxed font-light mb-6">
                        Advanced statutory intelligence for the modern Charted Accountant. 
                        Autonomous deconstruction of complex legal frameworks.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-gray-500 hover:text-white transition-colors"><Twitter size={18} /></a>
                        <a href="#" className="text-gray-500 hover:text-white transition-colors"><Github size={18} /></a>
                        <a href="#" className="text-gray-500 hover:text-white transition-colors"><Linkedin size={18} /></a>
                    </div>
                </div>

                {/* Links Column 1 */}
                <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 font-mono">Platform</h4>
                    <ul className="space-y-3 text-sm text-gray-400 font-mono">
                        <li><Link to="/gst" className="hover:text-sentinel-green transition-colors">GST Intelligence</Link></li>
                        <li><Link to="/income-tax" className="hover:text-sentinel-green transition-colors">Income Tax</Link></li>
                        <li><Link to="/fema" className="hover:text-sentinel-green transition-colors">FEMA Expert</Link></li>
                        <li><Link to="/company-law" className="hover:text-sentinel-green transition-colors">Company Law</Link></li>
                    </ul>
                </div>

                {/* Links Column 2 */}
                <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 font-mono">Resources</h4>
                    <ul className="space-y-3 text-sm text-gray-400 font-mono">
                        <li><Link to="/docs" className="hover:text-sentinel-green transition-colors">Documentation</Link></li>
                        <li><Link to="#" className="hover:text-sentinel-green transition-colors">API Reference</Link></li>
                        <li><Link to="#" className="hover:text-sentinel-green transition-colors">System Status</Link></li>
                        <li><Link to="/about" className="hover:text-sentinel-green transition-colors">About Us</Link></li>
                    </ul>
                </div>

                {/* AI Communication Log */}
                <div className="col-span-1 border border-white/5 bg-[#050A10] p-4 rounded-sm font-mono text-xs overflow-hidden relative min-h-[160px]">
                    <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                        <Activity size={12} className="text-sentinel-green animate-pulse" />
                        <span className="text-gray-500 uppercase tracking-widest">Network Activity</span>
                    </div>
                    
                    <div className="flex flex-col gap-2 relative h-full">
                         {/* Fading history effect */}
                         <div className="opacity-30 text-sentinel-blue/80">
                            &gt; {logMessages[(currentLog - 2 + logMessages.length) % logMessages.length]}
                         </div>
                         <div className="opacity-60 text-sentinel-blue">
                            &gt; {logMessages[(currentLog - 1 + logMessages.length) % logMessages.length]}
                         </div>
                         <motion.div 
                            key={currentLog}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sentinel-green font-bold"
                         >
                            &gt; {logMessages[currentLog]}
                            <span className="animate-pulse inline-block ml-1">_</span>
                         </motion.div>
                    </div>

                    {/* Background noise grid for the terminal */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9Im5vbmUiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-20 pointer-events-none" />
                </div>
            </div>

            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-600 text-xs font-mono">
                    &copy; {new Date().getFullYear()} Sentinel.AI // All Rights Reserved.
                </p>
                <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-sentinel-green animate-pulse" />
                    <span className="text-gray-600 text-xs font-mono uppercase tracking-widest">System Operational</span>
                </div>
            </div>
        </div>
    </footer>
  );
};

export default SystemFooter;
