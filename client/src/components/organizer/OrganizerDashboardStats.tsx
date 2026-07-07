import React from 'react';

const OrganizerDashboardStats = ({
  activeExpeditionsCount,
  fieldPersonnelCount,
  pendingBookingsCount,
  emergencyAlertsCount,
  setActiveView
}: any) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Section */}
      <div
        className="relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl min-h-[200px] flex items-center p-6 md:p-8 bg-cover bg-center select-none"
        style={{ backgroundImage: "url('/lake_mountain_hero.png')" }}
      >
        <div className="absolute inset-0 bg-[#070708]/85 md:bg-gradient-to-r md:from-[#070708] md:via-[#070708]/80 md:to-transparent z-0" />
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-amber-500 uppercase tracking-widest font-black font-mono">System Online - Active Status</span>
          </div>
          <h1 className="font-outfit text-2.5xl md:text-3.5xl font-black uppercase text-white tracking-tight leading-none">
            Welcome back, Command
          </h1>
          <p className="text-[11px] md:text-xs text-gray-400 font-light mt-2.5 leading-relaxed max-w-lg">
            Network integrity is at 98.4%. All mission channels are active with 1 priority alert requiring your attention in the Western Ridge sector.
          </p>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        {/* Active Expeditions */}
        <div className="bg-[#121317]/85 border border-white/5 rounded-2xl p-4.5 hover:border-white/10 transition duration-300 shadow-xl flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Active Expeditions</span>
            <span className="text-[8px] bg-orange-500/10 text-orange-500 font-extrabold px-1.5 py-0.5 rounded tracking-wider">+2 this week</span>
          </div>
          <span className="font-outfit text-3.5xl font-black text-white leading-none mt-3">{activeExpeditionsCount}</span>
        </div>

        {/* Field Personnel */}
        <div className="bg-[#121317]/85 border border-white/5 rounded-2xl p-4.5 hover:border-white/10 transition duration-300 shadow-xl flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Field Personnel</span>
            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded tracking-wider">Stable</span>
          </div>
          <span className="font-outfit text-3.5xl font-black text-white leading-none mt-3">{fieldPersonnelCount}</span>
        </div>

        {/* Pending Bookings */}
        <div className="bg-[#121317]/85 border border-white/5 rounded-2xl p-4.5 hover:border-white/10 transition duration-300 shadow-xl flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Pending Bookings</span>
            <span className="text-[8px] bg-blue-500/10 text-blue-400 font-extrabold px-1.5 py-0.5 rounded tracking-wider">Processing</span>
          </div>
          <span className="font-outfit text-3.5xl font-black text-white leading-none mt-3">{pendingBookingsCount}</span>
        </div>

        {/* Emergency Alerts */}
        <div className="bg-[#1b1213]/85 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.04)] rounded-2xl p-4.5 hover:border-red-500/50 transition duration-300 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[8px] text-red-400 uppercase font-black tracking-widest">Emergency Alerts</span>
            <span className="text-[8px] bg-red-500/20 text-red-400 font-black px-1.5 py-0.5 rounded tracking-wider uppercase">Critical</span>
          </div>
          <span className="font-outfit text-3.5xl font-black text-red-500 leading-none mt-3">{emergencyAlertsCount}</span>
        </div>
      </div>

      {/* Main Stats Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart Box */}
        <div className="xl:col-span-2 bg-[#0c0c0e] border border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col justify-between min-h-[350px]">
          <div className="flex justify-between items-center select-none mb-4">
            <div>
              <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block font-mono">Finances</span>
              <h3 className="font-outfit text-md font-bold text-white uppercase mt-0.5">Revenue Performance</h3>
            </div>
            <select className="bg-white/5 border border-white/10 text-gray-400 text-[10px] px-2.5 py-1 rounded-md outline-none cursor-pointer hover:border-white/20 transition font-bold">
              <option value="month" className="bg-[#0c0c0e]">Current Month</option>
              <option value="prev" className="bg-[#0c0c0e]">Previous Month</option>
              <option value="quarter" className="bg-[#0c0c0e]">Year to Date</option>
            </select>
          </div>

          <div className="flex-1 flex flex-col justify-end mt-2">
            <div className="relative w-full flex-grow flex flex-col justify-between text-[8px] text-gray-600 font-mono select-none h-40 pb-2 border-b border-white/10">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-white/[0.03] w-full" />
                <div className="border-t border-white/[0.03] w-full" />
                <div className="border-t border-white/[0.03] w-full" />
                <div className="border-t border-white/[0.03] w-full" />
              </div>
              <div className="absolute inset-x-8 bottom-0 top-2 flex items-end justify-between px-2">
                <div className="flex flex-col items-center group w-9"><div className="w-5 bg-white/10 group-hover:bg-white/20 rounded-t transition-all duration-500" style={{ height: '30%' }} /></div>
                <div className="flex flex-col items-center group w-9"><div className="w-5 bg-white/10 group-hover:bg-white/20 rounded-t transition-all duration-500" style={{ height: '42%' }} /></div>
                <div className="flex flex-col items-center group w-9"><div className="w-5 bg-white/10 group-hover:bg-white/20 rounded-t transition-all duration-500" style={{ height: '35%' }} /></div>
                <div className="flex flex-col items-center group w-9"><div className="w-5 bg-white/10 group-hover:bg-white/20 rounded-t transition-all duration-500" style={{ height: '55%' }} /></div>
                <div className="flex flex-col items-center group w-9 relative">
                  <div className="absolute -top-7 z-10 bg-orange-500 text-black text-[9px] font-black font-mono px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(249,115,22,0.3)] animate-bounce select-none">$42k</div>
                  <div className="w-5 bg-orange-500 rounded-t transition-all duration-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]" style={{ height: '88%' }} />
                </div>
                <div className="flex flex-col items-center group w-9"><div className="w-5 bg-white/10 group-hover:bg-white/20 rounded-t transition-all duration-500" style={{ height: '62%' }} /></div>
                <div className="flex flex-col items-center group w-9"><div className="w-5 bg-white/10 group-hover:bg-white/20 rounded-t transition-all duration-500" style={{ height: '78%' }} /></div>
                <div className="flex flex-col items-center group w-9"><div className="w-5 bg-white/10 group-hover:bg-white/20 rounded-t transition-all duration-500" style={{ height: '50%' }} /></div>
              </div>
            </div>
            <div className="flex justify-between px-10 text-[9px] font-mono text-gray-500 font-bold select-none pt-2">
              <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span className="text-orange-500 font-extrabold">W5</span><span>W6</span><span>W7</span><span>W8</span>
            </div>
          </div>
        </div>

        {/* Active Missions Box */}
        <div className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col justify-between min-h-[350px]">
          <div className="select-none mb-4">
            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block">Expedition Status</span>
            <h3 className="font-outfit text-md font-bold text-white uppercase mt-0.5">Active Missions</h3>
          </div>
          <div className="flex-1 space-y-4">
            <div className="space-y-1.5 group">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-200 group-hover:text-orange-400 transition-colors">Munnar Sky Trek</span>
                <span className="text-[10px] text-gray-500 font-bold font-mono">12 Pax</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(249,115,22,0.3)]" style={{ width: '75%' }} />
              </div>
              <div className="flex justify-end"><span className="text-[8px] text-gray-500 font-bold font-mono">75% Complete</span></div>
            </div>
            <div className="space-y-1.5 group">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-200 group-hover:text-orange-400 transition-colors">Zanskar Ice Path</span>
                <span className="text-[10px] text-gray-500 font-bold font-mono">4 Pax</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white/20 rounded-full transition-all duration-1000" style={{ width: '30%' }} />
              </div>
              <div className="flex justify-between text-[8px] font-bold text-gray-500">
                <span className="text-emerald-500 font-black">Ascent Phase</span><span className="font-mono">30%</span>
              </div>
            </div>
            <div className="space-y-1.5 group">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-200 group-hover:text-orange-400 transition-colors">Nilgiri Ridge</span>
                <span className="text-[10px] text-gray-500 font-bold font-mono">18 Pax</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(249,115,22,0.3)]" style={{ width: '90%' }} />
              </div>
              <div className="flex justify-between text-[8px] font-bold text-gray-500">
                <span className="text-orange-400 font-black">Final Descent</span><span className="font-mono">90%</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveView('manage-trips')}
            className="w-full mt-4 py-2 border border-white/10 hover:border-orange-500/30 hover:bg-orange-500/[0.02] text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:text-white rounded-xl transition active:scale-95 cursor-pointer"
          >
            View All Missions
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboardStats;
