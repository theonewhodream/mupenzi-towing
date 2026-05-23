import React, { useState, useEffect } from "react";
import { 
  PhoneCall, 
  Truck, 
  ShieldAlert, 
  Activity, 
  User, 
  MapPin, 
  AlertOctagon, 
  CheckCircle, 
  ChevronRight, 
  Info, 
  Plus, 
  Sparkles, 
  Check, 
  Compass, 
  RefreshCw,
  Clock,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  HelpCircle,
  Video
} from "lucide-react";
import { IncidentType, DispatchHub, IncidentStatus, IncidentRecord, DiagnosticAdvice, SubscriptionTier } from "./types";
import Header from "./components/Header";
import TacticalMap from "./components/TacticalMap";
import RescueAnimationLoop from "./components/RescueAnimationLoop";

// Pre-built subscriptions data matching Tier 1, 2, 3 rules
const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: "demand",
    name: "On-Demand Rescue",
    price: "Calculated Distance",
    billing: "Pay-per-incident basis",
    features: [
      "Pay-per-kilometer starting fee",
      "Standard dispatch scheduling queue",
      "Real-time GPS tracker link",
      "Standard safety advisory system"
    ],
    color: "border-neutral-800 bg-neutral-950/40 text-neutral-400"
  },
  {
    id: "shield-pro",
    name: "Mupenzi Shield Pro",
    price: "$15",
    billing: "per month, billed monthly",
    features: [
      "Unlimited FREE towing within Kigali limits",
      "2 free mechanical road dispatches per month",
      "Priority bypass emergency queueing",
      "Assigned designated master technician"
    ],
    color: "border-amber-500 bg-amber-500/5 text-amber-500 shadow-[0_0_15px_rgba(255,183,3,0.05)]"
  },
  {
    id: "fleet",
    name: "Mupenzi National Fleet",
    price: "$39",
    billing: "per month for full security",
    features: [
      "Absolute 100% nationwide coverage (all provinces)",
      "Zero dispatch or recovery towing fees ever",
      "Guaranteed arrival under 45 minutes",
      "Comprehensive digital accident logging dashboard",
      "Full family coverage / multiple registered plates"
    ],
    color: "border-rose-500/40 bg-rose-500/[0.02] text-rose-400"
  }
];

// Presets matching Breakdown AI Imaging prompt rules
const IMAGE_PRESETS = [
  {
    title: "Kigali Towing",
    query: "Hyper-realistic nighttime towing on Kigali streets",
    desc: "A disabled SUV being loaded onto a heavy-duty tow truck on a wet Kigali avenue under brilliant amber strobe lights."
  },
  {
    title: "Heavy Rain Engine Fix",
    query: "Mechanic fixing an engine under heavy rain",
    desc: "A technician diagnosing a battery failure with torrential rainfall, misty backdrop and dramatic hazard flashers."
  },
  {
    title: "Mountain Highway Flat Tire",
    query: "Flat tire change on a mountain highway in Musanze",
    desc: "A rapid response patrol assistance unit swap a tire with the beautiful dark Virunga mount peaks visible behind."
  }
];

export default function App() {
  // Input form state matching strict emergency data matrix
  const [driverName, setDriverName] = useState("Jean Claude Uwimana");
  const [phone, setPhone] = useState("+250 788 123 456");
  const [vehicleModel, setVehicleModel] = useState("Toyota RAV4 (Dark Slate Grey)");
  const [vehiclePlate, setVehiclePlate] = useState("RAD 412 M");
  const [locationName, setLocationName] = useState("RN2 Highroad, close to Musanze bypass");
  const [latitude, setLatitude] = useState(-1.5032);
  const [longitude, setLongitude] = useState(29.6350);
  const [incidentType, setIncidentType] = useState<IncidentType>(IncidentType.Mechanical);
  const [isActiveAccident, setIsActiveAccident] = useState<boolean>(true); // YES by default to demonstrate high-priority triage

  // App processing status
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeIncident, setActiveIncident] = useState<IncidentRecord | null>(null);

  // Diagnostic checklist fetched from severe Gemini API or fallback
  const [diagnostic, setDiagnostic] = useState<DiagnosticAdvice | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // AI Imaging section states
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageRefinedPrompt, setImageRefinedPrompt] = useState("");
  const [imageIsDemo, setImageIsDemo] = useState(false);
  
  // Quick status logs
  const [logs, setLogs] = useState<string[]>([
    "System Init: Mupenzi Command Center initialized.",
    "Grid Connection: Kigali Mainframe connected to GPS base-stations."
  ]);

  const pushLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 7)]);
  };

  // Natively trigger standard geolocation API
  const handleGPSAutoDetect = () => {
    setIsLocating(true);
    pushLog("Attempting satellite link to mobile device...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          setLocationName(`GPS Verified Coords: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          setIsLocating(false);
          pushLog(`GPS connection established. Satellite Coordinates locked.`);
          
          if (activeIncident) {
            // Update current active incident
            setActiveIncident(prev => prev ? {
              ...prev,
              latitude: lat,
              longitude: lng,
              locationName: `GPS Verified Coordinates`
            } : null);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          pushLog("GPS permission block or timeout. Calibrated back to standard Musanze gateway route.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      pushLog("Geolocation API is not supported in this browser wrapper.");
      setIsLocating(false);
    }
  };

  // Perform calibration from the map preset selections
  const handlePresetMapCalibration = (name: string, lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setLocationName(name);
    pushLog(`Manual map calibration to preset target: ${name}`);

    if (activeIncident) {
      // Re-calculate hub and routing stats immediately
      const calculations = calculateRescueDetails(lat, lng, activeIncident.isActiveAccident);
      setActiveIncident(prev => prev ? {
        ...prev,
        latitude: lat,
        longitude: lng,
        locationName: name,
        hub: calculations.hub,
        distanceKm: calculations.distance,
        priceRwf: calculations.price,
        etaMinutes: calculations.eta,
      } : null);
      
      triggerAutoDiagnosis(activeIncident.incidentType, name);
    }
  };

  // Mathematical hub assignment & simulation calculations for Rwanda regions
  const calculateRescueDetails = (lat: number, lng: number, highPriority: boolean) => {
    // Determine closest dispatch station hub in Rwanda based on longitude coordinates
    // West to East: Gisenyi (29.25), Musanze (29.63), Kigali (30.06), Akagera (30.70)
    let hub = DispatchHub.Kigali;
    let distance = 12.5; // Base estimate in km

    if (lng < 29.4) {
      hub = DispatchHub.Rubavu;
      distance = Math.max(3, Math.abs(lng - 29.25) * 110 + Math.abs(lat - (-1.7011)) * 110);
    } else if (lng < 29.85) {
      hub = DispatchHub.Musanze;
      distance = Math.max(2, Math.abs(lng - 29.635) * 110 + Math.abs(lat - (-1.5032)) * 110);
    } else if (lng > 30.4) {
      hub = DispatchHub.Akagera;
      distance = Math.max(5, Math.abs(lng - 30.702) * 110 + Math.abs(lat - (-1.8690)) * 110);
    } else {
      hub = DispatchHub.Kigali;
      distance = Math.max(1.8, Math.abs(lng - 30.061) * 110 + Math.abs(lat - (-1.9441)) * 110);
    }

    // Standard prices / billing values
    const ratePerKm = 1500;
    const baseFee = 12000;
    let price = Math.round(baseFee + distance * ratePerKm);

    // Speed / ETA calculation (shorter ETA for emergency active accident priorities)
    const baseSpeed = highPriority ? 85 : 55; // High speed responders bypass standard signals
    let eta = Math.round((distance / baseSpeed) * 60) + 3; // + safety margin
    if (highPriority) eta = Math.max(2, Math.round(eta * 0.5)); // Halved ETA for Priority 1

    return {
      hub,
      distance: parseFloat(distance.toFixed(1)),
      price: Math.round(price / 100) * 100, // Round to nearest 100 RWF
      eta: Math.max(3, eta)
    };
  };

  // Submit emergency incident intake pipeline
  const handleInitiateRescue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim()) {
      pushLog("Validation Error: Driver name is strictly required.");
      return;
    }

    setIsSubmitting(true);
    pushLog("Processing emergency intake parameters...");

    setTimeout(() => {
      const stats = calculateRescueDetails(latitude, longitude, isActiveAccident);
      
      const newRecord: IncidentRecord = {
        id: `MUPENZI-SOS-${Math.floor(1000 + Math.random() * 9000)}`,
        driverName: driverName.trim(),
        phone: phone.trim() || "+250 788 000 000",
        vehicleModel: vehicleModel.trim() || "Unspecified saloon car",
        vehiclePlate: vehiclePlate.trim().toUpperCase() || "RAD --- -",
        locationName: locationName || "Rwanda Roadway",
        latitude,
        longitude,
        incidentType,
        isActiveAccident,
        priorityLevel: isActiveAccident ? 1 : 2,
        hub: stats.hub,
        etaMinutes: stats.eta,
        distanceKm: stats.distance,
        priceRwf: stats.price,
        status: isActiveAccident ? IncidentStatus.Dispatched : IncidentStatus.Reported,
        timestamp: new Date().toLocaleTimeString()
      };

      setActiveIncident(newRecord);
      setIsSubmitting(false);

      if (isActiveAccident) {
        pushLog(`PRIORITY 1 ESCALATION: Secondary accident mitigation active. Standard queues bypassed!`);
        pushLog(`Broadcasting alert telemetry instantly to nearest heavy response units from ${stats.hub}...`);
      } else {
        pushLog(`Standard incident registered. Dispatched responder scheduled with ${stats.hub}.`);
      }

      // Automatically fetch AI generated checklist instructions & warnings
      triggerAutoDiagnosis(incidentType, locationName);
    }, 1200);
  };

  // Query server side Gemini API for professional diagnostic advise
  const triggerAutoDiagnosis = async (incType: IncidentType, loc: string) => {
    setIsDiagnosing(true);
    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentType: incType,
          driverName: driverName,
          locationName: loc,
          vehicleModel: vehicleModel
        })
      });
      if (response.ok) {
        const data: DiagnosticAdvice = await response.json();
        setDiagnostic(data);
        pushLog("AI diagnostic checklist generated by Gemini server successfully.");
      } else {
        throw new Error("Diagnosis retrieval failed.");
      }
    } catch (err) {
      console.error(err);
      pushLog("Satellite diagnostic failure. Fallback offline manuals deployed.");
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Action to generate breakdown visual via server side Gemini Imaging engine
  const handleGenerateAIImage = async (promptText: string) => {
    if (!promptText.trim()) return;
    setIsGeneratingImage(true);
    setImageIsDemo(false);
    pushLog(`Submitting vehicle breakdown query to Gemini prompt engine...`);

    try {
      const response = await fetch("/api/generate-breakdown-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptInput: promptText })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.demo) {
          // Fallback illustration mode
          setImageIsDemo(true);
          setImageRefinedPrompt(data.refinedPrompt);
          setGeneratedImage(null);
          pushLog("No custom API Key provided. Rendering blueprint breakdown mock diagnostics.");
        } else {
          setGeneratedImage(data.imageUrl);
          setImageRefinedPrompt(data.refinedPrompt);
          setImageIsDemo(false);
          pushLog("Photorealistic vehicular incident imagery loaded onto console.");
        }
      } else {
        const errData = await response.json();
        throw new Error(errData.details || "API server rejection.");
      }
    } catch (error: any) {
      console.error(error);
      pushLog(`Visual rendering error: ${error.message || "Failed to communicate with image model"}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Set default initial incident on load so app isn't blank and has amazing demo data
  useEffect(() => {
    // Bootstrapping initial incident state for demonstration
    const stats = calculateRescueDetails(latitude, longitude, true);
    setActiveIncident({
      id: "MUPENZI-SOS-9214",
      driverName: "Jean Claude Uwimana",
      phone: "+250 788 123 456",
      vehicleModel: "Toyota RAV4 (Dark Slate Grey)",
      vehiclePlate: "RAD 412 M",
      locationName: "RN2 Highroad, close to Musanze bypass",
      latitude: -1.5032,
      longitude: 29.6350,
      incidentType: IncidentType.Mechanical,
      isActiveAccident: true,
      priorityLevel: 1,
      hub: DispatchHub.Musanze,
      etaMinutes: stats.eta,
      distanceKm: stats.distance,
      priceRwf: stats.price,
      status: IncidentStatus.EnRoute,
      timestamp: new Date().toLocaleTimeString()
    });

    triggerAutoDiagnosis(IncidentType.Mechanical, "RN2 Highroad, close to Musanze bypass");
  }, []);

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-900" id="mupenzi-app-root">
      
      {/* Top authoritative dispatch header */}
      <Header />

      {/* Main Command Console Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6" id="mupenzi-command-board">
        
        {/* Left Side: Stranded Driver Intake Data Matrix Form (Spans 4 Columns on XL, 6 on LG) */}
        <section className="col-span-1 lg:col-span-6 xl:col-span-4 flex flex-col gap-6" id="intake-panel-box">
          <div className="bg-[#111111] border border-neutral-800 rounded-lg p-5 shadow-2xl flex flex-col relative overflow-hidden">
            {/* Top high visibility glowing corner accent */}
            <div className="absolute top-0 right-0 h-1 w-24 bg-gradient-to-l from-amber-500 to-transparent"></div>
            
            <div className="mb-4">
              <span className="text-[10px] bg-amber-500/10 text-amber-500 font-mono tracking-widest uppercase border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                INCIDENT COMMAND STATION
              </span>
              <h2 className="text-lg font-bold text-neutral-50 tracking-tight mt-2 flex items-center gap-1.5">
                Stranded Anywhere in Rwanda?
              </h2>
              <p className="text-xs text-neutral-400 mt-1 font-sans">
                Instant, 24/7 roadside assistance, mechanical rescue, and heavy towing. Share your location, report your incident, and track our expert team in real-time.
              </p>
            </div>

            <form onSubmit={handleInitiateRescue} className="space-y-4 text-xs font-sans">
              
              {/* Driver Identity Block */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest font-mono">Driver Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-[#222222] border border-neutral-800 focus:border-amber-500 focus:outline-none rounded p-2.5 text-neutral-50 font-medium pl-8 transition-colors"
                      placeholder="e.g. Jean Claude"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                    />
                    <User className="absolute left-2.5 top-3 h-3.5 w-3.5 text-neutral-500" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest font-mono">Active Hotline Phone</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-[#222222] border border-neutral-800 focus:border-amber-500 focus:outline-none rounded p-2.5 text-neutral-50 font-medium pl-8 transition-colors"
                      placeholder="+250 788 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Smartphone className="absolute left-2.5 top-3 h-3.5 w-3.5 text-neutral-500" />
                  </div>
                </div>
              </div>

              {/* Vehicle Characteristics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest font-mono">Vehicle Model / Color</label>
                  <input
                    type="text"
                    className="w-full bg-[#222222] border border-neutral-800 focus:border-amber-500 focus:outline-none rounded p-2.5 text-neutral-50 font-medium transition-colors"
                    placeholder="e.g. Toyota Hilux (White)"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest font-mono">License Plate Number</label>
                  <input
                    type="text"
                    className="w-full bg-[#222222] border border-neutral-800 focus:border-amber-500 focus:outline-none rounded p-2.5 text-neutral-50 font-mono font-medium tracking-wider uppercase transition-colors"
                    placeholder="e.g. RAE 123 A"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                  />
                </div>
              </div>

              {/* Incident Type Select Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest font-mono">What Happened / Incident Type</label>
                <select
                  className="w-full bg-[#222222] border border-neutral-800 focus:border-amber-500 focus:outline-none rounded p-2.5 text-neutral-100 font-medium transition-colors cursor-pointer"
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                >
                  <option value={IncidentType.EngineFailure}>{IncidentType.EngineFailure}</option>
                  <option value={IncidentType.FlatTire}>{IncidentType.FlatTire}</option>
                  <option value={IncidentType.Electrical}>{IncidentType.Electrical}</option>
                  <option value={IncidentType.OutOfFuel}>{IncidentType.OutOfFuel}</option>
                  <option value={IncidentType.Mechanical}>{IncidentType.Mechanical}</option>
                  <option value={IncidentType.OtherDamage}>{IncidentType.OtherDamage}</option>
                </select>
              </div>

              {/* Geolocation Input + Auto-detect */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest font-mono">Live Coordinates / Location</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-grow bg-[#222222] border border-neutral-800 focus:border-amber-500 focus:outline-none rounded p-2.5 text-neutral-50 font-medium placeholder-neutral-600 transition-colors text-xs"
                    placeholder="Describe highway landmark or zone"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleGPSAutoDetect}
                    disabled={isLocating}
                    className="bg-[#2a2a2a] hover:bg-[#333333] active:bg-[#444] disabled:opacity-50 border border-neutral-800 text-amber-500 hover:text-amber-400 font-bold px-3 rounded flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                    title="Auto-detect coordinates instantly via browser GPS"
                    id="gps-calibration-trigger"
                  >
                    <MapPin className={`h-4 w-4 ${isLocating ? "animate-bounce" : ""}`} />
                    <span className="font-mono text-[9px] tracking-tight uppercase">
                      {isLocating ? "SYNCING..." : "LIVE GPS"}
                    </span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-neutral-500 bg-neutral-950 p-2 rounded border border-neutral-800/40">
                  <div>LAT: <span className="text-neutral-300 font-bold">{latitude.toFixed(6)}</span></div>
                  <div>LNG: <span className="text-neutral-300 font-bold">{longitude.toFixed(6)}</span></div>
                </div>
              </div>

              {/* Strict Active Accident Safety Toggle */}
              <div className="bg-[#1e1c1b] border border-red-950 p-3.5 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-rose-500 font-bold tracking-widest font-mono uppercase flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                    ACTIVE ACCIDENT CHECK
                  </span>
                  <p className="text-[10px] text-neutral-400 font-sans leading-tight">
                    Is there an active accident, or has any secondary road collision occurred?
                  </p>
                </div>

                <div className="flex gap-1.5 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsActiveAccident(true)}
                    className={`flex-1 sm:flex-none uppercase text-[10px] font-bold py-1.5 px-4 rounded border transition-all duration-200 cursor-pointer text-center ${
                      isActiveAccident 
                        ? "bg-[#E63946] border-[#E63946] text-white shadow-[0_0_15px_rgba(230,57,70,0.4)]" 
                        : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-900"
                    }`}
                    id="accident-yes-toggle"
                  >
                    YES [PRIORITY 1]
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsActiveAccident(false)}
                    className={`flex-1 sm:flex-none uppercase text-[10px] font-bold py-1.5 px-4 rounded border transition-all duration-200 cursor-pointer text-center ${
                      !isActiveAccident 
                        ? "bg-amber-500 border-amber-500 text-neutral-900 shadow-[0_0_15px_rgba(255,183,3,0.3)] font-black" 
                        : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-900"
                    }`}
                    id="accident-no-toggle"
                  >
                    NO [STANDARD]
                  </button>
                </div>
              </div>

              {/* Submit Dispatch CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-center uppercase tracking-widest text-xs font-black py-3.5 px-4 rounded transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                  isActiveAccident
                    ? "bg-[#E63946] hover:bg-rose-600 text-neutral-50 shadow-[0_4px_20px_rgba(230,57,70,0.4)] border border-rose-400/20"
                    : "bg-amber-500 hover:bg-amber-600 text-neutral-950 shadow-[0_4px_20px_rgba(255,183,3,0.3)]"
                }`}
                id="dispatch-triage-trigger"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-current" />
                    <span>Transmitting SOS Telemetry...</span>
                  </>
                ) : (
                  <>
                    <Truck className="h-4 w-4" />
                    <span>Initiate Emergency Rescue Dispatch</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Core System Live Event Telemetry Logs */}
          <div className="bg-[#111111] border border-neutral-800 rounded-lg p-4 font-mono text-[10px] text-neutral-400" id="live-packet-telemetry-logs">
            <h4 className="text-[11px] font-bold text-neutral-300 uppercase tracking-widest border-b border-neutral-800 pb-2 mb-2 flex justify-between items-center">
              <span>Telemetry Packet Logs</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            </h4>
            <div className="space-y-1.5 select-none max-h-36 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className={`flex items-start gap-1 p-1 rounded ${i === 0 ? "bg-neutral-950 text-amber-500 font-bold border-l-2 border-amber-500" : ""}`}>
                  <span className="text-neutral-600 text-[8px] mt-0.5">&gt;</span>
                  <span className="break-all">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Repeating Rescue Animation Loop: Placed right next to the Emergency Incident Form */}
        <section className="col-span-1 lg:col-span-6 xl:col-span-3 flex flex-col gap-6" id="rescue-animation-box">
          <RescueAnimationLoop />
        </section>

        {/* Right Side: Emergency Triage Status, Custom Rwanda Map, AI Diagnosis & AI Imager (Spans 5 Columns on XL, 12 on LG) */}
        <section className="col-span-1 lg:col-span-12 xl:col-span-5 flex flex-col gap-6" id="dashboard-visuals-panel">
          
          {/* Active Accident Priority Banner (Mitigation Alert) */}
          {activeIncident && activeIncident.isActiveAccident && (
            <div className="bg-gradient-to-r from-red-600/30 to-rose-600/10 border-l-4 border-red-500 p-4 rounded-r-lg shadow-lg flex items-start gap-3 relative overflow-hidden" id="accident-flash">
              <div className="absolute top-0 right-0 py-1 px-3 bg-red-600 text-white font-mono text-[8px] font-bold tracking-widest uppercase">
                EMERGENCY PRIORITY LEVEL 1
              </div>
              <div className="bg-red-600 text-white rounded p-1.5 shrink-0 mt-0.5 animate-pulse">
                <AlertOctagon className="h-5 w-5" />
              </div>
              <div className="space-y-1 pr-12">
                <h3 className="text-sm font-extrabold tracking-tight text-white uppercase">
                  Active Secondary Road Collision Alarm Active
                </h3>
                <p className="text-xs text-neutral-300">
                  Standard queue constraints bypassed. The regional emergency responders are routed under immediate blue lamp priority. Dynamic packet broadcast sent to closest heavy towing units.
                </p>
                <div className="pt-2 flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                    RE-ROUTING PIPELINE CONNECTED DIRECT TO RESCUE UNIT
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Tactical Map & Tracker Component */}
          <TacticalMap 
            activeIncident={activeIncident} 
            onSelectPresetsLocation={handlePresetMapCalibration} 
          />

          {/* Incident Status Overlay Block for Active Mission */}
          {activeIncident && (
            <div className="bg-[#111111] border border-neutral-800 rounded-lg p-5 shadow-2xl relative" id="rescue-mission-status-card">
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-mono text-[9px]">
                <Clock className="w-3 h-3 animate-spin" />
                <span>MISSION: {activeIncident.id}</span>
              </div>
              
              <h3 className="text-xs uppercase font-mono tracking-widest text-neutral-400 mb-4 font-bold border-b border-neutral-800 pb-2">
                Active Rescue Dispatch Pipeline
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Visual Mission Data 1 */}
                <div className="bg-neutral-950 p-3 rounded border border-neutral-800">
                  <span className="block text-[9px] text-neutral-500 uppercase font-mono">Stranded Driver</span>
                  <span className="text-white text-sm font-extrabold block truncate mt-1">
                    {activeIncident.driverName}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                    {activeIncident.vehiclePlate} ({activeIncident.vehicleModel.split(" ")[0]})
                  </span>
                </div>

                {/* Visual Mission Data 2 */}
                <div className="bg-neutral-950 p-3 rounded border border-neutral-800">
                  <span className="block text-[9px] text-neutral-500 uppercase font-mono">SATELLITE DISTANCE & HUB</span>
                  <span className="text-amber-500 text-sm font-extrabold block mt-1">
                    {activeIncident.distanceKm} KM
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                    closest: {activeIncident.hub}
                  </span>
                </div>

                {/* Visual Mission Data 3 */}
                <div className="bg-neutral-950 p-3 rounded border border-neutral-800">
                  <span className="block text-[9px] text-neutral-500 uppercase font-mono">CALCULATED RESCUE PRICE</span>
                  <span className="text-emerald-400 text-sm font-extrabold block mt-1">
                    RWF {activeIncident.priceRwf.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-sans block mt-0.5">
                    Exempted under Shield Pro
                  </span>
                </div>
              </div>

              {/* Dynamic Mission Progression Roadmap */}
              <div className="mt-5 pt-4 border-t border-neutral-800/80">
                <span className="text-[9px] uppercase font-mono tracking-widest text-neutral-500 block mb-3">Rescue Flow Milestones</span>
                <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-[8px] tracking-tight relative">
                  
                  <div className={`p-2 rounded border uppercase font-bold transition-all ${
                    activeIncident.status === IncidentStatus.Reported 
                      ? "bg-amber-500 border-amber-500 text-neutral-950 font-black animate-pulse" 
                      : "bg-[#222] border-neutral-800 text-neutral-500"
                  }`}>
                    Reported
                  </div>

                  <div className={`p-2 rounded border uppercase font-bold transition-all ${
                    activeIncident.status === IncidentStatus.Dispatched 
                      ? "bg-[#E63946] border-[#E63946] text-white font-black animate-pulse" 
                      : "bg-[#222] border-neutral-800 text-neutral-500"
                  }`}>
                    Dispatched
                  </div>

                  <div className={`p-2 rounded border uppercase font-bold transition-all ${
                    activeIncident.status === IncidentStatus.EnRoute 
                      ? "bg-amber-400 border-amber-400 text-neutral-950 font-black animate-pulse" 
                      : "bg-[#222] border-neutral-800 text-[#777]"
                  }`}>
                    En-Route
                  </div>

                  <div className={`p-2 rounded border uppercase font-bold transition-all ${
                    activeIncident.status === IncidentStatus.Arrived 
                      ? "bg-emerald-500 border-emerald-400 text-neutral-950 font-black" 
                      : "bg-[#222] border-neutral-800 text-[#555]"
                  }`}>
                    On Site
                  </div>

                  <button
                    onClick={() => {
                      setActiveIncident(prev => prev ? { ...prev, status: IncidentStatus.Resolved } : null);
                      pushLog("Incident resolution milestone validated. Towing / mechanical fix cleared.");
                    }}
                    className={`p-2 rounded border uppercase font-bold transition-all cursor-pointer ${
                      activeIncident.status === IncidentStatus.Resolved 
                        ? "bg-emerald-600 border-emerald-500 text-white font-extrabold" 
                        : "bg-neutral-950 border-neutral-800 text-neutral-500 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    RESOLVE
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Real-Time AI Diagnostics Console (Gemini response) */}
          <div className="bg-[#111111] border border-neutral-800 rounded-lg p-5 shadow-2xl relative" id="digital-diagnostics-checklists">
            <h3 className="text-xs uppercase font-mono tracking-widest text-neutral-400 mb-3 font-bold flex items-center gap-1.5 border-b border-neutral-800 pb-2">
              <Sparkles className="h-4 w-4 text-amber-500 animate-spin-slow" />
              Emergency Response Advisory Console (AI Assisted)
            </h3>

            {isDiagnosing ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-neutral-400 font-mono text-xs">
                <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
                <span>Generating tailored tactical instructions via Gemini...</span>
              </div>
            ) : diagnostic ? (
              <div className="space-y-4">
                <div className="bg-neutral-950/80 p-3.5 rounded border border-neutral-800 text-xs">
                  <span className="text-[10px] text-amber-500 font-mono tracking-widest uppercase block mb-1">DISPATCHER COMMENTARY</span>
                  <p className="text-neutral-300 italic font-sans leading-relaxed">
                    "{diagnostic.aiCommentary}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase font-bold block mb-2">
                      Immediate Action Steps List
                    </span>
                    <ul className="space-y-2 text-xs">
                      {diagnostic.checklists.map((step, idx) => (
                        <li key={idx} className="flex gap-2 text-neutral-300">
                          <span className="text-amber-500 font-mono font-bold font-semibold shrink-0">{idx + 1}.</span>
                          <span className="font-sans leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] text-rose-500 font-mono tracking-widest uppercase font-bold block mb-2">
                      Rwanda Road Safety Directives
                    </span>
                    <ul className="space-y-2 text-xs">
                      {diagnostic.safetyFirst.map((warn, idx) => (
                        <li key={idx} className="flex gap-2 text-neutral-300">
                          <span className="text-[#E63946] shrink-0 font-bold">⚠️</span>
                          <span className="font-sans leading-relaxed">{warn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-neutral-500 text-xs italic py-4 text-center font-sans">
                Submit an incident intake report to generate a tailored immediate roadside diagnostics advisory.
              </p>
            )}
          </div>

          {/* 100% Vehicle Breakdown AI Imaging Prompt Engine Component */}
          <div className="bg-[#111111] border border-neutral-800 rounded-lg p-5 shadow-2xl flex flex-col gap-4" id="ai-breakdown-imaging-console">
            
            <div className="border-b border-neutral-800 pb-3">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Video className="h-4.5 w-4.5 text-amber-500" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-100">
                      Breakdown Scene AI Imaging Console
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-sans">
                      Realistic AI imagery of Rwanda mechanical roadside incidents — no tropical or aesthetic landscapes.
                    </p>
                  </div>
                </div>
                
                <span className="text-[9px] font-mono bg-neutral-950 border border-neutral-800/80 px-2 py-0.5 rounded text-neutral-400">
                  MODEL: gemini-2.5-flash-image
                </span>
              </div>
            </div>

            {/* Warning on limits / configuration info */}
            <div className="text-[10px] bg-neutral-950/60 p-2 text-neutral-500 border border-neutral-800/50 rounded flex gap-2">
              <Info className="h-4 w-4 text-amber-500 shrink-0" />
              <span>
                These high-definition presets are calibrated for vehicular breakdowns under nighttime, raining, and mountain roadway parameters. Input custom descriptions to query real-time vehicle diagnostics visual rendering.
              </span>
            </div>

            {/* Clickable Preset Quick Tags */}
            <div>
              <span className="text-[9px] uppercase tracking-wider font-mono text-neutral-500 block mb-2">Click incident calibration presets:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {IMAGE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCustomPrompt(preset.query);
                      handleGenerateAIImage(preset.query);
                    }}
                    className="p-2.5 rounded text-left bg-neutral-950 font-mono hover:bg-neutral-900 border border-neutral-800/80 hover:border-amber-500/30 transition-all select-none cursor-pointer group"
                  >
                    <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1.5 leading-none">
                      <Sparkles className="h-3 w-3" />
                      {preset.title}
                    </span>
                    <span className="text-[8.5px] text-neutral-400 font-sans mt-1 group-hover:text-neutral-200 block truncate">
                      {preset.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Manual Prompt Console */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest font-mono">Custom Breakdown Prompt Formulation</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-grow bg-[#222222] border border-neutral-800 focus:border-amber-500 focus:outline-none rounded p-2.5 text-neutral-50 font-mono text-xs"
                  placeholder="e.g. Mercedes breakdown under heavy midnight mist in Kigali..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleGenerateAIImage(customPrompt)}
                  disabled={isGeneratingImage || !customPrompt.trim()}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-black px-4 rounded text-xs leading-none shrink-0 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isGeneratingImage ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "GENERATE"}
                </button>
              </div>
            </div>

            {/* Dynamic AI Output Display Panel */}
            <div className="bg-neutral-950 rounded border border-neutral-800 p-3 min-h-[160px] flex flex-col items-center justify-center relative overflow-hidden">
              {isGeneratingImage ? (
                <div className="flex flex-col items-center justify-center gap-3 text-neutral-400 font-mono text-xs z-10 py-12">
                  <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
                  <span className="text-center px-6">
                    Mupenzi Imaging Engine parsing breakdown coordinates and weathering configurations...
                  </span>
                </div>
              ) : generatedImage ? (
                // Real generated photo
                <div className="w-full flex flex-col gap-2 z-10">
                  <div className="relative rounded overflow-hidden border border-neutral-800 aspect-video">
                    <img src={generatedImage} alt="Mupenzi AI Incident Visualization" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-[#111] p-2 rounded border border-neutral-800/60 font-mono text-[9px] text-neutral-400">
                    <span className="text-amber-500 font-bold block">REFINED SATELLITE INPUT PROMPT:</span>
                    <span className="italic">"{imageRefinedPrompt}"</span>
                  </div>
                </div>
              ) : imageIsDemo ? (
                // Demonstration mode layout (Aesthetic blueprint visual container)
                <div className="w-full flex flex-col gap-2 z-10 p-3">
                  <div className="bg-gradient-to-br from-neutral-900 to-black rounded border border-dashed border-amber-500/30 p-5 flex flex-col items-center text-center relative overflow-hidden min-h-[160px] justify-center">
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffb703_1px,transparent_1px)] [background-size:12px_12px]"></div>
                    <div className="bg-amber-500/10 p-2.5 rounded-full border border-amber-500/30 mb-2">
                      <Truck className="h-6 w-6 text-amber-500 animate-pulse" />
                    </div>
                    <span className="font-mono text-[11px] font-bold tracking-widest text-[#FFB703] uppercase">
                      DIAGNOSTIC BLUEPRINT MODEL COMPILED
                    </span>
                    <p className="text-[10px] text-neutral-400 font-sans mt-2 max-w-md">
                      Mupenzi AI system analyzed the scenario parameters successfully. Refined photorealistic training preset is prepared for delivery.
                    </p>
                    <span className="text-[8.5px] mt-2 font-mono text-rose-400/80 bg-rose-500/5 py-1 px-2 rounded border border-rose-500/10">
                      GEMINI_API_KEY NOT DETECTED • LIVE RENDERING REPLACED WITH STATIC SCHEMATIC PRESETS
                    </span>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 p-2 rounded font-mono text-[9px] text-neutral-400">
                    <span className="text-amber-500 font-bold block">REFINED VEHICLE BREAKDOWN PROMPT:</span>
                    <span className="italic">"{imageRefinedPrompt}"</span>
                  </div>
                </div>
              ) : (
                // Empty state on load
                <div className="flex flex-col items-center text-center text-neutral-500 text-xs py-8 font-sans">
                  <HelpCircle className="h-8 w-8 text-neutral-700 mb-2" />
                  <span>Interactive Scene Visualizer Standby.</span>
                  <span className="text-[10px] text-neutral-600 font-mono mt-1">
                    Select a preset or input your diagnostic specifications to generate image layers.
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

      </main>

      {/* Pricing & Protection Subscriptions Panel (Bottom) */}
      <section className="bg-[#111111] border-t border-neutral-800 py-10 text-white mt-12" id="pricing-shield-sub">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded font-bold uppercase">
              PRICING & PROTECTION SUBSCRIPTIONS
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white mt-3">
              Mupenzi Roadside Shield Plans
            </h2>
            <p className="text-sm text-neutral-400 mt-1.5 max-w-xl mx-auto font-sans">
              Protect your personal vehicle or fleet nationwide across Rwanda. Ensure zero emergency tow dispatch fees and rapid priority arrival times.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <div 
                key={tier.id} 
                className={`border rounded-lg p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] ${tier.color}`}
              >
                <div>
                  <h3 className="text-sm uppercase font-extrabold tracking-widest font-mono text-white mb-2">
                    {tier.name}
                  </h3>
                  
                  {/* Price Banner */}
                  <div className="my-4">
                    <span className="text-3xl font-black font-sans text-[#FFB703]">
                      {tier.price}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono block mt-1 uppercase tracking-wide">
                      {tier.billing}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-2 mt-4 text-xs font-sans text-neutral-300">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button 
                    type="button" 
                    onClick={() => {
                      pushLog(`Subscription action: selected plan ${tier.name}`);
                      alert(`Thank you for selecting ${tier.name}! Our premium breakdown specialists are calibrating your protection profile.`);
                    }}
                    className={`w-full text-center uppercase tracking-wider text-[11px] font-black py-3 rounded cursor-pointer transition-all ${
                      tier.id === "shield-pro" 
                        ? "bg-amber-500 text-neutral-900 hover:bg-amber-600 hover:shadow-[0_0_15px_rgba(255,183,3,0.3)]" 
                        : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                    }`}
                  >
                    Select Plan Security
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer system details */}
      <footer className="bg-neutral-950 border-t border-neutral-900 py-6 text-center text-xs font-mono text-neutral-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span>© 2026 MUPENZI BREAKDOWN • KIGALI COMMAND CENTER • RWANDA</span>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 hover:text-neutral-400 select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              SECURE RADAR FEED
            </span>
            <span>SYSTEM_ALPHA // PROVINCIAL_CHANNELS</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
