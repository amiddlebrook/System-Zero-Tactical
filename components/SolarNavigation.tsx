import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleID } from '../types';

interface CentralCommandProps {
  activeModule: ModuleID | null;
  onActivate: (id: ModuleID) => void;
  onReset: () => void;
}

export const CentralCommand: React.FC<CentralCommandProps> = ({ activeModule, onActivate, onReset }) => {
  const MotionDiv = motion.div as any;
  const MotionButton = motion.button as any;

  // Configuration for the 4 modules
  const modules = [
    { id: ModuleID.OVERVIEW, label: 'OVERVIEW', cx: '50%', cy: '10%' },
    { id: ModuleID.NETWORK, label: 'NETWORK', cx: '90%', cy: '50%' },
    { id: ModuleID.LOGIC, label: 'LOGIC', cx: '50%', cy: '90%' },
    { id: ModuleID.ANALYTICS, label: 'ANALYTICS', cx: '10%', cy: '50%' },
  ];

  return (
    <>
      {/* 
        THE ECLIPSE CORE
        Expands to frame the screen.
      */}
      <MotionDiv
        layoutId="system-core"
        className="fixed z-40 flex items-center justify-center overflow-hidden border border-sys-dim bg-sys-surface/90 backdrop-blur-md"
        initial={false}
        animate={{
            width: activeModule ? 'calc(100vw - 64px)' : '280px',
            height: activeModule ? 'calc(100vh - 64px)' : '280px',
            borderRadius: activeModule ? '4px' : '9999px',
            left: '50%',
            top: '50%',
            x: '-50%',
            y: '-50%',
            borderColor: activeModule ? '#333' : '#444',
            boxShadow: activeModule ? '0 0 0 1px #222' : '0 0 30px -10px rgba(255, 51, 0, 0.3)'
        }}
        transition={{ 
            type: "spring", 
            stiffness: 70, 
            damping: 25,
            mass: 1.2
        }}
      >
          {/* Internal Complex Geometry (Only visible in center mode) */}
          <AnimatePresence>
            {!activeModule && (
                <MotionDiv
                    initial={{ opacity: 0, rotate: -90 }} 
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    {/* Outer Ticks Ring */}
                    <div className="absolute w-[110%] h-[110%] rounded-full border border-sys-dim/20 flex items-center justify-center animate-spin-slow">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="absolute w-1 h-2 bg-sys-accent/50" style={{ top: 0, transform: `rotate(${i * 30}deg) translateY(-50%)`, transformOrigin: 'center 140px' }} />
                        ))}
                    </div>
                    
                    {/* Middle Dashed Ring */}
                    <div className="absolute w-[80%] h-[80%] border border-dashed border-sys-accent/30 rounded-full animate-spin-reverse-slow" />
                    
                    {/* Inner Tech Ring */}
                    <div className="absolute w-[60%] h-[60%] border-2 border-sys-dim rounded-full flex items-center justify-center">
                        <div className="absolute top-0 w-2 h-2 bg-sys-accent -translate-y-1/2" />
                        <div className="absolute bottom-0 w-2 h-2 bg-sys-accent translate-y-1/2" />
                        <div className="absolute left-0 w-2 h-2 bg-sys-accent -translate-x-1/2" />
                        <div className="absolute right-0 w-2 h-2 bg-sys-accent translate-x-1/2" />
                    </div>

                    {/* Core */}
                    <div className="w-20 h-20 bg-sys-surface border border-sys-accent rounded-full flex items-center justify-center relative shadow-glow z-10">
                         <div className="text-[10px] font-mono text-sys-accent animate-pulse">READY</div>
                    </div>
                </MotionDiv>
            )}
          </AnimatePresence>
      </MotionDiv>

      {/* 
        SATELLITE BUTTONS
        Orbital layout connected by lines
      */}
      {!activeModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="relative w-[700px] h-[700px] pointer-events-auto">
                {modules.map((mod) => (
                    <React.Fragment key={mod.id}>
                        {/* Orbital Line */}
                        <div className="absolute bg-sys-dim/30"
                             style={{
                                top: '50%', left: '50%',
                                width: '220px', height: '1px',
                                transformOrigin: 'left center',
                                transform: `rotate(${
                                    mod.id === ModuleID.NETWORK ? 180 : 
                                    mod.id === ModuleID.ANALYTICS ? 0 : 
                                    mod.id === ModuleID.OVERVIEW ? 270 : 90
                                }deg) translateX(120px)`, // Start outside the core ring
                                zIndex: -1
                             }}
                        />

                        {/* Button */}
                        <MotionButton
                            className="absolute w-40 h-14 flex items-center justify-center group overflow-hidden"
                            style={{ 
                                left: mod.cx, 
                                top: mod.cy, 
                                x: '-50%', 
                                y: '-50%' 
                            }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => onActivate(mod.id)}
                        >
                            <div className="absolute inset-0 bg-sys-surface/90 border border-sys-dim group-hover:border-sys-accent transition-colors clip-path-polygon" />
                            
                            {/* Hover Fill Effect */}
                            <div className="absolute inset-0 bg-sys-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-10" />

                            <div className="relative z-10 flex flex-col items-center">
                                 <span className="text-sm font-bold tracking-widest text-sys-text group-hover:text-sys-accent transition-colors font-tech uppercase">
                                    {mod.label}
                                 </span>
                                 <div className="h-[2px] w-0 group-hover:w-full bg-sys-accent transition-all duration-300 mt-1" />
                            </div>
                        </MotionButton>
                    </React.Fragment>
                ))}
            </div>
        </div>
      )}
    </>
  );
};