import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from './RouterCompatibility';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import { getTrekById } from '../services/trekStorage';
import { MapContainer as LeafletMapContainer, TileLayer as LeafletTileLayer, Marker as LeafletMarker, Polyline as LeafletPolyline, useMap } from 'react-leaflet';
const MapContainer = LeafletMapContainer as any;
const TileLayer = LeafletTileLayer as any;
const Marker = LeafletMarker as any;
const Polyline = LeafletPolyline as any;
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChatLayout } from './chat/ChatLayout';

const MapBoundsFitter = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20], animate: false });
    }
  }, [map, bounds]);
  return null;
};

const startIcon = new L.divIcon({
  className: 'bg-transparent',
  html: `<div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-blue-500/40 rounded-full animate-ping"></div>
          <div class="relative w-3 h-3 bg-blue-500 border-2 border-white rounded-full z-10"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const destIcon = new L.divIcon({
  className: 'bg-transparent',
  html: `<div class="relative flex items-center justify-center">
          <div class="w-4 h-4 bg-green-500 rounded-full border-2 border-black z-10 flex items-center justify-center">
            <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          <div class="absolute -bottom-4 font-mono text-[9px] font-black text-green-500 whitespace-nowrap">DEST</div>
         </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const coordsLookup = {
  munnar: { lat: 10.0889, lng: 77.0597 },
  wayanad: { lat: 11.6854, lng: 76.1320 },
  peak: { lat: 9.6841, lng: 76.9042 },
  vagamon: { lat: 9.6912, lng: 76.9015 },
  idukki: { lat: 9.8512, lng: 76.9654 },
  photography: { lat: 10.0152, lng: 76.9812 },
  anamudi: { lat: 10.1685, lng: 77.0645 },
  kudremukh: { lat: 13.2185, lng: 75.2530 },
  chembra: { lat: 11.5452, lng: 76.0890 },
  agasthyakoodam: { lat: 8.6189, lng: 77.2488 }
};

const TrekDetails = () => {
  const { id } = useParams();

  
  const [trek, setTrek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState(null);
  
  const { sessions } = useAuth();
  const user = sessions.trekker || sessions.organizer || sessions.admin;

  useEffect(() => {
    const fetchTrekAndBooking = async () => {
      const data = await getTrekById(id);
      setTrek(data);
      
      if (user && data) {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const res = await fetch(`${API_URL}/api/bookings/my-bookings`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem(`token_${user.role}`) || ''}`
            }
          });
          if (res.ok) {
            const bookingsData = await res.json();
            if (bookingsData.success && bookingsData.data) {
              const currentBooking = bookingsData.data.find(b => b.trekId === id || b.trekTitle === data.title);
              if (currentBooking) {
                setBookingStatus(currentBooking.booking_status);
              } else {
                setBookingStatus(null);
              }
            } else {
              setBookingStatus(null);
            }
          } else {
            setBookingStatus(null);
          }
        } catch (error) {
          console.error("Error fetching bookings:", error);
          setBookingStatus(null);
        }
      } else {
        setBookingStatus(null);
      }
      
      setLoading(false);
    };
    fetchTrekAndBooking();
  }, [id, user]);

  
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [guideRequested, setGuideRequested] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.warn("Error getting location", error)
      );
    }
  }, []);

  useEffect(() => {
    
  }, []);

  if (loading) {
    return (
      <div className="font-sans text-white bg-trek-dark min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-orange-500 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Retrieving Trail Data...</p>
        </div>
      </div>
    );
  }

  if (!trek) {
    return (
      <div className="font-sans text-white bg-trek-dark min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <span className="text-4xl">️</span>
          <p className="text-xs uppercase tracking-widest text-red-400 font-bold">Trail Not Found</p>
          <Link to="/explore" className="text-xs text-orange-500 underline uppercase tracking-wider block">Return to Explore</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-white bg-trek-dark min-h-screen selection:bg-orange-500 selection:text-white pt-20 relative overflow-hidden">

      {}
      {toastMessage && (
        <div className="fixed top-24 right-5 z-50 bg-orange-600 text-white px-5 py-3 rounded-lg shadow-[0_0_15px_rgba(234,88,12,0.6)] font-black uppercase tracking-wider animate-bounce text-xs border border-orange-400">
          {toastMessage}
        </div>
      )}

      {}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url('${trek.image || trek.banner || '/trips_details_bg.png'}')` }}
      >
        <div className="absolute inset-0 bg-black/80 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-trek-dark via-transparent to-black/35 z-10"></div>
      </div>

      <Navbar />

      {}
      <section className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-10 pb-6 select-text">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">

          <div className="max-w-xl">
            {}
            <div className="flex items-center gap-2 mb-3.5 select-none">
              {['Camping', 'Trekking', 'High Altitude'].map((tag) => (
                <span key={tag} className="bg-white/5 border border-white/10 rounded px-2.5 py-1 text-[9px] font-black uppercase text-gray-300 tracking-wider">
                  {tag}
                </span>
              ))}
            </div>

            {}
            <h1 className="font-outfit text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none mb-3.5">
              {trek.title}
            </h1>

            {}
            <div className="flex flex-wrap items-center gap-4 text-xs font-light text-gray-400">
              <span className="flex items-center gap-1.5 font-bold text-orange-400">
                 {trek.location}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-white/20 select-none"></span>
              <span className="flex items-center gap-1.5">
                 {trek.rating}
              </span>
            </div>

            {}
            <div className="flex flex-wrap items-center gap-3.5 mt-6 select-none">
              {bookingStatus === 'confirmed' ? (
                <button disabled className="bg-green-500/20 text-green-400 border border-green-500/50 font-bold px-8 py-3 rounded-xl uppercase tracking-wider text-xs shadow-none transition-all duration-300">
                  Already Joined
                </button>
              ) : bookingStatus === 'pending' ? (
                <button disabled className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 font-bold px-8 py-3 rounded-xl uppercase tracking-wider text-xs shadow-none transition-all duration-300">
                  Request Pending
                </button>
              ) : bookingStatus === 'rejected' ? (
                <button disabled className="bg-red-500/20 text-red-400 border border-red-500/50 font-bold px-8 py-3 rounded-xl uppercase tracking-wider text-xs shadow-none transition-all duration-300">
                  Request Rejected
                </button>
              ) : (
                <Link
                  to={`/book/${id || 'munnar'}`}
                  id="btn-join-trip"
                  className="bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-bold px-8 py-3 rounded-xl uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(249,115,22,0.45)] hover:shadow-[0_0_25px_rgba(249,115,22,0.65)] transition-all duration-300"
                >
                  Join Trip
                </Link>
              )}
              <Link
                to={`/tracking/${id}`}
                className="border border-white/20 text-white rounded-xl px-7 py-3 text-xs font-semibold tracking-wider uppercase bg-white/5 backdrop-blur-sm hover:bg-white hover:text-black hover:border-white transition-all duration-300 shadow-md flex items-center gap-2 cursor-pointer active:scale-98"
              >
                 Live Tracking
              </Link>
            </div>
          </div>

          {}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 w-fit select-none backdrop-blur-md shadow-lg h-max self-start md:self-end">
            <svg className="w-8 h-8 text-amber-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none">Weather</span>
              <span className="text-sm font-extrabold text-white mt-1 leading-none">{trek.temp}</span>
            </div>
          </div>

        </div>
      </section>

      {}
      <main className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-6 pb-24 flex flex-col lg:flex-row gap-10 items-stretch">

        {}
        <section className="flex-[1.8] flex flex-col gap-8 select-text">

          {}
          <div>
            <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed select-text">
              {trek.description}
            </p>
          </div>

          {}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">

            {}
            <div className="bg-[#121317]/80 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-white/10 transition shadow-md">
              <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block mb-3">️ Difficulty</span>
              <span className="text-md font-extrabold text-white uppercase tracking-wide leading-none">{trek.difficulty}</span>
            </div>

            {}
            <div className="bg-[#121317]/80 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-white/10 transition shadow-md">
              <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block mb-3"> Duration</span>
              <span className="text-md font-extrabold text-white uppercase tracking-wide leading-none">{trek.duration}</span>
            </div>

            {}
            <div className="bg-[#121317]/80 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-white/10 transition shadow-md">
              <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block mb-3"> Max Seats</span>
              <span className="text-md font-extrabold text-white uppercase tracking-wide leading-none">{trek.seats}</span>
            </div>

            {}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex flex-col justify-between hover:border-orange-500/35 transition shadow-md animate-pulse">
              <span className="text-[8px] text-orange-400 uppercase font-black tracking-widest block mb-3"> Availability</span>
              <span className="text-md font-extrabold text-orange-400 uppercase tracking-wide leading-none">{trek.left}</span>
            </div>

          </div>

          {}
          <div className="bg-white/[0.01] border border-white/10 rounded-2xl p-5 select-none grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-lg shadow-inner">
                
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 uppercase font-black leading-none">Reporting Time</span>
                <span className="text-xs font-bold text-gray-300 mt-1.5">{trek.reportingTime}</span>
              </div>
            </div>
            <div className="flex items-center gap-3.5 border-t border-white/5 md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0">
              <div className="h-10 w-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-lg shadow-inner">
                
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 uppercase font-black leading-none">Pickup Point</span>
                <span className="text-xs font-bold text-gray-300 mt-1.5">{trek.pickup}</span>
              </div>
            </div>
          </div>

          {}
          <div>
            <h3 className="font-outfit text-xl font-black uppercase text-white tracking-wide mb-6">Journey Timeline</h3>

            <div className="flex flex-col gap-6 relative pl-3">
              {}
              <div className="absolute left-[1.125rem] top-4 bottom-4 w-0.5 border-l border-dashed border-white/20 select-none" />

              {trek.timeline.map((item, index) => (
                <div key={index} className="flex gap-5 relative group">

                  {}
                  <div className="h-9 w-9 rounded-full bg-[#121317] border border-white/20 flex items-center justify-center text-xs font-black text-orange-500 relative z-10 select-none shadow-md group-hover:border-orange-500 transition duration-300">
                    {item.num}
                  </div>

                  {}
                  <div className="flex-grow bg-[#121317]/80 border border-white/5 rounded-2xl p-5 hover:border-white/15 hover:bg-[#121317]/95 transition duration-300 shadow-xl flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="font-outfit text-md font-extrabold uppercase text-white">{item.title}</h4>
                      <p className="text-xs text-gray-400 font-light leading-relaxed mt-2 select-text">{item.desc}</p>
                    </div>

                    {}
                    {item.hasDining && (
                      <div className="flex gap-2 items-center select-none text-[10px] text-gray-400 border-t border-white/5 pt-2 w-max">
                         Food Provided <span className="h-1.5 w-1.5 rounded-full bg-white/20" />  Base Camp Shelter
                      </div>
                    )}
                    {item.alert && (
                      <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-md w-max select-none animate-pulse">
                        ️ {item.alert}
                      </div>
                    )}
                    {item.hasWater && (
                      <div className="flex gap-2 items-center select-none text-[10px] text-gray-400 border-t border-white/5 pt-2 w-max">
                         swimming access <span className="h-1.5 w-1.5 rounded-full bg-white/20" />  scenic points
                      </div>
                    )}

                  </div>

                </div>
              ))}
            </div>

          </div>

        </section>

        {}
        <section className="flex-1 flex flex-col gap-6 select-none">

          {}
          <div className="bg-[#121317]/90 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-3 relative overflow-hidden group">

            {}
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <span className="text-[10px] text-orange-400 font-black uppercase tracking-widest">Satellite Trail</span>
              <span className="text-[8px] bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-gray-400 font-semibold tracking-wider font-mono">Live route path</span>
            </div>

            {}
            <div className="h-36 w-full bg-black/40 border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden select-none">
              {(() => {
                const coords = coordsLookup[id] || coordsLookup.munnar;
                const destLat = coords.lat;
                const destLng = coords.lng;
                
                const startLat = userLocation ? userLocation.lat : destLat - 0.05;
                const startLng = userLocation ? userLocation.lng : destLng - 0.05;

                const bounds = [
                  [startLat, startLng],
                  [destLat, destLng]
                ];

                return (
                  <MapContainer 
                    center={[destLat, destLng]} 
                    zoom={11}
                    zoomControl={false}
                    scrollWheelZoom={false}
                    dragging={false}
                    doubleClickZoom={false}
                    touchZoom={false}
                    className="w-full h-full z-0"
                    attributionControl={false}
                  >
                    <MapBoundsFitter bounds={bounds} />
                    <TileLayer
                      url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    />
                    <Polyline positions={[[startLat, startLng], [destLat, destLng]]} pathOptions={{ color: '#f97316', weight: 3, dashArray: '5, 5' }} />
                    <Marker position={[startLat, startLng]} icon={startIcon} />
                    <Marker position={[destLat, destLng]} icon={destIcon} />
                  </MapContainer>
                );
              })()}
              
              {}
              <div className="absolute inset-0 bg-gradient-to-t from-[#121317]/90 to-transparent pointer-events-none z-10" />

              <Link
                to={`/tracking/${id}`}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 border border-white/20 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-wider text-white hover:bg-white hover:text-black hover:border-white transition-all shadow-md cursor-pointer active:scale-95 inline-flex items-center z-20"
              >
                Expand Map
              </Link>
            </div>

          </div>

          {}
          <div className="flex-1 bg-[#121317]/95 border border-white/10 rounded-2xl shadow-xl overflow-hidden h-[400px]">
             <ChatLayout singleRoomId={id} />
          </div>

          {}
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-md animate-pulse">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex flex-col select-text">
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none">Weather Alert</span>
              <p className="text-[11px] text-red-200/80 font-light leading-relaxed mt-1.5">
                Rain expected on Day 2 - Pack waterproof gear and rain jackets.
              </p>
            </div>
          </div>

          {}
          <div className="bg-[#121317]/95 border border-white/10 rounded-2xl p-5 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3.5 select-text">
              {}
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-trek-brown/30 to-white/10 border border-white/10 flex items-center justify-center font-black text-lg text-orange-400 shadow-inner select-none">
                {trek.guide.avatar}
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-gray-500 uppercase font-black leading-none">Certified Trail Guide</span>
                <span className="text-sm font-extrabold text-white mt-1 leading-none">{trek.guide.name}</span>

                {}
                <div className="flex items-center gap-2 text-[9px] text-gray-500 mt-2 font-medium select-none">
                  <span>{trek.guide.treks}</span>
                  <span className="h-1 w-1 rounded-full bg-white/10" />
                  <span>{trek.guide.exp}</span>
                </div>
              </div>
            </div>

            {}
            <button
              onClick={() => setGuideRequested(!guideRequested)}
              className={`text-[9px] font-black uppercase tracking-widest border rounded-xl px-4.5 py-2.5 transition active:scale-95 cursor-pointer shadow-md select-none ${guideRequested
                ? 'bg-green-500/10 border-green-500 text-green-400'
                : 'border-white/10 bg-white/5 text-gray-300 hover:border-white hover:text-white'
                }`}
            >
              {guideRequested ? ' Sent' : 'Contact'}
            </button>
          </div>

        </section>

      </main>

      {}
      <footer className="relative z-20 px-6 md:px-12 lg:px-24 py-8 bg-black border-t border-white/5 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 20L12 4L21 20H3Z" />
          </svg>
          <span className="font-outfit font-black tracking-widest text-md uppercase">TrekMate</span>
        </div>
        <div className="text-[10px] text-gray-500 font-light">
          &copy; {new Date().getFullYear()} TrekMate. All rights reserved.
        </div>
      </footer>

      {}
      {isMapExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md select-none animate-fadeIn">
          <div className="max-w-3xl w-full bg-[#121317] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 relative flex flex-col justify-between h-[85vh]">

            {}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4 select-text">
              <div>
                <span className="text-[10px] text-orange-400 font-black uppercase tracking-widest block leading-none">satellite route map</span>
                <h3 className="font-outfit text-xl font-black uppercase text-white leading-none mt-2">{trek.title} GPS Tracking</h3>
              </div>
              <button
                onClick={() => setIsMapExpanded(false)}
                className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition shadow-inner cursor-pointer"
              >
                
              </button>
            </div>

            {}
            <div className="flex-grow flex items-center justify-center relative w-full h-[60vh] bg-black/30 border border-white/5 rounded-xl p-4 select-none">
              <svg viewBox="0 0 500 500" className="w-full h-full text-gray-600 select-none">

                {}
                <path d="M 20 80 Q 120 150 200 60 T 350 40" fill="none" stroke="currentColor" strokeWidth="0.75" className="opacity-10" />
                <path d="M 40 180 Q 160 220 280 140 T 440 120" fill="none" stroke="currentColor" strokeWidth="0.75" className="opacity-15" />
                <path d="M 60 280 Q 200 320 340 240 T 480 200" fill="none" stroke="currentColor" strokeWidth="0.75" className="opacity-20" />
                <path d="M 120 380 Q 280 400 400 340 T 490 300" fill="none" stroke="currentColor" strokeWidth="0.75" className="opacity-10" />
                <path d="M 380 180 C 410 180 440 220 440 250 C 440 280 410 320 380 320 C 350 320 320 280 320 250 C 320 220 350 180 380 180 Z" fill="none" stroke="currentColor" strokeWidth="0.75" className="opacity-15" />
                <path d="M 380 200 C 400 200 420 230 420 250 C 420 270 400 300 380 300 C 360 300 340 270 340 250 C 340 230 360 200 380 200 Z" fill="none" stroke="currentColor" strokeWidth="0.75" className="opacity-20" />

                {}
                <line x1="250" y1="40" x2="250" y2="460" stroke="currentColor" strokeWidth="0.5" className="opacity-15" strokeDasharray="6 6" />
                <line x1="40" y1="250" x2="460" y2="250" stroke="currentColor" strokeWidth="0.5" className="opacity-15" strokeDasharray="6 6" />

                {}
                <path
                  id="expanded-route-path"
                  d="M 90 410 Q 180 360 220 290 T 320 230 T 410 130"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="5"
                  strokeDasharray="10 8"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_10px_rgba(249,115,22,0.9)] z-10"
                >
                  <animate attributeName="stroke-dashoffset" values="100;0" dur="8s" repeatCount="indefinite" />
                </path>

                {}
                <g>
                  <circle cx="90" cy="410" r="14" fill="#f97316" fillOpacity="0.15" className="animate-ping" style={{ animationDuration: '3s' }} />
                  <circle cx="90" cy="410" r="7" fill="#1e1e1e" stroke="#f97316" strokeWidth="2.5" className="drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]" />
                  <circle cx="90" cy="410" r="2.5" fill="#f97316" />
                </g>

                {}
                <circle cx="180" cy="340" r="6" fill="#f97316" className="drop-shadow-[0_0_4px_rgba(249,115,22,0.8)] animate-pulse" />
                <circle cx="280" cy="270" r="6" fill="#f97316" className="drop-shadow-[0_0_4px_rgba(249,115,22,0.8)] animate-pulse" />

                {}
                <g>
                  <circle cx="410" cy="130" r="18" fill="#10b981" fillOpacity="0.15" className="animate-pulse" />
                  <circle cx="410" cy="130" r="7" fill="#1e1e1e" stroke="#10b981" strokeWidth="2.5" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <path d="M 410 130 L 410 108 L 424 114 L 410 120 Z" fill="#10b981" stroke="#10b981" strokeWidth="1" />
                </g>

                {}
                <text x="90" y="440" fill="#9ca3af" fontSize="9" fontWeight="bold" textAnchor="middle">START POINT</text>
                <text x="410" y="90" fill="#10b981" fontSize="9" fontWeight="extrabold" textAnchor="middle">SUMMIT SUMMIT</text>
              </svg>
            </div>

            {}
            <div className="border-t border-white/5 pt-4 text-center select-text">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Active GPS coordinate feed updated real-time over satellite</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default TrekDetails;
