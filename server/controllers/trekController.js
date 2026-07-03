import Trek from '../models/Trek.js';

// Default Treks list to seed database if empty
const DEFAULT_TREKS_SEED = [
  {
    id: "munnar",
    title: "Munnar Mist Trek",
    name: "Munnar Mist Trek",
    location: "Vegamon, Kerala",
    rating: "4.8 (120k reviews)",
    difficulty: "Moderate",
    duration: "2 Days",
    seats: "12 Persons",
    left: "4 Left",
    reportingTime: "8:00 AM",
    pickup: "Kochi International Airport",
    temp: "14°C Clear",
    description: "An immersive 2-day expedition through the rolling tea gardens and misty peaks of Munnar. This journey is designed for those seeking high-altitude thrills combined with the serene beauty of Western Ghats' biodiversity.",
    price: "₹4,500",
    baseRate: 3813,
    guideRate: 387,
    dates: "June 14 - June 15, 2026",
    image: "/trips_munnar.png",
    organizer: "Mountain Trails",
    timeline: [
      { num: "01", title: "Base Camp Arrival", desc: "Arrival at Munnar, briefing, and a gentle sunset trek to the first campsite overlooking the valley.", hasDining: true, hasWarning: true },
      { num: "02", title: "Summit Ascent & Return", desc: "Challenging climb to the peak (2,400m) followed by a steep forest trail descent and return.", alert: "Rain coat required" }
    ],
    guide: { name: "Sarah Williams", title: "Certified Lead Guide", treks: "45+ Treks Done", exp: "8 yrs Experience", avatar: "S" }
  },
  {
    id: "wayanad",
    title: "Wayanad River Camp",
    name: "Wayanad River Camp",
    location: "Wayanad, Kerala",
    rating: "4.9 (85k reviews)",
    difficulty: "Easy",
    duration: "3 Days",
    seats: "15 Persons",
    left: "8 Left",
    reportingTime: "9:00 AM",
    pickup: "Calicut International Airport",
    temp: "22°C Clear",
    description: "Explore the wild forests and riverbanks of Wayanad. This camping trek brings you closer to nature with scenic campsite views, light bamboo rafting, and guided nocturnal wildlife trails.",
    price: "₹3,200",
    baseRate: 2712,
    guideRate: 288,
    dates: "June 14 - June 16, 2026",
    image: "/trips_wayanad.png",
    organizer: "Jungle Guides",
    timeline: [
      { num: "01", title: "Forest Trail Crossing", desc: "Trek through bamboo groves and set up camp next to the Kabini river tributary.", hasDining: true },
      { num: "02", title: "Chembra Ridge Hike", desc: "Climb to the Chembra ridge line for spectacular morning cloud bed views.", alert: "Leech protection socks recommended" },
      { num: "03", title: "Bamboo Rafting & Checkout", desc: "Gentle river rafting session followed by local tribal lunch and checkout.", hasWater: true }
    ],
    guide: { name: "David Miller", title: "Senior Trail Master", treks: "62+ Treks Done", exp: "10 yrs Experience", avatar: "D" }
  },
  {
    id: "peak",
    title: "Peak Challenge",
    name: "Peak Challenge",
    location: "Vegamon, Kerala",
    rating: "4.7 (42k reviews)",
    difficulty: "Difficult",
    duration: "1 Day",
    seats: "10 Persons",
    left: "2 Left",
    reportingTime: "6:00 AM",
    pickup: "Vegamon Town Bus Stand",
    temp: "19°C Cloudy",
    description: "A high-intensity, one-day vertical challenge pushing your endurance limits. Scale steep rocky pathways to the Vegamon Peak summit for a panoramic 360-degree overlook of the valleys.",
    price: "₹1,800",
    baseRate: 1525,
    guideRate: 155,
    dates: "June 14, 2026",
    image: "/trips_peak_challenge.png",
    organizer: "Sara kaiz",
    timeline: [
      { num: "01", title: "Ascent Briefing", desc: "Early morning base meeting, safety check, and start of the steep uphill hike.", hasDining: true },
      { num: "02", title: "Summit Reach & Return", desc: "Reach the peak summit, enjoy packed local lunch, and safely navigate the steep rocky descent.", alert: "Sturdy hiking boots required" }
    ],
    guide: { name: "Sarah Williams", title: "Certified Lead Guide", treks: "45+ Treks Done", exp: "8 yrs Experience", avatar: "S" }
  },
  {
    id: "vagamon",
    title: "Vagamon Meadows Hike",
    name: "Vagamon Meadows Hike",
    location: "Vegamon, Kerala",
    rating: "4.8 (60k reviews)",
    difficulty: "Easy",
    duration: "2 Days",
    seats: "20 Persons",
    left: "11 Left",
    reportingTime: "10:00 AM",
    pickup: "Kottayam Railway Station",
    temp: "20°C Windy",
    description: "A scenic hike across the lush pine forests and green rolling hills of Vagamon. Ideal for beginners and families looking for a peaceful mountain getaway.",
    price: "₹3,800",
    baseRate: 3220,
    guideRate: 325,
    dates: "June 14 - June 15, 2026",
    image: "/trips_vagamon.png",
    organizer: "Mountain Trails",
    timeline: [
      { num: "01", title: "Pine Forest Walk", desc: "Enjoy a leisure walk through tall pine groves, leading to the meadow tents campsite.", hasDining: true },
      { num: "02", title: "Meadow Sunrise & Exit", desc: "Watch the valley sunrise, enjoy breakfast, hike the lower ridge paths, and check out.", hasWater: true }
    ],
    guide: { name: "David Miller", title: "Senior Trail Master", treks: "62+ Treks Done", exp: "10 yrs Experience", avatar: "D" }
  },
  {
    id: "idukki",
    title: "Idukki Canyon Exploration",
    name: "Idukki Canyon Exploration",
    location: "Idukki, Kerala",
    rating: "4.8 (55k reviews)",
    difficulty: "Difficult",
    duration: "3 Days",
    seats: "8 Persons",
    left: "3 Left",
    reportingTime: "7:00 AM",
    pickup: "Kochi International Airport",
    temp: "17°C Overcast",
    description: "Thru-hike the dramatic gorge systems and waterfalls of the Idukki canyons. Face rugged terrain, stream crossings, and high-altitude mountain lookouts.",
    price: "₹6,100",
    baseRate: 5170,
    guideRate: 520,
    dates: "June 14 - June 16, 2026",
    image: "/trips_idukki.png",
    organizer: "Jungle Guides",
    timeline: [
      { num: "01", title: "Canyon Entry & Camp", desc: "Briefing, entry into the deep canyon forest trail, and pitch tents near the stream.", hasDining: true },
      { num: "02", title: "Water Abseiling Challenge", desc: "Climb down wet rocky paths using abseil ropes under expert guidance.", alert: "Waterproof drybag and helmet mandatory" },
      { num: "03", title: "Ridge Walk & Exit", desc: "Navigate the upper cliff ridges back to the main pick-up van.", hasWater: true }
    ],
    guide: { name: "Sarah Williams", title: "Certified Lead Guide", treks: "45+ Treks Done", exp: "8 yrs Experience", avatar: "S" }
  },
  {
    id: "photography",
    title: "Photography Masterclass Trek",
    name: "Photography Masterclass Trek",
    location: "Idukki, Kerala",
    rating: "4.8 (30k reviews)",
    difficulty: "Intermediate",
    duration: "1 Day",
    seats: "15 Persons",
    left: "5 Left",
    reportingTime: "5:00 AM",
    pickup: "Adimali Bus Terminal",
    temp: "18°C Sunny",
    description: "Combine nature trekking with professional photography instruction. Capture epic golden-hour landscapes, macro flora, and wild stream long exposures with on-trail workshops.",
    price: "₹2,500",
    baseRate: 2120,
    guideRate: 215,
    dates: "June 14, 2026",
    image: "/trips_photography.png",
    organizer: "Light & Shadow",
    timeline: [
      { num: "01", title: "Golden Hour Shoot", desc: "Early morning hike to catch the sun breaking through the mist over the tea fields.", hasDining: true },
      { num: "02", title: "Macro & Stream Workshop", desc: "Learn slow-shutter water photography techniques and close-up natural shoots, followed by feedback." }
    ],
    guide: { name: "David Miller", title: "Senior Trail Master", treks: "62+ Treks Done", exp: "10 yrs Experience", avatar: "D" }
  },
  {
    id: "anamudi",
    title: "Anamudi Peak",
    name: "Anamudi Peak",
    location: "Munnar, India",
    rating: "4.9 (140k reviews)",
    difficulty: "Hard",
    duration: "3 Days",
    seats: "10 Persons",
    left: "4 Left",
    reportingTime: "7:30 AM",
    pickup: "Munnar KSRTC Bus Stand",
    temp: "11°C Cold",
    description: "Ascend the highest peak in South India (2,695m). Navigate unique shola forest ecosystems and high-altitude grasslands home to the endangered Nilgiri Tahr.",
    price: "₹23,800",
    baseRate: 20170,
    guideRate: 2040,
    dates: "June 14 - June 16, 2026",
    image: "/explore_green_ridge.png",
    organizer: "Mountain Trails",
    timeline: [
      { num: "01", title: "Eravikulam Camp Entry", desc: "Park entry permit clearance, trek to the shola forest edge, and pitch high-altitude tents.", hasDining: true },
      { num: "02", title: "Summit Climb", desc: "Hike to the steep ridge-line close to the peak summit with a certified guide.", alert: "Extreme cold weather gear required" },
      { num: "03", title: "Grassland Walk & Return", desc: "Leisure morning walk in the high grasslands, spotting wildlife before descending.", hasWater: true }
    ],
    guide: { name: "Sarah Williams", title: "Certified Lead Guide", treks: "45+ Treks Done", exp: "8 yrs Experience", avatar: "S" }
  },
  {
    id: "kudremukh",
    title: "Kudremukh Trail",
    name: "Kudremukh Trail",
    location: "Chikmagalur, India",
    rating: "4.8 (98k reviews)",
    difficulty: "Moderate",
    duration: "2 Days",
    seats: "12 Persons",
    left: "6 Left",
    reportingTime: "8:00 AM",
    pickup: "Mangalore Central Station",
    temp: "16°C Cloudy",
    description: "Trek the horse-faced peak of Kudremukh through open meadows, overlapping hills, and cool shola forests inside a protected National Park.",
    price: "₹33,150",
    baseRate: 28090,
    guideRate: 2840,
    dates: "June 14 - June 15, 2026",
    image: "/explore_glowing_tent.png",
    organizer: "Jungle Guides",
    timeline: [
      { num: "01", title: "Base Camp & Forest Walk", desc: "Reach the home-stay base camp, brief, and take a light walk into the forest boundary.", hasDining: true },
      { num: "02", title: "Kudremukh Summit Ascent", desc: "Ascend the grassy ridges to the iconic horse-face peak and return for evening checkout.", alert: "Forest department pass mandatory (provided)" }
    ],
    guide: { name: "David Miller", title: "Senior Trail Master", treks: "62+ Treks Done", exp: "10 yrs Experience", avatar: "D" }
  },
  {
    id: "chembra",
    title: "Chembra Peak",
    name: "Chembra Peak",
    location: "Wayanad, India",
    rating: "4.7 (70k reviews)",
    difficulty: "Moderate",
    duration: "1 Day",
    seats: "25 Persons",
    left: "12 Left",
    reportingTime: "7:00 AM",
    pickup: "Kalpetta Bus Station",
    temp: "21°C Sunny",
    description: "Hike to the highest peak in Wayanad. Stop by the famous heart-shaped lake (Chembra Lake) which is believed to never dry up, set against stunning tea estate backdrops.",
    price: "₹15,300",
    baseRate: 12970,
    guideRate: 1310,
    dates: "June 14, 2026",
    image: "/explore_chembra_peak.png",
    organizer: "Mountain Trails",
    timeline: [
      { num: "01", title: "Tea Estate Ascent", desc: "Trek through lush green tea gardens before entering the forest department border.", hasDining: true },
      { num: "02", title: "Heart Lake Summit", desc: "Reach the beautiful heart-shaped lake, capture views of the surrounding valley, and descend.", alert: "Do not litter around the lake area" }
    ],
    guide: { name: "David Miller", title: "Senior Trail Master", treks: "62+ Treks Done", exp: "10 yrs Experience", avatar: "D" }
  },
  {
    id: "agasthyakoodam",
    title: "Agasthyakoodam Summit",
    name: "Agasthyakoodam Summit",
    location: "Trivandrum, India",
    rating: "4.9 (110k reviews)",
    difficulty: "Expert",
    duration: "3 Days",
    seats: "6 Persons",
    left: "1 Left",
    reportingTime: "6:30 AM",
    pickup: "Trivandrum Central Station",
    temp: "13°C Foggy",
    description: "A highly controlled, challenging wilderness trek through the Agasthyavanam Biosphere Reserve. Requires peak physical fitness and forest permit clearances.",
    price: "₹46,750",
    baseRate: 39620,
    guideRate: 4000,
    dates: "June 14 - June 16, 2026",
    image: "/explore_agasthyakoodam.png",
    organizer: "Jungle Guides",
    timeline: [
      { num: "01", title: "Bonacaud to Athirumala", desc: "Cover 20km of forest trails, crossing streams and high vegetation to reach the forest shelter.", hasDining: true },
      { num: "02", title: "Agasthyakoodam Ascent", desc: "Hike up vertical rope climbs to reach the sacred wind-swept summit (1,868m).", alert: "Strictly follow guide safety rope instructions" },
      { num: "03", title: "Return to Bonacaud", desc: "Trek 20km back from Athirumala to Bonacaud base and transfer back to town.", hasWater: true }
    ],
    guide: { name: "Sarah Williams", title: "Certified Lead Guide", treks: "45+ Treks Done", exp: "8 yrs Experience", avatar: "S" }
  },
  {
    id: "starry-camp",
    title: "Starry Sky Highland Camp",
    name: "Starry Sky Highland Camp",
    location: "Munnar, Kerala",
    rating: "4.9 (15k reviews)",
    difficulty: "Easy",
    duration: "3 Days",
    seats: "15 Persons",
    left: "8 Left",
    reportingTime: "2:00 PM",
    pickup: "Munnar Town Bus Stand",
    temp: "12°C Clear",
    description: "Pitch your tent under a crystal vault of stars. This high-altitude camping experience features guided astronomy sessions, warm campfires, and breathtaking sunrise views over the Munnar valley.",
    price: "₹4,200",
    baseRate: 3560,
    guideRate: 356,
    dates: "June 14 - June 17, 2026",
    image: "/explore_starry_sky.png",
    organizer: "Mountain Trails",
    timeline: [
      { num: "01", title: "Camp Arrival & Pitching", desc: "Arrive at high camp, pitch tents, and enjoy hot local tea as the stars emerge.", hasDining: true },
      { num: "02", title: "Astronomy & Ridge Walk", desc: "Guided celestial viewing session, followed by a morning walk to the cloud bed ridge.", hasDining: true },
      { num: "03", title: "Sunrise Watch & Checkout", desc: "Catch the valley sunrise, enjoy local breakfast, and check out.", hasWater: true }
    ],
    guide: { name: "David Miller", title: "Senior Trail Master", treks: "62+ Treks Done", exp: "10 yrs Experience", avatar: "D" }
  },
  {
    id: "twilight-valley",
    title: "Twilight Valley Expedition",
    name: "Twilight Valley Expedition",
    location: "Idukki, Kerala",
    rating: "4.8 (8k reviews)",
    difficulty: "Intermediate",
    duration: "1 Day",
    seats: "20 Persons",
    left: "12 Left",
    reportingTime: "6:00 AM",
    pickup: "Adimali Bus Terminal",
    temp: "18°C Overcast",
    description: "Capture the haunting beauty of the Western Ghats at twilight. A scenic photography-focused weekend trek designed for creators to hone their long-exposure and landscape composition skills.",
    price: "₹2,800",
    baseRate: 2370,
    guideRate: 237,
    dates: "June 14, 2026",
    image: "/explore_weekend_banner.png",
    organizer: "Light & Shadow",
    timeline: [
      { num: "01", title: "Dawn Ridge Trek", desc: "Hike up the eastern ridge to photograph the sunrise casting dramatic shadows over the Idukki gorge.", hasDining: true },
      { num: "02", title: "Stream Long Exposures", desc: "Learn slow-shutter water photography techniques at hidden jungle streams and finish with feedback." }
    ],
    guide: { name: "David Miller", title: "Senior Trail Master", treks: "62+ Treks Done", exp: "10 yrs Experience", avatar: "D" }
  }
];

// @desc    Get all treks (auto-seeds if empty)
// @route   GET /api/treks
// @access  Public
export const getTreks = async (req, res, next) => {
  try {
    let treks = await Trek.find({});

    if (treks.length === 0) {
      console.log('Seeding default treks into MongoDB database...');
      await Trek.insertMany(DEFAULT_TREKS_SEED);
      treks = await Trek.find({});
    } else {
      // Check for any missing default treks and seed them
      const missingTreks = DEFAULT_TREKS_SEED.filter(
        seedTrek => !treks.some(dbTrek => dbTrek.id === seedTrek.id)
      );
      if (missingTreks.length > 0) {
        console.log(`Seeding ${missingTreks.length} missing treks into MongoDB database...`);
        await Trek.insertMany(missingTreks);
        treks = await Trek.find({});
      }
    }

    // Return as dictionary key mapping to match frontend schema expectations if desired, or standard array
    // Let's return as standard array, but we can structure frontend adapters to parse it
    res.status(200).json({
      success: true,
      count: treks.length,
      data: treks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single trek details by custom id
// @route   GET /api/treks/:id
// @access  Public
export const getTrekById = async (req, res, next) => {
  try {
    const trek = await Trek.findOne({ id: req.params.id });

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: `Trek not found with ID of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: trek
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a trek
// @route   PUT /api/treks/:id
// @access  Private (Organizer/Admin)
export const updateTrek = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'organizer' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update expeditions on this portal.'
      });
    }

    let trek = await Trek.findOne({ id: req.params.id });

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: 'Trek not found',
      });
    }

    // Prepare body
    const body = { ...req.body };
    if (body.price && !String(body.price).startsWith('₹')) {
      const rawNum = parseFloat(String(body.price).replace(/[^0-9.]/g, ''));
      if (!isNaN(rawNum)) {
        body.price_num = rawNum;
        body.price = `₹${rawNum.toLocaleString('en-IN')}`;
      }
    } else if (body.price) {
      const rawNum = parseFloat(String(body.price).replace(/[^0-9.]/g, ''));
      if (!isNaN(rawNum)) body.price_num = rawNum;
    }

    trek = await Trek.findOneAndUpdate(
      { id: req.params.id },
      body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: trek,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new custom trek
// @route   POST /api/treks
// @access  Private (Organizer)
export const createTrek = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'organizer' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to publish expeditions on this portal.'
      });
    }

    const body = { ...req.body };

    // Auto-format price: if it's a plain number string like "25", convert to "₹25"
    if (body.price && !String(body.price).startsWith('₹')) {
      const rawNum = parseFloat(String(body.price).replace(/[^0-9.]/g, ''));
      if (!isNaN(rawNum)) {
        body.price_num = rawNum;
        body.price = `₹${rawNum.toLocaleString('en-IN')}`;
      }
    } else if (body.price) {
      // Extract numeric from "₹4,500"
      const rawNum = parseFloat(String(body.price).replace(/[^0-9.]/g, ''));
      if (!isNaN(rawNum)) body.price_num = rawNum;
    }

    // Ensure required fields have defaults if missing
    if (!body.pickup) body.pickup = body.location || 'To be confirmed';
    if (!body.description) body.description = body.title;

    const trek = await Trek.create(body);

    res.status(201).json({
      success: true,
      data: trek
    });
  } catch (error) {
    console.error('createTrek error:', error.message);
    next(error);
  }
};
