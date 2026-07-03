// Database Integration client utilities for Treks and Bookings
import axios from './axios';

// Retrieve all combined treks (async)
export const getAllTreks = async () => {
  try {
    const res = await axios.get('/treks');
    if (res.data.success && Array.isArray(res.data.data)) {
      // Convert the array to a key-value dictionary to maintain compatibility with pages that expect an object
      const dict = {};
      res.data.data.forEach(t => {
        dict[t.id] = t;
      });
      return dict;
    }
    return {};
  } catch (e) {
    console.error('Error fetching treks from server:', e);
    return {};
  }
};

// Retrieve a single trek by id (async)
export const getTrekById = async (id) => {
  try {
    const res = await axios.get(`/treks/${id}`);
    if (res.data.success) {
      return res.data.data;
    }
    return null;
  } catch (e) {
    console.error(`Error fetching trek ${id} from server:`, e);
    return null;
  }
};

// Add a new trek (async)
export const addTrek = async (trek) => {
  try {
    const res = await axios.post('/treks', trek);
    if (!res.data.success) {
      console.error('addTrek server error:', res.data.message);
    }
    return res.data.success;
  } catch (e) {
    console.error('Error adding custom trek to server:', e);
    return false;
  }
};

// Update an existing trek (async)
export const updateTrek = async (id, trek) => {
  try {
    const res = await axios.put(`/treks/${id}`, trek);
    if (!res.data.success) {
      console.error('updateTrek server error:', res.data.message);
    }
    return res.data.success;
  } catch (e) {
    console.error('Error updating custom trek on server:', e);
    return false;
  }
};

// Get bookings associated with this organizer's treks (async)
export const getBookingsForOrganizer = async (organizerName) => {
  try {
    const res = await axios.get('/bookings/organizer');
    if (res.data.success) {
      return res.data.data;
    }
    return [];
  } catch (e) {
    console.error('Error getting bookings for organizer:', e);
    return [];
  }
};

// Create a new trek booking (async)
export const addBooking = async (booking) => {
  try {
    const res = await axios.post('/bookings', booking);
    return res.data.success ? res.data.data : null;
  } catch (e) {
    console.error('Error creating booking on server:', e);
    return null;
  }
};

// Create a new payment record (async)
export const addPayment = async (payment) => {
  try {
    const res = await axios.post('/payments', payment);
    return res.data.success ? res.data.data : null;
  } catch (e) {
    console.error('Error creating payment on server:', e);
    return null;
  }
};

// Update booking status (async)
export const updateBookingStatus = async (id, status) => {
  try {
    const res = await axios.put(`/bookings/${id}/status`, { status });
    if (!res.data.success) {
      console.error('updateBookingStatus server error:', res.data.message);
    }
    return res.data.success;
  } catch (e) {
    console.error('Error updating booking status:', e);
    return false;
  }
};

// Get bookings made by the logged in hiker user (async)
export const getUserBookings = async () => {
  try {
    const res = await axios.get('/bookings/my-bookings');
    if (res.data.success) {
      return res.data.data;
    }
    return [];
  } catch (e) {
    console.error('Error getting user bookings from server:', e);
    return [];
  }
};

// Create a razorpay order (async)
export const createRazorpayOrder = async (amount) => {
  try {
    const res = await axios.post('/payments/razorpay/order', { amount });
    return res.data;
  } catch (e) {
    console.error('Error creating order:', e);
    return null;
  }
};

// Verify razorpay payment (async)
export const verifyRazorpayPayment = async (paymentResponse) => {
  try {
    const res = await axios.post('/payments/razorpay/verify', paymentResponse);
    return res.data;
  } catch (e) {
    console.error('Error verifying payment:', e);
    return null;
  }
};
