import React from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const DATA = Array.from({ length: 60 }).map((_, i) => ({
    idx: i,
    val: 50 + Math.sin(i * 0.2) * 30 + Math.random() * 15
}));

export const AnalyticsModule: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
        {/* Main Chart */}
        <div className="flex-1 border border-sys-dim/50 bg-black/50 p-1 relative">
            <div className="absolute inset-0 border-2 border-sys-border pointer-events-none z-10" />
            
            {/* Chart Header */}
            <div className="absolute top-2 left-4 z-20 flex gap-4">
                 <div className="text-[10px] font-mono text-sys-accent bg-sys-accent/10 px-2">LIVE_WAVEFORM</div>
                 <div className="text-[10px] font-mono text-sys-dim">CH_01</div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DATA} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF3300" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#FF3300" stopOpacity={0}/>
                        </linearGradient>
                        <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#222" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <CartesianGrid stroke="#222" strokeDasharray="3 3" vertical={false} />
                    <XAxis hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#050505', border: '1px solid #444', color: '#eee' }}
                        itemStyle={{ fontFamily: 'monospace', fontSize: '11px', color: '#FF3300' }}
                        cursor={{ stroke: '#FF3300', strokeWidth: 1 }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="val" 
                        stroke="#FF3300" 
                        strokeWidth={2}
                        fill="url(#colorVal)" 
                        animationDuration={2000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>

        {/* Secondary Metrics */}
        <div className="h-32 grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
                 { label: 'THROUGHPUT', val: '1.2', unit: 'TB/s' },
                 { label: 'LATENCY', val: '4', unit: 'ms' },
                 { label: 'PACKET_LOSS', val: '0.001', unit: '%' },
                 { label: 'JITTER', val: '12', unit: 'ms' }
             ].map((m, i) => (
                 <div key={i} className="border border-sys-dim/30 bg-sys-surface p-4 flex flex-col justify-center">
                     <div className="text-[10px] font-mono text-sys-dim mb-1 tracking-widest">{m.label}</div>
                     <div className="text-2xl font-tech font-bold text-sys-text">{m.val}<span className="text-xs text-sys-dim ml-1">{m.unit}</span></div>
                 </div>
             ))}
        </div>
    </div>
  );
};