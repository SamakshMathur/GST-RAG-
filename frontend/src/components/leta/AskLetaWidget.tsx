import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Scale } from 'lucide-react';

interface AskLetaWidgetProps {
  domain?: string;
  contextDesc?: string;
}

const AskLetaWidget: React.FC<AskLetaWidgetProps> = ({ domain = 'gst', contextDesc = 'GST scenarios' }) => {
  // LetaWorkspace auto-restores whatever session was last active for this
  // domain (sessionStorage `leta_active_session_<domainId>`) — the right
  // default when returning to an in-progress chat, but wrong for this card:
  // arriving from the advisory info page should always start a fresh
  // consultation, not resume whatever the user was last looking at. Clearing
  // the key right before navigating is enough — LetaWorkspace has no other
  // fallback that picks a session automatically, so with nothing to restore
  // it just starts empty.
  const handleLaunchClick = () => {
    try {
      sessionStorage.removeItem(`leta_active_session_${domain}`);
    } catch {
      // sessionStorage unavailable (private browsing, etc.) — navigation
      // still proceeds; worst case the old session restores as before.
    }
  };

  return (
    <Link to={`/${domain}/leta`} className="block" onClick={handleLaunchClick}>
      <motion.div
        className="group relative rounded-leta p-8 overflow-hidden cursor-pointer transition-all duration-300 bg-[#151922] border border-white/[0.06] shadow-2xl h-full flex flex-col justify-between"
        whileHover={{
          borderColor: 'rgba(103, 232, 249, 0.4)',
          boxShadow: '0 0 35px rgba(103, 232, 249, 0.15)',
        }}
      >
        {/* Top-left subtle glowing bar */}
        <div 
          className="absolute top-0 left-0 w-[3px] h-[60px]" 
          style={{ background: 'linear-gradient(180deg, #67E8F9, transparent)' }} 
        />

        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="p-2.5 rounded-xl bg-[#67E8F9]/5 border border-[#67E8F9]/10 text-[#67E8F9]">
              <Scale size={20} />
            </div>
            <ChevronRight size={16} className="text-[#6B7280] group-hover:translate-x-1.5 transition-transform duration-300" />
          </div>

          <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide font-display">
            Start LETA TEC Consultation
          </h3>
          <p className="text-xs font-mono text-[#67E8F9] uppercase tracking-widest font-semibold">
            {domain.toUpperCase()} ADVISORY WORKSPACE
          </p>
          <p className="text-sm font-light leading-relaxed text-[#A1AAB8] mt-4">
            Start structured case consultations, clarify compliance queries, and draft custom legal notice replies within a unified, professional workspace.
          </p>
        </div>

        <div className="mt-8">
          <button
            className="w-full py-3.5 text-xs font-mono font-bold uppercase tracking-[0.2em] rounded-leta transition-all duration-200"
            style={{
              background: 'rgba(103,232,249,0.04)',
              border: '1px solid rgba(103,232,249,0.15)',
              color: '#67E8F9',
            }}
          >
            Enter Workspace
          </button>
        </div>
      </motion.div>
    </Link>
  );
};

export default AskLetaWidget;
