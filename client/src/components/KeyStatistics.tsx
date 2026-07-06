import React, { useState, useEffect } from 'react';

const datasets = [
  [
    {
      value: "15K+",
      label: "Active Trekkers",
      icon: (
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      )
    },
    {
      value: "250+",
      label: "Summits Conquered",
      icon: (
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 21l8-18 6 12 3-5 5 11H2z" />
        </svg>
      )
    },
    {
      value: "120+",
      label: "Curated Trails",
      icon: (
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    {
      value: "4.9/5",
      label: "Average Rating",
      icon: (
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      )
    }
  ],
  [
    {
      value: "15+",
      label: "Years Experience",
      icon: (
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      value: "50+",
      label: "Expert Guides",
      icon: (
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      )
    },
    {
      value: "7",
      label: "Continents Explored",
      icon: (
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      )
    },
    {
      value: "1M+",
      label: "Kilometers Hiked",
      icon: (
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
        </svg>
      )
    }
  ]
];

const KeyStatistics = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev === 0 ? 1 : 0));
    }, 4500); 
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full py-28 bg-black overflow-hidden">
      {}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-100 z-0"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1920&auto=format&fit=crop')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-trek-dark via-[#111111]/40 to-trek-dark z-10"></div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {}
        <h2 className="font-outfit text-4xl md:text-5xl font-black text-center text-white mb-20 tracking-tight">
          Key Statistics at a Glance
        </h2>

        {}
        <div className="relative w-full h-32 md:h-36">
          {datasets.map((data, index) => {
            const isActive = index === activeIndex;
            return (
              <div 
                key={index}
                className={`absolute top-0 left-0 w-full grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10 border-x-0 md:border-x border-t border-b border-white/10 py-6 md:px-8 transition-all duration-1000 ease-in-out ${
                  isActive 
                    ? 'opacity-100 translate-y-0 pointer-events-auto' 
                    : 'opacity-0 translate-y-6 pointer-events-none'
                }`}
              >
                {data.map((stat, i) => (
                  <div key={i} className="flex flex-col items-center text-center px-4">
                    <div className="mb-4 text-orange-500">
                      {stat.icon}
                    </div>
                    <h3 className="font-outfit text-3xl md:text-4xl font-black text-white mb-1.5 tracking-tighter">
                      {stat.value}
                    </h3>
                    <p className="text-gray-400 text-xs md:text-sm font-semibold tracking-wide">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-16 text-white font-bold text-sm tracking-wider uppercase">
          <span className="hover:text-orange-500 transition-colors cursor-pointer">Expert Guides</span>
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
          <span className="hover:text-orange-500 transition-colors cursor-pointer">Safety First</span>
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
          <span className="hover:text-orange-500 transition-colors cursor-pointer">Sustainable Travel</span>
        </div>

      </div>
    </section>
  );
};

export default KeyStatistics;
