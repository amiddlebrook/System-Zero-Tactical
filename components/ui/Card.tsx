import React from 'react';
import { motion } from 'framer-motion';

interface SystemFrameProps {
  children: React.ReactNode;
  title: string;
  isActive: boolean;
  onClose?: () => void;
}

export const SystemFrame: React.FC<SystemFrameProps> = ({ children, title, isActive, onClose }) => {
  const MotionDiv = motion.div as any;
  const MotionButton = motion.button as any;

  if (!isActive) return null;

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      className="w-full h-full flex flex-col relative bg-sys-surface border border-sys-dim shadow-depth group"
    >
      {/* Corner Brackets (Industrial/Tactical) */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-sys-accent z-30" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-sys-accent z-30" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-sys-accent z-30" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-sys-accent z-30" />

      {/* Holographic Beam Projection Effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-sys-accent shadow-beam z-20 opacity-50" />

      {/* Header */}
      <div className="relative z-10 h-16 flex items-center justify-between px-8 border-b border-sys-border bg-sys-bg/90 backdrop-blur-sm">
        <div className="flex items-center gap-4">
            <div className="w-1 h-6 bg-sys-accent" />
            <div>
                <h1 className="text-xl font-bold uppercase tracking-widest text-sys-text font-tech leading-none">
                    {title}
                </h1>
                <div className="text-[10px] text-sys-dim font-mono tracking-[0.2em] uppercase">Sector // Active</div>
            </div>
        </div>
        
        {/* Header Decor */}
        <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-1 opacity-50">
               {/* Decorative ticks */}
                {[...Array(8)].map((_, i) => (
                    <div key={i} className={`w-[2px] h-2 ${i % 2 === 0 ? 'bg-sys-accent' : 'bg-sys-dim'}`} />
                ))}
            </div>
            {onClose && (
                <MotionButton
                    whileHover={{ scale: 1.05, backgroundColor: '#FF3300', color: '#000', borderColor: '#FF3300' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="h-8 px-6 border border-sys-dim text-xs font-mono text-sys-accent uppercase flex items-center transition-all bg-sys-bg hover:bg-sys-accent hover:text-black"
                >
                    [ DISENGAGE ]
                </MotionButton>
            )}
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 relative overflow-hidden bg-sys-bg">
         {/* Background Grid */}
        <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-sys-bg/80 pointer-events-none" />
        
        <div className="relative z-10 h-full overflow-auto custom-scrollbar p-8">
            {children}
        </div>
      </div>

      {/* Footer Info */}
      <div className="h-8 border-t border-sys-border bg-sys-surface flex items-center justify-between px-8">
          <div className="flex gap-4 text-[10px] font-mono text-sys-dim uppercase">
              <span>MEM_USAGE: 32%</span>
              <span>TEMP: 54C</span>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-mono text-sys-accent animate-pulse">TRANSMITTING</span>
             <div className="flex gap-0.5">
                 <div className="w-1 h-3 bg-sys-accent opacity-100" />
                 <div className="w-1 h-3 bg-sys-accent opacity-80" />
                 <div className="w-1 h-3 bg-sys-accent opacity-40" />
                 <div className="w-1 h-3 bg-sys-accent opacity-20" />
             </div>
          </div>
      </div>
    </MotionDiv>
  );
};