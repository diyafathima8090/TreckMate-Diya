// Stateful mock database for TrekMate Admin Dashboard

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window !== "undefined") {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item);
      } catch (e) {
        console.error("Failed to parse storage item for key: " + key, e);
      }
    }
  }
  return defaultValue;
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// --- Initial Data Seeds ---

const initialUsers = [
  {
    _id: "u1",
    name: "Alex Johnson",
    username: "alex_j",
    email: "alex@example.com",
    phone: "+1 (555) 019-2834",
    role: "trekker",
    is_verified: true,
    status: "active", // active, suspended
    profileImage: "https://api.dicebear.com/7.x/adventurer/svg?seed=alex",
    bio: "Outdoor enthusiast, weekend trekker, and photography lover. Always seeking the next summit.",
    createdAt: "2026-01-15T08:30:00Z",
    activities: [
      { id: "a1", action: "Logged in", time: "2026-06-08T09:12:00Z", ip: "192.168.1.50" },
      { id: "a2", action: "Booked trip 'Alpine Summit Hiker'", time: "2026-06-05T14:20:00Z", ip: "192.168.1.50" },
      { id: "a3", action: "Left a review for 'Canyon Backpacking'", time: "2026-05-20T17:45:00Z", ip: "192.168.1.48" }
    ]
  },
  {
    _id: "u2",
    name: "Emma Watson",
    username: "emma_w",
    email: "emma@example.com",
    phone: "+1 (555) 042-3982",
    role: "trekker",
    is_verified: true,
    status: "active",
    profileImage: "https://api.dicebear.com/7.x/adventurer/svg?seed=emma",
    bio: "Avid mountaineer. Loved scaling the Rockies. Looking for Himalayan treks next.",
    createdAt: "2026-02-10T11:15:00Z",
    activities: [
      { id: "a4", action: "Logged in", time: "2026-06-07T18:40:00Z", ip: "192.168.1.99" },
      { id: "a5", action: "Cancelled booking for 'Desert Safari'", time: "2026-06-01T10:00:00Z", ip: "192.168.1.99" }
    ]
  },
  {
    _id: "u3",
    name: "Summit Adventures LLC",
    username: "summit_adv",
    email: "info@summitadventures.com",
    phone: "+1 (555) 011-8899",
    role: "organizer",
    is_verified: true,
    status: "active",
    profileImage: "https://api.dicebear.com/7.x/bottts/svg?seed=summit",
    bio: "Professional trekking outfit offering guided alpine climbs, glacier walks, and safety training.",
    createdAt: "2026-02-28T14:00:00Z",
    activities: [
      { id: "a6", action: "Created new trek 'Glacier Trekking Pro'", time: "2026-06-07T11:00:00Z", ip: "10.0.0.12" },
      { id: "a7", action: "Updated pricing for 'Alpine Summit Hiker'", time: "2026-06-04T15:30:00Z", ip: "10.0.0.12" }
    ]
  },
  {
    _id: "u4",
    name: "Wilderness Trails",
    username: "wild_trails",
    email: "contact@wildtrails.org",
    phone: "+1 (555) 077-4433",
    role: "organizer",
    is_verified: true,
    status: "active",
    profileImage: "https://api.dicebear.com/7.x/bottts/svg?seed=wild",
    bio: "Eco-friendly wilderness trail organizer dedicated to sustainable adventure travel.",
    createdAt: "2026-03-05T09:00:00Z",
    activities: [
      { id: "a8", action: "Approved booking request", time: "2026-06-08T08:15:00Z", ip: "172.16.2.22" }
    ]
  },
  {
    _id: "u5",
    name: "Marcus Aurelius",
    username: "marcus_a",
    email: "marcus@philosophy.edu",
    phone: "+1 (555) 099-2211",
    role: "trekker",
    is_verified: false,
    status: "suspended",
    profileImage: "https://api.dicebear.com/7.x/adventurer/svg?seed=marcus",
    bio: "Looking for peaceful hikes to contemplate nature and write meditations.",
    createdAt: "2026-04-01T10:00:00Z",
    activities: [
      { id: "a9", action: "Account suspended by Admin", time: "2026-06-03T16:00:00Z", ip: "System" }
    ]
  },
  {
    _id: "u6",
    name: "Himalayan Sherpa Guides",
    username: "sherpa_guides",
    email: "guide@sherpa.np",
    phone: "+977-9841-123456",
    role: "organizer",
    is_verified: false,
    status: "pending", // Pending approval as organizer
    profileImage: "https://api.dicebear.com/7.x/bottts/svg?seed=sherpa",
    bio: "Local Sherpa guides with combined 40+ years experience climbing Everest, Annapurna, and K2.",
    createdAt: "2026-06-01T15:20:00Z",
    activities: [
      { id: "a10", action: "Submitted organizer application", time: "2026-06-01T15:30:00Z", ip: "202.166.220.12" }
    ]
  },
  {
    _id: "u7",
    name: "Diya Fathima",
    username: "diya_admin",
    email: "admin@trekmate.com",
    phone: "+91 98765 43210",
    role: "admin",
    is_verified: true,
    status: "active",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=diya",
    bio: "Lead Platform Administrator for TrekMate. Managing user safety and quality controls.",
    createdAt: "2026-01-01T00:00:00Z",
    activities: [
      { id: "a11", action: "Logged in to admin console", time: "2026-06-08T10:00:00Z", ip: "192.168.1.1" }
    ]
  }
];

const initialOrganizers = [
  {
    _id: "org1",
    user_id: "u3",
    organization_name: "Summit Adventures LLC",
    license_number: "LIC-SUMMIT-2025-9981",
    experience: 8,
    documents: "https://example.com/docs/summit_license.pdf",
    status: "approved", // pending, approved, rejected, suspended
    phone: "+1 (555) 011-8899",
    description: "Alpine specialized mountaineering organizers.",
    rating: 4.8,
    total_treks: 12,
    earnings: 15400
  },
  {
    _id: "org2",
    user_id: "u4",
    organization_name: "Wilderness Trails",
    license_number: "LIC-WILD-2024-3321",
    experience: 5,
    documents: "https://example.com/docs/wild_license.pdf",
    status: "approved",
    phone: "+1 (555) 077-4433",
    description: "Guided forest and canyon treks prioritizing ecology.",
    rating: 4.5,
    total_treks: 7,
    earnings: 8900
  },
  {
    _id: "org3",
    user_id: "u6",
    organization_name: "Himalayan Sherpa Guides",
    license_number: "LIC-NEPAL-SHERPA-88",
    experience: 15,
    documents: "https://example.com/docs/sherpa_credentials.pdf",
    status: "pending",
    phone: "+977-9841-123456",
    description: "Deep Himalayan mountaineering expertise for high altitudes.",
    rating: 0.0,
    total_treks: 0,
    earnings: 0
  }
];

const initialTrips = [
  {
    _id: "t1",
    id: "trek-alpine-summit",
    title: "Alpine Summit Hiker",
    location: "Colorado Rockies, USA",
    category: "Mountain",
    duration: "4 Days",
    organizer_id: "u3",
    organizer_name: "Summit Adventures LLC",
    status: "approved", // pending, approved, rejected, completed, cancelled
    price: 450,
    banner: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    description: "Conquer peak elevations up to 14,000 feet with experienced mountain guides. Breathtaking panoramas and alpine meadow camp sites.",
    bookingsCount: 8,
    createdAt: "2026-03-15T10:00:00Z"
  },
  {
    _id: "t2",
    id: "trek-canyon-backpack",
    title: "Grand Canyon Backpacking",
    location: "Arizona, USA",
    category: "Canyon",
    duration: "5 Days",
    organizer_id: "u4",
    organizer_name: "Wilderness Trails",
    status: "approved",
    price: 380,
    banner: "https://images.unsplash.com/photo-1615551043360-33de8b5f410c?auto=format&fit=crop&w=800&q=80",
    description: "Deep descent hiking along the Bright Angel Trail. Camp under millions of desert stars inside the canyon core.",
    bookingsCount: 14,
    createdAt: "2026-03-20T11:00:00Z"
  },
  {
    _id: "t3",
    id: "trek-glacier-pro",
    title: "Glacier Trekking Pro",
    location: "Kenai Fjords, Alaska",
    category: "Glacier",
    duration: "3 Days",
    organizer_id: "u3",
    organizer_name: "Summit Adventures LLC",
    status: "pending", // Pending admin approval
    price: 650,
    banner: "https://images.unsplash.com/photo-1517022812141-23620dba5c23?auto=format&fit=crop&w=800&q=80",
    description: "Strap on ice crampons and explore deep blue crevasses, ice caves, and glacial streams. Moderate-high physical fitness required.",
    bookingsCount: 0,
    createdAt: "2026-06-07T11:00:00Z"
  },
  {
    _id: "t4",
    id: "trek-olympic-rainforest",
    title: "Olympic Rainforest Explorer",
    location: "Washington, USA",
    category: "Forest",
    duration: "3 Days",
    organizer_id: "u4",
    organizer_name: "Wilderness Trails",
    status: "approved",
    price: 290,
    banner: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80",
    description: "Wander among moss-draped giant trees, follow glacial rivers, and observe local wildlife in one of the wettest spots in North America.",
    bookingsCount: 10,
    createdAt: "2026-04-10T12:00:00Z"
  },
  {
    _id: "t5",
    id: "trek-everest-basecamp",
    title: "Everest Base Camp Trek",
    location: "Khumbu Region, Nepal",
    category: "Mountain",
    duration: "14 Days",
    organizer_id: "u6",
    organizer_name: "Himalayan Sherpa Guides",
    status: "pending",
    price: 1800,
    banner: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    description: "The ultimate bucket-list adventure. Rise to 17,598 feet, discover ancient monasteries, Sherpa villages, and stand in the shadow of Mount Everest.",
    bookingsCount: 0,
    createdAt: "2026-06-02T10:00:00Z"
  }
];

const initialBookings = [
  {
    _id: "b1",
    user_id: "u1",
    user_name: "Alex Johnson",
    trip_id: "t1",
    trip_name: "Alpine Summit Hiker",
    organizer_id: "u3",
    organizer_name: "Summit Adventures LLC",
    booking_status: "confirmed", // pending, confirmed, cancelled, refunded
    amount: 450,
    pax: 1,
    booking_date: "2026-06-05T14:20:00Z"
  },
  {
    _id: "b2",
    user_id: "u2",
    user_name: "Emma Watson",
    trip_id: "t2",
    trip_name: "Grand Canyon Backpacking",
    organizer_id: "u4",
    organizer_name: "Wilderness Trails",
    booking_status: "confirmed",
    amount: 760, // 2 pax * 380
    pax: 2,
    booking_date: "2026-05-18T10:15:00Z"
  },
  {
    _id: "b3",
    user_id: "u1",
    user_name: "Alex Johnson",
    trip_id: "t2",
    trip_name: "Grand Canyon Backpacking",
    organizer_id: "u4",
    organizer_name: "Wilderness Trails",
    booking_status: "cancelled",
    amount: 380,
    pax: 1,
    booking_date: "2026-05-10T16:00:00Z"
  },
  {
    _id: "b4",
    user_id: "u5",
    user_name: "Marcus Aurelius",
    trip_id: "t4",
    trip_name: "Olympic Rainforest Explorer",
    organizer_id: "u4",
    organizer_name: "Wilderness Trails",
    booking_status: "pending",
    amount: 290,
    pax: 1,
    booking_date: "2026-06-07T08:00:00Z"
  }
];

const initialPayments = [
  {
    _id: "p1",
    booking_id: "b1",
    user_id: "u1",
    user_name: "Alex Johnson",
    trip_id: "t1",
    trip_name: "Alpine Summit Hiker",
    amount: 450,
    payment_method: "credit_card",
    transaction_id: "tx_8819283749",
    payment_status: "success", // success, pending, refunded
    createdAt: "2026-06-05T14:21:00Z"
  },
  {
    _id: "p2",
    booking_id: "b2",
    user_id: "u2",
    user_name: "Emma Watson",
    trip_id: "t2",
    trip_name: "Grand Canyon Backpacking",
    amount: 760,
    payment_method: "paypal",
    transaction_id: "tx_1120938475",
    payment_status: "success",
    createdAt: "2026-05-18T10:16:00Z"
  },
  {
    _id: "p3",
    booking_id: "b3",
    user_id: "u1",
    user_name: "Alex Johnson",
    trip_id: "t2",
    trip_name: "Grand Canyon Backpacking",
    amount: 380,
    payment_method: "credit_card",
    transaction_id: "tx_9981827364",
    payment_status: "refunded",
    createdAt: "2026-05-10T16:02:00Z"
  }
];

const initialReports = [
  {
    _id: "r1",
    type: "review", // review, user, organizer
    reported_item_id: "rev101",
    reported_name: "Trek was terrible, guide ran off",
    reported_by_name: "Hiker Joe",
    offender_id: "u3",
    offender_name: "Summit Adventures LLC",
    reason: "Abusive review and false allegations",
    status: "pending", // pending, resolved, dismissed
    createdAt: "2026-06-03T11:00:00Z"
  },
  {
    _id: "r2",
    type: "user",
    reported_item_id: "u5",
    reported_name: "Marcus Aurelius",
    reported_by_name: "Wilderness Trails",
    offender_id: "u5",
    offender_name: "Marcus Aurelius",
    reason: "Spam booking and non-payment requests",
    status: "resolved",
    createdAt: "2026-06-02T09:30:00Z"
  }
];

const initialNotifications = [
  {
    _id: "n1",
    title: "System Maintenance Schedule",
    message: "TrekMate portal will be offline for 2 hours on June 15 at 02:00 UTC.",
    target: "all", // all, organizers, trekkers
    sentBy: "Diya Fathima",
    createdAt: "2026-06-05T08:00:00Z"
  },
  {
    _id: "n2",
    title: "Commission Updates for Peak Season",
    message: "Reminder: Platform commission is configured at 10% for the current quarter.",
    target: "organizers",
    sentBy: "Diya Fathima",
    createdAt: "2026-06-01T12:00:00Z"
  }
];

const initialCategories = [
  { id: "cat1", name: "Mountain", description: "High altitude peak conquering and alpine climbs", count: 2 },
  { id: "cat2", name: "Canyon", description: "Deep descent hikes, gorge pathways and dry lands", count: 1 },
  { id: "cat3", name: "Glacier", description: "Ice-capping walks and crevasse explorations", count: 1 },
  { id: "cat4", name: "Forest", description: "Green paths, canopy routes, and river crossings", count: 1 }
];

const initialDestinations = [
  { id: "dest1", name: "Rocky Mountains", country: "USA", treks: 3 },
  { id: "dest2", name: "Grand Canyon", country: "USA", treks: 2 },
  { id: "dest3", name: "Himalayas", country: "Nepal", treks: 5 },
  { id: "dest4", name: "Kenai Fjords", country: "USA", treks: 1 }
];

const initialBanners = [
  { id: "b1", title: "Summer Peaks Sale", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b", link: "/trips?sale=summer", isActive: true },
  { id: "b2", title: "Explore Glacier Frontiers", imageUrl: "https://images.unsplash.com/photo-1517022812141-23620dba5c23", link: "/category/glacier", isActive: true }
];

const initialSettings = {
  commissionPercentage: 10,
  platformName: "TrekMate",
  contactEmail: "support@trekmate.com",
  smtpServer: "smtp.mailgun.org",
  smtpPort: 587,
  paymentGateway: "stripe", // stripe, razorpay
  allowGoogleAuth: true,
  allowRegistration: true,
  requireOrganizerVerification: true,
  enableSmsAlerts: true
};

// --- DB Stateful Getters & Setters ---

export class MockDB {
  static getUsers() {
    return getStorageItem("mock_users", initialUsers);
  }
  static saveUsers(users: typeof initialUsers) {
    setStorageItem("mock_users", users);
  }

  static getOrganizers() {
    return getStorageItem("mock_organizers", initialOrganizers);
  }
  static saveOrganizers(organizers: typeof initialOrganizers) {
    setStorageItem("mock_organizers", organizers);
  }

  static getTrips() {
    return getStorageItem("mock_trips", initialTrips);
  }
  static saveTrips(trips: typeof initialTrips) {
    setStorageItem("mock_trips", trips);
  }

  static getBookings() {
    return getStorageItem("mock_bookings", initialBookings);
  }
  static saveBookings(bookings: typeof initialBookings) {
    setStorageItem("mock_bookings", bookings);
  }

  static getPayments() {
    return getStorageItem("mock_payments", initialPayments);
  }
  static savePayments(payments: typeof initialPayments) {
    setStorageItem("mock_payments", payments);
  }

  static getReports() {
    return getStorageItem("mock_reports", initialReports);
  }
  static saveReports(reports: typeof initialReports) {
    setStorageItem("mock_reports", reports);
  }

  static getNotifications() {
    return getStorageItem("mock_notifications", initialNotifications);
  }
  static saveNotifications(notifications: typeof initialNotifications) {
    setStorageItem("mock_notifications", notifications);
  }

  static getCategories() {
    return getStorageItem("mock_categories", initialCategories);
  }
  static saveCategories(categories: typeof initialCategories) {
    setStorageItem("mock_categories", categories);
  }

  static getDestinations() {
    return getStorageItem("mock_destinations", initialDestinations);
  }
  static saveDestinations(destinations: typeof initialDestinations) {
    setStorageItem("mock_destinations", destinations);
  }

  static getBanners() {
    return getStorageItem("mock_banners", initialBanners);
  }
  static saveBanners(banners: typeof initialBanners) {
    setStorageItem("mock_banners", banners);
  }

  static getSettings() {
    return getStorageItem("mock_settings", initialSettings);
  }
  static saveSettings(settings: typeof initialSettings) {
    setStorageItem("mock_settings", settings);
  }
}
