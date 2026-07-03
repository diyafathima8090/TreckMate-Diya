import axios from "axios";
import { MockDB } from "./mock-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to headers before sending requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["x-active-role"] = "admin";
    }
  }
  return config;
});

// Helper to determine if we should fallback to MockDB
const isFallback = (error: any) => {
  // Fall back on connection errors (code is undefined or ECONNABORTED) or if route not found (404)
  if (!error.response) return true;
  if (error.response.status === 404) return true;
  return false;
};

// --- UserService ---
export const UserService = {
  async getAllUsers() {
    try {
      const response = await apiClient.get("/users"); // imaginary admin users route
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        console.warn("Backend /users endpoint failed/unavailable. Falling back to MockDB.");
        return { success: true, data: MockDB.getUsers() };
      }
      throw error;
    }
  },

  async toggleUserSuspension(userId: string) {
    try {
      const response = await apiClient.put(`/users/${userId}/suspend`);
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        const users = MockDB.getUsers();
        const updatedUsers = users.map((u) => {
          if (u._id === userId) {
            return {
              ...u,
              status: u.status === "active" ? "suspended" : "active",
              activities: [
                {
                  id: "act_" + Date.now(),
                  action: u.status === "active" ? "Account suspended" : "Account activated",
                  time: new Date().toISOString(),
                  ip: "Admin Console"
                },
                ...u.activities
              ]
            };
          }
          return u;
        });
        MockDB.saveUsers(updatedUsers);
        return { success: true, data: updatedUsers.find((u) => u._id === userId) };
      }
      throw error;
    }
  },

  async deleteUser(userId: string) {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        const users = MockDB.getUsers();
        const updatedUsers = users.filter((u) => u._id !== userId);
        MockDB.saveUsers(updatedUsers);
        return { success: true, message: "User deleted successfully" };
      }
      throw error;
    }
  }
};

// --- OrganizerService ---
export const OrganizerService = {
  async getAllOrganizers() {
    try {
      const response = await apiClient.get("/organizer");
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        console.warn("Backend /organizer endpoint failed. Falling back to MockDB.");
        const organizers = MockDB.getOrganizers();
        // Resolve user references locally
        const users = MockDB.getUsers();
        const populated = organizers.map(org => {
          const matchedUser = users.find(u => u._id === org.user_id);
          return {
            ...org,
            user: matchedUser || null
          };
        });
        return { success: true, data: populated };
      }
      throw error;
    }
  },

  async updateOrganizerStatus(
    organizerId: string,
    status: "approved" | "rejected" | "suspended",
    admin_notes?: string,
    rejection_reason?: string
  ) {
    try {
      const response = await apiClient.put(`/organizer/${organizerId}/status`, {
        status,
        admin_notes,
        rejection_reason,
      });
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        const organizers = MockDB.getOrganizers();
        const updatedOrganizers = organizers.map((org) => {
          if (org._id === organizerId) {
            // Also update the linked user role if approved
            if (status === "approved") {
              const users = MockDB.getUsers();
              const updatedUsers = users.map((u) => {
                if (u._id === org.user_id) {
                  return { ...u, role: "organizer", status: "active" };
                }
                return u;
              });
              MockDB.saveUsers(updatedUsers);
            }
            return {
              ...org,
              status,
              admin_notes: admin_notes || "",
              rejection_reason: rejection_reason || "",
              admin_review_date: new Date().toISOString(),
            };
          }
          return org;
        });
        MockDB.saveOrganizers(updatedOrganizers);
        return { success: true, data: updatedOrganizers.find((org) => org._id === organizerId) };
      }
      throw error;
    }
  }
};

// --- TripService ---
export const TripService = {
  async getAllTrips() {
    try {
      const response = await apiClient.get("/treks");
      // server responds with success: true, data: Array
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        console.warn("Backend /treks endpoint failed. Falling back to MockDB.");
        return { success: true, data: MockDB.getTrips() };
      }
      throw error;
    }
  },

  async updateTripStatus(tripId: string, status: "approved" | "rejected" | "cancelled") {
    try {
      // Assuming a custom status endpoint or standard put
      const response = await apiClient.put(`/treks/${tripId}`, { status });
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        const trips = MockDB.getTrips();
        const updatedTrips = trips.map((t) => {
          if (t._id === tripId || t.id === tripId) {
            return { ...t, status };
          }
          return t;
        });
        MockDB.saveTrips(updatedTrips);
        return { success: true, data: updatedTrips.find(t => t._id === tripId || t.id === tripId) };
      }
      throw error;
    }
  },

  async deleteTrip(tripId: string) {
    try {
      const response = await apiClient.delete(`/treks/${tripId}`);
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        const trips = MockDB.getTrips();
        const updatedTrips = trips.filter((t) => t._id !== tripId && t.id !== tripId);
        MockDB.saveTrips(updatedTrips);
        return { success: true, message: "Trip deleted successfully" };
      }
      throw error;
    }
  }
};

// --- BookingService ---
export const BookingService = {
  async getAllBookings() {
    try {
      // admin gets all bookings, assuming a general route or special admin check
      const response = await apiClient.get("/bookings/admin");
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        console.warn("Backend bookings endpoint failed. Falling back to MockDB.");
        return { success: true, data: MockDB.getBookings() };
      }
      throw error;
    }
  },

  async updateBookingStatus(bookingId: string, status: "confirmed" | "cancelled" | "refunded" | "rejected") {
    try {
      const response = await apiClient.put(`/bookings/${bookingId}/status`, { status });
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        const bookings = MockDB.getBookings();
        const updatedBookings = bookings.map((b) => {
          if (b._id === bookingId) {
            // If cancelled/refunded, add corresponding payment modifications
            if (status === "refunded") {
              const payments = MockDB.getPayments();
              const updatedPayments = payments.map(p => {
                if (p.booking_id === bookingId) {
                  return { ...p, payment_status: "refunded" as const };
                }
                return p;
              });
              MockDB.savePayments(updatedPayments);
            }
            return { ...b, booking_status: status };
          }
          return b;
        });
        MockDB.saveBookings(updatedBookings);
        return { success: true, data: updatedBookings.find(b => b._id === bookingId) };
      }
      throw error;
    }
  }
};

// --- PaymentService ---
export const PaymentService = {
  async getAllPayments() {
    try {
      const response = await apiClient.get("/payments");
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        console.warn("Backend /payments endpoint failed. Falling back to MockDB.");
        return { success: true, data: MockDB.getPayments() };
      }
      throw error;
    }
  }
};

// --- ReportService ---
export const ReportService = {
  async getAllReports() {
    try {
      const response = await apiClient.get("/reports");
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        console.warn("Backend /reports endpoint failed. Falling back to MockDB.");
        return { success: true, data: MockDB.getReports() };
      }
      throw error;
    }
  },

  async updateReportStatus(reportId: string, status: "resolved" | "dismissed") {
    try {
      const response = await apiClient.put(`/reports/${reportId}/status`, { status });
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        const reports = MockDB.getReports();
        const updatedReports = reports.map((r) => {
          if (r._id === reportId) {
            return { ...r, status };
          }
          return r;
        });
        MockDB.saveReports(updatedReports);
        return { success: true, data: updatedReports.find(r => r._id === reportId) };
      }
      throw error;
    }
  }
};

// --- NotificationService ---
export const NotificationService = {
  async getSentAnnouncements() {
    try {
      const response = await apiClient.get("/notifications/sent-announcements");
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        return { success: true, data: MockDB.getNotifications() };
      }
      throw error;
    }
  },

  async sendAnnouncement(title: string, message: string, target: "all" | "organizers" | "trekkers") {
    try {
      const response = await apiClient.post("/notifications/announce", { title, message, target });
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        const notifications = MockDB.getNotifications();
        const newAnnounce = {
          _id: "n_" + Date.now(),
          title,
          message,
          target,
          sentBy: "Diya Fathima",
          createdAt: new Date().toISOString(),
        };
        const updated = [newAnnounce, ...notifications];
        MockDB.saveNotifications(updated);
        return { success: true, data: newAnnounce };
      }
      throw error;
    }
  }
};

// --- ContentService ---
export const ContentService = {
  async getCategories() { return { success: true, data: MockDB.getCategories() }; },
  async getDestinations() { return { success: true, data: MockDB.getDestinations() }; },
  
  async getBanners() { 
    try {
      const response = await apiClient.get("/content/banners");
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        return { success: true, data: MockDB.getBanners() };
      }
      throw error;
    }
  },
  
  async saveCategory(cat: any) {
    const categories = MockDB.getCategories();
    let updated;
    if (cat.id) {
      updated = categories.map(c => c.id === cat.id ? cat : c);
    } else {
      const newCat = { ...cat, id: "cat_" + Date.now(), count: 0 };
      updated = [...categories, newCat];
    }
    MockDB.saveCategories(updated);
    return { success: true, data: updated };
  },

  async deleteCategory(id: string) {
    const categories = MockDB.getCategories();
    const updated = categories.filter(c => c.id !== id);
    MockDB.saveCategories(updated);
    return { success: true };
  },

  async saveDestination(dest: any) {
    const destinations = MockDB.getDestinations();
    let updated;
    if (dest.id) {
      updated = destinations.map(d => d.id === dest.id ? dest : d);
    } else {
      const newDest = { ...dest, id: "dest_" + Date.now(), treks: 0 };
      updated = [...destinations, newDest];
    }
    MockDB.saveDestinations(updated);
    return { success: true, data: updated };
  },

  async deleteDestination(id: string) {
    const destinations = MockDB.getDestinations();
    const updated = destinations.filter(d => d.id !== id);
    MockDB.saveDestinations(updated);
    return { success: true };
  },

  async toggleBanner(id: string) {
    try {
      const response = await apiClient.put(`/content/banners/${id}/toggle`);
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        const banners = MockDB.getBanners();
        const updated = banners.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b);
        MockDB.saveBanners(updated);
        return { success: true, data: updated };
      }
      throw error;
    }
  },

  async saveBanner(banner: any) {
    try {
      const response = await apiClient.post("/content/banners", banner);
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        const banners = MockDB.getBanners();
        let updated;
        if (banner.id) {
          updated = banners.map(b => b.id === banner.id ? banner : b);
        } else {
          const newBanner = { 
            ...banner, 
            id: "banner_" + Date.now(), 
            _id: "banner_" + Date.now(),
            isActive: banner.isActive !== undefined ? banner.isActive : true 
          };
          updated = [...banners, newBanner];
        }
        MockDB.saveBanners(updated);
        return { success: true, data: updated };
      }
      throw error;
    }
  },

  async deleteBanner(id: string) {
    try {
      const response = await apiClient.delete(`/content/banners/${id}`);
      return response.data;
    } catch (error) {
      if (isFallback(error)) {
        const banners = MockDB.getBanners();
        const updated = banners.filter(b => b.id !== id && (b as any)._id !== id);
        MockDB.saveBanners(updated);
        return { success: true };
      }
      throw error;
    }
  }
};

// --- SettingsService ---
export const SettingsService = {
  async getSettings() {
    return { success: true, data: MockDB.getSettings() };
  },
  async saveSettings(settings: any) {
    MockDB.saveSettings(settings);
    return { success: true, data: settings };
  }
};
