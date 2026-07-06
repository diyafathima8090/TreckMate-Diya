'use client';
import { UserRoute } from '../components/RouteGuard';
import React, { useRef, useState, useEffect } from 'react';
import { Link } from '../components/RouterCompatibility';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import Navbar from '../components/Navbar';
import KeyStatistics from '../components/KeyStatistics';
import axios from '../lib/axios';

const ScrollRevealParagraph = () => {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      
      
      const start = windowHeight * 0.9;
      const end = windowHeight * 0.2;

      const elementTop = rect.top;
      const totalRange = start - end;
      const currentScroll = start - elementTop;

      const rawProgress = currentScroll / totalRange;
      const clampedProgress = Math.min(Math.max(rawProgress, 0), 1);

      setProgress(clampedProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  
  const segments = [
    { text: "At ", highlight: false },
    { text: "TrekMate", highlight: true, brand: true },
    { text: ", our mission is to redefine outdoor adventure through ", highlight: false },
    { text: "curated expeditions", highlight: true },
    { text: " designed for the modern explorer. Each trail is mapped and vetted under ", highlight: false },
    { text: "rigorous safety checks", highlight: true },
    { text: ", ensuring peak security, ", highlight: false },
    { text: "expert navigation", highlight: true },
    { text: ", and seamless logistics. Grounded in a commitment to ", highlight: false },
    { text: "long-term environmental sustainability", highlight: true },
    { text: ", we minimize our footprint so that these majestic summits remain wild and pristine for generations to come.", highlight: false }
  ];

  
  const charactersList = [];
  segments.forEach(segment => {
    const chars = segment.text.split('');
    chars.forEach(char => {
      charactersList.push({
        char,
        highlight: segment.highlight,
        brand: segment.brand || false
      });
    });
  });

  const total = charactersList.length;

  return (
    <p
      ref={containerRef}
      className="font-outfit text-xl md:text-3xl lg:text-[34px] font-medium leading-relaxed md:leading-[1.6] text-center max-w-5xl mx-auto select-text tracking-tight px-4"
    >
      {charactersList.map((item, index) => {
        const charThreshold = index / total;
        
        const range = 0.15;

        let opacity = 0.18; 
        let colorClass = "text-white/20";
        let weightClass = "font-medium";

        if (progress > charThreshold) {
          const fadeVal = (progress - charThreshold) / range;
          const clampedFade = Math.min(Math.max(fadeVal, 0), 1);

          opacity = 0.18 + clampedFade * 0.82; 

          if (item.brand) {
            colorClass = "text-trek-brown transition-colors duration-300";
            weightClass = "font-black";
          } else if (item.highlight) {
            colorClass = "text-white transition-colors duration-300";
            weightClass = "font-bold";
          } else {
            colorClass = "text-gray-300";
            weightClass = "font-medium";
          }
        } else {
          
          if (item.brand) {
            colorClass = "text-trek-brown/20";
            weightClass = "font-black";
          } else if (item.highlight) {
            colorClass = "text-white/20";
            weightClass = "font-bold";
          } else {
            colorClass = "text-white/10";
            weightClass = "font-medium";
          }
        }

        return (
          <span
            key={index}
            className={`${colorClass} ${weightClass} transition-all duration-200 select-text`}
            style={{ opacity }}
          >
            {item.char}
          </span>
        );
      })}
    </p>
  );
};

const Home = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 60, watchDrag: false }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
    Fade()
  ]);
  const [banners, setBanners] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    
    const fetchBanners = async () => {
      try {
        const res = await axios.get('/content/banners');
        if (res.data && res.data.success) {
          const activeBanners = res.data.data.filter(b => b.isActive);
          if (activeBanners.length > 0) {
            setBanners(activeBanners);
            return;
          }
        }
      } catch (err) {
        console.error("Error fetching banners:", err);
      }
      
      
      setBanners([
        { imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop' },
        { imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1920&auto=format&fit=crop' },
        { imageUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1920&auto=format&fit=crop' },
        { imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920&auto=format&fit=crop' }
      ]);
    };
    
    fetchBanners();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <div className="font-sans text-white bg-trek-dark min-h-screen selection:bg-trek-brown selection:text-white flex flex-col">
      {}
      <Navbar />
      <div className="animate-page flex-1 w-full">

        {}
        <section className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden">
          {}
          <div className="absolute inset-0 z-0 overflow-hidden bg-trek-dark">
            <div className="w-full h-full" ref={emblaRef}>
              <div className="flex h-full w-full" style={{ touchAction: 'none' }}>
                {banners.map((banner, index) => (
                  <div
                    className="flex-[0_0_100%] min-w-0 relative h-full w-full overflow-hidden"
                    key={index}
                  >
                    {banner.link ? (
                      <Link to={banner.link} className="absolute inset-0 z-20"></Link>
                    ) : null}
                    <figure
                      className="absolute inset-0 w-full h-full transition-transform ease-out"
                      style={{
                        transform: selectedIndex === index ? 'scale(1.1)' : 'scale(1)',
                        transitionDuration: '8000ms'
                      }}
                    >
                      <img
                        className="absolute block w-full h-full object-cover"
                        src={banner.imageUrl}
                        alt={banner.title || `Hero background ${index + 1}`}
                      />
                    </figure>
                  </div>
                ))}
              </div>
            </div>
            {}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-trek-dark via-transparent to-black/30 z-10 pointer-events-none"></div>
          </div>

          {}
          <div className="relative z-20 flex-grow flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-32 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">

              {}
              <main className="lg:col-span-7 flex flex-col justify-center text-left">
                <h1 className="font-outfit text-5xl md:text-8xl lg:text-[96px] font-black tracking-tight leading-[1.02] mb-6 uppercase drop-shadow-sm flex flex-col">
                  <span className="text-white animate-hero-text" style={{ animationDelay: '100ms' }}>Explore.</span>
                  <span className="text-white/90 animate-hero-text" style={{ animationDelay: '300ms' }}>Connect.</span>
                  <span className="text-white animate-hero-text" style={{ animationDelay: '500ms' }}>Conquer.</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-xl font-light leading-relaxed animate-hero-text" style={{ animationDelay: '700ms' }}>
                  Embark on unforgettable journeys across the globe's most majestic peaks. Discover new limits, map your trails, and forge lifelong connections.
                </p>
                <div className="animate-hero-text" style={{ animationDelay: '900ms' }}>
                  <Link
                    to="/trips"
                    id="btn-start-journey"
                    className="group bg-trek-brown hover:bg-trek-brown-hover text-white px-9 py-4 rounded-md font-semibold tracking-wider uppercase transition-all duration-300 text-sm shadow-xl flex items-center gap-2 hover:translate-x-1 w-max active:scale-95"
                  >
                    Start Your Journey
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">&rarr;</span>
                  </Link>
                </div>
              </main>

              {/* Right Column (Subtle Figma Presentation Card or empty spacer) */}
              <div className="lg:col-span-5 hidden lg:flex justify-end pr-6 animate-hero-text" style={{ animationDelay: '1100ms' }}>
                <div className="bg-white/[0.03] border border-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-xs shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] uppercase tracking-widest text-trek-brown font-bold">Active Expedition</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  </div>
                  <h4 className="font-outfit text-xl font-semibold mb-2">Matterhorn Ascent</h4>
                  <p className="text-xs text-gray-400 font-light mb-4 leading-relaxed">
                    Join a crew of 8 veteran trekkers as they tackle the legendary Zmutt Ridge this July.
                  </p>
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <div className="flex -space-x-2">
                      <div className="h-7 w-7 rounded-full bg-gray-600 border border-trek-dark flex items-center justify-center text-[10px] font-bold flex-shrink-0">JD</div>
                      <div className="h-7 w-7 rounded-full bg-trek-brown border border-trek-dark flex items-center justify-center text-[10px] font-bold flex-shrink-0">AM</div>
                      <div className="h-7 w-7 rounded-full bg-gray-500 border border-trek-dark flex items-center justify-center text-[10px] font-bold flex-shrink-0">LK</div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">2 Slots Left</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Multi-Column Section */}
          <div className="relative z-20 px-6 md:px-12 lg:px-24 pb-12 w-full">
            <div className="border-t border-white/10 pt-10 grid grid-cols-1 md:grid-cols-3 gap-8">

              <div className="group cursor-pointer bg-white/[0.01] border border-white/5 hover:border-white/20 hover:bg-white/[0.03] backdrop-blur-sm rounded-xl p-6 transition-all duration-300 animate-hero-text" style={{ animationDelay: '1300ms' }}>
                <div className="flex items-end justify-between border-b border-white/10 pb-3 mb-4">
                  <span className="font-outfit text-3xl font-extrabold text-white/50 group-hover:text-white transition-colors duration-300">01</span>
                  <span className="text-xs uppercase tracking-widest font-semibold text-gray-400 group-hover:text-white transition-colors duration-300">Alpine Treks</span>
                </div>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Challenge yourself with high-altitude climbs and pristine glacial pathways guided by seasoned mountaineers.
                </p>
              </div>

              <div className="group cursor-pointer bg-white/[0.01] border border-white/5 hover:border-white/20 hover:bg-white/[0.03] backdrop-blur-sm rounded-xl p-6 transition-all duration-300 animate-hero-text" style={{ animationDelay: '1500ms' }}>
                <div className="flex items-end justify-between border-b border-white/10 pb-3 mb-4">
                  <span className="font-outfit text-3xl font-extrabold text-white/50 group-hover:text-white transition-colors duration-300">02</span>
                  <span className="text-xs uppercase tracking-widest font-semibold text-gray-400 group-hover:text-white transition-colors duration-300">Trail Mapping</span>
                </div>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Navigate with confidence using our advanced digital maps, featuring topographical overlays and real-time conditions.
                </p>
              </div>

              <div className="group cursor-pointer bg-white/[0.01] border border-white/5 hover:border-white/20 hover:bg-white/[0.03] backdrop-blur-sm rounded-xl p-6 transition-all duration-300 animate-hero-text" style={{ animationDelay: '1700ms' }}>
                <div className="flex items-end justify-between border-b border-white/10 pb-3 mb-4">
                  <span className="font-outfit text-3xl font-extrabold text-white/50 group-hover:text-white transition-colors duration-300">03</span>
                  <span className="text-xs uppercase tracking-widest font-semibold text-gray-400 group-hover:text-white transition-colors duration-300">Group Expeditions</span>
                </div>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Join like-minded adventurers in curated group travels, forging friendships that last long after the descent.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* DISCOVER SECTION */}
        <section className="px-6 md:px-12 lg:px-24 py-28 bg-trek-dark border-t border-white/5">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <p className="text-trek-brown text-xs font-bold tracking-widest uppercase mb-3">Discover</p>
              <h2 className="font-outfit text-4xl md:text-5xl font-black tracking-tight uppercase">Choose Your Path</h2>
            </div>
            <a href="#" className="group text-gray-400 hover:text-white transition-colors mt-6 md:mt-0 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              View all destinations
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </a>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Link
              to="/details/munnar"
              className="group relative h-[480px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl cursor-pointer block"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('/explore_green_ridge.png')" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <span className="text-[10px] uppercase tracking-widest text-trek-brown font-bold mb-2 block">Alpine Challenge</span>
                <h3 className="font-outfit text-2xl font-bold tracking-wide text-white">Mountain Trekking</h3>
                <p className="text-xs text-gray-400 font-light mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-h-0 group-hover:max-h-16 overflow-hidden leading-relaxed">
                  Scale high-altitude passes, navigate glacial crevasses, and stand on the rooftop of the world.
                </p>
              </div>
            </Link>

            {/* Card 2 */}
            <Link
              to="/details/wayanad"
              className="group relative h-[480px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl cursor-pointer block"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('/explore_glowing_tent.png')" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <span className="text-[10px] uppercase tracking-widest text-trek-brown font-bold mb-2 block">Serene Escapes</span>
                <h3 className="font-outfit text-2xl font-bold tracking-wide text-white">Lakeside Camping</h3>
                <p className="text-xs text-gray-400 font-light mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-h-0 group-hover:max-h-16 overflow-hidden leading-relaxed">
                  Unwind under a blanket of stars alongside mirror-like glacial lakes in complete tranquility.
                </p>
              </div>
            </Link>

            {/* Card 3 */}
            <Link
              to="/details/vagamon"
              className="group relative h-[480px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl cursor-pointer block"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('/explore_chembra_peak.png')" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <span className="text-[10px] uppercase tracking-widest text-trek-brown font-bold mb-2 block">Untamed Wilderness</span>
                <h3 className="font-outfit text-2xl font-bold tracking-wide text-white">Forest Trails</h3>
                <p className="text-xs text-gray-400 font-light mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-h-0 group-hover:max-h-16 overflow-hidden leading-relaxed">
                  Wander through ancient pine woods, mossy paths, and hidden valley streams.
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* EXPEDITIONS SECTION */}
        <section className="px-6 md:px-12 lg:px-24 pt-28 pb-4 bg-trek-dark border-t border-white/5">
          {/* Split Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
            <div className="lg:w-1/2">
              <span className="text-trek-brown text-xs font-bold tracking-widest uppercase mb-3 block">Our Philosophy</span>
              <h2 className="font-outfit text-4xl md:text-5xl font-black tracking-tight uppercase mb-4 leading-none">Trekking Expeditions</h2>
              <p className="text-trek-brown text-lg font-medium tracking-wide">Strategically Crafted & Safely Guided.</p>
            </div>
            <div className="lg:w-1/2">
              <p className="text-gray-400 text-base font-light leading-relaxed">
                Every route is meticulously planned by our veteran guides to ensure a perfect balance of thrill and safety. Embark on a transformative journey where every step is supported by expert logistics and profound respect for nature.
              </p>
            </div>
          </div>

        </section>

        {/* Premium Vision / Introduction Section with Scroll-linked character reveal */}
        <section className="w-full bg-[#070708] border-b border-white/5 pt-12 pb-36 px-6 md:px-12 lg:px-24 select-text relative z-20 overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-trek-brown/[0.02] blur-[150px] rounded-full pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <ScrollRevealParagraph />
          </div>
        </section>

        <KeyStatistics />

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
      <Home {...props} />
    </UserRoute>
  );
}
