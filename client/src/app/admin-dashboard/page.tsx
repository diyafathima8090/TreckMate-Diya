'use client';
import { SuperAdminRoute } from '../../components/RouteGuard';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from '../../components/RouterCompatibility';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { getAllTreks } from '../../services/trekStorage';

const AdminDashboard = () => {
  const { sessions, logout } = useAuth();
  const user = sessions.admin;
  const navigate = useNavigate();

  
  const [activeView, setActiveView] = useState(() => {
    return sessionStorage.getItem('trekmate_admin_view') || 'overview';
  });

  useEffect(() => {
    sessionStorage.setItem('trekmate_admin_view', activeView);
  }, [activeView]);

  
  const [stats, setStats] = useState({
    totalPlatformTreks: 0,
    totalPlatformRevenue: 0,
    activeOrganizers: 0,
    totalUsers: 0
  });

  
  const [emergencyAlerts, setEmergencyAlerts] = useState(0);
  const [telemetryLogs, setTelemetryLogs] = useState([
    'SYSTEM: Initializing global telemetry...',
    'SYSTEM: Awaiting platform event stream...'
  ]);

  const socketRef = useRef(null);

  
  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        const allTreks = await getAllTreks();
        const treksArray = Object.values(allTreks) as any[];
        
        
        
        setStats({
          totalPlatformTreks: treksArray.length,
          totalPlatformRevenue: treksArray.reduce((acc: number, t: any) => acc + (parseInt(String(t.price).replace(/[^0-9]/g, '')) || 0) * 5, 0), 
          activeOrganizers: new Set(treksArray.map(t => t.organizer)).size,
          totalUsers: 142 
        });

      } catch (err) {
        console.error("Failed to load platform data", err);
      }
    };
    fetchPlatformData();
  }, []);

  
  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    
    socketRef.current.on('connect', () => {
      
      socketRef.current.emit('join_organizer');
    });

    socketRef.current.on('sos_alert', (data) => {
      setEmergencyAlerts(prev => prev + 1);
      setTelemetryLogs(logs => [...logs.slice(-20), `GLOBAL SOS: ${data.trekName} at ${data.time} - LAT:${data.lat.toFixed(4)} LNG:${data.lng.toFixed(4)}`]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/explore');
    }
  }, [user, navigate]);

  if (!user) return null;

  const userInitials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'ADM';

  return (
    <div className="font-sans text-white bg-[#070708] h-screen flex flex-col selection:bg-purple-500 selection:text-white overflow-hidden">
      
      {}
      <header className="h-14 bg-[#0c0c0e] border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-30 select-none">
        {}
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5 text-white group">
            <div className="h-6 w-6 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <span className="font-outfit font-black tracking-widest text-md uppercase bg-gradient-to-r from-purple-400 to-gray-400 bg-clip-text text-transparent">TrekMate Admin</span>
          </Link>
        </div>

        {}
        <div className="hidden md:block text-[11px] font-bold text-purple-500/80 uppercase tracking-widest font-mono">
          {activeView.replace('-', ' ')}
        </div>

        {}
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white transition duration-200 cursor-pointer relative" title="System Alerts">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <div className="h-7 w-7 rounded-md bg-purple-600/90 hover:bg-purple-600 flex items-center justify-center font-outfit text-xs font-black text-white shadow-[0_0_10px_rgba(168,85,247,0.3)] transition duration-200 cursor-default" title={user.name}>
            {userInitials}
          </div>
        </div>
      </header>

      {}
      <div className="flex-grow flex overflow-hidden">

        {}
        <aside className="w-52 bg-[#0c0c0e] border-r border-white/5 flex flex-col justify-between shrink-0 h-full select-none z-20">
          <div className="p-3 space-y-1 overflow-y-auto flex-grow">
            
            {}
            <div className="pt-3 pb-1 px-3 text-[9px] font-black tracking-widest text-gray-600 uppercase">Platform Oversight</div>
            
            <button
              onClick={() => setActiveView('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition duration-200 border cursor-pointer ${activeView === 'overview'
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 font-black'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]'
                }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Global Overview
            </button>

            <button
              onClick={() => setActiveView('users')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition duration-200 border cursor-pointer ${activeView === 'users'
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 font-black'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]'
                }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Manage Users
            </button>

            <button
              onClick={() => setActiveView('all-trips')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition duration-200 border cursor-pointer ${activeView === 'all-trips'
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 font-black'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]'
                }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              All Expeditions
            </button>

            {}
            <div className="pt-3 pb-1 px-3 text-[9px] font-black tracking-widest text-gray-600 uppercase">System Intelligence</div>

            <button
              onClick={() => setActiveView('reports')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition duration-200 border cursor-pointer ${activeView === 'reports'
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 font-black'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]'
                }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              System Reports
            </button>
            
            <button
              onClick={() => setActiveView('system-health')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition duration-200 border cursor-pointer ${activeView === 'system-health'
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 font-black'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]'
                }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Platform Health
            </button>

          </div>

          <div className="p-3 border-t border-white/5 bg-[#09090b]">
            <button
              onClick={() => logout(user?.role || 'admin')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition cursor-pointer border-none"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </aside>

        {}
        <main className="flex-1 h-full overflow-y-auto z-10 flex flex-col justify-between relative bg-[#070708]">
          <div className="absolute top-0 right-0 h-[400px] w-[400px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none z-0" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none z-0" />

          <div className="p-6 md:p-8 relative z-10 w-full max-w-7xl mx-auto flex-grow">
            
            {activeView === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                {}
                <div
                  className="relative rounded-2xl overflow-hidden border border-white/5 shadow-[0_10px_30px_rgba(168,85,247,0.05)] min-h-[220px] flex items-center p-6 md:p-8 bg-cover bg-center select-none"
                  style={{ backgroundImage: "url('/lake_mountain_hero.png')" }}
                >
                  <div className="absolute inset-0 bg-[#070708]/90 md:bg-gradient-to-r md:from-[#070708] md:via-[#070708]/85 md:to-transparent z-0" />
                  <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] text-purple-400 uppercase tracking-widest font-black font-mono">Platform Integrity: Stable</span>
                    </div>
                    <h1 className="font-outfit text-3xl md:text-4xl font-black uppercase text-white tracking-tight leading-none mb-3">
                      Global Command Center
                    </h1>
                    <p className="text-xs text-gray-400 font-light leading-relaxed max-w-xl">
                      Monitoring all TrekMate sub-systems, organizer operations, and global user telemetry. System analytics and revenue aggregates are operating at nominal capacity.
                    </p>
                  </div>
                </div>

                {}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
                  {}
                  <div className="bg-[#100f13]/90 border border-white/5 rounded-2xl p-4.5 hover:border-purple-500/20 transition duration-300 shadow-xl flex flex-col justify-between min-h-[110px]">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Global Revenue</span>
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded tracking-wider">Estimated</span>
                    </div>
                    <span className="font-outfit text-3xl font-black text-white leading-none mt-3">₹{(stats.totalPlatformRevenue / 1000).toFixed(1)}k</span>
                  </div>

                  {}
                  <div className="bg-[#100f13]/90 border border-white/5 rounded-2xl p-4.5 hover:border-purple-500/20 transition duration-300 shadow-xl flex flex-col justify-between min-h-[110px]">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Active Organizers</span>
                      <span className="text-[8px] bg-blue-500/10 text-blue-400 font-extrabold px-1.5 py-0.5 rounded tracking-wider">Verified</span>
                    </div>
                    <span className="font-outfit text-3xl font-black text-white leading-none mt-3">{stats.activeOrganizers}</span>
                  </div>

                  {}
                  <div className="bg-[#100f13]/90 border border-white/5 rounded-2xl p-4.5 hover:border-purple-500/20 transition duration-300 shadow-xl flex flex-col justify-between min-h-[110px]">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Total Expeditions</span>
                      <span className="text-[8px] bg-purple-500/10 text-purple-400 font-extrabold px-1.5 py-0.5 rounded tracking-wider">Live</span>
                    </div>
                    <span className="font-outfit text-3xl font-black text-white leading-none mt-3">{stats.totalPlatformTreks}</span>
                  </div>

                  {}
                  <div className="bg-[#100f13]/90 border border-white/5 rounded-2xl p-4.5 hover:border-purple-500/20 transition duration-300 shadow-xl flex flex-col justify-between min-h-[110px]">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Total Users</span>
                      <span className="text-[8px] bg-indigo-500/10 text-indigo-400 font-extrabold px-1.5 py-0.5 rounded tracking-wider">+12 Today</span>
                    </div>
                    <span className="font-outfit text-3xl font-black text-white leading-none mt-3">{stats.totalUsers}</span>
                  </div>
                </div>

                {}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {}
                  <div className="xl:col-span-2 bg-[#0c0c0e]/80 border border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col justify-between min-h-[350px]">
                    <div className="select-none mb-4">
                      <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block font-mono">Analytics</span>
                      <h3 className="font-outfit text-md font-bold text-white uppercase mt-0.5">Platform Growth Trajectory</h3>
                    </div>
                    <div className="flex-1 flex items-center justify-center border border-white/[0.02] rounded-xl bg-white/[0.01]">
                      <div className="text-center">
                        <svg className="w-8 h-8 text-purple-500/30 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Chart Module Initializing...</p>
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col min-h-[350px]">
                    <div className="select-none mb-4 flex justify-between items-center">
                      <div>
                        <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block font-mono">Live Sync</span>
                        <h3 className="font-outfit text-md font-bold text-white uppercase mt-0.5">Global Telemetry</h3>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    </div>
                    <div className="flex-1 bg-[#050506] rounded-xl border border-white/5 p-3 overflow-hidden flex flex-col font-mono">
                      <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar flex flex-col justify-end">
                        {telemetryLogs.map((log, idx) => (
                          <div key={idx} className={`text-[9px] ${log.includes('SOS') ? 'text-red-400 font-bold' : log.includes('SYSTEM') ? 'text-purple-400/70' : 'text-gray-400'} break-words`}>
                            <span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString('en-US', {hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {}
            {activeView !== 'overview' && (
              <div className="h-full flex items-center justify-center animate-fadeIn">
                <div className="text-center p-8 bg-[#0c0c0e]/60 rounded-2xl border border-white/5 shadow-2xl max-w-md w-full backdrop-blur-sm">
                  <div className="h-16 w-16 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center mb-4 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                    <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-outfit text-xl font-bold text-white mb-2 uppercase tracking-wide">Module Offline</h3>
                  <p className="text-xs text-gray-400 font-light mb-6">
                    The {activeView.replace('-', ' ')} module is currently undergoing system upgrades and is not available for global access.
                  </p>
                  <button onClick={() => setActiveView('overview')} className="bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold py-2.5 px-6 rounded-lg transition duration-200 uppercase tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    Return to Overview
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

    </div>
  );
};

export default function Page(props) {
  return (
    <SuperAdminRoute>
      <AdminDashboard {...props} />
    </SuperAdminRoute>
  );
}
