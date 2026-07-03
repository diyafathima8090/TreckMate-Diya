'use client';
import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from '../../../utils/axios';
import { ProtectedRoute, OrganizerRoute } from '../../../components/RouteGuard';
import Navbar from '../../../components/Navbar';
import { useNavigate } from '../../../components/RouterCompatibility';

const ScanTicketPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleScan = async (detectedCodes) => {
    if (isProcessing || !detectedCodes || detectedCodes.length === 0) return;
    
    const qrData = detectedCodes[0].rawValue;
    if (!qrData) return;

    try {
      setIsProcessing(true);
      setErrorMsg('');
      setScanResult(null);

      // We expect JSON containing ticketCode, or raw ticketCode
      let ticketCode = qrData;
      try {
        const parsed = JSON.parse(qrData);
        if (parsed.ticketCode) {
          ticketCode = parsed.ticketCode;
        }
      } catch (e) {
        // Not JSON, treat as raw ticket code
      }

      const response = await axios.post('/tickets/verify', { ticketCode });
      
      if (response.data.success) {
        setScanResult({
          status: 'success',
          message: 'Valid Ticket! Guest Verified.',
          data: response.data.data
        });
      }

    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.status === 400 && error.response.data.message === 'Ticket Already Used') {
          setScanResult({
            status: 'used',
            message: 'Ticket Already Used',
            data: error.response.data.data
          });
        } else {
          setErrorMsg(error.response.data.message || 'Invalid Ticket');
        }
      } else {
        setErrorMsg('Network error connecting to verification server.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setErrorMsg('');
    setIsProcessing(false);
  };

  return (
    <div className="font-sans text-white bg-trek-dark min-h-screen pt-20 flex flex-col selection:bg-trek-brown selection:text-white overflow-x-hidden">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 flex flex-col">
        <div className="mb-8">
          <button onClick={() => navigate('/organizer-dashboard')} className="text-gray-400 hover:text-white text-xs mb-4 uppercase tracking-widest flex items-center gap-1 transition">
            &larr; Back to Dashboard
          </button>
          <h1 className="font-outfit text-3xl font-black uppercase text-white tracking-tight">QR Ticket Scanner</h1>
          <p className="text-gray-500 text-sm mt-1">Scan digital passes for expedition check-in.</p>
        </div>

        <div className="bg-[#121317] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
          
          {scanResult ? (
            <div className={`w-full p-8 rounded-xl flex flex-col items-center text-center ${
              scanResult.status === 'success' ? 'bg-green-500/10 border border-green-500/30' : 'bg-orange-500/10 border border-orange-500/30'
            }`}>
              <div className={`h-16 w-16 rounded-full flex items-center justify-center text-3xl mb-4 ${
                scanResult.status === 'success' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
              }`}>
                {scanResult.status === 'success' ? '✓' : '!'}
              </div>
              <h2 className={`font-outfit text-2xl font-black uppercase tracking-wider mb-2 ${
                scanResult.status === 'success' ? 'text-green-400' : 'text-orange-400'
              }`}>
                {scanResult.message}
              </h2>
              
              {scanResult.data?.ticketCode && (
                <div className="mt-4 bg-black/40 px-6 py-4 rounded-xl border border-white/5 w-full text-left">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Ticket Code</div>
                  <div className="font-mono text-gray-200 mb-3">{scanResult.data.ticketCode}</div>
                  
                  {scanResult.data.bookingDetails && (
                    <>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Guest Details</div>
                      <div className="text-gray-200 text-sm font-semibold mb-1">
                        {scanResult.data.bookingDetails.fullName} ({scanResult.data.bookingDetails.seats} Seats)
                      </div>
                      <div className="text-gray-400 text-xs">
                        {scanResult.data.bookingDetails.trekTitle}
                      </div>
                    </>
                  )}
                  
                  {scanResult.status === 'used' && scanResult.data.scannedAt && (
                    <div className="mt-3 text-xs text-orange-400 font-bold">
                      First scanned at: {new Date(scanResult.data.scannedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
              
              <button 
                onClick={handleReset}
                className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl uppercase tracking-wider text-xs transition"
              >
                Scan Another Ticket
              </button>
            </div>
          ) : (
            <div className="w-full relative overflow-hidden rounded-xl border border-white/10 bg-black aspect-square max-h-[400px]">
              <Scanner 
                onScan={handleScan}
                allowMultiple={false}
                scanDelay={2000}
                components={{
                  audio: false,
                  onOff: true,
                  torch: true,
                  zoom: false,
                  finder: true,
                }}
              />
              
              {isProcessing && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                  <svg className="animate-spin h-8 w-8 text-orange-500 mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-orange-500 font-bold uppercase tracking-widest text-xs animate-pulse">Verifying Ticket...</span>
                </div>
              )}
            </div>
          )}
          
          {errorMsg && !scanResult && (
            <div className="mt-6 w-full bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-center text-sm font-semibold animate-pulse">
              {errorMsg}
              <button onClick={handleReset} className="block mt-2 w-full text-xs text-red-300 underline underline-offset-2">Try Again</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default function Page() {
  return (
    <ProtectedRoute>
      <OrganizerRoute>
        <ScanTicketPage />
      </OrganizerRoute>
    </ProtectedRoute>
  );
}
