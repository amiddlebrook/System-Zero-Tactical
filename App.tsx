import React, { useState, useEffect, useRef } from 'react';
import { LayoutGroup } from 'framer-motion';
import { ModuleID } from './types';
import { CentralCommand } from './components/SolarNavigation';
import { SystemFrame } from './components/ui/Card';

// Modules
import { OverviewModule } from './components/Dashboard';
import { NetworkModule } from './components/DataGrid';
import { LogicModule } from './components/ProcessFlow';
import { AnalyticsModule } from './components/ControlPanel';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleID | null>(null);
  const [time, setTime] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => {
        setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Circuit Grid Background Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Grid Configuration
    const gridSize = 60;
    const perspective = 300;
    const horizon = height * 0.4; // Horizon line height
    
    // Pulses traveling along the grid
    let pulses: { x: number; z: number; speed: number; axis: 'x' | 'z' }[] = [];

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    const spawnPulse = () => {
        if (Math.random() > 0.95) {
             const axis = Math.random() > 0.5 ? 'x' : 'z';
             pulses.push({
                 x: Math.floor(Math.random() * 40) - 20, // grid units relative to center
                 z: 20, // start far back
                 speed: 0.2 + Math.random() * 0.3,
                 axis
             });
        }
    };

    const project = (x: number, z: number) => {
        const scale = perspective / (perspective + z * gridSize);
        const px = width / 2 + x * gridSize * scale;
        const py = horizon + (z * gridSize + 200) * scale * 0.5; // Artificial floor tilt
        return { x: px, y: py, scale };
    };

    const drawGrid = () => {
        ctx.strokeStyle = 'rgba(255, 51, 0, 0.08)';
        ctx.lineWidth = 1;

        // Vertical lines (Z-axis)
        for (let x = -20; x <= 20; x++) {
            ctx.beginPath();
            const start = project(x, 0);
            const end = project(x, 40);
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }

        // Horizontal lines (X-axis)
        for (let z = 0; z <= 40; z++) {
            ctx.beginPath();
            const start = project(-20, z);
            const end = project(20, z);
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    };

    const animate = () => {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);
        
        drawGrid();
        spawnPulse();

        // Draw Pulses
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FF3300';
        ctx.fillStyle = '#FF3300';

        pulses = pulses.filter(p => p.z > 0 && p.z < 40);
        pulses.forEach(p => {
            p.z -= p.speed; // Move towards viewer
            
            const pos = project(p.x, p.z);
            const nextPos = project(p.x, p.z - 0.5); // Tail
            
            if (p.axis === 'z') {
                 // Pulse along Z line
                 ctx.beginPath();
                 ctx.moveTo(pos.x, pos.y);
                 ctx.lineTo(nextPos.x, nextPos.y);
                 ctx.strokeStyle = `rgba(255, 51, 0, ${Math.min(1, (40 - p.z) / 10)})`;
                 ctx.lineWidth = 3 * pos.scale;
                 ctx.stroke();
            } else {
                // Pulse along X line (cross)
                 const left = project(p.x - 0.5, p.z);
                 const right = project(p.x + 0.5, p.z);
                 ctx.beginPath();
                 ctx.moveTo(left.x, left.y);
                 ctx.lineTo(right.x, right.y);
                 ctx.strokeStyle = `rgba(255, 51, 0, ${Math.min(1, (40 - p.z) / 10)})`;
                 ctx.lineWidth = 2 * pos.scale;
                 ctx.stroke();
            }
        });
        ctx.shadowBlur = 0;

        animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-sys-bg text-sys-text relative overflow-hidden selection:bg-sys-accent selection:text-black">
      {/* Background Layers */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
      <div className="noise-overlay" />
      <div className="vignette" />
      <div className="scanline-overlay" />
      
      {/* 
        TACTICAL VISOR HUD 
        SVG overlay framing the screen
      */}
      <svg className="fixed inset-0 z-50 pointer-events-none w-full h-full opacity-60">
        <defs>
            <pattern id="ruler" x="0" y="0" width="10" height="40" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="10" y2="0" stroke="#333" strokeWidth="1" />
                <line x1="0" y1="10" x2="5" y2="10" stroke="#333" strokeWidth="1" />
                <line x1="0" y1="20" x2="5" y2="20" stroke="#333" strokeWidth="1" />
                <line x1="0" y1="30" x2="5" y2="30" stroke="#333" strokeWidth="1" />
            </pattern>
        </defs>
        
        {/* Top Left Bracket */}
        <path d="M 40 100 V 40 H 100" stroke="#FF3300" strokeWidth="2" fill="none" />
        <rect x="36" y="36" width="8" height="8" fill="#FF3300" />
        
        {/* Top Right Bracket */}
        <path d="M calc(100% - 100px) 40 H calc(100% - 40px) V 100" stroke="#FF3300" strokeWidth="2" fill="none" />
        <rect x="calc(100% - 44px)" y="36" width="8" height="8" fill="#FF3300" />
        
        {/* Bottom Left Bracket */}
        <path d="M 40 calc(100% - 100px) V calc(100% - 40px) H 100" stroke="#FF3300" strokeWidth="2" fill="none" />
        <rect x="36" y="calc(100% - 44px)" width="8" height="8" fill="#FF3300" />

        {/* Bottom Right Bracket */}
        <path d="M calc(100% - 100px) calc(100% - 40px) H calc(100% - 40px) V calc(100% - 100px)" stroke="#FF3300" strokeWidth="2" fill="none" />
        <rect x="calc(100% - 44px)" y="calc(100% - 44px)" width="8" height="8" fill="#FF3300" />

        {/* Side Rulers */}
        <rect x="0" y="20%" width="10" height="60%" fill="url(#ruler)" opacity="0.5" />
        <rect x="calc(100% - 10px)" y="20%" width="10" height="60%" fill="url(#ruler)" opacity="0.5" />
      </svg>

      {/* Live Telemetry Corners */}
      <div className="fixed top-8 left-12 z-50 font-tech uppercase tracking-widest text-sys-accent text-sm pointer-events-none">
          SYS_ZERO // TACTICAL
          <div className="text-[10px] text-sys-dim font-mono mt-1">SECURE_CONNECTION_ESTABLISHED</div>
      </div>
      
      <div className="fixed top-8 right-12 z-50 text-right pointer-events-none">
          <div className="font-tech text-2xl font-bold text-sys-text">{time}</div>
          <div className="text-[10px] font-mono text-sys-accent">ZULU_TIME</div>
      </div>

      <div className="fixed bottom-8 left-12 z-50 font-mono text-[10px] text-sys-dim pointer-events-none">
          COORDS: 34.0522° N, 118.2437° W <br/>
          GRID_REF: A-729
      </div>

      <div className="fixed bottom-8 right-12 z-50 pointer-events-none flex items-center gap-4">
          <div className="text-right">
              <div className="text-[10px] font-mono text-sys-dim">NETWORK</div>
              <div className="text-sys-accent font-bold font-mono">100%</div>
          </div>
          <div className="w-16 h-8 border border-sys-dim/30 bg-sys-dim/10 relative overflow-hidden">
               <div className="absolute bottom-0 left-0 w-full bg-sys-accent opacity-50 animate-pulse" style={{ height: '70%' }} />
               <div className="absolute bottom-0 left-0 w-full h-[1px] bg-sys-accent" style={{ bottom: '70%' }} />
          </div>
      </div>


      <LayoutGroup>
        {/* Navigation Core */}
        <CentralCommand 
            activeModule={activeModule} 
            onActivate={setActiveModule} 
            onReset={() => setActiveModule(null)} 
        />

        {/* Content Container (Expanded View) */}
        <div className={`
            fixed inset-0 z-40 flex items-center justify-center pointer-events-none
        `}>
            <div className={`
                w-[calc(100vw-96px)] h-[calc(100vh-96px)] pointer-events-auto
                ${activeModule ? 'opacity-100 transition-opacity duration-500 delay-300' : 'opacity-0 pointer-events-none'}
            `}>
                {activeModule === ModuleID.OVERVIEW && (
                    <SystemFrame title="Overview" isActive={activeModule === ModuleID.OVERVIEW} onClose={() => setActiveModule(null)}>
                        <OverviewModule />
                    </SystemFrame>
                )}
                {activeModule === ModuleID.NETWORK && (
                    <SystemFrame title="Network Topology" isActive={activeModule === ModuleID.NETWORK} onClose={() => setActiveModule(null)}>
                        <NetworkModule />
                    </SystemFrame>
                )}
                {activeModule === ModuleID.LOGIC && (
                    <SystemFrame title="Logic Flow" isActive={activeModule === ModuleID.LOGIC} onClose={() => setActiveModule(null)}>
                        <LogicModule />
                    </SystemFrame>
                )}
                {activeModule === ModuleID.ANALYTICS && (
                    <SystemFrame title="Metric Analytics" isActive={activeModule === ModuleID.ANALYTICS} onClose={() => setActiveModule(null)}>
                        <AnalyticsModule />
                    </SystemFrame>
                )}
            </div>
        </div>
      </LayoutGroup>
    </div>
  );
};

export default App;