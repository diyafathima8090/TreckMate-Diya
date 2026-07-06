'use client';
import { GuestRoute } from '../../components/RouteGuard';
import React, { useState } from 'react';
import { Link, useNavigate } from '../../components/RouterCompatibility';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user && (res.user.role === 'organizer' || res.user.role === 'admin')) {
          navigate('/organizer-dashboard');
        } else {
          navigate('/');
        }
      } else {
        setFormError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setFormError('Something went wrong. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setFormError('');
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        if (res.user && (res.user.role === 'organizer' || res.user.role === 'admin')) {
          navigate('/organizer-dashboard');
        } else {
          navigate('/');
        }
      } else {
        setFormError(res.message || 'Google login failed.');
      }
    } catch (err) {
      setFormError('Something went wrong with Google Login. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="font-sans text-white bg-trek-dark min-h-screen flex items-stretch select-none relative overflow-hidden">

      {}
      <section className="hidden lg:flex lg:w-1/2 relative items-end p-16 overflow-hidden">
        {}
        <div className="absolute inset-0 z-0 bg-trek-dark">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2 transition-transform duration-10000 hover:scale-105"
            src="https://videos.pexels.com/video-files/3121459/3121459-hd_1920_1080_24fps.mp4"
            poster="/explore_glowing_tent.png"
          />
        </div>
        {}
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-trek-dark via-transparent to-black/35 z-10"></div>

        {}
        <div className="relative z-20 max-w-md">
          <Link to="/" className="flex items-center gap-3 text-white mb-8 group w-fit">
            <svg className="w-8 h-8 text-white transition-transform duration-500 group-hover:rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </svg>
            <span className="font-outfit font-black tracking-widest text-xl uppercase">TrekMate</span>
          </Link>

          <blockquote className="font-outfit text-3xl font-bold uppercase tracking-tight leading-none mb-4 text-white/90">
            "The mountains are calling, and I must go."
          </blockquote>
          <cite className="text-xs uppercase tracking-widest text-trek-brown font-extrabold not-italic">
            — John Muir
          </cite>

          <p className="text-xs text-gray-400 font-light leading-relaxed mt-4">
            Connect with certified local guides, organize custom multi-day expeditions, and track your altitude in real-time.
          </p>
        </div>
      </section>

      {}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-[#0a0a0a]/95 relative z-20 overflow-y-auto min-h-screen py-12">

        {}
        <div className="absolute top-1/4 right-1/4 h-[300px] w-[300px] bg-trek-brown/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-md w-full z-10">

          {}
          <div className="mb-8">
            <div className="flex lg:hidden items-center gap-2 text-white mb-6">
              <svg className="w-7 h-7 text-trek-brown" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
              </svg>
              <span className="font-outfit font-black tracking-widest text-lg uppercase">TrekMate</span>
            </div>
            <h2 className="font-outfit text-3xl font-black uppercase text-white tracking-tight leading-none mb-2">
              Access Portal
            </h2>
            <p className="text-xs text-gray-500 tracking-wide">
              Sign in to manage your expeditions and gear list.
            </p>
          </div>

          {}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 select-text">

            {}
            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 flex items-center gap-3 text-xs animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <span className="font-medium">{formError}</span>
              </div>
            )}

            {}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black flex items-center gap-1.5 select-none">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                </svg>
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="trekker@trekmate.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-trek-brown hover:border-white/20 transition-all font-semibold placeholder-gray-600"
              />
            </div>

            {}
            <div className="flex flex-col gap-1.5 relative">
              <div className="flex justify-between items-center select-none">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Password
                </label>
                <a href="#" className="text-[10px] text-trek-brown font-black hover:text-white uppercase tracking-widest transition-colors">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl pl-4 pr-11 py-3.5 text-xs text-white outline-none focus:border-trek-brown hover:border-white/20 transition-all w-full font-semibold placeholder-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {}
            <div className="flex items-center gap-2 select-none">
              <input
                type="checkbox"
                id="remember-me"
                className="accent-trek-brown h-3.5 w-3.5 border-white/10 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="text-[11px] text-gray-400 font-light cursor-pointer">
                Keep me logged in for 30 days
              </label>
            </div>

            {}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-trek-brown hover:bg-trek-brown-hover disabled:opacity-50 text-white font-bold py-4 rounded-xl uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(139,90,43,0.35)] hover:shadow-[0_0_25px_rgba(139,90,43,0.55)] transition-all duration-300 select-none flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                'Access Portal'
              )}
            </button>
          </form>

          {}
          <div className="flex items-center gap-4 my-6 select-none opacity-50">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">OR</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          {}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isSubmitting}
            className="w-full bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-900 font-bold py-4 rounded-xl uppercase tracking-wider text-xs shadow-lg transition-all duration-300 select-none flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {isGoogleLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-gray-900" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {}
          <div className="mt-8 text-center border-t border-white/5 pt-6 text-xs font-light text-gray-400">
            New to TrekMate?{' '}
            <Link to="/register" className="text-trek-brown hover:text-white font-extrabold uppercase tracking-widest transition-colors ml-1">
              Create Account
            </Link>
          </div>

        </div>

      </section>

    </div>
  );
};

export default function Page(props) {
  return (
    <GuestRoute>
      <Login {...props} />
    </GuestRoute>
  );
}
