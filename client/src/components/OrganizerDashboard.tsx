import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "./RouterCompatibility";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import {
  getAllTreks,
  addTrek,
  updateTrek,
  getBookingsForOrganizer,
  updateBookingStatus,
} from "../services/trekStorage";
import axios from "../lib/axios";
import {
  MapContainer as LeafletMapContainer,
  TileLayer as LeafletTileLayer,
  Marker as LeafletMarker,
  Popup as LeafletPopup,
  useMap,
} from "react-leaflet";
const MapContainer = LeafletMapContainer as any;
const TileLayer = LeafletTileLayer as any;
const Marker = LeafletMarker as any;
const Popup = LeafletPopup as any;
import EmojiPicker from "emoji-picker-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ChatLayout } from "./chat/ChatLayout";
import OrganizerDashboardStats from "./organizer/OrganizerDashboardStats";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapAutoPan({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], map.getZoom());
    }
  }, [location, map]);
  return null;
}

const OrganizerDashboard = () => {
  const { sessions, logout, activeRole } = useAuth();
  const user = sessions.organizer || sessions.admin;
  const navigate = useNavigate();

  const [orgProfile, setOrgProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [resubmitDocType, setResubmitDocType] = useState("Government ID Card");
  const [resubmitFile, setResubmitFile] = useState<File | null>(null);
  const [resubmitNotes, setResubmitNotes] = useState("");
  const [resubmitOrgName, setResubmitOrgName] = useState("");
  const [resubmitPhone, setResubmitPhone] = useState("");
  const [resubmitAddress, setResubmitAddress] = useState("");
  const [resubmitError, setResubmitError] = useState("");
  const [resubmitSuccess, setResubmitSuccess] = useState("");
  const [isResubmitting, setIsResubmitting] = useState(false);

  const [activeView, setActiveView] = useState(() => {
    return sessionStorage.getItem("trekmate_org_view") || "dashboard";
  });

  useEffect(() => {
    sessionStorage.setItem("trekmate_org_view", activeView);
  }, [activeView]);

  const [stats, setStats] = useState({
    totalTreks: 0,
    totalBookings: 0,
    totalHikers: 0,
    totalRevenue: 0,
  });

  const [myTreks, setMyTreks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");

  const [showUnreadOnly, setShowUnreadOnly] = useState(() => {
    return localStorage.getItem("trekmate_org_unread_only") === "true";
  });
  const [muteNotifications, setMuteNotifications] = useState(() => {
    return localStorage.getItem("trekmate_org_mute") === "true";
  });
  const [emailAlerts, setEmailAlerts] = useState(() => {
    return localStorage.getItem("trekmate_org_email") !== "false";
  });

  useEffect(() => {
    localStorage.setItem("trekmate_org_unread_only", String(showUnreadOnly));
  }, [showUnreadOnly]);

  useEffect(() => {
    localStorage.setItem("trekmate_org_mute", String(muteNotifications));
  }, [muteNotifications]);

  useEffect(() => {
    localStorage.setItem("trekmate_org_email", String(emailAlerts));
  }, [emailAlerts]);

  const filteredNotifications = notifications.filter((notif) => {
    if (showUnreadOnly && notif.is_read) return false;
    return true;
  });

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [difficulty, setDifficulty] = useState("Moderate");
  const [dates, setDates] = useState("");
  const [pickup, setPickup] = useState("");
  const [temp, setTemp] = useState("18°C Sunny");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("/explore_glowing_tent.png");
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [activeChatTrekId, setActiveChatTrekId] = useState("munnar");

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(
          `${API_URL}/api/messages/${activeChatTrekId || "munnar"}`,
        );
        if (res.ok) {
          const data = await res.json();
          setChatMessages(data);
        }
      } catch (err) {
        console.error("Failed to fetch chat history", err);
      }
    };
    fetchChatHistory();
  }, [activeChatTrekId]);

  const [newMsgText, setNewMsgText] = useState("");
  const [editingTrekId, setEditingTrekId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const activeViewRef = useRef(activeView);
  const messagesEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, activeView]);

  useEffect(() => {
    activeViewRef.current = activeView;
  }, [activeView]);

  const [telemetryLogs, setTelemetryLogs] = useState([
    "SYSTEM: Initializing telemetry channels...",
    "SYSTEM: Waiting for field operations link...",
  ]);
  const [emergencyAlerts, setEmergencyAlerts] = useState(0);
  const [liveLocation, setLiveLocation] = useState({
    lat: 10.088931,
    lng: 77.059524,
  });
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchSosHistory = async () => {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/sos`);
        const data = await res.json();
        if (data.length > 0) {
          setEmergencyAlerts(data.length);
          const logs = data.map(
            (sos) =>
              `CRITICAL SOS: ${sos.trekName} at ${sos.time} - [${sos.lat.toFixed(4)}°, ${sos.lng.toFixed(4)}°]`,
          );
          setTelemetryLogs((prev) => [...prev, ...logs]);
        }
      } catch (err) {
        console.error("Failed to fetch SOS history", err);
      }
    };
    fetchSosHistory();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(`token_${activeRole}`);
    socketRef.current = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
      {
        auth: { token },
      },
    );

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join_organizer");
    });

    socketRef.current.on("receive_telemetry", (data) => {
      setTelemetryLogs((logs) => [
        ...logs.slice(-20),
        `GPS: ${data.trekName} [${data.lat.toFixed(4)}°, ${data.lng.toFixed(4)}°] Alt: ${data.alt}m`,
      ]);
      setLiveLocation({ lat: data.lat, lng: data.lng });
    });

    socketRef.current.on("sos_alert", (data) => {
      setEmergencyAlerts((prev) => prev + 1);
      setTelemetryLogs((logs) => [
        ...logs.slice(-20),
        `CRITICAL SOS: ${data.trekName} at ${data.time} - [${data.lat.toFixed(4)}°, ${data.lng.toFixed(4)}°]`,
      ]);
      setToastMessage(
        ` SOS EMERGENCY: ${data.trekName} at LAT: ${data.lat.toFixed(4)}°, LNG: ${data.lng.toFixed(4)}° `,
      );
      setTimeout(() => setToastMessage(""), 10000);
    });

    socketRef.current.on("chat_message", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
      if (msg.trekId && msg.isGuide) {
        setActiveChatTrekId(msg.trekId);
      }
      if (activeViewRef.current !== "chat" && msg.isGuide) {
        setToastMessage(`New message from ${msg.sender}: ${msg.text}`);
        setTimeout(() => setToastMessage(""), 5000);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "organizer" && user.role !== "admin") {
      navigate("/explore");
    }
  }, [user, navigate]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const allTreks = await getAllTreks();
      const filteredTreks = (Object.values(allTreks) as any[]).filter(
        (t) =>
          t.organizer && t.organizer.toLowerCase() === user.name.toLowerCase(),
      );
      setMyTreks(filteredTreks);

      const organizerBookings = await getBookingsForOrganizer(user.name);
      setBookings(organizerBookings);

      const totalBookingsCount = organizerBookings.length;
      const totalHikersCount = organizerBookings.reduce(
        (sum, b) => sum + (b.seats || 1),
        0,
      );
      const revenueSum = organizerBookings.reduce(
        (sum, b) => sum + (b.payableAmount || 0),
        0,
      );

      setStats({
        totalTreks: filteredTreks.length,
        totalBookings: totalBookingsCount,
        totalHikers: totalHikersCount,
        totalRevenue: revenueSum,
      });
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  const loadNotifications = async () => {
    if (!user) return;
    try {
      setNotificationsLoading(true);
      const res = await axios.get("/notifications");
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(
        "Error fetching notifications in Organizer Dashboard:",
        err,
      );
      setNotificationsError("Failed to fetch notifications.");
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleMarkNotificationAsRead = async (id) => {
    try {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, is_read: true } : notif,
        ),
      );
      await axios.put(`/notifications/${id}/read`);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true })),
      );
      await axios.put("/notifications/read-all");
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      loadNotifications();
    }
  };

  const handleDeleteNotification = async (e, id) => {
    if (e) e.stopPropagation();
    try {
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
      await axios.delete(`/notifications/${id}`);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      loadNotifications();
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const success = await updateBookingStatus(bookingId, status);
      if (success) {
        setToastMessage(
          `Booking ${status === "confirmed" ? "Accepted" : "Rejected"} successfully!`,
        );
        loadDashboardData();
      } else {
        setToastMessage("Failed to update booking status.");
      }
    } catch (err) {
      console.error(err);
      setToastMessage("Error updating booking status.");
    }
  };

  useEffect(() => {
    loadDashboardData();
    if (activeView === "notifications") {
      loadNotifications();
    }
  }, [user, activeView]);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const fetchChatMessages = async () => {
      if (activeChatTrekId) {
        try {
          const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const res = await fetch(
            `${API_URL}/api/messages/${activeChatTrekId}`,
          );
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              setChatMessages(data);
            }
          }
        } catch (err) {
          console.error("Failed to fetch chat messages:", err);
        }
      }
    };
    fetchChatMessages();
  }, [activeChatTrekId]);

  const handleCreateTrekSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (
      !title.trim() ||
      !location.trim() ||
      !price ||
      !duration.trim() ||
      !dates.trim() ||
      !pickup.trim() ||
      !description.trim()
    ) {
      setErrorMsg("Please fill in all the fields.");
      return;
    }

    setIsSubmitting(true);
    setUploadingImage(true);

    let imageUrl = image;

    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);

      try {
        const API_URL = 
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          imageUrl = uploadData.imageUrl;
        } else {
          setErrorMsg("Failed to upload image.");
          setIsSubmitting(false);
          setUploadingImage(false);
          return;
        }
      } catch (err) {
        console.error("Image upload error:", err);
        setErrorMsg("Image upload failed. Please check network.");
        setIsSubmitting(false);
        setUploadingImage(false);
        return;
      }
    }

    setUploadingImage(false);

    const priceNum = parseFloat(String(price).replace(/[^0-9.]/g, ""));

    setTimeout(async () => {
      if (editingTrekId) {
        const updatedTrek = {
          title: title.trim(),
          name: title.trim(),
          location: location.trim(),
          difficulty,
          duration: duration.trim(),
          pickup: pickup.trim(),
          temp: temp.trim(),
          description: description.trim(),
          price: `₹${priceNum.toLocaleString("en-IN")}`,
          baseRate: priceNum ? Math.floor(priceNum * 0.85) : 0,
          guideRate: priceNum ? Math.floor(priceNum * 0.15) : 0,
          dates: dates.trim(),
          image: imageUrl,
        };

        const success = await updateTrek(editingTrekId, updatedTrek);
        setIsSubmitting(false);

        if (success) {
          setSuccessMsg("Expedition successfully updated!");
          setTimeout(() => {
            setEditingTrekId(null);
            setTitle("");
            setLocation("");
            setPrice("");
            setDuration("");
            setDifficulty("Moderate");
            setDates("");
            setPickup("");
            setTemp("18°C Sunny");
            setDescription("");
            setImage("/explore_glowing_tent.png");
            setImageFile(null);
            setActiveView("manage-trips");
            setSuccessMsg("");
          }, 1500);
        } else {
          setErrorMsg("Failed to update expedition. Please try again.");
        }
      } else {
        const generatedId =
          title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") +
          "-" +
          Math.floor(100 + Math.random() * 900);
        const newTrek = {
          id: generatedId,
          title: title.trim(),
          name: title.trim(),
          location: location.trim(),
          rating: "5.0 (New)",
          difficulty,
          duration: duration.trim(),
          seats: "15 Persons",
          left: "15 Left",
          reportingTime: "7:30 AM",
          pickup: pickup.trim(),
          temp: temp.trim(),
          description: description.trim(),
          price: `₹${priceNum.toLocaleString("en-IN")}`,
          baseRate: Math.round(priceNum * 0.85),
          guideRate: Math.round(priceNum * 0.15),
          dates: dates.trim(),
          image: imageUrl,
          images: [imageUrl],
          organizer: user.name,
          timeline: [
            {
              num: "01",
              title: "Camp Arrival & Briefing",
              desc: `Welcome meeting in ${location}, camp pitch, and local safety briefing.`,
              hasDining: true,
            },
            {
              num: "02",
              title: "Ascent & Return",
              desc: "Summit ascent to witness high mountain views, packed lunch, and safe descent.",
            },
          ],
          guide: {
            name: user.name,
            title: "Lead Organizer",
            treks: "1+ Treks Done",
            exp: "5 yrs Experience",
            avatar: user.name[0].toUpperCase(),
          },
        };

        const added = await addTrek(newTrek);
        setIsSubmitting(false);

        if (added) {
          setSuccessMsg(
            "Expedition successfully published! Redirecting to dashboard...",
          );
          setTitle("");
          setLocation("");
          setPrice("");
          setDuration("");
          setDates("");
          setPickup("");
          setDescription("");
          setImageFile(null);

          setTimeout(() => {
            setSuccessMsg("");
            setActiveView("dashboard");
          }, 2000);
        } else {
          setErrorMsg("Failed to save trek details. Please try again.");
        }
      }
    }, 1500);
  };

  const handleEditClick = (trek) => {
    setEditingTrekId(trek.id);
    setTitle(trek.title || "");
    setLocation(trek.location || "");
    setPrice(
      trek.price_num
        ? trek.price_num.toString()
        : (trek.price || "").replace(/[^0-9]/g, ""),
    );
    setDuration(trek.duration || "");
    setDifficulty(trek.difficulty || "Moderate");
    setDates(trek.dates || "");
    setPickup(trek.pickup || "");
    setTemp(trek.temp || "18°C Sunny");
    setDescription(trek.description || "");
    setImage(trek.image || "/explore_glowing_tent.png");
    setActiveView("create-trip");
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!newMsgText.trim() || !socketRef.current) return;

    const newMessage = {
      trekId: activeChatTrekId,
      sender: "System Command",
      text: newMsgText.trim(),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      isGuide: false,
    };

    socketRef.current.emit("send_chat", newMessage);
    setNewMsgText("");
  };

  const fetchOrgProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await axios.get("/organizer/me");
      if (res.data.success && res.data.data) {
        setOrgProfile(res.data.data);

        setResubmitOrgName(res.data.data.organization_name || "");
        setResubmitPhone(res.data.data.phone || "");
        setResubmitAddress(res.data.data.address || "");
      }
    } catch (err: any) {
      console.error("Error fetching organizer profile status:", err);

      if (err.response && err.response.status === 404) {
        setOrgProfile({ status: "not_applied" });
      } else {
        setOrgProfile(null);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (user && activeRole === "organizer") {
      fetchOrgProfile();
    } else {
      setProfileLoading(false);
    }
  }, [user, activeRole]);

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResubmitError("");
    setResubmitSuccess("");

    if (!resubmitPhone || !resubmitAddress || !resubmitFile) {
      setResubmitError(
        "Please fill in all verification fields and select a file.",
      );
      return;
    }

    setIsResubmitting(true);
    try {
      const formData = new FormData();
      formData.append("document", resubmitFile);

      const uploadRes = await axios.post("/organizer/upload-doc", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!uploadRes.data.success) {
        setResubmitError("File upload failed.");
        setIsResubmitting(false);
        return;
      }

      const { url, filename } = uploadRes.data;

      const resubmitData = {
        document_type: resubmitDocType,
        document_url: url,
        document_filename: filename,
        additional_notes: resubmitNotes,
        organization_name: resubmitOrgName,
        phone: resubmitPhone,
        address: resubmitAddress,
      };

      const res = await axios.put("/organizer/resubmit", resubmitData);
      if (res.data.success) {
        setResubmitSuccess(
          "Documents resubmitted successfully! Your account is now pending review.",
        );
        setResubmitFile(null);
        setResubmitNotes("");

        fetchOrgProfile();
      } else {
        setResubmitError(res.data.message || "Resubmission failed.");
      }
    } catch (err: any) {
      console.error("Resubmission error:", err);
      setResubmitError(
        err.response?.data?.message ||
          "Error occurred during resubmission. Please try again.",
      );
    } finally {
      setIsResubmitting(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#070708] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-8 w-8 text-trek-brown"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">
            Verifying Credentials...
          </span>
        </div>
      </div>
    );
  }

  if (
    user &&
    activeRole === "organizer" &&
    orgProfile &&
    orgProfile.status !== "approved"
  ) {
    return (
      <div className="min-h-screen bg-[#070708] text-white flex items-center justify-center p-6 select-none relative overflow-hidden">
        {}
        <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] bg-trek-brown/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-xl w-full z-10 bg-[#0d0d0f]/90 border border-white/5 rounded-2xl p-8 backdrop-blur-md shadow-2xl relative">
          {}
          <div className="flex items-center gap-2 mb-8">
            <svg
              className="w-6 h-6 text-trek-brown"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </svg>
            <span className="font-outfit font-black tracking-widest text-md uppercase">
              TrekMate Partner
            </span>
          </div>

          {(orgProfile.status === "pending" ||
            orgProfile.status === "not_applied") && (
            <div className="flex flex-col gap-4 text-center py-6 select-text">
              <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight text-white font-outfit">
                Verification Pending
              </h2>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                Your verification is under review. You will gain access once
                approved.
              </p>
              <div className="mt-4 bg-white/[0.02] border border-white/5 rounded-xl p-4 text-left text-xs text-gray-500 space-y-2">
                <p>
                  <strong>Organization Name:</strong>{" "}
                  {orgProfile.organization_name || user.name}
                </p>
                <p>
                  <strong>Submitted On:</strong>{" "}
                  {new Date(
                    orgProfile.submission_date ||
                      orgProfile.createdAt ||
                      Date.now(),
                  ).toLocaleDateString()}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="text-amber-500 uppercase tracking-widest font-black text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 ml-1">
                    Pending Review
                  </span>
                </p>
              </div>
              <button
                onClick={fetchOrgProfile}
                className="mt-6 w-fit mx-auto bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-2.5 rounded-xl uppercase tracking-wider text-xs border border-white/10 transition-all active:scale-[0.98]"
              >
                Refresh Status
              </button>
            </div>
          )}

          {orgProfile.status === "rejected" && (
            <div className="flex flex-col gap-4 select-text">
              <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight text-white text-center font-outfit">
                Verification Rejected
              </h2>

              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-xs font-semibold">
                <p className="uppercase tracking-widest text-[9px] text-red-500 font-black mb-1">
                  Rejection Reason:
                </p>
                <p className="font-medium text-red-300">
                  {orgProfile.rejection_reason ||
                    "No specific reason provided by the administrator. Please upload valid proof."}
                </p>
                {orgProfile.admin_notes && (
                  <>
                    <p className="uppercase tracking-widest text-[9px] text-gray-500 font-black mt-3 mb-1">
                      Admin Review Notes:
                    </p>
                    <p className="font-light text-gray-400">
                      {orgProfile.admin_notes}
                    </p>
                  </>
                )}
              </div>

              <p className="text-sm text-gray-400 font-light leading-relaxed text-center">
                Your verification was rejected. Please upload valid documents
                and resubmit.
              </p>

              {}
              <form
                onSubmit={handleResubmit}
                className="mt-6 flex flex-col gap-4 border-t border-white/5 pt-6 select-text max-h-[300px] overflow-y-auto pr-2"
              >
                <h3 className="text-xs font-black uppercase tracking-wider text-trek-brown">
                  Resubmit Credentials
                </h3>

                {resubmitError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 flex items-center gap-2 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    <span>{resubmitError}</span>
                  </div>
                )}

                {resubmitSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3 flex items-center gap-2 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span>{resubmitSuccess}</span>
                  </div>
                )}

                {}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black">
                      Organization Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Wild Summit Club"
                      value={resubmitOrgName}
                      onChange={(e) => setResubmitOrgName(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-trek-brown hover:border-white/20 transition-all font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={resubmitPhone}
                      onChange={(e) => setResubmitPhone(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-trek-brown hover:border-white/20 transition-all font-semibold"
                    />
                  </div>
                </div>

                {}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black">
                    Office / Business Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 123 Mountain View Ave, Munnar, Kerala"
                    value={resubmitAddress}
                    onChange={(e) => setResubmitAddress(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-trek-brown hover:border-white/20 transition-all font-semibold"
                  />
                </div>

                {}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black">
                    Verification Document Type *
                  </label>
                  <select
                    value={resubmitDocType}
                    onChange={(e) => setResubmitDocType(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-trek-brown hover:border-white/20 transition-all font-semibold appearance-none cursor-pointer"
                    style={{ colorScheme: "dark" }}
                  >
                    <option value="Government ID Card">
                      Government ID Card
                    </option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Business Registration Certificate">
                      Business Registration Certificate
                    </option>
                    <option value="Tourism License">Tourism License</option>
                    <option value="Company Registration Documents">
                      Company Registration Documents
                    </option>
                    <option value="Event Management License">
                      Event Management License
                    </option>
                    <option value="Any Other Supporting Document">
                      Any Other Supporting Document
                    </option>
                  </select>
                </div>

                {}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black">
                    Upload Verification Proof (PDF, JPG, PNG - Max 10MB) *
                  </label>
                  <div className="relative border border-dashed border-white/15 hover:border-trek-brown/50 transition-colors rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer bg-white/[0.01]">
                    <input
                      type="file"
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            setResubmitError(
                              "File is too large. Max size is 10MB.",
                            );
                            setResubmitFile(null);
                          } else {
                            setResubmitError("");
                            setResubmitFile(file);
                          }
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                      />
                    </svg>
                    <span className="text-[10px] text-gray-400 text-center">
                      {resubmitFile ? (
                        <strong className="text-trek-brown font-black">
                          {resubmitFile.name} (
                          {(resubmitFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </strong>
                      ) : (
                        "Select file to upload"
                      )}
                    </span>
                  </div>
                </div>

                {}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black">
                    Notes for Admin Review
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide additional details or explain the updated documents..."
                    value={resubmitNotes}
                    onChange={(e) => setResubmitNotes(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-trek-brown hover:border-white/20 transition-all font-semibold placeholder-gray-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isResubmitting}
                  className="w-full bg-trek-brown hover:bg-trek-brown-hover disabled:opacity-50 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-lg transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
                >
                  {isResubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Uploading & Submitting...
                    </>
                  ) : (
                    "Resubmit Verification Form"
                  )}
                </button>
              </form>
            </div>
          )}

          {}
          {orgProfile.status === "suspended" && (
            <div className="flex flex-col gap-4 text-center py-6 select-text">
              <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight text-white">
                Account Suspended
              </h2>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                Your publishing privileges have been suspended by the platform
                administrators.
              </p>
              {orgProfile.admin_notes && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-xs font-semibold text-left">
                  <p className="uppercase tracking-widest text-[9px] text-red-500 font-black mb-1">
                    Admin Suspension Notes:
                  </p>
                  <p className="font-light text-gray-300">
                    {orgProfile.admin_notes}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500 font-light">
                Please contact support if you believe this is in error.
              </p>
            </div>
          )}

          {}
          <div className="mt-8 pt-4 border-t border-white/5 text-center">
            <button
              onClick={() => logout(activeRole)}
              className="text-xs uppercase tracking-widest text-gray-500 hover:text-white font-extrabold transition-colors"
            >
              Sign Out of Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const activeExpeditionsCount = stats.totalTreks || 8;
  const fieldPersonnelCount = stats.totalHikers || 42;
  const pendingBookingsCount = stats.totalBookings || 15;
  const emergencyAlertsCount = emergencyAlerts;

  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "CMD";

  const tripParticipants: Record<string, any> = {};
  bookings.forEach((b: any) => {
    if (!tripParticipants[b.trekTitle]) {
      tripParticipants[b.trekTitle] = { count: 0, members: [] };
    }
    tripParticipants[b.trekTitle].count += b.seats || 1;
    tripParticipants[b.trekTitle].members.push(b.fullName);
  });

  return (
    <div className="font-sans text-white bg-[#070708] h-screen flex flex-col selection:bg-trek-brown selection:text-white overflow-hidden">
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-orange-600 text-white px-4 py-3 rounded-lg shadow-xl font-bold animate-bounce text-sm">
          {toastMessage}
        </div>
      )}

      {}
      <header className="h-14 bg-[#0c0c0e] border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-30 select-none">
        {}
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5 text-white group">
            <div className="h-6 w-6 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </div>
            <span className="font-outfit font-black tracking-widest text-md uppercase bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              TrekMate
            </span>
          </Link>
        </div>

        {}
        <div className="hidden md:block text-[11px] font-bold text-orange-500/80 uppercase tracking-widest font-mono">
          {activeView === "dashboard"
            ? "Dashboard"
            : activeView.replace("-", " ")}
        </div>

        {}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView("notifications")}
            className={`p-2 transition duration-200 cursor-pointer relative ${activeView === "notifications" ? "text-orange-400" : "text-gray-400 hover:text-white"}`}
            title="Notifications"
          >
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {notifications.filter((n) => !n.is_read).length > 0 &&
              !muteNotifications && (
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-orange-500 rounded-full" />
              )}
          </button>

          <div
            className="h-7 w-7 rounded-md bg-orange-600/90 hover:bg-orange-600 flex items-center justify-center font-outfit text-xs font-black text-white shadow-md transition duration-200 cursor-default"
            title={user.name}
          >
            {userInitials}
          </div>
        </div>
      </header>

      {}
      <div className="flex-grow flex overflow-hidden">
        {}
        <aside className="w-52 bg-[#0c0c0e] border-r border-white/5 flex flex-col justify-between shrink-0 h-full select-none z-20">
          {}
          <div className="p-3 space-y-1 overflow-y-auto flex-grow">
            <button
              onClick={() => setActiveView("dashboard")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition duration-200 border cursor-pointer ${
                activeView === "dashboard"
                  ? "bg-trek-brown/10 border-trek-brown/20 text-orange-400 font-black"
                  : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]"
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Dashboard
            </button>

            <button
              onClick={() => setActiveView("create-trip")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition duration-200 border cursor-pointer ${
                activeView === "create-trip"
                  ? "bg-trek-brown/10 border-trek-brown/20 text-orange-400 font-black"
                  : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]"
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Create Trip
            </button>

            <button
              onClick={() => setActiveView("manage-trips")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition duration-200 border cursor-pointer ${
                activeView === "manage-trips"
                  ? "bg-trek-brown/10 border-trek-brown/20 text-orange-400 font-black"
                  : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]"
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              Manage Trips
            </button>

            <button
              onClick={() => setActiveView("bookings")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition duration-200 border cursor-pointer ${
                activeView === "bookings"
                  ? "bg-trek-brown/10 border-trek-brown/20 text-orange-400 font-black"
                  : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]"
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
              Bookings
            </button>

            <button
              onClick={() => setActiveView("members")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition duration-200 border cursor-pointer ${
                activeView === "members"
                  ? "bg-trek-brown/10 border-trek-brown/20 text-orange-400 font-black"
                  : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]"
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Members
            </button>

            <button
              onClick={() => setActiveView("notifications")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-bold transition duration-200 border cursor-pointer ${
                activeView === "notifications"
                  ? "bg-trek-brown/10 border-trek-brown/20 text-orange-400 font-black"
                  : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                Notifications
              </div>
              {notifications.filter((n) => !n.is_read).length > 0 &&
                !muteNotifications && (
                  <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded font-mono">
                    {notifications.filter((n) => !n.is_read).length}
                  </span>
                )}
            </button>

            {}
            <div className="pt-3 pb-1 px-3 text-[9px] font-black tracking-widest text-gray-600 uppercase">
              Field Ops
            </div>

            <button
              onClick={() => setActiveView("live-tracking")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition duration-200 border cursor-pointer ${
                activeView === "live-tracking"
                  ? "bg-trek-brown/10 border-trek-brown/20 text-orange-400 font-black"
                  : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]"
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              Live Tracking
            </button>

            {}
            <div className="pt-3 pb-1 px-3 text-[9px] font-black tracking-widest text-gray-600 uppercase">
              Backoffice
            </div>

            <button
              onClick={() => setActiveView("chat")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition duration-200 border cursor-pointer ${
                activeView === "chat"
                  ? "bg-trek-brown/10 border-trek-brown/20 text-orange-400 font-black"
                  : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]"
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Chat
            </button>

            <button
              onClick={() => setActiveView("payments")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition duration-200 border cursor-pointer ${
                activeView === "payments"
                  ? "bg-trek-brown/10 border-trek-brown/20 text-orange-400 font-black"
                  : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]"
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Payments
            </button>

            <button
              onClick={() => setActiveView("analytics")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition duration-200 border cursor-pointer ${
                activeView === "analytics"
                  ? "bg-trek-brown/10 border-trek-brown/20 text-orange-400 font-black"
                  : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]"
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Analytics
            </button>
          </div>

          {}
          <div className="p-3 border-t border-white/5 bg-[#09090b]">
            <button
              onClick={() => logout(user?.role || "organizer")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition cursor-pointer border-none"
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </aside>

        {}
        <main className="flex-1 h-full overflow-y-auto z-10 flex flex-col justify-between relative bg-[#070708]">
          {}
          <div className="absolute top-0 right-0 h-[300px] w-[300px] bg-trek-brown/5 blur-[120px] rounded-full pointer-events-none z-0" />
          <div className="absolute bottom-0 left-0 h-[300px] w-[300px] bg-orange-600/5 blur-[120px] rounded-full pointer-events-none z-0" />

          {}
          <div className="p-6 md:p-8 relative z-10 w-full max-w-7xl mx-auto flex-grow">
            {}
            {activeView === "dashboard" && (
              <OrganizerDashboardStats
                activeExpeditionsCount={activeExpeditionsCount}
                fieldPersonnelCount={fieldPersonnelCount}
                pendingBookingsCount={pendingBookingsCount}
                emergencyAlertsCount={emergencyAlertsCount}
                setActiveView={setActiveView}
              />
            )}

            {activeView === "create-trip" && (
              <div className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto animate-fadeIn">
                <h2 className="font-outfit text-xl font-black uppercase text-white mb-1.5 tracking-tight">
                  Publish New Expedition
                </h2>
                <p className="text-gray-400 text-[11px] font-light leading-relaxed mb-6">
                  Create a customized trail itinerary. Once published, your
                  expedition will go live on the Explore feed and will be
                  bookable by trekkers.
                </p>

                {}
                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4.5 flex items-center gap-3 text-xs mb-6 animate-pulse select-none">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="font-medium">{errorMsg}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-4.5 flex items-center gap-3 text-xs mb-6 select-none">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0 animate-ping" />
                    <span className="font-medium">{successMsg}</span>
                  </div>
                )}

                <form
                  onSubmit={handleCreateTrekSubmit}
                  className="flex flex-col gap-5 select-text"
                >
                  {}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black select-none">
                        Trek Title
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Himalayan Sunrise Peak"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4.5 py-3 text-xs text-white outline-none focus:border-orange-500 hover:border-white/20 transition font-semibold placeholder-gray-600"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black select-none">
                        Trail Location
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Manali, Himachal Pradesh"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4.5 py-3 text-xs text-white outline-none focus:border-orange-500 hover:border-white/20 transition font-semibold placeholder-gray-600"
                      />
                    </div>
                  </div>

                  {}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black select-none">
                        Rate per Person (₹)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 5800"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4.5 py-3 text-xs text-white outline-none focus:border-orange-500 hover:border-white/20 transition font-semibold placeholder-gray-600 font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black select-none">
                        Duration
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2 Days / 1 Night"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4.5 py-3 text-xs text-white outline-none focus:border-orange-500 hover:border-white/20 transition font-semibold placeholder-gray-600"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black select-none">
                        Difficulty
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4.5 py-3 text-xs text-white outline-none focus:border-orange-500 hover:border-white/20 transition font-semibold cursor-pointer"
                      >
                        <option value="Easy" className="bg-[#0c0c0e]">
                          Easy
                        </option>
                        <option value="Moderate" className="bg-[#0c0c0e]">
                          Moderate
                        </option>
                        <option value="Difficult" className="bg-[#0c0c0e]">
                          Difficult
                        </option>
                        <option value="Expert" className="bg-[#0c0c0e]">
                          Expert
                        </option>
                      </select>
                    </div>
                  </div>

                  {}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black select-none">
                        Expedition Dates
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Oct 12 - Oct 13, 2026"
                        value={dates}
                        onChange={(e) => setDates(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4.5 py-3 text-xs text-white outline-none focus:border-orange-500 hover:border-white/20 transition font-semibold placeholder-gray-600"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black select-none">
                        Reporting / Pickup Point
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Manali Bus Terminal"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4.5 py-3 text-xs text-white outline-none focus:border-orange-500 hover:border-white/20 transition font-semibold placeholder-gray-600"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black select-none">
                        Weather Presets
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 12°C Clear"
                        value={temp}
                        onChange={(e) => setTemp(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4.5 py-3 text-xs text-white outline-none focus:border-orange-500 hover:border-white/20 transition font-semibold placeholder-gray-600"
                      />
                    </div>
                  </div>

                  {}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black select-none">
                      Expedition Details / Description
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Provide details about the route, camp specifications, safety guidelines, and scenic highlights."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4.5 py-3 text-xs text-white outline-none focus:border-orange-500 hover:border-white/20 transition font-semibold placeholder-gray-600 resize-none leading-relaxed"
                    />
                  </div>

                  {}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black select-none">
                      Upload Cover Image
                    </span>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 rounded-xl px-4.5 py-4 transition flex flex-col items-center justify-center gap-2 border-dashed">
                        <svg
                          className="w-6 h-6 text-orange-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          ></path>
                        </svg>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                          {imageFile
                            ? imageFile.name
                            : "Click to select image file"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setImageFile(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      {}
                      {image && !imageFile && (
                        <div className="h-20 w-24 rounded-xl overflow-hidden shrink-0 border border-white/10">
                          <img
                            src={image}
                            alt="Current cover"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {imageFile && (
                        <div className="h-20 w-24 rounded-xl overflow-hidden shrink-0 border border-orange-500/50">
                          <img
                            src={URL.createObjectURL(imageFile)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-lg transition duration-300 flex items-center justify-center gap-2 active:scale-[0.98] mt-2 border-none cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Publishing to Feed...
                      </>
                    ) : editingTrekId ? (
                      "Update Expedition Live"
                    ) : (
                      "Publish Expedition Live"
                    )}
                  </button>
                </form>
              </div>
            )}

            {}
            {activeView === "manage-trips" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center select-none">
                  <div>
                    <h2 className="font-outfit text-xl font-black uppercase text-white tracking-tight">
                      Managed Expeditions
                    </h2>
                    <p className="text-gray-400 text-xs font-light mt-0.5">
                      Manage details and view schedules for your published
                      trails.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveView("create-trip")}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition cursor-pointer border-none"
                  >
                    + Add Expedition
                  </button>
                </div>

                {myTreks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 rounded-2xl bg-white/[0.01]">
                    <span className="text-5xl block mb-4">️</span>
                    <h3 className="font-outfit text-xl font-bold uppercase text-white mb-2">
                      No Treks Published
                    </h3>
                    <p className="text-gray-400 text-xs max-w-xs leading-relaxed mb-6 font-light">
                      You have not published any custom expeditions. Add your
                      first trek to start hosting hikers.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myTreks.map((trek) => (
                      <div
                        key={trek.id}
                        className="bg-[#0c0c0e] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-white/10 transition-all duration-300"
                      >
                        {}
                        <div className="h-40 w-full relative overflow-hidden select-none">
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                            style={{ backgroundImage: `url('${trek.image}')` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-transparent to-transparent opacity-80" />
                          <span className="absolute top-4 left-4 z-10 bg-orange-600 text-white text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest shadow-md">
                            {trek.difficulty}
                          </span>
                          <span className="absolute bottom-4 left-4 z-10 text-xs font-bold text-gray-300 font-mono">
                            {trek.dates}
                          </span>
                        </div>

                        {}
                        <div className="p-5 flex-grow flex flex-col justify-between">
                          <div>
                            <h3 className="font-outfit text-lg font-black uppercase text-white leading-none group-hover:text-orange-400 transition-colors duration-300">
                              {trek.title}
                            </h3>
                            <span className="text-[10px] text-gray-500 font-bold uppercase mt-1.5 block">
                              {trek.location}
                            </span>
                            <p className="text-xs text-gray-400 font-light mt-3 leading-relaxed line-clamp-2">
                              {trek.description}
                            </p>
                          </div>

                          {}
                          <div className="border-t border-white/5 pt-4 mt-5 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[8px] text-gray-500 uppercase font-black leading-none">
                                Rate per Hiker
                              </span>
                              <span className="text-sm font-black text-white mt-1">
                                {trek.price}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditClick(trek)}
                                className="px-4 py-2 border border-orange-500/50 hover:bg-orange-600 text-orange-500 hover:text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition active:scale-95 cursor-pointer bg-transparent"
                              >
                                Edit
                              </button>
                              <Link
                                to={`/details/${trek.id}`}
                                className="px-4 py-2 border border-white/10 hover:border-white/20 text-white hover:bg-white hover:text-black rounded-lg text-xs font-semibold uppercase tracking-wider transition active:scale-95"
                              >
                                Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {}
            {activeView === "bookings" && (
              <div className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center select-none">
                  <div>
                    <h2 className="font-outfit text-xl font-bold uppercase text-white">
                      Registered Participants
                    </h2>
                    <p className="text-gray-400 text-xs font-light mt-0.5">
                      List of verified bookings and tickets for your trails.
                    </p>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center select-none">
                    <span className="text-4xl block mb-3"></span>
                    <h4 className="font-outfit text-md font-bold uppercase text-gray-400 mb-1">
                      No Bookings Yet
                    </h4>
                    <p className="text-gray-500 text-xs max-w-xs leading-relaxed font-light">
                      When hikers register and purchase tickets for your treks,
                      they will be listed here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full select-text">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-500 uppercase text-[9px] tracking-widest">
                          <th className="py-3 px-4 font-black">Hiker Name</th>
                          <th className="py-3 px-4 font-black">Contact Info</th>
                          <th className="py-3 px-4 font-black">Trek Title</th>
                          <th className="py-3 px-4 font-black text-center">
                            Seats
                          </th>
                          <th className="py-3 px-4 font-black">Amount</th>
                          <th className="py-3 px-4 font-black">Booking Date</th>
                          <th className="py-3 px-4 font-black">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr
                            key={booking.ticketId}
                            className="border-b border-white/5 hover:bg-white/[0.02] transition"
                          >
                            <td className="py-4 px-4 font-bold text-white">
                              <div>{booking.fullName}</div>
                              <div className="text-[9px] font-mono text-gray-500 mt-0.5">
                                {booking.ticketId}
                              </div>
                            </td>
                            <td className="py-4 px-4 font-light text-gray-400">
                              <div>{booking.email}</div>
                              <div className="font-mono text-[10px] mt-0.5">
                                {booking.phone}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-300 font-medium">
                              {booking.trekTitle}
                            </td>
                            <td className="py-4 px-4 text-center text-white font-bold font-mono">
                              {booking.seats}
                            </td>
                            <td className="py-4 px-4 font-bold text-white font-mono">
                              ₹{booking.payableAmount.toLocaleString("en-IN")}
                            </td>
                            <td className="py-4 px-4 text-gray-400 font-light font-mono">
                              {booking.bookingDate}
                            </td>
                            <td className="py-4 px-4 select-none">
                              {booking.booking_status === "pending" ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      handleUpdateBookingStatus(
                                        booking._id,
                                        "confirmed",
                                      )
                                    }
                                    className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded cursor-pointer hover:bg-emerald-500/30 transition"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleUpdateBookingStatus(
                                        booking._id,
                                        "rejected",
                                      )
                                    }
                                    className="bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded cursor-pointer hover:bg-red-500/30 transition"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span
                                  className={`${booking.booking_status === "confirmed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-gray-500/10 border-gray-500/20 text-gray-400"} border text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded`}
                                >
                                  {booking.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {}
            {activeView === "members" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-outfit text-xl font-black uppercase text-white tracking-tight">
                    Personnel Directory
                  </h2>
                  <p className="text-gray-400 text-xs font-light mt-0.5">
                    Manage lead guides, crew, and emergency contacts.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 select-none">
                  {}
                  <div className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-4.5 shadow-lg flex flex-col justify-between">
                    <div className="flex items-start gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-orange-600/10 border border-orange-500/30 flex items-center justify-center text-orange-500 text-md font-black">
                        S
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          Sarah Williams
                        </h4>
                        <span className="text-[8px] text-gray-500 uppercase font-black block mt-0.5">
                          Certified Lead Guide
                        </span>
                        <span className="inline-block mt-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded">
                          Active on Trail
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-white/5 pt-3.5 mt-5 flex justify-between items-center text-[9px] text-gray-400 font-mono">
                      <span>Exp: 8 years</span>
                      <span>Tours: 45+</span>
                    </div>
                  </div>

                  {}
                  <div className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-4.5 shadow-lg flex flex-col justify-between">
                    <div className="flex items-start gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-gray-500/10 border border-white/10 flex items-center justify-center text-gray-400 text-md font-black">
                        D
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          David Miller
                        </h4>
                        <span className="text-[8px] text-gray-500 uppercase font-black block mt-0.5">
                          Senior Trail Master
                        </span>
                        <span className="inline-block mt-1.5 bg-gray-500/10 border border-white/10 text-gray-400 text-[8px] font-bold px-2 py-0.5 rounded">
                          Off Duty / Base
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-white/5 pt-3.5 mt-5 flex justify-between items-center text-[9px] text-gray-400 font-mono">
                      <span>Exp: 10 years</span>
                      <span>Tours: 62+</span>
                    </div>
                  </div>

                  {}
                  <div className="bg-[#0c0c0e] border border-orange-500/20 rounded-2xl p-4.5 shadow-[0_0_15px_rgba(249,115,22,0.02)] flex flex-col justify-between">
                    <div className="flex items-start gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-orange-500/20 border border-orange-500 flex items-center justify-center text-white text-md font-black shadow-md">
                        {user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {user.name}
                        </h4>
                        <span className="text-[8px] text-orange-400 uppercase font-black block mt-0.5">
                          HQ Operations Command
                        </span>
                        <span className="inline-block mt-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[8px] font-bold px-2 py-0.5 rounded">
                          HQ Online
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-white/5 pt-3.5 mt-5 flex justify-between items-center text-[9px] text-gray-400 font-mono">
                      <span>Exp: Command</span>
                      <span>Admin Level</span>
                    </div>
                  </div>
                </div>

                {}
                <div className="mt-10">
                  <h2 className="font-outfit text-xl font-black uppercase text-white tracking-tight">
                    Trip Participants
                  </h2>
                  <p className="text-gray-400 text-xs font-light mt-0.5 mb-5">
                    Overview of members joined per trip.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Object.keys(tripParticipants).length === 0 ? (
                      <div className="col-span-full flex flex-col items-center justify-center py-10 text-center border border-white/5 rounded-2xl bg-white/[0.01]">
                        <h4 className="font-outfit text-md font-bold uppercase text-gray-400 mb-1">
                          No Participants Yet
                        </h4>
                        <p className="text-gray-500 text-xs max-w-xs leading-relaxed font-light">
                          Once members join your trips, they will be listed
                          here.
                        </p>
                      </div>
                    ) : (
                      Object.entries(tripParticipants).map(([title, data]) => (
                        <div
                          key={title}
                          className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-4.5 shadow-lg flex flex-col justify-between max-h-64"
                        >
                          <div className="mb-4">
                            <h4 className="text-sm font-bold text-white leading-tight">
                              {title}
                            </h4>
                            <span className="text-[9px] text-orange-400 uppercase font-black block mt-1">
                              Total Joined: {data.count} Members
                            </span>
                          </div>

                          <div className="border-t border-white/5 pt-3 flex-1 overflow-y-auto">
                            <ul className="text-xs text-gray-400 font-light flex flex-col gap-2">
                              {data.members.map((m, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 bg-orange-500 rounded-full shrink-0"></span>
                                  <span className="truncate">{m}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {}
            {activeView === "live-tracking" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                {}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-5 shadow-2xl">
                    <div className="flex justify-between items-center select-none mb-4">
                      <div>
                        <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block font-mono">
                          Operations
                        </span>
                        <h2 className="font-outfit text-lg font-bold uppercase text-white">
                          Live Telemetry Control
                        </h2>
                      </div>
                      <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded font-mono animate-pulse">
                        RECEIVING LIVE STREAM
                      </span>
                    </div>

                    {}
                    <div className="relative aspect-video rounded-xl border border-white/5 overflow-hidden z-0">
                      <MapContainer
                        center={[liveLocation.lat, liveLocation.lng]}
                        zoom={14}
                        scrollWheelZoom={false}
                        className="w-full h-full"
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[liveLocation.lat, liveLocation.lng]}>
                          <Popup>Active Hiker Location</Popup>
                        </Marker>
                        <MapAutoPan location={liveLocation} />
                      </MapContainer>

                      {}
                      <div className="absolute bottom-3 left-3 bg-[#0c0c0e]/90 px-3 py-1.5 rounded border border-white/10 font-mono text-[8px] text-orange-500 space-y-0.5 z-[1000]">
                        <div>LAT: {liveLocation.lat.toFixed(6)}° N</div>
                        <div>LON: {liveLocation.lng.toFixed(6)}° E</div>
                        <div>STATUS: LIVE TRACKING</div>
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-5 shadow-2xl">
                    <h3 className="text-[10px] font-bold uppercase text-white font-mono tracking-wider mb-3">
                      Command Logs Feed
                    </h3>
                    <div className="bg-[#070708] rounded-xl p-3.5 font-mono text-[9px] text-gray-400 space-y-1.5 h-36 overflow-y-auto border border-white/5">
                      {telemetryLogs.map((log, index) => (
                        <div key={index} className="flex gap-2">
                          <span className="text-orange-500/60 font-black">
                            [
                            {new Date().toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                            ]
                          </span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {}
                <div className="space-y-6">
                  <div className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-5 shadow-2xl">
                    <h3 className="text-[10px] font-bold uppercase text-white tracking-widest font-mono mb-3">
                      Channel Details
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-[#070708] rounded-xl border border-white/5 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-white">
                            Munnar Team
                          </div>
                          <div className="text-[8px] text-gray-500 mt-0.5 font-mono">
                            Sarah Williams
                          </div>
                        </div>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      </div>

                      <div className="p-3 bg-[#070708] rounded-xl border border-white/5 flex justify-between items-center opacity-60">
                        <div>
                          <div className="font-bold text-white">
                            Wayanad Team
                          </div>
                          <div className="text-[8px] text-gray-500 mt-0.5 font-mono">
                            David Miller
                          </div>
                        </div>
                        <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold">
                          Offline
                        </span>
                      </div>

                      <div className="p-3 bg-[#070708] rounded-xl border border-white/5 flex justify-between items-center opacity-60">
                        <div>
                          <div className="font-bold text-white">
                            Nilgiri Ridge
                          </div>
                          <div className="text-[8px] text-gray-500 mt-0.5 font-mono">
                            HQ Comms Standby
                          </div>
                        </div>
                        <span className="text-[8px] uppercase tracking-widest text-orange-500 font-bold">
                          Standby
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {}
            {activeView === "chat" && (
              <div className="animate-fadeIn">
                <ChatLayout />
              </div>
            )}

            {}
            {activeView === "payments" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-outfit text-xl font-black uppercase text-white tracking-tight">
                    Financial Operations
                  </h2>
                  <p className="text-gray-400 text-xs font-light mt-0.5">
                    Track gross volume earnings, bookings volume, and recent
                    payout transfers.
                  </p>
                </div>

                {}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 select-none">
                  {}
                  <div className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-5 shadow flex flex-col justify-between min-h-[120px]">
                    <div>
                      <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block font-mono">
                        Gross Earnings
                      </span>
                      <h3 className="text-2xl font-black text-white font-mono mt-2">
                        ₹
                        {(stats.totalRevenue || 123800).toLocaleString("en-IN")}
                      </h3>
                    </div>
                    <span className="text-[8px] text-orange-500 font-bold block mt-1.5">
                      All times combined volume
                    </span>
                  </div>

                  {}
                  <div className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-5 shadow flex flex-col justify-between min-h-[120px]">
                    <div>
                      <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block font-mono">
                        Ready for Payout
                      </span>
                      <h3 className="text-2xl font-black text-white font-mono mt-2">
                        ₹
                        {Math.round(
                          (stats.totalRevenue || 123800) * 0.85,
                        ).toLocaleString("en-IN")}
                      </h3>
                    </div>
                    <span className="text-[8px] text-emerald-400 font-bold block mt-1.5">
                      85% Revenue Share Payout Rate
                    </span>
                  </div>

                  {}
                  <div className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-5 shadow flex flex-col justify-between min-h-[120px]">
                    <div>
                      <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block font-mono">
                        Next Transfer
                      </span>
                      <h3 className="text-xl font-black text-white font-mono mt-2 uppercase">
                        In 4 Days
                      </h3>
                    </div>
                    <span className="text-[8px] text-gray-500 font-bold block mt-1.5">
                      Bi-weekly automated ACH transfer
                    </span>
                  </div>
                </div>

                {}
                <div className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-5 shadow-2xl select-text">
                  <h3 className="text-[10px] font-bold uppercase text-white font-mono tracking-widest mb-3.5">
                    Transaction Ledger
                  </h3>

                  {bookings.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-xs">
                      No transactions found in active ledger records.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {bookings.map((b) => (
                        <div
                          key={b.ticketId}
                          className="flex justify-between items-center py-2.5 border-b border-white/5 text-[11px] hover:bg-white/[0.01] px-2 rounded transition"
                        >
                          <div>
                            <div className="font-bold text-white">
                              {b.fullName}
                            </div>
                            <div className="text-[8px] text-gray-500 mt-0.5 font-mono">
                              {b.trekTitle}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-emerald-400 font-mono">
                              +₹{b.payableAmount.toLocaleString("en-IN")}
                            </div>
                            <div className="text-[8px] text-gray-500 font-mono mt-0.5">
                              {b.bookingDate}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {}
            {activeView === "analytics" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-outfit text-xl font-black uppercase text-white tracking-tight">
                    Analytical Telemetry
                  </h2>
                  <p className="text-gray-400 text-xs font-light mt-0.5">
                    Demographics, trail popularity, and hiker growth logs.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 select-none">
                  {}
                  <div className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-5 shadow-2xl">
                    <h3 className="text-[10px] font-bold uppercase text-white font-mono tracking-wider mb-5">
                      Expedition Popularity
                    </h3>
                    <div className="space-y-3.5">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-gray-300">
                            Munnar Mist Trek
                          </span>
                          <span className="font-mono text-gray-500">
                            65 Bookings
                          </span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: "80%" }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-gray-300">
                            Wayanad River Camp
                          </span>
                          <span className="font-mono text-gray-500">
                            42 Bookings
                          </span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: "55%" }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-gray-300">
                            Peak Challenge
                          </span>
                          <span className="font-mono text-gray-500">
                            28 Bookings
                          </span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: "35%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase text-white font-mono tracking-wider mb-5">
                        User Satisfaction Rating
                      </h3>
                      <div className="flex items-center gap-5">
                        <span className="font-outfit text-4xl font-black text-white">
                          4.9
                        </span>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className="w-3 h-3 text-orange-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-[9px] text-gray-500 font-mono">
                            Based on 280+ verified hiker ratings
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-white/5 pt-3.5 mt-5 text-[9px] text-gray-400 leading-relaxed font-light">
                      98.6% of participants recommend this organizer to friends.
                      Feedback is monitored by platform compliance teams.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {}
            {activeView === "notifications" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center select-none">
                  <div>
                    <h2 className="font-outfit text-xl font-bold uppercase text-white">
                      Notifications
                    </h2>
                    <p className="text-gray-400 text-xs font-light mt-0.5">
                      Stay updated with your bookings and payments.
                    </p>
                  </div>
                  {notifications.filter((n) => !n.is_read).length > 0 && (
                    <button
                      onClick={handleMarkAllNotificationsAsRead}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-lg transition cursor-pointer"
                    >
                      Mark All as Read
                    </button>
                  )}
                </div>

                {muteNotifications && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-xl mb-2 text-[10px] font-medium flex items-center gap-2 animate-fadeIn select-none">
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                      />
                    </svg>
                    Alerts are currently muted. You will not see notification
                    badges in real-time.
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {}
                  <div className="lg:col-span-2 space-y-3">
                    {notificationsLoading && notifications.length === 0 ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-20 w-full rounded-2xl bg-white/5 border border-white/5 animate-pulse animate-fadeIn"
                          ></div>
                        ))}
                      </div>
                    ) : filteredNotifications.length === 0 ? (
                      <div className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-12 text-center shadow-2xl flex flex-col items-center justify-center animate-fadeIn select-none">
                        <div className="h-12 w-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl mb-3 text-gray-500"></div>
                        <h4 className="font-outfit text-sm font-bold uppercase text-gray-400 mb-1">
                          No Notifications
                        </h4>
                        <p className="text-gray-500 text-xs max-w-xs leading-relaxed font-light">
                          {showUnreadOnly
                            ? "You don't have any unread notifications at the moment."
                            : "Your organizer notifications log is empty! New requests and updates will be posted here."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredNotifications.map((notif) => {
                          const unread = !notif.is_read;
                          return (
                            <div
                              key={notif._id}
                              onClick={() =>
                                handleMarkNotificationAsRead(notif._id)
                              }
                              className={`group bg-[#0c0c0e] border transition-all duration-300 rounded-2xl p-4 flex gap-4 cursor-pointer relative overflow-hidden animate-fadeIn ${
                                unread
                                  ? "border-orange-500/30 bg-orange-500/[0.01] hover:border-orange-500/50 hover:bg-orange-500/[0.02]"
                                  : "border-white/5 hover:border-white/10 hover:bg-white/[0.01]"
                              }`}
                            >
                              {}
                              {unread && (
                                <span className="absolute top-0 left-0 h-full w-1 bg-orange-500" />
                              )}

                              {}
                              <div
                                className={`h-9 w-9 shrink-0 rounded-lg border flex items-center justify-center text-md ${
                                  unread
                                    ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                                    : "bg-white/5 border-white/10 text-gray-400"
                                }`}
                              >
                                {notif.type === "booking_confirmed"
                                  ? ""
                                  : notif.type === "booking_cancelled"
                                    ? ""
                                    : ""}
                              </div>

                              {}
                              <div className="flex-grow min-w-0 pr-4">
                                <div className="flex items-start justify-between gap-2">
                                  <h4
                                    className={`text-xs font-bold truncate ${unread ? "text-white font-black" : "text-gray-300"}`}
                                  >
                                    {notif.title}
                                  </h4>
                                  <span className="text-[9px] text-gray-500 font-mono shrink-0 pt-0.5">
                                    {new Date(
                                      notif.createdAt,
                                    ).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed font-light">
                                  {notif.message}
                                </p>
                              </div>

                              {}
                              <div className="flex items-center self-center shrink-0">
                                <button
                                  onClick={(e) =>
                                    handleDeleteNotification(e, notif._id)
                                  }
                                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 rounded-md hover:bg-white/5 transition duration-200 cursor-pointer"
                                  title="Delete notification"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {}
                  <div className="space-y-4">
                    <div className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                      <div>
                        <h3 className="font-outfit text-[10px] font-bold uppercase text-white tracking-widest mb-5 flex items-center gap-2 select-none font-mono">
                          Preferences
                        </h3>

                        <div className="space-y-3.5">
                          {}
                          <div className="flex items-center justify-between pb-3 border-b border-white/5 select-none">
                            <div>
                              <div className="text-[11px] font-bold text-gray-200">
                                Unread Only
                              </div>
                              <div className="text-[9px] text-gray-500 font-light mt-0.5">
                                Filter read notifications.
                              </div>
                            </div>
                            <button
                              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                              className={`w-8.5 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${showUnreadOnly ? "bg-orange-500" : "bg-white/10"}`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${showUnreadOnly ? "translate-x-3.5" : "translate-x-0"}`}
                              />
                            </button>
                          </div>

                          {}
                          <div className="flex items-center justify-between pb-3 border-b border-white/5 select-none">
                            <div>
                              <div className="text-[11px] font-bold text-gray-200">
                                Mute Alerts
                              </div>
                              <div className="text-[9px] text-gray-500 font-light mt-0.5">
                                Mute dashboard indicators.
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setMuteNotifications(!muteNotifications)
                              }
                              className={`w-8.5 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${muteNotifications ? "bg-orange-500" : "bg-white/10"}`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${muteNotifications ? "translate-x-3.5" : "translate-x-0"}`}
                              />
                            </button>
                          </div>

                          {}
                          <div className="flex items-center justify-between select-none">
                            <div>
                              <div className="text-[11px] font-bold text-gray-200">
                                Email Alerts
                              </div>
                              <div className="text-[9px] text-gray-500 font-light mt-0.5">
                                Get emails for bookings.
                              </div>
                            </div>
                            <button
                              onClick={() => setEmailAlerts(!emailAlerts)}
                              className={`w-8.5 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${emailAlerts ? "bg-orange-500" : "bg-white/10"}`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${emailAlerts ? "translate-x-3.5" : "translate-x-0"}`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-3.5 mt-5 text-[8px] text-gray-500 leading-relaxed font-mono select-none">
                        DASHBOARD SYNC: ENABLED
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {}
          <footer className="px-8 py-5 bg-[#09090b] border-t border-white/5 flex items-center justify-between select-none z-10">
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-orange-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M3 20L12 4L21 20H3Z" />
              </svg>
              <span className="font-outfit font-black tracking-widest text-[10px] uppercase text-gray-400">
                TrekMate HQ
              </span>
            </div>
            <div className="text-[8px] text-gray-600 font-mono font-bold">
              HQ TERMINAL STATUS: OPERATIONAL
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
