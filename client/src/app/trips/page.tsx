'use client';
import { UserRoute } from '../../components/RouteGuard';
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from '../../components/RouterCompatibility';
import Navbar from '../../components/Navbar';
import { getUserBookings } from '../../services/trekStorage';
import { useAuth } from '../../context/AuthContext';

const Trips = () => {
  const { sessions, activeRole } = useAuth();
  const user = sessions[activeRole] || null;
  const [tripsData, setTripsData] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchTreks = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/treks`);
        const data = await res.json();
        if (data.success && data.data) {
          
          const mappedTreks = data.data.map(t => ({
            id: t.id || t._id,
            title: t.title || t.name || 'Unknown Trek',
            location: t.location || 'Unknown Location',
            price: t.price || `₹${t.baseRate || 0}`,
            duration: t.duration || 'N/A',
            rating: parseFloat(t.rating) || 4.5,
            imageRating: 4.8, 
            difficultyBadge: `${t.difficulty || 'Moderate'} | ${t.duration || 'N/A'}`,
            category: t.difficulty === 'Easy' ? 'Camping' : 'Trekking',
            organizer: t.organizer || 'TrekMate Default',
            image: t.image || t.banner || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'
          }));
          setTripsData(mappedTreks);
        }
      } catch (error) {
        console.error('Failed to fetch dynamic treks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTreks();
  }, []);

  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest First');
  const [destFilter, setDestFilter] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState('Any');
  const [durationFilter, setDurationFilter] = useState('Any');

  
  const [visibleCount, setVisibleCount] = useState(6);

  
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'my-bookings' ? 'bookings' : 'explore';

  
  const [bookings, setBookings] = useState([]);

  
  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, selectedCategory, destFilter, budgetFilter, durationFilter]);
  
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user) {
        setBookings([]);
        return;
      }
      try {
        const data = await getUserBookings();
        setBookings(data);
      } catch (err) {
        console.error('Failed to load bookings from database:', err);
      }
    };
    fetchUserBookings();
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === 'bookings' && !user) {
      setSearchParams({});
    }
  }, [activeTab, user, setSearchParams]);

  
  const filteredTrips = tripsData.filter((trip: any) => {
    const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || trip.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesDest = destFilter === 'All' || trip.location.toLowerCase().includes(destFilter.toLowerCase());

    let matchesBudget = true;
    if (budgetFilter !== 'Any' && trip.price) {
      const priceVal = parseInt(trip.price.replace(/[₹,]/g, ''), 10);
      if (budgetFilter === 'under3k') matchesBudget = priceVal <= 3000;
      if (budgetFilter === 'over3k') matchesBudget = priceVal > 3000;
    }

    let matchesDuration = true;
    if (durationFilter !== 'Any') {
      if (durationFilter === '1day') matchesDuration = trip.duration === '1 Day';
      if (durationFilter === 'multiday') matchesDuration = trip.duration !== '1 Day';
    }

    return matchesSearch && matchesCategory && matchesDest && matchesBudget && matchesDuration;
  });

  return (
    <div className="font-sans text-white bg-trek-dark min-h-screen selection:bg-trek-brown selection:text-white pt-20 relative">

      {}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/trips_hero_blur.png')" }}
      >
        {}
        <div className="absolute inset-0 bg-black/75 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-trek-dark via-transparent to-black/35 z-10"></div>
      </div>

      {}
      <Navbar />

      {}
      <main className="relative z-20 px-6 md:px-12 lg:px-24 py-12 max-w-7xl mx-auto w-full select-text">

        {}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-white/10 pb-4 w-full gap-4">
          <div>
            <span className="text-trek-brown text-xs font-bold tracking-widest uppercase mb-1.5 block">Explore Trails</span>
            <h1 className="font-outfit text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">Trips & Adventures</h1>
          </div>
        </div>

        {}
        <div className="flex items-center gap-6 border-b border-white/5 pb-4 mb-8 select-none overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setSearchParams({})}
            className={`font-outfit text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all cursor-pointer bg-transparent border-none ${activeTab === 'explore'
                ? 'border-trek-brown text-white'
                : 'border-transparent text-gray-500 hover:text-white'
              }`}
          >
             Explore Trails
          </button>
          {user && (
            <button
              onClick={() => setSearchParams({ tab: 'my-bookings' })}
              className={`font-outfit text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all cursor-pointer bg-transparent border-none ${activeTab === 'bookings'
                  ? 'border-trek-brown text-white'
                  : 'border-transparent text-gray-500 hover:text-white'
                }`}
            >
               My Expeditions ({bookings.length})
            </button>
          )}
        </div>

        {}
        {activeTab === 'explore' ? (
          <>
            {}
            <div className="bg-[#121317]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-12 shadow-2xl flex flex-col gap-4">

              {}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-grow">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></span>
                  <input
                    type="text"
                    placeholder="Search destinations, treks, or hosts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3.5 text-xs text-white outline-none focus:border-trek-brown transition placeholder-gray-500 font-semibold"
                  />
                </div>
                <button
                  className="bg-trek-brown hover:bg-trek-brown-hover active:scale-95 text-white px-8 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md transition-all flex-shrink-0 cursor-pointer border-none"
                >
                  Search
                </button>
              </div>

              {}
              <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mr-2">Quick Tags:</span>
                {['All', 'Trekking', 'Camping', 'Weekend', 'Photography'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border transition-all cursor-pointer ${selectedCategory === cat
                        ? 'bg-trek-brown/10 border-trek-brown text-trek-brown font-black'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:text-white'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {}
              <div className="flex flex-col lg:flex-row gap-4 items-end justify-between border-t border-white/5 pt-4 select-none">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow w-full">

                  {}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black flex items-center gap-1">
                       Destination
                    </label>
                    <select
                      value={destFilter}
                      onChange={(e) => setDestFilter(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none cursor-pointer focus:border-trek-brown transition font-semibold"
                    >
                      <option value="All" className="bg-[#121317] text-white">All Kerala</option>
                      <option value="Vegamon" className="bg-[#121317] text-white">Vegamon</option>
                      <option value="Wayanad" className="bg-[#121317] text-white">Wayanad</option>
                      <option value="Idukki" className="bg-[#121317] text-white">Idukki</option>
                    </select>
                  </div>

                  {}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black flex items-center gap-1">
                       Budget Range
                    </label>
                    <select
                      value={budgetFilter}
                      onChange={(e) => setBudgetFilter(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none cursor-pointer focus:border-trek-brown transition font-semibold"
                    >
                      <option value="Any" className="bg-[#121317] text-white">Any Price</option>
                      <option value="under3k" className="bg-[#121317] text-white">Under ₹3,000</option>
                      <option value="over3k" className="bg-[#121317] text-white">Over ₹3,000</option>
                    </select>
                  </div>

                  {}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black flex items-center gap-1">
                      â± Duration
                    </label>
                    <select
                      value={durationFilter}
                      onChange={(e) => setDurationFilter(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none cursor-pointer focus:border-trek-brown transition font-semibold"
                    >
                      <option value="Any" className="bg-[#121317] text-white">Any Duration</option>
                      <option value="1day" className="bg-[#121317] text-white">1 Day</option>
                      <option value="multiday" className="bg-[#121317] text-white">2+ Days</option>
                    </select>
                  </div>

                </div>

                {}
                <button className="bg-trek-brown hover:bg-trek-brown-hover active:scale-95 text-white px-7 py-3 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md transition-all flex-shrink-0 w-full lg:w-max border-none cursor-pointer">
                  Apply Filters
                </button>
              </div>

            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTrips.slice(0, visibleCount).map((trip) => (
                <div
                  key={trip.id}
                  className="group flex flex-col justify-between bg-[#121317]/95 border border-white/5 rounded-2xl overflow-hidden shadow-2xl hover:border-white/15 hover:shadow-trek-brown/[0.03] transition-all duration-300 relative select-text"
                >
                  {}
                  <div className="h-48 w-full overflow-hidden relative">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-103"
                      style={{ backgroundImage: `url('${trip.image}')` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121317] via-transparent to-black/20"></div>

                    {}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1 shadow-md">
                         <span className="text-gray-100">{trip.imageRating}</span>
                      </span>
                    </div>

                    {}
                    <div className="absolute bottom-4 left-4 z-10 flex gap-2">
                      <span className="bg-trek-brown text-white text-[9px] font-extrabold px-2.5 py-1 rounded uppercase tracking-widest shadow-md">
                        {trip.difficultyBadge}
                      </span>
                    </div>
                  </div>

                  {}
                  <div className="p-5 flex-grow flex flex-col justify-between select-text">
                    <div>
                      {}
                      <div className="flex items-center justify-between text-gray-400 text-xs font-light mb-1.5">
                        <span className="flex items-center gap-1 text-[11px] text-trek-brown font-bold uppercase tracking-wider">
                           {trip.location}
                        </span>
                        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-300 font-medium">
                          {trip.category}
                        </span>
                      </div>

                      {}
                      <h3 className="font-outfit text-xl font-black text-white uppercase tracking-wide leading-tight group-hover:text-trek-brown transition-colors duration-300">
                        {trip.title}
                      </h3>

                      {}
                      <div className="flex items-center gap-4 text-xs font-light text-gray-400 mt-2.5 border-b border-white/5 pb-4">
                        <span className="flex items-center gap-1">
                           {trip.duration}
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full bg-white/20"></span>
                        <span className="flex items-center gap-1">
                           {trip.rating} Rating
                        </span>
                      </div>

                      {}
                      <div className="flex items-center justify-between py-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-[#1e1e1e] border border-white/10 flex items-center justify-center text-[10px] font-bold text-trek-brown shadow-inner">
                            {trip.organizer[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] text-gray-500 uppercase font-black leading-none">Host</span>
                            <span className="text-gray-300 font-bold mt-0.5">{trip.organizer}</span>
                          </div>
                        </div>
                        {}
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] text-gray-500 uppercase font-black leading-none">Price</span>
                          <span className="text-sm font-black text-white mt-0.5">{trip.price}</span>
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <Link to={`/details/${trip.id}`} className="py-2.5 text-center rounded-md border border-white/10 hover:border-white/25 text-white hover:bg-white hover:text-black transition-all duration-300 text-xs font-bold uppercase tracking-wider bg-black/40 backdrop-blur-sm">
                        Details
                      </Link>
                      {(() => {
                        const booking = bookings.find((b: any) => b.trekId === trip.id || b.trekTitle === trip.title);
                        const status = booking ? booking.booking_status || 'confirmed' : null;
                        if (status === 'confirmed') {
                          return (
                            <button disabled className="py-2.5 text-center rounded-md border border-green-500/50 bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
                              Joined
                            </button>
                          );
                        } else if (status === 'pending') {
                          return (
                            <button disabled className="py-2.5 text-center rounded-md border border-yellow-500/50 bg-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-wider">
                              Pending
                            </button>
                          );
                        } else if (status === 'rejected') {
                          return (
                            <button disabled className="py-2.5 text-center rounded-md border border-red-500/50 bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                              Rejected
                            </button>
                          );
                        } else {
                          return (
                            <Link to={`/book/${trip.id}`} className="py-2.5 text-center rounded-md bg-trek-brown hover:bg-trek-brown-hover text-white transition-all duration-300 text-xs font-bold uppercase tracking-wider shadow-md active:scale-95">
                              Join Trip
                            </Link>
                          );
                        }
                      })()}
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {}
            {filteredTrips.length === 0 && (
              <div className="text-center py-20 bg-[#121317]/50 rounded-2xl border border-white/5 shadow-2xl">
                <span className="text-4xl block mb-4"></span>
                <h3 className="font-outfit text-xl font-bold uppercase mb-2">No Expeditions Found</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">Try adjusting your filters or search terms to discover other Kerala trails.</p>
              </div>
            )}

            {}
            {visibleCount < filteredTrips.length && (
              <div className="flex justify-center mt-12 select-none">
                <button
                  onClick={() => setVisibleCount(prev => prev + 3)}
                  className="bg-white/5 border border-white/10 hover:bg-white hover:text-black hover:border-white text-gray-300 px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md active:scale-95 border-none cursor-pointer"
                >
                  Load More Adventures
                </button>
              </div>
            )}
          </>
        ) : (
          
          <div className="w-full">
            {bookings.length === 0 ? (
              
              <div className="text-center py-24 bg-[#121317]/80 border border-white/10 rounded-2xl p-6 shadow-2xl max-w-2xl mx-auto select-none">
                <span className="text-5xl block mb-5"></span>
                <h3 className="font-outfit text-xl md:text-2xl font-black uppercase text-white tracking-wide mb-2">No Active Bookings</h3>
                <p className="text-gray-400 text-xs md:text-sm font-light max-w-sm mx-auto leading-relaxed mb-8">
                  You haven't reserved slot permissions for any upcoming expeditions yet. Grab your gear and discover the wild trails!
                </p>
                <button
                  onClick={() => setSearchParams({})}
                  className="bg-trek-brown hover:bg-trek-brown-hover active:scale-95 text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-lg transition duration-200 cursor-pointer border-none"
                >
                  Browse Available Treks
                </button>
              </div>
            ) : (
              /* MY BOOKINGS GRID */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bookings.map((booking, idx) => (
                  <div
                    key={booking.ticketId || idx}
                    className="flex flex-col justify-between bg-[#121317]/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:border-white/20 transition-all duration-300"
                  >
                    {/* Image overlay */}
                    <div className="h-40 w-full overflow-hidden relative">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${booking.trekImage}')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121317] via-transparent to-black/25" />

                      <div className="absolute top-4 right-4 z-10 select-none">
                        <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                          Confirmed
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 z-10 select-none font-mono">
                        <span className="bg-black/60 border border-white/10 text-orange-400 text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                          {booking.ticketId}
                        </span>
                      </div>
                    </div>

                    {/* Booking Details Card body */}
                    <div className="p-5 flex-grow select-text flex flex-col justify-between">
                      <div>
                        {/* Title & Host */}
                        <div className="flex justify-between items-start gap-2 border-b border-white/5 pb-3.5 mb-3.5">
                          <div>
                            <h3 className="font-outfit text-lg font-black uppercase text-white leading-tight">{booking.trekTitle}</h3>
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mt-1"> {booking.trekLocation}</span>
                          </div>
                        </div>

                        {/* Booking specifics parameters grid */}
                        <div className="grid grid-cols-2 gap-3.5 text-[11px] text-gray-400 mb-4 select-none">
                          <div>
                            <span className="text-[7.5px] text-gray-500 font-black uppercase tracking-widest block mb-0.5">Trek Dates</span>
                            <span className="font-bold text-gray-200">{booking.trekDates}</span>
                          </div>
                          <div>
                            <span className="text-[7.5px] text-gray-500 font-black uppercase tracking-widest block mb-0.5">Seats Booked</span>
                            <span className="font-bold text-gray-200">{booking.seats} {booking.seats === 1 ? 'Seat' : 'Seats'}</span>
                          </div>
                          <div>
                            <span className="text-[7.5px] text-gray-500 font-black uppercase tracking-widest block mb-0.5">Booking Date</span>
                            <span className="font-bold text-gray-200">{booking.bookingDate}</span>
                          </div>
                          <div>
                            <span className="text-[7.5px] text-gray-500 font-black uppercase tracking-widest block mb-0.5">Paid Amount</span>
                            <span className="font-bold text-green-400 font-mono">₹{booking.payableAmount.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions Buttons Grid */}
                      <div className="flex flex-col gap-2.5 mt-3 select-none">
                        <Link
                          to={`/tracking/${booking.trekId}`}
                          className="w-full bg-trek-brown hover:bg-trek-brown-hover active:scale-95 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-1.5 text-center shadow"
                        >
                           Live satellite tracking
                        </Link>
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            to={`/confirmation/${booking.trekId}?ticketId=${booking.ticketId}&seats=${booking.seats}`}
                            className="w-full border border-white/10 hover:border-white/30 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[9px] bg-white/5 transition text-center"
                          >
                             View Ticket
                          </Link>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(booking.ticketId);
                              triggerToast('Ticket ID copied to clipboard!');
                            }}
                            className="w-full border border-white/10 hover:border-white/30 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[9px] bg-white/5 transition text-center cursor-pointer"
                          >
                             Copy Code
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {}
      <footer className="relative z-20 px-6 md:px-12 lg:px-24 py-8 bg-[#050505] border-t border-white/5 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-trek-brown" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 20L12 4L21 20H3Z" />
          </svg>
          <span className="font-outfit font-black tracking-widest text-md uppercase">TrekMate</span>
        </div>
        <div className="text-[10px] text-gray-500">
          &copy; {new Date().getFullYear()} TrekMate. All rights reserved.
        </div>
        {}
        <button className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold hover:bg-white hover:text-black transition shadow-inner">
          ?
        </button>
      </footer>

      {}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[120] bg-[#8b5a2b] border border-orange-500 text-white rounded-xl px-5 py-3.5 shadow-2xl flex items-center gap-2.5 select-none animate-slideUp font-sans text-xs">
          <span className="h-2 w-2 rounded-full bg-white animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};

export default function Page(props) {
  return (
    <UserRoute>
      <Trips {...props} />
    </UserRoute>
  );
}
