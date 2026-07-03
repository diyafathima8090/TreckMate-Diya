'use client';
import { ProtectedRoute } from '../../../components/RouteGuard';
import React, { useState, useEffect } from 'react';

import { useParams, useLocation, Link, useNavigate } from '../../../components/RouterCompatibility';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/Navbar';
import { getTrekById, addBooking, addPayment, createRazorpayOrder, verifyRazorpayPayment, getUserBookings } from '../../../utils/trekStorage';

// Tell TypeScript that window.Razorpay exists (injected by Razorpay's checkout.js script)
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const ConfirmBooking = () => {
  const { id } = useParams();
  const location = useLocation();
  const { sessions } = useAuth();
  const user = sessions.trekker;
  const navigate = useNavigate();

  // Retrieve state from router navigation
  const bookingState = location.state || {};
  const seats = bookingState.seats || 1;
  const fullName = bookingState.fullName || user?.name || 'Trekker';
  const email = bookingState.email || user?.email || '';
  const phone = bookingState.phone || '';
  const emergencyPhone = bookingState.emergencyPhone || '';

  const [trek, setTrek] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrek = async () => {
      const data = await getTrekById(id);
      setTrek(data);
      setLoading(false);
    };
    fetchTrek();
  }, [id]);

  // UI Flow States
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Billing calculation — prefer values passed from /book page via state.
  // Fall back to computing from trek price if state is missing (e.g. direct URL access).
  const _trekPriceNum = trek ? (trek.price_num || parseInt(String(trek.price).replace(/[^0-9]/g, '')) || 0) : 0;
  const baseTotal = (bookingState.baseTotal != null) ? bookingState.baseTotal : (trek ? (trek.baseRate || _trekPriceNum) * seats : 0);
  const guideTotal = (bookingState.guideTotal != null) ? bookingState.guideTotal : (trek ? (trek.guideRate || 0) * seats : 0);
  const gstTotal = (bookingState.gstTotal != null) ? bookingState.gstTotal : Math.round((baseTotal + guideTotal) * 0.18);
  const payableAmount = (bookingState.payableAmount != null) ? bookingState.payableAmount : (baseTotal + guideTotal + gstTotal);

  if (loading) {
    return (
      <div className="font-sans text-white bg-trek-dark min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-orange-500 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Submit payment handler
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    const termsCheck = document.getElementById("terms-check") as HTMLInputElement;
    if (termsCheck && !termsCheck.checked) {
      setErrorMsg("Please agree to the terms to proceed.");
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);

    try {
      const myBookings = await getUserBookings();
      const alreadyBooked = myBookings.find((b: any) => 
        (b.trip_id === id || b.trekId === id) && 
        b.booking_status !== 'cancelled' && 
        b.booking_status !== 'rejected'
      );
      
      if (alreadyBooked) {
        setErrorMsg("You have already booked this trip. Please check your expeditions.");
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      console.error("Failed to verify existing bookings:", err);
    }

    const res = await loadRazorpayScript();
    if (!res) {
      setErrorMsg("Razorpay SDK failed to load. Are you online?");
      setIsProcessing(false);
      return;
    }

    try {
      const orderData = await createRazorpayOrder(payableAmount);

      if (!orderData || !orderData.id) {
        throw new Error("Failed to create order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "TrekMate",
        description: `Booking for ${trek.title}`,
        image: trek.image || "https://example.com/your_logo",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyData = await verifyRazorpayPayment(response);

            if (verifyData) {
              const randNum = Math.floor(1000 + Math.random() * 9000);
              const generatedTicketId = `TM-${randNum}-${id.toUpperCase()}`;
              let finalBookingRes = null;

              try {
                const newBooking = {
                  trekId: id,
                  ticketId: generatedTicketId,
                  seats: seats,
                  fullName: fullName,
                  email: email,
                  phone: phone,
                  bookingDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                  trekTitle: trek.title,
                  trekLocation: trek.location,
                  trekImage: trek.image,
                  trekOrganizer: trek.organizer,
                  trekDates: trek.dates,
                  payableAmount: payableAmount
                };
                finalBookingRes = await addBooking(newBooking);
                
                const newPayment = {
                  trip_id: trek._id || trek.id,
                  amount: payableAmount,
                  payment_method: 'razorpay',
                  transaction_id: response.razorpay_payment_id
                };
                await addPayment(newPayment);
              } catch (err) {
                console.error('Error saving booking to database:', err);
              }
              setIsProcessing(false);
              navigate(`/confirmation/${id}?ticketId=${finalBookingRes ? finalBookingRes.ticketCode || generatedTicketId : generatedTicketId}&seats=${seats}`, { state: { booking: finalBookingRes } });
            } else {
              setErrorMsg("Payment verification failed. Please try again.");
              setIsProcessing(false);
            }
          } catch (err) {
            setErrorMsg("Payment verification failed. Please try again.");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: fullName,
          email: email,
          contact: phone,
        },
        theme: {
          color: "#8b5a2b",
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong with the payment gateway.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="font-sans text-white bg-trek-dark min-h-screen selection:bg-trek-brown selection:text-white pt-20 relative overflow-hidden flex flex-col justify-between">

      {/* Wilderness Background overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/trips_details_bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/85 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-trek-dark via-transparent to-black/35 z-10"></div>
      </div>

      <Navbar />

      <main className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12 flex-grow w-full flex flex-col justify-center">

        {/* Page title header */}
        <div className="mb-8 border-b border-white/10 pb-4 flex items-center justify-between">
          <div>
            <span className="text-trek-brown text-xs font-bold tracking-widest uppercase mb-1.5 block">Payment Gateway</span>
            <h1 className="font-outfit text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-none">Confirm Booking & Pay</h1>
          </div>
          <Link
            to={`/book/${id}`}
            state={bookingState}
            className="text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/30 rounded-xl px-4 py-2 bg-white/5 transition"
          >
            &larr; Back to Details
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-stretch">

          {/* LEFT COLUMN: Booking Details Summary & Billing */}
          <section className="flex-1 bg-[#121317]/90 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between select-text">

            <div>
              {/* Header Info */}
              <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                <div className="h-16 w-20 rounded-xl overflow-hidden relative select-none flex-shrink-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${trek.image}')` }}
                  />
                </div>
                <div>
                  <h3 className="font-outfit text-lg font-black uppercase text-white leading-tight">{trek.title}</h3>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mt-1">
                    {trek.duration} &bull; {trek.organizer}
                  </span>
                </div>
              </div>

              {/* Booking Summary Details block */}
              <div className="flex flex-col gap-4 mb-6">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Adventure details</span>

                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest block mb-0.5">Participant Count</span>
                    <span className="font-bold text-gray-200">{seats} {seats === 1 ? 'Seat' : 'Seats'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest block mb-0.5">Expedition Dates</span>
                    <span className="font-bold text-gray-200">{trek.dates}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest block mb-0.5">Departure Point</span>
                    <span className="font-bold text-gray-200 truncate block">{trek.pickup}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest block mb-0.5">Lead Guide</span>
                    <span className="font-bold text-gray-200">{trek.guide?.name || trek.guide}</span>
                  </div>
                </div>

                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2">Contact Details</span>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-semibold text-gray-200">{fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-semibold text-gray-200">{email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-semibold text-gray-200 font-mono">{phone}</span>
                  </div>
                  {emergencyPhone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Emergency contact:</span>
                      <span className="font-semibold text-gray-200 font-mono">{emergencyPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Billing Itemized List */}
              <div className="border-t border-white/5 pt-4 flex flex-col gap-2.5">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Pricing Summary</span>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-light">Base Rate ({seats} {seats === 1 ? 'seat' : 'seats'})</span>
                  <span className="font-bold text-gray-300">₹{(baseTotal).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-light">Certified Guide Charge</span>
                  <span className="font-bold text-gray-300">₹{(guideTotal).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-light">GST / Service Tax (18%)</span>
                  <span className="font-bold text-gray-300">₹{(gstTotal).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Total Payable Row */}
            <div className="border-t border-white/10 pt-5 mt-6 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-black leading-none">Total Payable</span>
                <span className="text-[9px] text-trek-brown uppercase font-semibold mt-1 tracking-wider">All Taxes Included</span>
              </div>
              <span className="font-outfit text-2xl font-black text-white">₹{payableAmount.toLocaleString('en-IN')}</span>
            </div>

          </section>

          {/* RIGHT COLUMN: Payment Checkout Portal */}
          <section className="flex-1 bg-[#121317]/95 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between min-h-[420px]">

            <form onSubmit={handlePaymentSubmit} className="h-full flex flex-col justify-between select-text">

              <div>
                <div className="mb-6 flex flex-col items-center justify-center py-8">
                  <svg className="w-16 h-16 text-trek-brown mb-4 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="6" width="18" height="12" rx="2" />
                    <circle cx="12" cy="12" r="2" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <h3 className="text-xl font-outfit font-black text-white uppercase tracking-wider mb-2">Secure Checkout</h3>
                  <p className="text-xs text-gray-400 text-center max-w-[250px] leading-relaxed">
                    You will be redirected to the Razorpay secure gateway to complete your payment using Cards, UPI, or Netbanking.
                  </p>
                </div>

                {/* Form Error Banner */}
                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3.5 flex items-center gap-2 text-xs mb-4 animate-pulse select-none">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Terms check */}
                <div className="flex items-start gap-2.5 mt-5 select-none">
                  <input
                    type="checkbox"
                    id="terms-check"
                    required
                    className="accent-trek-brown h-3.5 w-3.5 mt-0.5 rounded cursor-pointer"
                  />
                  <label htmlFor="terms-check" className="text-[10px] text-gray-400 font-light leading-snug cursor-pointer">
                    I agree to the TrekMate safety guidelines, medical declarations, and booking refund policy.
                  </label>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-trek-brown hover:bg-trek-brown-hover disabled:opacity-60 text-white font-bold py-4 rounded-xl uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(139,90,43,0.35)] hover:shadow-[0_0_25px_rgba(139,90,43,0.55)] transition-all duration-300 select-none flex items-center justify-center gap-2 mt-8 active:scale-[0.98] border-none cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Authorizing Gateway...
                  </>
                ) : (
                  `Confirm & Pay ₹${payableAmount.toLocaleString('en-IN')}`
                )}
              </button>

            </form>

          </section>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="relative z-20 px-6 md:px-12 lg:px-24 py-6 bg-[#050505] border-t border-white/5 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-trek-brown" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 20L12 4L21 20H3Z" />
          </svg>
          <span className="font-outfit font-black tracking-widest text-md uppercase">TrekMate</span>
        </div>
        <div className="text-[9px] text-gray-500 font-light">
          Secured Gateway &copy; {new Date().getFullYear()} TrekMate. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default function Page(props) {
  return (
    <ProtectedRoute>
      <ConfirmBooking {...props} />
    </ProtectedRoute>
  );
}
