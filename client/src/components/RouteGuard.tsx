'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

// Blocks logged-in users from accessing Auth pages (Login/Register)
export const GuestRoute = ({ children }) => {
  const { sessions, loading, activeRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (sessions[activeRole]) {
        if (activeRole === 'admin') router.replace('/admin-dashboard');
        else if (activeRole === 'organizer') router.replace('/organizer-dashboard');
        else router.replace('/');
      }
    }
  }, [sessions, loading, activeRole, router]);

  if (loading || sessions[activeRole]) {
    return <div className="h-screen w-full bg-[#070708]"></div>;
  }

  return children;
};

// Allows any loaded user to access public/shared UI
export const UserRoute = ({ children }) => {
  const { loading } = useAuth();
  if (loading) return <div className="h-screen w-full bg-[#070708]"></div>;

  return children;
};

// Blocks unauthenticated users from accessing sensitive pages
export const ProtectedRoute = ({ children }) => {
  const { sessions, loading, activeRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !sessions[activeRole]) {
      router.replace('/login');
    }
  }, [sessions, loading, activeRole, router]);

  if (loading || !sessions[activeRole]) {
    return <div className="h-screen w-full bg-[#070708]"></div>;
  }

  return children;
};

// Blocks Trekkers & Unauthenticated users from accessing the Organizer Dashboard
export const OrganizerRoute = ({ children }) => {
  const { sessions, loading, activeRole, setActiveRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const orgSession = sessions.organizer;
      const hasAccess = orgSession && (orgSession.role === 'organizer' || orgSession.role === 'admin');
      
      if (hasAccess && activeRole !== 'organizer') {
        setActiveRole('organizer');
      }
      if (!hasAccess) {
        router.replace('/explore');
      }
    }
  }, [sessions, loading, activeRole, setActiveRole, router]);

  const orgSession = sessions.organizer;
  if (loading || !orgSession || (orgSession.role !== 'organizer' && orgSession.role !== 'admin')) {
    return <div className="h-screen w-full bg-[#070708]"></div>;
  }

  return children;
};

// Blocks normal users from accessing Super Admin features
export const SuperAdminRoute = ({ children }) => {
  const { sessions, loading, activeRole, setActiveRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const adminSession = sessions.admin;
      const hasAccess = adminSession && adminSession.role === 'admin';

      if (hasAccess && activeRole !== 'admin') {
        setActiveRole('admin');
      }
      if (!hasAccess) {
        router.replace('/explore');
      }
    }
  }, [sessions, loading, activeRole, setActiveRole, router]);

  const adminSession = sessions.admin;
  if (loading || !adminSession || adminSession.role !== 'admin') {
    return <div className="h-screen w-full bg-[#070708]"></div>;
  }

  return children;
};
