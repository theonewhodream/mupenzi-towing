import { PhoneCall, Truck, ShieldAlert, Activity } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-neutral-900 border-b border-amber-500/20 text-white shadow-xl sticky top-0 z-40" id="mupenzi-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Brand Group */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2.5 rounded text-neutral-900 shadow-[0_0_15px_rgba(255,183,3,0.3)] animate-pulse">
            <Truck className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-50 flex items-center gap-2">
              MUPENZI <span className="text-amber-500 font-extrabold tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded text-xs border border-amber-500/20 shadow-inner">BREAKDOWN</span>
            </h1>
            <p className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
              Rwanda Rapid Roadside Response
            </p>
          </div>
        </div>

        {/* Tactical Status Alerts */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden md:flex flex-col items-end border-r border-neutral-800 pr-4">
            <span className="text-[10px] text-neutral-400">ACTIVE DISPATCH CENTRAL</span>
            <span className="text-white font-semibold flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              KIGALI COMMAND ONLINE
            </span>
          </div>

          <div className="hidden lg:flex flex-col items-end border-r border-neutral-800 pr-4">
            <span className="text-[10px] text-neutral-400">PROVINCIAL CHANNELS</span>
            <span className="text-emerald-400 font-semibold uppercase">North, West, East Sync</span>
          </div>

          {/* Hotline CTA */}
          <a
            href="tel:+25078000000"
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded transition-all duration-200 border border-rose-400/30 shadow-[0_4px_10px_rgba(230,57,70,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            id="emergency-hotline"
          >
            <ShieldAlert className="h-4 w-4 animate-bounce text-yellow-200" />
            <span className="text-neutral-50 tracking-wider">SOS: +250 788 MUPENZI</span>
          </a>
        </div>
      </div>
    </header>
  );
}
