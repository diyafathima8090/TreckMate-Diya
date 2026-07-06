
import axios from '../lib/axios';


export const getAllTreks = async () => {
  try {
    const res = await axios.get('/treks');
    if (res.data.success && Array.isArray(res.data.data)) {
      
      const dict = {};
      res.data.data.forEach(t => {
        dict[t.id] = t;
      });
      return dict;
    }
    return {};
  } catch (e) {
    console.warn('Error fetching treks from server:', e);
    return {};
  }
};


export const getTrekById = async (id) => {
  try {
    const res = await axios.get(`/treks/${id}`);
    if (res.data.success) {
      return res.data.data;
    }
    return null;
  } catch (e) {
    console.warn(`Error fetching trek ${id} from server:`, e);
    return null;
  }
};


export const addTrek = async (trek) => {
  try {
    const res = await axios.post('/treks', trek);
    if (!res.data.success) {
      console.warn('addTrek server error:', res.data.message);
    }
    return res.data.success;
  } catch (e) {
    console.warn('Error adding custom trek to server:', e);
    return false;
  }
};


export const updateTrek = async (id, trek) => {
  try {
    const res = await axios.put(`/treks/${id}`, trek);
    if (!res.data.success) {
      console.warn('updateTrek server error:', res.data.message);
    }
    return res.data.success;
  } catch (e) {
    console.warn('Error updating custom trek on server:', e);
    return false;
  }
};


export const getBookingsForOrganizer = async (organizerName) => {
  try {
    const res = await axios.get('/bookings/organizer');
    if (res.data.success) {
      return res.data.data;
    }
    return [];
  } catch (e) {
    console.warn('Error getting bookings for organizer:', e);
    return [];
  }
};


export const addBooking = async (booking) => {
  try {
    const res = await axios.post('/bookings', booking);
    return res.data.success ? res.data.data : null;
  } catch (e) {
    console.warn('Error creating booking on server:', e);
    return null;
  }
};


export const addPayment = async (payment) => {
  try {
    const res = await axios.post('/payments', payment);
    return res.data.success ? res.data.data : null;
  } catch (e) {
    console.warn('Error creating payment on server:', e);
    return null;
  }
};


export const updateBookingStatus = async (id, status) => {
  try {
    const res = await axios.put(`/bookings/${id}/status`, { status });
    if (!res.data.success) {
      console.warn('updateBookingStatus server error:', res.data.message);
    }
    return res.data.success;
  } catch (e) {
    console.warn('Error updating booking status:', e);
    return false;
  }
};


export const getUserBookings = async () => {
  try {
    const res = await axios.get('/bookings/my-bookings');
    if (res.data.success) {
      return res.data.data;
    }
    return [];
  } catch (e) {
    console.warn('Error getting user bookings from server:', e);
    return [];
  }
};


export const createRazorpayOrder = async (amount) => {
  try {
    const res = await axios.post('/payments/razorpay/order', { amount });
    return res.data;
  } catch (e) {
    console.warn('Error creating order:', e);
    return null;
  }
};


export const verifyRazorpayPayment = async (paymentResponse) => {
  try {
    const res = await axios.post('/payments/razorpay/verify', paymentResponse);
    return res.data;
  } catch (e) {
    console.warn('Error verifying payment:', e);
    return null;
  }
};
