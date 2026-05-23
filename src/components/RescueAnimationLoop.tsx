import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldAlert, 
  Activity, 
  CheckCircle, 
  MapPin, 
  Radio, 
  Truck, 
  Wrench,
  Sparkles, 
  Clock, 
  Play, 
  Pause 
} from "lucide-react";

export enum RescueScenePhase {
  Incident = "INCIDENT",
  SOSSignal = "SOS_SIGNAL",
  Rescue = "RESCUE_IN_ROUTE",
  Save = "THE_SAVE"
}

interface PhaseDetail {
  id: RescueScenePhase;
  label: string;
  title: string;
  description: string;
  milestoneText: string;
  targetPercentStart: number;
  targetPercentEnd: number;
  timeStart: number; // in milliseconds (0 to 15000)
  timeEnd: number;
  colorClass: string;
  icon: React.ReactNode;
}

export default function RescueAnimationLoop() {
  const [elapsed, setElapsed] = useState(0); // 0 to 15000 ms
  const [isPlaying, setIsPlaying] = useState(true);
  const [activePhase, setActivePhase] = useState<RescueScenePhase>(RescueScenePhase.Incident);
  
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  // 15 seconds total timing cycle
  const CYCLE_DURATION = 15000;

  const PHASES: PhaseDetail[] = [
    {
      id: RescueScenePhase.Incident,
      label: "Phase 1",
      title: "1. The Incident & Breakdown",
      description: "A premium sedan and commercial truck collide on the highway. Hazard indicators click, headlights flicker, and realistic engine smoke emerges.",
      milestoneText: "Incident Detected... Geolocation Locked.",
      targetPercentStart: 0,
      targetPercentEnd: 25,
      timeStart: 0,
      timeEnd: 4000,
      colorClass: "from-red-600 to-rose-500",
      icon: <ShieldAlert className="h-4 w-4 text-rose-500" />
    },
    {
      id: RescueScenePhase.SOSSignal,
      label: "Phase 2",
      title: "2. The Digital SOS Relay",
      description: "Atmosphere dims as a glowing crimson cellular radar waves launch straight to the Mupenzi Headquarters cloud matrix.",
      milestoneText: "Transmitting Data to Nearest Mupenzi Hub...",
      targetPercentStart: 25,
      targetPercentEnd: 50,
      timeStart: 4000,
      timeEnd: 6000,
      colorClass: "from-amber-500 to-orange-500",
      icon: <Radio className="h-4 w-4 text-amber-500" />
    },
    {
      id: RescueScenePhase.Rescue,
      label: "Phase 3",
      title: "3. Expert Team Dispatch",
      description: "Adorned with high-visibility Mupenzi decaling & rotating emergency beacons, heavy flatbeds and mechanic vans rush onto the scene.",
      milestoneText: "Expert Rescuers Dispatched & En Route...",
      targetPercentStart: 50,
      targetPercentEnd: 85,
      timeStart: 6000,
      timeEnd: 11000,
      colorClass: "from-yellow-500 to-amber-500",
      icon: <Truck className="h-4 w-4 text-yellow-500" />
    },
    {
      id: RescueScenePhase.Save,
      label: "Phase 4",
      title: "4. Rescue Recovery & Reset",
      description: "The Mupenzi specialists hook the chassis and clean the highway. Vehicles exit left; the road is restored immediately for the next cycle.",
      milestoneText: "Scene Secured — Highway Restored.",
      targetPercentStart: 85,
      targetPercentEnd: 100,
      timeStart: 11000,
      timeEnd: CYCLE_DURATION,
      colorClass: "from-emerald-500 to-teal-400",
      icon: <CheckCircle className="h-4 w-4 text-emerald-400" />
    }
  ];

  useEffect(() => {
    if (!isPlaying) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      return;
    }

    const animate = (time: number) => {
      if (previousTimeRef.current !== null) {
        const deltaTime = time - previousTimeRef.current;
        setElapsed((prev) => {
          const next = prev + deltaTime;
          return next >= CYCLE_DURATION ? 0 : next;
        });
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    previousTimeRef.current = null;
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying]);

  // Sync active phase state & milestones based on elapsed ms
  useEffect(() => {
    const current = PHASES.find(p => elapsed >= p.timeStart && elapsed < p.timeEnd);
    if (current && current.id !== activePhase) {
      setActivePhase(current.id);
    }
  }, [elapsed, activePhase]);

  // Calculate synchronized live percentage and current milestones
  const activePhaseDetail = PHASES.find(p => elapsed >= p.timeStart && elapsed < p.timeEnd) || PHASES[0];
  const phaseElapsed = elapsed - activePhaseDetail.timeStart;
  const phaseDuration = activePhaseDetail.timeEnd - activePhaseDetail.timeStart;
  const phaseRatio = Math.min(1, Math.max(0, phaseElapsed / phaseDuration));
  
  // Interpolated progress percentage
  const liveProgressPercent = Math.round(
    activePhaseDetail.targetPercentStart + 
    (activePhaseDetail.targetPercentEnd - activePhaseDetail.targetPercentStart) * phaseRatio
  );

  // Easing function for vehicle deceleration/bounce
  const easeOutCubic = (x: number): number => {
    return 1 - Math.pow(1 - x, 3);
  };

  const calculateTelemetry = () => {
    const t = elapsed;
    
    // Detailed environmental elements
    let sedan = { x: 130, y: 175, rotate: 0, opacity: 1, hazard: false, headlights: true, smokeAlpha: 0 };
    let cargoTruck = { x: 235, y: 135, opacity: 1, hazard: false, headlights: true };
    let shockwaveScale = 0;
    let shockwaveOpacity = 0;
    let environmentDim = 0;
    
    let signalPulse = { active: false, x: 130, y: 175, r: 0, opacity: 0 };
    let dispatchHQPower = { active: false, size: 0, successText: false };
    
    // Rescue responders
    let towTruck = { x: 490, y: 132, responseBeacon: false };
    let serviceVan = { x: 550, y: 142, responseBeacon: false };
    
    // Realistic character mechanics in 3D safety outfit (orange with silver reflective stripe)
    let mechanicLeft = { active: false, x: 280, y: 170, walking: false, working: false };
    let mechanicRight = { active: false, x: 335, y: 165, walking: false, working: false };
    let armWinchAngle = 0;
    let highwayClearWipe = false;

    // Phase 1: Crash & Breakdown (0 - 4000 ms)
    if (t >= 0 && t < 4000) {
      if (t < 1800) {
        // Smooth road travel deceleration
        const ratio = t / 1800;
        sedan.x = -80 + (130 - (-80)) * ratio;
        cargoTruck.x = 480 - (480 - 235) * ratio;
        sedan.hazard = false;
        cargoTruck.hazard = false;
        sedan.headlights = true;
        cargoTruck.headlights = true;
      } else {
        // Crash dynamic event (1800 to 4000ms)
        sedan.x = 130;
        cargoTruck.x = 235;
        // Flickering headlamps during initial impact, then static hazard lights
        if (t < 2300) {
          sedan.headlights = Math.floor(t / 80) % 2 === 0;
          cargoTruck.headlights = Math.floor(t / 80) % 2 === 0;
        } else {
          sedan.headlights = false;
          cargoTruck.headlights = false;
        }
        
        sedan.hazard = Math.floor(t / 200) % 2 === 0;
        cargoTruck.hazard = Math.floor(t / 200) % 2 === 0;

        // Realistic rising engine steam smoke
        const smokeP = (t - 1800) / 2200;
        sedan.smokeAlpha = Math.min(0.7, smokeP * 0.9);

        // Volumetric impact wave 
        if (t >= 1800 && t < 2600) {
          const pt = (t - 1800) / 800;
          shockwaveOpacity = pt < 0.3 ? 0.95 : Math.max(0, 0.95 - (pt - 0.3) * 1.5);
          shockwaveScale = pt < 0.3 ? pt * 3.3 : 1.2;
        }
      }
    }

    // Phase 2: SOS Relay Telemetry (4000 - 6000 ms)
    else if (t >= 4000 && t < 6000) {
      sedan.x = 130;
      cargoTruck.x = 235;
      sedan.hazard = Math.floor(t / 180) % 2 === 0;
      cargoTruck.hazard = Math.floor(t / 180) % 2 === 0;
      sedan.smokeAlpha = 0.7;

      // Darken road dynamically to focus on the SOS glowing telemetry
      environmentDim = 0.65;

      // Volumetric amber data beam transmission
      if (t >= 4200 && t < 5700) {
        const ratio = (t - 4200) / 1500;
        signalPulse.active = true;
        signalPulse.x = 135 + (325 - 135) * ratio;
        signalPulse.y = 175 - (175 - 55) * ratio;
        signalPulse.r = 6 + 32 * ratio;
        signalPulse.opacity = Math.max(0, 1 - ratio);
      }

      // HQ database console receives telemetry
      if (t >= 5500) {
        dispatchHQPower.active = true;
        dispatchHQPower.size = 20;
        dispatchHQPower.successText = true;
      }
    }

    // Phase 3: Expert Rescuers Deployment (6000 - 11000 ms)
    else if (t >= 6000 && t < 11000) {
      sedan.x = 130;
      cargoTruck.x = 235;
      sedan.hazard = Math.floor(t / 200) % 2 === 0;
      cargoTruck.hazard = Math.floor(t / 200) % 2 === 0;
      sedan.smokeAlpha = 0.8;

      const phaseLocal = t - 6000;

      // Heavy flatbed emergency tow truck races in (6200 to 8200)
      if (t >= 6200 && t < 8200) {
        const ratio = easeOutCubic((t - 6200) / 2000);
        towTruck.x = 490 - (490 - 295) * ratio;
        towTruck.responseBeacon = true;
      } else if (t >= 8200) {
        towTruck.x = 295;
        towTruck.responseBeacon = Math.floor(t / 120) % 2 === 0;
      }

      // Rapid mechanical care service van races in (6400 to 8400)
      if (t >= 6400 && t < 8400) {
        const ratio = easeOutCubic((t - 6400) / 2000);
        serviceVan.x = 550 - (550 - 365) * ratio;
        serviceVan.responseBeacon = true;
      } else if (t >= 8400) {
        serviceVan.x = 365;
        serviceVan.responseBeacon = Math.floor(t / 120) % 2 === 0;
      }

      // Specialist mechanics emerge from support van with toolboxes (8500 to 11000)
      if (t >= 8500) {
        mechanicLeft.active = true;
        mechanicRight.active = true;
        
        // Walking transition to service zones
        if (t < 9800) {
          const mRatio = (t - 8500) / 1300;
          mechanicLeft.x = 365 - 50 * mRatio; 
          mechanicLeft.walking = true;
          mechanicRight.x = 365 - 15 * mRatio;
          mechanicRight.walking = true;
        } else {
          mechanicLeft.x = 315;
          mechanicLeft.working = true;
          mechanicRight.x = 350;
          mechanicRight.working = true;
        }
      }
    }

    // Phase 4: Recovery winch & Smooth Exit Route (11000 - 15000 ms)
    else if (t >= 11000 && t < 15000) {
      // Keep safety specialists active and busy in the first half
      if (t < 13200) {
        towTruck.x = 295;
        serviceVan.x = 365;
        cargoTruck.x = 235;
        towTruck.responseBeacon = true;
        serviceVan.responseBeacon = true;
        
        mechanicLeft.active = true;
        mechanicLeft.x = 315;
        mechanicLeft.working = true;

        mechanicRight.active = true;
        mechanicRight.x = 350;
        mechanicRight.working = true;

        // Secure winch lifting arm pulls up sedan onto hydraulic bed
        const hookRatio = Math.min(1, (t - 11000) / 2000);
        if (hookRatio < 0.5) {
          // hook attaches
          armWinchAngle = -12 * (hookRatio * 2);
          sedan.x = 130;
          sedan.y = 175;
          sedan.rotate = 0;
          sedan.smokeAlpha = 0.8 * (1 - hookRatio);
        } else {
          // Lifts sedan and rests on flatbed
          const liftRatio = (hookRatio - 0.5) * 2;
          armWinchAngle = -12 + 12 * liftRatio;
          sedan.x = 130 + (130 * liftRatio); // moves near flatbed loader
          sedan.y = 175 - 14 * liftRatio;
          sedan.rotate = -12 * liftRatio;
          sedan.smokeAlpha = 0;
        }
      } 
      // Safe exit departure (13200 - 15000)
      else {
        const exitRatio = (t - 13200) / 1800;
        
        towTruck.x = 295 - 460 * exitRatio;
        serviceVan.x = 365 - 460 * exitRatio;
        cargoTruck.x = 235 - 460 * exitRatio;
        
        // Sedan loaded completely onto the tow flatbed carrier frame
        sedan.x = towTruck.x - 35;
        sedan.y = 161;
        sedan.rotate = -12;
        sedan.smokeAlpha = 0;

        towTruck.responseBeacon = true;
        serviceVan.responseBeacon = true;

        // Highlight environmental wipe cleanup wave
        if (exitRatio < 0.5) {
          highwayClearWipe = true;
        }
      }
    }

    return {
      sedan,
      cargoTruck,
      shockwaveScale,
      shockwaveOpacity,
      environmentDim,
      signalPulse,
      dispatchHQPower,
      towTruck,
      serviceVan,
      mechanicLeft,
      mechanicRight,
      armWinchAngle,
      highwayClearWipe
    };
  };

  const frameData = calculateTelemetry();

  const handleManualScrub = (p: PhaseDetail) => {
    setIsPlaying(false);
    setElapsed(p.timeStart + 100);
    setActivePhase(p.id);
  };

  return (
    <div className="bg-[#111111] border border-neutral-800 rounded-lg p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden text-white" id="mupenzi-rescue-cinematic-simulator">
      {/* Decorative top ambient glowing neon pipeline */}
      <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500"></div>

      {/* Header Info Panel */}
      <div className="flex justify-between items-start border-b border-neutral-800/80 pb-3 mt-1">
        <div>
          <span className="text-[10px] bg-amber-500/10 text-amber-500 font-mono tracking-widest uppercase border border-amber-500/20 px-2 py-0.5 rounded font-extrabold inline-block">
            MUPENZI PIPELINE SIMULATOR (15s CYCLE)
          </span>
          <h3 className="text-sm font-black text-neutral-100 mt-1 uppercase tracking-tight flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
            3D-Style Simulated Field Operations
          </h3>
        </div>
        
        {/* Play Pause Trigger */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-tight cursor-pointer transition-all border flex items-center gap-1.5 ${
            isPlaying 
              ? "bg-amber-500/10 border-amber-500/30 text-amber-500 font-extrabold" 
              : "bg-neutral-900 border-neutral-800 text-neutral-400"
          }`}
          id="simulation-cinematic-trigger"
        >
          {isPlaying ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              LIVE LOOPING
            </>
          ) : (
            <>
              <Pause className="h-2.5 w-2.5" />
              PAUSED
            </>
          )}
        </button>
      </div>

      {/* Narrative Section corresponding to original timing flow */}
      <div className="bg-neutral-950 p-3 rounded border border-neutral-800/85">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
            {activePhaseDetail.label}
          </span>
          <span className="text-[10px] font-mono font-bold bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
            {liveProgressPercent}% PIPELINE CYCLE
          </span>
        </div>
        <h4 className="text-xs font-black text-white tracking-tight mt-1 flex items-center gap-1.5">
          {activePhaseDetail.icon}
          {activePhaseDetail.title}
        </h4>
        <p className="text-[11px] text-neutral-400 leading-relaxed font-sans mt-0.5">
          {activePhaseDetail.description}
        </p>
      </div>

      {/* ================== INTEGRATED VISUAL PROGRESS BAR INDICATOR ================== */}
      <div className="bg-neutral-950 border border-neutral-800/80 p-3 rounded flex flex-col gap-2 relative">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-zinc-500">LIVE ACTION MILESTONE:</span>
          <span className="text-emerald-400 font-extrabold flex items-center gap-1 animate-pulse">
            <Sparkles className="h-3 w-3" />
            {activePhaseDetail.milestoneText}
          </span>
        </div>

        {/* Visual Progress Bar Strip & Checkpoint Nodes */}
        <div className="relative w-full h-2.5 bg-neutral-900 rounded-full border border-neutral-800 overflow-visible mt-1.5">
          {/* Fills dynamically based on calculated timeline frame */}
          <div 
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-100 ease-out bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]"
            style={{ width: `${liveProgressPercent}%` }}
          />

          {/* Connected checkpoints absolute layout */}
          <div className="absolute inset-0 flex justify-between items-center px-1 pointer-events-none">
            {/* CP 1: 25% (Incident) */}
            <div 
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                liveProgressPercent >= 25 
                  ? "bg-red-500 border-red-400 shadow-[0_0_6px_#ef4444]" 
                  : "bg-neutral-950 border-neutral-700"
              }`}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>

            {/* CP 2: 50% (SOS Relay) */}
            <div 
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                liveProgressPercent >= 50 
                  ? "bg-amber-500 border-amber-400 shadow-[0_0_6px_#f59e0b]" 
                  : "bg-neutral-950 border-neutral-700"
              }`}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>

            {/* CP 3: 85% (Dispatch) */}
            <div 
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                liveProgressPercent >= 85 
                  ? "bg-yellow-400 border-yellow-300 shadow-[0_0_6px_#facc15]" 
                  : "bg-neutral-950 border-neutral-700"
              }`}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>

            {/* CP 4: 100% (Resolution) */}
            <div 
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                liveProgressPercent >= 100 
                  ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_#10b981]" 
                  : "bg-neutral-950 border-neutral-700"
              }`}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Milestone Tick Label texts below */}
        <div className="grid grid-cols-4 text-[8.5px] font-mono text-neutral-500 text-center mt-1">
          <span className={liveProgressPercent >= 25 ? "text-red-400 font-bold" : ""}>COLLISION (25%)</span>
          <span className={liveProgressPercent >= 50 ? "text-amber-400 font-bold" : ""}>SOS PULSE (50%)</span>
          <span className={liveProgressPercent >= 85 ? "text-yellow-400 font-bold" : ""}>DISPATCH (85%)</span>
          <span className={liveProgressPercent >= 100 ? "text-emerald-400 font-bold animate-pulse" : ""}>SECURED (100%)</span>
        </div>
      </div>

      {/* SVG Canvas stage with rich gradients, environmental lights and 3D metallic feel */}
      <div className="bg-neutral-950 border border-neutral-800/90 rounded overflow-hidden relative aspect-[14/9] flex items-center justify-center p-2 shadow-inner">
        
        {/* Volumetric ambient space mesh grid */}
        <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-b from-[#09090b] via-[#101016] to-[#14151a]"></div>

        {/* Dynamic environmental darkness vignette from telemetry relay */}
        <div 
          className="absolute inset-0 bg-neutral-950/80 pointer-events-none transition-opacity duration-400 z-10"
          style={{ opacity: frameData.environmentDim }}
        ></div>

        {/* 3D road depth shadow */}
        <div className="absolute bottom-[28%] left-0 right-0 h-10 w-full bg-neutral-950/40 filter blur-md pointer-events-none z-0"></div>

        <svg viewBox="0 0 450 250" className="w-full h-full relative z-20" id="mupenzi-cinematic-stage">
          
          {/* DEFINITIONS OF METALLIC GRADIENTS & DYNAMIC INLINE GLOW FILTERS */}
          <defs>
            {/* Metallic Red paint structure */}
            <linearGradient id="metalRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="40%" stopColor="#dc2626" />
              <stop offset="70%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>

            {/* Mupenzi golden chrome metallic gradient */}
            <linearGradient id="metalGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>

            {/* Cargo container metal siding style */}
            <linearGradient id="metalSilver" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4b5563" />
              <stop offset="50%" stopColor="#374151" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>

            {/* Chrome rim specular shine */}
            <linearGradient id="chromeWheel" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* Highway Asphalt texturing */}
            <linearGradient id="asphaltRoad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="10%" stopColor="#18181b" />
              <stop offset="90%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1a1c23" />
            </linearGradient>

            {/* Headlights halogen glow beam */}
            <linearGradient id="beamGlow" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
            </linearGradient>

            {/* Volumetric drop-shadow filter */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Environment: Beautiful silhouetted background of Rwandan mountains */}
          <path d="M -10 160 Q 90 115 200 152 T 390 125 T 470 160 Z" fill="#0d1412" stroke="#161e1b" strokeWidth="1" />
          <path d="M -10 160 Q 130 95 270 155 Q 380 120 470 160 Z" fill="#060c09" stroke="#0c1612" strokeWidth="1" />
          
          {/* Highly detailed Asphalt Road */}
          <rect x="-10" y="160" width="470" height="62" fill="url(#asphaltRoad)" stroke="#111827" strokeWidth="2.5" />
          
          {/* Reflective yellow highway division lanes */}
          <line x1="-15" y1="190" x2="465" y2="190" stroke="#fbbf24" strokeWidth="2.2" strokeDasharray="18,12" opacity="0.5" />
          <line x1="-10" y1="160" x2="460" y2="160" stroke="#f8fafc" strokeWidth="1" opacity="0.18" />

          {/* 2. Branded Mupenzi Telemetry Satellite Relay Tower in the cloud */}
          <g transform="translate(325, 42)">
            {/* Floating Cloud node */}
            <path d="M 12 15 A 11 11 0 0 1 30 6 A 14 14 0 0 1 54 9 A 11 11 0 0 1 64 22 A 9 9 0 0 1 55 31 L 15 31 A 9 9 0 0 1 12 15 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
            <rect x="23" y="13" width="22" height="14" rx="1.5" fill="#09090b" stroke="#fbbf24" strokeWidth="1" />
            {/* LED Status Grid */}
            <circle cx="27" cy="17" r="1.2" fill="#22c55e" />
            <circle cx="31" cy="17" r="1.2" fill="#fbbf24" />
            <circle cx="35" cy="17" r="1.2" fill="#ef4444" />
            <rect x="27" y="21" width="14" height="2" fill="#3f3f46" />

            {/* Pulsing beam receiver node */}
            {frameData.dispatchHQPower.active && (
              <circle cx="34" cy="-3" r="18" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.4" className="animate-ping" />
            )}
            <circle cx="34" cy="-3" r="3.5" fill={frameData.dispatchHQPower.active ? "#22c55e" : "#ef4444"} />
            <text x="34" y="40" fill="#a1a1aa" fontSize="6px" fontFamily="monospace" textAnchor="middle" fontWeight="black">DISPATCH_HUB</text>
          </g>

          {/* 3. The Vehicles Stage */}

          {/* Heavy Commercial Cargo Truck */}
          <g transform={`translate(${frameData.cargoTruck.x}, ${frameData.cargoTruck.y})`}>
            {/* Realistic drop-shadow */}
            <ellipse cx="46" cy="42" rx="46" ry="3" fill="#000" opacity="0.45" />

            {/* Siding texture cargo shipping box */}
            <rect x="0" y="10" width="72" height="30" rx="3" fill="url(#metalSilver)" stroke="#27272a" strokeWidth="1.5" />
            {/* Embossed metal slats details */}
            <line x1="12" y1="10" x2="12" y2="40" stroke="#1f2937" strokeWidth="2.5" />
            <line x1="24" y1="10" x2="24" y2="40" stroke="#1f2937" strokeWidth="2.5" />
            <line x1="36" y1="10" x2="36" y2="40" stroke="#1f2937" strokeWidth="2.5" />
            <line x1="48" y1="10" x2="48" y2="40" stroke="#1f2937" strokeWidth="2.5" />
            <line x1="60" y1="10" x2="60" y2="40" stroke="#1f2937" strokeWidth="2.5" />
            
            {/* Rear door lock bars */}
            <line x1="3" y1="14" x2="3" y2="36" stroke="#fbbf24" strokeWidth="1" />

            {/* Driver Cab */}
            <path d="M 72 18 L 90 18 L 95 28 L 95 40 L 72 40 Z" fill="#18181b" stroke="#ef4444" strokeWidth="1.2" />
            {/* Cabin Windshield with realistic glass gradient */}
            <path d="M 75 21 L 86 21 L 90 28 L 75 28 Z" fill="#38bdf8" opacity="0.8" />
            {/* Front chrome bumper */}
            <rect x="91" y="37" width="6" height="3.5" fill="url(#chromeWheel)" rx="1" />

            {/* Solid black rubber tires with steel hubcaps */}
            <circle cx="16" cy="40" r="8" fill="#09090b" stroke="#3f3f46" strokeWidth="1.5" />
            <circle cx="16" cy="40" r="3.5" fill="url(#chromeWheel)" />
            <circle cx="30" cy="40" r="8" fill="#09090b" stroke="#3f3f46" strokeWidth="1.5" />
            <circle cx="30" cy="40" r="3.5" fill="url(#chromeWheel)" />
            <circle cx="80" cy="40" r="8" fill="#09090b" stroke="#3f3f46" strokeWidth="1.5" />
            <circle cx="80" cy="40" r="3.5" fill="url(#chromeWheel)" />

            {/* Volumetric flickering halogen headlights */}
            {frameData.cargoTruck.headlights && (
              <polygon points="95,28 170,20 170,45 95,35" fill="url(#beamGlow)" />
            )}

            {/* Blinking Emergency Warning Amber Hazard indicators */}
            {frameData.cargoTruck.hazard && (
              <>
                <circle cx="94" cy="34" r="5" fill="#f59e0b" filter="url(#softGlow)" />
                <circle cx="2" cy="15" r="5" fill="#f59e0b" filter="url(#softGlow)" />
              </>
            )}

            {/* Realistic volumetric engine cooling white steam smoke */}
            {elapsed >= 2000 && elapsed < 11000 && (
              <g transform="translate(90, 10)" opacity="0.6">
                <path d="M 0 5 Q -8 -6 -2 -16 T -12 -25" fill="none" stroke="#e4e4e7" strokeWidth="2.5" className="animate-pulse" />
              </g>
            )}
          </g>

          {/* Premium Passenger Sedan */}
          <g 
            transform={`translate(${frameData.sedan.x}, ${frameData.sedan.y}) rotate(${frameData.sedan.rotate}, 25, 12)`} 
            opacity={frameData.sedan.opacity}
          >
            {/* Drop target shadow */}
            <ellipse cx="26" cy="24" rx="26" ry="2.5" fill="#000" opacity="0.5" />

            {/* Metallic Red aerodynamic panel chassis */}
            <path d="M 3 13 L 13 13 L 19 2 L 38 2 L 44 13 L 53 13 L 53 23 L 0 23 Z" fill="url(#metalRed)" stroke="#991b1b" strokeWidth="1.2" />
            
            {/* Glass panels windshield reflections */}
            <path d="M 17 11 L 20 4 L 27 4 L 27 11 Z" fill="#e0f2fe" opacity="0.85" />
            <path d="M 29 11 L 29 4 L 36 4 L 40 11 Z" fill="#e0f2fe" opacity="0.85" />
            
            {/* Front grille structure */}
            <rect x="50" y="14" width="3" height="4" fill="#09090b" rx="0.5" />
            
            {/* Solid tires with chrome rims */}
            <circle cx="12" cy="23" r="6.8" fill="#09090b" stroke="#333" strokeWidth="1.5" />
            <circle cx="12" cy="23" r="3" fill="url(#chromeWheel)" />
            <circle cx="41" cy="23" r="6.8" fill="#09090b" stroke="#333" strokeWidth="1.5" />
            <circle cx="41" cy="23" r="3" fill="url(#chromeWheel)" />

            {/* Dynamic Volumetric Xenon halogen headlight beam */}
            {frameData.sedan.headlights && (
              <polygon points="53,14 115,8 115,32 53,20" fill="url(#beamGlow)" />
            )}

            {/* Blinking safety hazard amber lights */}
            {frameData.sedan.hazard && (
              <>
                <circle cx="52" cy="14" r="4.5" fill="#f59e0b" filter="url(#softGlow)" />
                <circle cx="1" cy="14" r="4.5" fill="#f59e0b" filter="url(#softGlow)" />
              </>
            )}

            {/* Cellular telemetry node transmitting block */}
            <rect x="25" y="0" width="4" height="2" fill="#09090b" />
            <line x1="27" y1="0" x2="27" y2="-5" stroke="#ef4444" strokeWidth="1" />
            <circle cx="27" cy="-5" r="1.5" fill="#ef4444" />

            {/* Volumetric Engine Smoke puffing from hood (realism key value) */}
            {frameData.sedan.smokeAlpha > 0 && (
              <g transform="translate(44, 2)" opacity={frameData.sedan.smokeAlpha}>
                {/* 3 stacked puff circles */}
                <circle cx="0" cy="-3" r="5" fill="#71717a" opacity="0.4" className="animate-bounce" />
                <circle cx="6" cy="-8" r="7" fill="#a1a1aa" opacity="0.3" />
                <circle cx="-4" cy="-12" r="6" fill="#d4d4d8" opacity="0.2" />
              </g>
            )}
          </g>

          {/* ===================== VOLUME CRASH SHOCKWAVE (PHASE 1) ===================== */}
          {frameData.shockwaveOpacity > 0 && (
            <g transform="translate(182, 172)" opacity={frameData.shockwaveOpacity}>
              {/* Metallic ignition ring */}
              <circle cx="0" cy="0" r={frameData.shockwaveScale * 20} fill="none" stroke="#ef4444" strokeWidth="2.5" />
              <circle cx="0" cy="0" r={frameData.shockwaveScale * 12} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
              {/* Pointed impact debris sparks */}
              <path d="M -15,0 L -5,-5 L 0,-20 L 5,-5 L 15,0 L 5,5 L 0,18 L -5,5 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <text x="0" y="4" fill="#1e1b4b" fontSize="6px" fontFamily="sans-serif" fontWeight="black" textAnchor="middle">IMPACT</text>
            </g>
          )}

          {/* ===================== METALLIC AMBER DATA BEAM SOS (PHASE 2) ===================== */}
          {frameData.signalPulse.active && (
            <g>
              {/* Concentric telemetry links */}
              <line x1="157" y1="171" x2={frameData.signalPulse.x} y2={frameData.signalPulse.y} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,3" />
              <circle cx={frameData.signalPulse.x} cy={frameData.signalPulse.y} r={frameData.signalPulse.r} fill="none" stroke="#f59e0b" strokeWidth="2" opacity={frameData.signalPulse.opacity} />
              <circle cx={frameData.signalPulse.x} cy={frameData.signalPulse.y} r="3.5" fill="#fbbf24" />
            </g>
          )}

          {/* ===================== MUPENZI COMMAND DEPLOYMENT (PHASE 3) ===================== */}

          {/* Heavy flatbed recovery tow truck */}
          <g transform={`translate(${frameData.towTruck.x}, ${frameData.towTruck.y})`}>
            {/* Shadow */}
            <ellipse cx="42" cy="42" rx="42" ry="3" fill="#000" opacity="0.45" />

            {/* Branded dual hydraulic deck */}
            <rect x="0" y="16" width="60" height="15" fill="#1e1b4b" stroke="#fbbf24" strokeWidth="1.8" />
            <rect x="4" y="20" width="52" height="4" fill="#09090b" />
            
            {/* Safety chevron markings */}
            <line x1="12" y1="21" x2="18" y2="26" stroke="#fbbf24" strokeWidth="2" />
            <line x1="24" y1="21" x2="30" y2="26" stroke="#fbbf24" strokeWidth="2" />
            <line x1="36" y1="21" x2="42" y2="26" stroke="#fbbf24" strokeWidth="2" />

            {/* Hydraulic towing winch arm mechanism (lifts with adjustable angle) */}
            <g transform={`translate(16, 16) rotate(${frameData.armWinchAngle})`}>
              <line x1="0" y1="0" x2="-14" y2="-18" stroke="#475569" strokeWidth="3.5" />
              <line x1="-14" y1="-18" x2="6" y2="-18" stroke="#475569" strokeWidth="2.2" />
              {/* Golden steel recovery hook */}
              <path d="M 6 -18 L 6 -14 Q 4 -12 6 -10 T 10 -12" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
            </g>

            {/* Cab structure */}
            <path d="M 60 10 L 78 10 L 84 18 L 84 31 L 60 31 Z" fill="url(#metalGold)" stroke="#1e1b4b" strokeWidth="1.2" />
            {/* Shielded dark passenger glass */}
            <path d="M 63 13 L 73 13 L 78 18 L 63 18 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
            
            {/* Specular alloy wheels */}
            <circle cx="16" cy="31" r="8" fill="#09090b" stroke="#fbbf24" strokeWidth="1.2" />
            <circle cx="16" cy="31" r="3.2" fill="url(#chromeWheel)" />
            <circle cx="30" cy="31" r="8" fill="#09090b" stroke="#fbbf24" strokeWidth="1.2" />
            <circle cx="30" cy="31" r="3.2" fill="url(#chromeWheel)" />
            <circle cx="72" cy="31" r="8" fill="#09090b" stroke="#fbbf24" strokeWidth="1.2" />
            <circle cx="72" cy="31" r="3.2" fill="url(#chromeWheel)" />

            <text x="32" y="27" fill="#fafafa" fontSize="5.5px" fontFamily="monospace" fontWeight="bolder">MUPENZI_HEAVY</text>

            {/* Spinning high intensity emergency amber warning strobe */}
            {frameData.towTruck.responseBeacon && (
              <>
                <circle cx="73" cy="10" r="5" fill="#f59e0b" filter="url(#softGlow)" />
                <circle cx="73" cy="10" r="2.2" fill="#f59e0b" />
              </>
            )}
          </g>

          {/* Rapid mechanical care service van */}
          <g transform={`translate(${frameData.serviceVan.x}, ${frameData.serviceVan.y})`}>
            {/* Shadow */}
            <ellipse cx="25" cy="27" rx="25" ry="2" fill="#000" opacity="0.4" />

            {/* Van metallic chassis */}
            <rect x="0" y="0" width="50" height="26" rx="3.5" fill="#18181b" stroke="#10b981" strokeWidth="1.5" />
            {/* Reflective safety band */}
            <rect x="0" y="11" width="50" height="4" fill="#10b981" />
            {/* Cabin front glass */}
            <path d="M 38 4 L 46 4 L 48 11 L 38 11 Z" fill="#334155" />
            
            {/* Specular alloys */}
            <circle cx="12" cy="26" r="6" fill="#09090b" stroke="#10b981" strokeWidth="1" />
            <circle cx="12" cy="26" r="2.5" fill="url(#chromeWheel)" />
            <circle cx="38" cy="26" r="6" fill="#09090b" stroke="#10b981" strokeWidth="1" />
            <circle cx="38" cy="26" r="2.5" fill="url(#chromeWheel)" />

            <text x="20" y="9" fill="#22c55e" fontSize="5px" fontFamily="monospace" fontWeight="heavy">RAPID SERVICE</text>

            {/* High efficiency rotating strobe lights on van roof */}
            {frameData.serviceVan.responseBeacon && (
              <>
                <circle cx="18" cy="0" r="5" fill="#10b981" filter="url(#softGlow)" />
                <circle cx="18" cy="0" r="2.2" fill="#10b981" />
              </>
            )}
          </g>

          {/* ===================== CHARACTER MODELS REALISTIC ANIMATION (PHASE 3 & 4) ===================== */}

          {/* Mupenzi Left Specialist: orange reflective high-vis jumpsuit & silver stripes */}
          {frameData.mechanicLeft.active && (
            <g transform={`translate(${frameData.mechanicLeft.x}, ${frameData.mechanicLeft.y})`}>
              {/* Walking legs frame bounce simulation */}
              {frameData.mechanicLeft.walking ? (
                <>
                  <line x1="2" y1="12" x2="0" y2="24" stroke="#f97316" strokeWidth="2" />
                  <line x1="5" y1="12" x2="8" y2="24" stroke="#f97316" strokeWidth="2" />
                </>
              ) : (
                <>
                  <line x1="2" y1="12" x2="2" y2="24" stroke="#f97316" strokeWidth="2.5" />
                  <line x1="5" y1="12" x2="5" y2="24" stroke="#f97316" strokeWidth="2.5" />
                </>
              )}

              {/* Reflective high-vis boots */}
              <rect x="-1" y="22" width="2.5" height="2" fill="#000" />
              <rect x="6" y="22" width="2.5" height="2" fill="#000" />

              {/* Safety Orange jumpsuits torso */}
              <rect x="0" y="4" width="7" height="9" fill="#ea580c" rx="1" />
              {/* Silver reflective vest harness detail */}
              <rect x="1" y="6" width="5" height="1.5" fill="#e2e8f0" />
              <line x1="2.2" y1="4" x2="2.2" y2="13" stroke="#e2e8f0" strokeWidth="1" />
              <line x1="4.8" y1="4" x2="4.8" y2="13" stroke="#e2e8f0" strokeWidth="1" />

              {/* Tool belt */}
              <rect x="-0.5" y="11" width="8" height="1.5" fill="#451a03" />

              {/* Head wearing protective absolute yellow hardhat helmet */}
              <circle cx="3.5" cy="0" r="3.2" fill="#ea580c" />
              <path d="M 0 0 L 7 0" stroke="#facc15" strokeWidth="1" />

              {/* Working active tools arm indicators */}
              {frameData.mechanicLeft.working && (
                <g className="animate-pulse">
                  <line x1="0" y1="6" x2="-5" y2="8" stroke="#ea580c" strokeWidth="1.8" />
                  <circle cx="-5" cy="8" r="3" fill="#10b981" opacity="0.4" />
                </g>
              )}
            </g>
          )}

          {/* Mupenzi Right Specialist: similar config at different spot */}
          {frameData.mechanicRight.active && (
            <g transform={`translate(${frameData.mechanicRight.x}, ${frameData.mechanicRight.y})`}>
              {/* Legs positioning */}
              {frameData.mechanicRight.walking ? (
                <>
                  <line x1="2" y1="12" x2="-1" y2="24" stroke="#f97316" strokeWidth="2" />
                  <line x1="5" y1="12" x2="7" y2="24" stroke="#f97316" strokeWidth="2" />
                </>
              ) : (
                <>
                  <line x1="2" y1="12" x2="2" y2="24" stroke="#f97316" strokeWidth="2.5" />
                  <line x1="5" y1="12" x2="5" y2="24" stroke="#f97316" strokeWidth="2.5" />
                </>
              )}

              {/* Safety boots */}
              <rect x="-2" y="22" width="2.5" height="2" fill="#000" />
              <rect x="5" y="22" width="2.5" height="2" fill="#000" />

              {/* Body */}
              <rect x="0" y="4" width="7" height="9" fill="#ea580c" rx="1" />
              <rect x="1" y="6" width="5" height="1.5" fill="#e2e8f0" />
              <line x1="2.2" y1="4" x2="2.2" y2="13" stroke="#e2e8f0" strokeWidth="1" />
              <line x1="4.8" y1="4" x2="4.8" y2="13" stroke="#e2e8f0" strokeWidth="1" />

              {/* Tool belt */}
              <rect x="-0.5" y="11" width="8" height="1.5" fill="#451a03" />

              {/* Helmet and Head */}
              <circle cx="3.5" cy="0" r="3.2" fill="#facc15" />
              <path d="M 0 0 L 7 0" stroke="#fbbf24" strokeWidth="1" />

              {/* Working wrench glowing spark tools (Phase 4) */}
              {frameData.mechanicRight.working && (
                <g className="animate-pulse">
                  <line x1="5" y1="7" x2="10" y2="5" stroke="#ea580c" strokeWidth="1.8" />
                  <circle cx="10" cy="5" r="3.5" fill="#22c55e" opacity="0.4" />
                </g>
              )}
            </g>
          )}

          {/* ===================== GREEN HIGHWAY RESTORE WIPE (PHASE 4) ===================== */}
          {frameData.highwayClearWipe && (
            <g transform="translate(190, 160)" opacity="0.9">
              {/* Continuous wave of neon green indicating cleanup */}
              <rect x="-170" y="0" width="370" height="4" fill="#10b981" opacity="0.55" className="animate-pulse" />
              <text x="0" y="16" fill="#10b981" fontSize="7.2px" fontFamily="monospace" textAnchor="middle" fontWeight="black" className="animate-bounce">
                ▼ HIGHWAY SCENE CLEARED & SYNCED
              </text>
            </g>
          )}
        </svg>

        {/* Live loop diagnostic ticker HUD */}
        <div className="absolute bottom-2.5 right-2.5 bg-neutral-900/95 border border-neutral-800 p-2 rounded text-[8.5px] font-mono text-zinc-400 flex items-center gap-2 z-25 shadow-xl">
          <span className="text-zinc-500 uppercase">SYS_TICKER:</span>
          <span className="text-emerald-400 font-bold">{(elapsed / 1000).toFixed(2)}s / 15.00s</span>
          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
        </div>
      </div>

      {/* Manual interactive scrub checkpoints */}
      <div className="grid grid-cols-4 gap-1.5">
        {PHASES.map((p) => {
          const isActive = p.id === activePhase;
          return (
            <button
              key={p.id}
              onClick={() => handleManualScrub(p)}
              className={`text-[10px] uppercase font-mono tracking-wider py-2 px-1 rounded border transition-all cursor-pointer text-center ${
                isActive
                  ? "bg-amber-500 border-amber-500 text-neutral-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              }`}
              id={`animation-action-scrub-${p.id.toLowerCase()}`}
            >
              <span className="block text-[8px] font-medium opacity-65 leading-none mb-0.5 text-center">
                {p.label}
              </span>
              <span className="truncate block font-bold leading-snug">
                {p.id === RescueScenePhase.Rescue ? "DISPATCH" : p.id.split("_")[0]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="text-[10.5px] text-neutral-500 font-sans leading-relaxed text-center italic border-t border-neutral-800/80 pt-2 flex justify-center items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-amber-500" />
        "Precision simulated 15-second telemetry cycle. Choose any checkpoint above to pause and analyze mechanics diagnostics parameter."
      </div>
    </div>
  );
}
