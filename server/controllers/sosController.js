import SosAlert from '../models/SosAlert.js';
import Trek from '../models/Trek.js';




export const getActiveSosAlerts = async (req, res) => {
  try {
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    
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




export const triggerSos = async (req, res) => {
  try {
    const { trip_id, lat, lng } = req.body;
    
    const trek = await Trek.findById(trip_id);
    if (!trek) return res.status(404).json({ message: 'Trek not found' });

    const newAlert = await SosAlert.create({
      user_id: req.user._id,
      trip_id: trek._id,
      organizer_id: trek.organizer_id, 
      lat,
      lng,
      status: 'active',
      trekId: trek.id, 
      trekName: trek.title
    });

    res.status(201).json({ success: true, data: newAlert });
  } catch (error) {
    console.error('Error triggering SOS:', error);
    res.status(500).json({ message: 'Server error triggering SOS' });
  }
};




export const resolveSos = async (req, res) => {
  try {
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const alert = await SosAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'SOS alert not found' });

    
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
