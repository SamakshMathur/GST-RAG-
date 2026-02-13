import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from './Button';
import IntelligenceBackground from './IntelligenceBackground';

const Hero = () => {
  return (
    <div className="relative min-h-[90vh] flex items-center bg-[#020202] overflow-hidden pt-16">
      {/* Strict Intelligence Background */}
      <div className="absolute inset-0 z-0">
          <IntelligenceBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020202]/50 to-[#020202] z-10 pointer-events-none" />
      </div>
      
      {/* Content Layer */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-3 py-1.5 px-6 rounded-full bg-sentinel-green/5 border border-sentinel-green/20 backdrop-blur-md text-[10px] font-mono tracking-[0.2em] text-sentinel-green mb-10 shadow-[0_0_15px_rgba(11,115,80,0.2)]">
            <span className="w-1.5 h-1.5 bg-sentinel-green rounded-full animate-pulse shadow-[0_0_10px_#0B7350]"></span>
            SYSTEM_ONLINE // V1.0
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 font-mono text-white leading-[0.9]">
            Statutory <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600">Intelligence.</span> <br />
            <span className="font-light text-sentinel-green/80 italic text-5xl md:text-7xl">
              Redefined.
            </span>
          </h1>

          <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto font-sans font-light leading-relaxed border-l-2 border-cinema-gold/30 pl-6 text-left md:text-center md:border-l-0 md:pl-0">
            Advanced interpretive algorithms for <span className="text-white font-medium">GST compliance</span>. 
            Precision, reduced to a science.
          </p>

          <div className="mt-14 flex flex-col sm:flex-row gap-6 justify-center items-center">
             <Link to="/gst">
                <Button variant="primary" className="min-w-[200px] font-mono uppercase tracking-widest text-xs py-5 rounded-sm shadow-[0_0_20px_rgba(11,115,80,0.4)] hover:shadow-[0_0_30px_rgba(11,115,80,0.6)] transition-all duration-300 border border-sentinel-green/50">
                  [ Initialize LETA ]
                </Button>
             </Link>
             <Link to="/docs">
               <button className="min-w-[200px] py-4 px-8 border border-white/10 text-gray-400 font-mono text-xs uppercase tracking-widest hover:text-white hover:border-cinema-gold/50 hover:bg-cinema-gold/5 transition-all bg-[#050A10]/50 backdrop-blur-md rounded-sm">
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
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none z-20"
      >
        <span className="text-[9px] font-mono text-gray-600 tracking-[0.2em] uppercase">Scroll to Scan</span>
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-cinema-gold/50 to-transparent" />
      </motion.div>
    </div>
  );
};

export default Hero;
