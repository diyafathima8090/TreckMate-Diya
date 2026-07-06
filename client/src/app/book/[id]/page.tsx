'use client';
import { UserRoute } from '../../../components/RouteGuard';
import React, { useState, useEffect } from 'react';

import { useParams, Link, useNavigate } from '../../../components/RouterCompatibility';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/Navbar';
import { getTrekById } from '../../../services/trekStorage';


const BookTrip = () => {
  const { id } = useParams();
  const { sessions } = useAuth();
  const user = sessions.trekker;
  const navigate = useNavigate();
  const [trek, setTrek] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const [seats, setSeats] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);
  useEffect(() => {
    const fetchTrek = async () => {
      const data = await getTrekById(id);
      setTrek(data);
      setLoading(false);
    };
    fetchTrek();
  }, [id]);

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

  
  const baseTotal = trek ? trek.baseRate * seats : 0;
  const guideTotal = trek ? trek.guideRate * seats : 0;
  const gstTotal = Math.round((baseTotal + guideTotal) * 0.18);
  const payableAmount = baseTotal + guideTotal + gstTotal;

  
  const handleProceedSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your phone number.');
      return;
    }
    navigate(`/confirm-booking/${id}`, {
      state: {
        seats,
        fullName,
        email,
        phone,
        emergencyPhone,
        payableAmount,
        baseTotal,
        guideTotal,
        gstTotal
      }
    });
  };

  return (
    <div className="font-sans text-white bg-trek-dark min-h-screen selection:bg-trek-brown selection:text-white pt-20 relative overflow-hidden flex flex-col justify-between">

      {}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/trips_details_bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/85 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-trek-dark via-transparent to-black/35 z-10"></div>
      </div>

      <Navbar />

      <main className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12 flex-grow w-full flex flex-col justify-center">

        {}
        <div className="mb-8 border-b border-white/10 pb-4">
          <span className="text-trek-brown text-xs font-bold tracking-widest uppercase mb-1.5 block">Booking Portal</span>
          <h1 className="font-outfit text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-none">Enter Booking Details</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-stretch">

          {}
          <section className="flex-1 bg-[#121317]/90 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between select-text">

            <div>
              {}
              <div className="h-44 w-full rounded-xl overflow-hidden relative mb-5 select-none">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${trek.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121317] via-transparent to-transparent opacity-80" />
                <span className="absolute bottom-4 left-4 z-10 bg-trek-brown text-white text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-widest">
                  {trek.duration}
                </span>
              </div>

              {}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-outfit text-2xl font-black uppercase text-white leading-none tracking-wide">{trek.title}</h3>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1 block">
                     {trek.location}
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded px-2.5 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  {trek.organizer}
                </div>
              </div>

              {}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-6 select-none flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block leading-none">Trek Participants</span>
                  <span className="text-[9px] text-gray-500 mt-1 block">Change number of seats</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => seats > 1 && setSeats(seats - 1)}
                    disabled={!user}
                    className="h-8 w-8 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 flex items-center justify-center font-bold text-lg select-none cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-outfit text-lg font-black w-6 text-center">{seats}</span>
                  <button
                    onClick={() => seats < 10 && setSeats(seats + 1)}
                    disabled={!user}
                    className="h-8 w-8 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 flex items-center justify-center font-bold text-lg select-none cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {}
              <div className="border-t border-white/5 pt-4 flex flex-col gap-2.5">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Pricing Breakdown</span>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-light">Base Rate ({seats} {seats === 1 ? 'seat' : 'seats'})</span>
                  <span className="font-bold text-gray-300">₹{(baseTotal).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-light">Certified Guide Charge</span>
                  <span className="font-bold text-gray-300">₹{(guideTotal).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-light">GST / Service Tax (18%)</span>
                  <span className="font-bold text-gray-300">₹{(gstTotal).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {}
            <div className="border-t border-white/10 pt-5 mt-6 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-black leading-none">Total Payable</span>
                <span className="text-[9px] text-trek-brown uppercase font-semibold mt-1 tracking-wider">All Taxes Included</span>
              </div>
              <span className="font-outfit text-2xl font-black text-white">₹{payableAmount.toLocaleString('en-IN')}</span>
            </div>

          </section>

          {}
          <section className="flex-1 bg-[#121317]/95 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between min-h-[420px]">

            {!user ? (
              
              <div className="h-full flex flex-col justify-center items-center text-center p-4 select-none">
                <span className="text-4xl block mb-4"></span>
                <h3 className="font-outfit text-xl font-bold uppercase tracking-wide text-white mb-2">Authentication Required</h3>
                <p className="text-gray-400 text-xs max-w-xs leading-relaxed mb-6 font-light">
                  Please log in or create an account to secure your booking details and proceed.
                </p>
                <Link
                  to={`/login?redirect=/book/${id}`}
                  className="bg-trek-brown hover:bg-trek-brown-hover text-white text-xs font-bold uppercase tracking-wider px-8 py-3 rounded-xl shadow-lg active:scale-95 transition-all select-none"
                >
                  Sign In to Continue
                </Link>
              </div>
            ) : (
              
              <form onSubmit={handleProceedSubmit} className="h-full flex flex-col justify-between select-text gap-6">

                <div>
                  <h3 className="font-outfit text-xl font-bold uppercase tracking-wide text-white mb-2">Participant Details</h3>
                  <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">
                    Please provide your contact information. These details will be verified by the lead guide.
                  </p>

                  {}
                  {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3.5 flex items-center gap-2 text-xs mb-4 animate-pulse select-none">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    {}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black select-none">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Alex Mercer"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-trek-brown hover:border-white/20 transition font-semibold placeholder-gray-600"
                      />
                    </div>

                    {}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black select-none">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="alex@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-trek-brown hover:border-white/20 transition font-semibold placeholder-gray-600"
                      />
                    </div>

                    {}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black select-none">Phone Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-trek-brown hover:border-white/20 transition font-semibold placeholder-gray-600 font-mono"
                        />
                      </div>

                      {}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black select-none">Emergency Contact</label>
                        <input
                          type="tel"
                          placeholder="Optional"
                          value={emergencyPhone}
                          onChange={(e) => setEmergencyPhone(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-trek-brown hover:border-white/20 transition font-semibold placeholder-gray-600 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <button
                  type="submit"
                  className="w-full bg-trek-brown hover:bg-trek-brown-hover text-white font-bold py-4 rounded-xl uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(139,90,43,0.35)] hover:shadow-[0_0_25px_rgba(139,90,43,0.55)] transition-all duration-300 select-none flex items-center justify-center gap-2 mt-8 active:scale-[0.98] cursor-pointer border-none"
                >
                  Proceed to Confirm Booking
                </button>

              </form>
            )}

          </section>

        </div>

      </main>

      {}
      <footer className="relative z-20 px-6 md:px-12 lg:px-24 py-6 bg-[#050505] border-t border-white/5 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-trek-brown" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 20L12 4L21 20H3Z" />
          </svg>
          <span className="font-outfit font-black tracking-widest text-md uppercase">TrekMate</span>
        </div>
        <div className="text-[9px] text-gray-500 font-light">
          Secured Gateway &copy; {new Date().getFullYear()} TrekMate. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default function Page(props) {
  return (
    <UserRoute>
      <BookTrip {...props} />
    </UserRoute>
  );
}
