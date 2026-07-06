'use client';


import dynamic from 'next/dynamic';
import { ProtectedRoute } from '../../../components/RouteGuard';

const LiveTracking = dynamic(() => import('../../../components/LiveTracking'), { ssr: false });

export default function LiveTrackingPage() {
  return (
    <ProtectedRoute>
      <LiveTracking />
    </ProtectedRoute>
  );
}
