'use client';

import dynamic from 'next/dynamic';

const TrekDetails = dynamic(() => import('../../../components/TrekDetails'), { ssr: false });

export default function TrekDetailsPage() {
  return <TrekDetails />;
}
