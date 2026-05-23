import React, { useState, useEffect } from "react";
import { Compass, MapPin, Truck, Shield, Navigation, Play, Pause, RotateCcw } from "lucide-react";
import { DispatchHub, IncidentRecord } from "../types";

interface TacticalMapProps {
  activeIncident: IncidentRecord | null;
  onSelectPresetsLocation: (name: string, lat: number, lng: number) => void;
}

export default function TacticalMap({ activeIncident, onSelectPresetsLocation }: TacticalMapProps) {
  const [trackerProgress, setTrackerProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Pre-configured Rwanda standard rescue benchmark stations
  const presetDriversLocations = [
    { name: "Kigali Convention Centre", lat: -1.9441, lng: 30.0619, label: "Kigali (Central)" },
    { name: "Musanze Town Crossroads", lat: -1.5032, lng: 29.6350, label: "Musanze (North)" },
    { name: "Gisenyi Beach Road", lat: -1.7011, lng: 29.2559, label: "Rubavu (West)" },
    { name: "Kayonza Road Intersection", lat: -1.8690, lng: 30.7027, label: "Kayonza (East)" },
    { name: "Huye National Highway", lat: -2.5967, lng: 29.7397, label: "Huye (South)" }
  ];

  // Coordinates mapping to pixel conversion for our custom SVG map of Rwanda
  const projectCoords = (lat: number, lng: number) => {
    const minLng = 28.8;
    const maxLng = 31.0;
    const minLat = -1.0;
    const maxLat = -2.8;

    const x = ((lng - minLng) / (maxLng - minLng)) * 700 + 50;
    const y = ((lat - minLat) / (maxLat - minLat)) * 360 + 60;
    return { x: Math.round(x), y: Math.round(y) };
  };

  const getHubCoords = (hub: DispatchHub) => {
    switch (hub) {
      case DispatchHub.Kigali:
        return { lat: -1.9441, lng: 30.0619 };
      case DispatchHub.Musanze:
        return { lat: -1.5032, lng: 29.6350 };
      case DispatchHub.Rubavu:
        return { lat: -1.7011, lng: 29.2559 };
      case DispatchHub.Akagera:
        return { lat: -1.8690, lng: 30.7027 };
    }
  };

  const currentHub = activeIncident?.hub || DispatchHub.Kigali;
  const hubLatLng = getHubCoords(currentHub);
  const hubXY = projectCoords(hubLatLng.lat, hubLatLng.lng);

  const incidentLatLng = activeIncident 
    ? { lat: activeIncident.latitude, lng: activeIncident.longitude }
    : { lat: -1.9441, lng: 30.0619 }; // Default to Kigali
  const incidentXY = projectCoords(incidentLatLng.lat, incidentLatLng.lng);

  // Animate the rescue tracking path
  useEffect(() => {
    if (!activeIncident || isPaused) return;

    const interval = setInterval(() => {
      setTrackerProgress((prev) => {
        if (prev >= 100) return 0; // Loop tracking
        return prev + 1.5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeIncident, isPaused]);

  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanOffset((prev) => ({
      x: prev.x - dx * 1.5,
      y: prev.y - dy * 1.5,
    }));
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setPanOffset((prev) => ({
      x: prev.x - dx * 1.5,
      y: prev.y - dy * 1.5,
    }));
  };

  const handleRecenter = () => {
    if (activeIncident) {
      setPanOffset({
        x: incidentXY.x - 400,
        y: incidentXY.y - 240,
      });
    } else {
      setPanOffset({ x: 0, y: 0 });
    }
  };

  // Automatically focus on active incident position when a new incident becomes active
  useEffect(() => {
    if (activeIncident) {
      setPanOffset({
        x: incidentXY.x - 400,
        y: incidentXY.y - 240,
      });
    } else {
      setPanOffset({ x: 0, y: 0 });
    }
  }, [activeIncident?.id]);

  // Interpolated position of the active tow truck on the map
  const truckX = hubXY.x + (incidentXY.x - hubXY.x) * (trackerProgress / 100);
  const truckY = hubXY.y + (incidentXY.y - hubXY.y) * (trackerProgress / 100);

  // Status computation for UI reporting
  const runningEta = activeIncident
    ? Math.max(1, Math.round(activeIncident.etaMinutes * (1 - trackerProgress / 100)))
    : 0;

  const hasPanned = panOffset.x !== 0 || panOffset.y !== 0;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 shadow-2xl flex flex-col gap-4 text-white" id="tactical-tracker-grid">
      {/* Header Panel */}
      <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-amber-500 animate-spin-slow" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-100">
              Live Tactical Tracker
            </h3>
            <p className="text-[10px] text-neutral-400 font-mono">
              GPS SATELLITE RADAR • PROVINCIAL ROADS
            </p>
          </div>
        </div>

        {activeIncident && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="bg-neutral-800 hover:bg-neutral-700 p-1.5 rounded transition cursor-pointer text-amber-500 text-xs flex items-center gap-1.5 font-mono border border-neutral-700"
              title={isPaused ? "Resume Live Sync" : "Pause Tracking"}
            >
              {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              {isPaused ? "RESUME" : "PAUSE"}
            </button>
            <button
              onClick={() => setTrackerProgress(0)}
              className="bg-neutral-800 hover:bg-neutral-700 p-1.5 rounded transition cursor-pointer text-neutral-400 font-mono text-xs border border-neutral-700"
              title="Reset Radar Link"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Grid Coordinates Display */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-neutral-950 p-2.5 rounded border border-neutral-800 text-center font-mono text-xs">
        <div>
          <span className="block text-[9px] text-neutral-500 uppercase">SYS RADAR LINK</span>
          <span className={`${activeIncident ? "text-emerald-400" : "text-amber-500"} font-bold`}>
            {activeIncident ? "CONNECTED" : "STANDBY"}
          </span>
        </div>
        <div>
          <span className="block text-[9px] text-neutral-500">DRIVER COORDINATES</span>
          <span className="text-neutral-300 font-bold block truncate">
            {activeIncident?.latitude.toFixed(4) || "-1.9441"}°, {activeIncident?.longitude.toFixed(4) || "30.0619"}°
          </span>
        </div>
        <div>
          <span className="block text-[9px] text-neutral-500">ASSIGNED DISPATCH HUB</span>
          <span className="text-amber-500 font-bold block truncate">
            {activeIncident ? activeIncident.hub : "Kigali Hub"}
          </span>
        </div>
        <div>
          <span className="block text-[9px] text-neutral-500">ACTIVE TRACKING ETA</span>
          <span className={`font-bold block ${activeIncident?.isActiveAccident ? "text-rose-500 animate-pulse" : "text-amber-400"}`}>
            {activeIncident ? `${runningEta} MINS` : "N/A"}
          </span>
        </div>
      </div>

      {/* SVG Interactive Map Container */}
      <div 
        className={`relative bg-neutral-950 rounded border border-neutral-800 p-2 overflow-hidden aspect-[16/10] flex items-center justify-center cursor-grab ${
          isDragging ? "cursor-grabbing" : ""
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
        id="tactical-interact-viewport"
      >
        {/* Background Grid Accent */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {/* Floating Re-center camera controller */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRecenter();
          }}
          className={`absolute top-3 right-3 bg-neutral-900/95 hover:bg-neutral-800 text-amber-500 border rounded-lg px-2.5 py-1.5 cursor-pointer transition-all duration-200 flex items-center gap-1.5 shadow-xl text-[10px] font-mono font-bold uppercase z-30 ${
            hasPanned 
              ? "border-amber-500/80 text-amber-500 animate-pulse" 
              : "border-neutral-800 text-neutral-400 opacity-60 hover:opacity-100"
          }`}
          title="Centering GPS view lock on stranded driver coordinates"
        >
          <Navigation className="h-3.5 w-3.5 rotate-45" />
          {hasPanned ? "RE-CENTER GPS" : "GPS LOCKED"}
        </button>

        <svg 
          viewBox={`${panOffset.x} ${panOffset.y} 800 480`} 
          className="w-full h-full relative z-10 select-none pointer-events-none" 
          id="rwanda-svg-radar"
        >
          {/* Lake Kivu representation (West) */}
          <path
            d="M 20 80 Q 40 100 35 150 T 40 220 T 25 310 T 30 380 L -10 400 L -10 50 Z"
            className="fill-neutral-900 stroke-neutral-800/50 stroke-[1.5]"
          />
          <text x="35" y="240" className="fill-neutral-600 text-[10px] font-mono tracking-widest uppercase rotate-270 select-none">
            LAKE_KIVU
          </text>

          {/* Boundaries / Accents */}
          <rect x="5" y="5" width="790" height="470" rx="4" fill="none" className="stroke-neutral-800/60 stroke-[1]" />

          {/* Connecting Highways (Stylized) */}
          <path
            d="M 195 208 L 451.5 259" // Rubavu to Kigali Highway (RN4)
            className="stroke-neutral-800 fill-none stroke-[2] stroke-dasharray-[4_6]"
          />
          <path
            d="M 315.6 166.2 L 451.5 259" // Musanze to Kigali Highway (RN2)
            className="stroke-neutral-800 fill-none stroke-[2] stroke-dasharray-[4_6]"
          />
          <path
            d="M 451.5 259 L 655.4 243.4" // Kigali to Kayonza (RN3)
            className="stroke-neutral-800 fill-none stroke-[3] stroke-dasharray-[4_6]"
          />

          {/* Highway labels */}
          <text x="360" y="215" className="fill-neutral-600 text-[8px] font-mono font-medium tracking-tight">RN2 (KGL-MSZ)</text>
          <text x="290" y="248" className="fill-neutral-600 text-[8px] font-mono font-medium tracking-tight">RN4 (KGL-RBV)</text>
          <text x="540" y="244" className="fill-neutral-600 text-[8px] font-mono font-medium tracking-tight">RN3 (KGL-KNYZ)</text>

          {/* 1. Hub Markers */}
          {Object.values(DispatchHub).map((hubName) => {
            const hLatLng = getHubCoords(hubName);
            const hXY = projectCoords(hLatLng.lat, hLatLng.lng);
            const isTarget = activeIncident?.hub === hubName;

            return (
              <g key={hubName} className="cursor-pointer" id={`hub-${hubName.replace(/\s+/g, "-")}`}>
                {/* Pulse Ring */}
                <circle
                  cx={hXY.x}
                  cy={hXY.y}
                  r={isTarget ? 15 : 8}
                  className={`fill-none stroke-amber-500/20 stroke-[2] ${
                    isTarget ? "animate-ping-slow origin-center" : ""
                  }`}
                />
                <circle
                  cx={hXY.x}
                  cy={hXY.y}
                  r="5"
                  className={isTarget ? "fill-amber-500" : "fill-neutral-700 hover:fill-amber-500/80 transition-colors"}
                />
                <text
                  x={hXY.x}
                  y={hXY.y - 10}
                  textAnchor="middle"
                  className="fill-neutral-400 text-[9px] font-mono tracking-tight font-bold font-semibold uppercase pointer-events-none select-none"
                >
                  {hubName.split(" ")[0]}
                </text>
              </g>
            );
          })}

          {/* 2. Active Incident Anchor & Routed Journey */}
          {activeIncident && (
            <>
              {/* Dash Trajectory Line */}
              <line
                x1={hubXY.x}
                y1={hubXY.y}
                x2={incidentXY.x}
                y2={incidentXY.y}
                className={`stroke-2 fill-none stroke-dasharray-[5_4] ${
                  activeIncident.isActiveAccident ? "stroke-rose-500/85" : "stroke-amber-500/75"
                }`}
              />

              {/* Progress Line */}
              <line
                x1={hubXY.x}
                y1={hubXY.y}
                x2={truckX}
                y2={truckY}
                className={`stroke-[3.5] fill-none ${
                  activeIncident.isActiveAccident ? "stroke-rose-500" : "stroke-amber-400"
                }`}
              />

              {/* Live Rescue Truck GPS node */}
              <g transform={`translate(${truckX - 9}, ${truckY - 9})`} className="animate-pulse">
                <circle cx="9" cy="9" r="10" className={activeIncident.isActiveAccident ? "fill-rose-500/30" : "fill-amber-500/30"} />
                <rect x="3" y="3" width="12" height="12" rx="2" className={activeIncident.isActiveAccident ? "fill-rose-600" : "fill-amber-500"} />
                <path d="M 6 5 L 12 9 L 6 13 Z" fill="white" transform="scale(0.8) translate(2, 2)" />
              </g>

              {/* Active Stranded Driver Beacon */}
              <g transform={`translate(${incidentXY.x}, ${incidentXY.y})`} className="cursor-help">
                <circle cx="0" cy="0" r="16" className="fill-none stroke-red-500/35 stroke-[2] animate-ping" />
                <circle cx="0" cy="0" r="6" className="fill-rose-600" />
                <g transform="translate(-8, -25)">
                  <rect x="0" y="0" width="16" height="12" rx="1.5" className="fill-rose-600 text-[8px]" />
                  <text x="8" y="9" textAnchor="middle" className="fill-white font-mono text-[7px] font-bold">SOS</text>
                </g>
              </g>
            </>
          )}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-neutral-900/90 border border-neutral-800 p-2 rounded text-[9px] font-mono text-neutral-400 flex flex-col gap-1 relative z-20">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 inline-block"></span> Mupenzi Active Dispatch Hubs
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500 inline-block"></span> stranded driver (SOS)
          </div>
          {activeIncident && (
            <div className="flex items-center gap-1.5 animate-pulse">
              <span className="h-2 w-2 rounded bg-amber-500 inline-block"></span> rescue team in-route
            </div>
          )}
        </div>
      </div>

      {/* Manual Quick Map Calibration Presets */}
      <div>
        <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-2">
          GPS Radar Preset Calibration (Select Location in Rwanda)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
          {presetDriversLocations.map((loc) => {
            const isCurrentlySelected = activeIncident && Math.abs(activeIncident.latitude - loc.lat) < 0.001;
            return (
              <button
                key={loc.name}
                onClick={() => onSelectPresetsLocation(loc.name, loc.lat, loc.lng)}
                className={`text-[10px] font-mono tracking-tight py-1.5 px-2 rounded cursor-pointer border text-center transition-all ${
                  isCurrentlySelected
                    ? "bg-amber-500 text-neutral-900 border-amber-500 font-bold"
                    : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-800"
                }`}
                id={`preset-${loc.label.toLowerCase().replace(/[()_\s]+/g, "-")}`}
              >
                {loc.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
