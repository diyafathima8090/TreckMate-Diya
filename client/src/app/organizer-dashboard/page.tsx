'use client';

import dynamic from 'next/dynamic';
import { OrganizerRoute } from '../../components/RouteGuard';

const OrganizerDashboard = dynamic(() => import('../../components/OrganizerDashboard'), { ssr: false });

export default function OrganizerDashboardPage() {
  return (
    <OrganizerRoute>
      <OrganizerDashboard />
    </OrganizerRoute>
  );
}
