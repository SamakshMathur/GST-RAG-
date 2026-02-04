import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from './Button';
import IntelligenceBackground from './IntelligenceBackground';

const Hero = () => {
  return (
    <div className="relative min-h-[90vh] flex items-center bg-[#020202] overflow-hidden pt-16">
      {/* Strict Intelligence Background */}
      <IntelligenceBackground />
      
      {/* Content Layer */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 py-1 px-4 rounded-sm bg-[#050A10] border border-sentinel-blue/30 text-[10px] font-mono tracking-[0.2em] text-sentinel-green mb-8">
            <span className="w-1.5 h-1.5 bg-sentinel-green rounded-full animate-pulse"></span>
            SYSTEM_ONLINE // V1.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 font-sans text-white">
            Statutory Intelligence. <br />
            <span className="text-gray-500 font-light">
              Redefined.
            </span>
          </h1>

          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto font-mono leading-relaxed border-l-2 border-sentinel-blue/30 pl-6 text-left md:text-center md:border-l-0 md:pl-0">
            Advanced interpretive algorithms for GST compliance. <br className="hidden md:block"/>
            Precision, reduced to a science.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center items-center">
             <Link to="/gst">
                <Button variant="primary" className="min-w-[180px] font-mono uppercase tracking-widest text-xs py-4">
                  [ Initialize LETA ]
                </Button>
             </Link>
             <Link to="/docs">
               <button className="min-w-[180px] py-3.5 px-6 border border-white/10 text-gray-400 font-mono text-xs uppercase tracking-widest hover:text-white hover:border-white/30 transition-all bg-[#050A10]">
                 Documentation
               </button>
             </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator - Strict Console Style */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none"
      >
        <span className="text-[9px] font-mono text-gray-600 tracking-[0.2em] uppercase">Scroll to Scan</span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-sentinel-green/50 to-transparent" />
      </motion.div>
    </div>
  );
};

export default Hero;
