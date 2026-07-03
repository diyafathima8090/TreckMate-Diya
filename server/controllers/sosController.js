import SosAlert from '../models/SosAlert.js';
import Trek from '../models/Trek.js';

// @desc    Get all active SOS alerts for organizer
// @route   GET /api/sos
// @access  Private (Organizer)
export const getActiveSosAlerts = async (req, res) => {
  try {
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Admin gets all, organizer gets only theirs
    const filter = { status: 'active' };
    if (req.user.role === 'organizer') {
      filter.organizer_id = req.user._id;
    }

    const alerts = await SosAlert.find(filter).populate('user_id', 'name email phone').sort({ createdAt: -1 });
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error fetching SOS alerts:', error);
    res.status(500).json({ message: 'Server error fetching SOS alerts' });
  }
};

// @desc    Trigger an SOS alert
// @route   POST /api/sos/trigger
// @access  Private (Trekker)
export const triggerSos = async (req, res) => {
  try {
    const { trip_id, lat, lng } = req.body;
    
    const trek = await Trek.findById(trip_id);
    if (!trek) return res.status(404).json({ message: 'Trek not found' });

    const newAlert = await SosAlert.create({
      user_id: req.user._id,
      trip_id: trek._id,
      organizer_id: trek.organizer_id, // assuming Trek has organizer_id properly populated
      lat,
      lng,
      status: 'active',
      trekId: trek.id, // legacy
      trekName: trek.title
    });

    res.status(201).json({ success: true, data: newAlert });
  } catch (error) {
    console.error('Error triggering SOS:', error);
    res.status(500).json({ message: 'Server error triggering SOS' });
  }
};

// @desc    Resolve an SOS alert
// @route   PATCH /api/sos/:id/resolve
// @access  Private (Organizer)
export const resolveSos = async (req, res) => {
  try {
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const alert = await SosAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'SOS alert not found' });

    // Verify organizer owns this alert
    if (req.user.role === 'organizer' && alert.organizer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to resolve this alert' });
    }

    alert.status = 'resolved';
    await alert.save();

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    console.error('Error resolving SOS:', error);
    res.status(500).json({ message: 'Server error resolving SOS' });
  }
};
