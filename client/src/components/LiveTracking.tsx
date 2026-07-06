import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from './RouterCompatibility';
import { MapContainer as LeafletMapContainer, TileLayer as LeafletTileLayer, Marker as LeafletMarker, Polyline as LeafletPolyline, useMap } from 'react-leaflet';
const MapContainer = LeafletMapContainer as any;
const TileLayer = LeafletTileLayer as any;
const Marker = LeafletMarker as any;
const Polyline = LeafletPolyline as any;
import L from 'leaflet';

import { io } from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import 'leaflet/dist/leaflet.css';
import axiosInstance from '../lib/axios';

const MapUpdater = ({ center, isRecentering, isNavigating }) => {
  const map = useMap();

  useEffect(() => {
    if (isRecentering) {
      map.flyTo(center, 15, { animate: true, duration: 1.5 });
    } else if (isNavigating) {
      map.panTo(center, { animate: true, duration: 1.0 });
    }
  }, [isRecentering, isNavigating, center, map]);

  return null;
};

const beaconIcon = new L.divIcon({
  className: 'bg-transparent',
  html: `<div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-[#8b5a2b]/40 rounded-full animate-ping" style="animation-duration: 2s;"></div>
          <div class="relative w-3 h-3 bg-[#121317] border-2 border-[#8b5a2b] rounded-full z-10"></div>
          <div class="absolute w-1 h-1 bg-[#8b5a2b] rounded-full z-20"></div>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const startIcon = new L.divIcon({
  className: 'bg-transparent',
  html: `<div class="relative flex items-center justify-center">
          <div class="w-3 h-3 bg-[#8b5a2b] rounded-full border-2 border-black z-10"></div>
          <div class="absolute -bottom-4 font-mono text-[10px] font-black text-gray-500 w-20 text-center whitespace-nowrap">BASE ALPHA</div>
         </div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const endIcon = new L.divIcon({
  className: 'bg-transparent',
  html: `<div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 bg-[#10b981]/20 rounded-full animate-pulse z-0"></div>
          <div class="relative w-4 h-4 bg-[#121317] border-2 border-[#10b981] rounded-full z-10 flex items-center justify-center">
            <div class="w-1.5 h-1.5 bg-[#10b981] rounded-full"></div>
          </div>
          <div class="absolute -bottom-4 font-mono text-[10px] font-black text-[#10b981] w-20 text-center whitespace-nowrap">SUMMIT</div>
         </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24]
});

const checkpointIcon = new L.divIcon({
  className: 'bg-transparent',
  html: `<div class="w-2.5 h-2.5 bg-[#8b5a2b] rounded-full animate-pulse shadow-[0_0_8px_rgba(139,90,43,0.8)]"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5]
});

const LiveTracking = () => {
  const { id } = useParams();

  // Dynamic Lookup for Trek Details to configure the HUD
  const trekLookup = {
    munnar: { title: "Munnar Mist Trek", location: "Munnar, Kerala", temp: "14°C Clear", difficulty: "Moderate", guide: "Sarah Williams", baseAlt: 1000, targetAlt: 2400, lat: 10.0889, lng: 77.0597, distance: "8.5 km", eta: "1h 15m" },
    wayanad: { title: "Wayanad River Camp", location: "Wayanad, Kerala", temp: "22°C Clear", difficulty: "Easy", guide: "David Miller", baseAlt: 800, targetAlt: 1800, lat: 11.6854, lng: 76.1320, distance: "6.2 km", eta: "45m" },
    peak: { title: "Peak Challenge", location: "Vegamon, Kerala", temp: "19°C Cloudy", difficulty: "Difficult", guide: "Sarah Williams", baseAlt: 900, targetAlt: 2100, lat: 9.6841, lng: 76.9042, distance: "5.0 km", eta: "1h 30m" },
    vagamon: { title: "Vagamon Meadows Hike", location: "Vegamon, Kerala", temp: "20°C Windy", difficulty: "Easy", guide: "David Miller", baseAlt: 700, targetAlt: 1500, lat: 9.6912, lng: 76.9015, distance: "7.8 km", eta: "2h 05m" },
    idukki: { title: "Idukki Canyon Exploration", location: "Idukki, Kerala", temp: "17°C Overcast", difficulty: "Difficult", guide: "Sarah Williams", baseAlt: 850, targetAlt: 2000, lat: 9.8512, lng: 76.9654, distance: "11.2 km", eta: "3h 15m" },
    photography: { title: "Photography Masterclass Trek", location: "Idukki, Kerala", temp: "18°C Sunny", difficulty: "Intermediate", guide: "David Miller", baseAlt: 650, targetAlt: 1400, lat: 10.0152, lng: 76.9812, distance: "4.5 km", eta: "1h 10m" },
    anamudi: { title: "Anamudi Peak", location: "Munnar, India", temp: "11°C Cold", difficulty: "Hard", guide: "Sarah Williams", baseAlt: 1200, targetAlt: 2695, lat: 10.1685, lng: 77.0645, distance: "14.0 km", eta: "4h 45m" },
    kudremukh: { title: "Kudremukh Trail", location: "Chikmagalur, India", temp: "16°C Cloudy", difficulty: "Moderate", guide: "David Miller", baseAlt: 950, targetAlt: 1892, lat: 13.2185, lng: 75.2530, distance: "9.5 km", eta: "2h 40m" },
    chembra: { title: "Chembra Peak", location: "Wayanad, India", temp: "21°C Sunny", difficulty: "Moderate", guide: "David Miller", baseAlt: 750, targetAlt: 1780, lat: 11.5452, lng: 76.0890, distance: "7.0 km", eta: "1h 55m" },
    agasthyakoodam: { title: "Agasthyakoodam Summit", location: "Trivandrum, India", temp: "13°C Foggy", difficulty: "Expert", guide: "Sarah Williams", baseAlt: 1100, targetAlt: 1868, lat: 8.6189, lng: 77.2488, distance: "20.0 km", eta: "6h 30m" }
  };

  const trek = trekLookup[id] || trekLookup.munnar;

  // Navigation Control Bar States
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationProgress, setNavigationProgress] = useState(0.2); // start at 20% on the path
  const [isRecentering, setIsRecentering] = useState(false);
  const [downloadState, setDownloadState] = useState('idle'); // 'idle' | 'downloading' | 'completed'
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [flashlightPos, setFlashlightPos] = useState({ x: '50%', y: '50%' });
  const [mapStyle, setMapStyle] = useState('osm'); // 'osm' | 'sat' | 'topo'
  const [realCoords, setRealCoords] = useState(null);

  // Jitter and simulation states
  const [jitter, setJitter] = useState({ lat: 0, lng: 0, alt: 0 });
  const [heartRate, setHeartRate] = useState(115);
  const [secondsElapsed, setSecondsElapsed] = useState(12845); // ~3h 34m 5s
  const [signalStrength, setSignalStrength] = useState(98);
  const [sosState, setSosState] = useState('idle'); // 'idle' | 'counting' | 'active'
  const [sosCountdown, setSosCountdown] = useState(5);
  const [compassAngle, setCompassAngle] = useState(32);
  const [channelConnected, setChannelConnected] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Chat & Socket State
  const socketRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([]);

  // Fetch historical chat from MongoDB
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await axiosInstance.get(`/messages/${id || 'munnar'}`);
        // Ensure data is array or handle response structure
        const data = res.data.data || res.data;
        if (Array.isArray(data)) {
          setChatMessages(data);
        }
      } catch (err) {
        if (err.response && err.response.status === 403) {
          console.warn('Chat history access denied: Active booking required.');
        } else {
          console.error('Failed to fetch chat history:', err.message);
        }
      }
    };
    fetchChatHistory();
  }, [id]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMsgText, setNewMsgText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatOpen]);

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_trek', id || 'munnar');
    });

    socketRef.current.on('chat_message', (msg) => {
      setChatMessages(prev => [...prev, msg]);
      if (msg.isGuide === false) {
        triggerToast(`HQ Command: ${msg.text.substring(0, 25)}...`);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id]);
  // Checklist points (Static titles, status updated dynamically below)
  const checkpointsData = [
    { name: "Base Camp Alpha", range: [0, 0.2] },
    { name: "River Crossing Point", range: [0.2, 0.45] },
    { name: "Ridge Outlook Peak", range: [0.45, 0.7] },
    { name: "High Meadow Shelter", range: [0.7, 0.9] },
    { name: "Summit Flagpoint", range: [0.9, 1.0] }
  ];

  // Helper to trigger floating toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  // Format Elapsed Time
  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // 1. Navigation Progress Loop (advances tracker when active)
  useEffect(() => {
    let navInterval;
    if (isNavigating) {
      navInterval = setInterval(() => {
        setNavigationProgress(prev => {
          if (prev >= 1.0) {
            setIsNavigating(false);
            triggerToast("You have reached the summit flagpoint! Navigation completed.");
            return 1.0;
          }
          return Number((prev + 0.003).toFixed(4)); // progress 0.3% per second
        });
      }, 1000);
    }
    return () => clearInterval(navInterval);
  }, [isNavigating]);

  // 1b. Real Geolocation Tracking (overrides simulation if available)
  useEffect(() => {
    let watchId;
    if (isNavigating) {
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            setRealCoords({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              alt: position.coords.altitude || null
            });
          },
          (error) => {
            console.warn("Geolocation tracking error:", error.message);
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      }
    }
    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isNavigating]);

  // 2. Telemetry and Environment Jitter Simulation Loop
  useEffect(() => {
    const jitterInterval = setInterval(() => {
      setJitter({
        lat: (Math.random() - 0.5) * 0.0001,
        lng: (Math.random() - 0.5) * 0.0001,
        alt: Math.floor((Math.random() - 0.5) * 3)
      });

      // Heart rate fluctuation (increases if navigating, simulating exertion)
      setHeartRate(prev => {
        const exertion = isNavigating ? 4 : 0;
        return Math.min(150, Math.max(98, prev + Math.floor((Math.random() - 0.45) * 4) + exertion));
      });

      // Signal lock drift
      setSignalStrength(prev => Math.min(100, Math.max(90, prev + Math.floor((Math.random() - 0.5) * 2))));

      // Map compass heading drift
      setCompassAngle(prev => (prev + Math.floor((Math.random() - 0.5) * 4)) % 360);
    }, 1500);

    const clockInterval = setInterval(() => {
      // Clock only ticks when navigating
      if (isNavigating) {
        setSecondsElapsed(prev => prev + 1);
      }
    }, 1000);

    return () => {
      clearInterval(jitterInterval);
      clearInterval(clockInterval);
    };
  }, [isNavigating]);

  // 3. SOS Countdown Timer Effect
  useEffect(() => {
    let timer;
    if (sosState === 'counting') {
      if (sosCountdown > 0) {
        timer = setTimeout(() => setSosCountdown(prev => prev - 1), 1000);
      } else {
        setSosState('active');
      }
    }
    return () => clearTimeout(timer);
  }, [sosState, sosCountdown]);

  // Transmit SOS when active
  useEffect(() => {
    if (sosState === 'active' && socketRef.current) {
      socketRef.current.emit('trigger_sos', {
        trekId: id || 'munnar',
        trekName: trek.title,
        lat: trek.lat + (jitter?.lat || 0), // Use base lat to avoid dependency cycles
        lng: trek.lng + (jitter?.lng || 0),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      });
      triggerToast('EMERGENCY SOS TRANSMITTED');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sosState]);

  const triggerSOS = () => {
    setSosCountdown(5);
    setSosState('counting');
  };

  const cancelSOS = () => {
    setSosState('idle');
    setSosCountdown(5);
    if (socketRef.current) {
      socketRef.current.emit('cancel_sos', { trekId: id || 'munnar' });
    }
  };

  // Interpolated GPS Coordinates along the trek path
  const startLat = trek.lat;
  const startLng = trek.lng;
  const endLat = trek.lat + 0.0136;
  const endLng = trek.lng + 0.0162;

  const currentLat = realCoords ? realCoords.lat : startLat + (endLat - startLat) * navigationProgress;
  const currentLng = realCoords ? realCoords.lng : startLng + (endLng - startLng) * navigationProgress;
  const currentAlt = realCoords && realCoords.alt ? realCoords.alt : Math.floor(trek.baseAlt + (trek.targetAlt - trek.baseAlt) * navigationProgress);

  // Apply jitter noise to coordinate readings (only for simulation)
  const displayLat = currentLat + (realCoords ? 0 : jitter.lat);
  const displayLng = currentLng + (realCoords ? 0 : jitter.lng);
  const displayAlt = Math.min(trek.targetAlt, Math.max(trek.baseAlt, currentAlt + (realCoords ? 0 : jitter.alt)));

  // Compute elevation percentages
  const elevationPercentage = Math.round(((displayAlt - trek.baseAlt) / (trek.targetAlt - trek.baseAlt)) * 100);

  // Emit Telemetry over Socket
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.emit('send_telemetry', {
        trekId: id || 'munnar',
        trekName: trek.title,
        lat: displayLat,
        lng: displayLng,
        alt: displayAlt,
        progress: navigationProgress,
        heartRate,
        pax: 12,
        isNavigating,
        time: formatTime(secondsElapsed)
      });
    }
  }, [displayLat, displayLng, displayAlt, heartRate, navigationProgress, isNavigating]);

  // Emit SOS active state
  useEffect(() => {
    if (sosState === 'active' && socketRef.current) {
      socketRef.current.emit('trigger_sos', {
        trekId: id || 'munnar',
        trekName: trek.title,
        lat: displayLat,
        lng: displayLng,
        alt: displayAlt,
        time: new Date().toLocaleTimeString()
      });
    }
  }, [sosState, displayLat, displayLng]);

  // Compass and radar alignment
  const getBeaconCoords = (progress) => {
    const points = [
      { x: 120, y: 430 }, // Base Alpha
      { x: 160, y: 400 },
      { x: 205, y: 365 }, // Checkpoint 1
      { x: 230, y: 320 },
      { x: 270, y: 290 },
      { x: 310, y: 275 }, // Checkpoint 2
      { x: 360, y: 220 },
      { x: 420, y: 140 }  // Summit Finish
    ];
    const index = progress * (points.length - 1);
    const i = Math.floor(index);
    if (i >= points.length - 1) return points[points.length - 1];
    const t = index - i;
    const p0 = points[i];
    const p1 = points[i + 1];
    return {
      x: p0.x + (p1.x - p0.x) * t,
      y: p0.y + (p1.y - p0.y) * t
    };
  };

  const beacon = getBeaconCoords(navigationProgress);

  // Checkpoint State updates dynamically based on navigationProgress
  const getStatus = (index) => {
    if (index === 0) return navigationProgress >= 0.2 ? "passed" : "active";
    if (index === 1) {
      if (navigationProgress >= 0.45) return "passed";
      if (navigationProgress >= 0.2) return "active";
      return "locked";
    }
    if (index === 2) {
      if (navigationProgress >= 0.7) return "passed";
      if (navigationProgress >= 0.45) return "active";
      return "locked";
    }
    if (index === 3) {
      if (navigationProgress >= 0.9) return "passed";
      if (navigationProgress >= 0.7) return "active";
      return "locked";
    }
    if (index === 4) {
      if (navigationProgress >= 1.0) return "passed";
      if (navigationProgress >= 0.9) return "active";
      return "target";
    }
    return "locked";
  };

  const getCheckpointTime = (index) => {
    if (index === 0) return "08:15";
    if (index === 1) return navigationProgress >= 0.45 ? "10:30" : navigationProgress >= 0.2 ? "Current" : "--:--";
    if (index === 2) return navigationProgress >= 0.7 ? "12:10" : navigationProgress >= 0.45 ? "Current" : "--:--";
    if (index === 3) return navigationProgress >= 0.9 ? "13:45" : navigationProgress >= 0.7 ? "Current" : "--:--";
    if (index === 4) return navigationProgress >= 1.0 ? "14:30" : navigationProgress >= 0.9 ? "Current" : "--:--";
    return "--:--";
  };

  // Flashlight Mouse Move Tracker
  const handleMouseMove = (e) => {
    if (!flashlightOn) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setFlashlightPos({ x: `${x}%`, y: `${y}%` });
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#e0e0e0] font-sans flex flex-col justify-between selection:bg-trek-brown selection:text-white relative overflow-hidden">

      {/* Topographic Lines grid background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0">
        <svg className="w-full h-full text-white" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* TOP HEADER HUD */}
      <header className="relative z-10 bg-[#0c0d10] border-b border-white/10 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Left Side: Exit/Logo */}
        <div className="flex items-center gap-4">
          <Link
            to={`/details/${id || 'munnar'}`}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition group border border-white/10 bg-white/5 px-3 py-1.5 rounded-lg"
          >
            <span className="group-hover:-translate-x-0.5 transition">&larr;</span> Exit HUD
          </Link>
          <div className="h-4 w-px bg-white/10 hidden md:block"></div>
          <div>
            <span className="text-[9px] text-trek-brown font-black uppercase tracking-widest block leading-none">Mission Control</span>
            <h1 className="font-outfit text-md md:text-lg font-black uppercase text-white tracking-wide mt-1">
              {trek.title} Live GPS
            </h1>
          </div>
        </div>

        {/* Center: System Timer / Clock */}
        <div className="bg-[#121418] border border-white/10 rounded-xl px-5 py-2 flex items-center gap-4 font-mono select-none">
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-gray-500 font-sans font-black uppercase tracking-widest">Elapsed Time</span>
            <span className="text-sm font-bold text-white mt-0.5">{formatTime(secondsElapsed)}</span>
          </div>
          <div className="h-6 w-px bg-white/10"></div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-gray-500 font-sans font-black uppercase tracking-widest">Telemetry Stream</span>
            <span className="text-[10px] font-bold mt-1 flex items-center gap-1.5 transition-colors duration-300 text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping"></span> LIVE SYNC
            </span>
          </div>
        </div>

        {/* Right Side: Connection Statuses */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-xs select-none">
          {/* Signal Indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-end gap-0.5 h-3.5">
              <div className="w-0.5 h-1 bg-green-500"></div>
              <div className="w-0.5 h-1.5 bg-green-500"></div>
              <div className="w-0.5 h-2 bg-green-500"></div>
              <div className="w-0.5 h-2.5 bg-green-500"></div>
              <div className={`w-0.5 h-3.5 transition-colors ${signalStrength > 95 ? 'bg-green-500' : 'bg-gray-700'}`}></div>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest leading-none">SAT-LINK</span>
              <span className="text-[10px] font-bold mt-0.5 text-gray-300 font-mono">{signalStrength}%</span>
            </div>
          </div>

          {/* Dual Band GPS Capsule */}
          <div className="bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1 rounded-full flex items-center gap-1.5 text-[9px] font-black tracking-wider text-green-400 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
            GPS Dual-Band L1/L5
          </div>
        </div>

      </header>

      {/* EMERGENCY SOS BANNER (ACTIVE STATE) */}
      {sosState === 'active' && (
        <div className="bg-red-600 text-white font-mono px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 z-50 animate-pulse border-b border-red-800 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-ping"></span>
            <div>
              <h3 className="font-outfit font-black text-md md:text-xl uppercase tracking-widest">CRITICAL EMERGENCY SOS ACTIVE</h3>
              <p className="text-[10px] text-red-200 uppercase mt-0.5">Satellite Beacon Broadcasting: Lat {displayLat.toFixed(6)}° N / Lng {displayLng.toFixed(6)}° E — Emergency frequencies alerted</p>
            </div>
          </div>
          <button
            onClick={cancelSOS}
            className="bg-black text-white hover:bg-white hover:text-black font-sans font-black text-xs uppercase tracking-widest px-6 py-3 rounded-lg border border-white/20 active:scale-95 transition"
          >
            Cancel Broadcast
          </button>
        </div>
      )}

      {/* SOS COUNTDOWN SCREEN OVERLAY */}
      {sosState === 'counting' && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 select-none">
          <div className="max-w-md bg-[#121317] border border-red-500/30 rounded-3xl p-8 shadow-2xl flex flex-col items-center relative overflow-hidden">

            {/* Pulsing red radar ring */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="h-56 w-56 rounded-full border border-red-500/10 animate-ping" style={{ animationDuration: '2s' }}></div>
              <div className="h-32 w-32 rounded-full border border-red-500/25 animate-ping" style={{ animationDuration: '1.5s' }}></div>
            </div>

            <span className="text-5xl block mb-6 animate-pulse"></span>
            <h2 className="font-outfit text-2xl font-black uppercase text-red-500 tracking-wider mb-2">Initiating Satellite SOS</h2>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs font-light mb-8">
              This will broadcast your GPS coordinates to Search & Rescue, forest department patrol units, and your trail guides.
            </p>

            <div className="text-6xl font-mono font-black text-white mb-8 animate-bounce">
              0:0{sosCountdown}
            </div>

            <button
              onClick={cancelSOS}
              className="bg-red-500/10 border border-red-500/30 hover:bg-red-600 hover:border-red-600 text-red-400 hover:text-white font-sans font-black text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg active:scale-95 transition w-full"
            >
              Abort Broadcast
            </button>
          </div>
        </div>
      )}

      {/* MAIN HUD CONTENT PANEL */}
      <main className="relative z-10 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-5 px-6 py-5 max-w-[1700px] w-full mx-auto items-stretch">

        {/* ==========================================
           LEFT COLUMN: Telemetry Widgets (Span 3)
           ========================================== */}
        <section className="lg:col-span-3 flex flex-col gap-5 justify-between">

          {/* A. Progress & Coordinates */}
          <div className="bg-[#0f1013] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg h-full">
            <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest border-b border-white/5 pb-2">Expedition Progress</span>

            <div className="py-2.5">
              <div className="flex justify-between items-end text-xs mb-1">
                <span className="text-gray-400 font-light">Walked Distance</span>
                <span className="font-bold text-white text-md">
                  {(4.8 + (parseFloat(trek.distance) - 4.8) * navigationProgress).toFixed(1)} km
                  <span className="text-gray-500 font-normal text-[10px]"> / {trek.distance}</span>
                </span>
              </div>
              {/* Distance progress track bar */}
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden select-none">
                <div className="h-full bg-trek-brown rounded-full transition-all duration-300" style={{ width: `${Math.round(56 + 44 * navigationProgress)}%` }}></div>
              </div>
              <div className="flex justify-between text-[9px] text-gray-500 mt-1 select-none font-bold">
                <span>Start Point</span>
                <span>{isNavigating ? "En route" : `ETA ${trek.eta}`}</span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3.5 mt-1 font-mono">
              <span className="text-[8px] text-gray-500 font-sans font-black uppercase tracking-widest block mb-2">Latitude / Longitude</span>
              <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-500 uppercase">LAT:</span>
                  <span className="text-white tracking-wider">{displayLat.toFixed(6)}° N</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-500 uppercase">LNG:</span>
                  <span className="text-white tracking-wider">{displayLng.toFixed(6)}° E</span>
                </div>
              </div>
            </div>
          </div>

          {/* B. Altitude & Elevation Tracker */}
          <div className="bg-[#0f1013] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg h-full">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Altitude Station</span>
              <span className="text-[8px] text-trek-brown font-extrabold uppercase tracking-wide">Active Climb</span>
            </div>

            <div className="flex gap-4 py-3 h-28 items-stretch select-none">
              {/* Vertical climb bar */}
              <div className="w-4 bg-white/5 border border-white/10 rounded-full flex flex-col justify-end overflow-hidden relative">
                <div className="bg-gradient-to-t from-trek-brown to-amber-600 w-full transition-all duration-1000" style={{ height: `${elevationPercentage}%` }}></div>
                <div className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-gray-400 rotate-90">{elevationPercentage}%</div>
              </div>
              <div className="flex-grow flex flex-col justify-between py-1">
                <div>
                  <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest block leading-none">Current Elevation</span>
                  <span className="text-xl font-bold font-mono text-white mt-1.5 block">{displayAlt}m</span>
                  <span className="text-[9px] text-gray-400 mt-1 block">Target Summit: {trek.targetAlt}m</span>
                </div>
                <div className="text-[9px] text-gray-500 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400"></span> Slope Angle: +14°
                </div>
              </div>
            </div>
          </div>

          {/* C. Live Vitals Monitoring */}
          <div className="bg-[#0f1013] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg h-full">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Health Vitals Monitor</span>
              <span className="text-[8px] text-red-500 font-black uppercase tracking-wider animate-pulse flex items-center gap-1">️ ECG</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex flex-col font-mono">
                <span className="text-[8px] text-gray-500 font-sans font-black uppercase tracking-widest block leading-none">Your Heart Rate</span>
                <span className="text-2xl font-black text-white mt-2 block animate-pulse">{heartRate} <span className="text-xs text-red-400 font-sans font-normal">BPM</span></span>
              </div>
              {/* Heartbeat pulse animation graph */}
              <div className="w-28 h-10 select-none overflow-hidden text-red-500 bg-red-500/5 border border-red-500/10 rounded-lg flex items-center">
                <svg viewBox="0 0 200 40" className="w-full h-8">
                  <path d="M0 20 L40 20 L50 10 L60 30 L70 5 L80 35 L90 20 L125 20 L135 12 L145 28 L155 8 L165 32 L175 20 L200 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="300" strokeDashoffset="0">
                    <animate attributeName="stroke-dashoffset" values="300;0" dur="2.5s" repeatCount="indefinite" />
                  </path>
                </svg>
              </div>
            </div>

            <div className="text-[9px] font-medium text-gray-500 border-t border-white/5 pt-2 flex justify-between select-none">
              <span>BPM status: Active aerobic</span>
              <span>Body Temp: 37.1°C</span>
            </div>
          </div>

          {/* D. Weather Station */}
          <div className="bg-[#0f1013] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg h-full">
            <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest border-b border-white/5 pb-2">Weather Station</span>

            <div className="grid grid-cols-2 gap-3 py-2.5 select-none">
              <div className="bg-black/30 border border-white/5 rounded-xl p-2.5">
                <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block">Temp</span>
                <span className="text-xs font-bold text-white mt-1 block">{trek.temp}</span>
              </div>
              <div className="bg-black/30 border border-white/5 rounded-xl p-2.5">
                <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block">Wind Speed</span>
                <span className="text-xs font-bold text-white mt-1 block">18 km/h NW</span>
              </div>
              <div className="bg-black/30 border border-white/5 rounded-xl p-2.5">
                <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block">Humidity</span>
                <span className="text-xs font-bold text-white mt-1 block">82%</span>
              </div>
              <div className="bg-black/30 border border-white/5 rounded-xl p-2.5">
                <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block">UV Index</span>
                <span className="text-xs font-bold text-amber-500 mt-1 block">Low / 1</span>
              </div>
            </div>
          </div>

        </section>

        {/* ==========================================
           CENTER COLUMN: Interactive Map HUD (Span 6)
           ========================================== */}
        <section className="lg:col-span-6 bg-[#0c0d10] border border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative min-h-[500px]">

          {/* Compass & Map Overlay Header */}
          <div className="flex justify-between items-center z-10 border-b border-white/5 pb-3 mb-2">
            <div>
              <span className="text-[8px] text-trek-brown font-black uppercase tracking-widest block leading-none">Compass Alignment</span>
              <span className="text-xs font-mono font-bold text-white mt-1 block">Heading: {compassAngle}° NE</span>
            </div>

            {/* Quick map options */}
            <div className="flex items-center gap-2 select-none text-[8px] font-black uppercase tracking-wider">
              <span
                onClick={() => setMapStyle('osm')}
                className={`px-2 py-0.5 rounded shadow cursor-pointer transition ${mapStyle === 'osm' ? 'bg-trek-brown/10 border border-trek-brown/20 text-trek-brown' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}>Street View</span>
              <span
                onClick={() => setMapStyle('sat')}
                className={`px-2 py-0.5 rounded shadow cursor-pointer transition ${mapStyle === 'sat' ? 'bg-trek-brown/10 border border-trek-brown/20 text-trek-brown' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}>Sat View</span>
              <span
                onClick={() => setMapStyle('topo')}
                className={`px-2 py-0.5 rounded cursor-pointer transition ${mapStyle === 'topo' ? 'bg-trek-brown/10 border border-trek-brown/20 text-trek-brown' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}>Topo Curves</span>
            </div>
          </div>

          {/* Leaflet Map Frame */}
          <div
            onMouseMove={handleMouseMove}
            className="flex-grow relative w-full h-[35vh] border border-white/5 rounded-2xl overflow-hidden select-none z-0"
          >
            <MapContainer
              center={[displayLat, displayLng]}
              zoom={15}
              zoomControl={false}
              scrollWheelZoom={true}
              className="w-full h-full bg-[#0c0d10] z-0"
              attributionControl={false}
            >
              <MapUpdater center={[displayLat, displayLng]} isRecentering={isRecentering} isNavigating={isNavigating} />

              <TileLayer
                url={mapStyle === 'osm'
                  ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  : mapStyle === 'sat'
                    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                }
                attribution={mapStyle === 'osm' ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' : ''}
              />

              {/* Path Line */}
              <Polyline positions={[[startLat, startLng], [endLat, endLng]]} pathOptions={{ color: '#8b5a2b', weight: 4, dashArray: '10, 10' }} />

              {/* Start Marker */}
              <Marker position={[startLat, startLng]} icon={startIcon} />

              {/* End Marker */}
              <Marker position={[endLat, endLng]} icon={endIcon} />

              {/* Checkpoints (Intermediates) */}
              <Marker position={[startLat + (endLat - startLat) * 0.45, startLng + (endLng - startLng) * 0.45]} icon={checkpointIcon} />
              <Marker position={[startLat + (endLat - startLat) * 0.7, startLng + (endLng - startLng) * 0.7]} icon={checkpointIcon} />

              {/* Active User Beacon */}
              <Marker position={[displayLat, displayLng]} icon={beaconIcon} zIndexOffset={1000} />

            </MapContainer>

            {flashlightOn && (
              <div
                className="pointer-events-none absolute inset-0 z-20 mix-blend-color-dodge transition-opacity duration-200"
                style={{
                  background: `radial-gradient(circle 180px at ${flashlightPos.x} ${flashlightPos.y}, rgba(253, 224, 71, 0.22) 0%, rgba(0,0,0,0) 80%)`
                }}
              />
            )}

            {/* FIGMA HUD CONTROLS OVERLAY */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 select-none bg-black/85 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 shadow-2xl">

              {/* Battery indicator */}
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 border-r border-white/10 pr-4">
                <span className="font-mono text-xs">41%</span>
                <svg className="w-5 h-5 text-orange-400 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-1 12H8V7h8z" />
                </svg>
              </div>

              {/* Navigation trigger button */}
              <button
                onClick={() => {
                  setIsNavigating(!isNavigating);
                  triggerToast(isNavigating ? "GPS tracking paused." : "Real-time navigation initialized. Satellite syncing active...");
                }}
                className={`font-outfit font-black text-xs uppercase tracking-wider py-2 px-5 rounded-xl flex items-center gap-2 shadow active:scale-95 transition-all duration-300 border-none cursor-pointer ${isNavigating
                  ? 'bg-orange-500 text-white animate-pulse'
                  : 'bg-[#a2dbbe] text-black hover:bg-[#8bcaaa]'
                  }`}
              >
                <svg className={`w-3.5 h-3.5 fill-current ${isNavigating ? 'animate-spin' : ''}`} viewBox="0 0 24 24">
                  {isNavigating ? (
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                  ) : (
                    <path d="M12 2L2 22l10-4 10 4L12 2z" transform="rotate(45 12 12)" />
                  )}
                </svg>
                {isNavigating ? 'PAUSE NAVIGATION' : 'START NAVIGATION'}
              </button>

              {/* Icon 1: Recenter GPS */}
              <button
                onClick={() => {
                  setIsRecentering(true);
                  triggerToast("Focal lock initialized. Map aligned to beacon coordinate center.");
                  setTimeout(() => setIsRecentering(false), 1000);
                }}
                className="h-9 w-9 rounded-full bg-white/5 border border-white/10 hover:border-white/30 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer transition active:scale-90"
                title="Recenter Map"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v2m0 16v2M2 12h2m16 0h2" strokeLinecap="round" />
                </svg>
              </button>

              {/* Icon 2: Download Maps */}
              <button
                onClick={() => {
                  if (downloadState === 'idle') {
                    setDownloadState('downloading');
                    triggerToast(`Caching topography: Downloading offline grid for ${trek.title} (12.4 MB)...`);
                    setTimeout(() => {
                      setDownloadState('completed');
                      triggerToast("Download complete. Satellite topological layout offline storage saved.");
                    }, 2500);
                  } else if (downloadState === 'completed') {
                    triggerToast("Topographical offline map is already cached.");
                  }
                }}
                disabled={downloadState === 'downloading'}
                className={`h-9 w-9 rounded-full border flex items-center justify-center cursor-pointer transition active:scale-90 ${downloadState === 'completed'
                  ? 'bg-green-500/10 border-green-500 text-green-400'
                  : downloadState === 'downloading'
                    ? 'bg-orange-500/10 border-orange-500 text-orange-400 animate-pulse'
                    : 'bg-white/5 border-white/10 hover:border-white/30 text-gray-300 hover:text-white'
                  }`}
                title="Offline Map Download"
              >
                {downloadState === 'completed' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4m12-5l-5 5m0 0l-5-5m5 5V3" />
                  </svg>
                )}
              </button>

              {/* Icon 3: Flashlight */}
              <button
                onClick={() => {
                  setFlashlightOn(!flashlightOn);
                  triggerToast(flashlightOn ? "Screen nightlight deactivated." : "Nightlight beam activated. Hover cursor over map to aim.");
                }}
                className={`h-9 w-9 rounded-full border flex items-center justify-center cursor-pointer transition active:scale-90 ${flashlightOn
                  ? 'bg-yellow-500/15 border-yellow-500 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]'
                  : 'bg-white/5 border-white/10 hover:border-white/30 text-gray-300 hover:text-white'
                  }`}
                title="Toggle Torch Nightlight"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6v4H9V3zm-2 4h10l-1 5H8L7 7zm1 5h8v7a2 2 0 01-2 2h-4a2 2 0 01-2-2v-7zm4 3v3" />
                </svg>
              </button>

            </div>

            {/* Coordinates Stream Overlay box */}
            <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-3 z-20 text-[9px] font-mono select-text flex flex-col gap-1 shadow-md">
              <span className="text-gray-500 font-sans font-bold uppercase tracking-wider mb-1">Satellite Lock Feed</span>
              <div>LAT: <span className="text-white font-bold">{displayLat.toFixed(6)}° N</span></div>
              <div>LNG: <span className="text-white font-bold">{displayLng.toFixed(6)}° E</span></div>
              <div>ALT: <span className="text-white font-bold">{displayAlt}m</span></div>
              <div>ACC: <span className="text-green-400 font-bold">±3 meters</span></div>
            </div>

            {/* Topographic Watermark overlay */}
            <div className="absolute bottom-4 left-4 border border-white/5 bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1 z-20 text-[8px] font-mono text-gray-500">
              SCALE: 1 : 25,000
            </div>

          </div>

          {/* Footer warning details */}
          <div className="border-t border-white/5 pt-3.5 flex justify-between items-center text-[10px] text-gray-500 select-none font-medium">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span> 3 Satellites in range</span>
            <span>Update frequency: 1500ms</span>
          </div>

        </section>

        {/* ==========================================
           RIGHT COLUMN: Team & Milestones (Span 3)
           ========================================== */}
        <section className="lg:col-span-3 flex flex-col gap-5 justify-between">

          {/* A. Team Telemetry Roster */}
          <div className="bg-[#0f1013] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg h-full">
            <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Team Trail Tracker</span>
              <span className="text-[8px] text-green-400 font-black uppercase tracking-wider">3 ACTIVE</span>
            </div>

            <div className="flex flex-col gap-3 py-1 text-xs">

              {/* Row 1: Sarah Williams (Guide) */}
              <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center font-bold text-orange-400 select-none text-[10px]">
                    SW
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-[11px] leading-tight">Sarah Williams</span>
                    <span className="text-[7px] text-orange-400 uppercase font-black tracking-wider leading-none mt-0.5">Guide / Lead</span>
                  </div>
                </div>
                <div className="flex flex-col items-end font-mono text-[10px]">
                  <span className="text-green-400 font-bold">104 BPM</span>
                  <span className="text-gray-500 text-[8px] mt-0.5">+150m ahead</span>
                </div>
              </div>

              {/* Row 2: You */}
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/10 rounded-xl p-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-trek-brown/20 border border-trek-brown/30 flex items-center justify-center font-bold text-trek-brown select-none text-[10px]">
                    YOU
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-[11px] leading-tight">Your Receiver</span>
                    <span className="text-[7px] text-gray-500 uppercase font-black tracking-wider leading-none mt-0.5">Trekker / Active</span>
                  </div>
                </div>
                <div className="flex flex-col items-end font-mono text-[10px]">
                  <span className="text-red-500 font-bold">{heartRate} BPM</span>
                  <span className="text-gray-500 text-[8px] mt-0.5">On Trail</span>
                </div>
              </div>

              {/* Row 3: Alex Mercer */}
              <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gray-500/10 border border-white/5 flex items-center justify-center font-bold text-gray-400 select-none text-[10px]">
                    AM
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-[11px] leading-tight">Alex Mercer</span>
                    <span className="text-[7px] text-gray-500 uppercase font-black tracking-wider leading-none mt-0.5">Trekker / Sweeper</span>
                  </div>
                </div>
                <div className="flex flex-col items-end font-mono text-[10px]">
                  <span className="text-green-400 font-bold">112 BPM</span>
                  <span className="text-gray-500 text-[8px] mt-0.5">-80m behind</span>
                </div>
              </div>

            </div>

            {/* Radio Frequency Link simulator */}
            <div className="border-t border-white/5 pt-2 flex items-center justify-between select-none">
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Guide Frequency Link</span>
              <button
                onClick={() => setChannelConnected(!channelConnected)}
                className={`text-[8px] font-black uppercase tracking-wider rounded px-2 py-0.5 border ${channelConnected ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}
              >
                {channelConnected ? ' Connected (144.8 MHz)' : ' Offline'}
              </button>
            </div>
          </div>

          {/* B. Milestones & Checkpoints Checklist */}
          <div className="bg-[#0f1013] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg h-full">
            <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest border-b border-white/5 pb-2">Expedition Checkpoints</span>

            <div className="flex flex-col gap-2.5 py-3 select-none">
              {checkpointsData.map((checkpoint, i) => {
                const status = getStatus(i);
                return (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${status === 'passed' ? 'bg-green-500' :
                        status === 'active' ? 'bg-orange-500 animate-ping' :
                          'bg-gray-700'
                        }`}></span>
                      <span className={`font-semibold ${status === 'locked' ? 'text-gray-500' : 'text-gray-300'}`}>{checkpoint.name}</span>
                    </div>
                    <span className="font-mono text-[9px] text-gray-500">{getCheckpointTime(i)}</span>
                  </div>
                );
              })}
            </div>

            <div className="text-[8px] text-gray-500 border-t border-white/5 pt-2 uppercase font-black text-center">
              Next checkpoint estimate: 22 mins
            </div>
          </div>

          {/* C. Tactical Emergency SOS Button */}
          <div className="bg-[#0f1013] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg h-full">
            <span className="text-[8px] text-red-500 font-black uppercase tracking-widest border-b border-red-500/10 pb-2">Emergency Station</span>

            <div className="py-2.5">
              <p className="text-[10px] text-gray-500 font-light leading-normal">
                Trigger satellite beacon broadcast. Initiates emergency safety protocols and coordinates with response teams.
              </p>
            </div>

            <button
              onClick={triggerSOS}
              disabled={sosState === 'active'}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white font-outfit font-black py-3 rounded-xl uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(220,38,38,0.25)] hover:shadow-[0_0_20px_rgba(220,38,38,0.45)] transition duration-200 select-none text-center cursor-pointer border-none"
            >
              ️ TRIGGER EMERGENCY SOS
            </button>
          </div>

        </section>

      </main>

      {/* TACTICAL FOOTER HUD DATA */}
      <footer className="relative z-10 bg-[#070707] border-t border-white/10 px-6 py-4 flex flex-col md:flex-row items-center justify-between text-[9px] text-gray-500 font-mono select-none">
        <div>RECEIVER IP: 192.168.42.100 // DISPATCH HUB VER: 2.8.4</div>
        <div className="mt-2 md:mt-0 uppercase font-black text-trek-brown tracking-wider">TrekMate GPS Mapping Systems</div>
        <div className="mt-2 md:mt-0">BATTERY: 92% (CHARGING) // TEMP: 24°C</div>
      </footer>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[120] bg-orange-600 border border-orange-500 text-white rounded-xl px-5 py-3.5 shadow-2xl flex items-center gap-2.5 select-none animate-slideUp font-sans text-xs">
          <span className="h-2 w-2 rounded-full bg-white animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TACTICAL CHAT WIDGET */}
      <div className={`fixed bottom-6 left-6 z-[130] flex flex-col transition-all duration-300 ${isChatOpen ? 'w-80' : 'w-auto'}`}>
        {isChatOpen && (
          <div className="bg-[#121317]/95 backdrop-blur-md border border-white/10 rounded-2xl mb-4 overflow-hidden shadow-2xl flex flex-col h-96">
            <div className="bg-black/40 border-b border-white/10 px-4 py-3 flex justify-between items-center select-none">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-white tracking-widest">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span> Tactical Comms
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-white">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-mono text-[10px] relative">
              {chatMessages.length === 0 && <div className="text-gray-500 text-center py-4">No messages yet.</div>}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.isGuide ? 'items-end' : 'items-start'}`}>
                  <span className={`text-[8px] font-bold ${msg.isGuide ? 'text-orange-400' : 'text-gray-500'}`}>{msg.sender} [{msg.time}]</span>
                  <div className={`mt-1 p-2 rounded-lg ${msg.isGuide ? 'bg-orange-500/20 border-orange-500/30' : 'bg-white/10 border-white/10'} border`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {showEmojiPicker && (
              <div className="absolute bottom-16 right-0 z-50">
                <EmojiPicker 
                  theme={"dark" as any}
                  onEmojiClick={(emojiData) => {
                    setNewMsgText(prev => prev + emojiData.emoji);
                    setShowEmojiPicker(false);
                  }}
                  width={280}
                  height={350}
                />
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newMsgText.trim() || !socketRef.current) return;
                const msgData = {
                  trekId: id || 'munnar',
                  sender: 'You (Trekker)',
                  text: newMsgText.trim(),
                  time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                  isGuide: true
                };
                socketRef.current.emit('send_chat', msgData);
                setNewMsgText('');
                setShowEmojiPicker(false);
              }}
              className="border-t border-white/10 bg-black/30 p-2 flex gap-2 relative"
            >
              <button 
                type="button" 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 flex items-center justify-center text-lg hover:bg-white/10 transition"
              >
                
              </button>
              <input
                type="text"
                value={newMsgText}
                onChange={e => setNewMsgText(e.target.value)}
                placeholder="Transmit message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-orange-500 font-mono"
              />
              <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest">Send</button>
            </form>
          </div>
        )}

        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-[#121317] border border-white/20 hover:border-orange-500 text-white shadow-xl h-12 w-12 rounded-full flex items-center justify-center transition hover:scale-105"
          >
            <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
          </button>
        )}
      </div>

    </div>
  );
};

export default LiveTracking;
