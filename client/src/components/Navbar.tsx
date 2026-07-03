import React, { useState, useEffect } from 'react';
import { Link, useLocation } from './RouterCompatibility';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from '../utils/axios';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const { sessions, loading, logout, activeRole, setActiveRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const user = sessions[activeRole] || null;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const [unreadCount, setUnreadCount] = useState(0);
  const [muteNotifications, setMuteNotifications] = useState(false);

  useEffect(() => {
    setMuteNotifications(localStorage.getItem('trekmate_notif_mute') === 'true');
  }, [location.pathname]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) {
        setUnreadCount(0);
        return;
      }
      try {
        const res = await axios.get('/notifications');
        if (res.data.success) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        console.error('Error fetching unread notifications count in Navbar:', err);
      }
    };

    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout(user?.role || 'trekker');
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${isScrolled
          ? 'bg-[#0a0a0a]/80 backdrop-blur-md shadow-lg py-4'
          : 'bg-transparent py-6'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between relative">

        {/* Logo Section */}
        <Link to="/" id="nav-logo" className="flex items-center gap-3 text-white group z-50 relative">
          <svg className="w-8 h-8 text-white transition-transform duration-500 group-hover:rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
          </svg>
          <span className="font-outfit font-black tracking-widest text-xl uppercase">TrekMate</span>
        </Link>

        {/* Navigation Menu Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wider uppercase text-gray-300">
          <Link
            to="/"
            id="nav-link-home"
            className={`hover:text-white transition duration-300 relative py-1 group ${isActive('/') ? 'text-white font-bold' : ''
              }`}
          >
            Home
            <span
              className={`absolute bottom-0 left-0 h-0.5 bg-trek-brown transition-all duration-300 ${isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
            ></span>
          </Link>
          <Link
            to="/explore"
            id="nav-link-explore"
            className={`hover:text-white transition duration-300 relative py-1 group ${isActive('/explore') ? 'text-white font-bold' : ''
              }`}
          >
            Explore
            <span
              className={`absolute bottom-0 left-0 h-0.5 bg-trek-brown transition-all duration-300 ${isActive('/explore') ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
            ></span>
          </Link>
          <Link
            to="/trips"
            id="nav-link-trips"
            className={`hover:text-white transition duration-300 relative py-1 group ${isActive('/trips') ? 'text-white font-bold' : ''
              }`}
          >
            Trips
            <span
              className={`absolute bottom-0 left-0 h-0.5 bg-trek-brown transition-all duration-300 ${isActive('/trips') ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
            ></span>
          </Link>
          {(user?.role === 'organizer' || user?.role === 'admin') && (
            <Link
              to="/organizer-dashboard"
              id="nav-link-dashboard"
              className={`hover:text-white transition duration-300 relative py-1 group ${isActive('/organizer-dashboard') ? 'text-white font-bold' : ''
                }`}
            >
              Dashboard
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-trek-brown transition-all duration-300 ${isActive('/organizer-dashboard') ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
              ></span>
            </Link>
          )}
        </div>

        {/* Dynamic CTA Portal Button / Profile Dropdown & Mobile Toggle */}
        <div className="relative flex items-center gap-4 z-50">
          {loading ? (
            <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5 animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center gap-3">
              {/* Notification Bell Icon */}
              <Link
                to="/notifications"
                className="p-2 text-gray-400 hover:text-white transition duration-200 cursor-pointer relative flex items-center justify-center"
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && !muteNotifications && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-trek-brown rounded-full border border-[#0a0a0a]" />
                )}
              </Link>

              {/* Profile Avatar Trigger */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="h-10 w-10 rounded-full border border-white/25 bg-gradient-to-tr from-trek-brown/30 to-white/10 hover:border-white/50 transition-all duration-300 flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 active:scale-95 overflow-hidden relative"
              >
                <svg className="w-5 h-5 text-gray-300 absolute inset-0 m-auto hover:text-white transition-colors z-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                {user.profileImage && user.profileImage !== 'null' && user.profileImage !== 'undefined' && (
                  <img 
                    src={user.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover relative z-10" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <>
                  {/* Invisible Overlay to catch clicks and close dropdown */}
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-[#121317]/95 border border-white/10 p-2 shadow-2xl z-50 flex flex-col gap-1.5 select-text origin-top-right">

                    {/* User info header */}
                    <div className="px-3 py-2 border-b border-white/5 flex flex-col gap-0.5">
                      <span className="text-xs font-black text-white truncate uppercase">{user.name}</span>
                      <span className="text-[10px] text-gray-500 truncate font-light">@{user.username}</span>
                      <span className="text-[9px] uppercase tracking-widest text-trek-brown font-extrabold bg-trek-brown/5 px-2 py-0.5 rounded border border-trek-brown/10 w-max mt-1.5">
                        {user.role}
                      </span>
                    </div>

                    {/* Navigation inside menu */}
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/explore"
                      onClick={() => setDropdownOpen(false)}
                      className="px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition md:hidden"
                    >
                      Explore Trails
                    </Link>
                    <Link
                      to="/trips?tab=my-bookings"
                      onClick={() => setDropdownOpen(false)}
                      className="px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                    >
                      My Expeditions
                    </Link>
                    {(user.role === 'organizer' || user.role === 'admin') && (
                      <Link
                        to="/organizer-dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="px-3 py-2 text-xs font-semibold text-trek-brown hover:text-white hover:bg-white/5 rounded-lg transition"
                      >
                        Organizer Dashboard
                      </Link>
                    )}

                    {/* Logout Trigger */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition border-t border-white/5 pt-2 mt-1"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              id="btn-join-portal"
              className={`hidden md:inline-block rounded-full px-6 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-md ${isScrolled
                  ? 'bg-trek-brown text-white hover:bg-trek-brown-hover border border-transparent'
                  : 'border border-white/20 text-white hover:bg-white hover:text-black hover:border-white'
                }`}
            >
              Join Portal
            </Link>
          )}

          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            className="md:hidden ml-2 text-white p-2 outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl transition-all duration-300 ease-in-out transform flex flex-col pt-24 px-6 pb-6 ${mobileMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'
          }`}
      >
        <div className="flex flex-col gap-6 text-xl font-outfit font-black tracking-widest uppercase text-center mt-8">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`hover:text-trek-brown transition ${isActive('/') ? 'text-trek-brown' : 'text-white'}`}>Home</Link>
          <Link to="/explore" onClick={() => setMobileMenuOpen(false)} className={`hover:text-trek-brown transition ${isActive('/explore') ? 'text-trek-brown' : 'text-white'}`}>Explore</Link>
          <Link to="/trips" onClick={() => setMobileMenuOpen(false)} className={`hover:text-trek-brown transition ${isActive('/trips') ? 'text-trek-brown' : 'text-white'}`}>Trips</Link>
          {user && (
            <Link to="/notifications" onClick={() => setMobileMenuOpen(false)} className={`hover:text-trek-brown transition ${isActive('/notifications') ? 'text-trek-brown' : 'text-white'} flex items-center justify-center gap-2`}>
              Notifications
              {unreadCount > 0 && !muteNotifications && (
                <span className="bg-trek-brown text-white text-xs font-black px-2 py-0.5 rounded-full font-mono">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}
          {(user?.role === 'organizer' || user?.role === 'admin') && (
            <Link to="/organizer-dashboard" onClick={() => setMobileMenuOpen(false)} className={`hover:text-trek-brown transition ${isActive('/organizer-dashboard') ? 'text-trek-brown' : 'text-white'}`}>Dashboard</Link>
          )}
        </div>

        {!user && (
          <div className="mt-auto mb-10 flex flex-col gap-4">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-4 text-center text-sm font-bold tracking-widest uppercase text-white bg-white/10 hover:bg-white/20 rounded-xl transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-4 text-center text-sm font-bold tracking-widest uppercase text-white bg-trek-brown hover:bg-trek-brown-hover rounded-xl shadow-lg transition"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
