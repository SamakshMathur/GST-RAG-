import React from 'react';
import Hero from '../components/Hero';
import { ArrowRight, ShieldCheck, Scale, FileJson } from 'lucide-react';
import StatutoryHero3D from '../components/StatutoryHero3D';
import StatutoryDomains from '../components/StatutoryDomains';
import LetaIntro from '../components/LetaIntro';
import PromoCards from '../components/PromoCards';
import VideoSection from '../components/VideoSection';
import DynamicBackground from '../components/DynamicBackground';
import HowItWorks from '../components/HowItWorks';
import SecuritySection from '../components/SecuritySection';

const Home = () => {
  return (
    <div className="relative">
      <DynamicBackground />
      <Hero />
      <LetaIntro />
      <HowItWorks />
      <StatutoryDomains />
      <SecuritySection />
      <PromoCards />
      <VideoSection />
    </div>
  );
};

export default Home;
