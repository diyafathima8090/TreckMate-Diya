'use client';
import { ProtectedRoute } from '../../components/RouteGuard';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import axios from '../../utils/axios';

  const Profile = () => {
  const { sessions, updateUser } = useAuth();
  const user = sessions.trekker;
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    bio: '',
    profileImage: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        phone: user.phone || '',
        bio: user.bio || '',
        profileImage: user.profileImage || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await axios.put('/auth/profile', formData);
      const data = res.data;

      if (data.success) {
        setSuccess(true);
        // Update user in context
        updateUser(data.data);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while updating the profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAvatar = () => {
    const seed = formData.name ? encodeURIComponent(formData.name) : Math.random().toString(36).substring(7);
    const url = `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;
    setFormData({ ...formData, profileImage: url });
  };

  return (
    <div className="min-h-screen bg-[#070708] text-gray-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="bg-[#121317] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-trek-brown/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <h1 className="text-3xl font-outfit font-black text-white uppercase tracking-tight mb-2">My Profile</h1>
          <p className="text-sm text-gray-400 mb-8 font-light">Manage your personal details and expedition identity.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            
            {/* Avatar Section */}
            <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-white/5">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-white/5 border-2 border-white/10 overflow-hidden flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-500 absolute inset-0 m-auto z-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  {formData.profileImage && formData.profileImage !== 'null' && formData.profileImage !== 'undefined' && (
                    <img 
                      src={formData.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover relative z-10" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleGenerateAvatar}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                >
                  Generate Initial Avatar
                </button>
                <div className="text-xs text-gray-500 font-light">Or paste an image URL below.</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profile Image URL Input */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Avatar URL</label>
                <input
                  type="text"
                  name="profileImage"
                  value={formData.profileImage}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-trek-brown transition"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-trek-brown transition"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-trek-brown transition"
                />
              </div>

              {/* Email (Disabled) */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-[#0a0a0c]/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                  title="Email cannot be changed"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-trek-brown transition"
                />
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Expedition Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell your fellow trekkers a little about yourself and your experience..."
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-trek-brown transition resize-none"
                ></textarea>
              </div>

            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-trek-brown hover:bg-trek-brown-hover text-white font-bold py-3 px-8 rounded-xl transition shadow-lg flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
};

export default function Page(props) {
  return (
    <ProtectedRoute>
      <Profile {...props} />
    </ProtectedRoute>
  );
}
