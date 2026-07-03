'use client';
import { UserRoute } from '../../components/RouteGuard';
import React, { useState, useEffect } from 'react';
import { Link } from '../../components/RouterCompatibility';
import Navbar from '../../components/Navbar';
import { getAllTreks, getUserBookings } from '../../utils/trekStorage';
import { useAuth } from '../../context/AuthContext';

const Explore = () => {
  // Main Hero Video
  const heroVideo = "https://videos.pexels.com/video-files/3121459/3121459-hd_1920_1080_24fps.mp4";

  // Trending Expeditions & Custom Organizer Treks
  const [trendingTreks, setTrendingTreks] = useState([]);

  useEffect(() => {
    const fetchTreks = async () => {
      const treks = await getAllTreks();
      const filtered = (Object.values(treks) as any[]).filter((t: any) =>
        ['anamudi', 'kudremukh', 'chembra', 'agasthyakoodam'].includes(t.id) ||
        !['munnar', 'wayanad', 'peak', 'vagamon', 'idukki', 'photography', 'anamudi', 'kudremukh', 'chembra', 'agasthyakoodam'].includes(t.id)
      );

      setTrendingTreks(filtered);
    };
    fetchTreks();
  }, []);

  const { sessions, activeRole } = useAuth();
  const user = sessions[activeRole] || sessions.trekker || null;
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (user) {
        const bookings = await getUserBookings();
        setUserBookings(bookings || []);
      }
    };
    fetchBookings();
  }, [user]);

  const getBookingStatus = (trekId: string, trekTitle: string) => {
    const booking = userBookings.find((b: any) => b.trekId === trekId || b.trekTitle === trekTitle);
    return booking ? booking.booking_status || 'confirmed' : null;
  };

  // Ultra-premium Compact Backpacking Gear
  const gearItems = [
    {
      id: 'poles',
      name: "Helinox FL135 Carbon",
      category: "Trekking Poles",
      price: "$149",
      weight: "340g (Pair)",
      packSize: "61 cm",
      material: "DAC Carbon",
      svgIcon: (
        <svg className="w-12 h-12 text-trek-brown opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 3L5 17M14 3l-9 9M5 21l3-3M21 7h-2M15 13h-2" />
          <circle cx="19" cy="3" r="1" fill="currentColor" />
          <circle cx="14" cy="3" r="1" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'tent',
      name: "Copper Spur HV UL2",
      category: "Ultralight Tent",
      price: "$549",
      weight: "1.22 kg",
      packSize: "50 x 15 cm",
      material: "Ripstop Nylon",
      svgIcon: (
        <svg className="w-12 h-12 text-trek-brown opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 20L12 4l9 16H3zM12 4v16M8 12h8" />
        </svg>
      )
    },
    {
      id: 'bag',
      name: "Questar 20F/-6C Sleeping",
      category: "Down Sleeping Bag",
      price: "$299",
      weight: "990g",
      packSize: "22 x 29 cm",
      material: "650 Nikwax Down",
      svgIcon: (
        <svg className="w-12 h-12 text-trek-brown opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="6" y="3" width="12" height="18" rx="6" />
          <path d="M6 9h12M10 3v6M14 3v6" />
        </svg>
      )
    },
    {
      id: 'gps',
      name: "Garmin inReach Mini 2",
      category: "Satellite Messenger",
      price: "$399",
      weight: "100g",
      packSize: "5 x 10 cm",
      material: "IPX7 Polycarbonate",
      svgIcon: (
        <svg className="w-12 h-12 text-trek-brown opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="7" y="5" width="10" height="15" rx="2" />
          <path d="M10 8h4M10 11h4M12 14v2M12 2v3M9 2h6" />
        </svg>
      )
    },
    {
      id: 'stove',
      name: "PocketRocket 2 Deluxe",
      category: "Micro-Stove",
      price: "$84",
      weight: "83g",
      packSize: "8 x 5 cm",
      material: "Alloy/Titanium",
      svgIcon: (
        <svg className="w-12 h-12 text-trek-brown opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v10M8 6h8M6 10l6-4 6 4M10 20h4" />
        </svg>
      )
    }
  ];

  // Gear controls
  const [gearIndex, setGearIndex] = useState(0);

  const handleNextGear = () => {
    if (gearIndex < gearItems.length - 2) {
      setGearIndex((prev) => prev + 1);
    }
  };

  const handlePrevGear = () => {
    if (gearIndex > 0) {
      setGearIndex((prev) => prev - 1);
    }
  };

  const partnerBrands = [
    {
      name: "Patagonia",
      icon: (
        <svg className="w-5 h-5 text-gray-500 group-hover:text-orange-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 17l4-5 4 4 6-9 6 10H2z" />
          <circle cx="15" cy="8" r="1.5" fill="currentColor" className="opacity-40" />
        </svg>
      )
    },
    {
      name: "The North Face",
      icon: (
        <svg className="w-5 h-5 text-gray-500 group-hover:text-orange-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3a9 9 0 019 9v9H12a9 9 0 01-9-9V3h9z" />
          <path d="M7 8a5 5 0 015-5v5H7z" fill="currentColor" className="opacity-30" />
        </svg>
      )
    },
    {
      name: "Columbia",
      icon: (
        <svg className="w-5 h-5 text-gray-500 group-hover:text-orange-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" />
          <rect x="14" y="4" width="6" height="6" rx="1" stroke="currentColor" />
          <rect x="4" y="14" width="6" height="6" rx="1" stroke="currentColor" />
          <rect x="14" y="14" width="6" height="6" rx="1" stroke="currentColor" />
        </svg>
      )
    },
    {
      name: "Arc'teryx",
      icon: (
        <svg className="w-5 h-5 text-gray-500 group-hover:text-orange-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      )
    },
    {
      name: "Garmin",
      icon: (
        <svg className="w-5 h-5 text-gray-500 group-hover:text-orange-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" />
        </svg>
      )
    },
    {
      name: "REI Co-op",
      icon: (
        <svg className="w-5 h-5 text-gray-500 group-hover:text-orange-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22a10 10 0 100-20 10 10 0 000 20z" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      )
    },
    {
      name: "Petzl",
      icon: (
        <svg className="w-5 h-5 text-gray-500 group-hover:text-orange-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12l4-4 4 4-4 4-4-4z" />
        </svg>
      )
    },
    {
      name: "National Geographic",
      icon: (
        <svg className="w-4 h-5 text-yellow-500" viewBox="0 0 16 20" fill="currentColor">
          <rect x="1" y="1" width="14" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      )
    }
  ];

  return (
    <div className="font-sans text-white bg-trek-dark min-h-screen selection:bg-trek-brown selection:text-white flex flex-col">
      <Navbar />
      <div className="animate-page flex-1 w-full">

      {/* TOP SECTION: Cinematic Hero Video (FULL SCREEN WIDTH & VIEWPORT HEIGHT) */}
      <section className="relative overflow-hidden w-full h-screen shadow-2xl z-20">

        {/* Background Video */}
        <div className="absolute inset-0 z-0 bg-trek-dark">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2"
            src={heroVideo}
          />
        </div>

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-trek-dark via-transparent to-black/35 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-10"></div>

        {/* Hero Text Details Floating Bottom Left */}
        <Link
          to="/trips"
          className="absolute bottom-12 left-6 md:left-12 lg:left-24 xl:left-32 z-30 max-w-3xl pr-6 block group cursor-pointer text-left select-none decoration-none notranslate"
          translate="no"
        >
          <span className="text-[10px] uppercase tracking-widest text-trek-brown font-extrabold bg-white/10 px-3 py-1 rounded-md border border-white/10 mb-3.5 inline-block animate-hero-text" style={{ animationDelay: '100ms' }}>
             ACTIVE EXPEDITIONS
          </span>
          <h2 className="font-outfit text-5xl md:text-8xl font-black uppercase text-white tracking-tight leading-[0.9] mb-4.5 group-hover:text-trek-brown transition-colors duration-300 animate-hero-text" style={{ animationDelay: '300ms' }}>
            EXPLORE THE WILDERNESS
          </h2>
          <p className="text-xs md:text-sm text-gray-300 font-light leading-relaxed mb-4 max-w-xl animate-hero-text" style={{ animationDelay: '500ms' }}>
            Scale majestic summits, organize custom multi-day treks, and track your telemetry with veteran guides.
          </p>
          <span className="bg-trek-brown hover:bg-trek-brown-hover text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition active:scale-95 inline-flex items-center gap-1.5 shadow-lg border-none animate-hero-text" style={{ animationDelay: '700ms' }}>
            Explore Trails &rarr;
          </span>
        </Link>
      </section>

      {/* Infinite Scrolling Partner/Truster Marquee */}
      <section className="w-full bg-[#0c0c0e]/95 border-y border-white/5 py-8 overflow-hidden select-none relative z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 mb-4 select-none">
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block text-center">
            Trusted by the world's leading outdoor brands and expeditions
          </span>
        </div>
        <div className="relative w-full flex overflow-x-hidden">
          {/* Left and Right blur overlays for transition fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-trek-dark to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-trek-dark to-transparent z-10 pointer-events-none" />

          <div className="flex animate-marquee gap-16 py-2">
            {/* First Set of Logos */}
            {partnerBrands.map((brand, i) => (
              <div key={`brand-1-${i}`} className="flex items-center gap-3.5 group cursor-pointer">
                {brand.icon}
                <span className="text-sm font-outfit font-black uppercase text-gray-500 group-hover:text-white transition-colors tracking-wide select-none">
                  {brand.name}
                </span>
              </div>
            ))}
            {/* Duplicate Set of Logos for Seamless Scrolling */}
            {partnerBrands.map((brand, i) => (
              <div key={`brand-2-${i}`} className="flex items-center gap-3.5 group cursor-pointer">
                {brand.icon}
                <span className="text-sm font-outfit font-black uppercase text-gray-500 group-hover:text-white transition-colors tracking-wide select-none">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area (Boxed content starts below the banner) */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-16 pb-24">

        {/* MIDDLE SECTION: Trending Expeditions (4-Column Layout) */}
        <section className="mb-20">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
            <div>
              <span className="text-trek-brown text-xs font-bold tracking-widest uppercase mb-1.5 block">Summits in Focus</span>
              <h2 className="font-outfit text-3xl md:text-4xl font-black uppercase tracking-tight leading-none text-white">Trending Expeditions</h2>
              <p className="text-gray-400 text-xs mt-1.5">The most coveted summits this month</p>
            </div>
            <a href="#" id="link-view-all" className="group text-trek-brown hover:text-white transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              View All
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </a>
          </div>

          {/* 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingTreks.map((trek) => (
              <div
                key={trek.id}
                className="relative h-[480px] rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] flex flex-col justify-end group shadow-2xl hover:border-white/20 transition-all duration-500"
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 z-0"
                  style={{ backgroundImage: `url('${trek.image}')` }}
                ></div>
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100 z-10"></div>

                {/* Badge Indicator Top Left */}
                <div className="absolute top-5 left-5 z-20">
                  <span className="bg-trek-brown text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                    {trek.badge}
                  </span>
                </div>

                {/* Pricing Overlay Top Right */}
                <div className="absolute top-5 right-5 z-20">
                  <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-md border border-white/10 shadow-md">
                    {trek.price}
                  </span>
                </div>

                {/* Card Content */}
                <div className="relative z-20 p-5 w-full">
                  <div className="mb-4">
                    {/* Location Tag */}
                    <span className="text-[10px] uppercase tracking-widest text-trek-brown font-bold flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {trek.location}
                    </span>

                    {/* Headline */}
                    <h3 className="font-outfit text-xl font-black text-white mt-1.5 uppercase tracking-wide leading-none">{trek.name}</h3>

                    {/* Details Row */}
                    <div className="flex items-center gap-3 mt-3 text-gray-400 text-xs font-light">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {trek.duration}
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-white/20"></span>
                      <span>Difficulty: <span className="text-gray-300 font-semibold">{trek.difficulty}</span></span>
                    </div>
                  </div>

                  {/* Twin CTA Buttons */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <Link
                      to={`/details/${trek.id}`}
                      id={`btn-details-${trek.id}`}
                      className="py-2.5 text-center rounded-md border border-white/10 hover:border-white/25 text-white hover:bg-white hover:text-black transition-all duration-300 text-xs font-bold uppercase tracking-wider bg-black/40 backdrop-blur-sm active:scale-98"
                    >
                      Details
                    </Link>
                    {getBookingStatus(trek.id, trek.name) === 'confirmed' ? (
                      <button disabled className="py-2.5 text-center rounded-md border border-green-500/50 bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
                        Joined
                      </button>
                    ) : getBookingStatus(trek.id, trek.name) === 'pending' ? (
                      <button disabled className="py-2.5 text-center rounded-md border border-yellow-500/50 bg-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-wider">
                        Pending
                      </button>
                    ) : getBookingStatus(trek.id, trek.name) === 'rejected' ? (
                      <button disabled className="py-2.5 text-center rounded-md border border-red-500/50 bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                        Rejected
                      </button>
                    ) : (
                      <Link
                        to={`/book/${trek.id}`}
                        id={`btn-join-${trek.id}`}
                        className="py-2.5 text-center rounded-md bg-trek-brown hover:bg-trek-brown-hover text-white transition-all duration-300 text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 animate-pulse"
                      >
                        Join Trip
                      </Link>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM SECTION: Asymmetrical Grid Widget Layout */}
        <section>
          {/* Section Header */}
          <div className="mb-8 border-b border-white/10 pb-4">
            <span className="text-trek-brown text-xs font-bold tracking-widest uppercase mb-1.5 block">Expedition Central</span>
            <h2 className="font-outfit text-3xl font-black uppercase tracking-tight leading-none text-white">Hub Widgets</h2>
            <p className="text-gray-400 text-xs mt-1.5">Real-time status updates and customized trail access</p>
          </div>

          {/* Asymmetrical Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

            {/* LEFT BLOCK: Real-time Gear Check Widget (Span 4) */}
            <div className="lg:col-span-4 flex flex-col justify-between bg-white/[0.01] border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
              <div>
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <svg className="w-5 h-5 text-trek-brown" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <h4 className="font-outfit text-md font-bold uppercase tracking-wider text-white">Real-time Gear Check</h4>
                </div>

                {/* Weather Rows */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between py-2.5 border-b border-white/5">
                    <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors font-medium">Munnar Status</a>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-200">18Â°C</span>
                      <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2.5 border-b border-white/5">
                    <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors font-medium">Vagamon Status</a>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-200">24Â°C</span>
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orange PRO TIP box */}
              <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col gap-1.5 shadow-inner">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Pro Tip</span>
                </div>
                <p className="text-[11px] text-amber-200/80 font-light leading-relaxed">
                  High humidity expected in Vagamon this weekend. Pack an extra moisture-wicking layer and water protection bags.
                </p>
              </div>
            </div>

            {/* RIGHT BLOCK: Asymmetrical Feature Banners stacked (Span 8) */}
            <div className="lg:col-span-8 flex flex-col gap-8">

              {/* Weekend Wanderer Landscape Banner Widget */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-end p-8 group shadow-2xl min-h-[220px]">
                {/* Background */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.02] z-0"
                  style={{ backgroundImage: "url('/explore_weekend_banner.png')" }}
                ></div>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-95 z-10"></div>

                {/* Content */}
                <div className="relative z-20">
                  <span className="text-[9px] uppercase tracking-widest text-trek-brown font-extrabold bg-white/10 px-2.5 py-1 rounded-md border border-white/10 mb-3 inline-block shadow-sm">
                    Special Event
                  </span>
                  <h3 className="font-outfit text-2xl md:text-3xl font-black uppercase text-white tracking-tight leading-none mb-2">
                    Weekend Wanderer
                  </h3>
                  <p className="text-xs text-gray-300 max-w-md font-light leading-relaxed mb-4">
                    Escape the weekly grind. Join our structured 2-day micro-expeditions specifically curated for working professionals.
                  </p>
                  <button
                    id="btn-weekend-wanderer"
                    className="group text-white hover:text-trek-brown text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    Explore Weekend Trips
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                  </button>
                </div>
              </div>

              {/* Curated Horizontal Gear Carousel widget */}
              <div className="bg-white/[0.01] border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between relative min-h-[300px]">

                {/* Widget Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
                  <div>
                    <h4 className="font-outfit text-md font-bold uppercase tracking-wider text-white">Ultra-Premium Compact Backpacking Gear</h4>
                    <p className="text-[11px] text-gray-400 mt-1">Lightweight. Curated for peak performance.</p>
                  </div>
                  {/* Carousel Navigation Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevGear}
                      disabled={gearIndex === 0}
                      className={`p-2 rounded-md border border-white/10 bg-black/20 hover:bg-white hover:text-black transition-colors ${gearIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextGear}
                      disabled={gearIndex >= gearItems.length - 2}
                      className={`p-2 rounded-md border border-white/10 bg-black/20 hover:bg-white hover:text-black transition-colors ${gearIndex >= gearItems.length - 2 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow items-stretch">
                  {gearItems.slice(gearIndex, gearIndex + 2).map((item) => (
                    <div
                      key={item.id}
                      className="relative bg-white/[0.02] border border-white/5 rounded-xl p-5 flex flex-col justify-between hover:bg-white/[0.04] transition-all duration-300 shadow-lg group"
                    >
                      {/* SVG Icon & Top Category */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-trek-brown font-bold block">{item.category}</span>
                          <h5 className="font-outfit text-lg font-black text-white leading-tight mt-1">{item.name}</h5>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 border border-white/10 group-hover:scale-105 transition-transform duration-300">
                          {item.svgIcon}
                        </div>
                      </div>

                      {/* Specifications Grid */}
                      <div className="border-t border-white/5 pt-4 mt-auto">
                        <div className="grid grid-cols-3 gap-2 text-center bg-black/20 rounded-lg p-2.5 border border-white/5 mb-4">
                          <div>
                            <span className="text-[9px] text-gray-500 block uppercase font-medium">Weight</span>
                            <span className="text-[11px] font-bold text-gray-300">{item.weight}</span>
                          </div>
                          <div className="border-x border-white/5">
                            <span className="text-[9px] text-gray-500 block uppercase font-medium">Pack size</span>
                            <span className="text-[11px] font-bold text-gray-300">{item.packSize}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-500 block uppercase font-medium">Material</span>
                            <span className="text-[11px] font-bold text-gray-300 truncate block">{item.material}</span>
                          </div>
                        </div>

                        {/* Pricing Tag & View Button */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-gray-500 uppercase font-medium leading-none">Price</span>
                            <span className="text-md font-black text-white mt-1">{item.price}</span>
                          </div>
                          <button className="px-4 py-1.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-200 hover:bg-white hover:text-black hover:border-white transition-all duration-300">
                            View details
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="px-6 md:px-12 lg:px-24 py-20 bg-black border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand & Newsletter */}
          <div className="md:col-span-1">
            <h4 className="font-outfit text-2xl font-black tracking-widest uppercase mb-6">TrekMate</h4>
            <p className="text-xs text-gray-400 mb-6 font-light leading-relaxed">Join our newsletter to get the latest updates on expeditions and gear.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email address"
                className="bg-white/5 border border-white/10 rounded-l-md px-4 py-3 w-full text-xs outline-none focus:border-trek-brown text-white placeholder-gray-500 transition-colors"
              />
              <button className="bg-trek-brown hover:bg-trek-brown-hover text-white px-5 py-3 rounded-r-md text-xs font-bold uppercase tracking-wider transition-colors">
                Subscribe
              </button>
            </div>
          </div>

          {/* Links: RESOURCES */}
          <div>
            <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Resources</h5>
            <ul className="flex flex-col gap-4 text-xs text-gray-400 font-light">
              <li><a href="#" className="hover:text-white transition-colors">Trail Guides</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gear Checklists</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safety Tips</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Weather Forecasts</a></li>
            </ul>
          </div>

          {/* Links: COMPANY */}
          <div>
            <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Company</h5>
            <ul className="flex flex-col gap-4 text-xs text-gray-400 font-light">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Links: CONNECT */}
          <div>
            <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Connect</h5>
            <ul className="flex flex-col gap-4 text-xs text-gray-400 font-light">
              <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-500 font-light">&copy; {new Date().getFullYear()} TrekMate. All rights reserved.</p>
          <div className="flex items-center gap-6 text-gray-400">
            <a href="#" className="hover:text-white text-xs font-bold tracking-widest">IG</a>
            <a href="#" className="hover:text-white text-xs font-bold tracking-widest">TW</a>
            <a href="#" className="hover:text-white text-xs font-bold tracking-widest">FB</a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default function Page(props) {
  return (
    <UserRoute>
      <Explore {...props} />
    </UserRoute>
  );
}
