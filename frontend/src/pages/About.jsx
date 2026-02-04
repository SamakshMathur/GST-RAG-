import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-sentinel-dark text-gray-300">
      {/* Header */}
      <div className="bg-gradient-to-b from-sentinel-blue/20 to-transparent py-20 px-4 sm:px-6 lg:px-8 text-center text-white border-b border-white/5">
        <motion.h1 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-4xl font-bold font-sans mb-4"
        >
          About Sentinel.AI
        </motion.h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
          Advancing statutory intelligence through precision engineering and artificial intelligence.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="prose prose-lg prose-invert text-gray-400 mx-auto">
           <p className="mb-6 leading-relaxed">
             Sentinel.AI is a premier platform designed for GST professionals, tax consultants, and legal experts. 
             We bridge the gap between complex statutory frameworks and actionable intelligence using advanced Large Language Models (LLMs).
           </p>
           
           <h3 className="font-bold text-white text-xl mb-3 font-sans">Our Mission</h3>
           <p className="mb-6 leading-relaxed">
             To democratize access to high-level legal reasoning and statutory interpretation, ensuring compliance and minimizing litigation risks for businesses across India.
           </p>

           <h3 className="font-bold text-white text-xl mb-3 font-sans">Core Technology</h3>
           <p className="leading-relaxed">
             Powered by <strong className="text-sentinel-green">LETA (Legal Enterprise Text Agent)</strong>, our specific model trained on thousands of case laws, circulars, and notifications to provide context-aware answers with high confidence.
           </p>
        </div>
      </div>
    </div>
  );
};

export default About;
