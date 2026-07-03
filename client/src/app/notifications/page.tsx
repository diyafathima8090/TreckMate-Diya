'use client';
import { ProtectedRoute } from '../../components/RouteGuard';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import axios from '../../utils/axios';
import { Link, useNavigate } from '../../components/RouterCompatibility';

const Notifications = () => {
  const navigate = useNavigate();
  const { sessions, activeRole, loading: authLoading } = useAuth();
  const user = sessions[activeRole] || null;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Notification Switch States
  const [showUnreadOnly, setShowUnreadOnly] = useState(() => {
    return localStorage.getItem('trekmate_notif_unread_only') === 'true';
  });
  const [muteNotifications, setMuteNotifications] = useState(() => {
    return localStorage.getItem('trekmate_notif_mute') === 'true';
  });
  const [emailAlerts, setEmailAlerts] = useState(() => {
    return localStorage.getItem('trekmate_notif_email') !== 'false';
  });

  // Persist settings changes
  useEffect(() => {
    localStorage.setItem('trekmate_notif_unread_only', String(showUnreadOnly));
  }, [showUnreadOnly]);

  useEffect(() => {
    localStorage.setItem('trekmate_notif_mute', String(muteNotifications));
  }, [muteNotifications]);

  useEffect(() => {
    localStorage.setItem('trekmate_notif_email', String(emailAlerts));
  }, [emailAlerts]);


  const filteredNotifications = notifications.filter(notif => {
    if (showUnreadOnly && notif.is_read) return false;
    return true;
  });

  // Relative time helper
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      } else {
        setError(res.data.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(notif => notif._id === id ? { ...notif, is_read: true } : notif)
      );

      await axios.put(`/notifications/${id}/read`);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      await axios.put('/notifications/read-all');
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      // Rollback or refetch
      fetchNotifications();
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Avoid triggering card click (mark as read)
    try {
      // Optimistic update
      setNotifications(prev => prev.filter(notif => notif._id !== id));
      await axios.delete(`/notifications/${id}`);
    } catch (err) {
      console.error('Failed to delete notification:', err);
      fetchNotifications();
    }
  };

  // Icon selector based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_confirmed':
        return {
          icon: (
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-emerald-500/10 border-emerald-500/20',
        };
      case 'booking_cancelled':
        return {
          icon: (
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-red-500/10 border-red-500/20',
        };
      case 'trip_update':
        return {
          icon: (
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          ),
          bgColor: 'bg-orange-500/10 border-orange-500/20',
        };
      case 'message':
      case 'chat':
        return {
          icon: (
            <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          ),
          bgColor: 'bg-sky-500/10 border-sky-500/20',
        };
      case 'payment':
        return {
          icon: (
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          ),
          bgColor: 'bg-yellow-500/10 border-yellow-500/20',
        };
      case 'system':
      default:
        return {
          icon: (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-white/5 border-white/10',
        };
    }
  };

  const getReferenceLink = (notif) => {
    if (activeRole === 'organizer') {
      if (notif.reference_type === 'booking') {
        return '/organizer-dashboard';
      }
      return '/organizer-dashboard';
    } else {
      if (notif.reference_type === 'booking') {
        return '/trips';
      }
      if (notif.reference_type === 'trek') {
        return `/details/${notif.reference_id}`;
      }
      return '/trips';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#070708] text-gray-200">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-20 animate-page">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-outfit font-black text-white uppercase tracking-tight flex items-center gap-3">
              Notifications
              {unreadCount > 0 && !muteNotifications && (
                <span className="bg-trek-brown text-white text-[11px] font-black px-2.5 py-0.5 rounded-full border border-trek-brown/20 font-mono">
                  {unreadCount} NEW
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-400 font-light mt-1">
              Stay updated with your bookings, chat messages, and trek details.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer self-start md:self-center"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 animate-fadeIn">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {muteNotifications && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-xl mb-6 text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
            Alerts are currently muted. You will not see notification badges in real-time.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications List Panel */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 w-full rounded-2xl bg-white/5 border border-white/5 animate-pulse"></div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="bg-[#121317] border border-white/10 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden select-none flex flex-col items-center justify-center animate-fadeIn">
                <div className="absolute top-0 right-0 w-64 h-64 bg-trek-brown/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-3xl mb-4 text-gray-500">
                  
                </div>
                <h3 className="text-lg font-outfit font-black text-white uppercase tracking-tight mb-2">No Notifications</h3>
                <p className="text-xs text-gray-400 max-w-sm leading-relaxed font-light">
                  {showUnreadOnly 
                    ? "You don't have any unread notifications at the moment."
                    : "Your notifications log is clean! Any updates regarding your registered expeditions or bookings will be posted here."}
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredNotifications.map(notif => {
                  const { icon, bgColor } = getNotificationIcon(notif.type);
                  return (
                    <div
                      key={notif._id}
                      onClick={() => handleMarkAsRead(notif._id)}
                      className={`group bg-[#121317] border transition-all duration-300 rounded-2xl p-4 md:p-5 flex gap-4 cursor-pointer shadow-md select-text relative overflow-hidden animate-fadeIn ${
                        notif.is_read
                          ? 'border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
                          : 'border-trek-brown/30 bg-trek-brown/[0.02] hover:border-trek-brown/50 hover:bg-trek-brown/[0.04]'
                      }`}
                    >
                      {/* Unread indicator dot */}
                      {!notif.is_read && (
                        <span className="absolute top-0 left-0 h-full w-1 bg-trek-brown" />
                      )}

                      {/* Icon Panel */}
                      <div className={`h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center shadow ${bgColor}`}>
                        {icon}
                      </div>

                      {/* Text Details */}
                      <div className="flex-grow min-w-0 pr-4">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-bold truncate transition ${notif.is_read ? 'text-white/90' : 'text-white'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-gray-500 font-mono shrink-0 pt-0.5">
                            {getRelativeTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className={`text-xs mt-1.5 leading-relaxed font-light ${notif.is_read ? 'text-gray-400' : 'text-gray-300'}`}>
                          {notif.message}
                        </p>

                        {/* Reference Link helper */}
                        {notif.reference_id && (
                          <div className="mt-3.5 flex items-center gap-1.5">
                            <Link
                              to={getReferenceLink(notif)}
                              className="text-[10px] font-black tracking-wider uppercase text-trek-brown hover:text-white transition flex items-center gap-1"
                            >
                              View Details
                              <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Operations actions */}
                      <div className="flex items-center self-center shrink-0">
                        <button
                          onClick={(e) => handleDelete(e, notif._id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition duration-200 cursor-pointer"
                          title="Delete notification"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Preferences Sidebar Settings Card */}
          <div className="space-y-6">
            <div className="bg-[#121317] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-trek-brown/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              
              <div>
                <h3 className="font-outfit text-xs font-black uppercase text-white tracking-widest mb-6 flex items-center gap-2 select-none">
                  <svg className="w-4.5 h-4.5 text-trek-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Preferences
                </h3>

                <div className="space-y-4">
                  {/* Switch 1: Show Unread Only */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-white/5 select-none">
                    <div>
                      <div className="text-xs font-bold text-gray-200">Unread Only</div>
                      <div className="text-[10px] text-gray-500 font-light mt-0.5">Filter read notifications.</div>
                    </div>
                    <button
                      onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                      className={`w-9 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${showUnreadOnly ? 'bg-trek-brown' : 'bg-white/10'}`}
                    >
                      <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ${showUnreadOnly ? 'translate-x-3.5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Switch 2: Mute Alerts */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-white/5 select-none">
                    <div>
                      <div className="text-xs font-bold text-gray-200">Mute Alerts</div>
                      <div className="text-[10px] text-gray-500 font-light mt-0.5">Silence bell badge counters.</div>
                    </div>
                    <button
                      onClick={() => setMuteNotifications(!muteNotifications)}
                      className={`w-9 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${muteNotifications ? 'bg-trek-brown' : 'bg-white/10'}`}
                    >
                      <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ${muteNotifications ? 'translate-x-3.5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Switch 3: Email Alerts */}
                  <div className="flex items-center justify-between select-none">
                    <div>
                      <div className="text-xs font-bold text-gray-200">Email Alerts</div>
                      <div className="text-[10px] text-gray-500 font-light mt-0.5">Get emails for booking updates.</div>
                    </div>
                    <button
                      onClick={() => setEmailAlerts(!emailAlerts)}
                      className={`w-9 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${emailAlerts ? 'bg-trek-brown' : 'bg-white/10'}`}
                    >
                      <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ${emailAlerts ? 'translate-x-3.5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6 text-[9px] text-gray-500 leading-relaxed font-light select-none">
                Settings apply dynamically and persist in local storage. Email updates are managed on secure cloud services.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default function Page(props) {
  return (
    <ProtectedRoute>
      <Notifications {...props} />
    </ProtectedRoute>
  );
}
