import React from 'react';

const StatBlock = ({ label, value, unit, trend }: any) => (
    <div className="bg-sys-bg border border-sys-dim/50 p-4 flex flex-col justify-between group hover:border-sys-accent transition-colors relative overflow-hidden">
        {/* Corner tick */}
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-sys-dim group-hover:border-sys-accent" />

        <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-[10px] font-mono text-sys-dim uppercase tracking-wider">{label}</span>
            {trend && (
                <span className="text-[10px] font-mono text-sys-accent bg-sys-accent/10 px-1">{trend}</span>
            )}
        </div>
        <div className="flex items-baseline gap-1 relative z-10">
            <span className="text-3xl font-bold text-sys-text font-tech">{value}</span>
            <span className="text-xs font-mono text-sys-dim">{unit}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-sys-surface mt-4 overflow-hidden relative z-10">
            <div className="h-full bg-sys-dim group-hover:bg-sys-accent transition-colors" style={{ width: `${Math.random() * 60 + 40}%` }} />
        </div>
    </div>
);

export const OverviewModule: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto">
            {/* Status Indicators */}
            <div className="flex gap-4 mb-8 pb-4 border-b border-sys-border">
                {['CPU', 'MEM', 'NET', 'DISK', 'PWR'].map(sys => (
                    <div key={sys} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-sys-accent rounded-full animate-pulse" />
                        <span className="text-xs font-mono text-sys-dim">{sys}_OK</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatBlock label="Core Load" value="42.8" unit="%" trend="+2.4%" />
                <StatBlock label="Threads" value="1,024" unit="ACTV" trend="NOMINAL" />
                <StatBlock label="Bandwidth" value="84.2" unit="GB/s" trend="PEAK" />
                <StatBlock label="Uptime" value="842:12" unit="HRS" trend="" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Console Log Area */}
                <div className="col-span-2 border border-sys-dim/30 bg-black p-4 font-mono text-xs h-64 overflow-hidden relative">
                    <div className="absolute top-0 right-0 px-2 bg-sys-dim/20 text-sys-accent text-[10px] uppercase">Terminal_01</div>
                    <div className="flex flex-col gap-1 text-sys-dim opacity-90 h-full justify-end">
                        <span>[10:42:01] Loading core modules... <span className="text-sys-accent">COMPLETE</span></span>
                        <span>[10:42:02] Establishing neural handshake... <span className="text-sys-accent">OK</span></span>
                        <span>[10:42:05] Flow field simulation started.</span>
                        <span>[10:42:08] Listener active on port 8080.</span>
                        <span>[10:42:09] Decrypting incoming stream...</span>
                        <span>[10:42:10] <span className="text-white">User authentication verified. Level 5 Access granted.</span></span>
                        <span className="text-sys-accent animate-pulse">&gt;&gt; AWAITING_COMMAND_</span>
                    </div>
                </div>

                {/* Radar / Scanner Visual */}
                <div className="border border-sys-dim/30 bg-black p-4 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 dot-grid opacity-20" />

                    {/* Radar Sweep */}
                    <div className="relative w-40 h-40 border border-sys-dim rounded-full">
                        <div className="absolute inset-0 border border-sys-dim/30 rounded-full scale-50" />
                        <div className="absolute w-full h-full bg-gradient-to-r from-transparent via-sys-accent/20 to-transparent animate-spin-slow rounded-full opacity-50" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }} />

                        {/* Blips */}
                        <div className="absolute top-10 left-12 w-1 h-1 bg-sys-accent animate-ping" />
                        <div className="absolute bottom-8 right-10 w-1 h-1 bg-sys-accent animate-ping" style={{ animationDelay: '1s' }} />
                    </div>

                    <div className="absolute bottom-4 left-4 text-[10px] font-mono text-sys-accent">SCAN_RANGE: 50KM</div>
                </div>
            </div>
        </div>
    );
};