'use client';
import { ProtectedRoute } from '../../../components/RouteGuard';
import React, { useState, useEffect, useRef } from 'react';

import { useParams, useSearchParams, Link, useNavigate, useLocation } from '../../../components/RouterCompatibility';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/Navbar';
import { getTrekById } from '../../../services/trekStorage';
import axios from '../../../lib/axios';
import { ChatLayout } from '../../../components/chat/ChatLayout';

const BookingConfirmation = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { sessions, activeRole } = useAuth();
  const user = sessions[activeRole] || null;
  const navigate = useNavigate();

  const bookingState = location.state?.booking || null;
  const ticketId = bookingState?.ticketCode || searchParams.get('ticketId') || `TM-${Math.floor(1000 + Math.random() * 9000)}-${id.toUpperCase()}`;
  const qrCodeDataUrl = bookingState?.qrCode || null;
  const seats = parseInt(searchParams.get('seats') || '1', 10);

  const [trek, setTrek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchedQrCode, setFetchedQrCode] = useState(qrCodeDataUrl);

  useEffect(() => {
    const fetchTrekAndBooking = async () => {
      const data = await getTrekById(id);
      setTrek(data);
      
      
      if (!qrCodeDataUrl && ticketId) {
        try {
          const res = await axios.get(`/bookings/ticket/${ticketId}`);
          if (res.data.success && res.data.data.qrCode) {
            setFetchedQrCode(res.data.data.qrCode);
          }
        } catch (err) {
          console.error("Could not fetch booking for QR code", err);
        }
      }
      
      setLoading(false);
    };
    fetchTrekAndBooking();
  }, [id, ticketId, qrCodeDataUrl]);

  
  const [isCalling, setIsCalling] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [chatInput, setChatInput] = useState('');

  
  const baseTotal = trek ? trek.baseRate * seats : 0;
  const guideTotal = trek ? trek.guideRate * seats : 0;
  const gstTotal = Math.round((baseTotal + guideTotal) * 0.18);
  const payableAmount = baseTotal + guideTotal + gstTotal;

  const guideName = trek && trek.guide ? (typeof trek.guide === 'string' ? trek.guide : trek.guide.name) : 'Sarah Williams';
  const guideAvatar = trek && trek.guide ? (typeof trek.guide === 'string' ? trek.guide[0] : trek.guide.avatar) : 'S';

  if (loading) {
    return (
      <div className="font-sans text-white bg-trek-dark min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-orange-500 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!trek) {
    return (
      <div className="font-sans text-white bg-trek-dark min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-black uppercase text-red-500 mb-4">Expedition Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md">We couldn't locate the details for this booking. The server may be unreachable or the ID is invalid.</p>
        <button onClick={() => navigate('/explore')} className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold py-3 px-8 rounded-xl uppercase tracking-widest transition-all border-none cursor-pointer">
          Back to Explore
        </button>
      </div>
    );
  }

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  return (
    <div className="font-sans text-white bg-trek-dark min-h-screen selection:bg-trek-brown selection:text-white pt-20 relative overflow-hidden flex flex-col justify-between">

      {/* Wilderness Background overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/trips_details_bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/85 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-trek-dark via-transparent to-black/35 z-10"></div>
      </div>

      <Navbar />

      <main className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12 flex-grow w-full flex flex-col justify-center">

        <div className="w-full flex flex-col items-center animate-slideUp select-text">

          <style>{`
            @keyframes callWave {
              0% { transform: scaleY(0.3); }
              100% { transform: scaleY(1); }
            }
          `}</style>

          {/* Header section with green checkmark */}
          <div className="flex flex-col items-center text-center mb-8 select-none">
            <div className="h-16 w-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-4 text-green-400 text-3xl font-bold">
              
            </div>
            <h1 className="font-outfit text-3xl md:text-5xl font-black uppercase text-white tracking-tight leading-none mb-2">Adventure Confirmed!</h1>
            <p className="text-gray-400 text-xs md:text-sm font-light max-w-md">
              Your TrekMate expedition has been successfully booked. Get ready for the wild.
            </p>

            {/* Booking ID badge */}
            <div className="mt-4 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4.5 py-1.5 text-xs text-gray-300 font-mono">
              <span>Booking ID: <strong className="text-orange-400">{ticketId}</strong></span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(ticketId);
                  triggerToast('Booking ID copied to clipboard!');
                }}
                className="hover:text-white cursor-pointer active:scale-90 transition inline-flex items-center bg-transparent border-none p-0 outline-none"
                title="Copy ID"
              >
                <span className="text-[10px] ml-1"></span>
              </button>
            </div>
          </div>

          {/* Grid Layout matching Figma */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch">

            {/* LEFT COLUMN: Summary + Small Cards (Span 8) */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* 1. Trek summary card */}
              <div className="bg-[#121317]/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-5 flex flex-col md:flex-row gap-5 items-stretch select-text">
                {/* Left: Landscape Image */}
                <div className="h-32 w-full md:w-44 rounded-xl overflow-hidden flex-shrink-0 relative select-none">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${trek.image}')` }}
                  />
                  <div className="absolute inset-0 bg-black/25" />
                </div>
                {/* Right: Info */}
                <div className="flex-grow w-full flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-outfit text-xl font-black uppercase text-white leading-tight tracking-wide">{trek.title}</h3>
                      <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded select-none animate-pulse">
                        Seat Reserved
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs font-light text-gray-400 mt-3 select-none">
                      <div>
                        <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest block mb-0.5">Dates</span>
                        <span className="font-bold text-gray-300">{trek.dates}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest block mb-0.5">Pickup</span>
                        <span className="font-bold text-gray-300 truncate block">{trek.pickup}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info Footer */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-4 select-none">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-gray-500 font-black uppercase tracking-widest">Payment Status:</span>
                      <span className="font-extrabold text-green-400 uppercase">Successful</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-300">Paid: <strong>₹{payableAmount.toLocaleString('en-IN')}</strong></span>
                      <button
                        type="button"
                        onClick={() => triggerToast(`Breakdown: Base: ₹${baseTotal.toLocaleString('en-IN')}, Guide: ₹${guideTotal.toLocaleString('en-IN')}, GST: ₹${gstTotal.toLocaleString('en-IN')}`)}
                        className="text-orange-400 hover:text-orange-300 underline cursor-pointer active:scale-95 transition bg-transparent border-none"
                      >
                        View Breakdown
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Three small rows/cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 select-none">
                {/* What to Bring */}
                <div className="bg-[#121317]/70 border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-white/15 transition shadow-lg min-h-[160px]">
                  <div>
                    <div className="text-xl mb-2"></div>
                    <h4 className="font-outfit text-xs font-black uppercase text-white tracking-wider mb-1">What to Bring</h4>
                    <p className="text-[10px] text-gray-500 font-light leading-relaxed font-sans">Personal checklist for {trek.duration} wet conditions.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerToast(`Expedition packing guide emailed to: ${user?.email || 'your email'}`)}
                    className="text-orange-400 hover:text-orange-300 font-extrabold text-[10px] uppercase tracking-widest mt-4 text-left cursor-pointer active:translate-x-1 transition duration-200 bg-transparent border-none p-0 outline-none"
                  >
                    View Info &rarr;
                  </button>
                </div>

                {/* Weather Forecast */}
                <div className="bg-[#121317]/70 border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-white/15 transition shadow-lg min-h-[160px]">
                  <div>
                    <div className="text-xl mb-2"></div>
                    <h4 className="font-outfit text-xs font-black uppercase text-white tracking-wider mb-1">Weather Forecast</h4>
                    <span className="text-xs font-bold text-gray-200 block mt-2">{trek.temp}</span>
                    <p className="text-[10px] text-gray-500 font-light leading-relaxed mt-1">Safety Index: High. Pack rain protection.</p>
                  </div>
                </div>

                {/* Lead Organizer */}
                <div className="bg-[#121317]/70 border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-white/15 transition shadow-lg min-h-[160px]">
                  <div>
                    <div className="text-xl mb-2"></div>
                    <h4 className="font-outfit text-xs font-black uppercase text-white tracking-wider mb-1">Lead Organizer</h4>
                    <span className="text-xs font-bold text-gray-200 block mt-2">{trek.organizer}</span>
                    <p className="text-[10px] text-gray-500 font-light leading-relaxed mt-1">Trail Safety Certified.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCalling(true)}
                    className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-[9px] uppercase tracking-widest py-2 rounded-xl mt-4 w-full text-center cursor-pointer shadow-md transition duration-200 flex items-center justify-center gap-1.5 border-none"
                  >
                     Call Organizer
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Next Steps + Digital Ticket (Span 4) */}
            <div className="lg:col-span-4 flex flex-col gap-6 select-none">

              {/* Next Steps Panel */}
              <div className="bg-[#121317]/95 border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
                <span className="text-[9px] text-orange-400 font-black uppercase tracking-widest border-b border-white/5 pb-2.5">Next Steps</span>

                {/* Join Group Chat button */}
                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-none"
                >
                   Join Group Chat
                </button>

                {/* View Live Tracking button */}
                <Link
                  to={`/tracking/${id}`}
                  className="w-full border border-white/20 hover:border-white/40 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs bg-white/5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-center"
                >
                   View Live Tracking
                </Link>

                {/* Smaller CTA row */}
                <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3.5 mt-1 select-none text-gray-500">
                  <button
                    type="button"
                    onClick={() => triggerToast(`Digital pass barcode verified: ${ticketId}`)}
                    className="flex flex-col items-center gap-1.5 hover:text-white cursor-pointer active:scale-95 transition bg-transparent border-none"
                  >
                    <span className="text-sm"></span>
                    <span className="text-[8px] uppercase font-black tracking-wider">Ticket</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerToast(`Saved to calendar! Expedition dates: ${trek.dates}`)}
                    className="flex flex-col items-center gap-1.5 hover:text-white cursor-pointer active:scale-95 transition bg-transparent border-none"
                  >
                    <span className="text-sm"></span>
                    <span className="text-[8px] uppercase font-black tracking-wider">Calendar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      triggerToast('Expedition reference URL copied to clipboard!');
                    }}
                    className="flex flex-col items-center gap-1.5 hover:text-white cursor-pointer active:scale-95 transition bg-transparent border-none"
                  >
                    <span className="text-sm"></span>
                    <span className="text-[8px] uppercase font-black tracking-wider">Share</span>
                  </button>
                </div>
              </div>

              {/* Digital Ticket Card */}
              <div className="bg-[#121317]/95 border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center">
                <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-4">Digital Ticket</span>

                {/* QR Code */}
                <div className="h-28 w-28 bg-white rounded-xl p-2.5 flex items-center justify-center border border-white/5 relative shadow-inner mb-4">
                  {fetchedQrCode ? (
                    <img src={fetchedQrCode} alt="Digital Ticket QR Code" className="h-full w-full object-contain mix-blend-multiply" />
                  ) : (
                    <svg className="h-full w-full text-black opacity-50" viewBox="0 0 100 100">
                      <rect x="5" y="5" width="25" height="25" fill="black" stroke="white" strokeWidth="2" />
                      <rect x="70" y="5" width="25" height="25" fill="black" stroke="white" strokeWidth="2" />
                      <rect x="5" y="70" width="25" height="25" fill="black" stroke="white" strokeWidth="2" />
                      <rect x="40" y="10" width="10" height="40" fill="black" />
                      <rect x="15" y="45" width="30" height="10" fill="black" />
                      <rect x="55" y="45" width="15" height="25" fill="black" />
                      <rect x="75" y="80" width="15" height="15" fill="black" />
                      <rect x="40" y="70" width="15" height="10" fill="black" />
                    </svg>
                  )}
                </div>

                <div className="text-[9px] text-gray-400 font-mono mt-1 leading-none">{ticketId}</div>
                <div className="text-[8px] text-gray-600 uppercase font-black mt-3.5 tracking-wider">Ticket Class: Expedition Elite</div>
              </div>

            </div>

          </div>

          {/* 3. Bottom Grid: Meet Your Team + Community Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-8 select-text">

            {/* Meet Your Team */}
            <div className="bg-[#121317]/80 border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5 select-none">
                <h4 className="font-outfit text-xs font-black uppercase tracking-wider text-white">Meet Your Team</h4>
                <button type="button" onClick={() => triggerToast('Opening crew roster...')} className="text-[9px] text-orange-400 uppercase font-black cursor-pointer hover:underline bg-transparent border-none p-0 outline-none">View All</button>
              </div>

              {/* Row of avatars */}
              <div className="flex items-center gap-3 py-1 select-none">
                <div className="flex -space-x-2.5 overflow-hidden">
                  {['JD', 'AM', 'DK', 'SM'].map((init, i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-[#121317] bg-gradient-to-tr from-trek-brown/40 to-white/10 flex items-center justify-center text-[10px] font-black text-gray-200">
                      {init}
                    </div>
                  ))}
                  <div className="h-8 w-8 rounded-full border-2 border-[#121317] bg-orange-500/10 flex items-center justify-center text-[10px] font-black text-orange-400">
                    +3
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-light">7 Trekkers verified for this slot</span>
              </div>

              <blockquote className="text-[11px] italic text-gray-500 border-l border-white/10 pl-3 leading-relaxed mt-2 select-text">
                "The mountains are calling and I must go." — John Muir
              </blockquote>
            </div>

            {/* Community Feed */}
            <div className="bg-[#121317]/80 border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5 select-none">
                <h4 className="font-outfit text-xs font-black uppercase tracking-wider text-white">Community Feed</h4>
                <span className="text-[8px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-500 font-medium">Updates</span>
              </div>

              <div className="flex items-start gap-3 bg-white/[0.01] border border-white/5 rounded-xl p-3.5 select-none">
                <span className="text-xs"></span>
                <div>
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none block">Trail Guidelines</span>
                  <p className="text-[11px] text-gray-300 font-light leading-relaxed mt-1">
                    New eco-preservation regulations and waste bag compliance policies added.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => triggerToast('Opening community bulletin...')}
                className="text-[9px] text-orange-400 hover:text-orange-300 font-black uppercase tracking-widest text-left cursor-pointer active:translate-x-1 transition duration-200 select-none bg-transparent border-none p-0 outline-none"
              >
                Go to Feed &rarr;
              </button>
            </div>

          </div>

          {/* Centered Return to Dashboard Button */}
          <div className="mt-12 select-none">
            <button
              type="button"
              onClick={() => {
                navigate('/explore');
              }}
              className="bg-white/5 border border-white/10 hover:bg-white hover:text-black hover:border-white text-gray-300 px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md active:scale-95 cursor-pointer"
            >
              &larr; Return to Dashboard
            </button>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="relative z-20 px-6 md:px-12 lg:px-24 py-6 bg-[#050505] border-t border-white/5 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-trek-brown" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 20L12 4L21 20H3Z" />
          </svg>
          <span className="font-outfit font-black tracking-widest text-md uppercase">TrekMate</span>
        </div>
        <div className="text-[9px] text-gray-500 font-light">
          Secured Gateway Â© {new Date().getFullYear()} TrekMate. All rights reserved.
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[120] bg-orange-600 border border-orange-500 text-white rounded-xl px-5 py-3.5 shadow-2xl flex items-center gap-2.5 select-none animate-slideUp font-sans text-xs">
          <span className="h-2 w-2 rounded-full bg-white animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CALLING ORGANIZER OVERLAY MODAL */}
      {isCalling && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md select-none animate-fadeIn">
          <div className="max-w-xs w-full bg-[#121317] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center gap-6 relative animate-slideUp">

            <button
              type="button"
              onClick={() => setIsCalling(false)}
              className="absolute right-4 top-4 h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition shadow-inner cursor-pointer"
            >
              
            </button>

            <div className="relative mt-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-trek-brown to-amber-600 border border-white/20 flex items-center justify-center text-3xl font-black text-white shadow-xl animate-pulse">
                {trek.organizer[0]}
              </div>
              <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-[#121317] rounded-full" />
            </div>

            <div>
              <span className="text-[10px] text-green-400 font-black uppercase tracking-widest block leading-none mb-2 animate-pulse">Connecting Voice Call...</span>
              <h3 className="font-outfit text-lg font-black uppercase text-white leading-none mt-1">{trek.organizer}</h3>
              <span className="text-xs text-gray-500 block mt-2 font-medium font-mono">+91 98765 43210</span>
            </div>

            <div className="flex gap-1.5 h-8 items-center justify-center select-none">
              {[1.2, 2.5, 1.8, 2.8, 1.5, 2.2, 1.0].map((scale, i) => (
                <span
                  key={i}
                  className="w-[3px] bg-orange-500 rounded-full"
                  style={{
                    height: '16px',
                    transform: `scaleY(${scale})`,
                    animation: `callWave ${0.4 + i * 0.08}s ease-in-out infinite alternate`,
                    transformOrigin: 'center'
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsCalling(false)}
              className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider py-3 px-8 rounded-full cursor-pointer shadow-lg transition active:scale-95 w-full text-center"
            >
              End Call
            </button>

          </div>
        </div>
      )}

      {}
      {isChatOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-6 bg-black/95 backdrop-blur-md select-none animate-fadeIn">
          <div className="max-w-3xl w-full h-full md:h-[80vh] relative animate-slideUp">
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="absolute right-4 top-4 z-50 h-8 w-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition shadow-inner cursor-pointer text-white"
            >
              ✕
            </button>
            <ChatLayout singleRoomId={id} />
          </div>
        </div>
      )}

    </div>
  );
};

export default function Page(props) {
  return (
    <ProtectedRoute>
      <BookingConfirmation {...props} />
    </ProtectedRoute>
  );
}
