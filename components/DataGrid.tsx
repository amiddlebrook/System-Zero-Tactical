import React from 'react';
import { motion } from 'framer-motion';

const NODES = Array.from({ length: 48 }).map((_, i) => ({
    id: `N-${i.toString().padStart(3, '0')}`,
    status: Math.random() > 0.9 ? 'warn' : 'ok',
    load: Math.floor(Math.random() * 100)
}));

export const NetworkModule: React.FC = () => {
  const MotionDiv = motion.div as any;
  
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="flex justify-between items-end mb-6 border-b border-sys-border pb-4">
            <div>
                <h3 className="text-xl font-bold text-sys-text font-tech uppercase">Cluster Topology</h3>
                <p className="text-xs text-sys-dim font-mono tracking-widest">SECTOR_7 // NODE_MAP</p>
            </div>
            <div className="flex gap-4">
                 <div className="flex items-center gap-2 border border-sys-dim/50 px-3 py-1 bg-sys-surface">
                    <div className="w-1.5 h-1.5 bg-sys-accent animate-pulse" />
                    <span className="text-[10px] font-mono text-sys-text">LIVE</span>
                 </div>
            </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {NODES.map((node, i) => (
                    <MotionDiv
                        key={node.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className={`
                            relative aspect-square border p-2 flex flex-col justify-between group
                            ${node.status === 'warn' ? 'border-sys-accent/50 bg-sys-accent/5' : 'border-sys-dim/30 bg-sys-surface hover:border-sys-dim'}
                        `}
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-[9px] font-mono text-sys-dim">{node.id}</span>
                            <div className={`w-1 h-1 ${node.status === 'warn' ? 'bg-sys-accent animate-pulse' : 'bg-sys-dim'}`} />
                        </div>
                        
                        {/* Load Bar */}
                        <div className="w-full">
                            <div className="flex justify-between text-[8px] font-mono text-sys-dim mb-1">
                                <span>LOAD</span>
                                <span>{node.load}%</span>
                            </div>
                            <div className="w-full h-0.5 bg-sys-bg">
                                <div 
                                    className={`h-full ${node.status === 'warn' ? 'bg-sys-accent' : 'bg-sys-dim'}`} 
                                    style={{ width: `${node.load}%` }} 
                                />
                            </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-sys-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-sys-accent/50" />
                    </MotionDiv>
                ))}
            </div>
        </div>
    </div>
  );
};