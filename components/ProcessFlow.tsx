import React from 'react';
import { motion } from 'framer-motion';

// Dendritic Tree Data
const TREE = [
    { id: 1, label: 'KERNEL_ROOT', x: 50, y: 10, children: [2, 3] },
    { id: 2, label: 'SECURE_AUTH', x: 25, y: 35, children: [4, 5] },
    { id: 3, label: 'DATA_STREAM', x: 75, y: 35, children: [6] },
    { id: 4, label: 'TOKEN_GEN', x: 15, y: 65, children: [] },
    { id: 5, label: 'SESSION_VAL', x: 35, y: 65, children: [] },
    { id: 6, label: 'QUERY_PROC', x: 75, y: 65, children: [7, 8] },
    { id: 7, label: 'CACHE_WRT', x: 65, y: 90, children: [] },
    { id: 8, label: 'DB_COMMIT', x: 85, y: 90, children: [] },
];

export const LogicModule: React.FC = () => {
    const MotionDiv = motion.div as any;

  return (
    <div className="h-full w-full relative flex items-center justify-center min-h-[500px]">
        {/* Background Circuit Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
                 backgroundImage: 'linear-gradient(rgba(255, 51, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 51, 0, 0.1) 1px, transparent 1px)', 
                 backgroundSize: '40px 40px' 
             }} 
        />

        {/* SVG Layer for Circuit Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {TREE.map(node => (
                node.children.map(childId => {
                    const child = TREE.find(n => n.id === childId);
                    if (!child) return null;
                    return (
                        <g key={`${node.id}-${child.id}`}>
                            {/* Circuit Line */}
                            <motion.path
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                d={`M ${node.x}% ${node.y + 4}% V ${node.y + 15}% H ${child.x}% V ${child.y - 2}%`}
                                fill="none"
                                stroke="#333"
                                strokeWidth="2"
                            />
                            {/* Animated Pulse Packet */}
                            <motion.circle r="2" fill="#FF3300">
                                <animateMotion 
                                    dur="2s" 
                                    repeatCount="indefinite"
                                    path={`M ${node.x}% ${node.y + 4}% V ${node.y + 15}% H ${child.x}% V ${child.y - 2}%`}
                                />
                            </motion.circle>
                        </g>
                    );
                })
            ))}
        </svg>

        {/* Node Layer */}
        {TREE.map((node, i) => (
            <MotionDiv
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
                <div className="bg-sys-bg border border-sys-dim px-4 py-3 flex items-center gap-3 shadow-lg hover:border-sys-accent transition-colors cursor-pointer group z-10 relative">
                    <div className="w-2 h-2 bg-sys-dim group-hover:bg-sys-accent group-hover:shadow-[0_0_10px_#FF3300]" />
                    <div>
                        <div className="text-[10px] font-mono text-sys-dim leading-none mb-1">OP_CODE_{node.id}</div>
                        <span className="text-xs font-bold text-sys-text font-tech tracking-wider">{node.label}</span>
                    </div>
                </div>
            </MotionDiv>
        ))}
    </div>
  );
};